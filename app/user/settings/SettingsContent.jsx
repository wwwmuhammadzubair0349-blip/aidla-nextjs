"use client";
// app/user/settings/page.jsx — Account Settings

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FIELDS = [
  { key: "full_name",          label: "Full Name",          type: "text",   placeholder: "Your full name" },
  { key: "phone",              label: "Phone Number",        type: "tel",    placeholder: "+92 300 1234567" },
  { key: "date_of_birth",      label: "Date of Birth",       type: "date",   placeholder: "" },
  { key: "city",               label: "City",                type: "text",   placeholder: "Karachi, Lahore…" },
  { key: "country",            label: "Country",             type: "text",   placeholder: "Pakistan" },
  { key: "educational_level",  label: "Education Level",     type: "select", options: ["Matric","Intermediate","Bachelor's","Master's","PhD","Other"] },
  { key: "profession",         label: "Profession",          type: "text",   placeholder: "Student, Engineer, Doctor…" },
  { key: "bio",                label: "Bio",                 type: "textarea",placeholder: "Tell others a bit about yourself…" },
];

const CSS = `
.st-wrap { font-family: 'DM Sans', system-ui, sans-serif; max-width: 680px; }
.st-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: #0f172a; margin-bottom: 20px; }
.st-tabs { display: flex; gap: 0; border-bottom: 2px solid #f1f5f9; margin-bottom: 24px; }
.st-tab {
  padding: 10px 18px; border: none; background: none;
  font-size: 0.84rem; font-weight: 700; color: #64748b;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; font-family: inherit;
  transition: color 0.15s;
}
.st-tab:hover { color: #0f172a; }
.st-tab.active { color: #1a3a8f; border-bottom-color: #1a3a8f; }
.st-section { margin-bottom: 28px; }
.st-section-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 14px; }
.st-avatar-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.st-avatar {
  width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
  border: 3px solid #f1f5f9; background: #f8faff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; overflow: hidden; flex-shrink: 0;
}
.st-avatar img { width: 100%; height: 100%; object-fit: cover; }
.st-avatar-btn {
  padding: 8px 16px; border-radius: 20px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #0f172a; font-weight: 700; font-size: 0.8rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.st-avatar-btn:hover { border-color: #1a3a8f; color: #1a3a8f; }
.st-field { margin-bottom: 14px; }
.st-label { display: block; font-size: 0.74rem; font-weight: 800; color: #475569; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em; }
.st-input, .st-select, .st-textarea {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.9rem; color: #0f172a; outline: none;
  font-family: inherit; background: #fafbff;
  transition: border-color 0.15s;
}
.st-input:focus, .st-select:focus, .st-textarea:focus { border-color: #1a3a8f; }
.st-textarea { resize: vertical; min-height: 80px; }
.st-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.st-save-btn {
  padding: 12px 28px; border: none; border-radius: 30px;
  background: linear-gradient(135deg, #1a3a8f, #3b82f6);
  color: #fff; font-weight: 800; font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: opacity 0.2s;
}
.st-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.st-flash { padding: 10px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; margin-bottom: 16px; }
.st-flash.ok  { background: #dcfce7; color: #166534; }
.st-flash.err { background: #fee2e2; color: #b91c1c; }
.st-password-section { display: flex; flex-direction: column; gap: 12px; }
.st-danger-btn {
  padding: 10px 20px; border-radius: 20px; border: 1.5px solid rgba(239,68,68,0.3);
  background: rgba(239,68,68,0.07); color: #dc2626; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; font-family: inherit;
}
.st-loading { display: flex; gap: 8px; align-items: center; padding: 12px 0; color: #94a3b8; font-size: 0.84rem; }
.st-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #e2e8f0; border-top-color: #1a3a8f; animation: st-spin 0.6s linear infinite; }
@keyframes st-spin { to { transform: rotate(360deg); } }
@media(max-width:480px) { .st-row2 { grid-template-columns: 1fr; } }
`;

