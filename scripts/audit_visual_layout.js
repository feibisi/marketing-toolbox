#!/usr/bin/env node
'use strict';

const { chromium } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'reports', 'visual-layout-audit.json');
const BASELINE = path.join(ROOT, 'reports', 'visual-layout-baseline.json');
const SCREENSHOT_DIR = path.join(ROOT, 'artifacts', 'visual-audit');
const PORT = 4174;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = {
    desktop: { width: 1440, height: 1000 },
    mobile: { width: 390, height: 844 },
};
const mode = process.argv.includes('--check') ? 'check' : 'audit';

function waitForServer(attempts = 50) {
    return new Promise((resolve, reject) => {
        const tryOnce = remaining => {
            const request = http.get(`${ORIGIN}/index.html`, response => {
                response.resume();
                if (response.statusCode === 200) resolve();
                else if (remaining) setTimeout(() => tryOnce(remaining - 1), 100);
                else reject(new Error(`server returned ${response.statusCode}`));
            });
            request.on('error', error => {
                if (remaining) setTimeout(() => tryOnce(remaining - 1), 100);
                else reject(error);
            });
        };
        tryOnce(attempts);
    });
}

function safeName(toolPath) {
    return toolPath.replace(/\.html$/, '').replace(/[^a-z0-9_-]+/gi, '__');
}

