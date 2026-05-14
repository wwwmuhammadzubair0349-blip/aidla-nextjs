// app/admin/reviews/page.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const STARS = [1, 2, 3, 4, 5];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  rating: 5,
  review_text: "",
  avatar_url: "",
  is_approved: false,
};

function StarDisplay({ rating }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("user_reviews").select("*").order("created_at", { ascending: false });
    if (filter === "approved") q = q.eq("is_approved", true);
    if (filter === "pending") q = q.eq("is_approved", false);
    const { data, error: err } = await q;
    if (!err) setReviews(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(review) {
    setForm({
      full_name: review.full_name || "",
      email: review.email || "",
      rating: review.rating || 5,
      review_text: review.review_text || "",
      avatar_url: review.avatar_url || "",
      is_approved: review.is_approved || false,
    });
    setEditId(review.id);
    setShowForm(true);
    setError("");
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const MAX = 120;
            const scale = Math.min(1, MAX / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
          };
          img.onerror = reject;
          img.src = ev.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setForm(f => ({ ...f, avatar_url: dataUrl }));
    } catch (err) {
      setError("Image processing failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.full_name.trim() || !form.email.trim() || !form.review_text.trim()) {
      setError("Name, email, and review text are required.");
      return;
    }
    setSaving(true);
    setError("");
    let err;
    if (editId) {
      ({ error: err } = await supabase.from("user_reviews").update(form).eq("id", editId));
    } else {
      ({ error: err } = await supabase.from("user_reviews").insert(form));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    fetchReviews();
  }

  async function toggleApproval(review) {
    await supabase.from("user_reviews").update({ is_approved: !review.is_approved }).eq("id", review.id);
    fetchReviews();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this review permanently?")) return;
    await supabase.from("user_reviews").delete().eq("id", id);
    fetchReviews();
  }

  const th = { padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: "0.78rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" };
  const td = { padding: "12px 14px", fontSize: "0.85rem", color: "#334155", verticalAlign: "top", borderBottom: "1px solid #f1f5f9" };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0b1437", margin: 0 }}>User Reviews</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {["all", "approved", "pending"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid",
                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                background: filter === f ? "#1e3a8a" : "transparent",
                color: filter === f ? "#fff" : "#64748b",
                borderColor: filter === f ? "#1e3a8a" : "#e2e8f0",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={openAdd}
            style={{ padding: "6px 16px", borderRadius: 20, border: "none", background: "#059669", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
          >
            + Add Review
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 28 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "#0b1437" }}>
            {editId ? "Edit Review" : "Add Review"}
          </h2>
          {error && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
            {[
              { label: "Full Name", key: "full_name", type: "text" },
              { label: "Email", key: "email", type: "email" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: "0.87rem", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Rating</label>
              <select
                value={form.rating}
                onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: "0.87rem" }}
              >
                {STARS.map(s => <option key={s} value={s}>{s} star{s > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>

          {/* Avatar upload */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: 8 }}>
              Reviewer Photo
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="avatar preview"
                  style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "#94a3b8" }}>
                  👤
                </div>
              )}
              <div>
                <label style={{
                  display: "inline-block", padding: "7px 16px", borderRadius: 8,
                  background: uploading ? "#e2e8f0" : "#f1f5f9",
                  border: "1px solid #e2e8f0", fontSize: "0.82rem", fontWeight: 600,
                  color: uploading ? "#94a3b8" : "#334155", cursor: uploading ? "not-allowed" : "pointer",
                }}>
                  {uploading ? "Uploading…" : "Upload Photo"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={handleAvatarUpload}
                  />
                </label>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>JPG, PNG, WebP · max 2 MB</div>
              </div>
              {form.avatar_url && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", marginBottom: 3 }}>
                    Or paste URL directly
                  </label>
                  <input
                    type="url"
                    value={form.avatar_url}
                    onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.78rem", boxSizing: "border-box", color: "#64748b" }}
                  />
                </div>
              )}
            </div>
            {!form.avatar_url && (
              <div style={{ marginTop: 6 }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", marginBottom: 3 }}>
                  Or paste URL directly
                </label>
                <input
                  type="url"
                  value={form.avatar_url}
                  placeholder="https://..."
                  onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
                  style={{ width: "100%", maxWidth: 360, padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Review Text (20–500 chars)</label>
            <textarea
              value={form.review_text}
              onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
              rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: "0.87rem", resize: "vertical", boxSizing: "border-box" }}
            />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{form.review_text.length}/500</span>
          </div>

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="is_approved"
              checked={form.is_approved}
              onChange={e => setForm(f => ({ ...f, is_approved: e.target.checked }))}
            />
            <label htmlFor="is_approved" style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>Approved (visible on site)</label>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              style={{ padding: "8px 20px", background: "#1e3a8a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem", cursor: (saving || uploading) ? "not-allowed" : "pointer", opacity: (saving || uploading) ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : editId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ padding: "8px 20px", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No reviews found.</p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={th}>Reviewer</th>
                <th style={th}>Email</th>
                <th style={th}>Rating</th>
                <th style={{ ...th, minWidth: 200 }}>Review</th>
                <th style={th}>Status</th>
                <th style={th}>Date</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} style={{ background: "#fff" }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {r.avatar_url ? (
                        <img
                          src={r.avatar_url}
                          alt={r.full_name}
                          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                          👤
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>{r.full_name}</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontSize: "0.78rem", color: "#64748b" }}>{r.email}</td>
                  <td style={td}><StarDisplay rating={r.rating} /></td>
                  <td style={{ ...td, maxWidth: 280 }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.review_text}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                      background: r.is_approved ? "rgba(5,150,105,0.1)" : "rgba(245,158,11,0.1)",
                      color: r.is_approved ? "#047857" : "#b45309",
                    }}>
                      {r.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-PK") : "—"}
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => toggleApproval(r)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", background: r.is_approved ? "rgba(220,38,38,0.07)" : "rgba(5,150,105,0.07)", color: r.is_approved ? "#dc2626" : "#047857", borderColor: r.is_approved ? "rgba(220,38,38,0.2)" : "rgba(5,150,105,0.2)" }}
                      >
                        {r.is_approved ? "Reject" : "Approve"}
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", background: "transparent", color: "#334155" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,0.2)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", background: "rgba(220,38,38,0.05)", color: "#dc2626" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
