/**
 * Tone of Voice Equalizer Logic
 * Translates slider values (0-100) into dynamic text personas.
 */

const DIMENSIONS = {
    humor: { left: '幽默风趣', right: '严肃认真', id: 'sliderHumor', display: 'displayHumor' },
    formal: { left: '正式规范', right: '随性自然', id: 'sliderFormal', display: 'displayFormal' },
    respect: { left: '恭敬礼貌', right: '大胆反叛', id: 'sliderRespect', display: 'displayRespect' },
    energy: { left: '热情洋溢', right: '实事求是', id: 'sliderEnergy', display: 'displayEnergy' },
    tradition: { left: '经典传统', right: '前卫创新', id: 'sliderTradition', display: 'displayTradition' }
};

const ADJECTIVES = {
    humor: {
        left: ['Witty', 'Playful', 'Fun-loving', '机智', '诙谐'],
        right: ['Professional', 'Authoritative', 'Serious', '专业', '严谨']
    },
    formal: {
        left: ['Corporate', 'Clean', 'Structured', '官方', '规范'],
        right: ['Conversational', 'Friendly', 'Relaxed', '亲切', '像朋友一样']
    },
    respect: {
        left: ['Polite', 'Deferential', 'Courteous', '谦逊', '有礼貌'],
        right: ['Edgy', 'Provocative', 'Bold', '犀利', '挑战性']
    },
    energy: {
        left: ['Excited', 'Passionate', 'Dynamic', '充满激情', '高能量'],
        right: ['Calm', 'Objective', 'Dry', '冷静', '客观']
    },
    tradition: {
        left: ['Timeless', 'Established', 'Trustworthy', '经典', '稳重'],
        right: ['Modern', 'Disruptive', 'Cutting-edge', '先锋', '颠覆性']
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Attach listeners
    Object.keys(DIMENSIONS).forEach(key => {
        const config = DIMENSIONS[key];
        const slider = document.getElementById(config.id);

        if (slider) {
            slider.addEventListener('input', () => {
                updateDisplay(key, slider.value);
                generateOutput();
                debouncedSave(); // Use logic similar to other tools
            });
            // Init display
            updateDisplay(key, slider.value);
        }
    });

    // Initial Gen
    generateOutput();
});


function updateDisplay(key, value) {
    const config = DIMENSIONS[key];
    const displayEl = document.getElementById(config.display);
    if (!displayEl) return;

    let text = 'Neutral (平衡)';
    if (value < 40) text = `More ${config.left}`;
    if (value > 60) text = `More ${config.right}`;
    if (value <= 10) text = `Very ${config.left} (极度)`;
    if (value >= 90) text = `Very ${config.right} (极度)`;

    displayEl.textContent = text;
}

function generateOutput() {
    const statementEl = document.getElementById('voiceStatement');
    const keywordPool = document.getElementById('keywordPool');

    let traits = [];
    let keywords = [];

    Object.keys(DIMENSIONS).forEach(key => {
        const slider = document.getElementById(DIMENSIONS[key].id);
        const val = parseInt(slider.value);

        // Logic: Only capture strong traits (>60 or <40)
        if (val <= 40) {
            traits.push(DIMENSIONS[key].left);
            keywords = keywords.concat(ADJECTIVES[key].left);
        } else if (val >= 60) {
            traits.push(DIMENSIONS[key].right);
            keywords = keywords.concat(ADJECTIVES[key].right);
        }
    });

    // Generate Sentence
    if (traits.length === 0) {
        statementEl.textContent = "我们的品牌语调是平衡且中立的，适应性强，没有极端的情感色彩。";
    } else {
        const mainTraits = traits.join("、");
        statementEl.textContent = `我们的品牌语调是：${mainTraits}。\n\n我们在沟通中倾向于展现鲜明的个性，而不是平庸的中立。`;
    }

    // Generate Keywords Tags
    keywordPool.innerHTML = '';
    if (keywords.length === 0) {
        keywordPool.innerHTML = '<span class="tag-placeholder">Balanced / Neutral</span>';
    } else {
        // Dedup and limit
        const uniqueKeys = [...new Set(keywords)].slice(0, 15);
        uniqueKeys.forEach(k => {
            const span = document.createElement('span');
            span.className = 'keyword-tag';
            span.textContent = k;
            keywordPool.appendChild(span);
        });
    }
}

// Simple AutoSave implementation for this specific tool
let saveTimer;
function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        if (window.modiqiApp) {
            // Let core handle inputs marked with data-save-key via event bubbling? 
            // Actually ranges fire 'change' or 'input'. Core listens to 'input'.
            // So just dispatching input event might be enough if we weren't already inside an input handler?
            // Since we are inside an input handler, just calling showSaveStatus is visual only, 
            // we need to rely on Core's auto-save or manually trigger value persistence.
            // Core.js auto-saves on 'input' event for elements with data-save-key.
            // Since we are triggered by 'input' event, core should pick it up automatically!
            window.modiqiApp.showSaveStatus('saving');
            setTimeout(() => window.modiqiApp.showSaveStatus('saved'), 500);
        }
    }, 1000);
}
