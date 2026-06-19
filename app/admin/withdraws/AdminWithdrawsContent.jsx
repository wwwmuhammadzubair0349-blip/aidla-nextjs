"use client";
// app/admin/withdraws/page.jsx

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "zkafridi317@gmail.com";

function fmt(n, d = 2) { return Number(n || 0).toFixed(d); }

function statusBadge(s) {
  const map = {
    pending:  { bg: "#fef3c7", col: "#92400e", label: "⏳ Pending" },
    approved: { bg: "#dcfce7", col: "#166534", label: "✅ Approved" },
    rejected: { bg: "#fee2e2", col: "#b91c1c", label: "❌ Rejected" },
  };
  const d = map[s] || map.pending;
  return <span style={{ background: d.bg, color: d.col, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{d.label}</span>;
}

// ─── Receipt Modal ───────────────────────────────────────────
function ReceiptModal({ req, onClose }) {
  if (!req) return null;
  const symbol = req.currency === "USD" ? "$" : "₨";
  const fees   = Array.isArray(req.fees_snapshot) ? req.fees_snapshot : [];
  const pd     = req.payment_details || {};

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <strong style={{ fontSize: 16, color: "#1e3a8a" }}>🧾 Withdrawal Receipt</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={S.receiptBox}>
          <div style={{ textAlign: "center", fontWeight: 900, fontSize: 20, color: "#1e3a8a", marginBottom: 4 }}>AIDLA</div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>{req.txn_no}</div>

          <RRow label="User"       value={req.user_email} />
          <RRow label="Date"       value={new Date(req.created_at).toLocaleString()} />
          <RRow label="Status"     value={req.status.toUpperCase()} />
          <RRow label="Currency"   value={req.currency} />
          <RRow label="Method"     value={req.method} />
          {pd.platform    && <RRow label="Platform"    value={pd.platform} />}
          {pd.address     && <RRow label="Address"     value={pd.address} />}
          {pd.wallet_name && <RRow label="Wallet"      value={pd.wallet_name} />}
          {pd.account_no  && <RRow label="Account No." value={pd.account_no} />}
          {pd.iban        && <RRow label="IBAN"        value={pd.iban} />}
          {pd.holder_name && <RRow label="Holder"      value={pd.holder_name} />}
          {pd.bank_name   && <RRow label="Bank"        value={pd.bank_name} />}
          {pd.whatsapp    && <RRow label="WhatsApp"    value={pd.whatsapp} />}

          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "8px 0" }} />
          <RRow label="Coins"       value={fmt(req.coins_requested, 0)} />
          <RRow label="Gross"       value={`${symbol}${fmt(req.gross_fiat)}`} />
          {fees.map((f, i) => <RRow key={i} label={`${f.name} (${f.pct}%)`} value={`-${symbol}${fmt(f.amount)}`} small />)}
          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "8px 0" }} />
          <RRow label="Total Fees" value={`-${symbol}${fmt(req.total_fee_fiat)}`} />
          <RRow label="Net Payout" value={`${symbol}${fmt(req.net_fiat)}`} bold />

          {req.admin_note && (
            <div style={{ marginTop: 10, background: "#fffbeb", padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
              <strong>Admin Note:</strong> {req.admin_note}
            </div>
          )}
          {req.acted_at && <RRow label="Acted At" value={new Date(req.acted_at).toLocaleString()} />}
        </div>
        <button onClick={onClose} style={{ ...S.btn, marginTop: 14, width: "100%" }}>Close</button>
      </div>
    </div>
  );
}

