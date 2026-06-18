"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.err-wrap { font-family:'DM Sans',system-ui,sans-serif; color:#0f172a; }
.err-head { margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
.err-head h1 { font-size:1.4rem; font-weight:900; margin:0; }
.err-refresh { padding:7px 16px; background:#f1f5f9; border:1.5px solid #e2e8f0; border-radius:10px; font-weight:700; font-size:.82rem; cursor:pointer; }
.err-table { width:100%; border-collapse:collapse; }
.err-table th { text-align:left; font-size:.72rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.07em; padding:8px 12px; border-bottom:2px solid #f1f5f9; white-space:nowrap; }
.err-table td { padding:10px 12px; border-bottom:1px solid #f8fafc; font-size:.83rem; vertical-align:top; }
.err-table tr:last-child td { border-bottom:none; }
.err-msg { font-weight:700; color:#dc2626; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.err-url { font-size:.75rem; color:#64748b; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.err-stack { font-family:monospace; font-size:.72rem; color:#94a3b8; max-width:320px; max-height:48px; overflow:hidden; white-space:pre-wrap; line-height:1.4; }
.err-date { font-size:.75rem; color:#94a3b8; white-space:nowrap; }
.err-empty { text-align:center; padding:40px; color:#94a3b8; }
.err-shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sh .9s infinite; border-radius:8px; height:40px; margin-bottom:8px; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });
}

export default function AdminErrorsPage() {
  const [errors,  setErrors]  = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("platform_errors")
      .select("id,message,stack,url,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setErrors(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="err-wrap">
      <style>{CSS}</style>
      <div className="err-head">
        <h1>Error Log</h1>
        <button className="err-refresh" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        [1,2,3,4,5].map(i => <div key={i} className="err-shimmer" />)
      ) : errors.length === 0 ? (
        <div className="err-empty">
          <div style={{fontSize:"2rem",marginBottom:8}}>✅</div>
          No errors logged.
        </div>
      ) : (
        <table className="err-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Message</th>
              <th>URL</th>
              <th>Stack</th>
            </tr>
          </thead>
          <tbody>
            {errors.map(e => (
              <tr key={e.id}>
                <td className="err-date">{fmt(e.created_at)}</td>
                <td><div className="err-msg" title={e.message}>{e.message || "—"}</div></td>
                <td><div className="err-url" title={e.url}>{e.url || "—"}</div></td>
                <td><div className="err-stack">{e.stack || "—"}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
