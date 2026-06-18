"use client";
// components/ui/Modal.jsx
// Accessible modal with backdrop, close button, and content slot.

import { useEffect } from "react";

const CSS = `
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: modal-in 0.15s ease both;
}
@keyframes modal-in { from { opacity:0; } to { opacity:1; } }
.modal-box {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15,23,42,0.18);
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 32px);
  overflow: hidden;
  width: 100%;
  animation: modal-rise 0.2s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes modal-rise {
  from { opacity:0; transform:translateY(16px) scale(0.97); }
  to   { opacity:1; transform:none; }
}
.modal-sm { max-width: 420px; }
.modal-md { max-width: 580px; }
.modal-lg { max-width: 780px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.modal-title {
  font-size: 1rem; font-weight: 800; color: #0f172a;
  letter-spacing: -0.02em; margin: 0;
}
.modal-close {
  width: 28px; height: 28px;
  border-radius: 8px; border: none;
  background: #f1f5f9; color: #64748b;
  font-size: 1rem; cursor: pointer; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
`;

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{CSS}</style>
      <div
        className="modal-backdrop"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`modal-box modal-${size}`}>
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </>
  );
}
