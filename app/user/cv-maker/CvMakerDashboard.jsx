"use client";
// app/user/cv-maker/CvMakerDashboard.jsx
// Authenticated CV maker dashboard.
// - Loads user's saved CVs from Supabase on mount
// - If CV was built via the wizard, it's already saved → loads automatically
// - User can switch between saved CVs, create new ones, and save changes
// - Wraps the existing CvMakerClient via a key-based remount pattern

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import CvMakerClient from "@/app/tools/career/cv-maker/CvMakerClient";

const STORAGE_KEY = "cvmk_v12_apex";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');

.cvd-root {
  font-family: 'Outfit', sans-serif;
  position: relative;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

/* Loading */
.cvd-loading {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #64748b;
}
.cvd-loading-spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: cvdSpin .7s linear infinite;
}
@keyframes cvdSpin { to { transform: rotate(360deg); } }
.cvd-loading-text { font-size: .88rem; font-weight: 600; }

/* Top bar */
.cvd-topbar {
  background: rgba(255,255,255,.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(37,99,235,.1);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow: 0 1px 8px rgba(11,20,55,.07);
}
@media (min-width: 960px) {
  .cvd-topbar { padding: 12px 28px; gap: 14px; }
}
.cvd-topbar-title {
  font-family: 'Sora', sans-serif;
  font-size: .88rem;
  font-weight: 800;
  color: #0b1437;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cvd-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 16px;
  border-radius: 99px;
  border: none;
  background: linear-gradient(135deg, #047857, #059669);
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: .78rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(4,120,87,.3);
  transition: transform .12s, box-shadow .12s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cvd-save-btn:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 5px 14px rgba(4,120,87,.4); }
.cvd-save-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.cvd-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1.5px solid rgba(37,99,235,.25);
  background: rgba(37,99,235,.06);
  color: #1e3a8a;
  font-family: 'Outfit', sans-serif;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .12s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cvd-new-btn:hover { background: rgba(37,99,235,.12); }

/* Hide text on very small screens to avoid topbar overflow */
@media (max-width: 380px) {
  .cvd-new-btn .cvd-btn-text { display: none; }
  .cvd-save-btn .cvd-btn-text { display: none; }
  .cvd-list-toggle .cvd-btn-text { display: none; }
}

/* CV list drawer */
.cvd-list-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 36px;
  padding: 0 14px;
  border-radius: 99px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #374151;
  font-family: 'Outfit', sans-serif;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .12s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cvd-list-toggle:hover { background: #f1f5f9; }

.cvd-list-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: min(320px, 90vw);
  height: 100dvh;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  box-shadow: 4px 0 20px rgba(0,0,0,.12);
  z-index: 999;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  visibility: hidden;
  transition: transform .28s cubic-bezier(.4,0,.2,1), visibility 0s linear .28s;
}
.cvd-list-panel.open {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s cubic-bezier(.4,0,.2,1), visibility 0s linear 0s;
}
.cvd-list-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  z-index: 998;
  opacity: 0;
  pointer-events: none;
  transition: opacity .28s;
}
.cvd-list-overlay.open {
  opacity: 1;
  pointer-events: all;
}

.cvd-list-head {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cvd-list-head-title {
  font-family: 'Sora', sans-serif;
  font-size: .9rem;
  font-weight: 800;
  color: #0b1437;
}
.cvd-list-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.cvd-list-close:hover { background: #f1f5f9; }

.cvd-list-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
}

.cvd-cv-item {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  -webkit-tap-highlight-color: transparent;
}
.cvd-cv-item:hover { border-color: #93c5fd; background: #f8fafc; }
.cvd-cv-item.active { border-color: #2563eb; background: #eff6ff; }
.cvd-cv-name { font-size: .82rem; font-weight: 700; color: #0b1437; margin-bottom: 3px; }
.cvd-cv-date { font-size: .66rem; color: #94a3b8; }
.cvd-cv-del {
  float: right;
  width: 26px; height: 26px;
  border-radius: 7px;
  border: 1px solid #fca5a5;
  background: #fef2f2;
  color: #7f1d1d;
  font-size: .7rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .1s;
  margin-left: 8px;
  flex-shrink: 0;
}
.cvd-cv-del:hover { background: #fee2e2; }

.cvd-list-new {
  padding: 12px;
  border-top: 1px solid #f1f5f9;
}
.cvd-list-new-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1.5px dashed #93c5fd;
  background: #eff6ff;
  color: #1e3a8a;
  font-family: 'Outfit', sans-serif;
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .12s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  -webkit-tap-highlight-color: transparent;
}
.cvd-list-new-btn:hover { background: #dbeafe; }

/* Toast */
.cvd-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: .82rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,.28);
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
  animation: cvdToastIn .2s ease;
}
.cvd-toast.ok  { background: #064e3b; }
.cvd-toast.err { background: #7f1d1d; }
@keyframes cvdToastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

/* Spinner inline */
.cvd-spin {
  width: 12px; height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: cvdSpin .6s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
`;

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CvMakerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cvs,          setCvs]          = useState([]);
  const [activeCvId,   setActiveCvId]   = useState(null);
  const [editorKey,    setEditorKey]    = useState(0);
  const [listOpen,     setListOpen]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [cvsLoading,   setCvsLoading]   = useState(true);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "inf", dur = 3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  };

  /* Load CVs from Supabase */
  useEffect(() => {
    if (!user) return;
    setCvsLoading(true);
    supabase
      .from("user_cvs")
      .select("id, name, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error("[CvMakerDashboard]", error); }
        if (data) setCvs(data);
        setCvsLoading(false);
      });
  }, [user]);

  /* On first load: load most recent CV (or create a blank one) into localStorage */
  useEffect(() => {
    if (cvsLoading || !user) return;
    if (cvs.length > 0) {
      loadCvIntoEditor(cvs[0].id, false);
    } else {
      // No saved CVs — start with a blank editor
      // (CvMakerClient already handles blank state from localStorage)
      setCvsLoading(false);
      setEditorKey(k => k + 1);
    }
  }, [cvsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Load a specific CV into localStorage and remount the editor */
  const loadCvIntoEditor = useCallback(async (cvId, showPanel = true) => {
    try {
      const { data, error } = await supabase
        .from("user_cvs")
        .select("*")
        .eq("id", cvId)
        .single();

      if (error || !data) { showToast("Could not load CV", "err"); return; }

      // Write to localStorage so CvMakerClient picks it up on mount
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data:     data.data     || {},
        tmpl:     data.template || "modern-stack",
        accent:   data.accent   || "#1e3a8a",
        fontId:   data.font_id  || "outfit",
        fontSize: data.font_size || "medium",
        paper:    data.paper    || "a4",
      }));

      setActiveCvId(cvId);
      setEditorKey(k => k + 1); // remount CvMakerClient
      if (showPanel) {
        setListOpen(false);
        showToast("CV loaded", "ok");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load CV", "err");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Save current editor state to Supabase */
  const saveToCloud = async () => {
    if (!user) return;
      setSaving(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { showToast("Nothing to save", "err"); return; }
        const sv = JSON.parse(raw);

        const payload = {
          data:      sv.data     || {},
          template:  sv.tmpl     || "modern-stack",
          accent:    sv.accent   || "#1e3a8a",
          font_id:   sv.fontId   || "outfit",
          font_size: sv.fontSize || "medium",
          paper:     sv.paper    || "a4",
          updated_at: new Date().toISOString(),
        };

        if (activeCvId) {
          await supabase.from("user_cvs").update(payload).eq("id", activeCvId);
          setCvs(prev => prev.map(c => c.id === activeCvId
            ? { ...c, updated_at: payload.updated_at }
            : c
          ));
          showToast("CV saved ✅", "ok");
        } else {
          const cvName = sv.data?.fullName ? `${sv.data.fullName}'s CV` : "My CV";
          const { data: newCv, error } = await supabase
            .from("user_cvs")
            .insert({ user_id: user.id, name: cvName, ...payload })
            .select()
            .single();

          if (error) throw error;
          setActiveCvId(newCv.id);
          setCvs(prev => [newCv, ...prev]);
          showToast("CV saved ✅", "ok");
        }
      } catch (err) {
        console.error(err);
        showToast("Save failed — please retry", "err");
      } finally {
        setSaving(false);
      }
    };

  /* Delete a CV */
  const deleteCv = async (cvId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this CV? This cannot be undone.")) return;
    const { error } = await supabase.from("user_cvs").delete().eq("id", cvId);
    if (error) { showToast("Delete failed", "err"); return; }
    const remaining = cvs.filter(c => c.id !== cvId);
    setCvs(remaining);
    if (activeCvId === cvId) {
      if (remaining.length > 0) {
        loadCvIntoEditor(remaining[0].id, false);
      } else {
        setActiveCvId(null);
        localStorage.removeItem(STORAGE_KEY);
        setEditorKey(k => k + 1);
      }
    }
    showToast("CV deleted", "ok");
  };

  /* New blank CV */
  const startNewCv = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveCvId(null);
    setEditorKey(k => k + 1);
    setListOpen(false);
    showToast("New CV started", "inf");
  };

  /* ── Auth / loading states ────────────────────────────────────────────── */
  if (authLoading || cvsLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="cvd-root">
          <div className="cvd-loading">
            <div className="cvd-loading-spinner" aria-hidden="true" />
            <div className="cvd-loading-text">
              {authLoading ? "Checking session…" : "Loading your CVs…"}
            </div>
          </div>
        </div>
      </>
    );
  }

  const activeCv = cvs.find(c => c.id === activeCvId);

  /* ── Main render ─────────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="cvd-root">

        {/* Top control bar */}
        <div className="cvd-topbar" role="toolbar" aria-label="CV manager">
          <button
            className="cvd-list-toggle"
            onClick={() => setListOpen(true)}
            aria-expanded={listOpen}
            aria-label="My saved CVs"
          >
            📄 <span className="cvd-btn-text">My CVs {cvs.length > 0 && `(${cvs.length})`}</span>
          </button>

          <span className="cvd-topbar-title">
            {activeCv?.name || "Unsaved CV"}
          </span>

          <button className="cvd-new-btn" onClick={startNewCv} aria-label="Start a new CV">
            + <span className="cvd-btn-text">New CV</span>
          </button>

          <button
            className="cvd-save-btn"
            onClick={saveToCloud}
            disabled={saving}
            aria-label="Save CV to cloud"
          >
            {saving
              ? <><span className="cvd-spin" aria-hidden="true" /> <span className="cvd-btn-text">Saving…</span></>
              : <>☁️ <span className="cvd-btn-text">Save</span></>}
          </button>
        </div>

        {/* CV list panel overlay */}
        <div
          className={`cvd-list-overlay${listOpen ? " open" : ""}`}
          onClick={() => setListOpen(false)}
          aria-hidden="true"
        />

        {/* CV list panel */}
        <aside
          className={`cvd-list-panel${listOpen ? " open" : ""}`}
          role="complementary"
          aria-label="Saved CVs"
          aria-hidden={!listOpen}
        >
          <div className="cvd-list-head">
            <span className="cvd-list-head-title">My CVs</span>
            <button className="cvd-list-close" onClick={() => setListOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="cvd-list-scroll">
            {cvs.length === 0 ? (
              <div style={{ padding:16, color:"#94a3b8", fontSize:".8rem", textAlign:"center" }}>
                No saved CVs yet. Save your current CV to see it here.
              </div>
            ) : cvs.map(cv => (
              <div
                key={cv.id}
                className={`cvd-cv-item${activeCvId === cv.id ? " active" : ""}`}
                onClick={() => loadCvIntoEditor(cv.id)}
                role="button"
                tabIndex={0}
                aria-label={`Load ${cv.name}`}
                onKeyDown={e => e.key === "Enter" && loadCvIntoEditor(cv.id)}
              >
                <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="cvd-cv-name">{cv.name}</div>
                    <div className="cvd-cv-date">Updated {formatDate(cv.updated_at)}</div>
                  </div>
                  <button
                    className="cvd-cv-del"
                    onClick={e => deleteCv(cv.id, e)}
                    aria-label={`Delete ${cv.name}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cvd-list-new">
            <button className="cvd-list-new-btn" onClick={startNewCv}>
              + Start New CV
            </button>
          </div>
        </aside>

        {/* Editor — remounts when editorKey changes */}
        <CvMakerClient key={editorKey} />

        {/* Toast */}
        {toast && (
          <div className={`cvd-toast ${toast.type}`} role="status" aria-live="polite">
            {toast.msg}
          </div>
        )}

      </div>
    </>
  );
}
