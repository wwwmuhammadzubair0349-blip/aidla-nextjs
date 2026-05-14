// app/admin/email-blast/page.jsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const FROM_OPTIONS = [
  { value: "noreply@aidla.online",  label: "noreply@aidla.online" },
  { value: "ceo@aidla.online",      label: "ceo@aidla.online (CEO AIDLA)" },
];

const TABS = ["compose", "logs"];

/* ── helpers ── */
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-PK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function statusColor(s) {
  if (s === "sent")    return { bg: "rgba(5,150,105,0.1)",  color: "#047857" };
  if (s === "partial") return { bg: "rgba(245,158,11,0.1)", color: "#b45309" };
  return                      { bg: "rgba(220,38,38,0.1)",  color: "#dc2626" };
}

export default function EmailBlastPage() {
  const [tab, setTab] = useState("compose");

  /* ── compose state ── */
  const [users, setUsers]           = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [recipientMode, setRecipientMode] = useState("all"); // all | pick | paste
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(new Set());
  const [pasteEmails, setPasteEmails] = useState("");
  const [fromEmail, setFromEmail]   = useState(FROM_OPTIONS[0].value);
  const [fromName, setFromName]     = useState("AIDLA");
  const [subject, setSubject]       = useState("");
  const [html, setHtml]             = useState("");
  const [preview, setPreview]       = useState(false);
  const [sending, setSending]       = useState(false);
  const [sendResult, setSendResult] = useState(null);

  /* ── logs state ── */
  const [logs, setLogs]     = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  /* ── fetch users ── */
  useEffect(() => {
    supabase
      .from("users_profiles")
      .select("user_id,full_name,email")
      .order("full_name", { ascending: true })
      .then(({ data }) => { setUsers(data || []); setUsersLoading(false); });
  }, []);

  /* ── fetch logs ── */
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("email_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100);
    setLogs(data || []);
    setLogsLoading(false);
  }, []);

  useEffect(() => { if (tab === "logs") fetchLogs(); }, [tab, fetchLogs]);

  /* ── derived ── */
  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  function getRecipientEmails() {
    if (recipientMode === "all")   return users.map(u => u.email).filter(Boolean);
    if (recipientMode === "paste") return pasteEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes("@"));
    return users.filter(u => selected.has(u.user_id)).map(u => u.email).filter(Boolean);
  }

  const recipients = getRecipientEmails();

  function toggleUser(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filteredUsers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredUsers.map(u => u.user_id)));
    }
  }

  async function handleSend() {
    if (!subject.trim())          return alert("Subject is required.");
    if (!html.trim())             return alert("Email body is required.");
    if (recipients.length === 0)  return alert("No recipients selected.");
    if (!confirm(`Send to ${recipients.length} recipient(s)?`)) return;

    setSending(true);
    setSendResult(null);

    const { data, error } = await supabase.functions.invoke("send-blast-email", {
      body: { to: recipients, subject, html, from_email: fromEmail, from_name: fromName },
    });

    setSending(false);

    if (error) { setSendResult({ ok: false, error: error.message }); return; }

    const result = data;
    setSendResult(result);

    // Log to email_logs table
    await supabase.from("email_logs").insert({
      subject,
      html_body: html,
      from_email: fromEmail,
      from_name: fromName,
      recipients: recipients,
      recipient_count: recipients.length,
      sent_count: result.sent_count ?? recipients.length,
      failed_count: result.failed_count ?? 0,
      failed_emails: result.failed ?? [],
      status: result.failed_count > 0
        ? (result.sent_count > 0 ? "partial" : "failed")
        : "sent",
    });
  }

  /* ── styles ── */
  const inp = { width: "100%", padding: "9px 13px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: "0.88rem", boxSizing: "border-box", fontFamily: "inherit" };
  const label = { display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };
  const th = { padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", fontSize: "0.84rem", color: "#334155", verticalAlign: "top", borderBottom: "1px solid #f1f5f9" };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#0b1437", maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>Email Blast</h1>
          <p style={{ color: "#64748b", fontSize: "0.83rem", margin: "4px 0 0" }}>Send emails to users via Resend</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 18px", borderRadius: 20, border: "1px solid",
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", textTransform: "capitalize",
              background: tab === t ? "#1e3a8a" : "transparent",
              color: tab === t ? "#fff" : "#64748b",
              borderColor: tab === t ? "#1e3a8a" : "#e2e8f0",
            }}>
              {t === "compose" ? "✉ Compose" : "📋 Sent Logs"}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ COMPOSE TAB ══════════ */}
      {tab === "compose" && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>

          {/* Left — Recipients */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", marginBottom: 14, color: "#0b1437" }}>Recipients</div>

            {/* Mode selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {[["all", "All Users"], ["pick", "Pick Users"], ["paste", "Paste Emails"]].map(([v, l]) => (
                <button key={v} onClick={() => setRecipientMode(v)} style={{
                  padding: "5px 12px", borderRadius: 16, border: "1px solid",
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                  background: recipientMode === v ? "#1e3a8a" : "transparent",
                  color: recipientMode === v ? "#fff" : "#64748b",
                  borderColor: recipientMode === v ? "#1e3a8a" : "#e2e8f0",
                }}>{l}</button>
              ))}
            </div>

            {/* All users */}
            {recipientMode === "all" && (
              <div style={{ background: "#e0f2fe", borderRadius: 8, padding: "10px 14px", fontSize: "0.84rem", color: "#0369a1", fontWeight: 600 }}>
                {usersLoading ? "Loading…" : `${users.length} users will receive this email`}
              </div>
            )}

            {/* Pick users */}
            {recipientMode === "pick" && (
              <>
                <input
                  placeholder="Search name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ ...inp, marginBottom: 10 }}
                />
                <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                  <div
                    onClick={toggleAll}
                    style={{ padding: "8px 12px", fontSize: "0.78rem", fontWeight: 700, color: "#1e3a8a", cursor: "pointer", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}
                  >
                    {selected.size === filteredUsers.length && filteredUsers.length > 0 ? "Deselect All" : `Select All (${filteredUsers.length})`}
                  </div>
                  {filteredUsers.map(u => (
                    <label key={u.user_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", background: selected.has(u.user_id) ? "rgba(30,58,138,0.04)" : "#fff" }}>
                      <input type="checkbox" checked={selected.has(u.user_id)} onChange={() => toggleUser(u.user_id)} style={{ accentColor: "#1e3a8a" }} />
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>{u.full_name || "—"}</div>
                        <div style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{u.email}</div>
                      </div>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && <div style={{ padding: 16, color: "#94a3b8", fontSize: "0.82rem", textAlign: "center" }}>No users found</div>}
                </div>
                {selected.size > 0 && (
                  <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#1e3a8a", fontWeight: 700 }}>
                    {selected.size} selected
                  </div>
                )}
              </>
            )}

            {/* Paste */}
            {recipientMode === "paste" && (
              <textarea
                value={pasteEmails}
                onChange={e => setPasteEmails(e.target.value)}
                placeholder={"Paste emails separated by comma, semicolon, or newline:\nemail1@example.com\nemail2@example.com"}
                rows={8}
                style={{ ...inp, resize: "vertical" }}
              />
            )}

            {/* Recipient count badge */}
            <div style={{ marginTop: 14, padding: "8px 14px", borderRadius: 8, background: recipients.length > 0 ? "rgba(5,150,105,0.08)" : "#f1f5f9", fontSize: "0.82rem", fontWeight: 700, color: recipients.length > 0 ? "#047857" : "#94a3b8" }}>
              {recipients.length > 0 ? `✓ ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}` : "No recipients yet"}
            </div>
          </div>

          {/* Right — Compose */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* From */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={label}>From Email</label>
                <select value={fromEmail} onChange={e => setFromEmail(e.target.value)} style={inp}>
                  {FROM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>From Name</label>
                <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="AIDLA" style={inp} />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label style={label}>Subject <span style={{ color: "#dc2626" }}>*</span></label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your email subject…" style={inp} />
              <div style={{ fontSize: "0.72rem", color: subject.length > 80 ? "#dc2626" : "#94a3b8", marginTop: 3, textAlign: "right" }}>{subject.length}/80 chars</div>
            </div>

            {/* HTML body */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ ...label, margin: 0 }}>HTML Body <span style={{ color: "#dc2626" }}>*</span></label>
                <button onClick={() => setPreview(p => !p)} style={{ fontSize: "0.75rem", color: "#1e3a8a", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  {preview ? "Edit HTML" : "Preview"}
                </button>
              </div>
              {preview ? (
                <div
                  style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, minHeight: 300, background: "#fff", fontSize: "0.9rem" }}
                  dangerouslySetInnerHTML={{ __html: html || "<p style='color:#94a3b8'>Nothing to preview yet…</p>" }}
                />
              ) : (
                <textarea
                  value={html}
                  onChange={e => setHtml(e.target.value)}
                  placeholder={"<h2>Hello {{name}},</h2>\n<p>Your message here…</p>"}
                  rows={14}
                  style={{ ...inp, fontFamily: "monospace", fontSize: "0.82rem", lineHeight: 1.6, resize: "vertical" }}
                />
              )}
            </div>

            {/* Send result */}
            {sendResult && (
              <div style={{
                padding: "12px 16px", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
                background: sendResult.ok ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
                color: sendResult.ok ? "#047857" : "#dc2626",
                border: `1px solid ${sendResult.ok ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
              }}>
                {sendResult.ok
                  ? `✓ Sent to ${sendResult.sent_count} recipient(s)${sendResult.failed_count > 0 ? ` · ${sendResult.failed_count} failed` : ""}`
                  : `✗ Error: ${sendResult.error}`}
                {sendResult.failed?.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: "0.75rem", color: "#b45309" }}>
                    Failed: {sendResult.failed.map(f => f.email).join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: "12px 28px", borderRadius: 10, border: "none", fontWeight: 800, fontSize: "0.95rem",
                background: sending ? "#e2e8f0" : "linear-gradient(135deg,#1e3a8a,#3b82f6)",
                color: sending ? "#94a3b8" : "#fff", cursor: sending ? "not-allowed" : "pointer",
                alignSelf: "flex-start", boxShadow: sending ? "none" : "0 4px 14px rgba(30,58,138,0.3)",
              }}
            >
              {sending ? "Sending…" : `Send to ${recipients.length} Recipient${recipients.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ LOGS TAB ══════════ */}
      {tab === "logs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{logs.length} emails logged</div>
            <button onClick={fetchLogs} style={{ fontSize: "0.78rem", color: "#1e3a8a", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>↻ Refresh</button>
          </div>

          {logsLoading ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading…</p>
          ) : logs.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No emails sent yet.</p>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={th}>Subject</th>
                    <th style={th}>From</th>
                    <th style={th}>Recipients</th>
                    <th style={th}>Sent</th>
                    <th style={th}>Failed</th>
                    <th style={th}>Status</th>
                    <th style={th}>Date</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const sc = statusColor(log.status);
                    const isExpanded = expandedLog === log.id;
                    return (
                      <>
                        <tr key={log.id} style={{ background: "#fff" }}>
                          <td style={{ ...td, maxWidth: 200, fontWeight: 600 }}>
                            <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {log.subject}
                            </span>
                          </td>
                          <td style={{ ...td, fontSize: "0.76rem", color: "#64748b" }}>{log.from_email}</td>
                          <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{log.recipient_count}</td>
                          <td style={{ ...td, textAlign: "center", color: "#047857", fontWeight: 700 }}>{log.sent_count ?? "—"}</td>
                          <td style={{ ...td, textAlign: "center", color: log.failed_count > 0 ? "#dc2626" : "#94a3b8", fontWeight: 700 }}>
                            {log.failed_count ?? 0}
                          </td>
                          <td style={td}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: sc.bg, color: sc.color }}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ ...td, fontSize: "0.76rem", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(log.sent_at)}</td>
                          <td style={td}>
                            <button
                              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                              style={{ fontSize: "0.75rem", color: "#1e3a8a", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                            >
                              {isExpanded ? "▲ Hide" : "▼ Details"}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${log.id}-exp`} style={{ background: "#f8fafc" }}>
                            <td colSpan={8} style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Recipients</div>
                                  <div style={{ maxHeight: 120, overflowY: "auto", fontSize: "0.78rem", color: "#334155", lineHeight: 1.7 }}>
                                    {(log.recipients || []).join(", ") || "—"}
                                  </div>
                                  {log.failed_emails?.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", marginBottom: 4, textTransform: "uppercase" }}>Failed</div>
                                      <div style={{ fontSize: "0.78rem", color: "#dc2626" }}>
                                        {log.failed_emails.map(f => f.email || f).join(", ")}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>Email Preview</div>
                                  <div
                                    style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#fff", fontSize: "0.82rem", maxHeight: 200, overflowY: "auto" }}
                                    dangerouslySetInnerHTML={{ __html: log.html_body || "" }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
