"use client";
// app/user/cover-letter/CoverLetterDashboard.jsx
// Authenticated cover letter dashboard — same system as /user/cv-maker.

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { buildCoverLetterHtml, CL_TEMPLATES, CL_ACCENTS, TemplateSVG } from "@/app/cover-letter/coverLetterRenderer";

const WIZARD_KEY = "cl_wizard_v1";

/* ── CSS ───────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');

.cld-root{font-family:'Outfit',sans-serif;position:relative;min-height:100dvh;-webkit-font-smoothing:antialiased;}

/* Loading */
.cld-loading{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#64748b;}
.cld-loading-spinner{width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#7c3aed;border-radius:50%;animation:cldSpin .7s linear infinite;}
@keyframes cldSpin{to{transform:rotate(360deg)}}
.cld-loading-text{font-size:.88rem;font-weight:600;}

/* Top bar */
.cld-topbar{
  background:rgba(255,255,255,.97);backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(124,58,237,.1);
  padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:nowrap;
  position:sticky;top:0;z-index:200;
  box-shadow:0 1px 8px rgba(11,20,55,.07);
}
@media(min-width:960px){.cld-topbar{padding:12px 28px;}}

.cld-topbar-title{font-family:'Sora',sans-serif;font-size:.95rem;font-weight:900;color:#0b1437;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cld-topbar-title span{font-size:.72rem;font-weight:600;color:#64748b;margin-left:6px;}

.cld-btn{
  display:inline-flex;align-items:center;gap:5px;
  height:36px;padding:0 14px;border-radius:10px;
  font-family:'Outfit',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;
  white-space:nowrap;flex-shrink:0;transition:opacity .12s,transform .12s;
  -webkit-tap-highlight-color:transparent;
}
.cld-btn:active{transform:scale(.97);}
.cld-btn-outline{background:#f8fafc;border:1.5px solid #e2e8f0;color:#374151;}
.cld-btn-outline:hover{background:#f1f5f9;}
.cld-btn-purple{background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;color:#fff;box-shadow:0 3px 10px rgba(124,58,237,.3);}
.cld-btn-purple:hover{box-shadow:0 5px 14px rgba(124,58,237,.4);}
.cld-btn-green{background:linear-gradient(135deg,#047857,#059669);border:none;color:#fff;box-shadow:0 3px 10px rgba(4,120,87,.25);}
.cld-btn-green:hover{box-shadow:0 5px 14px rgba(4,120,87,.35);}
.cld-btn-text{display:none;}
@media(min-width:420px){.cld-btn-text{display:inline;}}
.cld-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
/* Compact buttons on very small screens */
@media(max-width:479px){.cld-btn{height:34px;padding:0 9px;font-size:.7rem;gap:3px;}}
/* Hide Print on mobile — less relevant for small screens */
@media(max-width:479px){.cld-btn-print{display:none;}}

/* List panel (slide-out on mobile, inline sidebar on desktop) */
.cld-list-panel{
  position:fixed;top:0;left:0;width:280px;height:100dvh;
  background:rgba(255,255,255,.98);backdrop-filter:blur(16px);
  border-right:1px solid rgba(124,58,237,.1);z-index:300;
  display:flex;flex-direction:column;
  transform:translateX(-100%);visibility:hidden;
  transition:transform .28s cubic-bezier(.4,0,.2,1),visibility 0s linear .28s;
  box-shadow:4px 0 24px rgba(11,20,55,.12);
}
.cld-list-panel.open{
  transform:translateX(0);visibility:visible;
  transition:transform .28s cubic-bezier(.4,0,.2,1),visibility 0s linear 0s;
}
@media(min-width:960px){
  .cld-list-panel{
    position:sticky;top:57px;height:calc(100dvh - 57px);
    transform:none;visibility:visible;
    transition:none;box-shadow:none;
    border-right:1px solid #f1f5f9;flex-shrink:0;
    z-index:1;
  }
}

.cld-panel-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 16px;border-bottom:1px solid #f1f5f9;
  font-size:.8rem;font-weight:800;color:#0b1437;
}
.cld-panel-close{background:none;border:none;font-size:1.2rem;cursor:pointer;color:#64748b;padding:4px;}
@media(min-width:960px){.cld-panel-close{display:none;}}

.cld-panel-body{flex:1;overflow-y:auto;padding:10px 10px;}
.cld-letter-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 10px;border-radius:12px;cursor:pointer;
  transition:background .12s;border:1.5px solid transparent;
  -webkit-tap-highlight-color:transparent;
  margin-bottom:4px;
}
.cld-letter-item:hover{background:#f5f3ff;}
.cld-letter-item.active{background:#f5f3ff;border-color:#ddd6fe;}
.cld-letter-icon{font-size:1.3rem;flex-shrink:0;}
.cld-letter-info{flex:1;min-width:0;}
.cld-letter-name{font-size:.8rem;font-weight:700;color:#0b1437;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cld-letter-meta{font-size:.65rem;color:#94a3b8;margin-top:2px;}

.cld-panel-new{
  margin:10px;padding:11px;border-radius:12px;
  border:1.5px dashed #c4b5fd;background:#faf5ff;
  font-size:.78rem;font-weight:700;color:#7c3aed;cursor:pointer;
  text-align:center;transition:background .12s;
  -webkit-tap-highlight-color:transparent;
}
.cld-panel-new:hover{background:#ede9fe;}

/* Overlay (mobile) */
.cld-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:299;
  opacity:0;pointer-events:none;transition:opacity .28s;
}
.cld-overlay.show{opacity:1;pointer-events:auto;}
@media(min-width:960px){.cld-overlay{display:none;}}

/* Layout */
.cld-layout{display:flex;min-height:calc(100dvh - 57px);}

.cld-main{flex:1;padding:20px 16px;max-width:680px;margin:0 auto;width:100%;}
@media(min-width:960px){.cld-main{padding:28px 32px;}}

/* Empty state */
.cld-empty{text-align:center;padding:60px 20px;}
.cld-empty-ico{font-size:3rem;margin-bottom:14px;display:block;}
.cld-empty-title{font-family:'Sora',sans-serif;font-size:1.2rem;font-weight:900;color:#0b1437;margin-bottom:8px;}
.cld-empty-sub{font-size:.85rem;color:#64748b;margin-bottom:24px;line-height:1.6;}

/* Editor area */
.cld-section-label{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#374151;margin-bottom:8px;display:block;}

.cld-tmpl-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px;}
@media(min-width:480px){.cld-tmpl-grid{grid-template-columns:repeat(4,1fr);}}
.cld-tmpl-card{border-radius:10px;border:2px solid #e2e8f0;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s;background:#f8fafc;-webkit-tap-highlight-color:transparent;}
.cld-tmpl-card:hover{border-color:#c4b5fd;}
.cld-tmpl-card.on{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15);}
.cld-tmpl-thumb{width:100%;aspect-ratio:62/82;display:flex;align-items:center;justify-content:center;background:#f1f5f9;}
.cld-tmpl-thumb svg{width:100%;height:100%;}
.cld-tmpl-name{font-size:.58rem;font-weight:700;color:#0b1437;padding:4px 5px;text-align:center;background:#fff;border-top:1px solid #e2e8f0;}

.cld-accent-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
.cld-acc-dot{width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.15);cursor:pointer;transition:transform .15s;-webkit-tap-highlight-color:transparent;}
.cld-acc-dot:hover{transform:scale(1.2);}
.cld-acc-dot.on{outline:3px solid #0f172a;outline-offset:2px;}

.cld-edit-toggle{display:flex;border-radius:10px;overflow:hidden;border:1.5px solid #e2e8f0;margin-bottom:12px;}
.cld-edit-tab{flex:1;height:34px;border:none;background:#f8fafc;font-family:'Outfit',sans-serif;font-size:.75rem;font-weight:700;color:#64748b;cursor:pointer;transition:background .12s;}
.cld-edit-tab.on{background:#7c3aed;color:#fff;}

.cld-prev-wrap{background:#c5cfe0;border-radius:12px;padding:8px;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:16px;max-height:480px;}
.cld-prev-inner{position:relative;overflow:hidden;}
.cld-prev-inner>div{transform-origin:top left;}

.cld-textarea{
  width:100%;min-height:360px;border-radius:12px;
  border:1.5px solid #e2e8f0;background:#f8fafc;
  padding:14px;font-family:'Outfit',sans-serif;
  font-size:.82rem;font-weight:500;color:#0b1437;line-height:1.8;
  outline:none;resize:vertical;
  transition:border-color .15s,box-shadow .15s;
  margin-bottom:16px;
}
.cld-textarea:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1);background:#fff;}

.cld-letter-name-row{display:flex;gap:8px;align-items:center;margin-bottom:20px;}
.cld-letter-name-inp{
  flex:1;height:40px;border-radius:10px;border:1.5px solid #e2e8f0;background:#f8fafc;
  padding:0 12px;font-family:'Outfit',sans-serif;font-size:.85rem;font-weight:600;color:#0b1437;
  outline:none;transition:border-color .15s;
}
.cld-letter-name-inp:focus{border-color:#7c3aed;background:#fff;}

.cld-spinner{width:10px;height:10px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:cldSpin .6s linear infinite;display:inline-block;flex-shrink:0;}

.cld-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;font-size:.82rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:9999;pointer-events:none;animation:toastPop .2s ease;white-space:nowrap;}
.cld-toast.ok{background:#064e3b;}
.cld-toast.err{background:#7f1d1d;}
@keyframes toastPop{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.cld-draft-banner{
  display:flex;align-items:center;gap:10px;
  background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.18);
  border-radius:12px;padding:12px 14px;margin-bottom:16px;
  font-size:.78rem;font-weight:600;color:#4c1d95;
}
.cld-draft-banner-icon{font-size:1.2rem;flex-shrink:0;}

.cld-btn-print{background:#f8fafc;border:1.5px solid #e2e8f0;color:#374151;}
.cld-btn-print:hover{background:#f1f5f9;}
`;

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function CoverLetterDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [letters,    setLetters]    = useState([]);
  const [active,     setActive]     = useState(null); // { id, name, data, letter, template, accent, font_id }
  const [editMode,   setEditMode]   = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [hasDraft,   setHasDraft]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [zoom,       setZoom]       = useState(0.44);

  const prevRef   = useRef(null);
  const saveTimer = useRef(null);

  const showToast = (msg, type = "inf", dur = 2800) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  };

  /* Fit zoom to container */
  const fitZoom = useCallback(() => {
    const el = prevRef.current;
    if (!el) return;
    setZoom(Math.min(0.9, +((el.clientWidth - 16) / 794).toFixed(3)));
  }, []);

  useEffect(() => {
    if (active && !editMode) setTimeout(fitZoom, 120);
  }, [active, editMode, fitZoom]);

  useEffect(() => {
    const ro = new ResizeObserver(fitZoom);
    if (prevRef.current) ro.observe(prevRef.current);
    return () => ro.disconnect();
  }, [fitZoom]);

  /* Load letters on mount */
  useEffect(() => {
    if (!user) return;

    const fetchLetters = async () => {
      setLoading(true);
      const { data: rows } = await supabase
        .from("user_cover_letters")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const list = rows || [];
      setLetters(list);

      if (list.length > 0) {
        loadLetter(list[0]);
      } else {
        // Check for a wizard draft
        try {
          const raw = localStorage.getItem(WIZARD_KEY);
          if (raw) {
            const sv = JSON.parse(raw);
            if (sv.data?.letterContent) {
              setActive({
                id: null,
                name: sv.data.fullName ? `${sv.data.fullName}'s Cover Letter` : "New Cover Letter",
                data: sv.data,
                letter: sv.data.letterContent || "",
                template: sv.tmpl || "modern",
                accent: sv.accent || "#1e3a8a",
                font_id: "outfit",
              });
              setHasDraft(true);
            }
          }
        } catch {}
      }

      setLoading(false);
    };

    fetchLetters();
  }, [user]);

  const loadLetter = (rec) => {
    setActive({
      id:       rec.id,
      name:     rec.name,
      data:     { ...(rec.data || {}), letterContent: rec.letter || rec.data?.letterContent || "" },
      letter:   rec.letter || "",
      template: rec.template || "modern",
      accent:   rec.accent   || "#1e3a8a",
      font_id:  rec.font_id  || "outfit",
    });
    setEditMode(false);
    setPanelOpen(false);
  };

  const updActive = (key, val) => setActive(a => a ? { ...a, [key]: val } : a);

  const saveToCloud = async () => {
    if (!active || !user) return;
    setSaving(true);
    try {
      const payload = {
        user_id:  user.id,
        name:     active.name,
        data:     { ...active.data, letterContent: active.letter },
        letter:   active.letter,
        template: active.template,
        accent:   active.accent,
        font_id:  active.font_id,
      };

      if (active.id) {
        await supabase.from("user_cover_letters").update(payload).eq("id", active.id).eq("user_id", user.id);
      } else {
        const { data: inserted } = await supabase.from("user_cover_letters").insert(payload).select().single();
        if (inserted) {
          updActive("id", inserted.id);
          setLetters(prev => [inserted, ...prev]);
          localStorage.removeItem(WIZARD_KEY);
          setHasDraft(false);
        }
      }

      // Refresh list
      const { data: rows } = await supabase
        .from("user_cover_letters").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (rows) setLetters(rows);

      showToast("Saved to cloud ✓", "ok");
    } catch {
      showToast("Save failed — please try again", "err");
    } finally {
      setSaving(false);
    }
  };

  const printLetter = () => {
    if (!active) return;
    const letterHtml = buildCoverLetterHtml(
      { ...active.data, letterContent: active.letter },
      active.template, active.accent, active.font_id
    );
    const safeName = (active.data?.fullName || active.name || "Cover_Letter")
      .replace(/\s+/g, "_").replace(/[^\w\-_.]/g, "");

    const win = window.open("", "_blank", "width=960,height=700");
    if (!win) { showToast("Allow popups to download PDF", "err"); return; }

    const isMob = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeName}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#c5cfe0;min-height:100vh;display:flex;flex-direction:column;align-items:center;font-family:system-ui,sans-serif;}
    .banner{width:100%;background:#0f172a;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:100;}
    .banner-text{font-size:13px;font-weight:600;line-height:1.5;}
    .banner-text strong{color:#c4b5fd;}
    .save-btn{background:#7c3aed;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 4px 12px rgba(124,58,237,.4);font-family:system-ui,sans-serif;}
    .cl-wrap{margin:24px auto;width:794px;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.25);}
    @media print{
      html,body{background:#fff!important;display:block!important;min-height:auto!important;}
      .banner{display:none!important;}
      .cl-wrap{margin:0!important;box-shadow:none!important;width:100%!important;}
      @page{size:210mm 297mm;margin:10mm 0;}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="banner-text">📄 Your cover letter is ready — <strong>ATS-friendly PDF</strong>. Set Destination → <strong>Save as PDF</strong>.</div>
    <button class="save-btn" onclick="window.print()">⬇ Save as PDF</button>
  </div>
  <div class="cl-wrap">${letterHtml.replace(/^[\s\S]*?<body>/i, "").replace(/<\/body>[\s\S]*$/i, "")}</div>
  <script>
    ${isMob ? "" : "window.addEventListener('load',function(){setTimeout(function(){window.print();},600);});"}
  </script>
</body>
</html>`);
    win.document.close();
  };

  const deleteLetter = async (id) => {
    if (!window.confirm("Delete this cover letter?")) return;
    await supabase.from("user_cover_letters").delete().eq("id", id).eq("user_id", user.id);
    const remaining = letters.filter(l => l.id !== id);
    setLetters(remaining);
    if (active?.id === id) {
      if (remaining.length > 0) loadLetter(remaining[0]);
      else setActive(null);
    }
    showToast("Deleted", "ok");
  };

  /* ── Auth guard ─────────────────────────────────────────────────────────── */
  if (authLoading || loading) {
    return (
      <div className="cld-root">
        <style>{CSS}</style>
        <div className="cld-loading">
          <div className="cld-loading-spinner" />
          <div className="cld-loading-text">Loading your cover letters…</div>
        </div>
      </div>
    );
  }

  const html = active ? buildCoverLetterHtml(
    { ...active.data, letterContent: active.letter },
    active.template, active.accent, active.font_id
  ) : "";

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="cld-root">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="cld-topbar">
        <button className="cld-btn cld-btn-outline" onClick={() => setPanelOpen(o => !o)} aria-label="Toggle letter list">
          ☰ <span className="cld-btn-text">My Letters</span>
        </button>

        <div className="cld-topbar-title">
          Cover Letter Studio
          {active && <span>{active.name}</span>}
        </div>

        <button className="cld-btn cld-btn-print" onClick={printLetter} disabled={!active} aria-label="Print cover letter">
          🖨 <span className="cld-btn-text">Print</span>
        </button>

        <button className="cld-btn cld-btn-purple" onClick={() => router.push("/cover-letter")}>
          + <span className="cld-btn-text">New Letter</span>
        </button>

        <button className="cld-btn cld-btn-green" onClick={saveToCloud} disabled={saving || !active}>
          {saving ? <><span className="cld-spinner" /> <span className="cld-btn-text">Saving…</span></> : <>💾 <span className="cld-btn-text">Save</span></>}
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={`cld-overlay${panelOpen ? " show" : ""}`} onClick={() => setPanelOpen(false)} aria-hidden="true" />

      {/* Main layout — panel is a flex sibling so it becomes inline sidebar on desktop */}
      <div className="cld-layout">

        {/* Slide-out panel (mobile) / sticky inline sidebar (desktop) */}
        <div className={`cld-list-panel${panelOpen ? " open" : ""}`} aria-label="Letter list">
          <div className="cld-panel-head">
            My Cover Letters
            <button className="cld-panel-close" onClick={() => setPanelOpen(false)} aria-label="Close panel">✕</button>
          </div>
          <div className="cld-panel-body">
            {letters.length === 0 ? (
              <div style={{ padding: "20px 8px", textAlign: "center", color: "#94a3b8", fontSize: ".78rem" }}>
                No saved letters yet.<br />Build one to see it here.
              </div>
            ) : (
              letters.map(l => (
                <div key={l.id} className={`cld-letter-item${active?.id === l.id ? " active" : ""}`}
                  onClick={() => loadLetter(l)}>
                  <span className="cld-letter-icon">✉️</span>
                  <div className="cld-letter-info">
                    <div className="cld-letter-name">{l.name}</div>
                    <div className="cld-letter-meta">{new Date(l.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <button
                    style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: ".75rem", padding: "4px", flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); deleteLetter(l.id); }}
                    aria-label="Delete letter"
                  >✕</button>
                </div>
              ))
            )}
          </div>
          <button className="cld-panel-new" onClick={() => { setPanelOpen(false); router.push("/cover-letter"); }}>
            + Create New Cover Letter
          </button>
        </div>

        <main className="cld-main">

          {!active ? (
            <div className="cld-empty">
              <span className="cld-empty-ico">✉️</span>
              <div className="cld-empty-title">No cover letter yet</div>
              <p className="cld-empty-sub">
                Build your first AI-powered cover letter in 3 minutes.<br />
                Tailored to your role, ATS-optimized, and ready to impress.
              </p>
              <button className="cld-btn cld-btn-purple" style={{ height: 44, padding: "0 24px", fontSize: ".88rem", margin: "0 auto" }}
                onClick={() => router.push("/cover-letter")}>
                ✨ Build My Cover Letter
              </button>
            </div>
          ) : (
            <>
              {/* Wizard draft banner */}
              {hasDraft && !active.id && (
                <div className="cld-draft-banner">
                  <span className="cld-draft-banner-icon">📝</span>
                  <span>You have an unsaved draft from the wizard. Click <strong>Save</strong> to keep it permanently.</span>
                </div>
              )}

              {/* Letter name */}
              <div className="cld-letter-name-row">
                <input
                  className="cld-letter-name-inp"
                  value={active.name}
                  placeholder="Cover letter name…"
                  onChange={e => updActive("name", e.target.value)}
                  aria-label="Cover letter name"
                />
              </div>

              {/* Template picker */}
              <span className="cld-section-label">Template</span>
              <div className="cld-tmpl-grid">
                {CL_TEMPLATES.map(t => (
                  <div key={t.id} className={`cld-tmpl-card${active.template === t.id ? " on" : ""}`}
                    onClick={() => updActive("template", t.id)} role="button" aria-pressed={active.template === t.id}>
                    <div className="cld-tmpl-thumb"><TemplateSVG id={t.id} accent={active.accent} /></div>
                    <div className="cld-tmpl-name">{t.name}</div>
                  </div>
                ))}
              </div>

              {/* Accent colour */}
              <span className="cld-section-label">Colour</span>
              <div className="cld-accent-row">
                {CL_ACCENTS.map(c => (
                  <button key={c} className={`cld-acc-dot${active.accent === c ? " on" : ""}`}
                    style={{ background: c }} aria-label={`Colour ${c}`}
                    onClick={() => updActive("accent", c)} />
                ))}
              </div>

              {/* Preview / Edit toggle */}
              <div className="cld-edit-toggle">
                <button className={`cld-edit-tab${!editMode ? " on" : ""}`} onClick={() => setEditMode(false)}>👁 Preview</button>
                <button className={`cld-edit-tab${editMode ? " on" : ""}`}  onClick={() => setEditMode(true)}>✏ Edit Letter</button>
              </div>

              {editMode ? (
                <textarea
                  className="cld-textarea"
                  value={active.letter}
                  onChange={e => updActive("letter", e.target.value)}
                  placeholder="Type or paste your cover letter here…"
                />
              ) : (
                <div className="cld-prev-wrap" ref={prevRef} role="region" aria-label="Cover letter preview">
                  <div className="cld-prev-inner" style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}>
                    <div
                      style={{ width: "794px", transform: `scale(${zoom})`, transformOrigin: "top left", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.12)" }}
                      dangerouslySetInnerHTML={{ __html: html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '') }}
                    />
                  </div>
                </div>
              )}

              {/* Save button (bottom) */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="cld-btn cld-btn-purple" onClick={() => router.push("/cover-letter")}>
                  + New Letter
                </button>
                <button className="cld-btn cld-btn-green" onClick={saveToCloud} disabled={saving}>
                  {saving ? <><span className="cld-spinner" /> Saving…</> : "💾 Save to Cloud"}
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {toast && <div className={`cld-toast ${toast.type}`} role="status">{toast.msg}</div>}
    </div>
  );
}
