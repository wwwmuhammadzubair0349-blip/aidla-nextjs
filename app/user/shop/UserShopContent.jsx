"use client";
// app/user/shop/page.jsx

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

function fmt(n, d = 0) { return Number(n || 0).toFixed(d); }

function statusBadge(s) {
  const map = {
    pending:   { bg: "#fef3c7", col: "#92400e", label: "⏳ Pending" },
    approved:  { bg: "#dcfce7", col: "#166534", label: "✅ Approved" },
    rejected:  { bg: "#fee2e2", col: "#b91c1c", label: "❌ Rejected" },
    delivered: { bg: "#e0f2fe", col: "#0369a1", label: "🚚 Delivered" },
  };
  const d = map[s] || map.pending;
  return <span style={{ background: d.bg, color: d.col, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{d.label}</span>;
}

// ── Thermal Receipt Modal ──
function ReceiptModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <strong style={{ color: "#1e3a8a" }}>🧾 Order Receipt</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>
        <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 10, padding: 16, fontFamily: "'Courier New', monospace" }}>
          <div style={{ textAlign: "center", fontWeight: 900, fontSize: 20, color: "#1e3a8a", marginBottom: 4 }}>AIDLA SHOP</div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>{order.txn_no}</div>
          <RRow label="Date"     value={new Date(order.created_at).toLocaleString()} />
          <RRow label="Product"  value={order.product_name} />
          {order.variant_value && <RRow label="Variant" value={order.variant_value} />}
          <RRow label="Qty"      value={order.quantity} />
          <RRow label="Status"   value={order.status.toUpperCase()} />
          {order.buyer_name   && <RRow label="Name"    value={order.buyer_name} />}
          {order.whatsapp     && <RRow label="WhatsApp" value={order.whatsapp} />}
          {order.city         && <RRow label="City"    value={`${order.city}, ${order.country}`} />}
          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />
          <RRow label="Unit Price"  value={`${fmt(order.unit_price)} coins`} />
          {order.discount_pct > 0 && <RRow label={`Discount (${order.discount_pct}%)`} value={`-${fmt(order.unit_price * order.discount_pct / 100)} coins`} small />}
          {order.coupon_code  && <RRow label={`Coupon (${order.coupon_discount}%)`} value={`-${fmt(order.coupon_discount)} coins`} small />}
          {order.fee_pct > 0  && <RRow label={`Fee (${order.fee_pct}%)`} value={`+${fmt(order.fee_coins)} coins`} small />}
          <div style={{ borderTop: "1px dashed #e2e8f0", margin: "10px 0" }} />
          <RRow label="TOTAL"    value={`${fmt(order.total_coins)} coins`} bold />
          {order.cashback_coins > 0 && <RRow label="🎁 Cashback" value={`${fmt(order.cashback_coins)} coins`} small />}
          {order.admin_note   && (
            <div style={{ marginTop: 10, background: "#fffbeb", padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
              <strong>Note:</strong> {order.admin_note}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{ ...S.btn, marginTop: 12, width: "100%" }}>Close</button>
      </div>
    </div>
  );
}

function RRow({ label, value, bold, small }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: small ? 11 : 13 }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: bold ? "#1e3a8a" : "#0f172a" }}>{value}</span>
    </div>
  );
}

