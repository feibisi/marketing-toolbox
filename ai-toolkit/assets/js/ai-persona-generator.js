/**
 * AI Persona Generator Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    const inputs = {
        product: document.getElementById('inputProduct'),
        audience: document.getElementById('inputAudience'),
        traits: document.getElementById('inputTraits'),
        style: document.getElementById('inputStyle')
    };

    const output = document.getElementById('promptOutput');
    const btnCopy = document.getElementById('btnCopy');

    // Bind events
    Object.values(inputs).forEach(el => {
        if (el) el.addEventListener('input', generatePrompt);
    });

    // Initial Trigger (after a short delay to let ModiqiApp restore values)
    setTimeout(generatePrompt, 200);

    function generatePrompt() {
        const product = inputs.product.value || '[Product Name]';
        const audience = inputs.audience.value || '[Target Audience]';
        const traits = inputs.traits.value || '[Key Traits]';
        const style = inputs.style.value;

        let styleInstruction = '';
        if (style === 'story') {
            styleInstruction = 'Write a first-person narrative story describing a day in their life.';
        } else if (style === 'data') {
            styleInstruction = 'Provide a structured JSON-like list of demographics, statistics, and behaviors.';
        } else {
            styleInstruction = 'Provide a deep psychological profile including hidden motivations and cognitive biases.';
        }

        const prompt = `Act as an expert User Researcher.
Create a detailed User Persona for a product: "${product}".

Target Audience: ${audience}
Key Characteristics: ${traits}

Please generate:
1. Name, Age, Occupation, Location
2. A representative quote
3. Top 3 Pain Points (specific to the product domain)
4. Top 3 Needs/Goals
5. Behavior & Motivation Analysis
6. How they perceive this product solution

Format: ${styleInstruction}
Output Language: Chinese (Simplified)`;

        output.value = prompt;
    }

    // Copy Function
    btnCopy.addEventListener('click', () => {
        output.select();
        document.execCommand('copy');

        // Visual Feedback
        const originalIcon = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();

        setTimeout(() => {
            btnCopy.innerHTML = originalIcon;
            lucide.createIcons();
        }, 2000);
    });

});
