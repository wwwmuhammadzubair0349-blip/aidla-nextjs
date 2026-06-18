"use client";

const CSS = `
.cl-wrap { font-family:'DM Sans',system-ui,sans-serif; max-width:720px; margin:0 auto; padding:0 0 40px; color:#0f172a; }
.cl-head { margin-bottom:32px; }
.cl-head h1 { font-size:1.7rem; font-weight:900; margin:0 0 6px; color:#0f172a; }
.cl-head p { font-size:.9rem; color:#64748b; margin:0; }
.cl-entry { border-left:3px solid #e2e8f0; padding:0 0 32px 24px; position:relative; }
.cl-entry:last-child { padding-bottom:0; border-left-color:transparent; }
.cl-dot { position:absolute; left:-9px; top:4px; width:16px; height:16px; border-radius:50%; background:#fff; border:3px solid #3b82f6; }
.cl-version { display:inline-flex; align-items:center; gap:8px; margin-bottom:6px; }
.cl-ver-badge { background:linear-gradient(135deg,#1e3a8a,#3b82f6); color:#fff; font-size:.75rem; font-weight:800; padding:3px 10px; border-radius:20px; }
.cl-ver-date { font-size:.8rem; color:#94a3b8; font-weight:600; }
.cl-ver-title { font-size:1.05rem; font-weight:800; margin:0 0 10px; color:#0f172a; }
.cl-items { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:5px; }
.cl-item { display:flex; align-items:flex-start; gap:8px; font-size:.87rem; color:#334155; line-height:1.5; }
.cl-item::before { content:'→'; color:#3b82f6; font-weight:700; flex-shrink:0; margin-top:1px; }
@media(max-width:640px){ .cl-wrap{ padding:0 0 28px; } .cl-head h1{ font-size:1.4rem; } }
`;

const ENTRIES = [
  {
    version: "v3.0",
    date: "June 18, 2026",
    title: "Content & Learning Revolution",
    items: [
      "AI Content Engine — review and manage all AI-generated posts from a single admin dashboard",
      "Insights Hub — browse published blogs and news with search, filter, and AI badge indicators",
      "Tools Hub — unified launcher for all AI and learning tools",
      "Resources Sort — sort study materials by newest, A–Z, free, or paid",
      "Certificate Sharing — share certificates to LinkedIn (Add-to-Profile) and WhatsApp",
      "Course Notes — persistent per-lesson notes saved to your account",
    ],
  },
  {
    version: "v2.0",
    date: "June 18, 2026",
    title: "UX & Navigation Revolution",
    items: [
      "New dashboard hero with personalized greeting, streak, and quick-action cards",
      "Redesigned top navigation with pill tabs and mobile dropdown",
      "Learn Hub — unified gateway to courses, daily quiz, battle arena, and resources",
      "Community Hub — forums, FAQs, and announcements in one place",
      "Universal search across courses, blogs, news, and FAQs",
      "Real-time notification centre with unread badge count",
    ],
  },
  {
    version: "v1.0",
    date: "June 18, 2026",
    title: "Security & Stability Foundation",
    items: [
      "Admin authentication hardened — server-side email verification via edge function",
      "Skeleton screens on every page load — no blank flashes",
      "Custom 404 and error boundary pages",
      "AI content safety layer — auto-flag low-quality AI posts for human review",
      "Supabase RLS policies reviewed and tightened across all tables",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="cl-wrap">
      <style>{CSS}</style>
      <div className="cl-head">
        <h1>Platform Changelog</h1>
        <p>What's new in AIDLA — latest updates first.</p>
      </div>
      {ENTRIES.map(entry => (
        <div className="cl-entry" key={entry.version}>
          <div className="cl-dot" />
          <div className="cl-version">
            <span className="cl-ver-badge">{entry.version}</span>
            <span className="cl-ver-date">{entry.date}</span>
          </div>
          <p className="cl-ver-title">{entry.title}</p>
          <ul className="cl-items">
            {entry.items.map(item => (
              <li className="cl-item" key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
