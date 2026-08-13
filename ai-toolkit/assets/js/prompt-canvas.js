const PERSONA_DATA = {
    kotler: {
        context: "我是一家成长中企业的营销主管，正在进行年度战略复盘。",
        objective: "基于菲利普·科特勒的市场营销方法论，分析我们现有商业模式中的增长机会，并提出 3 个具体的战略方向。",
        style: "你是现代营销学之父菲利普·科特勒。请使用严谨、系统、且极具洞察力的战略咨询语气。",
        tone: "理性的、权威的且富有前瞻性的。",
        audience: "公司董事会成员及创始人。",
        response: "请使用结构化报告格式，包含 STP 分析、价值主张建议以及具体的增长执行路径。"
    },
    analyst: {
        context: "过去 6 个月的销售数据已经整理完毕，包含流量、转化率及 CAC 数据。",
        objective: "识别数据中的异常趋势，并预测下一季度的增长上限。",
        style: "如果你是一位资深数据科学家，善于从混沌的数据中发现关联性。",
        tone: "客观、精确且剥落修饰的。",
        audience: "技术团队及首席运营官。",
        response: "Markdown 表格形式展示异常点，最后给出 3 个数据驱动的可行性建议。"
    },
    creative: {
        context: "品牌即将推出全新的环保系列产品，针对 Z 世代受众。",
        objective: "构思一个能在社交媒体引发裂变传播的创意活动主题及 3 个核心视觉概念。",
        style: "如果你是 4A 广告公司的创意总监，大胆且不拘一格。",
        tone: "充满感染力、感性且前卫的。",
        audience: "社交媒体上的活跃年轻社群。",
        response: "标题党式的口号，配合极具画面感的概念描述。"
    },
    copywriter: {
        context: "一款高客单价的数字化管理软件的落地页。",
        objective: "撰写首屏标题、副标题以及三个核心利益点的说服文案，以提高 demo 预约率。",
        style: "如果你是顶级文案大师，擅长通过文字精准击中用户痛点。",
        tone: "极度真挚且能激发渴望的。",
        audience: "感到工作流程混乱的中小企业主。",
        response: "3 组不同风格的 A/B 测试建议版本。"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btnCopy = document.getElementById('btnCopyPrompt');
    if (btnCopy) {
        btnCopy.addEventListener('click', copyFullPrompt);
    }

    // Live Preview Logic
    const contentAreas = document.querySelectorAll('[contenteditable="true"]');
    contentAreas.forEach(area => {
        area.addEventListener('input', () => {
            updateLivePreview();
            if (window.modiqiApp) window.modiqiApp.showSaveStatus('saving');
        });
    });

    // Persona Selector Logic
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const persona = btn.getAttribute('data-persona');
            applyPersona(persona);

            // UI Feedback
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Initial Preview
    updateLivePreview();
});

function applyPersona(key) {
    let data = PERSONA_DATA[key];

    // Special handling for Brand DNA (Dynamic)
    if (key === 'brand_dna') {
        const CLIPBOARD_KEY = 'modiqi_strategic_clipboard';
        const clipboard = JSON.parse(localStorage.getItem(CLIPBOARD_KEY) || '{}');
        const brandName = clipboard['brand_name'] || '[您的品牌名称]';
        const brandPersona = clipboard['brand_persona'] || '（未检测到品牌原型，请前往品牌原型罗盘设定）';

        data = {
            context: `我是 ${brandName} 的品牌主理人。我们正在执行一项关键的品牌战役。`,
            objective: "请基于我们的品牌DNA，帮助我完成以下任务...",
            style: `【重要】请严格遵循我们的品牌人格设定：\n${brandPersona}\n\n你需要像我们的品牌发言人一样思考。`,
            tone: "一致的、鲜明的、符合上述人设的。",
            audience: "我们的核心目标受众。",
            response: "请确保输出内容完全符合我们的品牌语气规范。"
        };
    }

    if (!data) return;

    const mapping = {
        prompt_context: data.context,
        prompt_objective: data.objective,
        prompt_style: data.style,
        prompt_tone: data.tone,
        prompt_audience: data.audience,
        prompt_response: data.response
    };

    for (const [saveKey, content] of Object.entries(mapping)) {
        const el = document.querySelector(`[data-save-key="${saveKey}"]`);
        if (el) {
            el.innerHTML = content;
        }
    }

    updateLivePreview();
    // Trigger ModiqiApp save if needed
    if (window.modiqiApp) {
        window.modiqiApp.saveAllItems();
    }
}

function updateLivePreview() {
    const previewEl = document.getElementById('fullPromptPreview');
    const tokenEl = document.querySelector('.token-estimate');
    if (!previewEl) return;

    const fullText = buildFullPrompt();
    previewEl.textContent = fullText || "等待录入内容...";

    // Simple Token Estimate (approx 0.75 words per token)
    if (tokenEl) {
        const wordCount = fullText.split(/\s+/).length;
        const estimate = Math.floor(wordCount / 0.75);
        tokenEl.textContent = `约 ${estimate} Tokens`;
    }
}

function buildFullPrompt() {
    const sections = [
        { key: 'prompt_context', label: '# Context' },
        { key: 'prompt_objective', label: '# Objective' },
        { key: 'prompt_style', label: '# Style' },
        { key: 'prompt_tone', label: '# Tone' },
        { key: 'prompt_audience', label: '# Audience' },
        { key: 'prompt_response', label: '# Response Format' }
    ];

    let fullPrompt = '';
    const modelInput = document.querySelector('[data-save-key="meta_model"]');
    if (modelInput && modelInput.value) {
        fullPrompt += `[Target Model: ${modelInput.value}]\n\n`;
    }

    sections.forEach(sec => {
        const el = document.querySelector(`[data-save-key="${sec.key}"]`);
        if (el) {
            let content = el.innerText.trim();
            // Ignore placeholders
            if (content && !content.includes('我是谁？') && !content.includes('请帮我...')) {
                fullPrompt += `${sec.label}\n${content}\n\n`;
            } else if (content && content.length > 30) {
                // If it's long but contains placeholder text, maybe keep it 
                // for real usage we just take what's there
                fullPrompt += `${sec.label}\n${content}\n\n`;
            }
        }
    });

    return fullPrompt.trim();
}

async function copyFullPrompt() {
    const fullPrompt = buildFullPrompt();
    if (!fullPrompt) return;

    try {
        await navigator.clipboard.writeText(fullPrompt);
        const btn = document.getElementById('btnCopyPrompt');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = `<i data-lucide="check"></i> <span>已复制 (Copied)</span>`;
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
        }, 2000);

    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

