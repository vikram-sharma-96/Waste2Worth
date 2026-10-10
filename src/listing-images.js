/**
 * Dedicated vector image assets created strictly for each listing's text title box.
 * Only depicts the item named in the title box—no extraneous elements, clutter, or unrelated objects.
 */

function svgToDataUrl(svgString) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svgString.trim());
}

// 1. Terrano 600x600 matte white floor tiles & Vitrified tiles
const SVG_MATTE_WHITE_TILES = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgTiles" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="tileShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgTiles)"/>
  <g transform="translate(105, 34)" filter="url(#tileShadow)">
    <rect x="14" y="20" width="176" height="176" rx="6" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1.5"/>
    <rect x="7" y="10" width="176" height="176" rx="6" fill="#E5E7EB" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="0" y="0" width="176" height="176" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="88" y1="0" x2="88" y2="176" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="4 2"/>
    <line x1="0" y1="88" x2="176" y2="88" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="4 2"/>
    <rect x="86" y="86" width="4" height="4" fill="#3B82F6" rx="1"/>
    <rect x="5" y="5" width="166" height="166" rx="4" fill="none" stroke="#F1F5F9" stroke-width="2"/>
    <rect x="18" y="132" width="140" height="26" rx="4" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
    <text x="88" y="149" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#334155" text-anchor="middle" letter-spacing="0.5">600 × 600 mm · MATTE</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-125" y="-14" width="250" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">TERRANO 600×600 TILES</text>
  </g>
</svg>
`);

// 2. Vitrified tiles 600x600 (batch B24-117)
const SVG_VITRIFIED_TILES = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgVit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="vitShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgVit)"/>
  <g transform="translate(105, 34)" filter="url(#vitShadow)">
    <rect x="12" y="18" width="176" height="176" rx="6" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1.5"/>
    <rect x="6" y="9" width="176" height="176" rx="6" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="0" y="0" width="176" height="176" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="88" y1="0" x2="88" y2="176" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3 2"/>
    <line x1="0" y1="88" x2="176" y2="88" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="3 2"/>
    <rect x="18" y="132" width="140" height="26" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="88" y="149" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#334155" text-anchor="middle" letter-spacing="0.5">VITRIFIED · 600 × 600 mm</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-135" y="-14" width="270" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">MATTE WHITE VITRIFIED TILES</text>
  </g>
</svg>
`);

// 3. Office laptops, i5 8th gen, 8 GB RAM
const SVG_OFFICE_LAPTOPS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgLap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="screenLap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <filter id="lapShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgLap)"/>
  <g transform="translate(75, 40)" filter="url(#lapShadow)">
    <rect x="35" y="0" width="180" height="118" rx="8" fill="#1E293B" stroke="#334155" stroke-width="2"/>
    <rect x="42" y="7" width="166" height="104" rx="4" fill="url(#screenLap)"/>
    <circle cx="125" cy="12" r="2" fill="#64748B"/>
    <rect x="52" y="24" width="70" height="5" rx="2" fill="#38BDF8" fill-opacity="0.8"/>
    <rect x="52" y="34" width="146" height="2" rx="1" fill="#475569"/>
    <rect x="52" y="40" width="115" height="2" rx="1" fill="#475569"/>
    <rect x="52" y="46" width="85" height="2" rx="1" fill="#475569"/>
    <rect x="52" y="60" width="146" height="38" rx="4" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/>
    <text x="125" y="76" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#38BDF8" text-anchor="middle">Intel Core i5 · 8th Gen</text>
    <text x="125" y="90" font-family="system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#94A3B8" text-anchor="middle">8 GB RAM · 256 GB SSD</text>
    <polygon points="10,126 240,126 250,188 0,188" fill="#334155" stroke="#1E293B" stroke-width="2"/>
    <polygon points="32,130 218,130 226,160 24,160" fill="#0F172A"/>
    <line x1="28" y1="137" x2="222" y2="137" stroke="#334155" stroke-width="1"/>
    <line x1="26" y1="145" x2="224" y2="145" stroke="#334155" stroke-width="1"/>
    <line x1="25" y1="153" x2="225" y2="153" stroke="#334155" stroke-width="1"/>
    <rect x="100" y="165" width="50" height="18" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1"/>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-135" y="-14" width="270" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">OFFICE LAPTOPS · i5 8TH GEN</text>
  </g>
