"use client";
// app/admin/shop/page.jsx

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "zkafridi317@gmail.com";
const BUCKET = "shop-products";

function fmt(n, d = 2) { return Number(n || 0).toFixed(d); }

function statusBadge(s) {
  const map = {
    pending:   { bg: "#fef3c7", col: "#92400e", label: "⏳ Pending" },
    approved:  { bg: "#dcfce7", col: "#166534", label: "✅ Approved" },
    rejected:  { bg: "#fee2e2", col: "#b91c1c", label: "❌ Rejected" },
    delivered: { bg: "#e0f2fe", col: "#0369a1", label: "🚚 Delivered" },
  };
  const d = map[s] || map.pending;
  return <span style={{ background: d.bg, color: d.col, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{d.label}</span>;
}

const TABS = ["orders", "products", "categories", "fees", "coupons"];

export default function AdminShop() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState("orders");
  const [data, setData] = useState({ orders: [], products: [], categories: [], fees: [], coupons: [] });
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [filterStatus, setFilterStatus] = useState("all");
  const [noteInputs, setNoteInputs] = useState({});
  const [actionMsg, setActionMsg] = useState({ id: null, text: "", ok: true });

  // product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct());
  const [uploading, setUploading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // fee form
  const [newFee, setNewFee] = useState({ name: "", percentage: "" });

  // coupon form
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_pct: "", max_uses: "", expires_at: "" });

  // restock
  const [restockInputs, setRestockInputs] = useState({});

  function emptyProduct() {
    return {
      name: "", description: "", type: "physical", category_id: "",
      price_coins: "", stock: "", unlimited_stock: false, images: [],
      is_active: true, is_featured: false, discount_pct: "", sale_ends_at: "",
      cashback_pct: "", low_stock_threshold: 5,
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        alert("Access Denied"); window.location.href = "/"; return;
      }
      setIsAdmin(true);
      loadAll();
    });
  }, []);

  const loadAll = useCallback(async () => {
    const { data: d, error } = await supabase.rpc("shop_admin_load");
    if (error) { setMsg({ text: error.message, ok: false }); setLoading(false); return; }
    setData({
      orders: d.orders || [],
      products: d.products || [],
      categories: d.categories || [],
      fees: d.fees || [],
      coupons: d.coupons || [],
    });
    setLoading(false);
  }, []);

  // ── image upload ──
  const handleImageUpload = async (files) => {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (!error) {
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(pub.publicUrl);
      }
    }
    setProductForm(f => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
  };

  // ── save product ──
  const handleSaveProduct = async () => {
    setSavingProduct(true);
    const { data: d, error } = await supabase.rpc("shop_admin_save_product", {
      p_id:                  editProduct?.id || null,
      p_name:                productForm.name,
      p_description:         productForm.description,
      p_type:                productForm.type,
      p_category_id:         productForm.category_id ? parseInt(productForm.category_id) : null,
      p_price_coins:         parseFloat(productForm.price_coins) || 0,
      p_stock:               parseInt(productForm.stock) || 0,
      p_unlimited_stock:     productForm.unlimited_stock,
      p_images:              productForm.images,
      p_is_active:           productForm.is_active,
      p_is_featured:         productForm.is_featured,
      p_discount_pct:        parseFloat(productForm.discount_pct) || 0,
      p_sale_ends_at:        productForm.sale_ends_at || null,
      p_cashback_pct:        parseFloat(productForm.cashback_pct) || 0,
      p_low_stock_threshold: parseInt(productForm.low_stock_threshold) || 5,
    });
    setSavingProduct(false);
    if (error || !d?.ok) { setMsg({ text: error?.message || "Failed", ok: false }); return; }
    setMsg({ text: editProduct ? "✅ Product updated!" : "✅ Product added!", ok: true });

    // send new product email if new
    if (!editProduct) {
      try {
        await supabase.functions.invoke("shop-notify", {
          body: { type: "new_product", product_name: productForm.name, product_id: d.id }
        });
      } catch (_) {}
    }

    setShowProductForm(false);
    setEditProduct(null);
    setProductForm(emptyProduct());
    await loadAll();
  };

  // ── approve ──
  const handleApprove = async (order) => {
    const note = noteInputs[order.id] || "";
    const { data: d, error } = await supabase.rpc("shop_admin_approve_order", { p_order_id: order.id, p_admin_note: note });
    if (error || !d?.ok) { setActionMsg({ id: order.id, text: error?.message || "Failed", ok: false }); return; }
    try {
      await supabase.functions.invoke("shop-notify", {
        body: { type: "order_approved", user_email: order.user_email, txn_no: order.txn_no, product_name: order.product_name, admin_note: note }
      });
    } catch (_) {}
    setActionMsg({ id: order.id, text: "✅ Approved!", ok: true });
    await loadAll();
  };

  // ── reject ──
  const handleReject = async (order) => {
    const note = noteInputs[order.id] || "";
    if (!note) { setActionMsg({ id: order.id, text: "Note required for rejection.", ok: false }); return; }
    const { data: d, error } = await supabase.rpc("shop_admin_reject_order", { p_order_id: order.id, p_admin_note: note });
    if (error || !d?.ok) { setActionMsg({ id: order.id, text: error?.message || "Failed", ok: false }); return; }
    try {
      await supabase.functions.invoke("shop-notify", {
        body: { type: "order_rejected", user_email: order.user_email, txn_no: order.txn_no, product_name: order.product_name, admin_note: note }
      });
    } catch (_) {}
    setActionMsg({ id: order.id, text: "❌ Rejected & refunded.", ok: true });
    await loadAll();
  };

  // ── restock ──
  const handleRestock = async (productId) => {
    const qty = parseInt(restockInputs[productId] || 0);
    if (!qty || qty <= 0) return;
    await supabase.rpc("shop_admin_restock", { p_product_id: productId, p_quantity: qty });
    setRestockInputs(r => ({ ...r, [productId]: "" }));
    await loadAll();
  };

  // ── fee ──
  const handleAddFee = async () => {
    if (!newFee.name || !newFee.percentage) return;
    await supabase.rpc("shop_admin_manage_fee", { p_action: "add", p_name: newFee.name, p_percentage: parseFloat(newFee.percentage) });
    setNewFee({ name: "", percentage: "" });
    await loadAll();
  };

  // ── coupon ──
  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_pct) return;
    await supabase.rpc("shop_admin_manage_coupon", {
      p_action: "add", p_code: newCoupon.code,
      p_discount_pct: parseFloat(newCoupon.discount_pct),
      p_max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
      p_expires_at: newCoupon.expires_at || null,
    });
    setNewCoupon({ code: "", discount_pct: "", max_uses: "", expires_at: "" });
    await loadAll();
  };

  if (loading || !isAdmin) return <div style={{ padding: 40, color: "#64748b" }}>Loading…</div>;

  const filteredOrders = data.orders.filter(o => filterStatus === "all" || o.status === filterStatus);
  const pendingCount = data.orders.filter(o => o.status === "pending").length;
  const lowStock = data.products.filter(p => !p.unlimited_stock && p.stock <= p.low_stock_threshold);

  return (
    <>
      <style>{CSS}</style>
      <div style={S.page}>
        <div style={S.header}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
            🛍️ Shop Management
            {pendingCount > 0 && <span style={S.badge}>{pendingCount} pending</span>}
            {lowStock.length > 0 && <span style={{ ...S.badge, background: "#ef4444" }}>⚠️ {lowStock.length} low stock</span>}
          </h1>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
              {t === "orders" ? "📋 Orders" : t === "products" ? "📦 Products" : t === "categories" ? "🗂️ Categories" : t === "fees" ? "💰 Fees" : "🎟️ Coupons"}
            </button>
          ))}
        </div>

        {msg.text && <div style={{ ...S.msgBox, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#b91c1c", marginBottom: 12 }}>{msg.text}</div>}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div style={S.card}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              {["all", "pending", "approved", "rejected", "delivered"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ ...S.filterBtn, ...(filterStatus === s ? S.filterActive : {}) }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <span style={{ alignSelf: "center", fontSize: 13, color: "#64748b" }}>{filteredOrders.length} records</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No orders found.</div>
            ) : filteredOrders.map(order => (
              <div key={order.id} style={{
                border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 12,
                borderLeft: `4px solid ${order.status === "pending" ? "#f59e0b" : order.status === "approved" ? "#22c55e" : order.status === "rejected" ? "#ef4444" : "#0ea5e9"}`,
                background: "#fafafa",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{order.product_name} {order.variant_value ? `(${order.variant_value})` : ""}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{order.txn_no}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{order.user_email} · {new Date(order.created_at).toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      {order.buyer_name} · {order.whatsapp} · {order.city}, {order.country}
                    </div>
                    {order.street && <div style={{ fontSize: 12, color: "#64748b" }}>{order.street}</div>}
                    {order.coupon_code && <div style={{ fontSize: 12, color: "#7c3aed" }}>Coupon: {order.coupon_code}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {statusBadge(order.status)}
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#1e3a8a", marginTop: 4 }}>{fmt(order.total_coins, 0)} coins</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Qty: {order.quantity}</div>
                    {order.cashback_coins > 0 && <div style={{ fontSize: 12, color: "#16a34a" }}>Cashback: {fmt(order.cashback_coins, 0)} coins</div>}
                  </div>
                </div>

                {order.status === "pending" && (
                  <div style={{ marginTop: 12 }}>
                    <textarea style={{ ...S.input, minHeight: 50, resize: "vertical", fontSize: 12 }}
                      placeholder="Admin note (required for rejection)"
                      value={noteInputs[order.id] || ""}
                      onChange={e => setNoteInputs(n => ({ ...n, [order.id]: e.target.value }))} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <button style={{ ...S.btn, background: "linear-gradient(135deg,#166534,#22c55e)", flex: 1 }} onClick={() => handleApprove(order)}>✅ Approve</button>
                      <button style={{ ...S.btn, background: "linear-gradient(135deg,#991b1b,#ef4444)", flex: 1 }} onClick={() => handleReject(order)}>❌ Reject</button>
                    </div>
                    {actionMsg.id === order.id && (
                      <div style={{ ...S.msgBox, background: actionMsg.ok ? "#dcfce7" : "#fee2e2", color: actionMsg.ok ? "#166534" : "#b91c1c", marginTop: 8 }}>{actionMsg.text}</div>
                    )}
                  </div>
                )}
                {order.admin_note && order.status !== "pending" && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#92400e", background: "#fffbeb", padding: "6px 10px", borderRadius: 6 }}>Note: {order.admin_note}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={S.cardTitle}>Products ({data.products.length})</div>
              <button style={S.btn} onClick={() => { setEditProduct(null); setProductForm(emptyProduct()); setShowProductForm(true); }}>+ Add Product</button>
            </div>

            {showProductForm && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 12 }}>{editProduct ? "Edit Product" : "New Product"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><Label text="Name" /><input style={S.input} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div>
                    <Label text="Type" />
                    <select style={S.input} value={productForm.type} onChange={e => setProductForm(f => ({ ...f, type: e.target.value }))}>
                      {["physical", "digital", "service", "recharge"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label text="Category" />
                    <select style={S.input} value={productForm.category_id} onChange={e => setProductForm(f => ({ ...f, category_id: e.target.value }))}>
                      <option value="">-- Select --</option>
                      {data.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div><Label text="Price (coins)" /><input style={S.input} type="number" value={productForm.price_coins} onChange={e => setProductForm(f => ({ ...f, price_coins: e.target.value }))} /></div>
                  <div><Label text="Stock" /><input style={S.input} type="number" value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} /></div>
                  <div><Label text="Discount %" /><input style={S.input} type="number" value={productForm.discount_pct} onChange={e => setProductForm(f => ({ ...f, discount_pct: e.target.value }))} /></div>
                  <div><Label text="Cashback %" /><input style={S.input} type="number" value={productForm.cashback_pct} onChange={e => setProductForm(f => ({ ...f, cashback_pct: e.target.value }))} /></div>
                  <div><Label text="Sale Ends At" /><input style={S.input} type="datetime-local" value={productForm.sale_ends_at} onChange={e => setProductForm(f => ({ ...f, sale_ends_at: e.target.value }))} /></div>
                  <div><Label text="Low Stock Alert" /><input style={S.input} type="number" value={productForm.low_stock_threshold} onChange={e => setProductForm(f => ({ ...f, low_stock_threshold: e.target.value }))} /></div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Label text="Description" />
                  <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    <input type="checkbox" checked={productForm.unlimited_stock} onChange={e => setProductForm(f => ({ ...f, unlimited_stock: e.target.checked }))} /> Unlimited Stock
                  </label>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Label text="Images" />
                  <input type="file" multiple accept="image/*" onChange={e => handleImageUpload(Array.from(e.target.files))} />
                  {uploading && <span style={{ fontSize: 12, color: "#64748b" }}> Uploading…</span>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {productForm.images.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={img} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />
                        <button onClick={() => setProductForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                          style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", fontWeight: 900 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button style={S.btn} disabled={savingProduct} onClick={handleSaveProduct}>{savingProduct ? "Saving…" : "Save Product"}</button>
                  <button style={{ ...S.btn, background: "#94a3b8" }} onClick={() => { setShowProductForm(false); setEditProduct(null); }}>Cancel</button>
                </div>
              </div>
            )}

            {lowStock.length > 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #fde047", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13 }}>
                ⚠️ <strong>Low Stock:</strong> {lowStock.map(p => p.name).join(", ")}
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Product", "Type", "Price", "Stock", "Orders", "Rating", "Status", "Actions"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.products.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        {p.is_featured && <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>⭐ Featured</span>}
                        {p.discount_pct > 0 && <span style={{ fontSize: 10, background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: 6, fontWeight: 700, marginLeft: 4 }}>{p.discount_pct}% OFF</span>}
                      </td>
                      <td style={S.td}>{p.type}</td>
                      <td style={S.td}>{fmt(p.price_coins, 0)} coins</td>
                      <td style={S.td}>
                        {p.unlimited_stock ? "∞" : (
                          <span style={{ color: p.stock <= p.low_stock_threshold ? "#ef4444" : "inherit", fontWeight: p.stock <= p.low_stock_threshold ? 800 : 400 }}>
                            {p.stock}
                          </span>
                        )}
                        {!p.unlimited_stock && (
                          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                            <input type="number" placeholder="+" style={{ ...S.input, width: 50, padding: "2px 6px", fontSize: 11 }}
                              value={restockInputs[p.id] || ""} onChange={e => setRestockInputs(r => ({ ...r, [p.id]: e.target.value }))} />
                            <button style={{ ...S.btn, padding: "2px 8px", fontSize: 11 }} onClick={() => handleRestock(p.id)}>+</button>
                          </div>
                        )}
                      </td>
                      <td style={S.td}>{p.order_count}</td>
                      <td style={S.td}>⭐ {p.avg_rating}</td>
                      <td style={S.td}>
                        <span style={{ color: p.is_active ? "#166534" : "#b91c1c", fontWeight: 700, fontSize: 12 }}>{p.is_active ? "Active" : "Inactive"}</span>
                      </td>
                      <td style={S.td}>
                        <button style={S.smallBtn} onClick={() => {
                          setEditProduct(p);
                          setProductForm({ ...p, sale_ends_at: p.sale_ends_at ? p.sale_ends_at.slice(0, 16) : "" });
                          setShowProductForm(true);
                        }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div style={S.card}>
            <div style={S.cardTitle}>Categories</div>
            <table style={S.table}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Icon", "Name", "Slug", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={S.td}>{c.icon}</td>
                    <td style={S.td}><strong>{c.name}</strong></td>
                    <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: 12 }}>{c.slug}</span></td>
                    <td style={S.td}><span style={{ color: c.is_active ? "#166534" : "#b91c1c", fontWeight: 700, fontSize: 12 }}>{c.is_active ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── FEES ── */}
        {tab === "fees" && (
          <div style={S.card}>
            <div style={S.cardTitle}>Shop Fees</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", background: "#f8fafc", padding: 14, borderRadius: 10 }}>
              <input style={{ ...S.input, flex: 2, minWidth: 140 }} placeholder="Fee name" value={newFee.name} onChange={e => setNewFee(f => ({ ...f, name: e.target.value }))} />
              <input style={{ ...S.input, flex: 1, minWidth: 100 }} type="number" placeholder="% e.g. 2.5" value={newFee.percentage} onChange={e => setNewFee(f => ({ ...f, percentage: e.target.value }))} />
              <button style={S.btn} onClick={handleAddFee}>+ Add Fee</button>
            </div>
            <table style={S.table}>
              <thead><tr style={{ background: "#f8fafc" }}>{["Name", "Percentage", "Status", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.fees.map(f => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={S.td}><strong>{f.name}</strong></td>
                    <td style={S.td}>{f.percentage}%</td>
                    <td style={S.td}>
                      <button onClick={async () => { await supabase.rpc("shop_admin_manage_fee", { p_action: "toggle", p_fee_id: f.id }); loadAll(); }}
                        style={{ padding: "3px 10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: f.is_active ? "#dcfce7" : "#f1f5f9", color: f.is_active ? "#166534" : "#64748b" }}>
                        {f.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={S.td}>
                      <button onClick={async () => { await supabase.rpc("shop_admin_manage_fee", { p_action: "delete", p_fee_id: f.id }); loadAll(); }}
                        style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, fontSize: 13, color: "#1e3a8a" }}>
              <strong>Total active fees:</strong> {data.fees.filter(f => f.is_active).reduce((s, f) => s + Number(f.percentage), 0).toFixed(2)}%
            </div>
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab === "coupons" && (
          <div style={S.card}>
            <div style={S.cardTitle}>Coupon Codes</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", background: "#f8fafc", padding: 14, borderRadius: 10 }}>
              <input style={{ ...S.input, flex: 1, minWidth: 100 }} placeholder="Code e.g. SAVE20" value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value }))} />
              <input style={{ ...S.input, flex: 1, minWidth: 80 }} type="number" placeholder="Discount %" value={newCoupon.discount_pct} onChange={e => setNewCoupon(c => ({ ...c, discount_pct: e.target.value }))} />
              <input style={{ ...S.input, flex: 1, minWidth: 80 }} type="number" placeholder="Max uses" value={newCoupon.max_uses} onChange={e => setNewCoupon(c => ({ ...c, max_uses: e.target.value }))} />
              <input style={{ ...S.input, flex: 1, minWidth: 140 }} type="datetime-local" value={newCoupon.expires_at} onChange={e => setNewCoupon(c => ({ ...c, expires_at: e.target.value }))} />
              <button style={S.btn} onClick={handleAddCoupon}>+ Add Coupon</button>
            </div>
            <table style={S.table}>
              <thead><tr style={{ background: "#f8fafc" }}>{["Code", "Discount", "Used", "Max Uses", "Expires", "Status", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {data.coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={S.td}><strong style={{ fontFamily: "monospace" }}>{c.code}</strong></td>
                    <td style={S.td}>{c.discount_pct}%</td>
                    <td style={S.td}>{c.used_count}</td>
                    <td style={S.td}>{c.max_uses || "∞"}</td>
                    <td style={S.td}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                    <td style={S.td}>
                      <button onClick={async () => { await supabase.rpc("shop_admin_manage_coupon", { p_action: "toggle", p_coupon_id: c.id }); loadAll(); }}
                        style={{ padding: "3px 10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: c.is_active ? "#dcfce7" : "#f1f5f9", color: c.is_active ? "#166534" : "#64748b" }}>
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={S.td}>
                      <button onClick={async () => { await supabase.rpc("shop_admin_manage_coupon", { p_action: "delete", p_coupon_id: c.id }); loadAll(); }}
                        style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Label({ text }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", margin: "8px 0 3px", textTransform: "uppercase" }}>{text}</div>;
}

const S = {
  page:       { maxWidth: 1100, margin: "0 auto", padding: 16, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#0f172a" },
  header:     { background: "#1e3a8a", color: "#fff", padding: "14px 20px", borderRadius: 12, marginBottom: 16 },
  badge:      { background: "#f59e0b", color: "#fff", padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 800, marginLeft: 10 },
  tabs:       { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tab:        { padding: "9px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", color: "#475569" },
  tabActive:  { background: "#1e3a8a", color: "#fff", borderColor: "#1e3a8a" },
  card:       { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #e2e8f0" },
  cardTitle:  { fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 14 },
  input:      { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  btn:        { background: "linear-gradient(135deg,#1e3a8a,#3b82f6)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  smallBtn:   { background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  msgBox:     { padding: "10px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13 },
  table:      { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  th:         { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  td:         { padding: "11px 12px", fontSize: 13, color: "#334155", verticalAlign: "middle" },
  filterBtn:  { padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", color: "#475569" },
  filterActive:{ background: "#1e3a8a", color: "#fff", borderColor: "#1e3a8a" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; }
input:focus, textarea:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
`;