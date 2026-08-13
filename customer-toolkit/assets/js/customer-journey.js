/**
 * Customer Journey Map Logic
 * Handles the interactive emotion curve.
 */

const POINTS = [
    { x: 10, y: 50 },  // 10% width
    { x: 30, y: 50 },  // 30% width
    { x: 50, y: 50 },
    { x: 70, y: 50 },
    { x: 90, y: 50 }
];

function updateCurve(index, value) {
    // Value 1 (Low) to 10 (High)
    // Map to Y: 90 (Low) to 10 (High)
    const y = 100 - (value * 9);
    POINTS[index].y = y;

    redrawSVG();

    // Save state
    const key = `modiqi_customer_journey_v1_curve_${index}`;
    localStorage.setItem(key, value);
}

function redrawSVG() {
    const svg = document.querySelector('.emotion-curve');
    if (!svg) return;

    const width = 1000; // coordinate system width

    // Calculate Absolute Coordinates
    const coords = POINTS.map(p => ({
        x: (p.x / 100) * width,
        y: p.y
    }));

    // Build Path (Smooth Quadratic Bezier)
    // Start
    let d = `M ${coords[0].x} ${coords[0].y}`;

    // Curves
    for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i];
        const p1 = coords[i + 1];

        // Control point (midpoint x, logic for y?)
        // Simple smoothing: CP x is mid, CP y is flat?
        // Let's use simple lines or catmull-rom if complex. 
        // For now, let's just do straight lines or simple Q

        // Midpoint
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;

        // Q to midpoint?
        // Let's try T (reflection) or S
        // Using concise curve: Q control end

        // Simple smoothing trick:
        // C (prevX + offset) prevY, (currX - offset) currY, currX currY

        // Simplified for this demo:
        // Just LineTo for clear segments? No, users like curves.
        // Let's use C spline
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2; // Same x mid
        const cp2y = p1.y;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const path = svg.querySelector('.curve-path');
    path.setAttribute('d', d);

    // Move Points
    coords.forEach((c, i) => {
        const circle = svg.querySelector(`.p${i + 1}`);
        if (circle) {
            circle.setAttribute('cx', c.x);
            circle.setAttribute('cy', c.y);
        }
    });
}

// Load saved state
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.e-slider');
    sliders.forEach((slider, i) => {
        const saved = localStorage.getItem(`modiqi_customer_journey_v1_curve_${i}`);
        if (saved) {
            slider.value = saved;
            // Update internal state
            const y = 100 - (saved * 9);
            POINTS[i].y = y;
        }
    });
    redrawSVG();
});