</svg>
`);

// 4. Dead 22-inch monitors
const SVG_MONITORS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgMon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="monShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgMon)"/>
  <g transform="translate(85, 35)" filter="url(#monShadow)">
    <ellipse cx="115" cy="195" rx="55" ry="14" fill="#334155" stroke="#1E293B" stroke-width="2"/>
    <polygon points="105,140 125,140 122,192 108,192" fill="#475569" stroke="#1E293B" stroke-width="1.5"/>
    <rect x="0" y="0" width="230" height="145" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2.5"/>
    <rect x="8" y="8" width="214" height="129" rx="3" fill="#090D16"/>
    <rect x="18" y="18" width="194" height="109" rx="2" fill="#0F172A"/>
    <rect x="55" y="52" width="120" height="40" rx="6" fill="#17171C" stroke="#475569" stroke-width="1.5"/>
    <text x="115" y="70" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#F8FAFC" text-anchor="middle">22″ MONITOR</text>
    <text x="115" y="84" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle">1920 × 1080 · 60Hz</text>
    <circle cx="218" cy="138" r="2.5" fill="#EF4444"/>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-120" y="-14" width="240" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">DEAD 22-INCH MONITORS</text>
  </g>
</svg>
`);

// 5. Oversized cotton hoodie, misprinted logo
const SVG_HOODIE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgH" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="hShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#1E293B" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgH)"/>
  <g transform="translate(100, 25)" filter="url(#hShadow)">
    <path d="M 65 30 C 65 0, 135 0, 135 30 C 135 48, 65 48, 65 30 Z" fill="#334155" stroke="#1E293B" stroke-width="2"/>
    <path d="M 80 32 C 80 14, 120 14, 120 32 Z" fill="#1E293B"/>
    <path d="M 88 38 Q 86 65 82 85" stroke="#F1F5F9" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M 112 38 Q 114 65 118 85" stroke="#F1F5F9" stroke-width="3" stroke-linecap="round" fill="none"/>
    <polygon points="65,30 5,75 25,120 60,95" fill="#3B4A5E" stroke="#1E293B" stroke-width="2"/>
    <polygon points="135,30 195,75 175,120 140,95" fill="#3B4A5E" stroke="#1E293B" stroke-width="2"/>
    <path d="M 55 35 L 145 35 L 155 180 L 45 180 Z" fill="#475569" stroke="#1E293B" stroke-width="2.5"/>
    <path d="M 65 125 L 135 125 L 145 168 L 55 168 Z" fill="#334155" stroke="#1E293B" stroke-width="2"/>
    <rect x="43" y="178" width="114" height="16" rx="2" fill="#334155" stroke="#1E293B" stroke-width="2"/>
    <g transform="translate(100, 75) rotate(-6)">
      <rect x="-24" y="-14" width="48" height="28" rx="4" fill="#E2E8F0" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="0" y="4" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#EF4444" text-anchor="middle">MISPRINT</text>
    </g>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-135" y="-14" width="270" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">OVERSIZED COTTON HOODIE</text>
  </g>
