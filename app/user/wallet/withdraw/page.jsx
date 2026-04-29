"use client";
// app/user/wallet/withdraw/page.jsx

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "zkafridi317@gmail.com";

// ─── helpers ────────────────────────────────────────────────
function fmt(n, decimals = 2) {
  return Number(n || 0).toFixed(decimals);
}

function statusBadge(s) {
  const map = {
    pending:  { bg: "#fef3c7", col: "#92400e", label: "⏳ Pending" },
    approved: { bg: "#dcfce7", col: "#166534", label: "✅ Approved" },
    rejected: { bg: "#fee2e2", col: "#b91c1c", label: "❌ Rejected" },
  };
  const d = map[s] || map.pending;
  return (
    <span style={{ background: d.bg, color: d.col, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
      {d.label}
    </span>
  );
}

// ─── Receipt Modal ───────────────────────────────────────────
function ReceiptModal({ req, onClose }) {
  if (!req) return null;
  const symbol = req.currency === "USD" ? "$" : "₨";
  const fees   = Array.isArray(req.fees_snapshot) ? req.fees_snapshot : [];
  const pd     = req.payment_details || {};

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <strong style={{ fontSize: 16, color: "#1e3a8a" }}>🧾 Withdrawal Receipt</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>

        <div style={styles.receiptBox}>
          <div style={styles.receiptHeader}>AIDLA</div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
            {req.txn_no}
          </div>

          <ReceiptRow label="Date"       value={new Date(req.created_at).toLocaleString()} />
          <ReceiptRow label="Status"     value={req.status.toUpperCase()} />
          <ReceiptRow label="Currency"   value={req.currency} />
          <ReceiptRow label="Method"     value={req.method} />
          {pd.platform     && <ReceiptRow label="Platform"     value={pd.platform} />}
          {pd.address      && <ReceiptRow label="Address"      value={pd.address} />}
          {pd.account_no   && <ReceiptRow label="Account No."  value={pd.account_no} />}
          {pd.iban         && <ReceiptRow label="IBAN"         value={pd.iban} />}
          {pd.holder_name  && <ReceiptRow label="Holder Name"  value={pd.holder_name} />}
          {pd.bank_name    && <ReceiptRow label="Bank"         value={pd.bank_name} />}
          {pd.whatsapp     && <ReceiptRow label="WhatsApp"     value={pd.whatsapp} />}

          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />

          <ReceiptRow label="Coins"       value={fmt(req.coins_requested, 0)} />
          <ReceiptRow label="Gross Amount" value={`${symbol}${fmt(req.gross_fiat)}`} />

          {fees.map((f, i) => (
            <ReceiptRow key={i} label={`${f.name} (${f.pct}%)`} value={`-${symbol}${fmt(f.amount)}`} small />
          ))}

          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />
          <ReceiptRow label="Total Fees"   value={`-${symbol}${fmt(req.total_fee_fiat)}`} />
          <ReceiptRow label="Net Payout"   value={`${symbol}${fmt(req.net_fiat)}`} bold />

          {req.admin_note && (
            <div style={{ marginTop: 10, background: "#f8fafc", padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#475569" }}>
              <strong>Note:</strong> {req.admin_note}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ ...styles.btn, marginTop: 14, width: "100%" }}>Close</button>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, bold, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: small ? 11 : 13 }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: bold ? "#1e3a8a" : "#0f172a" }}>{value}</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function WalletWithdraw() {
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [msg,         setMsg]         = useState({ text: "", ok: true });
  const loadingRef = useRef(false);
  const [profile,     setProfile]     = useState(null);
  const [settings,    setSettings]    = useState(null);  // {coin_price_pkr, coin_price_usd, min_coins, fees:[]}
  const [history,     setHistory]     = useState([]);
  const [receipt,     setReceipt]     = useState(null);

  // form state
  const [currency,    setCurrency]    = useState("PKR");   // PKR | USD
  const [method,      setMethod]      = useState("");       // binance|okx|mobile_wallet|bank
  const [coinsInput,  setCoinsInput]  = useState("");
  const [fiatInput,   setFiatInput]   = useState("");
  const [pd,          setPd]          = useState({});       // payment details

  const PKR_METHODS = ["mobile_wallet", "bank"];
  const USD_METHODS = ["binance", "okx"];

  // ── load ──
  const loadAll = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) { setMsg({ text: "Please login first.", ok: false }); return; }

      const { data, error } = await supabase.rpc("wd_user_load");
      if (error) { setMsg({ text: error.message, ok: false }); return; }

      if (data?.profile)  setProfile(data.profile);
      if (data?.settings) setSettings(data.settings);
      if (data?.history)  setHistory(data.history);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── coin price ──
  const coinPrice = useMemo(() => {
    if (!settings) return 0;
    return currency === "USD" ? Number(settings.coin_price_usd) : Number(settings.coin_price_pkr);
  }, [settings, currency]);

  const fees = useMemo(() => settings?.fees || [], [settings]);

  const totalFeePct = useMemo(() => fees.reduce((s, f) => s + Number(f.percentage), 0), [fees]);

  // ── fee calc ──
  function calcFromCoins(coins) {
    const gross = coins * coinPrice;
    const feeFiat = gross * totalFeePct / 100;
    const net = gross - feeFiat;
    return { gross, feeFiat, net };
  }

  function calcFromFiat(net) {
    // net = gross * (1 - feePct/100) => gross = net / (1 - feePct/100)
    const factor = 1 - totalFeePct / 100;
    const gross = factor > 0 ? net / factor : 0;
    const coins = coinPrice > 0 ? gross / coinPrice : 0;
    const feeFiat = gross - net;
    return { gross, coins, feeFiat };
  }

  const calc = useMemo(() => {
    const c = parseFloat(coinsInput) || 0;
    if (!c || !coinPrice) return null;
    const { gross, feeFiat, net } = calcFromCoins(c);
    return { coins: c, gross, feeFiat, net, feePct: totalFeePct };
  }, [coinsInput, coinPrice, totalFeePct]);

  // ── handlers ──
  function handleCoinsChange(v) {
    setCoinsInput(v);
    const c = parseFloat(v) || 0;
    if (c && coinPrice) {
      const { net } = calcFromCoins(c);
      setFiatInput(fmt(net));
    } else {
      setFiatInput("");
    }
  }

  function handleFiatChange(v) {
    setFiatInput(v);
    const f = parseFloat(v) || 0;
    if (f && coinPrice) {
      const { coins } = calcFromFiat(f);
      setCoinsInput(fmt(coins, 0));
    } else {
      setCoinsInput("");
    }
  }

  function handleCurrencyChange(c) {
    setCurrency(c);
    setMethod("");
    setCoinsInput("");
    setFiatInput("");
    setPd({});
  }

  const symbol = currency === "USD" ? "$" : "₨";
  const minCoins = Number(settings?.min_coins || 500);
  const balance  = Number(profile?.total_aidla_coins || 0);

  const canSubmit = useMemo(() => {
    if (!calc || !method) return false;
    if (calc.coins < minCoins) return false;
    if (calc.coins > balance) return false;
    // validate payment details
    if (currency === "USD") {
      if (!pd.platform || !pd.address || !pd.whatsapp) return false;
    } else if (method === "mobile_wallet") {
      if (!pd.wallet_name || !pd.account_no || !pd.holder_name || !pd.whatsapp) return false;
    } else if (method === "bank") {
      if (!pd.bank_name || !pd.iban || !pd.holder_name || !pd.whatsapp) return false;
    }
    return true;
  }, [calc, method, pd, minCoins, balance, currency]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setMsg({ text: "", ok: true });

    const { data, error } = await supabase.rpc("wd_submit", {
      p_coins:        calc.coins,
      p_currency:     currency,
      p_method:       method,
      p_payment_info: { ...pd, method },
    });

    if (error || !data?.ok) {
      setMsg({ text: error?.message || data?.error || "Submission failed", ok: false });
      setSubmitting(false);
      return;
    }

    // send email notification
    try {
      await supabase.functions.invoke("withdraw-notify", {
        body: {
          user_email: profile.email,
          user_name:  profile.full_name || "User",
          status:     "submitted",
          txn_no:     data.txn_no,
          coins:      data.coins,
          net_fiat:   data.net,
          currency:   data.currency,
          method,
        },
      });
    } catch (_) {}

    setMsg({ text: `✅ Withdrawal submitted! Ref: ${data.txn_no}`, ok: true });
    setCoinsInput(""); setFiatInput(""); setPd({}); setMethod("");
    await loadAll();
    setSubmitting(false);
  };

  if (loading) return <div style={styles.loader}>Loading…</div>;

  return (
    <>
      <style>{CSS}</style>
      <ReceiptModal req={receipt} onClose={() => setReceipt(null)} />

      <div style={styles.page}>
        <h2 style={styles.pageTitle}>💸 Withdraw Coins</h2>

        {/* Balance */}
        <div style={styles.card}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Stat label="Your Balance" value={`${fmt(balance, 0)} coins`} />
            {settings && <>
              <Stat label="PKR per coin"  value={`₨${fmt(settings.coin_price_pkr)}`} />
              <Stat label="USD per coin"  value={`$${fmt(settings.coin_price_usd, 4)}`} />
              <Stat label="Min Withdraw"  value={`${fmt(minCoins, 0)} coins`} />
            </>}
          </div>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>New Withdrawal</h3>

          {/* Currency */}
          <Label text="Currency" />
          <div style={styles.row}>
            {["PKR", "USD"].map(c => (
              <ToggleBtn key={c} active={currency === c} onClick={() => handleCurrencyChange(c)} label={c} />
            ))}
          </div>

          {/* Method */}
          <Label text="Method" />
          <div style={styles.row}>
            {(currency === "USD" ? USD_METHODS : PKR_METHODS).map(m => (
              <ToggleBtn key={m} active={method === m} onClick={() => { setMethod(m); setPd({}); }}
                label={m === "mobile_wallet" ? "Mobile Wallet" : m === "bank" ? "Bank Account" : m.charAt(0).toUpperCase() + m.slice(1)} />
            ))}
          </div>

          {/* Amount inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div>
              <Label text="Coins to withdraw" />
              <input style={styles.input} type="number" placeholder={`Min ${minCoins}`}
                value={coinsInput} onChange={e => handleCoinsChange(e.target.value)} />
            </div>
            <div>
              <Label text={`You receive (${currency}) — after fees`} />
              <input style={styles.input} type="number" placeholder="0.00"
                value={fiatInput} onChange={e => handleFiatChange(e.target.value)} />
            </div>
          </div>

          {/* Fee breakdown */}
          {calc && (
            <div style={styles.feeBox}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>Fee Breakdown</div>
              <FeeRow label="Gross Amount"  value={`${symbol}${fmt(calc.gross)}`} />
              {fees.map((f, i) => (
                <FeeRow key={i} label={`${f.name} (${f.percentage}%)`}
                  value={`-${symbol}${fmt(calc.gross * f.percentage / 100)}`} small />
              ))}
              <div style={{ borderTop: "1px solid #e2e8f0", margin: "6px 0" }} />
              <FeeRow label="Total Fees"   value={`-${symbol}${fmt(calc.feeFiat)}`} />
              <FeeRow label="Net Payout"   value={`${symbol}${fmt(calc.net)}`} bold />
            </div>
          )}

          {/* Payment details */}
          {method && (
            <div style={{ marginTop: 14 }}>
              <Label text="Payment Details" />

              {currency === "USD" && (
                <>
                  <Label text="Platform" />
                  <div style={styles.row}>
                    {["binance", "okx"].map(p => (
                      <ToggleBtn key={p} active={pd.platform === p} onClick={() => setPd(x => ({ ...x, platform: p }))}
                        label={p.charAt(0).toUpperCase() + p.slice(1)} />
                    ))}
                  </div>
                  <Input label="Crypto Address (USD)" val={pd.address}    onChange={v => setPd(x => ({ ...x, address: v }))} />
                  <Input label="WhatsApp Number"       val={pd.whatsapp}  onChange={v => setPd(x => ({ ...x, whatsapp: v }))} />
                  <Input label="Email" val={profile?.email || ""} disabled />
                </>
              )}

              {currency === "PKR" && method === "mobile_wallet" && (
                <>
                  <Label text="Wallet Provider" />
                  <div style={styles.row}>
                    {["EasyPaisa", "JazzCash", "SadaPay", "Nayapay"].map(w => (
                      <ToggleBtn key={w} active={pd.wallet_name === w} onClick={() => setPd(x => ({ ...x, wallet_name: w }))} label={w} />
                    ))}
                  </div>
                  <Input label="Account Number / IBAN" val={pd.account_no}   onChange={v => setPd(x => ({ ...x, account_no: v }))} />
                  <Input label="Account Holder Name"   val={pd.holder_name}  onChange={v => setPd(x => ({ ...x, holder_name: v }))} />
                  <Input label="WhatsApp Number"       val={pd.whatsapp}     onChange={v => setPd(x => ({ ...x, whatsapp: v }))} />
                  <Input label="Email" val={profile?.email || ""} disabled />
                </>
              )}

              {currency === "PKR" && method === "bank" && (
                <>
                  <Input label="Bank Name"             val={pd.bank_name}   onChange={v => setPd(x => ({ ...x, bank_name: v }))} />
                  <Input label="IBAN / Account Number" val={pd.iban}        onChange={v => setPd(x => ({ ...x, iban: v }))} />
                  <Input label="Account Holder Name"   val={pd.holder_name} onChange={v => setPd(x => ({ ...x, holder_name: v }))} />
                  <Input label="WhatsApp Number"       val={pd.whatsapp}    onChange={v => setPd(x => ({ ...x, whatsapp: v }))} />
                  <Input label="Email" val={profile?.email || ""} disabled />
                </>
              )}
            </div>
          )}

          {msg.text && (
            <div style={{ ...styles.msgBox, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#b91c1c" }}>
              {msg.text}
            </div>
          )}

          <button style={{ ...styles.btn, opacity: (!canSubmit || submitting) ? 0.6 : 1, marginTop: 16 }}
            disabled={!canSubmit || submitting} onClick={onSubmit}>
            {submitting ? "Submitting…" : "Submit Withdrawal"}
          </button>
        </div>

        {/* History */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Withdrawal History</h3>
          {history.length === 0 ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No withdrawals yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Ref", "Date", "Coins", "Amount", "Method", "Status", "Receipt"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(r => {
                    const sym = r.currency === "USD" ? "$" : "₨";
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={styles.td}><span style={{ fontSize: 11, color: "#64748b" }}>{r.txn_no}</span></td>
                        <td style={styles.td}>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td style={styles.td}>{fmt(r.coins_requested, 0)}</td>
                        <td style={styles.td}>{sym}{fmt(r.net_fiat)}</td>
                        <td style={styles.td}>{r.method}</td>
                        <td style={styles.td}>{statusBadge(r.status)}</td>
                        <td style={styles.td}>
                          <button style={styles.smallBtn} onClick={() => setReceipt(r)}>View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Small components ────────────────────────────────────────
function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "center", minWidth: 100 }}>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a8a" }}>{value}</div>
    </div>
  );
}

function Label({ text }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", margin: "10px 0 4px", textTransform: "uppercase" }}>{text}</div>;
}

function ToggleBtn({ active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 8, border: active ? "2px solid #3b82f6" : "1px solid #e2e8f0",
      background: active ? "#eff6ff" : "#fff", color: active ? "#1e3a8a" : "#334155",
      fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    }}>{label}</button>
  );
}

function Input({ label, val, onChange, disabled }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Label text={label} />
      <input style={{ ...styles.input, background: disabled ? "#f1f5f9" : "#fff", color: disabled ? "#94a3b8" : "#0f172a" }}
        value={val || ""} onChange={e => onChange && onChange(e.target.value)} disabled={disabled} />
    </div>
  );
}

