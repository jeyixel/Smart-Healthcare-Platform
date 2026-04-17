"use client";

import { useState, useMemo } from "react";
import {
  useAppointments,
  Appointment,
  AppointmentStatus,
} from "@/app/hooks/useAppointments";
import { useDoctorContext } from "@/app/context/DoctorContext";
import { useRouter } from "next/navigation";

// ─── Palette helpers ──────────────────────────────────────────────────────────

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; bg: string; color: string; dot: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "rgba(245,158,11,0.10)",
    color: "#d97706",
    dot: "#f59e0b",
    border: "rgba(245,158,11,0.25)",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "rgba(99,102,241,0.10)",
    color: "#4f46e5",
    dot: "#6366f1",
    border: "rgba(99,102,241,0.25)",
  },
  COMPLETED: {
    label: "Completed",
    bg: "rgba(16,185,129,0.10)",
    color: "#059669",
    dot: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    dot: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
};

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  ONLINE:   { icon: "🖥️", color: "#06b6d4", bg: "rgba(6,182,212,0.08)" },
  PHYSICAL: { icon: "🏥", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
};

function statusPill(status: AppointmentStatus) {
  const m = STATUS_META[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: 700,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        padding: "3px 10px",
        borderRadius: "999px",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: m.dot,
          flexShrink: 0,
        }}
      />
      {m.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isToday(dateStr: string) {
  const today = new Date();
  const appointmentDate = new Date(dateStr + "T00:00:00");
  
  // Compare dates in the same timezone
  return today.toDateString() === appointmentDate.toDateString();
}

function isFuture(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  const appointmentDate = new Date(dateStr + "T00:00:00");
  
  return appointmentDate > today;
}

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  const appointmentDate = new Date(dateStr + "T00:00:00");
  
  // Calculate difference in days
  const diffTime = appointmentDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "TODAY";
  } else if (diffDays === 1) {
    return "TOMORROW";
  } else if (diffDays === -1) {
    return "YESTERDAY";
  } else if (diffDays > 1) {
    return `In ${diffDays} days`;
  } else if (diffDays < -1) {
    return `${Math.abs(diffDays)} days ago`;
  }
  
  return formatDate(dateStr); // Fallback to formatted date
}

