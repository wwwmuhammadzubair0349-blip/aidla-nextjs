"use client";
// app/user/community/page.jsx — Community Hub (Forum + Social Channels)

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy-load the full forum and social pages to keep initial bundle small
const ForumContent  = dynamic(() => import("@/app/user/forum/page"),  { ssr: false, loading: () => <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading forum…</div> });
const SocialContent = dynamic(() => import("@/app/user/social/page"), { ssr: false, loading: () => <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading channels…</div> });

const CSS = `
.cm-wrap { font-family: 'DM Sans', system-ui, sans-serif; min-height: 40vh; }
.cm-tabs {
  display: flex; gap: 0;
  border-bottom: 2px solid #f1f5f9; margin-bottom: 4px;
}
.cm-tab {
  padding: 11px 20px; border: none; background: none;
  font-size: 0.86rem; font-weight: 700; color: #64748b;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; font-family: inherit;
  display: flex; align-items: center; gap: 6px;
  transition: color 0.15s;
}
.cm-tab:hover { color: #0f172a; }
.cm-tab.active { color: #1a3a8f; border-bottom-color: #1a3a8f; }
`;

function CommunityInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams.get("tab") === "connect" ? "connect" : "forum";
  const [tab, setTab] = useState(initial);

  return (
    <div className="cm-wrap">
      <style>{CSS}</style>
      <div className="cm-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "forum"} className={`cm-tab${tab === "forum" ? " active" : ""}`} onClick={() => setTab("forum")}>
          <span aria-hidden="true">💬</span>Forum
        </button>
        <button role="tab" aria-selected={tab === "connect"} className={`cm-tab${tab === "connect" ? " active" : ""}`} onClick={() => setTab("connect")}>
          <span aria-hidden="true">🌐</span>Channels
        </button>
      </div>
      <div role="tabpanel" style={{ paddingTop: 4 }}>
        {tab === "forum"   && <ForumContent />}
        {tab === "connect" && <SocialContent />}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityInner />
    </Suspense>
  );
}
