interface PreviewProps {
  id: string;
}

export function WorkflowMiniPreview({ id }: PreviewProps) {
  switch (id) {
    case 'strategy-alignment':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="10" y="10" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="72" y="10" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="134" y="10" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="10" y="72" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="72" y="72" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="134" y="72" width="55" height="55" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="24" y="34" width="6" height="19" rx="1" fill="#cbd5e1" />
          <rect x="33" y="40" width="6" height="13" rx="1" fill="#e2e8f0" />
          <rect x="42" y="29" width="6" height="24" rx="1" fill="#cbd5e1" />
          <circle cx="99" cy="33" r="6" fill="#e2e8f0" />
          <path d="M90 50 Q99 44 108 50" fill="#e2e8f0" />
          <circle cx="161" cy="37" r="10" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="161" cy="37" r="4" fill="#cbd5e1" />
          <path d="M20 105 L30 95 L42 100 L52 90" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="99" cy="95" r="8" fill="#e2e8f0" />
          <rect x="96" y="104" width="6" height="4" rx="1" fill="#cbd5e1" />
          <path d="M158 90 L164 98 L160 98 L166 110 L158 100 L162 100 Z" fill="#cbd5e1" />
        </svg>
      );
    case 'audience-positioning':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <circle cx="100" cy="58" r="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M100 44 Q122 44 122 68 L78 68 Q78 44 100 44" fill="#e2e8f0" />
          <circle cx="100" cy="53" r="7" fill="#cbd5e1" />
          <circle cx="42" cy="40" r="4" fill="#94a3b8" />
          <line x1="47" y1="42" x2="76" y2="54" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="158" cy="40" r="4" fill="#94a3b8" />
          <line x1="153" y1="42" x2="124" y2="54" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
          <rect x="58" y="95" width="84" height="26" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
          <line x1="68" y1="105" x2="132" y2="105" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="68" y1="112" x2="112" y2="112" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
      );
    case 'brand-narrative':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="30" y="28" width="60" height="84" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <circle cx="60" cy="55" r="15" fill="#e2e8f0" />
          <rect x="40" y="80" width="40" height="4" rx="2" fill="#cbd5e1" />
          <rect x="45" y="90" width="30" height="3" rx="1" fill="#e2e8f0" />
          <rect x="110" y="28" width="60" height="84" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="120" y="44" width="40" height="6" rx="2" fill="#cbd5e1" />
          <rect x="120" y="59" width="35" height="4" rx="2" fill="#e2e8f0" />
          <rect x="120" y="69" width="38" height="4" rx="2" fill="#e2e8f0" />
          <rect x="120" y="79" width="30" height="4" rx="2" fill="#e2e8f0" />
        </svg>
      );
    case 'content-operations':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="36" y="22" width="60" height="82" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="46" y="36" width="40" height="4" rx="2" fill="#cbd5e1" />
          <rect x="46" y="46" width="35" height="3" rx="1" fill="#e2e8f0" />
          <rect x="46" y="54" width="38" height="3" rx="1" fill="#e2e8f0" />
          <rect x="46" y="62" width="30" height="3" rx="1" fill="#e2e8f0" />
          <rect x="110" y="22" width="54" height="40" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="110" y="22" width="54" height="12" rx="3" fill="#e2e8f0" />
          <circle cx="126" cy="48" r="3" fill="#cbd5e1" />
          <circle cx="146" cy="48" r="3" fill="#e2e8f0" />
          <rect x="110" y="72" width="54" height="32" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
          <circle cx="137" cy="86" r="6" fill="#cbd5e1" />
          <circle cx="122" cy="94" r="4" fill="#e2e8f0" />
          <circle cx="152" cy="94" r="4" fill="#e2e8f0" />
        </svg>
      );
    case 'go-to-market':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <path d="M40 28 L160 28 L122 68 L78 68 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M78 68 L122 68 L112 98 L88 98 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="85" y="98" width="30" height="16" rx="2" fill="#cbd5e1" />
          <text x="172" y="38" fontSize="9" fill="#94a3b8">100%</text>
          <text x="172" y="73" fontSize="9" fill="#94a3b8">40%</text>
          <text x="172" y="106" fontSize="9" fill="#94a3b8">15%</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="20" y="20" width="160" height="100" rx="4" fill="#f8fafc" stroke="#e2e8f0" />
          <line x1="20" y1="45" x2="180" y2="45" stroke="#f1f5f9" />
          <line x1="20" y1="70" x2="180" y2="70" stroke="#f1f5f9" />
          <line x1="20" y1="95" x2="180" y2="95" stroke="#f1f5f9" />
          <rect x="34" y="52" width="18" height="64" rx="2" fill="#cbd5e1" />
          <rect x="60" y="66" width="18" height="50" rx="2" fill="#e2e8f0" />
          <rect x="86" y="42" width="18" height="74" rx="2" fill="#cbd5e1" />
          <rect x="112" y="56" width="18" height="60" rx="2" fill="#e2e8f0" />
          <rect x="138" y="36" width="18" height="80" rx="2" fill="#cbd5e1" />
          <path d="M43 49 L69 63 L95 39 L121 53 L147 33" fill="none" stroke="#64748b" strokeWidth="1.5" />
        </svg>
      );
  }
}