function avatarColor(str: string) {
  const hues = [210, 160, 280, 30, 340, 190, 120, 50];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ w, h, r = 6 }: { w: string; h: string; r?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ─── Status update modal ──────────────────────────────────────────────────────

interface StatusModalProps {
  appt: Appointment;
  onClose: () => void;
  onSave: (status: AppointmentStatus, notes: string) => Promise<void>;
}

function StatusModal({ appt, onClose, onSave }: StatusModalProps) {
  const [status, setStatus] = useState<AppointmentStatus>(appt.status);
  const [notes, setNotes] = useState(appt.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allowedTransitions: AppointmentStatus[] =
    appt.status === "COMPLETED" || appt.status === "CANCELLED"
      ? []
      : appt.status === "CONFIRMED" 
        ? ["CONFIRMED", "COMPLETED", "CANCELLED"] as AppointmentStatus[]
        : (["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as AppointmentStatus[]);

  const isStatusBlocked = (status: AppointmentStatus) => {
    return appt.status === "CONFIRMED" && status === "PENDING";
  };

  const handleSave = async () => {
    if (allowedTransitions.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(status, notes);
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Update Appointment
            </p>
            <h3 style={{ margin: "4px 0 0", color: "#fff", fontSize: "16px", fontWeight: 700 }}>
              {formatDate(appt.appointmentDate)} at {formatTime(appt.appointmentTime)}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {allowedTransitions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>🔒</span>
              This appointment is finalized and cannot be modified.
            </div>
          ) : (
            <>
              {/* Status selector */}
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Status
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                {allowedTransitions.map((s) => {
                  const m = STATUS_META[s];
                  const active = status === s;
                  const blocked = isStatusBlocked(s);
                  return (
                    <button
                      key={s}
                      onClick={() => !blocked && setStatus(s)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: active ? `2px solid ${m.dot}` : (blocked ? "2px solid #f1f5f9" : "2px solid #e2e8f0"),
                        background: active ? m.bg : (blocked ? "#f1f5f9" : "#f8fafc"),
                        color: active ? m.color : (blocked ? "#9ca3af" : "#64748b"),
                        fontWeight: active ? 700 : 500,
                        fontSize: "13px",
                        cursor: blocked ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: blocked ? 0.6 : 1,
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: active ? m.dot : (blocked ? "#cbd5e1" : "#cbd5e1"),
                          flexShrink: 0,
                        }}
                      />
                      {m.label}
                      {blocked && (
                        <svg width="12" height="12" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ marginLeft: "4px" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2m14 0V9a2 2 0 01-2-2h-7z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Notes */}
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Clinical Notes
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add clinical notes, observations, or follow-up instructions…"
                rows={4}
                style={{
                  width: "100%",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  color: "#334155",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#06b6d4"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
              />

              {saveError && (
                <p style={{ margin: "10px 0 0", color: "#dc2626", fontSize: "13px", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: "8px" }}>
                  ⚠ {saveError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {allowedTransitions.length > 0 && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: saving
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#06b6d4,#0891b2)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 14px rgba(6,182,212,0.4)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {saving ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  appt,
  onClose,
  onEdit,
  onIssuePrescription,
}: {
  appt: Appointment;
  onClose: () => void;
  onEdit: () => void;
  onIssuePrescription: () => void;
}) {
  const hue = avatarColor(appt.patientId);
  const typeMeta = TYPE_META[appt.consultationType] ?? TYPE_META.PHYSICAL;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 900,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 95vw)",
          background: "#fff",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideRight 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Top strip */}
        <div
          style={{
            background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#06b6d4",
                background: "rgba(6,182,212,0.15)",
                border: "1px solid rgba(6,182,212,0.25)",
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              Appointment Details
            </span>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Patient avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "20px",
                boxShadow: `0 0 20px hsl(${hue},70%,55%)44`,
                flexShrink: 0,
              }}
            >
              P
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                PATIENT ID
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  color: "#e2e8f0",
                  fontWeight: 700,
                  fontSize: "13px",
                  fontFamily: "monospace",
                }}
              >
                {appt.patientId.slice(0, 18)}…
              </p>
              {statusPill(appt.status)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Date & time */}
          <InfoRow
            label="Date"
            value={formatDate(appt.appointmentDate)}
            icon="📅"
            highlight={isToday(appt.appointmentDate)}
          />
          <InfoRow label="Time" value={formatTime(appt.appointmentTime)} icon="⏰" />
          <InfoRow
            label="Type"
            value={appt.consultationType}
            icon={typeMeta.icon}
            badge={{ color: typeMeta.color, bg: typeMeta.bg }}
          />
          <InfoRow
            label="Appointment ID"
            value={appt.id.slice(0, 22) + "…"}
            icon="🆔"
            mono
          />
          <InfoRow
            label="Created"
            value={new Date(appt.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            icon="🕐"
          />

          {/* Reason */}
          {appt.reason && (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Reason for Visit
              </p>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                {appt.reason}
              </div>
            </div>
          )}

          {/* Notes */}
          {appt.notes && (
            <div style={{ marginTop: "14px" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Clinical Notes
              </p>
              <div
                style={{
                  background: "rgba(6,182,212,0.04)",
                  border: "1px solid rgba(6,182,212,0.15)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                {appt.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(appt.status === "CONFIRMED" || appt.status === "COMPLETED") && (
          <div
            style={{
              padding: "16px 24px 8px 24px",
              display: "flex",
              position: "relative",
              zIndex: 10
            }}
          >
             <button
              onClick={onIssuePrescription}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                transform: "translateY(-2px)",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #059669, #047857)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(16,185,129,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #10b981, #059669)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(16,185,129,0.35)";
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Issue Prescription
            </button>
          </div>
        )}

        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: appt.status === "CONFIRMED" ? "none" : "1px solid #f1f5f9",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={onEdit}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg,#06b6d4,#0891b2)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
              }}
            >
              Update Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  highlight,
  badge,
  mono,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
  badge?: { color: string; bg: string };
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid #f8fafc",
      }}
    >
      <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "10px",
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "13px",
            fontWeight: 600,
            color: highlight ? "#06b6d4" : badge ? badge.color : "#334155",
            fontFamily: mono ? "monospace" : "inherit",
            background: badge ? badge.bg : undefined,
            display: badge ? "inline-block" : undefined,
            padding: badge ? "2px 10px" : undefined,
            borderRadius: badge ? "999px" : undefined,
          }}
        >
          {value}
          {highlight && (
            <span
              style={{
                marginLeft: "8px",
                fontSize: "10px",
                background: "rgba(6,182,212,0.12)",
                color: "#0891b2",
                padding: "1px 8px",
                borderRadius: "999px",
                fontWeight: 700,
              }}
            >
              TODAY
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Appointment row ──────────────────────────────────────────────────────────

function AppointmentRow({
  appt,
  index,
  onView,
  onEdit,
}: {
  appt: Appointment;
  index: number;
  onView: () => void;
  onEdit: () => void;
}) {
  const [hov, setHov] = useState(false);
  const hue = avatarColor(appt.patientId);
  const typeMeta = TYPE_META[appt.consultationType] ?? TYPE_META.PHYSICAL;
  const today = isToday(appt.appointmentDate);
  const upcoming = isFuture(appt.appointmentDate);
  const relativeDateLabel = getRelativeDateLabel(appt.appointmentDate);

  return (
    <tr
      style={{
        background: hov
          ? "#f8fafc"
          : today
          ? "rgba(6,182,212,0.025)"
          : "#fff",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onView}
    >
      {/* # */}
      <td
        style={{
          padding: "14px 16px 14px 20px",
          fontSize: "12px",
          color: "#94a3b8",
          fontWeight: 600,
          width: "48px",
        }}
      >
        {index + 1}
      </td>

      {/* Patient */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
              flexShrink: 0,
              boxShadow: `0 2px 10px hsl(${hue},70%,55%)33`,
            }}
          >
            P
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "13px",
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "160px",
              }}
            >
              {appt.patientId.slice(0, 8).toUpperCase()}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#94a3b8" }}>
              Patient ID
            </p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td style={{ padding: "14px 16px" }}>
        <div>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "13px",
                color: today ? "#0891b2" : "#334155",
              }}
            >
              {formatDate(appt.appointmentDate)}
            </p>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: today ? "#06b6d4" : "#64748b",
                background: today ? "rgba(6,182,212,0.10)" : "rgba(100,116,139,0.10)",
                padding: "1px 7px",
                borderRadius: "999px",
                marginTop: "2px",
                display: "inline-block",
              }}
            >
              {relativeDateLabel}
            </span>
          </div>
          {upcoming && !today && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#6366f1",
                background: "rgba(99,102,241,0.08)",
                padding: "1px 7px",
                borderRadius: "999px",
                marginTop: "2px",
                display: "inline-block",
              }}
            >
              UPCOMING
            </span>
          )}
        </div>
      </td>

      {/* Time */}
      <td style={{ padding: "14px 16px" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "#475569",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(appt.appointmentTime)}
        </span>
      </td>

      {/* Type */}
      <td style={{ padding: "14px 16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 700,
            background: typeMeta.bg,
            color: typeMeta.color,
            padding: "4px 10px",
            borderRadius: "8px",
          }}
        >
          {typeMeta.icon} {appt.consultationType}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: "14px 16px" }}>{statusPill(appt.status)}</td>

      {/* Reason */}
      <td
        style={{
          padding: "14px 16px",
          maxWidth: "180px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {appt.reason ?? "—"}
        </p>
      </td>

      {/* Actions */}
      <td style={{ padding: "14px 20px 14px 8px" }}>
        <div
          style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onView}
            title="View details"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              fontSize: "14px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(6,182,212,0.3)";
              (e.currentTarget as HTMLButtonElement).style.color = "#0891b2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            }}
          >
            👁
          </button>
          {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
            <button
              onClick={onEdit}
              title="Update status"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
                fontSize: "14px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(16,185,129,0.3)";
                (e.currentTarget as HTMLButtonElement).style.color = "#059669";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLButtonElement).style.color = "#475569";
              }}
            >
              ✏️
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── KPI Mini Card ────────────────────────────────────────────────────────────

function MiniKpi({
  label,
  value,
  icon,
  color,
  bg,
  border,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "11px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
          boxShadow: `0 0 14px ${color}20`,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type FilterStatus = "ALL" | AppointmentStatus;
type SortKey = "date" | "time" | "status" | "type";

export function DoctorAppointmentsContent() {
  const { appointments, doctor, loading, error, refetch, updateAppointmentStatus } =
    useAppointments();
  const { setPrescriptionDraftAppointment, setActiveSection } = useDoctorContext();
  const router = useRouter();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ONLINE" | "PHYSICAL">("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    return {
      total: appointments.length,
      todayCount: appointments.filter((a) => isToday(a.appointmentDate)).length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    };
  }, [appointments]);

  // ── Filtered + sorted ──────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...appointments];

    if (filterStatus !== "ALL") {
      list = list.filter((a) => a.status === filterStatus);
    }
    if (filterType !== "ALL") {
      list = list.filter((a) => a.consultationType === filterType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientId.toLowerCase().includes(q) ||
          (a.reason ?? "").toLowerCase().includes(q) ||
          (a.notes ?? "").toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q) ||
          a.appointmentDate.includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.appointmentDate.localeCompare(b.appointmentDate);
      else if (sortKey === "time") cmp = a.appointmentTime.localeCompare(b.appointmentTime);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "type") cmp = a.consultationType.localeCompare(b.consultationType);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [appointments, filterStatus, filterType, search, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span style={{ fontSize: "10px", marginLeft: "3px" }}>
        {sortAsc ? "▲" : "▼"}
      </span>
    ) : null;

  // ── Error / loading / empty states ────────────────────────────────────────

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
          }}
        >
          ⚠️
        </div>
        <div>
          <h3 style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
            Failed to Load Appointments
          </h3>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
            {error}
          </p>
        </div>
        <button
          onClick={refetch}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Global keyframe styles */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .appt-table th { white-space:nowrap; }
        .appt-table tr { border-bottom:1px solid #f1f5f9; }
        .appt-table tr:last-child { border-bottom:none; }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "22px",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 55%,#0a1628 100%)",
            borderRadius: "20px",
            padding: "28px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid rgba(6,182,212,0.18)",
            boxShadow: "0 8px 40px rgba(6,182,212,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow blobs */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "25%",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(6,182,212,0.07)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "8%",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(139,92,246,0.05)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <span
              style={{
                background: "rgba(6,182,212,0.12)",
                color: "#06b6d4",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(6,182,212,0.25)",
              }}
            >
              ● Appointment Manager
            </span>
            <h2
              style={{
                margin: "12px 0 4px",
                fontSize: "clamp(18px,2.5vw,24px)",
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {loading
                ? "Loading your appointments…"
                : `Your Appointments`}
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
              {doctor
                ? `${doctor.specialty} · ${doctor.hospitalOrClinic} · ${doctor.experienceYears}y exp`
                : loading
                ? "Fetching doctor profile…"
                : "Manage, track and update all your scheduled appointments"}
            </p>
          </div>

          {/* Right side refresh */}
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              background: loading ? "rgba(255,255,255,0.05)" : "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.25)",
              color: loading ? "#475569" : "#06b6d4",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
            >
              <path strokeLinecap="round" d="M1 4v6h6M23 20v-6h-6" />
              <path strokeLinecap="round" d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* ── Stats grid ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px" }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <Skeleton w="42px" h="42px" r={11} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Skeleton w="40px" h="24px" r={4} />
                  <Skeleton w="80px" h="12px" r={4} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: "14px",
            }}
          >
            <MiniKpi
              label="Total"
              value={stats.total}
              icon="📋"
              color="#6366f1"
              bg="linear-gradient(135deg,rgba(99,102,241,0.08),rgba(79,70,229,0.04))"
              border="rgba(99,102,241,0.2)"
            />
            <MiniKpi
              label="Today"
              value={stats.todayCount}
              icon="📅"
              color="#06b6d4"
              bg="linear-gradient(135deg,rgba(6,182,212,0.08),rgba(8,145,178,0.04))"
              border="rgba(6,182,212,0.2)"
            />
            <MiniKpi
              label="Pending"
              value={stats.pending}
              icon="⏳"
              color="#f59e0b"
              bg="linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.04))"
              border="rgba(245,158,11,0.2)"
            />
            <MiniKpi
              label="Completed"
              value={stats.completed}
              icon="✅"
              color="#10b981"
              bg="linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))"
              border="rgba(16,185,129,0.2)"
            />
            <MiniKpi
              label="Cancelled"
              value={stats.cancelled}
              icon="❌"
              color="#ef4444"
              bg="linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.04))"
              border="rgba(239,68,68,0.2)"
            />
          </div>
        )}

        {/* ── Filter / Search bar ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e8f0fe",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              padding: "8px 14px",
              gap: "10px",
              flex: "1 1 220px",
              minWidth: "200px",
              transition: "border-color 0.2s",
            }}
            onFocus={() => {}}
          >
            <svg width="15" height="15" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient ID, reason, status…"
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                color: "#334155",
                flex: 1,
                fontFamily: "inherit",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: "16px",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => {
              const active = filterStatus === s;
              const m = s !== "ALL" ? STATUS_META[s] : null;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: active
                      ? `1.5px solid ${m?.dot ?? "#06b6d4"}`
                      : "1.5px solid #e2e8f0",
                    background: active ? (m?.bg ?? "rgba(6,182,212,0.08)") : "#f8fafc",
                    color: active ? (m?.color ?? "#0891b2") : "#64748b",
                    fontWeight: active ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s === "ALL" ? "All Statuses" : STATUS_META[s].label}
                </button>
              );
            })}
          </div>

          {/* Type filter */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["ALL", "ONLINE", "PHYSICAL"] as const).map((t) => {
              const active = filterType === t;
              const m = t !== "ALL" ? TYPE_META[t] : null;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: active
                      ? `1.5px solid ${m?.color ?? "#06b6d4"}`
                      : "1.5px solid #e2e8f0",
                    background: active ? (m?.bg ?? "rgba(6,182,212,0.08)") : "#f8fafc",
                    color: active ? (m?.color ?? "#0891b2") : "#64748b",
                    fontWeight: active ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t === "ALL" ? "All Types" : `${m?.icon} ${t}`}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          {!loading && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "12px",
                color: "#94a3b8",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} of {appointments.length} appointments
            </span>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            border: "1px solid #e8f0fe",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              className="appt-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(6,182,212,0.04),rgba(99,102,241,0.02))",
                    borderBottom: "2px solid #f1f5f9",
                  }}
                >
                  {[
                    { label: "#", key: null, w: "48px" },
                    { label: "Patient", key: null, w: undefined },
                    { label: "Date ↕", key: "date" as SortKey, w: undefined },
                    { label: "Time ↕", key: "time" as SortKey, w: undefined },
                    { label: "Type ↕", key: "type" as SortKey, w: undefined },
                    { label: "Status ↕", key: "status" as SortKey, w: undefined },
                    { label: "Reason", key: null, w: undefined },
                    { label: "Actions", key: null, w: "100px" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={col.key ? () => handleSort(col.key!) : undefined}
                      style={{
                        padding: "13px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        cursor: col.key ? "pointer" : "default",
                        userSelect: "none",
                        width: col.w,
                        transition: "color 0.15s",
                      }}
                    >
                      {col.label}
                      {col.key && <SortIcon k={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} style={{ padding: "16px" }}>
                          <Skeleton
                            w={j === 1 ? "140px" : j === 7 ? "70px" : "100px"}
                            h="14px"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "12px",
                          padding: "60px 20px",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "48px" }}>📭</span>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              fontSize: "15px",
                              color: "#0f172a",
                            }}
                          >
                            No appointments found
                          </p>
                          <p
                            style={{
                              margin: "6px 0 0",
                              fontSize: "13px",
                              color: "#64748b",
                            }}
                          >
                            {appointments.length === 0
                              ? "You have no appointments booked yet."
                              : "No appointments match your current filters."}
                          </p>
                        </div>
                        {(filterStatus !== "ALL" || filterType !== "ALL" || search) && (
                          <button
                            onClick={() => {
                              setFilterStatus("ALL");
                              setFilterType("ALL");
                              setSearch("");
                            }}
                            style={{
                              padding: "8px 18px",
                              borderRadius: "8px",
                              border: "1.5px solid rgba(6,182,212,0.3)",
                              background: "rgba(6,182,212,0.06)",
                              color: "#0891b2",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt, i) => (
                    <AppointmentRow
                      key={appt.id}
                      appt={appt}
                      index={i}
                      onView={() => setSelectedAppt(appt)}
                      onEdit={() => setEditAppt(appt)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Showing {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                {/* Pagination placeholder — extend when backend supports it */}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#cbd5e1",
                    fontStyle: "italic",
                  }}
                >
                  All results loaded
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail drawer ──────────────────────────────────────────────────────── */}
      {selectedAppt && (
        <DetailDrawer
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onEdit={() => {
            setEditAppt(selectedAppt);
            setSelectedAppt(null);
          }}
          onIssuePrescription={() => {
             setPrescriptionDraftAppointment(selectedAppt);
             setActiveSection('prescriptions');
             router.push('/doctor');
          }}
        />
      )}

      {/* ── Status update modal ────────────────────────────────────────────────── */}
      {editAppt && (
        <StatusModal
          appt={editAppt}
          onClose={() => setEditAppt(null)}
          onSave={async (status, notes) => {
            await updateAppointmentStatus(editAppt.id, status, notes);
          }}
        />
      )}
    </>
  );
}
