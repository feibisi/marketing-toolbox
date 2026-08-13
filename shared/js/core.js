/**
 * Modiqi Workbench Core
 * Shared logic for AutoSave, Theme Management, and Export.
 */

const MODIQI_SHARED_BASE_URL = (() => {
    const script = document.currentScript;
    return script && script.src ? new URL('../', script.src) : new URL('../shared/', window.location.href);
})();

class ModiqiApp {
    constructor(toolId) {
        this.toolId = toolId;
        this.storageKeyPrefix = `modiqi_${toolId}_`;
        this.saveTimeouts = new Map();
        this.statusIndicator = null;

        // Undo/Redo history
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistorySize = 50;
        this.isUndoing = false;

        // Font scale
        this.fontScales = [0.85, 1, 1.15, 1.3];
        this.currentFontScaleIndex = 1; // Default 100%

        this.init();
    }

    init() {
        this.loadExamplesScript();
        this.loadSavedData();
        this.attachAutoSave();
        this.loadTheme();
        this.loadFontScale();
        this.renderToolbar();
        this.setupMeta();
        this.injectBranding();
        this.injectFooter();
        this.initHistory();
        this.setupPrintStyles();
        this.setupStrategicClipboard();
        this.setupAccessibleClicks();
        console.log(`Modiqi App '${this.toolId}' initialized.`);
    }