</svg>
`);

// 6. Cotton fleece off-cuts, mixed pastels
const SVG_FABRIC_OFFCUTS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgF" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FDF4FF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <filter id="fShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#475569" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgF)"/>
  <g transform="translate(80, 45)" filter="url(#fShadow)">
    <rect x="10" y="130" width="220" height="36" rx="8" fill="#FEF08A" stroke="#EAB308" stroke-width="2"/>
    <ellipse cx="220" cy="148" rx="8" ry="17" fill="#FDE047"/>
    <rect x="20" y="96" width="200" height="36" rx="8" fill="#A7F3D0" stroke="#10B981" stroke-width="2"/>
    <ellipse cx="210" cy="114" rx="8" ry="17" fill="#6EE7B7"/>
    <rect x="30" y="62" width="180" height="36" rx="8" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
    <ellipse cx="200" cy="80" rx="8" ry="17" fill="#7DD3FC"/>
    <rect x="40" y="28" width="160" height="36" rx="8" fill="#FBCFE8" stroke="#DB2777" stroke-width="2"/>
    <ellipse cx="190" cy="46" rx="8" ry="17" fill="#F472B6"/>
    <line x1="120" y1="20" x2="120" y2="175" stroke="#78350F" stroke-width="4" stroke-dasharray="6 2"/>
    <rect x="100" y="172" width="90" height="22" rx="4" fill="#FFFFFF" stroke="#17171C" stroke-width="1.5"/>
    <text x="145" y="187" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#17171C" text-anchor="middle">100% COTTON</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-135" y="-14" width="270" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">COTTON FLEECE OFF-CUTS</text>
  </g>
</svg>
`);

// 7. TMT rebar off-cuts
const SVG_REBAR = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="steelRod" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="30%" stop-color="#94A3B8"/>
      <stop offset="70%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="rShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgR)"/>
  <g transform="translate(60, 48)" filter="url(#rShadow)">
    <g transform="translate(0, 110)">
      <rect x="20" y="0" width="240" height="22" rx="4" fill="url(#steelRod)" stroke="#1E293B" stroke-width="1.5"/>
      <ellipse cx="20" cy="11" rx="6" ry="11" fill="#CBD5E1" stroke="#1E293B" stroke-width="1.5"/>
      <line x1="45" y1="0" x2="52" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="85" y1="0" x2="92" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="125" y1="0" x2="132" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="165" y1="0" x2="172" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="205" y1="0" x2="212" y2="22" stroke="#1E293B" stroke-width="2.5"/>
    </g>
    <g transform="translate(15, 70)">
      <rect x="20" y="0" width="240" height="22" rx="4" fill="url(#steelRod)" stroke="#1E293B" stroke-width="1.5"/>
      <ellipse cx="20" cy="11" rx="6" ry="11" fill="#CBD5E1" stroke="#1E293B" stroke-width="1.5"/>
      <line x1="45" y1="0" x2="52" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="85" y1="0" x2="92" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="125" y1="0" x2="132" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="165" y1="0" x2="172" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="205" y1="0" x2="212" y2="22" stroke="#1E293B" stroke-width="2.5"/>
    </g>
    <g transform="translate(30, 30)">
      <rect x="20" y="0" width="240" height="22" rx="4" fill="url(#steelRod)" stroke="#1E293B" stroke-width="1.5"/>
      <ellipse cx="20" cy="11" rx="6" ry="11" fill="#CBD5E1" stroke="#1E293B" stroke-width="1.5"/>
      <line x1="45" y1="0" x2="52" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="85" y1="0" x2="92" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="125" y1="0" x2="132" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="165" y1="0" x2="172" y2="22" stroke="#1E293B" stroke-width="2.5"/>
      <line x1="205" y1="0" x2="212" y2="22" stroke="#1E293B" stroke-width="2.5"/>
    </g>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-120" y="-14" width="240" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">TMT REBAR STEEL OFF-CUTS</text>
  </g>
