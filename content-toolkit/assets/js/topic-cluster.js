/**
 * SEO Topic Cluster Mapper Logic
 * Handles interactive node creation and D3-style link drawing.
 */

let nodes = [];
let draggingNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.addEventListener('DOMContentLoaded', () => {
    initMapper();

    // Core topic input sync
    const coreInput = document.getElementById('coreTopicInput');
    coreInput.addEventListener('input', (e) => {
        const center = document.querySelector('#node-core .node-label');
        if (center) center.innerText = e.target.value || 'Core Topic';
    });
});

function initMapper() {
    // Defines center node
    const stage = document.getElementById('mapperStage');
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    // Initial nodes state: just core
    // We don't really need to track core in 'nodes' array for drag logic if it's fixed,
    // but tracking it helps for linking.

    // Actually, let's make core draggable too? No, clearer if fixed center.
    // We will calculate links from center (50%, 50%).

    // Load saved nodes? (Skipped for MVP)
}

function addNode() {
    const text = document.getElementById('subTopicInput').value.trim();
    if (!text) return;

    const type = document.getElementById('nodeTypeSelect').value;

    const id = 'node_' + Date.now();
    const stage = document.getElementById('mapperStage');

    // Random position around center
    const cx = stage.clientWidth / 2;
    const cy = stage.clientHeight / 2;
    const angle = Math.random() * Math.PI * 2;
    const radius = 100 + Math.random() * 100; // 100-200px out
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    const nodeData = {
        id,
        text,
        type,
        x,
        y
    };

    nodes.push(nodeData);
    createNodeElement(nodeData);
    drawLinks();
    updateStats();

    // Clear input
    document.getElementById('subTopicInput').value = '';
}

function createNodeElement(data) {
    const el = document.createElement('div');
    el.className = 'node';
    el.dataset.id = data.id;
    el.dataset.type = data.type;
    el.style.left = data.x + 'px';
    el.style.top = data.y + 'px';

    let icon = 'file-text';
    if (data.type === 'cluster') icon = 'layers';
    if (data.type === 'landing') icon = 'target';

    el.innerHTML = `<i data-lucide="${icon}"></i> <span>${data.text}</span>`;

    // Drag events
    el.addEventListener('mousedown', handleDragStart);

    const layer = document.getElementById('nodesLayer');
    layer.appendChild(el);
    lucide.createIcons();
}

/* Drag Logic */
function handleDragStart(e) {
    draggingNode = e.currentTarget; // The div.node
    const rect = draggingNode.getBoundingClientRect();

    // Calculate offset from mouse to element center?
    // We position by center (transform translate -50%), so left/top is the anchor.
    // e.clientX is global.
    // We need offset relative to the stage.

    const stageRect = document.getElementById('mapperStage').getBoundingClientRect();
    const currentLeft = parseFloat(draggingNode.style.left);
    const currentTop = parseFloat(draggingNode.style.top);

    const mouseXInStage = e.clientX - stageRect.left;
    const mouseYInStage = e.clientY - stageRect.top;

    dragOffsetX = mouseXInStage - currentLeft;
    dragOffsetY = mouseYInStage - currentTop;

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}

function handleDragMove(e) {
    if (!draggingNode) return;

    const stage = document.getElementById('mapperStage');
    const stageRect = stage.getBoundingClientRect();

    let x = e.clientX - stageRect.left - dragOffsetX;
    let y = e.clientY - stageRect.top - dragOffsetY;

    // Boundaries
    x = Math.max(0, Math.min(x, stage.clientWidth));
    y = Math.max(0, Math.min(y, stage.clientHeight));

    draggingNode.style.left = x + 'px';
    draggingNode.style.top = y + 'px';

    // Update data model
    const id = draggingNode.dataset.id;
    const node = nodes.find(n => n.id === id);
    if (node) {
        node.x = x;
        node.y = y;
    }

    drawLinks();
}

function handleDragEnd() {
    draggingNode = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
}

/* Drawing Links (SVG) */
function drawLinks() {
    const svg = document.getElementById('connectionSvg');
    svg.innerHTML = ''; // Clear

    const stage = document.getElementById('mapperStage');
    const cx = stage.clientWidth / 2;
    const cy = stage.clientHeight / 2;

    nodes.forEach(node => {
        // Draw line from Center Core (cx, cy) to Node (node.x, node.y)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', node.x);
        line.setAttribute('y2', node.y);
        line.setAttribute('class', 'link-line');
        svg.appendChild(line);
    });
}

function updateStats() {
    document.getElementById('statTotal').innerText = nodes.length + 1; // +1 for core
    // Simple logic for demo
    document.getElementById('statKeywords').innerText = nodes.length + 1;
}