export function ToolMiniPreview({ id }: PreviewProps) {
  switch (id) {
    case 'swot-analysis':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="10" y="10" width="86" height="56" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="104" y="10" width="86" height="56" rx="2" fill="#fff" stroke="#e2e8f0" />
          <rect x="10" y="74" width="86" height="56" rx="2" fill="#fff" stroke="#e2e8f0" />
          <rect x="104" y="74" width="86" height="56" rx="2" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="18" y="30" fontSize="12" fontWeight="bold" fill="#94a3b8">S</text>
          <text x="112" y="30" fontSize="12" fontWeight="bold" fill="#94a3b8">W</text>
          <text x="18" y="94" fontSize="12" fontWeight="bold" fill="#94a3b8">O</text>
          <text x="112" y="94" fontSize="12" fontWeight="bold" fill="#94a3b8">T</text>
          <circle cx="100" cy="70" r="14" fill="#fff" stroke="#94a3b8" />
          <rect x="18" y="36" width="54" height="2" rx="1" fill="#e2e8f0" />
          <rect x="18" y="42" width="38" height="2" rx="1" fill="#f1f5f9" />
        </svg>
      );
    case 'okr-cascade':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="12" y="12" width="176" height="32" fill="#f1f5f9" stroke="#e2e8f0" />
          <circle cx="27" cy="28" r="8" fill="#fff" stroke="#cbd5e1" />
          <text x="27" y="31" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">O1</text>
          <rect x="44" y="25" width="90" height="4" rx="2" fill="#cbd5e1" />
          <rect x="52" y="54" width="136" height="22" fill="#fff" stroke="#e2e8f0" rx="1" />
          <rect x="52" y="84" width="136" height="22" fill="#fff" stroke="#e2e8f0" rx="1" />
          <path d="M27 44 V95 H52 M27 65 H52" stroke="#cbd5e1" fill="none" />
          <rect x="150" y="61" width="28" height="8" rx="1" fill="#f1f5f9" stroke="#cbd5e1" />
          <rect x="150" y="91" width="28" height="8" rx="1" fill="#f1f5f9" stroke="#cbd5e1" />
        </svg>
      );
    case 'roi-calculator':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="12" y="12" width="76" height="116" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="20" y="24" width="60" height="10" fill="#fff" stroke="#e2e8f0" />
          <rect x="20" y="42" width="60" height="10" fill="#fff" stroke="#e2e8f0" />
          <rect x="20" y="72" width="60" height="10" fill="#fff" stroke="#e2e8f0" />
          <rect x="20" y="90" width="60" height="10" fill="#fff" stroke="#e2e8f0" />
          <rect x="96" y="12" width="92" height="116" fill="#fff" stroke="#cbd5e1" />
          <rect x="104" y="20" width="76" height="32" fill="#f1f5f9" stroke="#cbd5e1" />
          <text x="142" y="41" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#475569">354%</text>
          <rect x="104" y="60" width="35" height="22" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="145" y="60" width="35" height="22" fill="#f8fafc" stroke="#e2e8f0" />
          <line x1="106" y1="98" x2="178" y2="98" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="144" cy="98" r="4" fill="#64748b" />
          <line x1="106" y1="114" x2="178" y2="114" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="130" cy="114" r="4" fill="#94a3b8" />
        </svg>
      );
    case 'value-proposition':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="25" y="30" width="76" height="76" fill="#fff" stroke="#94a3b8" />
          <line x1="25" y1="68" x2="101" y2="68" stroke="#cbd5e1" />
          <line x1="63" y1="30" x2="63" y2="106" stroke="#cbd5e1" />
          <circle cx="150" cy="68" r="38" fill="#fff" stroke="#94a3b8" />
          <path d="M150 68 L188 68 M150 68 L131 101 M150 68 L131 35" stroke="#cbd5e1" />
        </svg>
      );
    case 'business-model-canvas':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="8" y="8" width="34" height="86" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="46" y="8" width="34" height="40" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="46" y="54" width="34" height="40" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="84" y="8" width="40" height="86" fill="#f1f5f9" stroke="#cbd5e1" />
          <rect x="128" y="8" width="30" height="40" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="128" y="54" width="30" height="40" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="162" y="8" width="30" height="86" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="8" y="98" width="88" height="34" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="100" y="98" width="92" height="34" fill="#f8fafc" stroke="#cbd5e1" />
        </svg>
      );
    case 'landscape-map':
    case 'brand-positioning-map':
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <line x1="20" y1="70" x2="180" y2="70" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="100" y1="15" x2="100" y2="125" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="62" cy="45" r="9" fill="#e2e8f0" stroke="#94a3b8" />
          <circle cx="144" cy="40" r="12" fill="#cbd5e1" stroke="#64748b" />
          <circle cx="132" cy="96" r="7" fill="#f1f5f9" stroke="#94a3b8" />
          <circle cx="58" cy="100" r="6" fill="#f8fafc" stroke="#cbd5e1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect width="200" height="140" fill="#fff" />
          <rect x="16" y="16" width="168" height="22" fill="#f1f5f9" stroke="#e2e8f0" />
          <rect x="16" y="46" width="80" height="36" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="104" y="46" width="80" height="36" fill="#f8fafc" stroke="#e2e8f0" />
          <rect x="16" y="90" width="168" height="34" fill="#fff" stroke="#e2e8f0" />
          <rect x="26" y="25" width="60" height="4" rx="1" fill="#cbd5e1" />
          <rect x="26" y="102" width="110" height="3" rx="1" fill="#e2e8f0" />
          <rect x="26" y="110" width="80" height="3" rx="1" fill="#f1f5f9" />
        </svg>
      );
  }
}
