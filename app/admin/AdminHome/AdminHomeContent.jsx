// app/admin/announcements/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ── Styles ── */
const S = `
  .ah-root { min-height:100vh; background:#f0f4ff; font-family:'DM Sans',sans-serif; padding:24px 16px; }
  .ah-inner { max-width:860px; margin:0 auto; }
  .ah-title { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:900; color:#0b1437; margin-bottom:4px; }
  .ah-sub   { color:#64748b; font-size:0.88rem; margin-bottom:28px; }
  .ah-card  { background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(11,20,55,0.08); margin-bottom:16px; border:1px solid rgba(59,130,246,0.08); }
  .ah-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .ah-card-title { font-weight:700; color:#0b1437; font-size:1rem; display:flex; align-items:center; gap:8px; }
  .ah-card-desc  { color:#64748b; font-size:0.83rem; margin-top:4px; }
  .ah-badge { display:inline-block; font-size:0.68rem; font-weight:700; padding:2px 9px; border-radius:20px; }
  .s-voting   { background:#dbeafe; color:#1e40af; }
  .s-selected { background:#fef3c7; color:#92400e; }
  .s-soon     { background:#dcfce7; color:#166534; }
  .s-live     { background:#d1fae5; color:#065f46; }
  .ah-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
  .ah-btn { padding:7px 14px; border-radius:8px; border:none; font-size:0.78rem; font-weight:700; cursor:pointer; transition:opacity 0.2s; font-family:'DM Sans',sans-serif; }
  .ah-btn:hover { opacity:0.82; }
  .btn-blue   { background:#3b82f6; color:#fff; }
  .btn-green  { background:#10b981; color:#fff; }
  .btn-gold   { background:#f59e0b; color:#0b1437; }
  .btn-red    { background:#ef4444; color:#fff; }
  .btn-navy   { background:#0b1437; color:#fff; }
  .btn-gray   { background:#e2e8f0; color:#334155; }
  .ah-votes   { font-size:0.8rem; color:#64748b; margin-top:8px; }
  .ah-divider { border:none; border-top:1px solid #f1f5f9; margin:28px 0 20px; }
  .ah-form    { background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(11,20,55,0.08); border:1px solid rgba(59,130,246,0.08); }
  .ah-form h3 { font-family:'Playfair Display',serif; color:#0b1437; font-size:1.1rem; margin-bottom:16px; }
  .ah-row   { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
  .ah-field { display:flex; flex-direction:column; gap:5px; flex:1; min-width:160px; }
  .ah-label { font-size:0.76rem; font-weight:700; color:#334155; text-transform:uppercase; letter-spacing:0.05em; }
  .ah-input { padding:9px 12px; border:1.5px solid rgba(59,130,246,0.18); border-radius:8px; font-size:0.88rem; color:#0b1437; outline:none; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; background:#fafbff; }
  .ah-input:focus { border-color:#3b82f6; }
  .ah-select { padding:9px 12px; border:1.5px solid rgba(59,130,246,0.18); border-radius:8px; font-size:0.88rem; color:#0b1437; outline:none; font-family:'DM Sans',sans-serif; background:#fafbff; cursor:pointer; }
  .ah-submit { padding:11px 28px; border-radius:50px; background:linear-gradient(135deg,#0b1437,#3b82f6); color:#fff; font-weight:700; font-size:0.9rem; border:none; cursor:pointer; transition:opacity 0.2s; font-family:'DM Sans',sans-serif; }
  .ah-submit:hover { opacity:0.88; }
  .ah-msg-ok  { background:#dcfce7; color:#166534; padding:10px 14px; border-radius:8px; font-size:0.84rem; font-weight:600; margin-bottom:12px; }
  .ah-msg-err { background:#fee2e2; color:#b91c1c; padding:10px 14px; border-radius:8px; font-size:0.84rem; font-weight:600; margin-bottom:12px; }
  .ah-empty   { color:#94a3b8; text-align:center; padding:32px; font-size:0.88rem; }
  .ah-launch-note { font-size:0.72rem; color:#059669; font-weight:700; margin-top:4px; }
  @media(max-width:520px){
    .ah-card-top { flex-direction:column; }
    .ah-row { flex-direction:column; }
  }
`;

const STATUS_OPTIONS = ["voting", "selected", "soon", "live"];

const statusLabel = {
  voting:   { cls: "s-voting",   txt: "🗳️ Voting" },
  selected: { cls: "s-selected", txt: "⭐ Shortlisted" },
  soon:     { cls: "s-soon",     txt: "📅 Coming Soon" },
  live:     { cls: "s-live",     txt: "🚀 Live" },
};

const EMPTY_FORM = { icon: "🚀", title: "", description: "", status: "voting", launch_date: "", sort_order: 0 };

