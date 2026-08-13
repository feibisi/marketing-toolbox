/**
 * Kano Model Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const featureListEl = document.getElementById('featureList');
    const addBtn = document.getElementById('addFeatureBtn');

    let features = []; // State: { id, name, type, cost }

    // Load Features
    const savedFeatures = localStorage.getItem('modiqi_kano_features');
    if (savedFeatures) {
        features = JSON.parse(savedFeatures);
        features.forEach(renderFeatureRow);
    } else {
        // Default example
        addFeature('Example Feature', 'performance', 'Medium');
    }

    // Add Button
    addBtn.addEventListener('click', () => {
        addFeature('', 'indifferent', 'Low');
    });

    function addFeature(name = '', type = 'indifferent', cost = 'Low') {
        const feature = {
            id: Date.now().toString(),
            name: name,
            type: type,
            cost: cost
        };
        features.push(feature);
        renderFeatureRow(feature);
        saveFeatures();
    }

    function saveFeatures() {
        localStorage.setItem('modiqi_kano_features', JSON.stringify(features));
    }

    function renderFeatureRow(data) {
        const row = document.createElement('div');
        row.className = `feature-item row-${data.type}`;
        row.id = `f-${data.id}`;

        row.innerHTML = `
            <input type="text" class="feature-input" value="${data.name}" placeholder="Feature Name...">
            <select class="feature-select type-select">
                <option value="mustbe">Must-Be (Basic)</option>
                <option value="performance">Performance (Linear)</option>
                <option value="attractive">Attractive (Delighter)</option>
                <option value="indifferent">Indifferent</option>
                <option value="reverse">Reverse</option>
            </select>
            <select class="feature-select cost-select">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            <button class="feature-delete"><i data-lucide="trash-2"></i></button>
        `;

        // Set select values
        row.querySelector('.type-select').value = data.type;
        row.querySelector('.cost-select').value = data.cost;

        // Event Listeners
        const nameInput = row.querySelector('.feature-input');
        const typeSelect = row.querySelector('.type-select');
        const costSelect = row.querySelector('.cost-select');
        const delBtn = row.querySelector('.feature-delete');

        // Update State
        const updateState = () => {
            const f = features.find(i => i.id === data.id);
            if (f) {
                f.name = nameInput.value;
                f.type = typeSelect.value;
                f.cost = costSelect.value;
                saveFeatures();

                // Update Row Style
                row.className = `feature-item row-${f.type}`;
            }
        };

        nameInput.addEventListener('input', updateState);
        typeSelect.addEventListener('change', updateState);
        costSelect.addEventListener('change', updateState);

        // Delete
        delBtn.addEventListener('click', () => {
            if (confirm('Remove this feature?')) {
                row.remove();
                features = features.filter(i => i.id !== data.id);
                saveFeatures();
            }
        });

        // Icon refresh for new delete button
        lucide.createIcons();

        featureListEl.appendChild(row);
    }

});