// ── Review Modal ──
function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(order.product_id || order.id, rating, comment);
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <strong style={{ color: "#1e3a8a" }}>⭐ Leave a Review</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>{order.product_name}</div>
        <div style={{ marginBottom: 12 }}>
          <Label text="Rating" />
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map(r => (
              <button key={r} onClick={() => setRating(r)}
                style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", opacity: r <= rating ? 1 : 0.3 }}>⭐</button>
            ))}
          </div>
        </div>
        <Label text="Comment (optional)" />
        <textarea style={{ ...S.input, minHeight: 80, resize: "vertical", marginBottom: 12 }}
          placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} />
        <button style={{ ...S.btn, width: "100%", opacity: submitting ? 0.6 : 1 }}
          disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default function UserShop() {
  const [loading, setLoading]         = useState(true);
  const [data, setData]               = useState({ profile: {}, products: [], cart: [], wishlist: [], categories: [], fees: [] });
  const [orders, setOrders]           = useState([]);
  const [view, setView]               = useState("shop");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filterCat, setFilterCat]     = useState("all");
  const [searchQ, setSearchQ]         = useState("");
  const [msg, setMsg]                 = useState({ text: "", ok: true });
  const [submitting, setSubmitting]   = useState(false);
  const [couponCode, setCouponCode]   = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg]     = useState("");
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", whatsapp: "", street: "", city: "", country: "" });
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [reviewOrder, setReviewOrder]   = useState(null);

  const loadAll = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { setMsg({ text: "Please login first.", ok: false }); setLoading(false); return; }
    const [shopRes, ordersRes] = await Promise.all([
      supabase.rpc("shop_user_load"),
      supabase.rpc("shop_user_orders"),
    ]);
    if (shopRes.data) {
      setData(shopRes.data);
      setCheckoutForm(f => ({
        ...f,
        buyer_name: shopRes.data.profile?.full_name || "",
        city: shopRes.data.profile?.city || "",
        country: shopRes.data.profile?.country || "",
      }));
    }
    if (ordersRes.data?.orders) setOrders(ordersRes.data.orders);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const balance  = Number(data.profile?.total_aidla_coins || 0);
  const cartCount = (data.cart || []).reduce((s, c) => s + c.quantity, 0);

  const feePct = useMemo(() =>
    (data.fees || []).reduce((s, f) => s + Number(f.percentage), 0),
  [data.fees]);

  const cartTotal = useMemo(() => {
    return (data.cart || []).reduce((s, c) => {
      const price = discountedPrice(c.price_coins, c.discount_pct);
      const varExtra = Number(c.variant_extra || 0);
      const subtotal = (price + varExtra) * c.quantity;
      return s + subtotal + (subtotal * feePct / 100);
    }, 0);
  }, [data.cart, feePct]);

  function discountedPrice(price, discountPct) {
    return price - (price * (discountPct || 0) / 100);
  }

  function calcOrderTotal(product, variant, qty) {
    const base = discountedPrice(product.price_coins, product.discount_pct);
    const varExtra = Number(variant?.extra_coins || 0);
    const unit = base + varExtra;
    const afterCoupon = unit - (unit * couponDiscount / 100);
    const fee = afterCoupon * qty * feePct / 100;
    return (afterCoupon * qty) + fee;
  }

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const handleToggleWishlist = async (productId) => {
    await supabase.rpc("shop_toggle_wishlist", { p_product_id: productId });
    await loadAll();
  };

  const handleUpdateCart = async (productId, variantId, quantity) => {
    await supabase.rpc("shop_update_cart", {
      p_product_id: productId,
      p_variant_id: variantId || null,
      p_quantity: quantity
    });
    await loadAll();
  };

  const handleValidateCoupon = async () => {
    setCouponMsg("");
    const { data: d } = await supabase.rpc("shop_validate_coupon", { p_code: couponCode });
    if (d?.ok) { setCouponDiscount(d.discount_pct); setCouponMsg(`✅ ${d.discount_pct}% off applied!`); }
    else { setCouponMsg(`❌ ${d?.error || "Invalid"}`); setCouponDiscount(0); }
  };

  const handleBuyNow = (product, variant = null) => {
    const total = calcOrderTotal(product, variant, 1);
    if (balance < total) { setShowInsufficientModal(true); return; }
    setCheckoutItem({ product, variant, quantity: 1 });
    setCouponCode(""); setCouponDiscount(0); setCouponMsg("");
    setView("checkout");
  };

  // checkout from cart item
  const handleCartCheckout = (cartItem) => {
    const product = (data.products || []).find(p => p.id === cartItem.product_id);
    if (!product) { showMsg("Product not found", false); return; }
    const variant = cartItem.variant_id ? { id: cartItem.variant_id, extra_coins: cartItem.variant_extra, value: cartItem.variant_value } : null;
    const total = calcOrderTotal(product, variant, cartItem.quantity);
    if (balance < total) { setShowInsufficientModal(true); return; }
    setCheckoutItem({ product, variant, quantity: cartItem.quantity });
    setCouponCode(""); setCouponDiscount(0); setCouponMsg("");
    setView("checkout");
  };

  const handlePlaceOrder = async () => {
    if (!checkoutItem) return;
    setSubmitting(true);
    const { data: d, error } = await supabase.rpc("shop_place_order", {
      p_product_id: checkoutItem.product.id,
      p_variant_id: checkoutItem.variant?.id || null,
      p_quantity:   checkoutItem.quantity,
      p_buyer_name: checkoutForm.buyer_name,
      p_whatsapp:   checkoutForm.whatsapp,
      p_street:     checkoutForm.street,
      p_city:       checkoutForm.city,
      p_country:    checkoutForm.country,
      p_coupon_code: couponCode || null,
    });
    setSubmitting(false);
    if (error || !d?.ok) { showMsg(error?.message || d?.error || "Order failed", false); return; }
    try {
      await supabase.functions.invoke("shop-notify", {
        body: {
          type: "order_submitted",
          user_email: data.profile.email,
          user_name: checkoutForm.buyer_name,
          txn_no: d.txn_no,
          product_name: checkoutItem.product.name,
          total_coins: d.total_coins,
          cashback: d.cashback,
        }
      });
    } catch (_) {}
    showMsg(`✅ Order placed! Ref: ${d.txn_no}${d.cashback > 0 ? ` · Cashback pending admin approval!` : ""}`);
    setCheckoutItem(null);
    setCouponCode(""); setCouponDiscount(0);
    setView("orders");
    await loadAll();
  };

  const handleSubmitReview = async (productId, rating, comment) => {
    const { data: d, error } = await supabase.rpc("shop_submit_review", {
      p_product_id: productId, p_rating: rating, p_comment: comment
    });
    if (error || !d?.ok) { showMsg(error?.message || d?.error || "Review failed", false); return; }
    showMsg("✅ Review submitted!");
    await loadAll();
  };

  const filteredProducts = useMemo(() => {
    return (data.products || []).filter(p => {
      const matchCat = filterCat === "all" || p.category_id === parseInt(filterCat);
      const matchQ = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase());
      return matchCat && matchQ;
    });
  }, [data.products, filterCat, searchQ]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontSize: 16, color: "#64748b" }}>Loading…</div>;

  return (
    <>
      <style>{CSS}</style>

      <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      {reviewOrder && <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={handleSubmitReview} />}

      {showInsufficientModal && (
        <div style={S.overlay} onClick={() => setShowInsufficientModal(false)}>
          <div style={{ ...S.modal, maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>😔</div>
            <div style={{ fontWeight: 900, fontSize: 18, textAlign: "center", marginBottom: 8 }}>Insufficient Coins</div>
            <div style={{ color: "#64748b", textAlign: "center", marginBottom: 16, fontSize: 14 }}>You don't have enough coins for this purchase.</div>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button style={S.btn} onClick={() => { setShowInsufficientModal(false); window.location.href = "/user/wallet"; }}>💰 Buy Coins</button>
              <button style={{ ...S.btn, background: "linear-gradient(135deg,#16a34a,#22c55e)" }} onClick={() => { setShowInsufficientModal(false); window.location.href = "/user/mining"; }}>⛏️ Earn Coins</button>
              <button style={{ ...S.btn, background: "#94a3b8" }} onClick={() => setShowInsufficientModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={S.page}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#1e3a8a" }}>🛍️ Shop</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#eff6ff", color: "#1e3a8a", padding: "6px 14px", borderRadius: 20, fontWeight: 800, fontSize: 14 }}>
              💰 {fmt(balance)} coins
            </div>
            <button style={{ ...S.tabBtn, position: "relative" }} onClick={() => setView("cart")}>
              🛒 Cart
              {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
            </button>
            <button style={S.tabBtn} onClick={() => setView("orders")}>📦 Orders</button>
            <button style={S.tabBtn} onClick={() => setView("shop")}>🏠 Shop</button>
          </div>
        </div>

        {msg.text && <div style={{ ...S.msgBox, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#b91c1c", marginBottom: 12 }}>{msg.text}</div>}

        {/* ── SHOP VIEW ── */}
        {view === "shop" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input style={{ ...S.input, flex: 2, minWidth: 180 }} placeholder="🔍 Search products…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <select style={{ ...S.input, flex: 1, minWidth: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="all">All Categories</option>
                {(data.categories || []).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            {filteredProducts.some(p => p.is_featured) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: "#92400e" }}>⭐ Featured</div>
                <div style={S.grid}>
                  {filteredProducts.filter(p => p.is_featured).map(p => (
                    <ProductCard key={p.id} p={p}
                      onView={() => { setSelectedProduct(p); setSelectedVariant(null); setView("product"); }}
                      onWishlist={() => handleToggleWishlist(p.id)}
                      onCart={() => handleUpdateCart(p.id, null, ((data.cart||[]).find(c=>c.product_id===p.id&&!c.variant_id)?.quantity||0)+1)}
                      onBuy={() => handleBuyNow(p)}
                      inWishlist={p.in_wishlist} balance={balance} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>All Products ({filteredProducts.length})</div>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No products found.</div>
            ) : (
              <div style={S.grid}>
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} p={p}
                    onView={() => { setSelectedProduct(p); setSelectedVariant(null); setView("product"); }}
                    onWishlist={() => handleToggleWishlist(p.id)}
                    onCart={() => handleUpdateCart(p.id, null, ((data.cart||[]).find(c=>c.product_id===p.id&&!c.variant_id)?.quantity||0)+1)}
                    onBuy={() => handleBuyNow(p)}
                    inWishlist={p.in_wishlist} balance={balance} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PRODUCT DETAIL ── */}
        {view === "product" && selectedProduct && (
          <div>
            <button style={S.backBtn} onClick={() => setView("shop")}>← Back</button>
            <div style={S.card}>
              {selectedProduct.images?.length > 0 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
                  {selectedProduct.images.map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: 200, height: 160, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900 }}>{selectedProduct.name}</h2>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{selectedProduct.category_icon} {selectedProduct.category_name} · {selectedProduct.type}</div>
                  {selectedProduct.avg_rating > 0 && <div style={{ fontSize: 13, color: "#f59e0b" }}>{"⭐".repeat(Math.round(selectedProduct.avg_rating))} {selectedProduct.avg_rating} ({selectedProduct.review_count} reviews)</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  {selectedProduct.discount_pct > 0 && <div style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(selectedProduct.price_coins)} coins</div>}
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#1e3a8a" }}>{fmt(discountedPrice(selectedProduct.price_coins, selectedProduct.discount_pct))} coins</div>
                  {selectedProduct.discount_pct > 0 && <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{selectedProduct.discount_pct}% OFF</span>}
                  {selectedProduct.cashback_pct > 0 && <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 4 }}>🎁 {selectedProduct.cashback_pct}% cashback (pending admin approval)</div>}
                  {selectedProduct.sale_ends_at && new Date(selectedProduct.sale_ends_at) > new Date() && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>⏰ Sale ends {new Date(selectedProduct.sale_ends_at).toLocaleDateString()}</div>}
                </div>
              </div>
              {selectedProduct.description && <p style={{ color: "#475569", fontSize: 14, margin: "14px 0", lineHeight: 1.6 }}>{selectedProduct.description}</p>}
              {!selectedProduct.unlimited_stock && (
                <div style={{ fontSize: 13, marginBottom: 12, color: selectedProduct.stock < 5 ? "#ef4444" : "#64748b", fontWeight: selectedProduct.stock < 5 ? 700 : 400 }}>
                  {selectedProduct.stock < 5 ? `⚠️ Only ${selectedProduct.stock} left!` : `📦 ${selectedProduct.stock} in stock`}
                </div>
              )}
              {selectedProduct.variants?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Select Variant:</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedProduct.variants.map(v => (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        style={{ padding: "8px 16px", borderRadius: 8, border: selectedVariant?.id === v.id ? "2px solid #3b82f6" : "1px solid #e2e8f0", background: selectedVariant?.id === v.id ? "#eff6ff" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        {v.value} {v.extra_coins > 0 ? `+${v.extra_coins}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button style={{ ...S.btn, flex: 1 }} onClick={() => handleBuyNow(selectedProduct, selectedVariant)}>⚡ Buy Now</button>
                <button style={{ ...S.btn, background: "linear-gradient(135deg,#475569,#64748b)", flex: 1 }} onClick={() => {
                  const existing = (data.cart||[]).find(c=>c.product_id===selectedProduct.id&&(selectedVariant?c.variant_id===selectedVariant.id:!c.variant_id));
                  handleUpdateCart(selectedProduct.id, selectedVariant?.id, (existing?.quantity||0)+1);
                  showMsg("Added to cart!");
                }}>🛒 Add to Cart</button>
                <button style={{ ...S.btn, background: selectedProduct.in_wishlist ? "#fef3c7" : "#f1f5f9", color: selectedProduct.in_wishlist ? "#92400e" : "#475569", border: "1px solid #e2e8f0" }} onClick={() => handleToggleWishlist(selectedProduct.id)}>
                  {selectedProduct.in_wishlist ? "💛 Saved" : "🤍 Save"}
                </button>
              </div>
            </div>
            {/* Related */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>More Products</div>
              <div style={S.grid}>
                {(data.products||[]).filter(p => p.id !== selectedProduct.id && p.category_id === selectedProduct.category_id).slice(0,4).map(p => (
                  <ProductCard key={p.id} p={p}
                    onView={() => { setSelectedProduct(p); setSelectedVariant(null); setView("product"); window.scrollTo(0,0); }}
                    onWishlist={() => handleToggleWishlist(p.id)}
                    onCart={() => handleUpdateCart(p.id, null, ((data.cart||[]).find(c=>c.product_id===p.id&&!c.variant_id)?.quantity||0)+1)}
                    onBuy={() => handleBuyNow(p)}
                    inWishlist={p.in_wishlist} balance={balance} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CART VIEW ── */}
        {view === "cart" && (
          <div>
            <button style={S.backBtn} onClick={() => setView("shop")}>← Back</button>
            <div style={S.card}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>🛒 Your Cart ({cartCount} items)</div>
              {(data.cart||[]).length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                  Your cart is empty.
                  <button style={{ ...S.btn, display: "inline-block", padding: "6px 14px", fontSize: 13, marginLeft: 10 }} onClick={() => setView("shop")}>Shop Now</button>
                </div>
              ) : (
                <>
                  {(data.cart||[]).map(item => (
                    <div key={item.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          {item.images?.[0] && <img src={item.images[0]} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{item.product_name}</div>
                            {item.variant_value && <div style={{ fontSize: 12, color: "#64748b" }}>{item.variant_value}</div>}
                            <div style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 700 }}>
                              {fmt(discountedPrice(item.price_coins, item.discount_pct) + Number(item.variant_extra||0))} coins each
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button style={S.qtyBtn} onClick={() => handleUpdateCart(item.product_id, item.variant_id, item.quantity - 1)}>−</button>
                          <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                          <button style={S.qtyBtn} onClick={() => handleUpdateCart(item.product_id, item.variant_id, item.quantity + 1)}>+</button>
                          <button style={{ ...S.qtyBtn, color: "#ef4444" }} onClick={() => handleUpdateCart(item.product_id, item.variant_id, 0)}>🗑️</button>
                        </div>
                      </div>
                      {/* Checkout button per cart item */}
                      <div style={{ marginTop: 10 }}>
                        <button style={{ ...S.btn, padding: "8px 18px", fontSize: 13, width: "100%" }}
                          onClick={() => handleCartCheckout(item)}>
                          ⚡ Checkout this item ({fmt((discountedPrice(item.price_coins, item.discount_pct) + Number(item.variant_extra||0)) * item.quantity * (1 + feePct/100))} coins)
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, padding: "12px 0", borderTop: "2px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16 }}>
                      <span>Cart Total (est.)</span>
                      <span style={{ color: "#1e3a8a" }}>{fmt(cartTotal)} coins</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Each item has its own checkout button above.</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CHECKOUT VIEW ── */}
        {view === "checkout" && checkoutItem && (
          <div>
            <button style={S.backBtn} onClick={() => setView("cart")}>← Back</button>
            <div style={S.card}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>⚡ Checkout</div>

              {/* Order Summary */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Order Summary</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span>{checkoutItem.product.name} {checkoutItem.variant ? `(${checkoutItem.variant.value})` : ""} ×{checkoutItem.quantity}</span>
                  <span>{fmt(discountedPrice(checkoutItem.product.price_coins, checkoutItem.product.discount_pct) + Number(checkoutItem.variant?.extra_coins||0))} coins</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#16a34a" }}>
                    <span>Coupon ({couponDiscount}% off)</span>
                    <span>-{fmt(discountedPrice(checkoutItem.product.price_coins, checkoutItem.product.discount_pct) * couponDiscount / 100)} coins</span>
                  </div>
                )}
                {feePct > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                    <span>Fees ({feePct}%)</span>
                    <span>included</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 16 }}>
                  <span>Total</span>
                  <span style={{ color: "#1e3a8a" }}>{fmt(calcOrderTotal(checkoutItem.product, checkoutItem.variant, checkoutItem.quantity))} coins</span>
                </div>
                {checkoutItem.product.cashback_pct > 0 && (
                  <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6 }}>🎁 Cashback: {fmt(calcOrderTotal(checkoutItem.product, checkoutItem.variant, checkoutItem.quantity) * checkoutItem.product.cashback_pct / 100)} coins (pending admin approval)</div>
                )}
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 14 }}>
                <Label text="Coupon Code (optional)" />
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...S.input, flex: 1 }} placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                  <button style={{ ...S.btn, padding: "9px 16px", fontSize: 13 }} onClick={handleValidateCoupon}>Apply</button>
                </div>
                {couponMsg && <div style={{ fontSize: 12, marginTop: 4, color: couponMsg.startsWith("✅") ? "#166534" : "#b91c1c", fontWeight: 700 }}>{couponMsg}</div>}
              </div>

              <Label text="Your Name" />
              <input style={{ ...S.input, marginBottom: 8 }} value={checkoutForm.buyer_name} onChange={e => setCheckoutForm(f => ({ ...f, buyer_name: e.target.value }))} />
              <Label text="WhatsApp Number" />
              <input style={{ ...S.input, marginBottom: 8 }} value={checkoutForm.whatsapp} onChange={e => setCheckoutForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+971..." />
              {checkoutItem.product.type === "physical" && (
                <>
                  <Label text="Street Address" />
                  <input style={{ ...S.input, marginBottom: 8 }} value={checkoutForm.street} onChange={e => setCheckoutForm(f => ({ ...f, street: e.target.value }))} />
                </>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><Label text="City" /><input style={S.input} value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div><Label text="Country" /><input style={S.input} value={checkoutForm.country} onChange={e => setCheckoutForm(f => ({ ...f, country: e.target.value }))} /></div>
              </div>
              <div style={{ marginTop: 8, padding: "10px 14px", background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#92400e", fontWeight: 700 }}>
                📧 Email: {data.profile.email} (not editable)
              </div>
              <button style={{ ...S.btn, marginTop: 14, width: "100%", opacity: submitting ? 0.6 : 1 }}
                disabled={submitting} onClick={handlePlaceOrder}>
                {submitting ? "Placing Order…" : `✅ Confirm Order · ${fmt(calcOrderTotal(checkoutItem.product, checkoutItem.variant, checkoutItem.quantity))} coins`}
              </button>
            </div>
          </div>
        )}

        {/* ── ORDERS VIEW ── */}
        {view === "orders" && (
          <div>
            <button style={S.backBtn} onClick={() => setView("shop")}>← Back</button>
            <div style={S.card}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📦 My Orders</div>
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                  No orders yet.
                  <button style={{ ...S.btn, display: "inline-block", padding: "6px 14px", fontSize: 13, marginLeft: 10 }} onClick={() => setView("shop")}>Shop Now</button>
                </div>
              ) : orders.map(o => (
                <div key={o.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      {o.product_images?.[0] && <img src={o.product_images[0]} alt="" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />}
                      <div>
                        <div style={{ fontWeight: 700 }}>{o.product_name} {o.variant_value ? `(${o.variant_value})` : ""}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{o.txn_no}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(o.created_at).toLocaleDateString()} · Qty: {o.quantity}</div>
                        {/* Cashback status */}
                        {o.cashback_coins > 0 && (
                          <div style={{ fontSize: 12, marginTop: 2 }}>
                            🎁 Cashback {fmt(o.cashback_coins)} coins —{" "}
                            {o.cashback_status === "approved" ? <span style={{ color: "#166534", fontWeight: 700 }}>✅ Credited</span>
                             : o.cashback_status === "rejected" ? <span style={{ color: "#b91c1c", fontWeight: 700 }}>❌ Rejected</span>
                             : o.cashback_status === "pending" ? <span style={{ color: "#92400e", fontWeight: 700 }}>⏳ Pending</span>
                             : <span style={{ color: "#94a3b8" }}>—</span>}
                          </div>
                        )}
                        {o.admin_note && <div style={{ fontSize: 12, color: "#92400e", marginTop: 4 }}>Note: {o.admin_note}</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {statusBadge(o.status)}
                      <div style={{ fontWeight: 900, fontSize: 16, color: "#1e3a8a", marginTop: 4 }}>{fmt(o.total_coins)} coins</div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <button style={S.smallBtn} onClick={() => setReceiptOrder(o)}>🧾 Receipt</button>
                    {o.status === "approved" && !o.has_review && (
                      <button style={{ ...S.smallBtn, background: "#fef9c3", color: "#92400e", border: "1px solid #fde047" }}
                        onClick={() => setReviewOrder(o)}>⭐ Leave Review</button>
                    )}
                    {o.status === "approved" && o.has_review && (
                      <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>✅ Reviewed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ProductCard({ p, onView, onWishlist, onCart, onBuy, inWishlist, balance }) {
  const discounted = p.price_coins * (1 - (p.discount_pct||0)/100);
  const canAfford = balance >= discounted;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative" }}>
      {p.discount_pct > 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800, zIndex: 1 }}>{p.discount_pct}% OFF</span>}
      {p.is_featured && <span style={{ position: "absolute", top: 8, right: 36, background: "#f59e0b", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800, zIndex: 1 }}>⭐</span>}
      <button style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 16, cursor: "pointer", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={e => { e.stopPropagation(); onWishlist(); }}>
        {inWishlist ? "💛" : "🤍"}
      </button>
      <div onClick={onView}>
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
          : <div style={{ width: "100%", height: 140, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🛍️</div>}
        <div style={{ padding: "10px 12px 6px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{p.category_icon} {p.category_name}</div>
          {!p.unlimited_stock && p.stock < 5 && <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 4 }}>⚠️ Only {p.stock} left!</div>}
          {p.avg_rating > 0 && <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 4 }}>{"⭐".repeat(Math.round(p.avg_rating))} ({p.review_count})</div>}
          {p.discount_pct > 0 && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>{fmt(p.price_coins)} coins</div>}
          <div style={{ fontWeight: 900, fontSize: 15, color: "#1e3a8a" }}>{fmt(discounted)} coins</div>
          {p.cashback_pct > 0 && <div style={{ fontSize: 11, color: "#7c3aed" }}>🎁 {p.cashback_pct}% cashback</div>}
        </div>
      </div>
      <div style={{ padding: "0 12px 12px", display: "flex", gap: 6 }}>
        <button style={{ ...miniBtn("#1e3a8a"), flex: 1, opacity: canAfford ? 1 : 0.5 }} onClick={onBuy}>⚡ Buy</button>
        <button style={{ ...miniBtn("#475569"), flex: 1 }} onClick={onCart}>🛒</button>
      </div>
    </div>
  );
}

function miniBtn(bg) {
  return { background: bg, color: "#fff", border: "none", padding: "7px 10px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
}

function Label({ text }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", margin: "8px 0 3px", textTransform: "uppercase" }}>{text}</div>;
}

const S = {
  page:    { maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: "#0f172a" },
  card:    { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: "1px solid #e2e8f0" },
  input:   { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
  btn:     { background: "linear-gradient(135deg,#1e3a8a,#3b82f6)", color: "#fff", border: "none", padding: "11px 20px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  smallBtn:{ background: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  tabBtn:  { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", position: "relative" },
  backBtn: { background: "none", border: "none", color: "#3b82f6", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 12, fontFamily: "inherit", padding: 0 },
  msgBox:  { padding: "10px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13 },
  qtyBtn:  { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, width: 30, height: 30, fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 },
  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modal:   { background: "#fff", borderRadius: 16, padding: 24, width: "min(420px,100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(15,23,42,0.2)" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; }
input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
`;