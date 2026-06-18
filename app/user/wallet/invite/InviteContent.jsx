"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WalletInvite() {
  const [loading,    setLoading]    = useState(true);
  const [code,       setCode]       = useState("");
  const [refCount,   setRefCount]   = useState(0);
  const [msg,        setMsg]        = useState("");
  const [copied,     setCopied]     = useState(null);
  const [referrals,  setReferrals]  = useState([]);
  const [refLoading, setRefLoading] = useState(true);

  const inviteLink = useMemo(() => {
    if (!code) return "";
    return `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`;
  }, [code]);

  const shareText = useMemo(() => {
    if (!code) return "";
    return `Join AIDLA 🚀\n\nMy Invite Code: ${code}\nSignup Link: ${inviteLink}`;
  }, [code, inviteLink]);

  useEffect(() => {
    (async () => {
      setMsg(""); setLoading(true);
      const { data: u, error: uErr } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (uErr || !uid) { setMsg("Not logged in."); setLoading(false); return; }

      let { data: prof, error } = await supabase
        .from("users_profiles")
        .select("my_refer_code, full_name, my_referals")
        .eq("user_id", uid)
        .single();

      if (error && error.code === "PGRST116") {
        const email    = (u.user.email || "").toLowerCase();
        const fullName = u.user.user_metadata?.full_name || "User";
        const { error: insErr } = await supabase.from("users_profiles")
          .insert([{ user_id: uid, email, full_name: fullName }]);
        if (insErr) { setMsg(insErr.message); setLoading(false); return; }
        const res2 = await supabase.from("users_profiles")
          .select("my_refer_code, my_referals").eq("user_id", uid).single();
        prof = res2.data; error = res2.error;
      }

      if (error) { setMsg(error.message); setLoading(false); return; }

      if (!prof?.my_refer_code) {
        await supabase.from("users_profiles")
          .update({ my_refer_code: null }).eq("user_id", uid);
        const { data: prof2, error: e2 } = await supabase.from("users_profiles")
          .select("my_refer_code, my_referals").eq("user_id", uid).single();
        if (e2) { setMsg(e2.message); setLoading(false); return; }
        setCode(prof2.my_refer_code || "");
        setRefCount(prof2.my_referals || 0);
      } else {
        setCode(prof.my_refer_code);
        setRefCount(prof.my_referals || 0);
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setRefLoading(true);
      const { data, error } = await supabase
        .from("users_profiles")
        .select("full_name, email, created_at")
        .eq("referral_code_used", code)
        .order("created_at", { ascending: false });
      if (!error && data) setReferrals(data);
      setRefLoading(false);
    })();
  }, [code]);

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setMsg("Copy failed. Please copy manually.");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title:"Join AIDLA 🚀", text:`Join AIDLA with my invite code: ${code}`, url: inviteLink });
      } catch (e) {
        if (e.name !== "AbortError") setMsg("Share failed.");
      }
    } else {
      await copy(inviteLink, "link");
      setMsg("✅ Link copied! (Native share not supported on this browser)");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  }

  const css = `
    *{box-sizing:border-box}
    .invite-wrapper{font-family:'Inter',system-ui,-apple-system,sans-serif;animation:fadeIn .3s ease forwards;padding-bottom:30px}
    .page-title{font-size:1.5rem;font-weight:900;letter-spacing:-.5px;color:#1e3a8a;margin:0 0 18px 0}
    .stats-bar{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
    .stat-card{background:#fff;border-radius:14px;padding:14px;text-align:center;box-shadow:4px 4px 12px rgba(15,23,42,.06),-4px -4px 12px rgba(255,255,255,.9)}
    .stat-val{font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
    .stat-lbl{font-size:.65rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.6px;margin-top:5px}
    .code-card{background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);border-radius:18px;padding:20px;margin-bottom:12px;color:#fff;position:relative;overflow:hidden}
    .code-card::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}
    .code-card::after{content:'';position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.06)}
    .code-label{font-size:.65rem;font-weight:800;opacity:.75;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
    .code-value{font-size:2rem;font-weight:900;font-family:monospace;letter-spacing:3px;margin-bottom:16px}
    .code-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:relative;z-index:1}
    .code-btn{padding:11px;border-radius:11px;border:none;font-size:.78rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;font-family:inherit}
    .code-btn:active{transform:scale(.97)}
    .btn-white{background:rgba(255,255,255,.95);color:#1e3a8a}
    .btn-white.done{background:#d1fae5;color:#15803d}
    .btn-outline{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)}
    .btn-outline:hover{background:rgba(255,255,255,.25)}
    .link-card{background:#fff;border-radius:16px;padding:16px;margin-bottom:12px;box-shadow:4px 4px 12px rgba(15,23,42,.06),-4px -4px 12px rgba(255,255,255,.9)}
    .link-card-label{font-size:.65rem;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
    .link-text{font-size:.7rem;font-weight:600;color:#3b82f6;word-break:break-all;line-height:1.5;background:#f0f7ff;padding:10px;border-radius:10px;margin-bottom:10px}
    .link-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .action-btn{padding:11px;border-radius:11px;border:none;font-size:.78rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;font-family:inherit}
    .btn-primary{background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;box-shadow:0 3px 0 #1e3a8a}
    .btn-primary.done{background:linear-gradient(135deg,#15803d,#22c55e)}
    .btn-secondary{background:#f1f5f9;color:#334155;box-shadow:0 3px 0 #cbd5e1}
    .btn-secondary.done{background:#d1fae5;color:#15803d}
    .ref-section{margin-top:20px}
    .ref-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .ref-title{font-size:1rem;font-weight:800;color:#1e3a8a;margin:0}
    .ref-count-badge{background:#e0e7ff;color:#1e3a8a;font-size:.7rem;font-weight:800;padding:4px 10px;border-radius:20px}
    .ref-empty{text-align:center;padding:28px 20px;background:#f8fafc;border-radius:16px;color:#94a3b8;font-weight:600;font-size:.85rem;border:1px dashed #e2e8f0;line-height:1.7}
    .ref-list{display:flex;flex-direction:column;gap:8px}
    .ref-card{background:#fff;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:11px;box-shadow:3px 3px 10px rgba(15,23,42,.05);border:1px solid #f1f5f9}
    .ref-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-weight:900;font-size:.95rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .ref-info{flex:1;min-width:0}
    .ref-name{font-size:.8rem;font-weight:800;color:#1e3a8a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ref-email{font-size:.65rem;color:#94a3b8;margin-top:2px}
    .ref-date{font-size:.6rem;color:#94a3b8}
    .loader-wrap{display:flex;flex-direction:column;align-items:center;padding:40px;color:#64748b;font-weight:700;font-size:.9rem;gap:12px}
    .spinner{width:32px;height:32px;border:3px solid rgba(59,130,246,.2);border-top-color:#3b82f6;border-radius:50%;animation:spin .8s linear infinite}
    .msg-box{padding:11px 15px;border-radius:12px;font-weight:700;font-size:.82rem;margin-bottom:14px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  `;

  return (
    <div className="invite-wrapper">
      <style>{css}</style>
      <h2 className="page-title">🎁 Invite &amp; Earn</h2>

      {msg && (
        <div className="msg-box" role="alert"
          style={{ color: msg.includes("✅") ? "#047857" : "#b91c1c", background: msg.includes("✅") ? "#d1fae5" : "#fee2e2" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="loader-wrap"><div className="spinner"/>Loading invite details…</div>
      ) : (
        <>
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-val">{refCount}</div>
              <div className="stat-lbl">Total Referrals</div>
            </div>
            <div className="stat-card">
              <div className="stat-val" style={{ fontSize:"1.2rem" }}>{code || "—"}</div>
              <div className="stat-lbl">Your Code</div>
            </div>
          </div>

          <div className="code-card">
            <div className="code-label">Your Invite Code</div>
            <div className="code-value">{code || "—"}</div>
            <div className="code-actions">
              <button className={`code-btn btn-white${copied==="code"?" done":""}`}
                onClick={() => copy(code, "code")} disabled={!code}>
                {copied==="code" ? "✅ Copied!" : "📋 Copy Code"}
              </button>
              <button className="code-btn btn-outline" onClick={nativeShare} disabled={!code}>
                📤 Share Now
              </button>
            </div>
          </div>

          <div className="link-card">
            <div className="link-card-label">Invite Link</div>
            <div className="link-text">{inviteLink || "—"}</div>
            <div className="link-actions">
              <button className={`action-btn btn-primary${copied==="link"?" done":""}`}
                onClick={() => copy(inviteLink, "link")} disabled={!inviteLink}>
                {copied==="link" ? "✅ Copied!" : "🔗 Copy Link"}
              </button>
              <button className={`action-btn btn-secondary${copied==="msg"?" done":""}`}
                onClick={() => copy(shareText, "msg")} disabled={!shareText}>
                {copied==="msg" ? "✅ Copied!" : "📨 Copy Msg"}
              </button>
            </div>
          </div>

          <div className="ref-section">
            <div className="ref-header">
              <h3 className="ref-title">👥 My Referrals</h3>
              <span className="ref-count-badge">{referrals.length} joined</span>
            </div>
            {refLoading ? (
              <div className="loader-wrap" style={{ padding:20 }}><div className="spinner"/>Loading referrals…</div>
            ) : referrals.length === 0 ? (
              <div className="ref-empty">
                <div style={{ fontSize:"2rem", marginBottom:8 }}>🤝</div>
                No referrals yet.<br/>Share your code to start earning!
              </div>
            ) : (
              <div className="ref-list">
                {referrals.map((r, i) => (
                  <div className="ref-card" key={i}>
                    <div className="ref-avatar">{(r.full_name || r.email || "?")[0].toUpperCase()}</div>
                    <div className="ref-info">
                      <div className="ref-name">{r.full_name || "Unknown"}</div>
                      <div className="ref-email">
                        {r.email ? r.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c) : "—"}
                      </div>
                    </div>
                    <div className="ref-date">{formatDate(r.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