    setupAccessibleClicks() {
        document.querySelectorAll('[role="button"][tabindex="0"]').forEach(element => {
            element.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    element.click();
                }
            });
        });
    }

    loadExamplesScript() {
        // Only toolkits that ship an examples bundle should request it.
        const toolkit = window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0];
        if (toolkit === 'analytics-toolkit' || toolkit === 'strategy-toolkit') {
            const script = document.createElement('script');
            script.src = 'assets/js/examples.js';
            document.head.appendChild(script);
        }

        // Load html2canvas library for image export
        if (typeof window.html2canvas !== 'undefined') {
            this.enableImageExport();
            return;
        }
        const libScript = document.createElement('script');
        libScript.src = new URL('vendor/html2canvas.min.js', MODIQI_SHARED_BASE_URL).href;
        libScript.onload = () => {
            console.log('html2canvas library loaded');
            this.enableImageExport();
        };
        libScript.onerror = (e) => {
            console.error('Failed to load html2canvas', e);
        };
        document.head.appendChild(libScript);
    }

    enableImageExport() {
        const btn = document.querySelector('.btn-export-img');
        if (btn) btn.disabled = false;
    }

    loadTheme() {
        // Default to 'wood'
        const savedTheme = localStorage.getItem('modiqi_theme') || 'wood';
        this.setTheme(savedTheme);
    }

    setTheme(themeName) {
        document.body.classList.remove('theme-whiteboard', 'theme-dark');

        if (themeName === 'whiteboard') {
            document.body.classList.add('theme-whiteboard');
        } else if (themeName === 'dark') {
            document.body.classList.add('theme-dark');
        }

        localStorage.setItem('modiqi_theme', themeName);
        this.updateThemeIcon(themeName);
    }

    updateThemeIcon(themeName) {
        const btn = document.querySelector('.btn-theme');
        if (!btn) return;

        let iconName = '';
        let title = '';

        if (themeName === 'whiteboard') {
            iconName = 'monitor';
            title = '切换至暗色模式 (Switch to Dark)';
        } else if (themeName === 'dark') {
            iconName = 'moon';
            title = '切换至经典模式 (Switch to Classic)';
        } else {
            iconName = 'sun';
            title = '切换至白板模式 (Switch to Whiteboard)';
        }

        btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        btn.title = title;

        // Re-initialize Lucide icons for the button
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    toggleTheme() {
        // Cycle: Wood -> Whiteboard -> Dark -> Wood
        const currentTheme = localStorage.getItem('modiqi_theme') || 'wood';
        let nextTheme = 'whiteboard';

        if (currentTheme === 'whiteboard') {
            nextTheme = 'dark';
        } else if (currentTheme === 'dark') {
            nextTheme = 'wood';
        }

        this.setTheme(nextTheme);
    }

    // === AutoSave Implementation ===

    /**
     * Generate a stable save key for an element.
     * Uses data-save-key if available, otherwise creates a key based on element's position in DOM tree.
     */
    getSaveKey(el, prefix) {
        // First priority: explicit data-save-key attribute
        if (el.dataset.saveKey) {
            return this.storageKeyPrefix + el.dataset.saveKey;
        }

        // Second priority: id attribute
        if (el.id) {
            return this.storageKeyPrefix + prefix + '_' + el.id;
        }

        // Third priority: name attribute (for inputs)
        if (el.name) {
            return this.storageKeyPrefix + prefix + '_' + el.name;
        }

        // Fallback: Generate key from element's path in DOM
        const path = [];
        let current = el;
        while (current && current !== document.body) {
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(
                    c => c.tagName === current.tagName
                );
                const index = siblings.indexOf(current);
                path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
            }
            current = parent;
        }
        return this.storageKeyPrefix + prefix + '_' + path.join('/');
    }

    loadSavedData() {
        // Load contenteditable elements
        document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
            const key = this.getSaveKey(el, 'content');
            const saved = localStorage.getItem(key);
            if (saved) {
                el.innerHTML = this.sanitizeHTML(saved);
            }
        });

        // Load input/textarea values
        document.querySelectorAll('input, textarea, select').forEach((el) => {
            const key = this.getSaveKey(el, 'input');
            const saved = localStorage.getItem(key);
            if (saved) {
                el.value = saved;
            }
        });
    }

    attachAutoSave() {
        // Save contenteditable on input
        document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
            el.addEventListener('input', () => {
                const key = this.getSaveKey(el, 'content');
                this.debouncedSave(key, () => {
                    localStorage.setItem(key, this.sanitizeHTML(el.innerHTML));
                });
            });
        });

        // Save inputs on change
        document.querySelectorAll('input, textarea, select').forEach((el) => {
            el.addEventListener('input', () => {
                const key = this.getSaveKey(el, 'input');
                this.debouncedSave(key, () => {
                    localStorage.setItem(key, el.value);
                });
            });
        });
    }

    sanitizeHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = String(html);
        template.content.querySelectorAll('script, iframe, object, embed, link, meta, style, form, svg, math').forEach(el => el.remove());
        template.content.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                const name = attr.name.toLowerCase();
                const value = attr.value.trim().toLowerCase();
                const unsafeUrl = ['href', 'src', 'xlink:href', 'formaction'].includes(name)
                    && /^(?:javascript|data\s*:\s*text\/html)/i.test(value.replace(/\s/g, ''));
                if (name.startsWith('on') || name === 'srcdoc' || unsafeUrl) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        return template.innerHTML;
    }

    debouncedSave(key, saveCallback) {
        // Show saving indicator
        this.showSaveStatus('saving');

        // Debounce: wait 500ms after last input
        clearTimeout(this.saveTimeouts.get(key));
        const timeout = setTimeout(() => {
            saveCallback();
            this.saveTimeouts.delete(key);
            this.showSaveStatus('saved');
        }, 500);
        this.saveTimeouts.set(key, timeout);
    }

    saveData() {
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            const key = this.getSaveKey(el, 'content');
            localStorage.setItem(key, this.sanitizeHTML(el.innerHTML));
        });
        document.querySelectorAll('input, textarea, select').forEach(el => {
            const key = this.getSaveKey(el, 'input');
            localStorage.setItem(key, el.value);
        });
        this.showSaveStatus('saved');
    }

    showSaveStatus(status) {
        if (!this.statusIndicator) return;

        if (status === 'saving') {
            this.statusIndicator.innerHTML = `<i data-lucide="loader-2" class="spin"></i>`;
            this.statusIndicator.title = '保存中...';
            this.statusIndicator.classList.add('is-saving');
            this.statusIndicator.classList.remove('is-saved');
        } else if (status === 'saved') {
            this.statusIndicator.innerHTML = `<i data-lucide="check"></i>`;
            this.statusIndicator.title = '已保存';
            this.statusIndicator.classList.remove('is-saving');
            this.statusIndicator.classList.add('is-saved');

            // Fade out after 2 seconds
            setTimeout(() => {
                if (this.statusIndicator.classList.contains('is-saved')) {
                    this.statusIndicator.classList.remove('is-saved');
                }
            }, 2000);
        }

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    injectFooter() {
        const main = document.querySelector('main');
        // Only inject if footer doesn't already exist
        if (main && !main.querySelector('.modiqi-footer')) {
            const footer = document.createElement('div');
            footer.className = 'modiqi-footer';
            footer.innerHTML = `
                <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi Logo" class="footer-logo" title="点击隐藏/显示工具栏 (Toggle Toolbar)">
                <div class="copyright">Modiqi Digital Strategy Workbench &copy; 2026</div>
            `;
            main.appendChild(footer);
        }

        // Always setup toolbar toggle (whether footer was injected or already existed)
        this.setupToolbarToggle();
    }

    /**
     * Toggle Toolbar Visibility (Focus Mode)
     * Click footer logo to hide/show the floating toolbar
     */
    setupToolbarToggle() {
        const footerLogo = document.querySelector('.footer-logo');
        if (!footerLogo) return;

        // Load saved state
        const isHidden = localStorage.getItem('modiqi_toolbar_hidden') === 'true';
        if (isHidden) {
            document.body.classList.add('toolbar-hidden');
        }

        footerLogo.addEventListener('click', () => {
            this.toggleToolbar();
        });
    }

    toggleToolbar() {
        const isHidden = document.body.classList.toggle('toolbar-hidden');
        localStorage.setItem('modiqi_toolbar_hidden', isHidden.toString());

        // Update footer logo visual state
        const footerLogo = document.querySelector('.footer-logo');
        if (footerLogo) {
            footerLogo.title = isHidden
                ? '点击显示工具栏 (Show Toolbar)'
                : '点击隐藏工具栏 (Hide Toolbar)';
        }
    }

    setupMeta() {
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.content || 'Modiqi Digital Strategy Workbench Tool';
        const logoPath = '../shared/images/modiqi-logo-r.png';

        const metaTags = [
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:image', content: logoPath },
            { property: 'og:type', content: 'website' }
        ];

        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[property="${tag.property}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('property', tag.property);
                meta.setAttribute('content', tag.content);
                document.head.appendChild(meta);
            }
        });
    }

    injectBranding() {
        const header = document.querySelector('.canvas-header');
        if (!header) return;

        // 1. Inject Logo (Moved to Footer)


        // 2. Wrap Title and inject English Subtitle
        const h1 = header.querySelector('h1');
        if (h1 && !header.querySelector('.title-group')) {
            // Map Chinese Titles to English
            const titleMap = {
                '客户旅程地图': 'CUSTOMER JOURNEY MAP',
                '价值主张画布': 'VALUE PROPOSITION CANVAS',
                '同理心地图': 'EMPATHY MAP',
                '移情图': 'EMPATHY MAP', // Compat for old files if any
                'SWOT 分析': 'SWOT ANALYSIS',
                '用户画像卡': 'USER PERSONA CARD',
                '内容营销日历': 'CONTENT MARKETING CALENDAR',
                '营销策略画布': 'MARKETING STRATEGY CANVAS',
                '竞争对手分析': 'COMPETITOR ANALYSIS',
                '精益画布': 'LEAN CANVAS',
                '商业模式画布': 'BUSINESS MODEL CANVAS',
                'Modiqi Digital Strategy Workbench': 'STRATEGY WORKBENCH'
            };

            const rawTitle = h1.textContent.replace(/\(.*\)/, '').trim(); // Remove existing parens if any
            const enTitle = titleMap[rawTitle] || 'STRATEGIC CANVAS';

            // Create Group Wrapper
            const group = document.createElement('div');
            group.className = 'title-group';

            // Create Title Content wrapper (for h1 and subtitle)
            const titleContent = document.createElement('div');
            titleContent.className = 'title-content';

            // Move H1 into title-content
            h1.parentNode.insertBefore(group, h1);
            titleContent.appendChild(h1);

            // Create Subtitle
            const subtitle = document.createElement('div');
            subtitle.className = 'english-subtitle';
            subtitle.textContent = enTitle;
            titleContent.appendChild(subtitle);

            // Add title-content to group
            group.appendChild(titleContent);
        }

        // 3. Inject Save Indicator inside title-group (horizontally aligned)
        const titleGroup = header.querySelector('.title-group');
        if (titleGroup && !header.querySelector('.save-indicator')) {
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'save-indicator';
            statusIndicator.title = '';
            // Append inside title-group to sit next to title-content
            titleGroup.appendChild(statusIndicator);
            this.statusIndicator = statusIndicator;
        }
    }

    renderToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'modiqi-toolbar';
        toolbar.id = 'modiqi-toolbar';

        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'btn-mobile-toolbar';
        mobileToggle.type = 'button';
        mobileToggle.title = '展开工具栏 (Open Toolbar)';
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.setAttribute('aria-controls', 'modiqi-toolbar');
        mobileToggle.setAttribute('aria-label', '展开工具栏');
        mobileToggle.innerHTML = `<i data-lucide="menu"></i>`;
        mobileToggle.onclick = () => {
            const expanded = document.body.classList.toggle('mobile-toolbar-expanded');
            mobileToggle.setAttribute('aria-expanded', String(expanded));
            mobileToggle.title = expanded ? '收起工具栏 (Close Toolbar)' : '展开工具栏 (Open Toolbar)';
            mobileToggle.setAttribute('aria-label', expanded ? '收起工具栏' : '展开工具栏');
            mobileToggle.innerHTML = `<i data-lucide="${expanded ? 'x' : 'menu'}"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        // Save Status Indicator is now injected in injectBranding() after title-group

        // Home Button
        const homeBtn = document.createElement('button');
        homeBtn.title = '返回首页 (Home)';
        homeBtn.innerHTML = `<i data-lucide="home"></i>`;
        homeBtn.onclick = () => window.location.href = 'index.html';

        const projectBtn = document.createElement('button');
        let projectName = '';
        try {
            const rawProject = localStorage.getItem('modiqi_project_context_v2')
                || localStorage.getItem('modiqi_project_context_v1')
                || '{}';
            projectName = JSON.parse(rawProject).name || '';
        } catch (error) {
            console.error('Invalid project context', error);
        }
        projectBtn.title = projectName ? `当前项目：${projectName}` : '设置当前项目 (Project Context)';
        projectBtn.innerHTML = `<i data-lucide="folder-kanban"></i>`;
        projectBtn.onclick = () => window.location.href = new URL('../project.html', MODIQI_SHARED_BASE_URL).href;

        // Print Button
        const printBtn = document.createElement('button');
        printBtn.title = '打印 / 导出 PDF (Print)';
        printBtn.innerHTML = `<i data-lucide="printer"></i>`;
        printBtn.onclick = () => window.print();

        // Image Export Button
        const imgBtn = document.createElement('button');
        imgBtn.className = 'btn-export-img';
        imgBtn.disabled = true; // Enabled when library loads
        imgBtn.title = '保存为图片 (Save as Image)';
        imgBtn.innerHTML = `<i data-lucide="image"></i>`;
        imgBtn.onclick = () => this.downloadImage();

        // Zoom Button
        const zoomBtn = document.createElement('button');
        zoomBtn.className = 'btn-zoom';
        zoomBtn.title = '放大显示 (Zoom for Large Screen)';
        zoomBtn.innerHTML = `<i data-lucide="zoom-in"></i>`;
        zoomBtn.onclick = () => this.toggleZoom();

        // Theme Toggle Button
        const themeBtn = document.createElement('button');
        themeBtn.className = 'btn-theme';
        themeBtn.title = '切换主题 (Toggle Theme)';
        themeBtn.innerHTML = `<i data-lucide="sun"></i>`;
        themeBtn.onclick = () => this.toggleTheme();

        // Export Button
        const exportBtn = document.createElement('button');
        exportBtn.title = '导出数据 (Export JSON)';
        exportBtn.innerHTML = `<i data-lucide="download"></i>`;
        exportBtn.onclick = () => this.exportData();

        // Import Button
        const importBtn = document.createElement('button');
        importBtn.title = '导入数据 (Import JSON)';
        importBtn.innerHTML = `<i data-lucide="upload"></i>`;
        importBtn.onclick = () => this.triggerImport();

        // Reset Button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset';
        resetBtn.title = '清空数据 (Reset Data)';
        resetBtn.innerHTML = `<i data-lucide="trash-2"></i>`;
        resetBtn.onclick = () => {
            if (confirm('确定要清空当前页面的所有数据吗？此操作无法撤销。\nAre you sure you want to clear all data?')) {
                this.clearData();
            }
        };

        // Example Button
        const exampleBtn = document.createElement('button');
        exampleBtn.title = '加载范例 (Load Example)';
        exampleBtn.innerHTML = `<i data-lucide="file-text"></i>`;
        exampleBtn.onclick = () => this.loadExample();

        // Color Mode Button
        const colorBtn = document.createElement('button');
        colorBtn.className = 'btn-color-mode';
        colorBtn.title = '彩色模式 (Color Mode) [Ctrl+D]';
        colorBtn.innerHTML = `<i data-lucide="palette"></i>`;
        colorBtn.onclick = () => this.toggleColorMode();

        // Presentation Mode Button
        const presentBtn = document.createElement('button');
        presentBtn.className = 'btn-presentation';
        presentBtn.title = '全屏演示 (Presentation Mode) [F11]';
        presentBtn.innerHTML = `<i data-lucide="maximize"></i>`;
        presentBtn.onclick = () => this.togglePresentation();

        // Share Link Button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn-share';
        shareBtn.title = '分享链接 (Share Link)';
        shareBtn.innerHTML = `<i data-lucide="share-2"></i>`;
        shareBtn.onclick = () => this.shareLink();

        // Build toolbar - Group 1: Navigation
        toolbar.appendChild(mobileToggle);
        toolbar.appendChild(homeBtn);
        toolbar.appendChild(projectBtn);

        // Group 2: View
        const viewDivider = document.createElement('span');
        viewDivider.className = 'toolbar-divider';
        toolbar.appendChild(viewDivider);
        toolbar.appendChild(zoomBtn);
        toolbar.appendChild(colorBtn);
        toolbar.appendChild(presentBtn);

        // Group 3: Export/Import
        const exportDivider = document.createElement('span');
        exportDivider.className = 'toolbar-divider';
        toolbar.appendChild(exportDivider);
        toolbar.appendChild(printBtn);
        toolbar.appendChild(imgBtn);
        toolbar.appendChild(exportBtn);
        toolbar.appendChild(importBtn);
        toolbar.appendChild(shareBtn);

        // Group 4: Settings
        const settingsDivider = document.createElement('span');
        settingsDivider.className = 'toolbar-divider';
        toolbar.appendChild(settingsDivider);
        toolbar.appendChild(exampleBtn);
        toolbar.appendChild(themeBtn);
        toolbar.appendChild(resetBtn);

        toolbar.querySelectorAll('button').forEach(button => { button.type = 'button'; });
        document.body.appendChild(toolbar);

        // Initialize Lucide icons in the toolbar
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Sync initial icon state
        this.updateThemeIcon(localStorage.getItem('modiqi_theme') || 'wood');

        // Load saved zoom level
        this.loadZoom();

        // Load saved color mode
        this.loadColorMode();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // === Keyboard Shortcuts ===
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            if (!modKey) return;

            switch (e.key.toLowerCase()) {
                case 's':
                    // Ctrl+S: Show save confirmation
                    e.preventDefault();
                    this.saveSnapshot(); // Save to history
                    this.showSaveStatus('saved');
                    break;
                case 'p':
                    // Ctrl+P: Print (browser default, just let it happen)
                    break;
                case 'e':
                    // Ctrl+E: Export JSON
                    e.preventDefault();
                    this.exportData();
                    break;
                case 'd':
                    // Ctrl+D: Toggle Color Mode
                    e.preventDefault();
                    this.toggleColorMode();
                    break;
                case 'z':
                    // Ctrl+Z: Undo, Ctrl+Shift+Z: Redo
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    // Ctrl+Y: Redo (Windows style)
                    e.preventDefault();
                    this.redo();
                    break;
                case '0':
                    // Ctrl+0: Reset Zoom
                    e.preventDefault();
                    this.currentZoomIndex = 0;
                    this.applyZoom(1);
                    localStorage.setItem('modiqi_zoom', '1');
                    break;
                case '=':
                case '+':
                    // Ctrl+Plus: Zoom In
                    e.preventDefault();
                    this.toggleZoom();
                    break;
                case ']':
                    // Ctrl+]: Increase Font Size
                    e.preventDefault();
                    this.toggleFontScale();
                    break;
                case '[':
                    // Ctrl+[: Decrease Font Size
                    e.preventDefault();
                    this.currentFontScaleIndex = (this.currentFontScaleIndex - 1 + this.fontScales.length) % this.fontScales.length;
                    const scaleDown = this.fontScales[this.currentFontScaleIndex];
                    this.applyFontScale(scaleDown);
                    localStorage.setItem('modiqi_font_scale', scaleDown.toString());
                    break;
            }
        });

        // F11: Presentation Mode (special handling)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.togglePresentation();
            }
            if (e.key === 'Escape' && document.body.classList.contains('presentation-mode')) {
                document.body.classList.remove('presentation-mode');
            }
        });
    }

    // === Color Mode Functionality ===
    loadColorMode() {
        const savedColorMode = localStorage.getItem('modiqi_color_mode');
        if (savedColorMode === 'true') {
            document.body.classList.add('color-mode');
            this.updateColorModeButton(true);
        }
    }

    toggleColorMode() {
        const isEnabled = document.body.classList.toggle('color-mode');
        localStorage.setItem('modiqi_color_mode', isEnabled.toString());
        this.updateColorModeButton(isEnabled);
    }

    updateColorModeButton(isEnabled) {
        const btn = document.querySelector('.btn-color-mode');
        if (!btn) return;

        if (isEnabled) {
            btn.classList.add('is-active');
            btn.title = '关闭彩色模式 (Disable Color Mode) [Ctrl+D]';
            btn.innerHTML = `<i data-lucide="palette" class="filled"></i>`;
        } else {
            btn.classList.remove('is-active');
            btn.title = '彩色模式 (Color Mode) [Ctrl+D]';
            btn.innerHTML = `<i data-lucide="palette"></i>`;
        }

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // === Zoom Functionality ===
    zoomLevels = [1, 1.25, 1.5];
    currentZoomIndex = 0;

    loadZoom() {
        const savedZoom = localStorage.getItem('modiqi_zoom');
        if (savedZoom) {
            const zoomValue = parseFloat(savedZoom);
            const index = this.zoomLevels.indexOf(zoomValue);
            if (index !== -1) {
                this.currentZoomIndex = index;
                this.applyZoom(zoomValue);
            }
        }
    }

    toggleZoom() {
        // Disable zoom in presentation mode
        if (document.body.classList.contains('presentation-mode')) {
            return;
        }

        // Cycle through zoom levels: 100% -> 125% -> 150% -> 100%
        this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
        const zoomValue = this.zoomLevels[this.currentZoomIndex];
        this.applyZoom(zoomValue);
        localStorage.setItem('modiqi_zoom', zoomValue.toString());
    }

    applyZoom(scale) {
        const main = document.querySelector('main');
        if (!main) return;

        if (scale === 1) {
            main.style.transform = '';
            main.style.transformOrigin = '';
            document.body.classList.remove('is-zoomed');
        } else {
            main.style.transform = `scale(${scale})`;
            main.style.transformOrigin = 'top center';
            document.body.classList.add('is-zoomed');
        }

        // Update button tooltip
        const btn = document.querySelector('.btn-zoom');
        if (btn) {
            const percentage = Math.round(scale * 100);
            btn.title = `放大显示 ${percentage}% (Zoom: ${percentage}%)`;
        }
    }

    // === Presentation Mode ===
    togglePresentation() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.body.classList.remove('presentation-mode');
            // Restore previous zoom level
            this.loadZoom();
        } else {
            // Reset zoom to 100% before entering presentation mode
            this.currentZoomIndex = 0;
            this.applyZoom(1);

            document.documentElement.requestFullscreen();
            document.body.classList.add('presentation-mode');
        }
    }

    // === Font Scale ===
    loadFontScale() {
        const savedScale = localStorage.getItem('modiqi_font_scale');
        if (savedScale) {
            const scaleValue = parseFloat(savedScale);
            const index = this.fontScales.indexOf(scaleValue);
            if (index !== -1) {
                this.currentFontScaleIndex = index;
                this.applyFontScale(scaleValue);
            }
        }
    }

    toggleFontScale() {
        this.currentFontScaleIndex = (this.currentFontScaleIndex + 1) % this.fontScales.length;
        const scaleValue = this.fontScales[this.currentFontScaleIndex];
        this.applyFontScale(scaleValue);
        localStorage.setItem('modiqi_font_scale', scaleValue.toString());
    }

    applyFontScale(scale) {
        const main = document.querySelector('main');
        if (main) {
            main.style.fontSize = `${scale}em`;
        }

        // Update button tooltip
        const btn = document.querySelector('.btn-font-size');
        if (btn) {
            const percentage = Math.round(scale * 100);
            btn.title = `字体大小 ${percentage}% (Font Size: ${percentage}%)`;
        }
    }

    // === Print Styles - Auto Orientation & WYSIWYG ===
    setupPrintStyles() {
        // Detect paper type and orientation
        const paper = document.querySelector('.paper-a3, .paper-a4, .paper-a4-portrait');
        if (!paper) return;

        let size = 'A4';
        let orientation = 'landscape';

        if (paper.classList.contains('paper-a3')) {
            size = 'A3';
            orientation = 'landscape';
        } else if (paper.classList.contains('paper-a4-portrait')) {
            size = 'A4';
            orientation = 'portrait';
        } else if (paper.classList.contains('paper-a4')) {
            size = 'A4';
            orientation = 'landscape';
        }

        // Create dynamic print style - TRUE WYSIWYG
        // Fill the entire page, no browser headers/footers
        const printStyle = document.createElement('style');
        printStyle.id = 'modiqi-print-style';
        printStyle.textContent = `
            @page {
                size: ${size} ${orientation};
                margin: 0;
            }
            
            @media print {
                /* Reset dark mode for clean print output */
                body.theme-dark,
                body.theme-dark .paper-a3,
                body.theme-dark .paper-a4,
                body.theme-dark .paper-a4-portrait {
                    background: white !important;
                    color: #1a1a1a !important;
                }
                
                /* Reset text colors in dark mode */
                body.theme-dark *:not(svg):not(svg *) {
                    color: #1a1a1a !important;
                    border-color: #d4d4d4 !important;
                }
                
                /* Reset dark mode containers to light background */
                body.theme-dark [class*="section"],
                body.theme-dark [class*="card"],
                body.theme-dark [class*="cell"] {
                    background-color: transparent;
                    border-color: #d4d4d4 !important;
                }
            }
        `;

        document.head.appendChild(printStyle);
    }

    // === Undo/Redo History ===
    initHistory() {
        // Take initial snapshot
        this.saveSnapshot();

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                document.body.classList.remove('presentation-mode');
            }
        });
    }

    saveSnapshot() {
        if (this.isUndoing) return;

        const snapshot = {};
        document.querySelectorAll('[contenteditable="true"]').forEach((el, i) => {
            const key = this.getSaveKey(el, 'content');
            snapshot[key] = el.innerHTML;
        });

        // Don't save if nothing changed
        if (this.undoStack.length > 0) {
            const lastSnapshot = this.undoStack[this.undoStack.length - 1];
            if (JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
                return;
            }
        }

        this.undoStack.push(snapshot);
        this.redoStack = []; // Clear redo stack on new action

        // Limit history size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }

        this.updateHistoryButtons();
    }

    undo() {
        if (this.undoStack.length <= 1) return; // Keep at least one snapshot

        this.isUndoing = true;
        const currentSnapshot = this.undoStack.pop();
        this.redoStack.push(currentSnapshot);

        const previousSnapshot = this.undoStack[this.undoStack.length - 1];
        this.restoreSnapshot(previousSnapshot);

        this.isUndoing = false;
        this.updateHistoryButtons();
        this.showSaveStatus('saved');
    }

    redo() {
        if (this.redoStack.length === 0) return;

        this.isUndoing = true;
        const snapshot = this.redoStack.pop();
        this.undoStack.push(snapshot);
        this.restoreSnapshot(snapshot);

        this.isUndoing = false;
        this.updateHistoryButtons();
        this.showSaveStatus('saved');
    }

    restoreSnapshot(snapshot) {
        document.querySelectorAll('[contenteditable="true"]').forEach((el) => {
            const key = this.getSaveKey(el, 'content');
            if (snapshot[key] !== undefined) {
                const safeHTML = this.sanitizeHTML(snapshot[key]);
                el.innerHTML = safeHTML;
                localStorage.setItem(key, safeHTML);
            }
        });
    }

    updateHistoryButtons() {
        const undoBtn = document.querySelector('.btn-undo');
        const redoBtn = document.querySelector('.btn-redo');

        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length <= 1;
            undoBtn.style.opacity = this.undoStack.length <= 1 ? '0.4' : '1';
        }
        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.style.opacity = this.redoStack.length === 0 ? '0.4' : '1';
        }
    }

    // === Share Link ===
    shareLink() {
        try {
            // Collect current data
            const data = {};
            const prefix = this.storageKeyPrefix;

            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(prefix)) {
                    // Use relative keys for portability
                    const relKey = key.replace(prefix, '');
                    data[relKey] = localStorage.getItem(key);
                }
            });

            // Compress and encode
            const jsonStr = JSON.stringify(data);
            const encoded = btoa(encodeURIComponent(jsonStr));

            // Check length (URL limit ~2000 chars)
            if (encoded.length > 2000) {
                alert('数据量过大，无法通过链接分享。\n请使用"导出 JSON"功能。\n\nData too large for URL. Please use Export JSON instead.');
                return;
            }

            // Generate URL
            const url = new URL(window.location.href);
            url.searchParams.set('data', encoded);

            // Copy to clipboard
            navigator.clipboard.writeText(url.toString()).then(() => {
                alert('分享链接已复制到剪贴板！\nShare link copied to clipboard!');
            }).catch(() => {
                // Fallback: show prompt
                prompt('复制以下链接分享 (Copy this link to share):', url.toString());
            });
        } catch (e) {
            console.error('Share link generation failed:', e);
            alert('生成分享链接失败。\nFailed to generate share link.');
        }
    }

    // Load shared data from URL
    loadSharedData() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('data');

        if (!encoded) return false;

        try {
            const jsonStr = decodeURIComponent(atob(encoded));
            const data = JSON.parse(jsonStr);

            if (confirm('检测到分享数据，是否加载？\n注意：这将覆盖当前内容。\n\nShared data detected. Load it?\nThis will overwrite current content.')) {
                Object.keys(data).forEach(relKey => {
                    const fullKey = this.storageKeyPrefix + relKey;
                    localStorage.setItem(fullKey, data[relKey]);
                });

                // Clean URL and reload
                window.history.replaceState({}, '', window.location.pathname);
                location.reload();
                return true;
            }
        } catch (e) {
            console.error('Failed to parse shared data:', e);
        }

        return false;
    }


    // (Legacy methods exportData, importData removed - upgraded to Project Level at EOF)


    loadExample() {
        if (typeof MODIQI_EXAMPLES === 'undefined') {
            alert('Example data not loaded yet. Please try again in a moment.');
            return;
        }

        const exampleData = MODIQI_EXAMPLES[this.toolId];
        if (!exampleData) {
            alert('抱歉，该工具暂无预设范例。\nSorry, no example available for this tool yet.');
            return;
        }

        if (confirm('加载范例将覆盖当前页面的所有内容，是否继续？\nLoad example? This will overwrite your current data.')) {
            // Clear current data first (only for this tool)
            const prefix = this.storageKeyPrefix;
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            });

            // Import example data directly (it's already validated format)
            Object.keys(exampleData).forEach(key => {
                localStorage.setItem(key, exampleData[key]);
            });

            location.reload();
        }
    }

    downloadImage() {
        const node = document.querySelector('.paper-a3, .paper-a4, .paper-a4-portrait');
        if (!node) {
            alert('Cannot find canvas element (.paper-a3 or .paper-a4) to export.');
            return;
        }

        // Ensure html2canvas is loaded
        if (typeof html2canvas === 'undefined') {
            alert('html2canvas library not loaded yet. Please wait a moment or refresh.');
            return;
        }

        // Show loading state
        this.showSaveStatus('saving');
        const btn = document.querySelector('.btn-export-img');
        if (btn) btn.disabled = true;

        const filename = `${this.toolId}_${new Date().toISOString().split('T')[0]}.png`;

        // Temporarily hide images to avoid tainted canvas in file:// protocol
        const images = node.querySelectorAll('img');
        const originalDisplay = [];
        images.forEach((img, i) => {
            originalDisplay[i] = img.style.display;
            img.style.display = 'none';
        });

        // Using html2canvas to capture the element
        html2canvas(node, {
            scale: 2, // High resolution
            useCORS: true,
            allowTaint: false, // Changed to false to prevent tainted canvas
            backgroundColor: '#fdfbf7', // Paper color
            logging: false
        }).then((canvas) => {
            // Restore images
            images.forEach((img, i) => {
                img.style.display = originalDisplay[i];
            });

            // Create download link
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();

            this.showSaveStatus('saved');
            if (btn) btn.disabled = false;
        }).catch((error) => {
            // Restore images on error
            images.forEach((img, i) => {
                img.style.display = originalDisplay[i];
            });

            console.error('html2canvas export failed:', error);

            // Provide helpful message for CORS error
            if (error.message.includes('Tainted') || error.message.includes('SecurityError')) {
                alert('本地文件协议 (file://) 下无法导出包含图片的画布。\\n\\n请使用以下方法替代：\\n1. 使用"打印"按钮，选择"另存为 PDF"\\n2. 使用浏览器截图扩展\\n3. 通过 HTTP 服务器访问此页面\\n\\nLocal file protocol limitation. Please use Print > Save as PDF instead.');
            } else {
                alert('导出图片失败 (Export Failed): ' + error.message);
            }
            if (btn) btn.disabled = false;
        });
    }

    // === Data Management (Export/Import) ===
    exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('modiqi_')) {
                data[key] = localStorage.getItem(key);
            }
        }

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // Use project name or fallback
        const projectName = data['modiqi_strategic_clipboard']
            ? JSON.parse(data['modiqi_strategic_clipboard']).brand_name || 'project'
            : 'project';

        a.href = url;
        a.download = `${projectName}.modiqi.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    triggerImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                alert('导入失败：文件不能超过 5 MB。\nImport Failed: File must be 5 MB or smaller.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.importData(data);
                } catch (err) {
                    alert('导入失败：无效的 JSON 文件。\nImport Failed: Invalid JSON file.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    importData(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            alert('导入失败：数据格式错误。\nImport Failed: Data format error.');
            return;
        }

        const allowedEntries = Object.entries(data).filter(([key, value]) =>
            key.startsWith('modiqi_')
            && key !== '__proto__'
            && key !== 'constructor'
            && key !== 'prototype'
            && typeof value === 'string'
            && value.length <= 1024 * 1024
        );
        if (allowedEntries.length === 0 || allowedEntries.length !== Object.keys(data).length) {
            alert('导入失败：文件包含无效或过大的项目数据。\nImport Failed: Invalid or oversized project data.');
            return;
        }

        if (confirm(`准备导入项目数据? \n这将覆盖当前浏览器中所有 Modiqi 工具的数据。\n\nReady to import project? \nThis will OVERWRITE all current Modiqi tool data.`)) {
            // Optional: Clear existing Modiqi keys first to avoid orphans? 
            // Better to just merge/overwrite. But let's verify key prefix for safety.
            let count = 0;
            // First clear current modiqi keys to ensure clean state
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('modiqi_')) {
                    localStorage.removeItem(key);
                }
            }

            // Restore new data
            allowedEntries.forEach(([key, value]) => {
                localStorage.setItem(key, value);
                count++;
            });

            alert(`导入成功！已恢复 ${count} 条项目数据。\n即将刷新页面。`);
            location.reload();
        }
    }

    clearData() {
        // Clear only data for the CURRENT tool page to avoid nuking entire project by accident
        // EXCEPT if we are on the navigator or index, where it might make sense to clear all?
        // The reset button in toolbar is usually for "Reset this tool".
        // But the user prompt implies a project-wide management.
        // Let's look at the button label in renderToolbar: "清空数据 (Reset Data)".
        // Current implementation context implies resetting the current view.
        // However, standard Reset for a form usually clears just that form.
        // But here I'll stick to clearing the current page's specific inputs for safety, 
        // OR better, clear keys starting with this.storageKeyPrefix.

        // Wait, the new "Export/Import" is global. "Reset" button in toolbar existed before (line 438).
        // Let's implement clearData to clear THIS TOOL's data.

        const prefix = this.storageKeyPrefix;
        let count = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                localStorage.removeItem(key);
                count++;
            }
        }

        // Also clear inputs visually
        document.querySelectorAll('input, textarea').forEach(el => el.value = '');
        document.querySelectorAll('[contenteditable]').forEach(el => el.innerHTML = '');

        alert(`当前工具数据已重置。`);
        location.reload();
    }
    setupStrategicClipboard() {
        const CLIPBOARD_KEY = 'modiqi_strategic_clipboard';

        // 1. Initial Pull: Fill empty fields from global clipboard
        const clipboard = JSON.parse(localStorage.getItem(CLIPBOARD_KEY) || '{}');
        document.querySelectorAll('[data-strategic-id]').forEach(el => {
            const sid = el.dataset.strategicId;
            if (clipboard[sid]) {
                const currentValue = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerText;
                if (!currentValue || currentValue.trim() === '') {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.value = clipboard[sid];
                    } else {
                        el.innerText = clipboard[sid];
                    }
                }
            }

            // 2. Watch for changes (Push to global clipboard)
            const eventType = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? 'input' : 'input';
            el.addEventListener(eventType, () => {
                const value = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerText;
                this.pushToStrategicClipboard(sid, value);
            });
        });
    }

    pushToStrategicClipboard(key, value) {
        if (!key) return;
        const CLIPBOARD_KEY = 'modiqi_strategic_clipboard';
        const clipboard = JSON.parse(localStorage.getItem(CLIPBOARD_KEY) || '{}');
        clipboard[key] = value;
        localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboard));
        console.log(`[Strategic Clipboard] Key '${key}' pushed.`);
    }

    pullFromStrategicClipboard(key) {
        const CLIPBOARD_KEY = 'modiqi_strategic_clipboard';
        const clipboard = JSON.parse(localStorage.getItem(CLIPBOARD_KEY) || '{}');
        return clipboard[key] || null;
    }

    syncWithClipboard() {
        document.querySelectorAll('[data-strategic-id]').forEach(el => {
            const sid = el.dataset.strategicId;
            const value = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerText;
            if (value && value.trim() !== '') {
                this.pushToStrategicClipboard(sid, value);
            }
        });
    }
}

// Make it available globally
window.ModiqiApp = ModiqiApp;
