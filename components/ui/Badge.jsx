// components/ui/Badge.jsx
// Small status/category badge for use in tables and cards.

const VARIANTS = {
  success: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  warning: { bg: "#fef9c3", color: "#a16207", border: "#fde68a" },
  error:   { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  info:    { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
  neutral: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
  ai:      { bg: "#f3e8ff", color: "#7c3aed", border: "#e9d5ff" },
};

export default function Badge({ label, variant = "neutral", style: extraStyle }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}`,
      whiteSpace: "nowrap",
      ...extraStyle,
    }}>
      {label}
    </span>
  );
}
