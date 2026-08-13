/**
 * Content Repurposing Engine Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    const sourceTitle = document.getElementById('inputSourceTitle');
    const sourceText = document.getElementById('inputSourceText');
    const wordCount = document.getElementById('wordCount');

    // Overlay
    const overlay = document.getElementById('promptOverlay');
    const overlayText = document.getElementById('overlayPromptText');
    const btnClose = document.getElementById('btnCloseOverlay');
    const btnCopy = document.getElementById('btnCopyOverlay');

    // Buttons
    const buttons = document.querySelectorAll('.btn-gen-prompt');

    // 1. Source Stats
    if (sourceText) {
        sourceText.addEventListener('input', () => {
            const text = sourceText.value || '';
            const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
            wordCount.textContent = `${words} words`;
        });
    }

    // 2. Generate Prompt Handlers
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const channel = btn.dataset.channel;
            generatePrompt(channel);
        });
    });

    function generatePrompt(channel) {
        const title = sourceTitle.value || '[Title]';
        const content = sourceText.value || '[Insert Content Here]';

        let prompt = '';
        const base = `Act as an expert Content Marketer.
Repurpose the following content into a format optimized for ${channel.toUpperCase()}.

Original Title: ${title}
Original Content:
"""
${content}
"""

Instructions:
`;

        switch (channel) {
            case 'linkedin':
                prompt = base + `
1. Use a "Hook-Story-Value-Offer" framework.
2. Keep paragraphs short (1-2 sentences).
3. Use professional but conversational tone.
4. Include 3-5 relevant hashtags.
5. End with an engagement question.`;
                break;
            case 'twitter':
                prompt = base + `
1. Create a Thread (5-7 tweets).
2. The first tweet must be a viral hook.
3. Use numbers/bullets for readability.
4. Keep each tweet under 280 characters.
5. Thread summary and CTA in the final tweet.`;
                break;
            case 'newsletter':
                prompt = base + `
1. Write a compelling Subject Line.
2. Use a personal, "Letter from the Editor" style.
3. Summarize key takeaways.
4. Add section headers.
5. Include a clear Call to Action (CTA).`;
                break;
            case 'video':
                prompt = base + `
1. Write a 60-second vertical video script (Shorts/Reels/TikTok).
2. Segment into: Hook (0-3s), Problem (3-15s), Solution (15-45s), CTA (45-60s).
3. Include visual cues/directions in brackets [Visual: ...].`;
                break;
        }

        showOverlay(prompt);
    }

    // 3. Overlay Logic
    function showOverlay(text) {
        overlayText.value = text;
        overlay.classList.remove('hidden');
    }

    btnClose.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    btnCopy.addEventListener('click', () => {
        overlayText.select();
        document.execCommand('copy');

        const originalText = btnCopy.textContent;
        btnCopy.textContent = '已复制 (Copied)!';
        setTimeout(() => {
            btnCopy.textContent = originalText;
        }, 2000);
    });

});