export default function AdminHome() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState(null); // {type:"ok"|"err", text}

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { flash("err", "Title is required."); return; }
    setSaving(true);
    const payload = {
      icon:        form.icon.trim() || "🚀",
      title:       form.title.trim(),
      description: form.description.trim(),
      status:      form.status,
      launch_date: form.launch_date.trim() || null,
      sort_order:  parseInt(form.sort_order) || 0,
      is_visible:  true,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("announcements").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("announcements").insert(payload));
    }
    setSaving(false);
    if (error) { flash("err", "Error: " + error.message); return; }
    flash("ok", editId ? "Updated successfully!" : "Announcement added!");
    setForm(EMPTY_FORM);
    setEditId(null);
    fetchItems();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      icon:        item.icon || "🚀",
      title:       item.title || "",
      description: item.description || "",
      status:      item.status || "voting",
      launch_date: item.launch_date || "",
      sort_order:  item.sort_order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) flash("err", "Delete failed.");
    else { flash("ok", "Deleted."); fetchItems(); }
  };

  const handleToggleVisible = async (item) => {
    const { error } = await supabase
      .from("announcements")
      .update({ is_visible: !item.is_visible })
      .eq("id", item.id);
    if (!error) fetchItems();
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("announcements")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) fetchItems();
    else flash("err", "Status update failed.");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="ah-root">
      <style>{S}</style>
      <div className="ah-inner">

        <h1 className="ah-title">🗳️ Announcements Manager</h1>
        <p className="ah-sub">Add, edit, and manage upcoming feature announcements and voting cards shown on the homepage.</p>

        {/* ── Form ── */}
        <div className="ah-form">
          <h3>{editId ? "✏️ Edit Announcement" : "➕ Add New Announcement"}</h3>

          {msg && <div className={msg.type === "ok" ? "ah-msg-ok" : "ah-msg-err"}>{msg.text}</div>}

          <div className="ah-row">
            <div className="ah-field" style={{ maxWidth: 80 }}>
              <label className="ah-label">Icon</label>
              <input className="ah-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🚀" />
            </div>
            <div className="ah-field">
              <label className="ah-label">Title *</label>
              <input className="ah-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Past Papers Library" />
            </div>
            <div className="ah-field" style={{ maxWidth: 130 }}>
              <label className="ah-label">Status</label>
              <select className="ah-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{statusLabel[s].txt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ah-row">
            <div className="ah-field">
              <label className="ah-label">Description</label>
              <input className="ah-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description shown to users" />
            </div>
          </div>

          <div className="ah-row">
            <div className="ah-field">
              <label className="ah-label">Launch Date Text</label>
              <input className="ah-input" value={form.launch_date} onChange={e => setForm(f => ({ ...f, launch_date: e.target.value }))} placeholder="e.g. Launching March 15" />
            </div>
            <div className="ah-field" style={{ maxWidth: 120 }}>
              <label className="ah-label">Sort Order</label>
              <input className="ah-input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="0" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="ah-submit" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editId ? "Update" : "Add Announcement"}
            </button>
            {editId && (
              <button className="ah-btn btn-gray" onClick={handleCancelEdit}>Cancel</button>
            )}
          </div>
        </div>

        <hr className="ah-divider" />

        {/* ── List ── */}
        <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#0b1437", marginBottom: 16 }}>
          All Announcements ({items.length})
        </h3>

        {loading && <div className="ah-empty">Loading...</div>}

        {!loading && items.length === 0 && (
          <div className="ah-empty">No announcements yet. Add one above.</div>
        )}

        {!loading && items.map(item => {
          const s = statusLabel[item.status] || statusLabel.voting;
          return (
            <div className="ah-card" key={item.id} style={{ opacity: item.is_visible ? 1 : 0.5 }}>
              <div className="ah-card-top">
                <div>
                  <div className="ah-card-title">
                    <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                    {item.title}
                    <span className={`ah-badge ${s.cls}`}>{s.txt}</span>
                    {!item.is_visible && <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>(hidden)</span>}
                  </div>
                  {item.description && <div className="ah-card-desc">{item.description}</div>}
                  {item.launch_date && <div className="ah-launch-note">📅 {item.launch_date}</div>}
                  <div className="ah-votes">👍 {item.vote_count} votes · Sort: {item.sort_order}</div>
                </div>

                {/* Quick status change */}
                <select
                  className="ah-select"
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                  style={{ fontSize: "0.75rem", padding: "5px 8px", minWidth: 130 }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{statusLabel[s].txt}</option>
                  ))}
                </select>
              </div>

              <div className="ah-actions">
                <button className="ah-btn btn-blue"  onClick={() => handleEdit(item)}>✏️ Edit</button>
                <button className="ah-btn btn-gold"  onClick={() => handleToggleVisible(item)}>
                  {item.is_visible ? "👁️ Hide" : "👁️ Show"}
                </button>
                <button className="ah-btn btn-red"   onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}