function RRow({ label, value, bold, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: small ? 11 : 13, fontFamily: "'Courier New', monospace" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: bold ? "#1e3a8a" : "#0f172a", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────
export default function AdminWithdraws() {
  const [loading,    setLoading]    = useState(true);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("requests");
  const [requests,   setRequests]   = useState([]);
  const [settings,   setSettings]   = useState(null);
  const [fees,       setFees]       = useState([]);
  const [receipt,    setReceipt]    = useState(null);
  const [actionMsg,  setActionMsg]  = useState({ id: null, text: "", ok: true });
  const [noteInputs, setNoteInputs] = useState({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCurrency, setFilterCurrency] = useState("all");

  // settings edit state
  const [editSettings, setEditSettings] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // new fee form
  const [newFee, setNewFee] = useState({ name: "", percentage: "" });
  const [savingFee, setSavingFee] = useState(false);

  // ── auth check ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        alert("Access Denied");
        window.location.href = "/";
        return;
      }
      setIsAdmin(true);
      loadAll();
    });
  }, []);

  const loadAll = useCallback(async () => {
    const { data, error } = await supabase.rpc("wd_admin_get_all");
    if (error) { console.error("wd_admin_get_all:", error); setLoading(false); return; }
    if (data?.requests) setRequests(data.requests);
    if (data?.settings) { setSettings(data.settings); setEditSettings(data.settings); }
    if (data?.fees)     setFees(data.fees);
    setLoading(false);
  }, []);

  // ── approve ──
  const handleApprove = async (req) => {
    const note = noteInputs[req.id] || "";
    const { data, error } = await supabase.rpc("wd_approve", { p_withdrawal_id: req.id, p_admin_note: note });
    if (error || !data?.ok) {
      setActionMsg({ id: req.id, text: error?.message || data?.error || "Failed", ok: false });
      return;
    }
    // email
    try {
      await sendNotifyEmail(req, "approved", note);
    } catch (_) {}
    setActionMsg({ id: req.id, text: "✅ Approved!", ok: true });
    await loadAll();
  };

  // ── reject ──
  const handleReject = async (req) => {
    const note = noteInputs[req.id] || "";
    if (!note) { setActionMsg({ id: req.id, text: "Please enter a rejection reason.", ok: false }); return; }
    const { data, error } = await supabase.rpc("wd_reject", { p_withdrawal_id: req.id, p_admin_note: note });
    if (error || !data?.ok) {
      setActionMsg({ id: req.id, text: error?.message || data?.error || "Failed", ok: false });
      return;
    }
    try {
      await sendNotifyEmail(req, "rejected", note);
    } catch (_) {}
    setActionMsg({ id: req.id, text: "❌ Rejected & coins returned.", ok: true });
    await loadAll();
  };

  async function sendNotifyEmail(req, status, note) {
    const { data: profData } = await supabase
      .from("users_profiles")
      .select("full_name")
      .eq("user_id", req.user_id)
      .single();

    await supabase.functions.invoke("withdraw-notify", {
      body: {
        user_email: req.user_email,
        user_name:  profData?.full_name || "User",
        status,
        txn_no:     req.txn_no,
        coins:      req.coins_requested,
        net_fiat:   req.net_fiat,
        currency:   req.currency,
        method:     req.method,
        admin_note: note,
      },
    });
  }

  // ── save settings ──
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const { data, error } = await supabase.rpc("wd_admin_save_settings", {
      p_coin_price_pkr: parseFloat(editSettings.coin_price_pkr),
      p_coin_price_usd: parseFloat(editSettings.coin_price_usd),
      p_min_coins:      parseFloat(editSettings.min_coins),
    });
    setSavingSettings(false);
    setSettingsMsg(error || !data?.ok ? "❌ " + (error?.message || data?.error || "Failed") : "✅ Settings saved!");
    setTimeout(() => setSettingsMsg(""), 3000);
    await loadAll();
  };

  // ── add fee ──
  const handleAddFee = async () => {
    if (!newFee.name || !newFee.percentage) return;
    setSavingFee(true);
    await supabase.rpc("wd_admin_manage_fee", {
      p_action:     "add",
      p_name:       newFee.name,
      p_percentage: parseFloat(newFee.percentage),
    });
    setNewFee({ name: "", percentage: "" });
    setSavingFee(false);
    await loadAll();
  };

  // ── toggle fee active ──
  const handleToggleFee = async (fee) => {
    await supabase.rpc("wd_admin_manage_fee", { p_action: "toggle", p_fee_id: fee.id });
    await loadAll();
  };

  // ── delete fee ──
  const handleDeleteFee = async (id) => {
    if (!confirm("Delete this fee type?")) return;
    await supabase.rpc("wd_admin_manage_fee", { p_action: "delete", p_fee_id: id });
    await loadAll();
  };

  // ── update fee pct ──
  const handleUpdateFee = async (id, pct) => {
    await supabase.rpc("wd_admin_manage_fee", { p_action: "update", p_fee_id: id, p_percentage: parseFloat(pct) });
    await loadAll();
  };

  if (loading || !isAdmin) return <div style={{ padding: 40, color: "#64748b" }}>Loading…</div>;

  const filtered = requests.filter(r => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterCurrency !== "all" && r.currency !== filterCurrency) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <>
      <style>{CSS}</style>
      <ReceiptModal req={receipt} onClose={() => setReceipt(null)} />

      <div style={S.page}>
        <div style={S.header}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
            💸 Withdraw Management
            {pendingCount > 0 && <span style={S.badge}>{pendingCount} pending</span>}
          </h1>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {["requests", "settings", "fees"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }}>
              {t === "requests" ? "📋 Requests" : t === "settings" ? "⚙️ Settings" : "💰 Fee Types"}
            </button>
          ))}
        </div>

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <div style={S.card}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <select style={S.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select style={S.select} value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)}>
                <option value="all">All Currency</option>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
              <span style={{ alignSelf: "center", fontSize: 13, color: "#64748b" }}>{filtered.length} records</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No requests found.</div>
            ) : (
              filtered.map(req => <RequestCard key={req.id} req={req}
                noteInputs={noteInputs} setNoteInputs={setNoteInputs}
                actionMsg={actionMsg} onApprove={handleApprove} onReject={handleReject}
                onReceipt={() => setReceipt(req)} />)
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>Coin Price & Minimum</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <SettingField label="PKR per Coin" val={editSettings.coin_price_pkr}
                onChange={v => setEditSettings(x => ({ ...x, coin_price_pkr: v }))} />
              <SettingField label="USD per Coin" val={editSettings.coin_price_usd}
                onChange={v => setEditSettings(x => ({ ...x, coin_price_usd: v }))} />
              <SettingField label="Min Coins" val={editSettings.min_coins}
                onChange={v => setEditSettings(x => ({ ...x, min_coins: v }))} />
            </div>
            {settingsMsg && (
              <div style={{ ...S.msgBox, background: settingsMsg.startsWith("✅") ? "#dcfce7" : "#fee2e2",
                color: settingsMsg.startsWith("✅") ? "#166534" : "#b91c1c", marginTop: 12 }}>{settingsMsg}</div>
            )}
            <button style={{ ...S.btn, marginTop: 16 }} disabled={savingSettings} onClick={handleSaveSettings}>
              {savingSettings ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}

        {/* ── FEES TAB ── */}
        {activeTab === "fees" && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>Fee Types</h3>

            {/* Add new fee */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", background: "#f8fafc", padding: 14, borderRadius: 10 }}>
              <input style={{ ...S.input, flex: 2, minWidth: 140 }} placeholder="Fee name (e.g. Exchange Fee)"
                value={newFee.name} onChange={e => setNewFee(x => ({ ...x, name: e.target.value }))} />
              <input style={{ ...S.input, flex: 1, minWidth: 100 }} type="number" placeholder="% (e.g. 1.5)"
                value={newFee.percentage} onChange={e => setNewFee(x => ({ ...x, percentage: e.target.value }))} />
              <button style={S.btn} disabled={savingFee || !newFee.name || !newFee.percentage} onClick={handleAddFee}>
                {savingFee ? "Adding…" : "+ Add Fee"}
              </button>
            </div>

            <table style={S.table}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Percentage", "Status", "Edit %", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map(f => (
                  <FeeRow key={f.id} fee={f}
                    onToggle={() => handleToggleFee(f)}
                    onDelete={() => handleDeleteFee(f.id)}
                    onUpdate={(pct) => handleUpdateFee(f.id, pct)} />
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 14, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e3a8a" }}>
              <strong>Total active fees:</strong>{" "}
              {fees.filter(f => f.is_active).reduce((s, f) => s + Number(f.percentage), 0).toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Request Card ────────────────────────────────────────────
function RequestCard({ req, noteInputs, setNoteInputs, actionMsg, onApprove, onReject, onReceipt }) {
  const symbol = req.currency === "USD" ? "$" : "₨";
  const pd = req.payment_details || {};
  const isPending = req.status === "pending";

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12,
      borderLeft: `4px solid ${isPending ? "#f59e0b" : req.status === "approved" ? "#22c55e" : "#ef4444"}`,
      background: "#fafafa",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{req.user_email}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{req.txn_no}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(req.created_at).toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {statusBadge(req.status)}
          <div style={{ fontWeight: 900, fontSize: 18, color: "#1e3a8a", marginTop: 4 }}>
            {symbol}{fmt(req.net_fiat)}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{fmt(req.coins_requested, 0)} coins</div>
        </div>
      </div>

      {/* Payment details summary */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <Tag label={`Method: ${req.method}`} />
        <Tag label={`Currency: ${req.currency}`} />
        {pd.platform    && <Tag label={`Platform: ${pd.platform}`} />}
        {pd.wallet_name && <Tag label={`Wallet: ${pd.wallet_name}`} />}
        {pd.bank_name   && <Tag label={`Bank: ${pd.bank_name}`} />}
        {pd.holder_name && <Tag label={`Holder: ${pd.holder_name}`} />}
        {pd.account_no  && <Tag label={`Acc: ${pd.account_no}`} />}
        {pd.iban        && <Tag label={`IBAN: ${pd.iban}`} />}
        {pd.address     && <Tag label={`Addr: ${pd.address.slice(0, 16)}…`} />}
        {pd.whatsapp    && <Tag label={`WA: ${pd.whatsapp}`} />}
      </div>

      {req.admin_note && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#92400e", background: "#fffbeb", padding: "6px 10px", borderRadius: 6 }}>
          Note: {req.admin_note}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div style={{ marginTop: 12 }}>
          <textarea
            style={{ ...S.input, minHeight: 60, resize: "vertical", fontSize: 12 }}
            placeholder="Admin note (required for rejection)"
            value={noteInputs[req.id] || ""}
            onChange={e => setNoteInputs(x => ({ ...x, [req.id]: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button style={{ ...S.btn, background: "linear-gradient(135deg,#166534,#22c55e)", flex: 1 }}
              onClick={() => onApprove(req)}>✅ Approve</button>
            <button style={{ ...S.btn, background: "linear-gradient(135deg,#991b1b,#ef4444)", flex: 1 }}
              onClick={() => onReject(req)}>❌ Reject</button>
            <button style={{ ...S.btnOutline }} onClick={onReceipt}>🧾 Receipt</button>
          </div>
          {actionMsg.id === req.id && (
            <div style={{ ...S.msgBox, background: actionMsg.ok ? "#dcfce7" : "#fee2e2",
              color: actionMsg.ok ? "#166534" : "#b91c1c", marginTop: 8 }}>
              {actionMsg.text}
            </div>
          )}
        </div>
      )}

      {!isPending && (
        <div style={{ marginTop: 8 }}>
          <button style={S.btnOutline} onClick={onReceipt}>🧾 View Receipt</button>
          {req.acted_at && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 10 }}>
            Acted: {new Date(req.acted_at).toLocaleString()}
          </span>}
        </div>
      )}
    </div>
  );
}

// ─── Fee Row ─────────────────────────────────────────────────
function FeeRow({ fee, onToggle, onDelete, onUpdate }) {
  const [localPct, setLocalPct] = useState(fee.percentage);

  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td style={S.td}><strong>{fee.name}</strong></td>
      <td style={S.td}>{fee.percentage}%</td>
      <td style={S.td}>
        <button onClick={onToggle} style={{
          padding: "3px 10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
          background: fee.is_active ? "#dcfce7" : "#f1f5f9", color: fee.is_active ? "#166534" : "#64748b",
        }}>{fee.is_active ? "Active" : "Inactive"}</button>
      </td>
      <td style={S.td}>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" style={{ ...S.input, width: 80, padding: "4px 8px", fontSize: 13 }}
            value={localPct} onChange={e => setLocalPct(e.target.value)} />
          <button style={{ ...S.btn, padding: "4px 10px", fontSize: 12 }} onClick={() => onUpdate(localPct)}>Save</button>
        </div>
      </td>
      <td style={S.td}>
        <button onClick={onDelete} style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          Delete
        </button>
      </td>
    </tr>
  );
}

// ─── Helpers ─────────────────────────────────────────────────
function Tag({ label }) {
  return <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{label}</span>;
}

function SettingField({ label, val, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
      <input style={S.input} type="number" step="any" value={val || ""}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const S = {
  page:      { maxWidth: 1000, margin: "0 auto", padding: 16, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#0f172a" },
  header:    { background: "#1e3a8a", color: "#fff", padding: "14px 20px", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center" },
  badge:     { background: "#f59e0b", color: "#fff", padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 800, marginLeft: 10 },
  tabs:      { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tab:       { padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", color: "#475569" },
  tabActive: { background: "#1e3a8a", color: "#fff", borderColor: "#1e3a8a" },
  card:      { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #e2e8f0" },
  cardTitle: { margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#0f172a" },
  input:     { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  select:    { padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" },
  btn:       { background: "linear-gradient(135deg,#1e3a8a,#3b82f6)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnOutline:{ background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  msgBox:    { padding: "9px 12px", borderRadius: 8, fontWeight: 700, fontSize: 13 },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  td:        { padding: "11px 12px", fontSize: 13, color: "#334155", verticalAlign: "middle" },
  overlay:   { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modal:     { background: "#fff", borderRadius: 16, padding: 24, width: "min(500px,100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(15,23,42,0.2)" },
  receiptBox:{ background: "#f8fafc", borderRadius: 10, padding: 16, border: "1px dashed #cbd5e1" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; }
input:focus, textarea:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
@media(max-width:600px) {
  [style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
}
`;