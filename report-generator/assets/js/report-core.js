/**
 * Report Generator Core Logic
 * Aggregates data from localStorage (Strategic Clipboard & Tool Saves)
 * and renders it into the report template.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadReportData();
});

function loadReportData() {
    const status = document.getElementById('statusText');
    status.innerText = '正在从本地存储读取数据...';

    // 1. Meta Data
    const projectMeta = getProjectMeta();
    if (projectMeta.name) document.getElementById('coverClientName').innerText = projectMeta.name;
    document.getElementById('coverDate').innerText = new Date().toISOString().split('T')[0];

    // 2. SWOT Analysis
    renderSWOT();

    // 3. User Pains
    renderPains();

    // 4. Brand Archetype
    renderArchetype();

    // 5. OKRs
    renderOKRs();

    status.innerText = '报告已生成 (Ready)';
}

// --- Data Fetchers ---

function getToolData(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return raw; // or null if strictly expecting JSON
    }
}

function getClipboard() {
    return getToolData('modiqi_strategic_clipboard') || {};
}

function getProjectMeta() {
    // Try to find a client name from various sources
    const clipboard = getClipboard();
    if (clipboard.brand_name) return { name: clipboard.brand_name };

    // Fallback to specific tool inputs
    const lean = getToolData('modiqi_app_lean_canvas_v1_customer_segments'); // Maybe not clean
    return { name: '未命名客户' };
}

// --- Renderers ---

function renderSWOT() {
    const swotData = getToolData('modiqi_swot_data'); // This is the save key from swot-analysis.html
    const container = document.getElementById('swotContainer');

    if (!swotData) {
        container.innerHTML = `<div class="empty-state" style="padding:20px; background:#f8fafc; color:#94a3b8; text-align:center; grid-column: span 2;">暂无 SWOT 数据，请先完成战略分析。</div>`;
        return;
    }

    // swotData structure is likely { s: text, w: text, ... } based on swot-analysis.html implementation details
    // Actually swot-analysis.html saves keys like 'swot_s', 'swot_w' into individual inputs? 
    // Wait, let's check swot-analysis.html saving logic.
    // It uses standard ModiqiApp autosave which saves by key `modiqi_app_[appId]_[data-save-key]`.
    // AppId for SWOT is 'swot_analysis_v1'. 

    // Let's refetch based on specific keys if the tool used individual keys
    const getItem = (type) => localStorage.getItem(`modiqi_app_swot_analysis_v1_swot_${type}`) || '无数据 / No Data';

    const s = getItem('s');
    const w = getItem('w');
    const o = getItem('o');
    const t = getItem('t');

    container.innerHTML = `
        <div class="swot-box"><strong>Strengths (优势)</strong><p>${s}</p></div>
        <div class="swot-box"><strong>Weaknesses (劣势)</strong><p>${w}</p></div>
        <div class="swot-box"><strong>Opportunities (机会)</strong><p>${o}</p></div>
        <div class="swot-box"><strong>Threats (威胁)</strong><p>${t}</p></div>
    `;
}

function renderPains() {
    const clipboard = getClipboard();
    const pains = clipboard.customer_pains; // String (comma separated or text block)
    const container = document.getElementById('painsContainer');

    if (!pains) {
        container.innerHTML = `<p style="color:#94a3b8;">暂无痛点数据 (未从用户画像工具同步)。</p>`;
        return;
    }

    container.replaceChildren();
    const painsBox = document.createElement('div');
    painsBox.style.cssText = 'padding: 15px; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;';
    painsBox.textContent = pains;
    container.appendChild(painsBox);
}

function renderArchetype() {
    const clipboard = getClipboard();
    const archetypes = clipboard.active_brand_archetypes; // Array of IDs e.g. ['ruler']
    const container = document.getElementById('archetypeContainer');

    if (!archetypes || archetypes.length === 0) {
        container.innerHTML = `<p style="color:#94a3b8;">暂无品牌原型数据。</p>`;
        return;
    }

    const primary = String(archetypes[0]).toUpperCase();
    container.replaceChildren();
    const primaryEl = document.createElement('div');
    primaryEl.style.cssText = 'font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 10px;';
    primaryEl.textContent = primary;
    const label = document.createElement('div');
    label.style.cssText = 'font-size: 14px; color: #64748b;';
    label.textContent = 'Primary Brand Archetype';
    container.append(primaryEl, label);
}

function renderOKRs() {
    // OKR Cascade uses 'modiqi_app_okr_cascade_v1_objectives_html' which stores innerHTML of lists
    // This is hard to parse cleanly. Ideally we'd store structured data.
    // Hack: Just get the raw content and sanitize/strip classes for print?

    const rawHTML = localStorage.getItem('modiqi_app_okr_cascade_v1_objectives_html');
    const container = document.getElementById('okrContainer');

    if (!rawHTML) {
        container.innerHTML = `<p style="color:#94a3b8;">暂无 OKR 数据。</p>`;
        return;
    }

    // Creating a sandboxed div to strip editing controls
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = window.modiqiApp ? window.modiqiApp.sanitizeHTML(rawHTML) : '';

    // Cleanup for report
    tempDiv.querySelectorAll('button').forEach(b => b.remove()); // Remove delete/add buttons
    tempDiv.querySelectorAll('.add-btn-row').forEach(r => r.remove());
    tempDiv.querySelectorAll('input').forEach(i => {
        // Replace inputs with text spans
        const span = document.createElement('span');
        span.innerText = i.value;
        span.style.fontWeight = '500';
        i.parentNode.replaceChild(span, i);
    });

    container.innerHTML = tempDiv.innerHTML;
}
