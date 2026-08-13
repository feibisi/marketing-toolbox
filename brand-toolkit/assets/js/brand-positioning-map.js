/**
 * Brand Positioning Map Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Axis Labels Sync ===
    const axisInputs = {
        'axis_x_left': document.getElementById('labelLeft'),
        'axis_x_right': document.getElementById('labelRight'),
        'axis_y_top': document.getElementById('labelTop'),
        'axis_y_bottom': document.getElementById('labelBottom')
    };

    // Link inputs to labels
    Object.keys(axisInputs).forEach(key => {
        const input = document.querySelector(`[data-save-key="${key}"]`);
        const label = axisInputs[key];

        if (input && label) {
            // Initial sync (after auto-load)
            setTimeout(() => {
                if (input.value) label.textContent = input.value;
            }, 500);

            // Live sync
            input.addEventListener('input', () => {
                label.textContent = input.value || input.getAttribute('placeholder');
            });
        }
    });


    // === Marker Management ===
    const mapContainer = document.getElementById('mapContainer');
    const markerLayer = document.getElementById('markerLayer');
    const addBtn = document.getElementById('addBrandBtn');
    const nameInput = document.getElementById('newBrandName');
    const typeSelect = document.getElementById('newBrandType');

    let markers = []; // State: { id, x, y, name, type }

    // Load saved markers
    const savedMarkers = localStorage.getItem('modiqi_brand_map_markers');
    if (savedMarkers) {
        markers = JSON.parse(savedMarkers);
        markers.forEach(renderMarker);
    }

    // Add Marker
    addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return alert('Please enter a brand name');

        const marker = {
            id: Date.now().toString(),
            name: name,
            type: typeSelect.value,
            x: 50, // Center default
            y: 50
        };

        markers.push(marker);
        renderMarker(marker);
        saveMarkers();

        nameInput.value = ''; // Reset input
    });

    function saveMarkers() {
        localStorage.setItem('modiqi_brand_map_markers', JSON.stringify(markers));
    }

    function renderMarker(data) {
        const el = document.createElement('div');
        el.className = `brand-marker type-${data.type}`;
        el.id = `m-${data.id}`;
        el.style.left = `${data.x}%`;
        el.style.top = `${data.y}%`;

        const dot = document.createElement('div');
        dot.className = 'marker-dot';
        const label = document.createElement('div');
        label.className = 'marker-label';
        label.textContent = data.name;
        el.append(dot, label);

        // Make draggable
        setupDraggable(el, data.id);

        markerLayer.appendChild(el);
    }

    // === Drag Logic ===
    function setupDraggable(el, id) {
        let isDragging = false;

        el.addEventListener('mousedown', (e) => {
            isDragging = true;
            el.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const rect = mapContainer.getBoundingClientRect();

            // Calculate percentage position
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;

            // Clamp to 0-100
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            // Update DOM
            el.style.left = `${x}%`;
            el.style.top = `${y}%`;

            // Update State
            const marker = markers.find(m => m.id === id);
            if (marker) {
                marker.x = x;
                marker.y = y;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                el.style.cursor = 'grab';
                saveMarkers(); // Save on drop
            }
        });

        // Double click to delete
        el.addEventListener('dblclick', () => {
            if (confirm(`Delete marker "${el.querySelector('.marker-label').textContent}"?`)) {
                el.remove();
                markers = markers.filter(m => m.id !== id);
                saveMarkers();
            }
        });
    }

});