</svg>
`);

// 8. Mesh-back office chairs
const SVG_CHAIR = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgC" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="cShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgC)"/>
  <g transform="translate(130, 25)" filter="url(#cShadow)">
    <path d="M 20 20 C 20 0, 120 0, 120 20 L 115 110 C 115 125, 25 125, 25 110 Z" fill="#1E293B" stroke="#0F172A" stroke-width="2.5"/>
    <path d="M 28 25 C 28 8, 112 8, 112 25 L 108 105 C 108 116, 32 116, 32 105 Z" fill="#334155"/>
    <line x1="45" y1="20" x2="45" y2="110" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>
    <line x1="70" y1="12" x2="70" y2="112" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>
    <line x1="95" y1="20" x2="95" y2="110" stroke="#475569" stroke-width="1" stroke-dasharray="2 2"/>
    <rect x="35" y="80" width="70" height="12" rx="4" fill="#0F172A"/>
    <path d="M 10 70 L 10 100 L 25 110" stroke="#0F172A" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M 130 70 L 130 100 L 115 110" stroke="#0F172A" stroke-width="5" stroke-linecap="round" fill="none"/>
    <rect x="0" y="65" width="22" height="6" rx="3" fill="#334155"/>
    <rect x="118" y="65" width="22" height="6" rx="3" fill="#334155"/>
    <ellipse cx="70" cy="125" rx="55" ry="16" fill="#0F172A" stroke="#1E293B" stroke-width="2"/>
    <ellipse cx="70" cy="122" rx="50" ry="13" fill="#1E293B"/>
    <rect x="66" y="135" width="8" height="40" fill="#94A3B8" stroke="#475569" stroke-width="1"/>
    <ellipse cx="70" cy="178" rx="14" ry="6" fill="#0F172A"/>
    <line x1="70" y1="175" x2="15" y2="195" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="175" x2="125" y2="195" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <line x1="70" y1="175" x2="70" y2="200" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="15" cy="198" r="4" fill="#334155"/>
    <circle cx="70" cy="203" r="4" fill="#334155"/>
    <circle cx="125" cy="198" r="4" fill="#334155"/>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-125" y="-14" width="250" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">MESH-BACK OFFICE CHAIRS</text>
  </g>
</svg>
`);

// 9. Kids' clothes, ages 4-7
const SVG_KIDS = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FEFCE8"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <filter id="kShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#475569" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgK)"/>
  <g transform="translate(100, 35)" filter="url(#kShadow)">
    <rect x="25" y="110" width="150" height="70" rx="8" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
    <line x1="100" y1="130" x2="100" y2="180" stroke="#0284C7" stroke-width="2"/>
    <rect x="35" y="110" width="130" height="12" rx="4" fill="#0284C7"/>
    <rect x="15" y="25" width="170" height="95" rx="8" fill="#FACC15" stroke="#CA8A04" stroke-width="2.5"/>
    <path d="M 80 25 C 80 40, 120 40, 120 25 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
    <rect x="40" y="55" width="35" height="38" rx="4" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5"/>
    <circle cx="50" cy="70" r="2.5" fill="#854D0E"/>
    <circle cx="65" cy="70" r="2.5" fill="#854D0E"/>
    <path d="M 50 78 Q 57 85 65 78" stroke="#854D0E" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="110" y="80" width="60" height="22" rx="4" fill="#FFFFFF" stroke="#17171C" stroke-width="1.5"/>
    <text x="140" y="95" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#17171C" text-anchor="middle">AGES 4–7</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-120" y="-14" width="240" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">KIDS' CLOTHES, AGES 4–7</text>
  </g>
