"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.roles-wrap { font-family:'DM Sans',system-ui,sans-serif; color:#0f172a; }
.roles-head { margin-bottom:24px; }
.roles-head h1 { font-size:1.4rem; font-weight:900; margin:0 0 4px; }
.roles-head p { font-size:.85rem; color:#64748b; margin:0; }
.roles-add { background:#fff; border:1px solid #dbe5f3; border-radius:16px; padding:20px; margin-bottom:24px; }
.roles-add h2 { font-size:.95rem; font-weight:800; margin:0 0 14px; }
.roles-form { display:flex; gap:10px; flex-wrap:wrap; }
.roles-input { flex:1; min-width:180px; padding:9px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:.87rem; font-family:inherit; outline:none; }
.roles-input:focus { border-color:#3b82f6; }
.roles-select { padding:9px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:.87rem; font-family:inherit; outline:none; background:#fff; }
.roles-btn { padding:9px 18px; background:linear-gradient(135deg,#1e3a8a,#3b82f6); color:#fff; border:none; border-radius:10px; font-weight:800; font-size:.85rem; cursor:pointer; white-space:nowrap; }
.roles-btn:disabled { opacity:.5; cursor:not-allowed; }
.roles-btn.danger { background:linear-gradient(135deg,#dc2626,#ef4444); }
.roles-msg { margin-top:10px; font-size:.82rem; font-weight:700; padding:8px 12px; border-radius:8px; }
.roles-table { width:100%; border-collapse:collapse; }
.roles-table th { text-align:left; font-size:.73rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; padding:8px 12px; border-bottom:2px solid #f1f5f9; }
.roles-table td { padding:12px; border-bottom:1px solid #f8fafc; font-size:.86rem; vertical-align:middle; }
.roles-table tr:last-child td { border-bottom:none; }
.roles-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:.73rem; font-weight:800; }
.roles-badge.super_admin { background:#fef3c7; color:#92400e; }
.roles-badge.admin        { background:#dbeafe; color:#1e3a8a; }
.roles-badge.moderator    { background:#dcfce7; color:#166534; }
.roles-badge.active   { background:#dcfce7; color:#166534; }
.roles-badge.inactive { background:#fee2e2; color:#b91c1c; }
.roles-card { background:#fff; border:1px solid #dbe5f3; border-radius:16px; padding:20px; }
.roles-empty { text-align:center; padding:32px; color:#94a3b8; font-size:.88rem; }
.roles-shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sh .9s infinite; border-radius:8px; height:44px; margin-bottom:8px; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default function AdminRolesPage() {
  const [roles,    setRoles]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [email,    setEmail]    = useState("");
  const [role,     setRole]     = useState("admin");
  const [notes,    setNotes]    = useState("");
  const [msg,      setMsg]      = useState({ text:"", ok:true });
  const [adding,   setAdding]   = useState(false);

  async function loadRoles() {
    const { data } = await supabase
      .from("admin_roles")
      .select("*")
      .order("granted_at", { ascending: false });
    setRoles(data || []);
    setLoading(false);
  }

  useEffect(() => { loadRoles(); }, []);

  async function addAdmin() {
    if (!email.trim()) return;
    setAdding(true);
    setMsg({ text:"", ok:true });

    // Lookup user by email
    const { data: prof } = await supabase
      .from("users_profiles")
      .select("user_id, full_name")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (!prof?.user_id) {
      setMsg({ text: "No user found with that email.", ok: false });
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("admin_roles").upsert({
      user_id:    prof.user_id,
      email:      email.trim().toLowerCase(),
      role,
      notes:      notes.trim() || null,
      is_active:  true,
      granted_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      setMsg({ text: error.message, ok: false });
    } else {
      setMsg({ text: `Admin role granted to ${prof.full_name || email}.`, ok: true });
      setEmail(""); setNotes("");
      loadRoles();
    }
    setAdding(false);
  }

  async function toggleActive(id, current) {
    await supabase.from("admin_roles").update({ is_active: !current }).eq("id", id);
    loadRoles();
  }

  return (
    <div className="roles-wrap">
      <style>{CSS}</style>
      <div className="roles-head">
        <h1>Admin Role Management</h1>
        <p>Grant, revoke and manage admin access. Changes take effect immediately.</p>
      </div>

      <div className="roles-add">
        <h2>Grant Admin Access</h2>
        <div className="roles-form">
          <input className="roles-input" placeholder="User email address" value={email} onChange={e => setEmail(e.target.value)} />
          <select className="roles-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <input className="roles-input" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{minWidth:120}} />
          <button className="roles-btn" onClick={addAdmin} disabled={adding || !email.trim()}>
            {adding ? "Adding…" : "Grant Access"}
          </button>
        </div>
        {msg.text && (
          <div className="roles-msg" style={{ background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#b91c1c" }}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="roles-card">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="roles-shimmer" />)
        ) : roles.length === 0 ? (
          <div className="roles-empty">No admin roles configured yet.</div>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Granted</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight:700}}>{r.email}</td>
                  <td><span className={`roles-badge ${r.role}`}>{r.role}</span></td>
                  <td><span className={`roles-badge ${r.is_active ? "active" : "inactive"}`}>{r.is_active ? "Active" : "Revoked"}</span></td>
                  <td style={{color:"#94a3b8",fontSize:".78rem"}}>{fmt(r.granted_at)}</td>
                  <td style={{color:"#64748b",fontSize:".82rem",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.notes || "—"}</td>
                  <td>
                    <button className={`roles-btn${r.is_active ? " danger" : ""}`}
                      style={{padding:"5px 12px",fontSize:".75rem"}}
                      onClick={() => toggleActive(r.id, r.is_active)}>
                      {r.is_active ? "Revoke" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