export default function SettingsPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState("profile");
  const [profile,  setProfile]  = useState(null);
  const [form,     setForm]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [flash,    setFlash]    = useState({ msg: "", type: "ok" });
  const [email,    setEmail]    = useState("");
  const [uploading,setUploading]= useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email || "");
      const { data } = await supabase.from("users_profiles").select("*").eq("user_id", session.user.id).single();
      if (data) { setProfile(data); setForm(data); }
      setLoading(false);
    })();
  }, [router]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const saveProfile = async () => {
    setSaving(true);
    setFlash({ msg: "", type: "ok" });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from("users_profiles").update({
      full_name:        form.full_name        || null,
      phone:            form.phone            || null,
      date_of_birth:    form.date_of_birth    || null,
      city:             form.city             || null,
      country:          form.country          || null,
      educational_level:form.educational_level|| null,
      profession:       form.profession       || null,
      bio:              form.bio              || null,
    }).eq("user_id", session.user.id);
    setSaving(false);
    if (error) setFlash({ msg: "Failed to save: " + error.message, type: "err" });
    else       setFlash({ msg: "Profile saved ✓", type: "ok" });
    setTimeout(() => setFlash({ msg: "", type: "ok" }), 3000);
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ext  = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safe = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
    const path = `avatars/${session.user.id}.${safe}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setFlash({ msg: "Upload failed: " + upErr.message, type: "err" }); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("users_profiles").update({ avatar_url: pub.publicUrl }).eq("user_id", session.user.id);
    set("avatar_url", pub.publicUrl);
    setUploading(false);
    setFlash({ msg: "Photo updated ✓", type: "ok" });
  };

  const sendPasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setFlash({ msg: error.message, type: "err" });
    else       setFlash({ msg: "Password reset email sent — check your inbox", type: "ok" });
  };

  if (loading) return (
    <div className="st-wrap"><style>{CSS}</style>
      <div className="st-loading"><div className="st-spinner" />Loading settings…</div>
    </div>
  );

  return (
    <div className="st-wrap">
      <style>{CSS}</style>
      <div className="st-title">Settings</div>

      <div className="st-tabs" role="tablist">
        {[["profile","Profile"],["security","Security"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={`st-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {flash.msg && <div className={`st-flash ${flash.type}`}>{flash.msg}</div>}

      {/* Profile Tab */}
      {tab === "profile" && (
        <>
          {/* Avatar */}
          <div className="st-section">
            <div className="st-section-title">Profile Photo</div>
            <div className="st-avatar-row">
              <div className="st-avatar">
                {form.avatar_url
                  ? <img src={form.avatar_url} alt="Avatar" />
                  : <span>👤</span>}
              </div>
              <div>
                <label>
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => uploadAvatar(e.target.files?.[0])} />
                  <span className="st-avatar-btn" style={{ cursor: "pointer" }}>
                    {uploading ? "Uploading…" : "Change Photo"}
                  </span>
                </label>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 5 }}>JPG, PNG or WebP · max 5MB</div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="st-section">
            <div className="st-section-title">Personal Information</div>
            <div className="st-row2">
              <div className="st-field">
                <label className="st-label">Full Name</label>
                <input className="st-input" type="text" value={form.full_name || ""} onChange={e => set("full_name", e.target.value)} placeholder="Your full name" />
              </div>
              <div className="st-field">
                <label className="st-label">Phone</label>
                <input className="st-input" type="tel" value={form.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+92 300 1234567" />
              </div>
            </div>
            <div className="st-row2">
              <div className="st-field">
                <label className="st-label">Date of Birth</label>
                <input className="st-input" type="date" value={form.date_of_birth || ""} onChange={e => set("date_of_birth", e.target.value)} />
              </div>
              <div className="st-field">
                <label className="st-label">City</label>
                <input className="st-input" type="text" value={form.city || ""} onChange={e => set("city", e.target.value)} placeholder="Karachi, Lahore…" />
              </div>
            </div>
            <div className="st-row2">
              <div className="st-field">
                <label className="st-label">Country</label>
                <input className="st-input" type="text" value={form.country || ""} onChange={e => set("country", e.target.value)} placeholder="Pakistan" />
              </div>
              <div className="st-field">
                <label className="st-label">Profession</label>
                <input className="st-input" type="text" value={form.profession || ""} onChange={e => set("profession", e.target.value)} placeholder="Student, Engineer…" />
              </div>
            </div>
            <div className="st-field">
              <label className="st-label">Education Level</label>
              <select className="st-select" value={form.educational_level || ""} onChange={e => set("educational_level", e.target.value)}>
                <option value="">Select level</option>
                {["Matric","Intermediate","Bachelor's","Master's","PhD","Other"].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="st-field">
              <label className="st-label">Bio</label>
              <textarea className="st-textarea" value={form.bio || ""} onChange={e => set("bio", e.target.value)} placeholder="Tell others a bit about yourself…" rows={3} />
            </div>
          </div>

          <button className="st-save-btn" disabled={saving} onClick={saveProfile}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="st-section">
          <div className="st-section-title">Account</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Email address</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{email}</div>
          </div>
          <div className="st-section-title">Password</div>
          <div style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>
            We'll send a password reset link to your email address.
          </div>
          <button className="st-save-btn" onClick={sendPasswordReset}>Send Reset Link</button>
        </div>
      )}
    </div>
  );
}
