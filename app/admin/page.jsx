// app/admin/pool/page.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase.js";

export default function AdminPool() {
  const [view, setView] = useState("transfer"); // "transfer" | "history"

  // Dashboard State
  const [pool, setPool] = useState(null);
  const [email, setEmail] = useState("");
  const [userFound, setUserFound] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loadingUser, setLoadingUser] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  // History State
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  async function loadPool() {
    const { data, error } = await supabase
      .from("admin_pool")
      .select("total_aidla_coins")
      .eq("id", 1)
      .single();
    if (!error) setPool(data?.total_aidla_coins ?? null);
  }

  async function loadTransactions() {
    setLoadingTxns(true);
    const { data, error } = await supabase
      .from("admin_pool_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoadingTxns(false);
  }

  useEffect(() => {
    loadPool();
    loadTransactions();
  }, []);

  async function findUser() {
    setMsg("");
    setUserFound(null);
    setLoadingUser(true);

    try {
      const clean = email.trim().toLowerCase();
      if (!clean) throw new Error("Enter user email");

      const { data, error } = await supabase
        .from("users_profiles")
        .select("full_name,email,total_aidla_coins,user_id")
        .eq("email", clean)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("❌ No account found on this email. User not available.");
        }
        throw error;
      }
      setUserFound(data);
    } catch (e) {
      setMsg(e.message || "User not available on this email");
    } finally {
      setLoadingUser(false);
    }
  }

  async function doTransfer(mode) {
    setMsg("");
    setSending(true);

    try {
      if (!userFound?.email) throw new Error("Find a user first");
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");

      const { data, error } = await supabase.rpc("admin_transfer_coins", {
        target_email: userFound.email,
        amount: amt,
        mode,
        note: note || null,
      });

      if (error) throw error;

      const res = Array.isArray(data) ? data[0] : data;
      setMsg(`Success ✅ Transaction: ${res.txn_no}`);
      setAmount("");
      setNote("");

      await loadPool();
      await findUser(); // refresh user balance
      await loadTransactions(); // refresh history
    } catch (e) {
      setMsg(e.message || "Transfer failed");
    } finally {
      setSending(false);
    }
  }

  function formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  // --- 2060 3D NEUMORPHIC CSS ---
  const css = `
    * { box-sizing: border-box; }

    .admin-pool-wrapper {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      animation: fadeIn 0.4s ease forwards;
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 900;
      letter-spacing: -1px;
      color: #1e3a8a;
      margin-bottom: 25px;
      margin-top: 0;
      text-shadow: 2px 2px 4px rgba(30, 58, 138, 0.1);
    }

    /* Inner Tabs System */
    .tab-container {
      display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap;
    }
    .pill-tab {
      padding: 12px 20px; border-radius: 14px; font-weight: 700; font-size: 0.95rem;
      cursor: pointer; transition: all 0.2s ease; border: none; outline: none;
      background: #f1f5f9; color: #64748b;
      box-shadow: 4px 4px 8px rgba(15, 23, 42, 0.05), -4px -4px 8px rgba(255, 255, 255, 1);
    }
    .pill-tab:hover { color: #1e3a8a; transform: translateY(-2px); }
    .pill-tab.active {
      background: #e0e7ff; color: #1e3a8a; font-weight: 800;
      box-shadow: inset 3px 3px 6px rgba(15, 23, 42, 0.08), inset -3px -3px 6px rgba(255, 255, 255, 1);
      transform: translateY(1px);
    }

    /* 3D Glass Cards */
    .grid-layout { display: grid; gap: 25px; grid-template-columns: 1fr; }
    
    .card-2060 {
      background: #ffffff;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 
        10px 10px 25px rgba(15, 23, 42, 0.05), 
        -10px -10px 25px rgba(255, 255, 255, 0.9),
        inset 0 0 0 1px rgba(255, 255, 255, 1);
    }

    .section-title { font-weight: 800; font-size: 1.1rem; color: #1e3a8a; margin-bottom: 15px; }

    /* Pool Balance Highlight */
    .balance-highlight {
      font-size: 2.8rem; font-weight: 900; color: #3b82f6;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-top: 5px; filter: drop-shadow(1px 2px 3px rgba(30,58,138,0.2));
    }

    /* 3D Inputs */
    .input-3d {
      width: 100%; padding: 14px 16px; border-radius: 14px; border: 2px solid transparent;
      background: #f8fafc; color: #0f172a; font-size: 1rem; font-weight: 600;
      box-shadow: inset 4px 4px 8px rgba(15, 23, 42, 0.06), inset -4px -4px 8px rgba(255, 255, 255, 1);
      transition: all 0.2s ease; font-family: inherit; margin-bottom: 15px;
    }
    .input-3d::placeholder { color: #94a3b8; font-weight: 500; }
    .input-3d:focus { outline: none; background: #ffffff; border-color: rgba(59, 130, 246, 0.3); box-shadow: inset 2px 2px 5px rgba(15, 23, 42, 0.03), inset -2px -2px 5px rgba(255, 255, 255, 1), 0 0 0 4px rgba(59, 130, 246, 0.1); }

    /* Buttons */
    .btn-3d {
      padding: 14px 24px; border-radius: 12px; border: none; font-size: 1rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 6px 0 #1e3a8a, 0 10px 15px rgba(30, 58, 138, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.1s ease; display: inline-flex; justify-content: center; align-items: center; gap: 8px;
    }
    .btn-3d:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 0 #1e3a8a, 0 15px 20px rgba(30, 58, 138, 0.3), inset 0 2px 0 rgba(255,255,255,0.2); }
    .btn-3d:active:not(:disabled) { transform: translateY(6px); box-shadow: 0 0px 0 #1e3a8a, 0 2px 5px rgba(30, 58, 138, 0.3), inset 0 2px 0 rgba(255,255,255,0.2); }
    .btn-3d:disabled { background: #94a3b8; box-shadow: 0 6px 0 #64748b; cursor: not-allowed; opacity: 0.8; transform: translateY(0); }

    .btn-primary { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; }
    .btn-secondary { background: linear-gradient(135deg, #475569, #64748b); color: #fff; box-shadow: 0 6px 0 #334155, 0 10px 15px rgba(15, 23, 42, 0.2); }
    .btn-secondary:hover:not(:disabled) { box-shadow: 0 8px 0 #334155, 0 15px 20px rgba(15, 23, 42, 0.3); }
    .btn-secondary:active:not(:disabled) { box-shadow: 0 0px 0 #334155, 0 2px 5px rgba(15, 23, 42, 0.3); }

    /* Flex Row Groups */
    .input-row { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; }
    .input-row > input { margin-bottom: 0; flex: 1; min-width: 200px; }

    /* User Found Card */
    .user-card {
      margin-top: 15px; padding: 15px 20px; border-radius: 14px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      box-shadow: inset 2px 2px 5px rgba(15, 23, 42, 0.03);
    }
    .user-card div { margin-bottom: 8px; font-size: 0.95rem; }
    .user-card b { color: #1e3a8a; display: inline-block; width: 70px; }

    /* Messages */
    .msg-box { margin-top: 15px; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; width: 100%; text-align: center; }

    /* Transactions Table */
    .table-container {
      width: 100%; overflow-x: auto; border-radius: 16px;
      box-shadow: inset 4px 4px 8px rgba(15, 23, 42, 0.05), inset -4px -4px 8px rgba(255, 255, 255, 1);
      background: #f8fafc; padding: 2px;
      -webkit-overflow-scrolling: touch;
    }
    .table-2060 { width: 100%; border-collapse: collapse; min-width: 900px; font-size: 0.85rem; }
    @media (max-width: 768px) {
      .table-2060 { font-size: 0.8rem; }
      .table-2060 th, .table-2060 td { padding: 10px 12px; }
    }
    @media (max-width: 600px) {
      .table-container { border-radius: 12px; padding: 1px; }
      .table-2060 { font-size: 0.75rem; min-width: 800px; }
      .table-2060 th, .table-2060 td { padding: 8px 10px; }
    }
    .table-2060 th { background: #e2e8f0; color: #1e3a8a; font-weight: 800; text-align: left; padding: 14px 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1; }
    .table-2060 td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; font-weight: 500; }
    .table-2060 tr:last-child td { border-bottom: none; }
    .table-2060 tr:hover td { background: rgba(59, 130, 246, 0.05); }

    /* Badges */
    .badge { padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
    .badge-send { background: #fee2e2; color: #b91c1c; box-shadow: inset 1px 1px 3px rgba(185, 28, 28, 0.2); }
    .badge-receive { background: #dcfce7; color: #15803d; box-shadow: inset 1px 1px 3px rgba(21, 128, 61, 0.2); }
    .amount-text { font-weight: 800; font-size: 0.95rem; color: #0f172a; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;

  return (
    <div className="admin-pool-wrapper">
      <style>{css}</style>

      <h2 className="page-title">Admin Pool & Logistics</h2>

      <div className="tab-container">
        <button className={`pill-tab ${view === "transfer" ? "active" : ""}`} onClick={() => setView("transfer")}>
          <svg style={{width: 16, height: 16, marginRight: 6, verticalAlign: "-3px"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3v18"/><path d="M10 14 3 21l7 7"/><path d="M7 3v18"/><path d="M14 10l7-7-7-7"/></svg>
          Transfers & Dashboard
        </button>
        <button className={`pill-tab ${view === "history" ? "active" : ""}`} onClick={() => setView("history")}>
          <svg style={{width: 16, height: 16, marginRight: 6, verticalAlign: "-3px"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Transaction History
        </button>
      </div>

      {view === "transfer" && (
        <div className="grid-layout">
          
          {/* Admin Pool Balance */}
          <div className="card-2060" style={{ textAlign: "center", padding: "35px 20px" }}>
            <div style={{ color: "#64748b", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Admin Pool Balance
            </div>
            <div className="balance-highlight">
              {pool === null ? "Loading..." : `${Number(pool).toLocaleString()} AIDLA`}
            </div>
          </div>

          {/* User Search */}
          <div className="card-2060">
            <div className="section-title">Step 1: Locate Target User</div>
            <div className="input-row">
              <input
                className="input-3d"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email (e.g. name@example.com)"
              />
              <button className="btn-3d btn-primary" onClick={findUser} disabled={loadingUser}>
                {loadingUser ? "Searching..." : "🔍 Search User"}
              </button>
            </div>

            {userFound && (
              <div className="user-card">
                <div><b>Name:</b> {userFound.full_name}</div>
                <div><b>Email:</b> {userFound.email}</div>
                <div><b>Balance:</b> <span style={{fontWeight: 800, color:"#1e3a8a"}}>{Number(userFound.total_aidla_coins).toLocaleString()} AIDLA</span></div>
              </div>
            )}
          </div>

          {/* Transfer Actions */}
          <div className="card-2060">
            <div className="section-title">Step 2: Execute Transaction</div>
            
            <div className="input-row">
              <input
                className="input-3d"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to transfer (e.g. 1500)"
              />
              <input
                className="input-3d"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reference Note (Optional)"
              />
            </div>

            <div className="input-row" style={{ marginTop: "20px" }}>
              <button className="btn-3d btn-primary" onClick={() => doTransfer("SEND")} disabled={sending || !userFound}>
                <svg style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send to User
              </button>

              <button className="btn-3d btn-secondary" onClick={() => doTransfer("RECEIVE")} disabled={sending || !userFound}>
                <svg style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
                Receive from User
              </button>
            </div>

            {msg && (
              <div
                className="msg-box"
                style={{
                  color: msg.includes("✅") ? "#047857" : "#b91c1c",
                  background: msg.includes("✅") ? "#d1fae5" : "#fee2e2",
                  boxShadow: msg.includes("✅") ? "inset 0 0 0 2px #34d399" : "inset 0 0 0 2px #f87171"
                }}
              >
                {msg}
              </div>
            )}
          </div>

        </div>
      )}

      {view === "history" && (
        <div className="card-2060">
          <div className="section-title" style={{ marginBottom: "20px" }}>Transaction Ledger</div>
          
          {loadingTxns ? (
            <div style={{ padding: "40px", textAlign: "center", fontWeight: 600, color: "#64748b" }}>
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", fontWeight: 600, color: "#64748b" }}>
              No transactions found in the database.
            </div>
          ) : (
            <div className="table-container">
              <table className="table-2060">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Txn ID</th>
                    <th>Action</th>
                    <th>User Email</th>
                    <th>Amount</th>
                    <th>Pool Bal After</th>
                    <th>User Bal After</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    // RES-APR = admin pays reward to user (outflow); RES-BUY = admin receives purchase (inflow)
                    const isSend = tx.direction === "OUT"
                      || (typeof tx.txn_type === "string" && tx.txn_type.toUpperCase().includes("SEND"))
                      || (typeof tx.txn_no === "string" && tx.txn_no.startsWith("RES-APR"));

                    return (
                      <tr key={tx.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(tx.created_at)}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>{tx.txn_no}</td>
                        <td>
                          <span className={`badge ${isSend ? "badge-send" : "badge-receive"}`}>
                            {isSend ? "Send" : "Received"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#1e3a8a" }}>{tx.target_user_name || "Unknown"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{tx.target_user_email}</div>
                        </td>
                        <td className="amount-text" style={{ color: isSend ? "#b91c1c" : "#15803d", fontWeight: 800 }}>
  {isSend ? "-" : "+"}{Number(tx.amount).toLocaleString()} AIDLA
</td>
                        <td>{Number(tx.pool_balance_after).toLocaleString()}</td>
                        <td>{tx.user_balance_after !== null ? Number(tx.user_balance_after).toLocaleString() : "-"}</td>
                        <td style={{ fontStyle: tx.note ? "normal" : "italic", color: tx.note ? "inherit" : "#94a3b8" }}>
                          {tx.note || "No note"}
                        </td>
                      </tr>
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