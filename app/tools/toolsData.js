// app/tools/toolsData.js
// Pure data — no React imports. Safe to import in server components (page.jsx)
// AND client components (ToolsClient.jsx).

/* ─────────────────────────────────────────────
   All categories + tools
───────────────────────────────────────────── */
export const CATEGORIES = [
  {
    id: "results",
    icon: "📋",
    title: "Pakistan Board Results",
    badge: "🔥 Trending",
    badgeColor: "#e11d48",
    tools: [
      { to: "/tools/results",                   emoji: "🏛️", label: "All Board Results",       desc: "All 26 BISE boards — Punjab, KPK, Sindh, Balochistan, FBISE, AJK & GB.", badge: "26 Boards", badgeColor: "#1a3a8f" },
      { to: "/tools/results/bise-lahore",       emoji: "📋", label: "BISE Lahore",              desc: "Matric & Inter results — Lahore, Sheikhupura, Nankana Sahib." },
      { to: "/tools/results/fbise-islamabad",   emoji: "📋", label: "FBISE Islamabad",          desc: "Federal Board results for Islamabad & cantonment areas." },
      { to: "/tools/results/bise-karachi",      emoji: "📋", label: "BISE Karachi",             desc: "Matric & Inter results for all Karachi districts." },
      { to: "/tools/results/bise-peshawar",     emoji: "📋", label: "BISE Peshawar",            desc: "KPK board results — Peshawar, Charsadda, Nowshera." },
      { to: "/tools/results/bise-gujranwala",   emoji: "📋", label: "BISE Gujranwala",          desc: "Results for Gujranwala, Sialkot, Gujrat & more." },
      { to: "/tools/results/bise-rawalpindi",   emoji: "📋", label: "BISE Rawalpindi",          desc: "Results for Rawalpindi, Attock, Chakwal & Jhelum." },
      { to: "/tools/results/bise-faisalabad",   emoji: "📋", label: "BISE Faisalabad",          desc: "Results for Faisalabad, Jhang, Toba Tek Singh & Chiniot." },
    ],
    viewAll: { to: "/tools/results", label: "View all 26 boards →" },
  },
  {
    id: "ai",
    icon: "🤖",
    title: "AI-Powered Tools",
    badge: "✨ AIDLA AI",
    badgeColor: "#7c3aed",
    tools: [
      { to: "/tools/ai/summarizer",     emoji: "📝", label: "AI Summarizer",     desc: "Paste any article and get a smart AI summary in seconds.",           badge: "AI", badgeColor: "#7c3aed" },
      { to: "/tools/ai/paraphraser",    emoji: "🔄", label: "AI Paraphraser",    desc: "Rewrite text in academic, casual, formal or creative styles.",       badge: "AI", badgeColor: "#7c3aed" },
      { to: "/tools/ai/email-writer",   emoji: "📧", label: "AI Email Writer",   desc: "AI writes professional emails — open directly in Gmail or Outlook.", badge: "AI", badgeColor: "#7c3aed" },
      { to: "/tools/ai/interview-prep", emoji: "🎯", label: "AI Interview Prep", desc: "Enter a job title — get interview questions with ideal answers.",    badge: "AI", badgeColor: "#7c3aed" },
      { to: "/tools/ai/linkedin-bio",   emoji: "💼", label: "AI LinkedIn Bio",   desc: "Generate a powerful LinkedIn About section in seconds.",             badge: "AI", badgeColor: "#7c3aed" },
    ],
  },
  {
    id: "education",
    icon: "🎓",
    title: "Education Calculators",
    badge: "🇵🇰 Pakistan",
    badgeColor: "#0891b2",
    tools: [
      { to: "/tools/education/cgpa-calculator",         emoji: "🧮", label: "CGPA / GPA Calculator",    desc: "Calculate CGPA for universities — 4.0 & 5.0 scale."              },
      { to: "/tools/education/mdcat-ecat-calculator",   emoji: "🏥", label: "MDCAT / ECAT Calculator",  desc: "Calculate medical & engineering admission aggregate in Pakistan."            },
      { to: "/tools/education/percentage-calculator",   emoji: "📊", label: "Percentage Calculator",    desc: "Marks to %, increase/decrease, what % of a number — all in one.",          badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/grade-calculator",        emoji: "🅰️", label: "Grade Calculator",         desc: "Convert marks to letter grades — A+, A, B, C based on any grading scale.", badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/attendance-calculator",   emoji: "📅", label: "Attendance Calculator",    desc: "Check if your attendance meets the required % for exams.",                  badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/marks-to-grade",          emoji: "📈", label: "Marks to Grade Converter", desc: "Convert raw marks to GPA, percentage and letter grade instantly.",          badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/study-planner",           emoji: "📚", label: "Study Planner",            desc: "Plan your study sessions across subjects before exams.",                    badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/pomodoro-timer",          emoji: "⏱️", label: "Pomodoro Study Timer",     desc: "Focus timer with work/break intervals to boost study productivity.",        badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/assignment-tracker",      emoji: "✅", label: "Assignment Tracker",       desc: "Track all your assignments, deadlines and completion status.",               badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/flashcard-maker",         emoji: "🗂️", label: "Flashcard Maker",          desc: "Create digital flashcards to memorize concepts faster.",                    badge: "New", badgeColor: "#059669" },
      { to: "/tools/education/scholarship-eligibility", emoji: "🏆", label: "Scholarship Eligibility",  desc: "Check if your marks qualify for HEC, govt and private scholarships.",       badge: "New", badgeColor: "#059669" },
    ],
  },
  {
    id: "finance",
    icon: "💰",
    title: "Finance Calculators",
    badge: "🇵🇰 + 🇦🇪",
    badgeColor: "#059669",
    tools: [
      { to: "/tools/finance/salary-calculator",   emoji: "💵", label: "Salary / Tax Calculator", desc: "Calculate net salary after Pakistan income tax deductions.",    badge: "New", badgeColor: "#059669" },
      { to: "/tools/finance/zakat-calculator",    emoji: "🌙", label: "Zakat Calculator",         desc: "Calculate your Zakat on savings, gold, silver and assets.",     badge: "New", badgeColor: "#059669" },
      { to: "/tools/finance/loan-emi-calculator", emoji: "🏦", label: "Loan / EMI Calculator",    desc: "Calculate monthly EMI for home, car or personal loans.",         badge: "New", badgeColor: "#059669" },
      { to: "/tools/finance/tip-calculator",      emoji: "🧾", label: "Tip Calculator",           desc: "Split bills and calculate tips for groups easily.",              badge: "New", badgeColor: "#059669" },
    ],
  },
  {
    id: "health",
    icon: "❤️",
    title: "Health Calculators",
    badge: "🏥 Wellness",
    badgeColor: "#dc2626",
    tools: [
      { to: "/tools/health/bmi-calculator",          emoji: "⚖️", label: "BMI Calculator",         desc: "Calculate your Body Mass Index and healthy weight range.",         badge: "New", badgeColor: "#059669" },
      { to: "/tools/health/calorie-calculator",      emoji: "🔥", label: "Calorie Calculator",      desc: "Calculate daily calorie needs based on age, weight and activity.", badge: "New", badgeColor: "#059669" },
      { to: "/tools/health/water-intake-calculator", emoji: "💧", label: "Water Intake Calculator", desc: "Find out how much water you should drink daily.",                  badge: "New", badgeColor: "#059669" },
      { to: "/tools/health/sleep-calculator",        emoji: "😴", label: "Sleep Calculator",        desc: "Find the best bedtime or wake-up time based on sleep cycles.",     badge: "New", badgeColor: "#059669" },
    ],
  },
  {
    id: "career",
    icon: "💼",
    title: "Career Tools",
    badge: "🚀 Job Ready",
    badgeColor: "#d97706",
    tools: [
      { to: "/tools/career/cv-maker",           emoji: "🧑‍💼", label: "CV Maker",           desc: "Create a professional CV with 20+ templates. Print to PDF, no sign-up." },
      { to: "/tools/career/cover-letter-maker", emoji: "✉️",  label: "Cover Letter Maker", desc: "Tailored cover letters with 4 templates, adjustable tone. Live preview." },
    ],
  },
  {
    id: "utility",
    icon: "⚙️",
    title: "Utility Tools",
    badge: "✅ No Login",
    badgeColor: "#2563eb",
    tools: [
      { to: "/tools/utility/qr-code-generator",      emoji: "📱", label: "QR Code Generator",      desc: "Generate QR codes for URLs, text, WhatsApp, WiFi & more."             },
      { to: "/tools/utility/age-calculator",          emoji: "🎂", label: "Age Calculator",          desc: "Calculate exact age in years, months and days from any date."         },
      { to: "/tools/utility/word-counter",            emoji: "🔢", label: "Word Counter",            desc: "Count words, characters, sentences and reading time."                 },
      { to: "/tools/utility/password-generator",      emoji: "🔐", label: "Password Generator",      desc: "Generate strong, secure random passwords instantly.",                 badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/unit-converter",          emoji: "📏", label: "Unit Converter",          desc: "Convert length, weight, temperature, speed and more.",                badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/countdown-timer",         emoji: "⏳", label: "Countdown Timer",         desc: "Count down to any date — exams, events, deadlines.",                  badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/percentage-change",       emoji: "📉", label: "Percentage Change",       desc: "Calculate percentage increase or decrease between two values.",        badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/roman-numeral-converter", emoji: "🏛️", label: "Roman Numeral Converter", desc: "Convert numbers to Roman numerals and back.",                         badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/binary-converter",        emoji: "💻", label: "Binary Converter",        desc: "Convert decimal, binary, octal and hexadecimal numbers.",             badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/color-picker",            emoji: "🎨", label: "Color Picker",            desc: "Pick colors and get HEX, RGB, HSL values instantly.",                 badge: "New", badgeColor: "#059669" },
      { to: "/tools/utility/text-case-converter",     emoji: "🔡", label: "Text Case Converter",     desc: "Convert text to UPPERCASE, lowercase, Title Case and more.",          badge: "New", badgeColor: "#059669" },
    ],
  },
  {
    id: "pdf",
    icon: "📄",
    title: "PDF Tools",
    badge: "🔒 Private",
    badgeColor: "#db2777",
    tools: [
      { to: "/tools/pdf/word-to-pdf",  emoji: "📄", label: "Word → PDF",  desc: "Convert Word docs to PDF with perfect layout and formatting." },
      { to: "/tools/pdf/image-to-pdf", emoji: "🖼️", label: "Image → PDF", desc: "Combine JPG, PNG, WebP images into a single PDF."            },
    ],
  },
];

// Flat list used for search + JSON-LD
export const ALL_TOOLS = CATEGORIES.flatMap(c =>
  c.tools.map(t => ({ ...t, categoryTitle: c.title, categoryId: c.id }))
);

export const CAT_FILTERS = [
  { id: "all",       label: "All",       icon: "◎" },
  { id: "results",   label: "Results",   icon: "📋" },
  { id: "ai",        label: "AI",        icon: "🤖" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "finance",   label: "Finance",   icon: "💰" },
  { id: "health",    label: "Health",    icon: "❤️" },
  { id: "career",    label: "Career",    icon: "💼" },
  { id: "utility",   label: "Utility",   icon: "⚙️" },
  { id: "pdf",       label: "PDF",       icon: "📄" },
];
