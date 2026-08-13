/**
 * Stakeholder Radar Logic
 * Interactive power/interest grid.
 */

let stakeholders = [];
let draggingId = null;

// Initial random positions for new adds
function addStakeholder() {
    const name = document.getElementById('personName').value.trim();
    if (!name) return;

    const stance = document.getElementById('personStance').value;
    const id = 'sh_' + Date.now();

    // Default start at center
    const stage = document.getElementById('radarStage');
    const x = stage.clientWidth / 2;
    const y = stage.clientHeight / 2;

    const sh = { id, name, stance, x, y };
    stakeholders.push(sh);

    renderNode(sh);

    // Clear input
    document.getElementById('personName').value = '';
}

function renderNode(sh) {
    const el = document.createElement('div');
    el.className = `stakeholder-node msg-${sh.stance}`;
    el.dataset.id = sh.id;
    el.style.left = sh.x + 'px';
    el.style.top = sh.y + 'px';
    // Center alignment handled by CSS transform or JS offset
    // Let's use transform: translate(-50%, -50%) in CSS
    // So left/top are center coordinates.
    // CSS has transform: scale(1.05) on active, so we need to add the translate there or here. 
    // The CSS .stakeholder-node definition doesn't put "transform: translate(-50%, -50%)" yet.
    // Let's add it inline or update CSS. I'll add it inline.
    el.style.transform = 'translate(-50%, -50%)';

    el.innerHTML = `<div class="status-dot"></div> ${sh.name}`;

    el.addEventListener('mousedown', handleDragStart);

    document.getElementById('stakeholderLayer').appendChild(el);
}

// Drag Logic
function handleDragStart(e) {
    e.preventDefault(); // Stop text selection
    draggingId = e.currentTarget.dataset.id;
    const el = e.currentTarget;

    // Listen globally
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
}

function handleDragMove(e) {
    if (!draggingId) return;

    const el = document.querySelector(`.stakeholder-node[data-id="${draggingId}"]`);
    const stage = document.getElementById('radarStage');
    const stageRect = stage.getBoundingClientRect();

    let x = e.clientX - stageRect.left;
    let y = e.clientY - stageRect.top;

    // Constraints
    x = Math.max(0, Math.min(x, stage.clientWidth));
    y = Math.max(0, Math.min(y, stage.clientHeight));

    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // Update active quadrant tactic
    updateTacticHighlight(x, y, stage.clientWidth, stage.clientHeight);
}

function handleDragEnd() {
    draggingId = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);

    // Reset tactic highlight
    document.querySelectorAll('.tactic-card').forEach(c => c.classList.remove('active'));
}

function updateTacticHighlight(x, y, w, h) {
    // Quadrants
    // Top-Left: High Power (Y < h/2), Low Interest (X < w/2) -> Keep Satisfied
    // Top-Right: High Power (Y < h/2), High Interest (X > w/2) -> Manage Closely
    // Bot-Left: Low Power (Y > h/2), Low Interest (X < w/2) -> Monitor
    // Bot-Right: Low Power (Y > h/2), High Interest (X > w/2) -> Keep Informed

    const isHighPower = y < h / 2;
    const isHighInterest = x > w / 2;

    let targetId = '';

    if (isHighPower && isHighInterest) targetId = 'tactic-high-high';
    else if (isHighPower && !isHighInterest) targetId = 'tactic-high-low';
    else if (!isHighPower && !isHighInterest) targetId = 'tactic-low-low'; // Monitor (not in sidebar currently? Add logic)
    else if (!isHighPower && isHighInterest) targetId = 'tactic-low-high';

    document.querySelectorAll('.tactic-card').forEach(c => c.classList.remove('active'));

    if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
    }
}