function FeeRow({ label, value, bold, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: small ? 12 : 13, padding: "3px 0" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: bold ? "#1e3a8a" : "#334155" }}>{value}</span>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = {
  page:        { maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#0f172a" },
  pageTitle:   { fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 900, color: "#1e3a8a", marginBottom: 16 },
  card:        { background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #e2e8f0" },
  sectionTitle:{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginTop: 0, marginBottom: 14 },
  input:       { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  row:         { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  feeBox:      { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", marginTop: 12 },
  btn:         { background: "linear-gradient(135deg,#1e3a8a,#3b82f6)", color: "#fff", border: "none", padding: "13px 24px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%", fontFamily: "inherit" },
  smallBtn:    { background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  msgBox:      { padding: "10px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13, marginTop: 10 },
  table:       { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  th:          { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  td:          { padding: "11px 12px", fontSize: 13, color: "#334155", verticalAlign: "middle" },
  loader:      { display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontSize: 16, color: "#64748b" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modal:       { background: "#fff", borderRadius: 16, padding: 24, width: "min(480px,100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(15,23,42,0.2)" },
  receiptBox:  { background: "#f8fafc", borderRadius: 10, padding: 16, border: "1px dashed #cbd5e1", fontFamily: "'Courier New', monospace" },
  receiptHeader:{ textAlign: "center", fontWeight: 900, fontSize: 22, color: "#1e3a8a", marginBottom: 4, fontFamily: "system-ui" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; }
input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
@media(max-width:500px){
  table { font-size: 12px; }
}
`;