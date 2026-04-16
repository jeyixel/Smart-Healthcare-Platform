"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = "danger"
}: ConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeColors = {
    danger: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      hover: "linear-gradient(135deg, #dc2626, #b91c1c)",
      icon: "#ef4444"
    },
    warning: {
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      hover: "linear-gradient(135deg, #d97706, #b45309)",
      icon: "#f59e0b"
    },
    info: {
      background: "linear-gradient(135deg, #06b6d4, #0891b2)",
      hover: "linear-gradient(135deg, #0891b2, #0e7490)",
      icon: "#06b6d4"
    }
  };

  const colors = typeColors[type];

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      animation: "fadeIn 0.2s ease-out"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        animation: "slideUp 0.3s ease-out"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `${colors.icon}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {type === "danger" && (
              <svg width="20" height="20" fill={colors.icon} viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
            {type === "warning" && (
              <svg width="20" height="20" fill={colors.icon} viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            )}
            {type === "info" && (
              <svg width="20" height="20" fill={colors.icon} viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            )}
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a"
            }}>
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: "20px 24px"
        }}>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#64748b",
            lineHeight: 1.5
          }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fff";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: colors.background,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = colors.hover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = colors.background;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUp {
          0% { 
            transform: translateY(20px);
            opacity: 0;
          }
          100% { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
