/**
 * Modiqi Workbench - Icons Sprite
 * Injects SVG symbols for tool icons to keep HTML clean and compatible with file:// protocol.
 */

(function injectIcons() {
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        
        <!-- Customer Journey Icon -->
        <symbol id="icon-customer-journey" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 48 Q20 48 24 36 Q28 24 40 24 Q52 24 56 16" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="8" cy="48" r="4" fill="currentColor" />
            <circle cx="24" cy="36" r="4" fill="none" />
            <circle cx="40" cy="24" r="4" fill="none" />
            <circle cx="56" cy="16" r="4" fill="currentColor" />
            <path d="M8 56 L16 52 L24 58 L32 50 L40 56 L48 48 L56 54" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.4" />
        </symbol>

        <!-- SWOT Analysis Icon -->
        <symbol id="icon-swot-analysis" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="52" height="52" rx="4" />
            <line x1="32" y1="6" x2="32" y2="58" />
            <line x1="6" y1="32" x2="58" y2="32" />
            <path d="M19 16 L20.5 20 L25 20 L21.5 23 L23 27 L19 24 L15 27 L16.5 23 L13 20 L17.5 20 Z" fill="currentColor" stroke="none" />
            <path d="M45 16 L50 26 L40 26 Z" stroke-linejoin="round" />
            <line x1="45" y1="19" x2="45" y2="23" />
            <circle cx="45" cy="24.5" r="0.5" fill="currentColor" />
            <circle cx="19" cy="44" r="5" />
            <path d="M16 50 L22 50 M17 52 L21 52" />
            <path d="M48 38 L44 44 L47 44 L43 52 L49 45 L46 45 L50 38 Z" fill="currentColor" stroke="none" />
        </symbol>

        <!-- User Persona Icon -->
        <symbol id="icon-user-persona" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="10" y="6" width="44" height="52" rx="4" />
            <circle cx="32" cy="22" r="10" />
            <circle cx="32" cy="20" r="4" stroke-width="1.5" />
            <path d="M26 26 Q32 32 38 26" stroke-width="1.5" />
            <line x1="18" y1="40" x2="46" y2="40" stroke-width="2.5" stroke-linecap="round" />
            <line x1="18" y1="46" x2="38" y2="46" stroke-width="2" stroke-linecap="round" opacity="0.6" />
            <line x1="18" y1="52" x2="42" y2="52" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
        </symbol>

        <!-- Value Proposition Icon -->
        <symbol id="icon-value-proposition" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="18" width="22" height="28" rx="2" />
            <path d="M28 28 Q34 28 34 32 Q34 36 28 36" stroke="none" fill="var(--paper-color, #fff)" />
            <path d="M28 28 Q34 28 34 32 Q34 36 28 36" />
            <circle cx="46" cy="32" r="14" />
            <path d="M32 28 Q38 28 38 32 Q38 36 32 36" stroke="none" fill="var(--paper-color, #fff)" />
            <path d="M32 28 Q38 28 38 32 Q38 36 32 36" />
            <path d="M24 10 L32 14 L24 18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M40 54 L32 50 L40 46" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </symbol>

        <!-- Empathy Map Icon -->
        <symbol id="icon-empathy-map" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="32" cy="32" r="22" />
            <line x1="32" y1="10" x2="32" y2="54" />
            <line x1="10" y1="32" x2="54" y2="32" />
            <ellipse cx="42" cy="24" rx="4" ry="2.5" />
            <circle cx="42" cy="24" r="1" fill="currentColor" />
            <path d="M20 24 Q16 24 16 28 Q16 32 20 32" stroke-width="2.5" />
            <path d="M20 26 Q18 26 18 28 Q18 30 20 30" />
            <path d="M24 42 Q28 38 32 42 Q36 38 40 42" stroke-linecap="round" />
            <circle cx="26" cy="44" r="1" fill="currentColor" />
            <circle cx="32" cy="46" r="1" fill="currentColor" />
            <circle cx="38" cy="44" r="1" fill="currentColor" />
            <path d="M42 40 L48 38 M42 44 L46 44 M42 48 L48 50" stroke-width="1.5" stroke-linecap="round" />
        </symbol>

        <!-- Marketing Canvas Icon -->
        <symbol id="icon-marketing-canvas" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="10" width="56" height="44" rx="3" />
            <line x1="16" y1="10" x2="16" y2="42" />
            <line x1="28" y1="10" x2="28" y2="42" />
            <line x1="40" y1="10" x2="40" y2="42" />
            <line x1="52" y1="10" x2="52" y2="42" />
            <line x1="4" y1="42" x2="60" y2="42" />
            <rect x="7" y="14" width="6" height="8" rx="1" fill="currentColor" opacity="0.3" />
            <rect x="19" y="14" width="6" height="5" rx="1" fill="currentColor" opacity="0.3" />
            <rect x="31" y="14" width="6" height="10" rx="1" fill="currentColor" opacity="0.3" />
            <rect x="43" y="14" width="6" height="6" rx="1" fill="currentColor" opacity="0.3" />
            <rect x="7" y="45" width="22" height="6" rx="1" fill="currentColor" opacity="0.2" />
            <rect x="35" y="45" width="22" height="6" rx="1" fill="currentColor" opacity="0.2" />
        </symbol>

        <!-- Content Calendar Icon -->
        <symbol id="icon-content-calendar" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="8" y="12" width="48" height="44" rx="4" />
            <line x1="20" y1="6" x2="20" y2="16" stroke-width="3" stroke-linecap="round" />
            <line x1="44" y1="6" x2="44" y2="16" stroke-width="3" stroke-linecap="round" />
            <line x1="8" y1="22" x2="56" y2="22" />
            <g stroke-width="1" opacity="0.5">
                <line x1="20" y1="22" x2="20" y2="56" />
                <line x1="32" y1="22" x2="32" y2="56" />
                <line x1="44" y1="22" x2="44" y2="56" />
                <line x1="8" y1="34" x2="56" y2="34" />
                <line x1="8" y1="45" x2="56" y2="45" />
            </g>
            <circle cx="26" cy="28" r="2.5" fill="currentColor" />
            <rect x="34" y="36" width="8" height="3" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="10" y="47" width="8" height="3" rx="1" fill="currentColor" opacity="0.6" />
            <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </symbol>

        <!-- Competitor Analysis Icon -->
        <symbol id="icon-competitor-analysis" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="32" cy="16" r="8" />
            <path d="M20 42 Q32 36 44 42" stroke-width="2" />
            <circle cx="14" cy="24" r="6" opacity="0.5" />
            <path d="M6 44 Q14 40 22 44" stroke-width="1.5" opacity="0.5" />
            <circle cx="50" cy="24" r="6" opacity="0.5" />
            <path d="M42 44 Q50 40 58 44" stroke-width="1.5" opacity="0.5" />
            <path d="M22 28 L28 22" stroke-width="1.5" stroke-linecap="round" />
            <path d="M42 28 L36 22" stroke-width="1.5" stroke-linecap="round" />
            <rect x="12" y="48" width="40" height="10" rx="2" />
            <line x1="22" y1="48" x2="22" y2="58" stroke-width="1" />
            <line x1="32" y1="48" x2="32" y2="58" stroke-width="1" />
            <line x1="42" y1="48" x2="42" y2="58" stroke-width="1" />
            <rect x="14" y="50" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="34" y="50" width="6" height="6" rx="1" fill="currentColor" opacity="0.3" />
        </symbol>

        <!-- Lean Canvas Icon -->
        <symbol id="icon-lean-canvas" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="8" width="56" height="48" rx="3" />
            <line x1="16" y1="8" x2="16" y2="44" />
            <line x1="28" y1="8" x2="28" y2="44" />
            <line x1="40" y1="8" x2="40" y2="44" />
            <line x1="52" y1="8" x2="52" y2="44" />
            <line x1="4" y1="26" x2="16" y2="26" />
            <line x1="28" y1="26" x2="40" y2="26" />
            <line x1="52" y1="26" x2="60" y2="26" />
            <line x1="4" y1="44" x2="60" y2="44" />
            <circle cx="10" cy="17" r="3" fill="currentColor" opacity="0.3" />
            <path d="M34 17 L37 14 L40 17 L37 24 Z" fill="currentColor" opacity="0.4" />
            <rect x="6" y="46" width="24" height="8" rx="1" fill="currentColor" opacity="0.15" />
            <rect x="34" y="46" width="24" height="8" rx="1" fill="currentColor" opacity="0.15" />
            <path d="M52 34 L56 30 L56 34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </symbol>
    </svg>
    `;

    const div = document.createElement('div');
    div.innerHTML = svgContent;
    div.style.display = 'none';
    document.body.insertBefore(div, document.body.firstChild);
})();