async function measure(page) {
    return page.evaluate(() => {
        const visible = element => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
        };
        const label = element => {
            if (element.id) return `#${element.id}`;
            const saveKey = element.getAttribute('data-save-key');
            if (saveKey) return `${element.tagName.toLowerCase()}[data-save-key="${saveKey}"]`;
            const classes = [...element.classList].slice(0, 3).join('.');
            return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ''}`;
        };
        const intersectionArea = (a, b) => {
            const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            return width * height;
        };
        const editableSelector = 'input, textarea, select, button, [contenteditable="true"], a[href]';
        const editors = [...document.querySelectorAll(editableSelector)].filter(visible);
        const clippedEditors = [];
        for (const editor of editors) {
            const rect = editor.getBoundingClientRect();
            let ancestor = editor.parentElement;
            while (ancestor && ancestor !== document.body) {
                const style = getComputedStyle(ancestor);
                if (['hidden', 'clip'].includes(style.overflow) || ['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflowY)) {
                    const box = ancestor.getBoundingClientRect();
                    if (rect.right > box.right + 2 || rect.left < box.left - 2 || rect.bottom > box.bottom + 2 || rect.top < box.top - 2) {
                        clippedEditors.push({ editor: label(editor), ancestor: label(ancestor) });
                        break;
                    }
                }
                ancestor = ancestor.parentElement;
            }
        }
        const clippedPapers = [...document.querySelectorAll('.paper-a3, .paper-a4, .paper-a4-portrait')]
            .filter(visible)
            .map(element => ({
                selector: label(element),
                hiddenX: Math.max(0, element.scrollWidth - element.clientWidth),
                hiddenY: Math.max(0, element.scrollHeight - element.clientHeight),
                overflow: getComputedStyle(element).overflow,
            }))
            .filter(item => item.overflow === 'hidden' && (item.hiddenX > 4 || item.hiddenY > 4));
        const toolbar = document.querySelector('.modiqi-toolbar');
        let toolbarOutOfViewport = false;
        const toolbarOverlaps = [];
        if (toolbar && visible(toolbar)) {
            const toolbarRect = toolbar.getBoundingClientRect();
            toolbarOutOfViewport = toolbarRect.left < -2 || toolbarRect.right > innerWidth + 2 || toolbarRect.top < -2 || toolbarRect.bottom > innerHeight + 2;
            // The default toolbar is a deliberately collapsed launcher. It is
            // viewport-contained and does not conceal an action strip, so only
            // measure content overlap while the user-expanded strip is open.
            if (document.body.classList.contains('mobile-toolbar-expanded')) {
                editors.filter(element => !toolbar.contains(element)).forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const area = intersectionArea(toolbarRect, rect);
                    if (area > 16) toolbarOverlaps.push(label(element));
                });
            }
        }
        const suspiciousWide = [...document.body.querySelectorAll('*')]
            .filter(element => visible(element) && !element.closest('.modiqi-toolbar') && !['svg', 'path'].includes(element.tagName.toLowerCase()))
            .map(element => ({ selector: label(element), rect: element.getBoundingClientRect(), position: getComputedStyle(element).position }))
            .filter(item => item.position !== 'fixed' && (item.rect.left < -8 || item.rect.right > document.documentElement.clientWidth + 8))
            .slice(0, 20)
            .map(item => item.selector);
        return {
            title: document.title,
            document: {
                clientWidth: document.documentElement.clientWidth,
                scrollWidth: document.documentElement.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight,
                horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
            },
            clippedEditors: [...new Map(clippedEditors.map(item => [`${item.editor}|${item.ancestor}`, item])).values()].slice(0, 20),
            clippedPapers,
            toolbarOutOfViewport,
            toolbarOverlaps: [...new Set(toolbarOverlaps)].slice(0, 20),
            suspiciousWide,
        };
    });
}

function classify(result) {
    const reasons = [];
    if (result.pageErrors.length || result.localFailures.length) reasons.push('runtime_failure');
    if (result.metrics.toolbarOutOfViewport) reasons.push('toolbar_out_of_viewport');
    if (result.metrics.clippedEditors.length) reasons.push('clipped_editable');
    if (result.metrics.document.horizontalOverflow > 8) reasons.push('horizontal_overflow');
    if (result.metrics.clippedPapers.length) reasons.push('clipped_paper');
    if (result.metrics.toolbarOverlaps.length) reasons.push('toolbar_overlap');
    return { severity: reasons.some(reason => ['runtime_failure', 'toolbar_out_of_viewport', 'clipped_editable'].includes(reason)) ? 'blocker' : reasons.length ? 'high' : 'clear', reasons };
}

async function inspect(page, tool, viewportName, media = 'screen', screenshot = false) {
    await page.setViewportSize(VIEWPORTS[viewportName]);
    await page.emulateMedia({ media });
    const pageErrors = [];
    const localFailures = [];
    const onPageError = error => pageErrors.push(error.message);
    const onResponse = response => {
        const url = new URL(response.url());
        if (url.hostname === '127.0.0.1' && response.status() >= 400) localFailures.push(`${response.status()} ${url.pathname}`);
    };
    page.on('pageerror', onPageError);
    page.on('response', onResponse);
    await page.goto(`${ORIGIN}/${tool.path}`, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
    await page.waitForTimeout(120);
    const metrics = await measure(page);
    if (screenshot) {
        const output = path.join(SCREENSHOT_DIR, `${safeName(tool.path)}--${viewportName}.png`);
        await page.screenshot({ path: output, fullPage: true, animations: 'disabled' });
    }
    page.off('pageerror', onPageError);
    page.off('response', onResponse);
    const result = { path: tool.path, tier: tool.tier, viewport: viewportName, media, pageErrors, localFailures, metrics };
    return { ...result, ...classify(result) };
}

function summarize(results) {
    const summary = { totalMeasurements: results.length, bySeverity: {}, byViewport: {}, reasonCounts: {} };
    for (const item of results) {
        summary.bySeverity[item.severity] = (summary.bySeverity[item.severity] || 0) + 1;
        const key = `${item.viewport}:${item.media}`;
        summary.byViewport[key] = summary.byViewport[key] || { total: 0, blocker: 0, high: 0, clear: 0 };
        summary.byViewport[key].total += 1;
        summary.byViewport[key][item.severity] += 1;
        item.reasons.forEach(reason => { summary.reasonCounts[reason] = (summary.reasonCounts[reason] || 0) + 1; });
    }
    return summary;
}

async function main() {
    if (mode === 'check') {
        if (!fs.existsSync(BASELINE) || !fs.existsSync(REPORT)) throw new Error('layout baseline or report missing; run audit and review before approving a baseline');
        const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
        const current = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
        const rank = { clear: 0, high: 1, blocker: 2 };
        const key = item => `${item.path}|${item.viewport}|${item.media}`;
        const before = new Map(baseline.results.map(item => [key(item), item]));
        const regressions = current.results.filter(item => !before.has(key(item)) || rank[item.severity] > rank[before.get(key(item)).severity]);
        if (regressions.length) {
            const sample = regressions.slice(0, 10).map(item => `${key(item)}=${item.severity}`).join(', ');
            throw new Error(`visual layout regression in ${regressions.length} measurements: ${sample}`);
        }
        console.log(`Visual layout check: PASS (${current.summary.bySeverity.blocker || 0} blockers, ${current.summary.bySeverity.high || 0} high; baseline not exceeded)`);
        return;
    }

    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tools.json'), 'utf8'));
    const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
    try {
        await waitForServer();
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        const results = [];
        for (const tool of manifest.tools) {
            for (const viewport of Object.keys(VIEWPORTS)) results.push(await inspect(page, tool, viewport, 'screen', tool.tier === 'core'));
            if (tool.tier === 'core') results.push(await inspect(page, tool, 'desktop', 'print', false));
        }
        await browser.close();
        const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), scope: { tools: manifest.tools.length, core: manifest.tools.filter(tool => tool.tier === 'core').length, screenshots: manifest.tools.filter(tool => tool.tier === 'core').length * 2 }, summary: summarize(results), results };
        fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
        console.log(`Visual layout audit: COMPLETE (${report.scope.tools} tools, ${report.summary.totalMeasurements} measurements, ${report.scope.screenshots} screenshots)`);
        console.log(JSON.stringify(report.summary, null, 2));
        console.log(`Report: ${REPORT}`);
    } finally {
        server.kill('SIGTERM');
    }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
