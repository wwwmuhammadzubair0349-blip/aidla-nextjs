/* career/cv/cvRenderer.js
   ----------------------------------------------------------------
   UNIVERSAL PREMIUM CV RENDERER (VIP EDITION)
   - 17 Templates: 7 original + 10 new Enhancv-inspired ATS designs
   - Data-driven Zone Layout Engine
   - Thumbnail lives inside template object
   - Add template once here -> shows automatically in Templates tab
   - Perfect Object-Fit Clipping for Photos (Circles/Squares)
   - ALL user fields rendered
   ---------------------------------------------------------------- */

const THUMBS = {
  /* ── Original 7 ── */
  modernStack: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="4" fill="${c}"/>
    <rect x="8" y="10" width="28" height="4" rx="2" fill="#0f172a"/>
    <rect x="8" y="17" width="18" height="2" rx="1" fill="${c}"/>
    <circle cx="46" cy="15" r="8" fill="${c}" opacity="0.15"/>
    <rect x="8" y="30" width="46" height="1" fill="#e2e8f0"/>
    <rect x="8" y="36" width="20" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="42" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="46" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="56" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="62" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,
  pureWhite: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="25" y="8" width="12" height="12" rx="3" fill="#e5e7eb"/>
    <rect x="11" y="24" width="40" height="3" rx="1.5" fill="#0f172a"/>
    <rect x="19" y="30" width="24" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="42" width="46" height="1" fill="#e2e8f0"/>
    <rect x="23" y="48" width="16" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="15" y="54" width="32" height="1" rx="0.5" fill="#94a3b8"/>
  `,
  swissClean: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="20" height="82" fill="#f8fafc"/>
    <rect x="19" y="0" width="1" height="82" fill="#e2e8f0"/>
    <rect x="4" y="8" width="12" height="12" rx="2" fill="#e2e8f0"/>
    <rect x="26" y="8" width="26" height="4" rx="1" fill="#0f172a"/>
    <rect x="26" y="16" width="14" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="26" y="30" width="18" height="2" rx="1" fill="#0f172a"/>
    <rect x="26" y="36" width="28" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="26" y="41" width="22" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,
  inkLine: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="8" y="10" width="26" height="3" rx="1" fill="#0f172a"/>
    <circle cx="48" cy="14" r="7" fill="#e5e7eb"/>
    <rect x="8" y="26" width="46" height="1" fill="#e2e8f0"/>
    <rect x="8" y="34" width="2" height="12" fill="${c}"/>
    <rect x="14" y="34" width="16" height="1.5" fill="#0f172a"/>
    <rect x="14" y="39" width="36" height="1.5" fill="#e2e8f0"/>
    <rect x="14" y="44" width="30" height="1.5" fill="#e2e8f0"/>
  `,
  sidebarDark: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="22" height="82" fill="#0f172a"/>
    <circle cx="11" cy="14" r="6" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
    <rect x="5" y="26" width="12" height="1.5" rx="0.5" fill="rgba(255,255,255,0.8)"/>
    <rect x="5" y="30" width="8" height="1" rx="0.5" fill="${c}"/>
    <rect x="28" y="10" width="24" height="3" rx="1" fill="#0f172a"/>
    <rect x="28" y="24" width="16" height="1.5" rx="0.5" fill="#0f172a"/>
    <rect x="28" y="30" width="26" height="1.5" rx="0.5" fill="#e2e8f0"/>
    <rect x="28" y="35" width="20" height="1.5" rx="0.5" fill="#e2e8f0"/>
  `,
  gulfPremium: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="6" fill="${c}"/>
    <rect x="8" y="14" width="28" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="21" width="16" height="1.5" rx="0.75" fill="#94a3b8"/>
    <circle cx="48" cy="18" r="8" fill="#f1f5f9"/>
    <rect x="8" y="34" width="24" height="1.5" fill="${c}"/>
    <rect x="8" y="40" width="26" height="1.5" rx="0.5" fill="#e2e8f0"/>
    <rect x="38" y="34" width="16" height="1.5" fill="${c}"/>
    <rect x="38" y="40" width="16" height="1.5" rx="0.5" fill="#e2e8f0"/>
  `,
  infographic: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="24" height="82" fill="#f8fafc"/>
    <rect x="0" y="0" width="24" height="28" fill="${c}"/>
    <rect x="4" y="6" width="16" height="16" rx="4" fill="rgba(255,255,255,0.2)"/>
    <rect x="4" y="36" width="16" height="4" rx="1" fill="#fff" stroke="#e2e8f0" stroke-width="0.5"/>
    <rect x="4" y="42" width="16" height="4" rx="1" fill="#fff" stroke="#e2e8f0" stroke-width="0.5"/>
    <rect x="30" y="10" width="24" height="3" rx="1.5" fill="#0f172a"/>
    <rect x="30" y="24" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="30" y="30" width="24" height="1.5" rx="0.5" fill="#e2e8f0"/>
    <rect x="30" y="35" width="18" height="1.5" rx="0.5" fill="#e2e8f0"/>
  `,

  /* ── 10 New Templates ── */

  // 1. Diamond — centered, single column
  diamond: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="2" fill="${c}"/>
    <rect x="0" y="80" width="62" height="2" fill="${c}"/>
    <rect x="22" y="8" width="18" height="18" rx="9" fill="#f1f5f9"/>
    <rect x="10" y="30" width="42" height="3" rx="1.5" fill="#0f172a"/>
    <rect x="18" y="36" width="26" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="44" width="46" height="0.75" fill="#e2e8f0"/>
    <rect x="8" y="50" width="14" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="55" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="59" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="67" width="14" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="72" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 2. Ivy League — classic two-col academic
  ivyLeague: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="8" y="8" width="30" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="15" width="18" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="20" width="26" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="8" y="28" width="46" height="0.75" fill="#0f172a"/>
    <rect x="8" y="34" width="26" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="39" width="26" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="43" width="26" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="38" y="34" width="16" height="2" rx="1" fill="${c}"/>
    <rect x="38" y="39" width="16" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="38" y="43" width="16" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="38" y="50" width="16" height="2" rx="1" fill="${c}"/>
    <rect x="38" y="55" width="16" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 3. Double Column — balanced modern
  doubleCol: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="20" fill="${c}"/>
    <rect x="8" y="6" width="28" height="4" rx="1" fill="#fff"/>
    <rect x="8" y="13" width="16" height="1.5" rx="0.75" fill="rgba(255,255,255,0.7)"/>
    <circle cx="50" cy="12" r="6" fill="rgba(255,255,255,0.2)"/>
    <rect x="8" y="26" width="24" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="31" width="24" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="35" width="24" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="35" y="26" width="19" height="2" rx="1" fill="#0f172a"/>
    <rect x="35" y="31" width="19" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="35" y="35" width="14" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="45" width="24" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="50" width="24" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="35" y="45" width="19" height="2" rx="1" fill="${c}" opacity="0.8"/>
    <rect x="35" y="50" width="14" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 4. Navy Executive — left navy bar
  navyExec: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="5" height="82" fill="#0b1437"/>
    <rect x="10" y="8" width="32" height="4" rx="1" fill="#0f172a"/>
    <rect x="10" y="16" width="20" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="10" y="21" width="28" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="10" y="30" width="44" height="0.75" fill="#e2e8f0"/>
    <rect x="10" y="36" width="18" height="2" rx="1" fill="#0f172a"/>
    <rect x="10" y="41" width="44" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="10" y="45" width="36" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="10" y="55" width="18" height="2" rx="1" fill="#0f172a"/>
    <rect x="10" y="60" width="44" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="10" y="64" width="30" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 5. Timeline Pro — timeline dots
  timelinePro: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="8" y="8" width="30" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="15" width="20" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="24" width="46" height="0.75" fill="#e2e8f0"/>
    <rect x="8" y="30" width="14" height="2" rx="1" fill="#0f172a"/>
    <line x1="14" y1="37" x2="14" y2="70" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="14" cy="37" r="2.5" fill="${c}"/>
    <rect x="20" y="35" width="22" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="20" y="39" width="30" height="1" rx="0.5" fill="#e2e8f0"/>
    <circle cx="14" cy="50" r="2.5" fill="${c}" opacity="0.5"/>
    <rect x="20" y="48" width="22" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="20" y="52" width="30" height="1" rx="0.5" fill="#e2e8f0"/>
    <circle cx="14" cy="63" r="2.5" fill="${c}" opacity="0.3"/>
    <rect x="20" y="61" width="22" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="20" y="65" width="26" height="1" rx="0.5" fill="#e2e8f0"/>
  `,

  // 6. Coral Modern — warm accent top bar + single col
  coralModern: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="22" fill="${c}" opacity="0.12"/>
    <rect x="0" y="0" width="62" height="3" fill="${c}"/>
    <rect x="8" y="8" width="28" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="15" width="18" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="29" width="46" height="0.75" fill="#e2e8f0"/>
    <rect x="8" y="35" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="41" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="45" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="55" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="61" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="65" width="32" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="72" width="22" height="3" rx="1.5" fill="${c}" opacity="0.15"/>
    <rect x="32" y="72" width="14" height="3" rx="1.5" fill="${c}" opacity="0.15"/>
  `,

  // 7. Slate Pro — dark full header band
  slatePro: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="28" fill="#1e293b"/>
    <rect x="8" y="7" width="28" height="4" rx="1" fill="#fff"/>
    <rect x="8" y="14" width="16" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="19" width="30" height="1" rx="0.5" fill="rgba(255,255,255,0.3)"/>
    <circle cx="50" cy="14" r="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <rect x="8" y="35" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="41" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="45" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="55" width="16" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="61" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="65" width="28" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 8. Compact ATS — ultra clean single col
  compactAts: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="8" y="8" width="34" height="5" rx="1" fill="#0f172a"/>
    <rect x="8" y="16" width="20" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="8" y="20" width="46" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="8" y="27" width="46" height="0.5" fill="#0f172a"/>
    <rect x="8" y="31" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="8" y="35" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="39" width="40" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="46" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="8" y="50" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="54" width="36" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="61" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="8" y="65" width="20" height="2" rx="1" fill="${c}" opacity="0.15"/>
    <rect x="30" y="65" width="14" height="2" rx="1" fill="${c}" opacity="0.15"/>
  `,

  // 9. Bold Header — huge name, minimal body
  boldHeader: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="32" fill="#f8fafc"/>
    <rect x="4" y="8" width="54" height="6" rx="1" fill="#0f172a"/>
    <rect x="4" y="17" width="30" height="2" rx="1" fill="${c}"/>
    <rect x="4" y="22" width="54" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="4" y="38" width="3" height="14" rx="1" fill="${c}"/>
    <rect x="10" y="38" width="18" height="2" rx="1" fill="#0f172a"/>
    <rect x="10" y="43" width="44" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="10" y="47" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="4" y="58" width="3" height="14" rx="1" fill="${c}" opacity="0.5"/>
    <rect x="10" y="58" width="18" height="2" rx="1" fill="#0f172a"/>
    <rect x="10" y="63" width="44" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="10" y="67" width="32" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  // 10. Dubai Pro — Gulf two-col right sidebar skills
  dubaiPro: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="5" fill="${c}"/>
    <rect x="0" y="5" width="62" height="18" fill="#f8fafc"/>
    <rect x="8" y="9" width="26" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="16" width="14" height="1.5" rx="0.75" fill="${c}"/>
    <circle cx="50" cy="14" r="7" fill="#e2e8f0"/>
    <rect x="8" y="28" width="33" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="33" width="33" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="37" width="33" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="44" width="33" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="49" width="33" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="53" width="33" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="44" y="28" width="14" height="2" rx="1" fill="${c}"/>
    <rect x="44" y="33" width="14" height="2" rx="1" fill="#e2e8f0"/>
    <rect x="44" y="37" width="14" height="2" rx="1" fill="#e2e8f0"/>
    <rect x="44" y="42" width="14" height="2" rx="1" fill="#e2e8f0"/>
    <rect x="44" y="47" width="14" height="2" rx="1" fill="${c}" opacity="0.4"/>
    <rect x="44" y="52" width="14" height="2" rx="1" fill="#e2e8f0"/>
  `,
};

export const PREMIUM_TEMPLATES = [
  /* ── Original 7 ── */
  { id: 'modern-stack', l: 'Modern Stack',       cat: 'Corporate',  thumb: THUMBS.modernStack  },
  { id: 'pure-white',   l: 'Pure White',          cat: 'Minimal',    thumb: THUMBS.pureWhite    },
  { id: 'swiss-clean',  l: 'Swiss Clean',         cat: 'Corporate',  thumb: THUMBS.swissClean   },
  { id: 'ink-line',     l: 'Ink Line',            cat: 'Minimal',    thumb: THUMBS.inkLine      },
  { id: 'sidebar-dark', l: 'Sidebar Dark',        cat: 'Executive',  thumb: THUMBS.sidebarDark  },
  { id: 'gulf-premium', l: 'Gulf Premium',        cat: 'Premium',    thumb: THUMBS.gulfPremium  },
  { id: 'infographic',  l: 'Infographic Split',   cat: 'Creative',   thumb: THUMBS.infographic  },

  /* ── 10 New Enhancv-inspired ── */
  { id: 'diamond',      l: 'Diamond',             cat: 'Minimal',    thumb: THUMBS.diamond      },
  { id: 'ivy-league',   l: 'Ivy League',          cat: 'Academic',   thumb: THUMBS.ivyLeague    },
  { id: 'double-col',   l: 'Double Column',       cat: 'Corporate',  thumb: THUMBS.doubleCol    },
  { id: 'navy-exec',    l: 'Navy Executive',      cat: 'Executive',  thumb: THUMBS.navyExec     },
  { id: 'timeline-pro', l: 'Timeline Pro',        cat: 'Corporate',  thumb: THUMBS.timelinePro  },
  { id: 'coral-modern', l: 'Coral Modern',        cat: 'Creative',   thumb: THUMBS.coralModern  },
  { id: 'slate-pro',    l: 'Slate Pro',           cat: 'Executive',  thumb: THUMBS.slatePro     },
  { id: 'compact-ats',  l: 'Compact ATS',         cat: 'Minimal',    thumb: THUMBS.compactAts   },
  { id: 'bold-header',  l: 'Bold Header',         cat: 'Premium',    thumb: THUMBS.boldHeader   },
  { id: 'dubai-pro',    l: 'Dubai Pro',           cat: 'Premium',    thumb: THUMBS.dubaiPro     },
];

export const PREMIUM_CATS = ['All', ...new Set(PREMIUM_TEMPLATES.map(t => t.cat))];

/* ================================================================
   BUILT-IN LAYOUT CONFIGURATIONS
================================================================ */
const BUILT_IN_LAYOUTS = {
  /* Original 7 */
  'modern-stack': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'pure-white': {
    header: ['photo', 'profile'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs']
  },
  'swiss-clean': {
    sidebar: ['photo', 'profile', 'skills', 'langs', 'certs'],
    main: ['summary', 'exp', 'edu', 'projects', 'awards', 'refs', 'hobbies']
  },
  'ink-line': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards']
  },
  'sidebar-dark': {
    sidebar: ['photo', 'profile', 'skills', 'langs'],
    main: ['summary', 'exp', 'edu', 'projects', 'certs', 'awards', 'refs', 'hobbies']
  },
  'gulf-premium': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects'],
    right: ['skills', 'certs', 'langs', 'awards', 'refs']
  },
  'infographic': {
    sidebar: [
      '<div class="cv-info-card">', 'photo', 'profile', '</div>',
      '<div class="cv-info-pad">', 'skills', 'langs', '</div>'
    ],
    main: ['summary', 'exp', 'edu', 'projects', 'certs', 'awards', 'refs']
  },

  /* New 10 */
  'diamond': {
    header: ['photo', 'profile'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'ivy-league': {
    header: ['profile'],
    main: ['summary', 'exp', 'edu', 'projects', 'awards'],
    right: ['skills', 'certs', 'langs', 'refs', 'hobbies']
  },
  'double-col': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects'],
    right: ['skills', 'langs', 'certs', 'awards', 'refs', 'hobbies']
  },
  'navy-exec': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'timeline-pro': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs']
  },
  'coral-modern': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'slate-pro': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects'],
    right: ['skills', 'langs', 'certs', 'awards', 'refs', 'hobbies']
  },
  'compact-ats': {
    header: ['profile'],
    main: ['summary', 'exp', 'edu', 'skills', 'projects', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'bold-header': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'refs', 'hobbies']
  },
  'dubai-pro': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'awards'],
    right: ['skills', 'langs', 'certs', 'refs', 'hobbies']
  },
};

/* ================================================================
   BUILT-IN TEMPLATE CSS
================================================================ */
const BUILT_IN_CSS = {
  /* ── Original 7 (unchanged) ── */
  'modern-stack': `
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid var(--ac); padding-bottom: 20px; margin-bottom: 24px; }
    .cv-profile-text { flex: 1; padding-right: 20px; }
    .cv-photo-wrapper { width: 95px; height: 95px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.15); }
    .cv-sec-title { border-bottom: 1.5px solid rgba(var(--ac-rgb), 0.2); padding-bottom: 6px; margin-bottom: 14px; color: var(--text); page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
  `,
  'pure-white': `
    .cv-doc { padding: 45px; }
    .cv-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-bottom: 35px; }
    .cv-contact-row { justify-content: center; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .cv-sec-title { text-align: center; letter-spacing: 0.2em; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 20px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-item-header { flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .cv-item-date { text-align: center; }
  `,
  'swiss-clean': `
    .cv-doc { padding: 0; }
    .cv-body { display: block; }
    .cv-body::after { content: ""; display: table; clear: both; }
    .cv-sidebar { float: left; width: 260px; box-sizing: border-box; background: #f8fafc; padding: 35px 25px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); border-bottom-right-radius: 24px; margin: 0 35px 20px 0; min-height: 92vh; }
    .cv-main { display: block; padding: 35px; }
    .cv-photo-wrapper { width: 140px; height: 140px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 6px 16px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.05); }
    .cv-name { font-size: 2.2em; color: var(--text); }
    .cv-role { color: var(--ac); }
    .cv-contact-row { flex-direction: column; gap: 10px; margin-top: 15px; }
    .cv-sidebar .cv-sec-title { margin-top: 30px; font-size: 0.85em; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); width: 100%; border-radius: 6px; padding: 8px 12px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
  `,
  'ink-line': `
    .cv-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 25px; margin-bottom: 25px; }
    .cv-name { font-weight: 300; letter-spacing: -0.02em; }
    .cv-photo-wrapper { width: 85px; height: 85px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .cv-sec-title { color: var(--ac); display: flex; align-items: center; gap: 10px; margin-bottom: 16px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title::after { content: ""; flex: 1; height: 1px; background: var(--line); }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-section { border-left: 2px solid rgba(var(--ac-rgb), 0.2); padding-left: 18px; margin-left: 4px; }
  `,
  'sidebar-dark': `
    .cv-doc { padding: 0; background: #ffffff; }
    .cv-body { display: block; }
    .cv-body::after { content: ""; display: table; clear: both; }
    .cv-sidebar { float: left; width: 260px; box-sizing: border-box; background: #0b1120; color: #f8fafc; padding: 35px 25px; margin: 0 35px 25px 0; border-bottom-right-radius: 32px; min-height: 92vh; }
    .cv-main { display: block; padding: 35px; }
    .cv-photo-wrapper { width: 120px; height: 120px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.15); margin-bottom: 25px; }
    .cv-name { color: #ffffff; font-size: 2em; }
    .cv-role { color: var(--ac); filter: brightness(1.3); }
    .cv-contact-row { flex-direction: column; gap: 12px; margin-top: 20px; color: #94a3b8; }
    .cv-sidebar .cv-sec-title { color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); margin-top: 35px; }
    .cv-skills-list li { background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.05); }
    .cv-lang-name { color: #cbd5e1; }
    .cv-lang-bar { background: rgba(255,255,255,0.1); }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
  `,
  'gulf-premium': `
    .cv-doc { border-top: 16px solid var(--ac); padding-top: 30px; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px; }
    .cv-name { font-size: 2.6em; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
    .cv-role { font-weight: 600; color: var(--muted); letter-spacing: 0.15em; }
    .cv-photo-wrapper { width: 100px; height: 100px; border-radius: 50%; box-shadow: 0 10px 25px rgba(var(--ac-rgb), 0.2); border: 2px solid #fff; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 230px; gap: 40px; }
    .cv-sec-title { font-weight: 800; color: var(--ac); border-bottom: 2px solid rgba(var(--ac-rgb), 0.1); padding-bottom: 6px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 20px; border-left: 1px solid rgba(var(--ac-rgb), 0.2); }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: var(--ac); box-shadow: 0 0 0 3px rgba(var(--ac-rgb), 0.2); }
  `,
  'infographic': `
    .cv-doc { padding: 0; }
    .cv-body { display: block; }
    .cv-body::after { content: ""; display: table; clear: both; }
    .cv-sidebar { float: left; width: 280px; box-sizing: border-box; background: #f8fafc; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); border-bottom-right-radius: 40px; margin: 0 35px 25px 0; padding-bottom: 20px; min-height: 92vh; }
    .cv-main { display: block; padding: 35px; }
    .cv-info-card { background: var(--ac); color: #ffffff; padding: 40px 25px 30px; border-bottom-right-radius: 40px; box-shadow: 0 15px 30px rgba(var(--ac-rgb), 0.15); margin-bottom: 25px; }
    .cv-info-pad { padding: 0 25px 30px; }
    .cv-photo-wrapper { width: 110px; height: 110px; border-radius: 24px; border: 4px solid rgba(255,255,255,0.25); margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .cv-name { color: #ffffff; font-size: 2em; line-height: 1.1; }
    .cv-role { color: rgba(255,255,255,0.85); margin-top: 8px; font-size: 0.9em; }
    .cv-contact-row { flex-direction: column; gap: 12px; margin-top: 18px; color: rgba(255,255,255,0.9); }
    .cv-sec-title { font-weight: 900; letter-spacing: 0.1em; color: var(--text); page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-skills-list li { background: #ffffff; border: 1px solid var(--line); width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  `,

  /* ── 10 New Templates CSS ── */

  // 1. Diamond — centered, clean, single column
  'diamond': `
    .cv-doc { padding: 50px 55px; border-top: 2px solid var(--ac); border-bottom: 2px solid var(--ac); }
    .cv-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; margin-bottom: 32px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.2); box-shadow: 0 6px 18px rgba(var(--ac-rgb), 0.15); }
    .cv-name { font-size: 2.4em; font-weight: 900; letter-spacing: -0.03em; }
    .cv-role { color: var(--ac); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.9em; }
    .cv-contact-row { justify-content: center; }
    .cv-sec-title { text-align: center; font-size: 0.8em; letter-spacing: 0.25em; text-transform: uppercase; color: var(--ac); border-bottom: none; position: relative; margin-bottom: 18px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title::before, .cv-sec-title::after { content: "—"; margin: 0 10px; opacity: 0.4; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
  `,

  // 2. Ivy League — two-col academic
  'ivy-league': `
    .cv-doc { padding: 40px; border-top: 4px solid #1a1a1a; }
    .cv-header { margin-bottom: 28px; border-bottom: 2px solid #1a1a1a; padding-bottom: 18px; }
    .cv-name { font-size: 2.6em; font-weight: 900; letter-spacing: -0.03em; color: #1a1a1a; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 1em; margin-top: 4px; }
    .cv-contact-row { font-size: 0.82em; color: var(--muted); gap: 8px 18px; margin-top: 8px; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 210px; gap: 36px; }
    .cv-main .cv-sec-title { font-size: 0.88em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-right .cv-sec-title { font-size: 0.78em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.25); padding-bottom: 4px; margin-bottom: 12px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; }
    .cv-item-title { font-weight: 800; }
    .cv-item-sub { font-style: italic; }
  `,

  // 3. Double Column — bold header band, balanced two-col
  'double-col': `
    .cv-doc { padding: 0; }
    .cv-header { background: var(--ac); color: #fff; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { color: #fff; font-size: 2.4em; font-weight: 900; }
    .cv-role { color: rgba(255,255,255,0.85); font-weight: 600; margin-top: 5px; letter-spacing: 0.08em; }
    .cv-contact-row { color: rgba(255,255,255,0.85); margin-top: 10px; font-size: 0.82em; gap: 5px 14px; }
    .cv-personal-meta { color: rgba(255,255,255,0.7); margin-top: 5px; }
    .cv-photo-wrapper { width: 88px; height: 88px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); flex-shrink: 0; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 220px; gap: 0; }
    .cv-main { padding: 30px 35px; }
    .cv-right { padding: 30px 25px; background: #f8fafc; border-left: 1px solid var(--line); }
    .cv-main .cv-sec-title { font-weight: 900; color: var(--ac); border-bottom: 2px solid rgba(var(--ac-rgb), 0.15); padding-bottom: 6px; margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.8em; letter-spacing: 0.12em; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 5px; margin-bottom: 12px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-skills-list { gap: 5px; }
    .cv-skills-list li { padding: 3px 10px; font-size: 0.8em; }
  `,

  // 4. Navy Executive — left navy accent bar, clean single col
  'navy-exec': `
    .cv-doc { padding: 0 0 0 5px; border-left: 5px solid #0b1437; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 35px 40px 28px; border-bottom: 1px solid var(--line); margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.5em; font-weight: 900; letter-spacing: -0.03em; color: #0b1437; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 1em; margin-top: 5px; letter-spacing: 0.05em; }
    .cv-contact-row { margin-top: 10px; gap: 6px 16px; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 12px; border: 2px solid var(--line); }
    .cv-main { padding: 28px 40px; }
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.15em; text-transform: uppercase; color: #0b1437; border-bottom: 2px solid #0b1437; padding-bottom: 5px; margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-item-title { font-weight: 800; color: #0b1437; }
    .cv-item-date { color: var(--ac); font-weight: 800; }
    .cv-exp-item { padding-left: 16px; border-left: 2px solid rgba(var(--ac-rgb), 0.2); position: relative; }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: var(--ac); }
  `,

  // 5. Timeline Pro — timeline dots on experience
  'timeline-pro': `
    .cv-doc { padding: 40px; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 24px; border-bottom: 2px solid var(--line); }
    .cv-profile-text { flex: 1; padding-right: 20px; }
    .cv-name { font-size: 2.3em; font-weight: 800; }
    .cv-role { color: var(--ac); font-weight: 700; margin-top: 5px; }
    .cv-photo-wrapper { width: 88px; height: 88px; border-radius: 50%; border: 3px solid var(--line); }
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ac); margin-bottom: 18px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 28px; margin-bottom: 20px; }
    .cv-exp-item::before { content: ""; position: absolute; left: 0; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--ac); box-shadow: 0 0 0 3px rgba(var(--ac-rgb), 0.15); z-index: 1; }
    .cv-exp-item::after { content: ""; position: absolute; left: 4px; top: 18px; width: 2px; bottom: -14px; background: rgba(var(--ac-rgb), 0.15); }
    .cv-exp-item:last-child::after { display: none; }
    .cv-item-title { font-weight: 800; }
    .cv-item-date { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); padding: 2px 8px; border-radius: 99px; font-weight: 800; font-size: 0.8em; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; }
  `,

  // 6. Coral Modern — warm tinted hero header, clean body
  'coral-modern': `
    .cv-doc { padding: 0; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; background: rgba(var(--ac-rgb), 0.06); border-top: 3px solid var(--ac); padding: 32px 40px 28px; margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.4em; font-weight: 900; letter-spacing: -0.02em; }
    .cv-role { color: var(--ac); font-weight: 700; margin-top: 5px; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 18px; box-shadow: 0 8px 20px rgba(var(--ac-rgb), 0.18); border: 2px solid rgba(var(--ac-rgb), 0.15); }
    .cv-main { padding: 30px 40px; }
    .cv-sec-title { font-weight: 900; font-size: 0.88em; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); position: relative; padding-left: 14px; margin-bottom: 16px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title::before { content: ""; position: absolute; left: 0; top: 2px; bottom: 2px; width: 4px; border-radius: 2px; background: var(--ac); }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.09); color: var(--ac); font-weight: 700; border: 1px solid rgba(var(--ac-rgb), 0.15); }
    .cv-item-title { font-weight: 800; }
    .cv-item-date { color: var(--ac); font-weight: 800; }
  `,

  // 7. Slate Pro — full-width dark header, clean two-col
  'slate-pro': `
    .cv-doc { padding: 0; }
    .cv-header { background: #1e293b; padding: 36px 40px 30px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { color: #f8fafc; font-size: 2.5em; font-weight: 900; letter-spacing: -0.03em; }
    .cv-role { color: var(--ac); filter: brightness(1.4); font-weight: 700; margin-top: 6px; letter-spacing: 0.06em; }
    .cv-contact-row { color: #94a3b8; margin-top: 10px; gap: 6px 14px; font-size: 0.82em; }
    .cv-personal-meta { color: #64748b; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.15); flex-shrink: 0; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 220px; gap: 0; }
    .cv-main { padding: 30px 35px; }
    .cv-right { padding: 30px 25px; background: #f8fafc; border-left: 1px solid var(--line); }
    .cv-main .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.12em; text-transform: uppercase; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.78em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.2); padding-bottom: 5px; margin-bottom: 12px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-skills-list li { font-size: 0.8em; padding: 3px 10px; }
  `,

  // 8. Compact ATS — pure single column, ultra-clean, max parsability
  'compact-ats': `
    .cv-doc { padding: 36px 44px; font-size: 0.92em; }
    .cv-header { margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #0f172a; }
    .cv-name { font-size: 2em; font-weight: 900; letter-spacing: -0.02em; color: #0f172a; }
    .cv-role { font-size: 1em; font-weight: 600; color: var(--ac); margin-top: 3px; }
    .cv-contact-row { margin-top: 6px; gap: 4px 14px; font-size: 0.82em; }
    .cv-personal-meta { margin-top: 4px; font-size: 0.78em; }
    .cv-sec-title { font-weight: 900; font-size: 0.82em; letter-spacing: 0.2em; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-section { margin-bottom: 18px; }
    .cv-item { margin-bottom: 12px; }
    .cv-item-title { font-weight: 800; font-size: 0.95em; }
    .cv-item-sub { font-size: 0.85em; }
    .cv-item-date { font-size: 0.8em; font-weight: 700; color: var(--muted); }
    .cv-bullets { font-size: 0.88em; }
    .cv-bullets li { margin-bottom: 2px; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.07); color: var(--text); font-weight: 600; font-size: 0.82em; padding: 3px 9px; }
    .cv-summary { font-size: 0.9em; }
  `,

  // 9. Bold Header — oversized name, left accent bars on sections
  'bold-header': `
    .cv-doc { padding: 0; }
    .cv-header { background: #f8fafc; padding: 36px 44px 28px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--line); margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 3em; font-weight: 900; letter-spacing: -0.04em; color: #0f172a; line-height: 1; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 1.05em; margin-top: 8px; letter-spacing: 0.06em; }
    .cv-contact-row { margin-top: 10px; gap: 5px 16px; font-size: 0.83em; }
    .cv-photo-wrapper { width: 95px; height: 95px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.2); box-shadow: 0 8px 20px rgba(var(--ac-rgb), 0.15); }
    .cv-main { padding: 32px 44px; }
    .cv-section { border-left: 3px solid var(--ac); padding-left: 18px; margin-bottom: 28px; }
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ac); margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-item-title { font-weight: 800; font-size: 1em; }
    .cv-item-date { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); padding: 2px 8px; border-radius: 99px; font-weight: 800; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.09); color: var(--ac); font-weight: 700; border: 1px solid rgba(var(--ac-rgb), 0.12); }
  `,

  // 10. Dubai Pro — Gulf two-col, right skills sidebar
  'dubai-pro': `
    .cv-doc { padding: 0; border-top: 5px solid var(--ac); }
    .cv-header { background: #f8fafc; padding: 28px 40px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.5em; font-weight: 900; letter-spacing: -0.03em; color: #0b1437; }
    .cv-role { color: var(--ac); font-weight: 700; margin-top: 5px; letter-spacing: 0.08em; }
    .cv-contact-row { margin-top: 8px; gap: 5px 14px; font-size: 0.82em; }
    .cv-photo-wrapper { width: 88px; height: 88px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.2); box-shadow: 0 6px 18px rgba(var(--ac-rgb), 0.18); flex-shrink: 0; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 225px; gap: 0; }
    .cv-main { padding: 28px 35px; }
    .cv-right { padding: 28px 22px; background: #f8fafc; border-left: 1px solid var(--line); }
    .cv-main .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.1em; text-transform: uppercase; color: #0b1437; border-bottom: 2px solid var(--ac); padding-bottom: 5px; margin-bottom: 14px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.78em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.25); padding-bottom: 4px; margin-bottom: 12px; page-break-after: avoid !important; break-after: avoid !important; display: block; }
    .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 18px; border-left: 2px solid rgba(var(--ac-rgb), 0.2); }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: var(--ac); }
    .cv-skills-list { gap: 5px; }
    .cv-skills-list li { width: 100%; border-radius: 6px; padding: 5px 10px; background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; font-size: 0.82em; }
    .cv-lang-bar { height: 4px; }
  `,
};

/* ================================================================
   MAIN RENDERER
================================================================ */
export function buildCvHtml(data, tmplId, accent, fontId, fontSize, paper, FONTS, FSIZES, PAPERS, customConfig = null) {
  const d = data || {};
  const font = (FONTS.find(f => f.id === fontId) || FONTS[0]).s;
  const fs   = FSIZES[fontSize] || FSIZES.medium;
  const { h: paperH = 1123 } = PAPERS[paper] || PAPERS.a4;

  /* ── helpers ── */
  const esc   = s => String(s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  const lines = v => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
  const arr   = v => Array.isArray(v) ? v : [];
  const has   = v => v && String(v).trim().length > 0;

  const fullName = esc(d.fullName || 'Your Name');
  const title    = esc(d.title   || '');
  const phone    = d.phoneCode && d.phoneNum ? `${d.phoneCode} ${d.phoneNum}` : (d.phoneNum || '');
  const summary  = esc(d.summary || '');

  /* ── filtered arrays ── */
  const exp    = arr(d.experience).filter(x => has(x.role) || has(x.company));
  const edu    = arr(d.education).filter(x => has(x.degree) || has(x.school));
  const projs  = arr(d.projects).filter(x => has(x.name));
  const certs  = arr(d.certifications).filter(x => has(x.name));
  const langs  = arr(d.languages).filter(x => has(x.lang));
  const awards = arr(d.awards).filter(x => has(x.title));
  const refs   = arr(d.references).filter(x => has(x.name));
  const skills  = lines(d.skills);
  const hobbies = lines(d.hobbies);

  /* ── contact row ── */
  const contactItems = [
    d.email    && `<span>✉ ${esc(d.email)}</span>`,
    phone      && `<span>📞 ${esc(phone)}</span>`,
    d.location && `<span>📍 ${esc(d.location)}</span>`,
    d.linkedin && `<span>🔗 ${esc(d.linkedin.replace(/^https?:\/\//, ''))}</span>`,
    d.github   && `<span>💻 ${esc(d.github.replace(/^https?:\/\//, ''))}</span>`,
    d.website  && `<span>🌐 ${esc(d.website.replace(/^https?:\/\//, ''))}</span>`,
  ].filter(Boolean).join('');

  /* ── personal meta ── */
  const personalMeta = [
    has(d.nationality)    && `${esc(d.nationality)}`,
    has(d.dob)            && `DOB: ${esc(d.dob)}`,
    has(d.marital)        && esc(d.marital),
    has(d.gender)         && esc(d.gender),
    has(d.drivingLicense) && `🚗 ${esc(d.drivingLicense)}`,
    has(d.notice)         && `⏱ ${esc(d.notice)}`,
  ].filter(Boolean);

  /* ── section wrapper ── */
  const section = (title, content, cls = '') =>
    content
      ? `<section class="cv-section ${cls}"><h3 class="cv-sec-title">${title}</h3><div class="cv-sec-body">${content}</div></section>`
      : '';

  /* ── accent RGB ── */
  const hex2rgb = hex => {
    let v = (hex || '#1e3a8a').replace('#', '');
    if (v.length === 3) v = v.split('').map(c => c + c).join('');
    return `${parseInt(v.slice(0,2),16)}, ${parseInt(v.slice(2,4),16)}, ${parseInt(v.slice(4,6),16)}`;
  };
  const acRgb = hex2rgb(accent);

  /* ================================================================
     CONTENT BLOCKS
  ================================================================ */
  const blocks = {

    photo: d.photoDataUrl
      ? `<div class="cv-photo-wrapper"><img src="${d.photoDataUrl}" alt="Profile" class="cv-photo-img" /></div>`
      : '',

    profile: `
      <div class="cv-profile-text">
        <h1 class="cv-name">${fullName}</h1>
        ${title ? `<h2 class="cv-role">${title}</h2>` : ''}
        <div class="cv-contact-row">${contactItems}</div>
        ${personalMeta.length
          ? `<div class="cv-personal-meta">${personalMeta.join('<span class="cv-meta-dot">·</span>')}</div>`
          : ''}
      </div>`,

    summary: section('Professional Summary',
      summary ? `<p class="cv-summary">${summary}</p>` : ''),

    exp: section('Experience', exp.map(x => {
      const dateRange = [x.start, x.current ? 'Present' : x.end].filter(Boolean).join(' – ');
      const subParts  = [
        has(x.company)  && esc(x.company),
        has(x.city)     && esc(x.city),
        has(x.empType)  && x.empType !== 'Full-time' && `<em>${esc(x.empType)}</em>`,
        has(x.industry) && esc(x.industry),
      ].filter(Boolean).join(' · ');
      return `
        <article class="cv-item cv-exp-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${esc(x.role)}</div>
              ${subParts ? `<div class="cv-item-sub">${subParts}</div>` : ''}
            </div>
            ${dateRange ? `<div class="cv-item-date">${esc(dateRange)}</div>` : ''}
          </div>
          ${x.bullets
            ? `<ul class="cv-bullets">${lines(x.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
            : ''}
        </article>`;
    }).join('')),

    edu: section('Education', edu.map(x => {
      const dateRange = [x.start, x.end].filter(Boolean).join(' – ');
      const degLabel  = [x.degType, x.degree].filter(Boolean).join(' in ');
      const subParts  = [
        has(x.school) && esc(x.school),
        has(x.city)   && esc(x.city),
      ].filter(Boolean).join(' · ');
      return `
        <article class="cv-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${esc(degLabel)}</div>
              ${subParts ? `<div class="cv-item-sub">${subParts}</div>` : ''}
            </div>
            ${dateRange ? `<div class="cv-item-date">${esc(dateRange)}</div>` : ''}
          </div>
          ${has(x.gpa)   ? `<div class="cv-edu-meta">GPA / Grade: <strong>${esc(x.gpa)}</strong></div>` : ''}
          ${has(x.notes) ? `<p class="cv-edu-notes">${esc(x.notes)}</p>` : ''}
        </article>`;
    }).join('')),

    projects: section('Projects', projs.map(x => {
      return `
        <article class="cv-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${esc(x.name)}${has(x.status) ? ` <span class="cv-proj-status">${esc(x.status)}</span>` : ''}</div>
              ${has(x.tech) ? `<div class="cv-item-sub">${esc(x.tech)}</div>` : ''}
            </div>
            ${has(x.url)
              ? `<div class="cv-item-date"><a href="${esc(x.url)}" class="cv-link" target="_blank">${esc(x.url.replace(/^https?:\/\//, ''))}</a></div>`
              : ''}
          </div>
          ${x.bullets
            ? `<ul class="cv-bullets">${lines(x.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
            : ''}
        </article>`;
    }).join('')),

    skills: skills.length
      ? section('Skills', `<ul class="cv-skills-list">${skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`)
      : '',

    langs: langs.length ? section('Languages', `
      <div class="cv-langs-list">
        ${langs.map(l => {
          const p = { Native: 100, Fluent: 85, Professional: 70, Conversational: 50, Elementary: 30 }[l.level] || 60;
          return `
            <div class="cv-lang-item">
              <div class="cv-lang-top">
                <span class="cv-lang-name">${esc(l.lang)}</span>
                <span class="cv-lang-lvl">${esc(l.level)}</span>
              </div>
              <div class="cv-lang-bar"><div class="cv-lang-fill" style="width:${p}%"></div></div>
            </div>`;
        }).join('')}
      </div>`) : '',

    certs: certs.length ? section('Certifications', `
      <ul class="cv-cert-list">
        ${certs.map(x => {
          const meta = [
            has(x.issuer) && esc(x.issuer),
            has(x.year)   && esc(x.year),
            has(x.expiry) && `Exp: ${esc(x.expiry)}`,
          ].filter(Boolean).join(' · ');
          return `
            <li class="cv-cert-item">
              <div class="cv-item-title">${esc(x.name)}</div>
              ${meta ? `<div class="cv-item-sub">${meta}</div>` : ''}
              ${has(x.credId) ? `<div class="cv-cert-cred">ID: ${esc(x.credId)}</div>` : ''}
            </li>`;
        }).join('')}
      </ul>`) : '',

    awards: awards.length ? section('Awards', awards.map(x => `
      <article class="cv-item">
        <div class="cv-item-header">
          <div>
            <div class="cv-item-title">${esc(x.title)}</div>
            ${has(x.issuer) ? `<div class="cv-item-sub">${esc(x.issuer)}</div>` : ''}
          </div>
          ${has(x.year) ? `<div class="cv-item-date">${esc(x.year)}</div>` : ''}
        </div>
        ${has(x.desc) ? `<p class="cv-award-desc">${esc(x.desc)}</p>` : ''}
      </article>`).join('')) : '',

    refs: refs.length ? section('References', `
      <div class="cv-refs-grid">
        ${refs.map(x => {
          const role = [x.refTitle, x.relationship ? `(${esc(x.relationship)})` : ''].filter(Boolean).join(' ');
          return `
            <div class="cv-ref-item">
              <div class="cv-item-title">${esc(x.name)}</div>
              ${role ? `<div class="cv-item-sub">${role}</div>` : ''}
              ${has(x.company) ? `<div class="cv-ref-detail">🏢 ${esc(x.company)}</div>` : ''}
              ${has(x.email)   ? `<div class="cv-ref-detail">✉ ${esc(x.email)}</div>` : ''}
              ${has(x.phone)   ? `<div class="cv-ref-detail">📞 ${esc(x.phone)}</div>` : ''}
            </div>`;
        }).join('')}
      </div>`) : '',

    hobbies: hobbies.length
      ? section('Hobbies & Interests', `<p class="cv-summary">${esc(hobbies.join(' · '))}</p>`)
      : '',
  };

  /* ── Layout + CSS ── */
  const layout      = customConfig?.layout || BUILT_IN_LAYOUTS[tmplId] || BUILT_IN_LAYOUTS['modern-stack'];
  const templateCss = customConfig?.css    || BUILT_IN_CSS[tmplId]     || '';

  const renderZone = zoneKeys =>
    (zoneKeys || []).map(k => (blocks[k] !== undefined ? blocks[k] : k)).join('');

  /* ── Base CSS ── */
  const baseCss = `
    * { box-sizing: border-box; }
    .cv-doc {
      --ac: ${accent};
      --ac-rgb: ${acRgb};
      --text: #0f172a;
      --muted: #475569;
      --line: #e2e8f0;
      --bg: #ffffff;
      font-family: ${font};
      font-size: ${fs};
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
      min-height: ${paperH}px;
      padding: 35px;
      overflow: visible;
    }
    h1, h2, h3 { margin: 0; }
    .cv-name { font-size: 2.2em; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
    .cv-role { font-size: 1.05em; font-weight: 700; color: var(--ac); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
    .cv-contact-row { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font-size: 0.84em; color: var(--muted); font-weight: 500; }
    .cv-contact-row span { display: flex; align-items: center; gap: 5px; word-break: break-word; }
    .cv-personal-meta { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 6px; font-size: 0.78em; color: var(--muted); font-weight: 500; }
    .cv-meta-dot { opacity: 0.4; margin: 0 2px; }
    .cv-photo-wrapper { position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; flex-shrink: 0; background-color: rgba(var(--ac-rgb), 0.05); z-index: 1; }
    .cv-photo-wrapper .cv-photo-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block; z-index: 0; }
    .cv-section { margin-bottom: 22px; }
    .cv-sec-title { font-size: 1em; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text); margin-bottom: 12px; }
    .cv-item { margin-bottom: 16px; }
    .cv-item:last-child { margin-bottom: 0; }
    .cv-item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
    .cv-item-title { font-weight: 700; color: var(--text); }
    .cv-item-sub { font-size: 0.88em; color: var(--muted); font-weight: 600; margin-top: 2px; }
    .cv-item-date { font-size: 0.83em; font-weight: 700; color: var(--ac); white-space: nowrap; flex-shrink: 0; }
    .cv-bullets { margin: 6px 0 0; padding-left: 18px; color: var(--muted); font-size: 0.93em; }
    .cv-bullets li { margin-bottom: 4px; line-height: 1.5; }
    .cv-summary { margin: 0; color: var(--muted); line-height: 1.7; }
    .cv-edu-meta { font-size: 0.82em; color: var(--ac); font-weight: 700; margin-top: 4px; }
    .cv-edu-notes { margin: 4px 0 0; font-size: 0.88em; color: var(--muted); line-height: 1.55; }
    .cv-proj-status { display: inline-block; margin-left: 6px; padding: 1px 7px; border-radius: 99px; font-size: 0.72em; font-weight: 700; background: rgba(var(--ac-rgb), 0.1); color: var(--ac); vertical-align: middle; }
    .cv-link { color: var(--ac); text-decoration: none; font-size: 0.82em; font-weight: 600; word-break: break-all; }
    .cv-skills-list { display: flex; flex-wrap: wrap; gap: 7px; list-style: none; padding: 0; margin: 0; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.1); color: var(--ac); padding: 4px 11px; border-radius: 99px; font-size: 0.84em; font-weight: 700; }
    .cv-lang-item { margin-bottom: 9px; }
    .cv-lang-top { display: flex; justify-content: space-between; font-size: 0.84em; font-weight: 600; margin-bottom: 4px; }
    .cv-lang-name { color: var(--text); }
    .cv-lang-lvl { color: var(--ac); font-weight: 700; }
    .cv-lang-bar { height: 5px; background: var(--line); border-radius: 99px; overflow: hidden; }
    .cv-lang-fill { height: 100%; background: var(--ac); border-radius: 99px; }
    .cv-cert-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .cv-cert-item { padding: 8px 12px; background: rgba(var(--ac-rgb), 0.04); border-left: 3px solid var(--ac); border-radius: 0 6px 6px 0; }
    .cv-cert-cred { font-size: 0.78em; color: var(--muted); margin-top: 2px; font-style: italic; }
    .cv-award-desc { margin: 4px 0 0; font-size: 0.88em; color: var(--muted); line-height: 1.55; }
    .cv-refs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .cv-ref-item { padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: rgba(var(--ac-rgb), 0.02); }
    .cv-ref-detail { font-size: 0.82em; color: var(--muted); margin-top: 3px; word-break: break-word; }
    .cv-simple-list { margin: 0; padding-left: 18px; color: var(--muted); font-size: 0.93em; }
  `;

  return `
    <style>${baseCss}${templateCss}</style>
    <div class="cv-doc layout-${tmplId}">
      ${layout.header ? `<header class="cv-header">${renderZone(layout.header)}</header>` : ''}
      <div class="cv-body ${layout.sidebar ? 'has-sidebar' : ''} ${layout.right ? 'has-right' : ''}">
        ${layout.sidebar ? `<aside class="cv-sidebar">${renderZone(layout.sidebar)}</aside>` : ''}
        ${layout.main   ? `<main class="cv-main">${renderZone(layout.main)}</main>` : ''}
        ${layout.right  ? `<aside class="cv-right">${renderZone(layout.right)}</aside>` : ''}
      </div>
    </div>
  `;
}