</svg>
`);

// 10. 40 plates veg biryani
const SVG_BIRYANI = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <filter id="bShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#78350F" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgB)"/>
  <g transform="translate(100, 30)" filter="url(#bShadow)">
    <ellipse cx="100" cy="180" rx="95" ry="24" fill="#92400E" stroke="#78350F" stroke-width="2"/>
    <path d="M 5 90 L 195 90 L 180 180 L 20 180 Z" fill="#D97706" stroke="#92400E" stroke-width="2"/>
    <ellipse cx="100" cy="90" rx="95" ry="32" fill="#F59E0B" stroke="#B45309" stroke-width="2.5"/>
    <ellipse cx="100" cy="90" rx="88" ry="28" fill="#FEF08A"/>
    <ellipse cx="70" cy="85" rx="16" ry="8" fill="#F97316"/>
    <ellipse cx="130" cy="95" rx="18" ry="9" fill="#EA580C"/>
    <ellipse cx="100" cy="75" rx="14" ry="7" fill="#F59E0B"/>
    <circle cx="65" cy="92" r="5" fill="#22C55E" stroke="#15803D" stroke-width="1"/>
    <circle cx="85" cy="82" r="5" fill="#22C55E" stroke="#15803D" stroke-width="1"/>
    <circle cx="115" cy="88" r="5" fill="#22C55E" stroke="#15803D" stroke-width="1"/>
    <circle cx="140" cy="82" r="5" fill="#22C55E" stroke="#15803D" stroke-width="1"/>
    <path d="M 95 86 C 90 76, 105 76, 105 86 Z" fill="#16A34A"/>
    <path d="M 105 86 C 100 76, 115 76, 115 86 Z" fill="#15803D"/>
    <rect x="-8" y="80" width="14" height="20" rx="4" fill="#78350F"/>
    <rect x="194" y="80" width="14" height="20" rx="4" fill="#78350F"/>
    <rect x="50" y="130" width="100" height="24" rx="12" fill="#FFFFFF" stroke="#17171C" stroke-width="1.5"/>
    <text x="100" y="146" font-family="system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#17171C" text-anchor="middle">40 PLATES</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-125" y="-14" width="250" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">40 PLATES VEG BIRYANI</text>
  </g>
</svg>
`);

// 11. 25 plates dal rice
const SVG_DAL_RICE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgD" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FEFCE8"/>
      <stop offset="100%" stop-color="#FEF08A"/>
    </linearGradient>
    <filter id="dShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#78350F" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgD)"/>
  <g transform="translate(80, 40)" filter="url(#dShadow)">
    <ellipse cx="120" cy="110" rx="115" ry="75" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3"/>
    <ellipse cx="120" cy="108" rx="105" ry="67" fill="#CBD5E1"/>
    <path d="M 25 105 C 25 65, 115 65, 115 105 C 115 145, 25 145, 25 105 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="1.5"/>
    <ellipse cx="70" cy="105" rx="35" ry="25" fill="#FACC15"/>
    <circle cx="55" cy="98" r="1.5" fill="#451A03"/>
    <circle cx="68" cy="102" r="1.5" fill="#451A03"/>
    <circle cx="82" cy="95" r="1.5" fill="#451A03"/>
    <circle cx="75" cy="115" r="1.5" fill="#451A03"/>
    <path d="M 60 108 Q 70 100 80 110" stroke="#EF4444" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M 70 95 C 65 90, 75 88, 72 98 Z" fill="#16A34A"/>
    <path d="M 125 105 C 125 65, 215 65, 215 105 C 215 145, 125 145, 125 105 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <ellipse cx="170" cy="105" rx="35" ry="25" fill="#F8FAFC"/>
    <line x1="150" y1="95" x2="158" y2="95" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="165" y1="102" x2="173" y2="102" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="180" y1="92" x2="188" y2="92" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="120" y1="42" x2="120" y2="172" stroke="#94A3B8" stroke-width="2"/>
    <rect x="70" y="160" width="100" height="24" rx="12" fill="#FFFFFF" stroke="#17171C" stroke-width="1.5"/>
    <text x="120" y="176" font-family="system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#17171C" text-anchor="middle">25 PLATES</text>
  </g>
  <g transform="translate(200, 260)">
    <rect x="-120" y="-14" width="240" height="26" rx="13" fill="#17171C" fill-opacity="0.92"/>
    <text x="0" y="3" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">25 PLATES DAL RICE</text>
  </g>
