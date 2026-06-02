/* career/cv/cvRenderer.js - UNIVERSAL PREMIUM CV RENDERER v5.0 */

const THUMBS = {
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
  apexPro: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="0" y="0" width="62" height="3" fill="#0f172a"/>
    <rect x="8" y="10" width="30" height="4" rx="1" fill="#0f172a"/>
    <rect x="8" y="17" width="16" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="46" y="8" width="10" height="10" rx="2" fill="${c}" opacity="0.1"/>
    <rect x="8" y="28" width="46" height="0.5" fill="#e2e8f0"/>
    <rect x="8" y="34" width="14" height="2" rx="1" fill="#0f172a"/>
    <rect x="8" y="39" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="44" width="38" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="54" width="14" height="2" rx="1" fill="${c}"/>
    <rect x="8" y="59" width="46" height="1.5" rx="0.75" fill="#e2e8f0"/>
    <rect x="8" y="63" width="30" height="1.5" rx="0.75" fill="#e2e8f0"/>
  `,

  impactSplit: (c) => `
    <rect width="62" height="82" rx="4" fill="#fff"/>
    <rect x="4" y="6" width="38" height="5" rx="0.5" fill="#0f172a"/>
    <rect x="4" y="14" width="22" height="1.5" rx="0.75" fill="${c}"/>
    <rect x="4" y="18" width="54" height="0.5" fill="#94a3b8"/>
    <rect x="4" y="21" width="54" height="0.5" fill="#0f172a"/>
    <rect x="4" y="26" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="4" y="29" width="30" height="0.75" fill="#0f172a"/>
    <rect x="4" y="33" width="18" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="4" y="36" width="14" height="1" rx="0.5" fill="${c}"/>
    <rect x="4" y="39" width="30" height="0.75" fill="#e2e8f0"/>
    <rect x="4" y="41" width="28" height="0.75" fill="#e2e8f0"/>
    <rect x="4" y="44" width="26" height="0.75" fill="#e2e8f0"/>
    <rect x="36" y="21" width="0.75" height="56" fill="#e2e8f0"/>
    <rect x="40" y="26" width="14" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="40" y="29" width="18" height="0.75" fill="#0f172a"/>
    <rect x="40" y="33" width="18" height="0.75" fill="#e2e8f0"/>
    <rect x="40" y="36" width="16" height="0.75" fill="#e2e8f0"/>
    <rect x="40" y="42" width="14" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="40" y="45" width="18" height="0.75" fill="#0f172a"/>
    <circle cx="41" cy="50" r="1.5" fill="${c}"/>
    <rect x="44" y="49" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="44" y="52" width="12" height="0.75" fill="#e2e8f0"/>
    <circle cx="41" cy="57" r="1.5" fill="${c}"/>
    <rect x="44" y="56" width="12" height="1.5" rx="0.75" fill="#0f172a"/>
    <rect x="44" y="59" width="10" height="0.75" fill="#e2e8f0"/>
    <rect x="40" y="64" width="8" height="2" rx="1" fill="transparent" stroke="#cbd5e1" stroke-width="0.75"/>
    <rect x="50" y="64" width="7" height="2" rx="1" fill="transparent" stroke="#cbd5e1" stroke-width="0.75"/>
  `,
};

// atsRisk: true = multi-column layout, ATS parsers may misread column order
// caps: special sections this template renders (kpi, caseStudy, compass, qr)
export const PREMIUM_TEMPLATES = [
  { id: 'modern-stack', l: 'Modern Stack',     cat: 'Corporate', thumb: THUMBS.modernStack, atsRisk: false, caps: [] },
  { id: 'pure-white',   l: 'Pure White',       cat: 'Minimal',   thumb: THUMBS.pureWhite,   atsRisk: false, caps: [] },
  { id: 'swiss-clean',  l: 'Swiss Clean',      cat: 'Corporate', thumb: THUMBS.swissClean,  atsRisk: true,  caps: [] },
  { id: 'ink-line',     l: 'Ink Line',         cat: 'Minimal',   thumb: THUMBS.inkLine,     atsRisk: false, caps: [] },
  { id: 'sidebar-dark', l: 'Sidebar Dark',     cat: 'Executive', thumb: THUMBS.sidebarDark, atsRisk: true,  caps: [] },
  { id: 'gulf-premium', l: 'Gulf Premium',     cat: 'Premium',   thumb: THUMBS.gulfPremium, atsRisk: true,  caps: [] },
  { id: 'infographic',  l: 'Infographic Split',cat: 'Creative',  thumb: THUMBS.infographic, atsRisk: true,  caps: [] },
  { id: 'diamond',      l: 'Diamond',          cat: 'Minimal',   thumb: THUMBS.diamond,     atsRisk: false, caps: [] },
  { id: 'ivy-league',   l: 'Ivy League',       cat: 'Academic',  thumb: THUMBS.ivyLeague,   atsRisk: true,  caps: [] },
  { id: 'double-col',   l: 'Double Column',    cat: 'Corporate', thumb: THUMBS.doubleCol,   atsRisk: true,  caps: ['kpi'] },
  { id: 'navy-exec',    l: 'Navy Executive',   cat: 'Executive', thumb: THUMBS.navyExec,    atsRisk: false, caps: [] },
  { id: 'timeline-pro', l: 'Timeline Pro',     cat: 'Corporate', thumb: THUMBS.timelinePro, atsRisk: false, caps: [] },
  { id: 'coral-modern', l: 'Coral Modern',     cat: 'Creative',  thumb: THUMBS.coralModern, atsRisk: false, caps: [] },
  { id: 'slate-pro',    l: 'Slate Pro',        cat: 'Executive', thumb: THUMBS.slatePro,    atsRisk: true,  caps: [] },
  { id: 'compact-ats',  l: 'Compact ATS',      cat: 'Minimal',   thumb: THUMBS.compactAts,  atsRisk: false, caps: [] },
  { id: 'bold-header',  l: 'Bold Header',      cat: 'Premium',   thumb: THUMBS.boldHeader,  atsRisk: false, caps: [] },
  { id: 'dubai-pro',    l: 'Dubai Pro',        cat: 'Premium',   thumb: THUMBS.dubaiPro,    atsRisk: true,  caps: ['qr'] },
  { id: 'apex-pro',     l: 'Apex Pro',         cat: 'Executive', thumb: THUMBS.apexPro,     atsRisk: true,  caps: ['kpi', 'caseStudy', 'compass'] },
  { id: 'impact-split', l: 'Impact Split',     cat: 'Premium',   thumb: THUMBS.impactSplit, atsRisk: true,  caps: [] },
];

export const PREMIUM_CATS = ['All', ...new Set(PREMIUM_TEMPLATES.map(t => t.cat))];

const BUILT_IN_LAYOUTS = {
  'modern-stack': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'volunteer', 'publications', 'refs', 'hobbies']
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
    main: ['kpi', 'summary', 'exp', 'edu', 'projects'],
    right: ['skills', 'langs', 'certs', 'awards', 'refs', 'hobbies']
  },
  'navy-exec': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'volunteer', 'publications', 'refs', 'hobbies']
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
    main: ['summary', 'exp', 'edu', 'skills', 'projects', 'certs', 'langs', 'awards', 'volunteer', 'publications', 'refs', 'hobbies']
  },
  'bold-header': {
    header: ['profile', 'photo'],
    main: ['summary', 'exp', 'edu', 'projects', 'skills', 'certs', 'langs', 'awards', 'volunteer', 'publications', 'refs', 'hobbies']
  },
  'dubai-pro': {
    header: ['profile', 'photo', 'qr'],
    main: ['summary', 'exp', 'edu', 'projects', 'awards'],
    right: ['skills', 'langs', 'certs', 'refs', 'hobbies']
  },
  'apex-pro': {
    header: ['photo', 'profile'],
    main: ['kpi', 'compass', 'exp', 'edu', 'caseStudy', 'projects'],
    right: ['skills', 'certs', 'langs', 'awards']
  },
  'impact-split': {
    header: ['profile'],
    main: ['exp', 'edu', 'projects'],
    right: ['summary', 'keyAchievements', 'skills', 'certs', 'langs', 'refs', 'hobbies']
  },
};

const BUILT_IN_CSS = {
  'modern-stack': `
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid var(--ac); padding-bottom: 20px; margin-bottom: 24px; }
    .cv-profile-text { flex: 1; padding-right: 20px; }
    .cv-photo-wrapper { width: 95px; height: 95px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.15); }
    .cv-sec-title { border-bottom: 1.5px solid rgba(var(--ac-rgb), 0.2); padding-bottom: 6px; margin-bottom: 14px; color: var(--text); }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
  `,
  'pure-white': `
    .cv-doc { padding: 45px; }
    .cv-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-bottom: 35px; }
    .cv-contact-row { justify-content: center; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .cv-sec-title { text-align: center; letter-spacing: 0.2em; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 20px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-item-header { flex-direction: column; align-items: center; text-align: center; gap: 4px; }
    .cv-item-date { text-align: center; }
  `,
  'swiss-clean': `
    .cv-doc { padding: 0; }
    .cv-body::after { content: ""; display: table; clear: both; }
    .cv-sidebar { float: left; width: 260px; box-sizing: border-box; background: #f8fafc; padding: 35px 25px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); border-bottom-right-radius: 24px; margin: 0 35px 20px 0; min-height: 92vh; }
    .cv-main { display: block; padding: 35px; }
    .cv-photo-wrapper { width: 140px; height: 140px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 6px 16px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.05); }
    .cv-name { font-size: 2.2em; color: var(--text); }
    .cv-role { color: var(--ac); }
    .cv-contact-row { flex-direction: column; gap: 10px; margin-top: 15px; }
    .cv-sidebar .cv-sec-title { margin-top: 30px; font-size: 0.85em; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); width: 100%; border-radius: 6px; padding: 8px 12px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
  `,
  'ink-line': `
    .cv-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 25px; margin-bottom: 25px; }
    .cv-name { font-weight: 300; letter-spacing: -0.02em; }
    .cv-photo-wrapper { width: 85px; height: 85px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .cv-sec-title { color: var(--ac); display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .cv-sec-title::after { content: ""; flex: 1; height: 1px; background: var(--line); }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-section { border-left: 2px solid rgba(var(--ac-rgb), 0.2); padding-left: 18px; margin-left: 4px; }
  `,
  'sidebar-dark': `
    .cv-doc { padding: 0; background: #ffffff; }
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
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
  `,
  'gulf-premium': `
    .cv-doc { border-top: 16px solid var(--ac); padding-top: 30px; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px; }
    .cv-name { font-size: 2.6em; font-weight: 800; letter-spacing: -0.03em; color: var(--text); }
    .cv-role { font-weight: 600; color: var(--muted); letter-spacing: 0.15em; }
    .cv-photo-wrapper { width: 100px; height: 100px; border-radius: 50%; box-shadow: 0 10px 25px rgba(var(--ac-rgb), 0.2); border: 2px solid #fff; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 230px; gap: 40px; }
    .cv-sec-title { font-weight: 800; color: var(--ac); border-bottom: 2px solid rgba(var(--ac-rgb), 0.1); padding-bottom: 6px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 20px; border-left: 1px solid rgba(var(--ac-rgb), 0.2); }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: var(--ac); box-shadow: 0 0 0 3px rgba(var(--ac-rgb), 0.2); }
  `,
  'infographic': `
    .cv-doc { padding: 0; }
    .cv-body::after { content: ""; display: table; clear: both; }
    .cv-sidebar { float: left; width: 280px; box-sizing: border-box; background: #f8fafc; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); border-bottom-right-radius: 40px; margin: 0 35px 25px 0; padding-bottom: 20px; min-height: 92vh; }
    .cv-main { display: block; padding: 35px; }
    .cv-info-card { background: var(--ac); color: #ffffff; padding: 40px 25px 30px; border-bottom-right-radius: 40px; box-shadow: 0 15px 30px rgba(var(--ac-rgb), 0.15); margin-bottom: 25px; }
    .cv-info-pad { padding: 0 25px 30px; }
    .cv-photo-wrapper { width: 110px; height: 110px; border-radius: 24px; border: 4px solid rgba(255,255,255,0.25); margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .cv-name { color: #ffffff; font-size: 2em; line-height: 1.1; }
    .cv-role { color: rgba(255,255,255,0.85); margin-top: 8px; font-size: 0.9em; }
    .cv-contact-row { flex-direction: column; gap: 12px; margin-top: 18px; color: rgba(255,255,255,0.9); }
    .cv-sec-title { font-weight: 900; letter-spacing: 0.1em; color: var(--text); }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-skills-list li { background: #ffffff; border: 1px solid var(--line); width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  `,
  'diamond': `
    .cv-doc { padding: 50px 55px; border-top: 2px solid var(--ac); border-bottom: 2px solid var(--ac); }
    .cv-header { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; margin-bottom: 32px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 50%; border: 3px solid rgba(var(--ac-rgb), 0.2); box-shadow: 0 6px 18px rgba(var(--ac-rgb), 0.15); }
    .cv-name { font-size: 2.4em; font-weight: 900; letter-spacing: -0.03em; }
    .cv-role { color: var(--ac); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.9em; }
    .cv-contact-row { justify-content: center; }
    .cv-sec-title { text-align: center; font-size: 0.8em; letter-spacing: 0.25em; text-transform: uppercase; color: var(--ac); border-bottom: none; position: relative; margin-bottom: 18px; }
    .cv-sec-title::before, .cv-sec-title::after { content: "—"; margin: 0 10px; opacity: 0.4; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
  `,
  'ivy-league': `
    .cv-doc { padding: 40px; border-top: 4px solid #1a1a1a; }
    .cv-header { margin-bottom: 28px; border-bottom: 2px solid #1a1a1a; padding-bottom: 18px; }
    .cv-name { font-size: 2.6em; font-weight: 900; letter-spacing: -0.03em; color: #1a1a1a; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 1em; margin-top: 4px; }
    .cv-contact-row { font-size: 0.82em; color: var(--muted); gap: 8px 18px; margin-top: 8px; }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 210px; gap: 36px; }
    .cv-main .cv-sec-title { font-size: 0.88em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; margin-bottom: 14px; }
    .cv-main .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-right .cv-sec-title { font-size: 0.78em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.25); padding-bottom: 4px; margin-bottom: 12px; }
    .cv-right .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; }
    .cv-item-title { font-weight: 800; }
    .cv-item-sub { font-style: italic; }
  `,
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
    .cv-main .cv-sec-title { font-weight: 900; color: var(--ac); border-bottom: 2px solid rgba(var(--ac-rgb), 0.15); padding-bottom: 6px; margin-bottom: 14px; }
    .cv-main .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.8em; letter-spacing: 0.12em; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: 5px; margin-bottom: 12px; }
    .cv-right .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-skills-list { gap: 5px; }
    .cv-skills-list li { padding: 3px 10px; font-size: 0.8em; }
  `,
  'navy-exec': `
    .cv-doc { padding: 0 0 0 5px; border-left: 5px solid #0b1437; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 35px 40px 28px; border-bottom: 1px solid var(--line); margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.5em; font-weight: 900; letter-spacing: -0.03em; color: #0b1437; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 1em; margin-top: 5px; letter-spacing: 0.05em; }
    .cv-contact-row { margin-top: 10px; gap: 6px 16px; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 12px; border: 2px solid var(--line); }
    .cv-main { padding: 28px 40px; }
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.15em; text-transform: uppercase; color: #0b1437; border-bottom: 2px solid #0b1437; padding-bottom: 5px; margin-bottom: 14px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-item-title { font-weight: 800; color: #0b1437; }
    .cv-item-date { color: var(--ac); font-weight: 800; }
    .cv-exp-item { padding-left: 16px; border-left: 2px solid rgba(var(--ac-rgb), 0.2); position: relative; }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: var(--ac); }
  `,
  'timeline-pro': `
    .cv-doc { padding: 40px; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 24px; border-bottom: 2px solid var(--line); }
    .cv-profile-text { flex: 1; padding-right: 20px; }
    .cv-name { font-size: 2.3em; font-weight: 800; }
    .cv-role { color: var(--ac); font-weight: 700; margin-top: 5px; }
    .cv-photo-wrapper { width: 88px; height: 88px; border-radius: 50%; border: 3px solid var(--line); }
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ac); margin-bottom: 18px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 28px; margin-bottom: 20px; }
    .cv-exp-item::before { content: ""; position: absolute; left: 0; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--ac); box-shadow: 0 0 0 3px rgba(var(--ac-rgb), 0.15); z-index: 1; }
    .cv-exp-item::after { content: ""; position: absolute; left: 4px; top: 18px; width: 2px; bottom: -14px; background: rgba(var(--ac-rgb), 0.15); }
    .cv-exp-item:last-child::after { display: none; }
    .cv-item-title { font-weight: 800; }
    .cv-item-date { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); padding: 2px 8px; border-radius: 99px; font-weight: 800; font-size: 0.8em; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; }
  `,
  'coral-modern': `
    .cv-doc { padding: 0; }
    .cv-header { display: flex; justify-content: space-between; align-items: flex-start; background: rgba(var(--ac-rgb), 0.06); border-top: 3px solid var(--ac); padding: 32px 40px 28px; margin-bottom: 0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.4em; font-weight: 900; letter-spacing: -0.02em; }
    .cv-role { color: var(--ac); font-weight: 700; margin-top: 5px; }
    .cv-photo-wrapper { width: 90px; height: 90px; border-radius: 18px; box-shadow: 0 8px 20px rgba(var(--ac-rgb), 0.18); border: 2px solid rgba(var(--ac-rgb), 0.15); }
    .cv-main { padding: 30px 40px; }
    .cv-sec-title { font-weight: 900; font-size: 0.88em; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text); position: relative; padding-left: 14px; margin-bottom: 16px; }
    .cv-sec-title::before { content: ""; position: absolute; left: 0; top: 2px; bottom: 2px; width: 4px; border-radius: 2px; background: var(--ac); }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.09); color: var(--ac); font-weight: 700; border: 1px solid rgba(var(--ac-rgb), 0.15); }
    .cv-item-title { font-weight: 800; }
    .cv-item-date { color: var(--ac); font-weight: 800; }
  `,
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
    .cv-main .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.12em; text-transform: uppercase; color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 14px; }
    .cv-main .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.78em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.2); padding-bottom: 5px; margin-bottom: 12px; }
    .cv-right .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-skills-list li { font-size: 0.8em; padding: 3px 10px; }
  `,
  'compact-ats': `
    .cv-doc { padding: 36px 44px; font-size: 0.92em; }
    .cv-header { margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #0f172a; }
    .cv-name { font-size: 2em; font-weight: 900; letter-spacing: -0.02em; color: #0f172a; }
    .cv-role { font-size: 1em; font-weight: 600; color: var(--ac); margin-top: 3px; }
    .cv-contact-row { margin-top: 6px; gap: 4px 14px; font-size: 0.82em; }
    .cv-personal-meta { margin-top: 4px; font-size: 0.78em; }
    .cv-sec-title { font-weight: 900; font-size: 0.82em; letter-spacing: 0.2em; text-transform: uppercase; color: #0f172a; border-bottom: 0.5px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
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
    .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ac); margin-bottom: 14px; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-item-title { font-weight: 800; font-size: 1em; }
    .cv-item-date { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); padding: 2px 8px; border-radius: 99px; font-weight: 800; }
    .cv-skills-list li { background: rgba(var(--ac-rgb), 0.09); color: var(--ac); font-weight: 700; border: 1px solid rgba(var(--ac-rgb), 0.12); }
  `,
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
    .cv-main .cv-sec-title { font-weight: 900; font-size: 0.85em; letter-spacing: 0.1em; text-transform: uppercase; color: #0b1437; border-bottom: 2px solid var(--ac); padding-bottom: 5px; margin-bottom: 14px; }
    .cv-main .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.78em; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ac); border-bottom: 1px solid rgba(var(--ac-rgb), 0.25); padding-bottom: 4px; margin-bottom: 12px; }
    .cv-right .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-exp-item { position: relative; padding-left: 18px; border-left: 2px solid rgba(var(--ac-rgb), 0.2); }
    .cv-exp-item::before { content: ""; position: absolute; left: -5px; top: 7px; width: 8px; height: 8px; border-radius: 50%; background: var(--ac); }
    .cv-skills-list { gap: 5px; }
    .cv-skills-list li { width: 100%; border-radius: 6px; padding: 5px 10px; background: rgba(var(--ac-rgb), 0.08); color: var(--ac); font-weight: 700; font-size: 0.82em; }
    .cv-lang-bar { height: 4px; }
  `,
  'apex-pro': `
    .cv-doc { padding: 0; border-top: 3px solid #0f172a; }
    .cv-header { padding: 36px 44px 28px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; }
    .cv-profile-text { flex: 1; padding-right: 24px; }
    .cv-name { font-size: 2.8em; font-weight: 900; letter-spacing: -0.04em; color: #0f172a; line-height: 1; }
    .cv-role { color: var(--ac); font-weight: 700; font-size: 0.95em; margin-top: 6px; letter-spacing: 0.08em; }
    .cv-contact-row { margin-top: 8px; gap: 5px 14px; font-size: 0.8em; }
    .cv-photo-wrapper { width: 92px; height: 92px; border-radius: 8px; border: 2px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .cv-body.has-right { display: grid; grid-template-columns: 1fr 235px; gap: 0; }
    .cv-main { padding: 28px 38px; }
    .cv-right { padding: 28px 22px; background: #fafafa; border-left: 1px solid #e2e8f0; }
    .cv-main .cv-sec-title { font-weight: 900; font-size: 0.8em; letter-spacing: 0.2em; text-transform: uppercase; color: #0f172a; margin-bottom: 14px; }
    .cv-main .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-right .cv-sec-title { font-weight: 900; font-size: 0.75em; letter-spacing: 0.18em; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 4px; margin-bottom: 12px; }
    .cv-right .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
    .cv-item-title { font-weight: 800; color: #0f172a; }
    .cv-item-date { background: rgba(var(--ac-rgb), 0.08); color: var(--ac); padding: 2px 8px; border-radius: 99px; font-weight: 700; font-size: 0.78em; }
    .cv-skills-list { gap: 4px; }
    .cv-skills-list li { padding: 2px 8px; background: rgba(var(--ac-rgb), 0.06); color: var(--ac); font-weight: 700; font-size: 0.78em; }
    .cv-bullets { font-size: 0.9em; color: #334155; }
  `,

  'impact-split': `
    /* ── Impact Split – Enhancv-inspired ── */
    .cv-doc { padding: 0; }

    /* Full-width header */
    .layout-impact-split .cv-header {
      padding: 28px 36px 18px;
      border-bottom: 2.5px solid #0f172a;
      margin-bottom: 0;
    }
    .layout-impact-split .cv-name {
      font-size: 2.9em; font-weight: 900;
      text-transform: uppercase; letter-spacing: 3px;
      color: #0f172a; line-height: 1; margin-bottom: 4px;
    }
    .layout-impact-split .cv-role {
      font-size: 0.88em; font-weight: 600;
      color: var(--ac); text-transform: uppercase;
      letter-spacing: 1.5px; margin-top: 6px;
    }
    .layout-impact-split .cv-contact-row {
      font-size: 0.77em; color: #475569;
      gap: 5px 16px; margin-top: 10px;
    }
    .layout-impact-split .cv-photo-wrapper { display: none; }

    /* Two-column body */
    .layout-impact-split .cv-body.has-right {
      display: grid; grid-template-columns: 58% 42%;
    }
    .layout-impact-split .cv-main {
      padding: 22px 22px 22px 36px;
      border-right: 1.5px solid #e2e8f0;
    }
    .layout-impact-split .cv-right {
      padding: 22px 36px 22px 20px;
    }

    /* Section headers */
    .layout-impact-split .cv-sec-title {
      font-size: 0.69em; font-weight: 900;
      text-transform: uppercase; letter-spacing: 2.5px;
      color: #0f172a; border-top: none; border-left: none;
      border-right: none; border-bottom: 2px solid #0f172a;
      padding-bottom: 5px; margin-bottom: 14px;
    }
    .layout-impact-split .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }

    /* Experience */
    .layout-impact-split .cv-item-title {
      font-size: 0.9em; font-weight: 700; color: #0f172a;
    }
    .layout-impact-split .cv-item-sub {
      font-size: 0.82em; font-weight: 600;
      color: var(--ac); margin-top: 2px;
    }
    .layout-impact-split .cv-item-date {
      font-size: 0.7em; font-weight: 600;
      color: #64748b; white-space: nowrap;
      background: none; border-radius: 0; padding: 0;
    }
    .layout-impact-split .cv-bullets {
      font-size: 0.84em; color: #334155;
      margin-top: 5px;
    }
    .layout-impact-split .cv-bullets li { margin-bottom: 3px; }

    /* Summary */
    .layout-impact-split .cv-summary {
      font-size: 0.8em; line-height: 1.65;
      color: #334155; text-align: justify;
    }

    /* Key Achievements */
    .layout-impact-split .cv-ach-item {
      display: grid; grid-template-columns: 22px 1fr;
      gap: 9px; margin-bottom: 13px; align-items: start;
    }
    .layout-impact-split .cv-ach-diamond {
      flex-shrink: 0; margin-top: 1px;
      filter: drop-shadow(0 2px 4px rgba(var(--ac-rgb), 0.45));
    }
    .layout-impact-split .cv-ach-title {
      font-size: 0.8em; font-weight: 700; color: #0f172a; margin-bottom: 2px;
    }
    .layout-impact-split .cv-ach-meta {
      font-size: 0.69em; color: var(--ac); font-weight: 600; margin-bottom: 3px;
    }
    .layout-impact-split .cv-ach-desc {
      margin: 0; font-size: 0.71em; color: #475569; line-height: 1.55;
    }

    /* Skills — bordered chips, no color fill */
    .layout-impact-split .cv-skills-list {
      gap: 5px;
    }
    .layout-impact-split .cv-skills-list li {
      background: transparent; color: #374151;
      border: 1px solid #cbd5e1; border-radius: 3px;
      padding: 3px 9px; font-size: 0.74em; font-weight: 500;
    }

    /* Certifications */
    .layout-impact-split .cv-cert-list { gap: 7px; }
    .layout-impact-split .cv-cert-item {
      background: transparent; border-left: none;
      padding: 0 0 7px 0;
      border-bottom: 1px solid #f1f5f9;
      border-radius: 0;
    }
    .layout-impact-split .cv-cert-item .cv-item-title {
      font-size: 0.8em; font-weight: 700; color: #0f172a;
    }
    .layout-impact-split .cv-cert-item .cv-item-sub {
      color: #64748b; font-weight: 500; font-size: 0.75em;
    }

    /* Education */
    .layout-impact-split .cv-edu-item .cv-item-sub {
      color: var(--ac);
    }
  `,
};

export function buildCvHtml(data, tmplId, accent, fontId, fontSize, paper, FONTS, FSIZES, PAPERS, customConfig = null) {
  const d = data || {};
  const font = (FONTS.find(f => f.id === fontId) || FONTS[0]).s;
  const fs = FSIZES[fontSize] || FSIZES.medium;
  const { h: paperH = 1123 } = PAPERS[paper] || PAPERS.a4;

  const esc = s => String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  const lines = v => String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
  const arr = v => Array.isArray(v) ? v : [];
  const has = v => v && String(v).trim().length > 0;

  const fullName = esc(d.fullName || 'Your Name');
  const title = esc(d.title || '');
  const phone = d.phoneCode && d.phoneNum ? `${d.phoneCode} ${d.phoneNum}` : (d.phoneNum || '');
  const summary = esc(d.summary || '');
  const compass = esc(d.compass || '');

  const contactItems = [
    d.email    && `<span data-cv-field="email">Email: ${esc(d.email)}</span>`,
    phone      && `<span>Tel: ${esc(phone)}</span>`,
    d.location && `<span data-cv-field="location">Location: ${esc(d.location)}</span>`,
    d.linkedin && `<span data-cv-field="linkedin">LinkedIn: ${esc(d.linkedin.replace(/^https?:\/\//, ''))}</span>`,
    d.github   && `<span data-cv-field="github">GitHub: ${esc(d.github.replace(/^https?:\/\//, ''))}</span>`,
    d.website  && `<span data-cv-field="website">Web: ${esc(d.website.replace(/^https?:\/\//, ''))}</span>`,
  ].filter(Boolean).join('');

  const personalMeta = [
    has(d.nationality) && `${esc(d.nationality)}`,
    has(d.dob) && `DOB: ${esc(d.dob)}`,
    has(d.marital) && esc(d.marital),
    has(d.gender) && esc(d.gender),
    has(d.drivingLicense) && `License: ${esc(d.drivingLicense)}`,
    has(d.notice) && `Notice: ${esc(d.notice)}`,
  ].filter(Boolean);

  const section = (title, content, cls = '') =>
    content ? `<section class="cv-section ${cls}"><h3 class="cv-sec-title">${title}</h3><div class="cv-sec-body">${content}</div></section>` : '';

  const hex2rgb = hex => {
    let v = (hex || '#1e3a8a').replace('#', '');
    if (v.length === 3) v = v.split('').map(c => c + c).join('');
    return `${parseInt(v.slice(0, 2), 16)}, ${parseInt(v.slice(2, 4), 16)}, ${parseInt(v.slice(4, 6), 16)}`;
  };
  const acRgb = hex2rgb(accent);

  const exp = arr(d.experience).filter(x => has(x.role) || has(x.company));
  const edu = arr(d.education).filter(x => has(x.degree) || has(x.school));
  const projs = arr(d.projects).filter(x => has(x.name));
  const certs = arr(d.certifications).filter(x => has(x.name));
  const langs = arr(d.languages).filter(x => has(x.lang));
  const awards = arr(d.awards).filter(x => has(x.title));
  const refs = arr(d.references).filter(x => has(x.name));
  const skills = lines(d.skills);
  const hobbies = lines(d.hobbies);
  const kpis = arr(d.kpis).filter(x => has(x.value));
  const caseStudies = arr(d.caseStudies).filter(x => has(x.name));
  const volunteer = arr(d.volunteer).filter(x => has(x.org) || has(x.role));
  const publications = arr(d.publications).filter(x => has(x.title));

  const blocks = {
    photo: d.photoDataUrl
      ? `<div class="cv-photo-wrapper"><img src="${d.photoDataUrl}" alt="Profile" class="cv-photo-img" /></div>`
      : '',

    profile: `
      <div class="cv-profile-text">
        <h1 class="cv-name" data-cv-field="fullName">${fullName}</h1>
        ${title ? `<h2 class="cv-role" data-cv-field="title">${title}</h2>` : ''}
        <div class="cv-contact-row">${contactItems}</div>
        ${personalMeta.length ? `<div class="cv-personal-meta">${personalMeta.join('<span class="cv-meta-dot">·</span>')}</div>` : ''}
      </div>`,

    summary: section('Professional Summary',
      summary ? `<p class="cv-summary" data-cv-field="summary">${summary}</p>` : ''),

    compass: section('Professional Compass',
      compass ? `<p class="cv-summary cv-compass" data-cv-field="compass">${compass}</p>` : ''),

    kpi: kpis.length ? section('Impact Highlights', `
      <div class="cv-kpi-grid">
        ${kpis.map(k => `
          <div class="cv-kpi-item">
            <div class="cv-kpi-value">${esc(k.value)}</div>
            <div class="cv-kpi-label">${esc(k.label)}</div>
          </div>
        `).join('')}
      </div>`) : '',

    caseStudy: caseStudies.length ? section('Featured Case Study',
      caseStudies.map(cs => `
        <article class="cv-item cv-case-study">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${esc(cs.name)}</div>
              ${has(cs.outcome) ? `<div class="cv-item-sub">${esc(cs.outcome)}</div>` : ''}
            </div>
          </div>
          <div class="cv-case-grid">
            ${has(cs.challenge) ? `<div class="cv-case-block"><span class="cv-case-label">Challenge</span><p>${esc(cs.challenge)}</p></div>` : ''}
            ${has(cs.approach) ? `<div class="cv-case-block"><span class="cv-case-label">Approach</span><p>${esc(cs.approach)}</p></div>` : ''}
            ${has(cs.result) ? `<div class="cv-case-block"><span class="cv-case-label">Result</span><p>${esc(cs.result)}</p></div>` : ''}
          </div>
        </article>`).join('')) : '',

    exp: section('Experience', exp.map(x => {
      const dateRange = [x.start, x.current ? 'Present' : x.end].filter(Boolean).join(' – ');
      const subParts = [
        has(x.company) && esc(x.company),
        has(x.city) && esc(x.city),
        has(x.empType) && x.empType !== 'Full-time' && `<em>${esc(x.empType)}</em>`,
        has(x.industry) && esc(x.industry),
      ].filter(Boolean).join(' · ');
      return `
        <article class="cv-item cv-exp-item" data-cv-id="${x.id}">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title" data-cv-field="role">${esc(x.role)}</div>
              ${subParts ? `<div class="cv-item-sub" data-cv-field="company">${subParts}</div>` : ''}
            </div>
            ${dateRange ? `<div class="cv-item-date" data-cv-field="dateRange">${esc(dateRange)}</div>` : ''}
          </div>
          ${x.bullets ? `<ul class="cv-bullets" data-cv-field="bullets">${lines(x.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        </article>`;
    }).join('')),

    edu: section('Education', edu.map(x => {
      const dateRange = [x.start, x.end].filter(Boolean).join(' – ');
      const degLabel = [x.degType, x.degree].filter(Boolean).join(' in ');
      const subParts = [
        has(x.school) && esc(x.school),
        has(x.city) && esc(x.city),
      ].filter(Boolean).join(' · ');
      return `
        <article class="cv-item cv-edu-item" data-cv-id="${x.id}">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title" data-cv-field="degree">${esc(degLabel)}</div>
              ${subParts ? `<div class="cv-item-sub" data-cv-field="school">${subParts}</div>` : ''}
            </div>
            ${dateRange ? `<div class="cv-item-date">${esc(dateRange)}</div>` : ''}
          </div>
          ${has(x.gpa) ? `<div class="cv-edu-meta">GPA / Grade: <strong>${esc(x.gpa)}</strong></div>` : ''}
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
            ${has(x.url) ? `<div class="cv-item-date"><a href="${esc(x.url)}" class="cv-link" target="_blank">${esc(x.url.replace(/^https?:\/\//, ''))}</a></div>` : ''}
          </div>
          ${x.bullets ? `<ul class="cv-bullets">${lines(x.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        </article>`;
    }).join('')),

    skills: skills.length ? section('Skills', `<ul class="cv-skills-list">${skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`) : '',

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
              <div class="cv-lang-bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(l.lang)}: ${esc(l.level)}"><div class="cv-lang-fill" style="width:${p}%"></div></div>
            </div>`;
        }).join('')}
      </div>`) : '',

    certs: certs.length ? section('Certifications', `
      <ul class="cv-cert-list">
        ${certs.map(x => {
          const meta = [
            has(x.issuer) && esc(x.issuer),
            has(x.year) && esc(x.year),
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
              ${has(x.company) ? `<div class="cv-ref-detail">${esc(x.company)}</div>` : ''}
              ${has(x.email) ? `<div class="cv-ref-detail">Email: ${esc(x.email)}</div>` : ''}
              ${has(x.phone) ? `<div class="cv-ref-detail">Tel: ${esc(x.phone)}</div>` : ''}
            </div>`;
        }).join('')}
      </div>`) : '',

    hobbies: hobbies.length ? section('Hobbies & Interests', `<p class="cv-summary">${esc(hobbies.join(' · '))}</p>`) : '',

    volunteer: volunteer.length ? section('Volunteer Work', volunteer.map(x => {
      const dateRange = [x.start, x.end].filter(Boolean).join(' – ');
      return `
        <article class="cv-item cv-exp-item">
          <div class="cv-item-header">
            <div>
              <div class="cv-item-title">${esc(x.role || '')}</div>
              ${has(x.org) ? `<div class="cv-item-sub">${esc(x.org)}</div>` : ''}
            </div>
            ${dateRange ? `<div class="cv-item-date">${esc(dateRange)}</div>` : ''}
          </div>
          ${x.bullets ? `<ul class="cv-bullets">${lines(x.bullets).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        </article>`;
    }).join('')) : '',

    publications: publications.length ? section('Publications', `
      <ul class="cv-cert-list">
        ${publications.map(x => {
          const meta = [has(x.publisher) && esc(x.publisher), has(x.year) && esc(x.year)].filter(Boolean).join(' · ');
          return `
            <li class="cv-cert-item">
              <div class="cv-item-title">${esc(x.title)}${has(x.url) ? ` <a href="${esc(x.url)}" class="cv-link" target="_blank">(link)</a>` : ''}</div>
              ${meta ? `<div class="cv-item-sub">${meta}</div>` : ''}
            </li>`;
        }).join('')}
      </ul>`) : '',

    keyAchievements: awards.length ? section('Key Achievements', awards.map(x => `
      <div class="cv-ach-item">
        <svg class="cv-ach-diamond" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="18" height="18" aria-hidden="true">
          <defs>
            <linearGradient id="dg-${esc(x.title).slice(0,4).replace(/\s/g,'')}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${accent}" stop-opacity="1"/>
              <stop offset="100%" stop-color="${accent}" stop-opacity="0.65"/>
            </linearGradient>
          </defs>
          <polygon points="10,0 20,10 10,20 0,10" fill="url(#dg-${esc(x.title).slice(0,4).replace(/\s/g,'')})" />
          <polygon points="10,3 17,10 10,17 3,10" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
        </svg>
        <div class="cv-ach-content">
          <div class="cv-ach-title">${esc(x.title)}</div>
          ${(has(x.issuer) || has(x.year)) ? `<div class="cv-ach-meta">${[has(x.issuer) && esc(x.issuer), has(x.year) && esc(x.year)].filter(Boolean).join(' · ')}</div>` : ''}
          ${has(x.desc) ? `<p class="cv-ach-desc">${esc(x.desc)}</p>` : ''}
        </div>
      </div>`).join('')) : '',

    qr: d.qrDataUrl ? `
      <div class="cv-qr-wrapper">
        <img src="${d.qrDataUrl}" alt="Portfolio QR" class="cv-qr-img" />
        <span class="cv-qr-label">Portfolio</span>
      </div>` : '',
  };

  const layout = customConfig?.layout || BUILT_IN_LAYOUTS[tmplId] || BUILT_IN_LAYOUTS['modern-stack'];
  const templateCss = customConfig?.css || BUILT_IN_CSS[tmplId] || '';

  const renderZone = zoneKeys =>
    (zoneKeys || []).map(k => (blocks[k] !== undefined ? blocks[k] : k)).join('');

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
    .cv-compass { font-size: 0.95em; font-style: italic; border-left: 3px solid var(--ac); padding-left: 16px; color: #334155; }
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
    
    /* KPI Block */
    .cv-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; margin-bottom: 8px; }
    .cv-kpi-item { text-align: center; padding: 16px 12px; background: rgba(var(--ac-rgb), 0.04); border-radius: 10px; border: 1px solid rgba(var(--ac-rgb), 0.08); }
    .cv-kpi-value { font-size: 2em; font-weight: 900; color: var(--ac); line-height: 1.1; letter-spacing: -0.02em; }
    .cv-kpi-label { font-size: 0.75em; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
    
    /* Case Study */
    .cv-case-study { padding: 16px; background: #f8fafc; border-radius: 10px; border: 1px solid var(--line); }
    .cv-case-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 10px; }
    .cv-case-block { }
    .cv-case-label { display: inline-block; font-size: 0.7em; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ac); background: rgba(var(--ac-rgb), 0.08); padding: 2px 8px; border-radius: 99px; margin-bottom: 6px; }
    .cv-case-block p { margin: 0; font-size: 0.88em; color: var(--muted); line-height: 1.6; }
    
    /* QR Code */
    .cv-qr-wrapper { text-align: center; flex-shrink: 0; }
    .cv-qr-img { width: 70px; height: 70px; border-radius: 8px; border: 1px solid var(--line); }
    .cv-qr-label { display: block; font-size: 0.6em; font-weight: 700; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
    
    /* Print optimizations */
    @media print {
      .cv-section { page-break-inside: avoid !important; break-inside: avoid !important; }
      .cv-item { page-break-inside: avoid !important; break-inside: avoid !important; }
      .cv-item-header { page-break-after: avoid !important; break-after: avoid !important; }
      .cv-sec-title { page-break-after: avoid !important; break-after: avoid !important; }
      .cv-bullets li { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  `;

  return `
    <style>${baseCss}${templateCss}</style>
    <div class="cv-doc layout-${tmplId}">
      ${layout.header ? `<header class="cv-header">${renderZone(layout.header)}</header>` : ''}
      <div class="cv-body ${layout.sidebar ? 'has-sidebar' : ''} ${layout.right ? 'has-right' : ''}">
        ${layout.sidebar ? `<aside class="cv-sidebar">${renderZone(layout.sidebar)}</aside>` : ''}
        ${layout.main ? `<main class="cv-main">${renderZone(layout.main)}</main>` : ''}
        ${layout.right ? `<aside class="cv-right">${renderZone(layout.right)}</aside>` : ''}
      </div>
    </div>
  `;
}