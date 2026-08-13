/**
 * Subject Line Tester Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Inputs
    const subjectInput = document.getElementById('inputSubject');
    const preheaderInput = document.getElementById('inputPreheader');

    // View Elements
    const viewSubject = document.getElementById('viewSubject');
    const viewPreheader = document.getElementById('viewPreheader');
    const scoreText = document.getElementById('scoreText');
    const scorePath = document.getElementById('scorePath');
    const scoreCircle = document.getElementById('scoreCircle'); // Wrapper for color
    const insightList = document.getElementById('insightList');
    const countSubject = document.getElementById('countSubject');
    const countPreheader = document.getElementById('countPreheader');

    // Constants
    const OPTIMAL_LENGTH_MIN = 30;
    const OPTIMAL_LENGTH_MAX = 50;
    const SPAM_WORDS = ['free', 'urgent', 'act now', '$$$', 'limited time', 'winner', 'guarantee', '免费', '急', '赚钱', '中奖'];
    const POWER_WORDS = ['you', 'your', 'exclusive', 'secret', 'new', 'alert', 'video', '你', '秘密', '独家', '新', '视频'];

    // Listeners
    if (subjectInput) {
        subjectInput.addEventListener('input', analyze);
        // Init preview immediately
        setTimeout(analyze, 200);
    }

    if (preheaderInput) {
        preheaderInput.addEventListener('input', updatePreviewOnly);
    }

    function updatePreviewOnly() {
        if (preheaderInput && viewPreheader) {
            viewPreheader.textContent = preheaderInput.value || 'Preheader text appears here...';
            updateCounter(preheaderInput, countPreheader, 100);
        }
    }

    function analyze() {
        const text = subjectInput.value || '';

        // 1. Update Preview & Counter
        viewSubject.textContent = text || 'Subject Line';
        updateCounter(subjectInput, countSubject, 60);
        updatePreviewOnly(); // Ensure preheader is sync

        if (!text) {
            resetState();
            return;
        }

        // 2. Metrics Calculation
        let score = 100;
        const insights = [];

        // Length Check
        const len = text.length;
        if (len < 10) {
            score -= 20;
            insights.push({ type: 'bad', text: '标题太短 (Too short)' });
        } else if (len > 60) {
            score -= 20;
            insights.push({ type: 'warning', text: '标题可能被截断 (>60 chars)' });
        } else if (len >= OPTIMAL_LENGTH_MIN && len <= OPTIMAL_LENGTH_MAX) {
            insights.push({ type: 'good', text: '长度最佳 (Optimal length)' });
        } else {
            // 10-30 or 50-60
            score -= 5;
            insights.push({ type: 'warning', text: '长度尚可，建议 30-50 字符' });
        }

        // Spam Check
        const lower = text.toLowerCase();
        let spamCount = 0;
        SPAM_WORDS.forEach(word => {
            if (lower.includes(word)) {
                spamCount++;
                score -= 15;
                insights.push({ type: 'bad', text: `包含垃圾词汇: "${word}"` });
            }
        });
        if (spamCount === 0) {
            // insights.push({ type: 'good', text: '无垃圾词汇 (Safe)' });
        }

        // Power Word Check
        let powerCount = 0;
        POWER_WORDS.forEach(word => {
            if (lower.includes(word)) {
                powerCount++;
            }
        });
        if (powerCount > 0) {
            insights.push({ type: 'good', text: `包含强力词汇 (Power Words found)` });
        } else {
            score -= 5;
            insights.push({ type: 'warning', text: '尝试添加更有吸引力的词汇 (Try power words)' });
        }

        // Punctuation
        if (text.includes('!!!')) {
            score -= 10;
            insights.push({ type: 'bad', text: '避免过多感叹号 (Avoid !!!)' });
        }
        if (text.endsWith('?')) {
            insights.push({ type: 'good', text: '疑问句通常能提高打开率' });
        }

        // Numbers
        if (/\d/.test(text)) {
            insights.push({ type: 'good', text: '包含数字更吸睛' });
        }

        // Clamp Score
        score = Math.max(0, Math.min(100, score));

        // 3. Update UI
        renderResults(score, insights);
    }

    function renderResults(score, insights) {
        // Score Display
        scoreText.textContent = score;
        const dashArray = `${score}, 100`;
        scorePath.setAttribute('stroke-dasharray', dashArray);

        let color = 'var(--color-error)';
        if (score >= 80) color = 'var(--color-success)';
        else if (score >= 60) color = 'var(--color-warning)';

        scorePath.style.stroke = color;

        // Insights List
        insightList.innerHTML = '';
        insights.forEach(item => {
            const li = document.createElement('li');
            li.className = `status-${item.type}`;
            li.textContent = item.text;
            insightList.appendChild(li);
        });
    }

    function resetState() {
        scoreText.textContent = '0';
        scorePath.setAttribute('stroke-dasharray', '0, 100');
        insightList.innerHTML = '<li class="status-neutral">请输入标题以获取分析...</li>';
    }

    function updateCounter(input, counter, max) {
        if (!input || !counter) return;
        const len = input.value.length;
        counter.textContent = `${len}/${max}`;
        counter.classList.remove('limit-near', 'limit-reached');
        if (len >= max) counter.classList.add('limit-reached');
        else if (len >= max * 0.9) counter.classList.add('limit-near');
    }

});