</svg>
`);

// 12. Generic / custom fallback matching any specific title
function generateTitleSpecificSvg(title, category = "") {
  const cleanTitle = (title || "Waste Lot").toUpperCase().slice(0, 30);
  const isWood = /wood|timber|plywood|plank|log/i.test(title);
  const isMetal = /metal|steel|iron|aluminium|copper|scrap/i.test(title);
  const isFabric = /fabric|cloth|cotton|garment|textile/i.test(title);

  const primaryColor = isWood ? "#B45309" : isMetal ? "#475569" : isFabric ? "#0284C7" : "#5F7F14";
  const lightColor = isWood ? "#FEF3C7" : isMetal ? "#F1F5F9" : isFabric ? "#E0F2FE" : "#F4F7EA";

  return svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${lightColor}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <filter id="genShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bgGen)"/>
  <g transform="translate(100, 45)" filter="url(#genShadow)">
    <rect x="0" y="0" width="200" height="150" rx="12" fill="#FFFFFF" stroke="${primaryColor}" stroke-width="2.5"/>
    <rect x="12" y="12" width="176" height="126" rx="8" fill="${lightColor}"/>
    <circle cx="100" cy="75" r="32" fill="${primaryColor}" fill-opacity="0.15"/>
    <rect x="40" y="62" width="120" height="26" rx="6" fill="${primaryColor}"/>
    <text x="100" y="79" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${category ? category.toUpperCase() : "VERIFIED LOT"}</text>
  </g>
  <g transform="translate(200, 255)">
    <rect x="-140" y="-14" width="280" height="28" rx="14" fill="#17171C" fill-opacity="0.94"/>
    <text x="0" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">${cleanTitle}</text>
  </g>
</svg>
`);
}

/**
 * Returns an authentic vector SVG data URL created ONLY for the item in the title box.
 * Strictly adheres to: "create images only related to their text title box don't add anything out of title box".
 */
export function getImageForListing(title = "", category = "", shotType = "full_lot") {
  const t = (title || "").toLowerCase();

  // 1. Terrano tiles & vitrified floor tiles
  if (t.includes("terrano") && t.includes("arctic")) return SVG_MATTE_WHITE_TILES;
  if (t.includes("terrano") || (t.includes("600x600") && t.includes("floor"))) return SVG_MATTE_WHITE_TILES;
  if (t.includes("vitrified") || (t.includes("tile") && t.includes("matte"))) return SVG_VITRIFIED_TILES;
  if (t.includes("tile") || category === "tiles") return SVG_MATTE_WHITE_TILES;

  // 2. Office laptops
  if (t.includes("laptop") || t.includes("thinkpad") || t.includes("notebook")) return SVG_OFFICE_LAPTOPS;

  // 3. Monitors & screens
  if (t.includes("monitor") || t.includes("screen") || t.includes("22-inch")) return SVG_MONITORS;

  // 4. Oversized cotton hoodie
  if (t.includes("hoodie") || t.includes("misprinted")) return SVG_HOODIE;

  // 5. Cotton fleece off-cuts
  if (t.includes("fleece") || t.includes("off-cut") && t.includes("cotton")) return SVG_FABRIC_OFFCUTS;
  if (t.includes("pastel") || (category === "fabric" && t.includes("off-cut"))) return SVG_FABRIC_OFFCUTS;

  // 6. TMT rebar steel off-cuts
  if (t.includes("rebar") || (t.includes("tmt") || (category === "metal" && t.includes("off-cut")))) return SVG_REBAR;
  if (category === "metal" || t.includes("steel")) return SVG_REBAR;

  // 7. Mesh-back office chairs
  if (t.includes("chair") || t.includes("mesh-back") || category === "furniture") return SVG_CHAIR;

  // 8. Kids' clothes
  if (t.includes("kid") || t.includes("children") || (category === "clothing" && t.includes("4-7"))) return SVG_KIDS;
  if (category === "clothing") return SVG_HOODIE;

  // 9. 40 plates veg biryani
  if (t.includes("biryani")) return SVG_BIRYANI;

  // 10. 25 plates dal rice
  if (t.includes("dal") || t.includes("rice") || t.includes("curry") || category === "food_cooked") return SVG_DAL_RICE;

  return generateTitleSpecificSvg(title, category);
}
