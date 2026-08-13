/**
 * Drip Campaign Blueprint Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('stepsContainer');
    const btnAdd = document.getElementById('btnAddStep');
    const template = document.getElementById('stepTemplate');
    const STORAGE_KEY = 'drip_campaign_v1_steps';

    // 1. Initial Load
    loadSteps();

    // 2. Add Step Handler
    btnAdd.addEventListener('click', () => {
        addStep();
    });

    // 3. Delegation for Delete & Input
    container.addEventListener('click', (e) => {
        // Delete Button
        if (e.target.closest('.btn-delete-step')) {
            const card = e.target.closest('.step-card');
            // Also remove the connector before it
            const connector = card.previousElementSibling;

            if (confirm('确定要删除此步骤吗?')) {
                card.remove();
                if (connector && connector.classList.contains('step-connector')) {
                    connector.remove();
                }
                saveSteps();
                updateStepNumbers();
            }
        }
    });

    container.addEventListener('input', (e) => {
        // Auto-save on edit
        if (e.target.isContentEditable) {
            // Debounce save
            clearTimeout(window._saveTimer);
            window._saveTimer = setTimeout(saveSteps, 1000);
        }
    });

    // Functions
    function addStep(data = null) {
        const frag = template.content.cloneNode(true);
        const card = frag.querySelector('.step-card');
        const connector = frag.querySelector('.step-connector');

        // Insert before the Add Button Wrapper
        const addWrapper = document.getElementById('addStepWrapper');
        container.insertBefore(connector, addWrapper);
        container.insertBefore(card, addWrapper);

        // Populate Data if provided
        if (data) {
            card.querySelector('.step-title').innerText = data.title;
            connector.querySelector('.delay-label').innerText = data.delay || 'Day X';
            const fields = card.querySelectorAll('.editable-field');
            if (fields[0]) fields[0].innerText = data.subject;
            if (fields[1]) fields[1].innerText = data.msg;
            if (fields[2]) fields[2].innerText = data.cta;
        }

        // Init Icons
        lucide.createIcons();
        updateStepNumbers();
        saveSteps();
    }

    function updateStepNumbers() {
        const steps = container.querySelectorAll('.email-step');
        steps.forEach((step, index) => {
            const num = (index + 1).toString().padStart(2, '0');
            step.querySelector('.step-number').innerText = num;
        });
    }

    function saveSteps() {
        const steps = [];
        const stepCards = container.querySelectorAll('.email-step');

        stepCards.forEach(card => {
            const connector = card.previousElementSibling;
            const delay = connector ? connector.querySelector('.delay-label').innerText : '';
            const title = card.querySelector('.step-title').innerText;
            const fields = card.querySelectorAll('.editable-field');

            steps.push({
                delay: delay,
                title: title,
                subject: fields[0]?.innerText || '',
                msg: fields[1]?.innerText || '',
                cta: fields[2]?.innerText || ''
            });
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    }

    function loadSteps() {
        // Check if we have saved dynamic steps
        const saved = localStorage.getItem(STORAGE_KEY);

        // Static HTML already has Day 0 and Day 3 as example (hardcoded in HTML).
        // If we have saved data, we should CLEAR the default static email-steps (but keep trigger) and rebuild.
        // If no saved data, we KEEP the default HTML and save it as initial state.

        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.length > 0) {
                    // Clear existing email steps (but keep trigger and its connector)
                    // Trigger is .trigger-step
                    // First connector is immediate

                    // Identify elements to remove: all .email-step and their PRECEDING .step-connector (except the one after trigger)
                    // Harder to select "preceding".

                    // Strategy: Remove all .email-step and .step-connector inside stepsContainer, 
                    // EXCEPT the ones related to Trigger.

                    // Actually, easiest is to clear EVERYTHING except Trigger and "Immediate" connector,
                    // then rebuild.

                    const trigger = container.querySelector('.trigger-step');
                    const immediateConn = container.querySelector('.step-connector'); // First one
                    const addWrapper = document.getElementById('addStepWrapper');

                    // Standardize:
                    // [Trigger] -> [Conn Immediate] -> [Email Step] -> [Conn] -> [Email Step] ... -> [AddBtn]

                    // Remove everything between "Conn Immediate" and "AddBtn"
                    let next = immediateConn.nextElementSibling;
                    while (next && next !== addWrapper) {
                        const toRemove = next;
                        next = next.nextElementSibling;
                        toRemove.remove();
                    }

                    // Rebuild
                    data.forEach(item => addStep(item));
                }
            } catch (e) {
                console.error('Failed to load steps', e);
            }
        } else {
            // First run, save the default HTML state
            saveSteps();
        }
    }

});
