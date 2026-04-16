"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useDoctorContext } from "@/app/context/DoctorContext";
import { DoctorAvailability } from "@/app/hooks/useAppointments";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: "ONLINE" | "PHYSICAL";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  reason: string | null;
  notes: string | null;
}

interface DaySchedule {
  date: Date;
  dateStr: string;
  dayName: string;
  appointments: Appointment[];
  hasAppointments: boolean;
}

interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "UNAVAILABLE";
}

/* ─────────────────────────────────────────────────────────────── */
/*  AVAILABILITY MODAL COMPONENT                                  */
/* ─────────────────────────────────────────────────────────────── */
function AvailabilityModal({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (availability: AvailabilitySlot[]) => void;
}) {
  const { doctor } = useAppointments();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00", status: "AVAILABLE" },
    { dayOfWeek: "TUESDAY", startTime: "09:00", endTime: "17:00", status: "AVAILABLE" },
    { dayOfWeek: "WEDNESDAY", startTime: "09:00", endTime: "17:00", status: "AVAILABLE" },
    { dayOfWeek: "THURSDAY", startTime: "09:00", endTime: "17:00", status: "AVAILABLE" },
    { dayOfWeek: "FRIDAY", startTime: "09:00", endTime: "17:00", status: "AVAILABLE" },
    { dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "17:00", status: "UNAVAILABLE" },
    { dayOfWeek: "SUNDAY", startTime: "09:00", endTime: "17:00", status: "UNAVAILABLE" },
  ]);
  const [saving, setSaving] = useState(false);

  // Initialize availability with current data when modal opens
  useEffect(() => {
    if (isOpen && doctor?.availabilities) {
      const currentAvailability: AvailabilitySlot[] = [
        "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
      ].map(day => {
        const existing = doctor.availabilities.find(avail => avail.dayOfWeek === day);
        return existing ? {
          dayOfWeek: existing.dayOfWeek,
          startTime: existing.startTime,
          endTime: existing.endTime,
          status: existing.status as "AVAILABLE" | "UNAVAILABLE"
        } : {
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          status: day === "SATURDAY" || day === "SUNDAY" ? "UNAVAILABLE" : "AVAILABLE"
        };
      });
      setAvailability(currentAvailability);
    }
  }, [isOpen, doctor?.availabilities]);

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(availability);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
        borderRadius: "16px",
        border: "1px solid rgba(6,182,212,0.2)",
        padding: "24px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflow: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "20px", fontWeight: 700 }}>
            Schedule Availability
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {availability.map((slot, index) => (
            <div
              key={slot.dayOfWeek}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                borderRadius: "8px",
                background: "rgba(6,182,212,0.05)",
                border: "1px solid rgba(6,182,212,0.1)",
              }}
            >
              <div style={{ width: "80px", color: "#06b6d4", fontWeight: 600 }}>
                {slot.dayOfWeek.slice(0, 3)}
              </div>

              <select
                value={slot.status}
                onChange={(e) => updateSlot(index, "status", e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(6,182,212,0.2)",
                  background: slot.status === "AVAILABLE" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: slot.status === "AVAILABLE" ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>

              {slot.status === "AVAILABLE" && (
                <>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(6,182,212,0.2)",
                      background: "rgba(15,23,42,0.5)",
                      color: "#e2e8f0",
                    }}
                  />
                  <span style={{ color: "#94a3b8" }}>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(6,182,212,0.2)",
                      background: "rgba(15,23,42,0.5)",
                      color: "#e2e8f0",
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid rgba(6,182,212,0.2)",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: saving 
                ? "linear-gradient(135deg,#94a3b8,#64748b)" 
                : "linear-gradient(135deg,#06b6d4,#0891b2)",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving && (
              <div style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
            )}
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  DOCTOR MY SCHEDULE - Professional Calendar View                */
/* ─────────────────────────────────────────────────────────────── */
export function DoctorMyScheduleContent() {
  const { appointments, loading, error, updateAppointmentStatus, doctor, refetch } = useAppointments();
  const { session } = useDoctorContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check if availability modal should be opened on component mount
  useEffect(() => {
    const shouldOpenModal = sessionStorage.getItem("openAvailabilityModal");
    if (shouldOpenModal === "true") {
      setShowAvailabilityModal(true);
      sessionStorage.removeItem("openAvailabilityModal"); // Clear the flag
    }
  }, []);

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Generate week days
  const weekDays = useMemo(() => {
    const start = getWeekStart(selectedDate);
    const days: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayAppts = appointments.filter(
        (a) => {
          // Use proper date comparison with timezone awareness
          const appointmentDate = new Date(a.appointmentDate + "T00:00:00");
          return appointmentDate.toDateString() === date.toDateString() && a.status !== "CANCELLED";
        }
      ).sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

      days.push({
        date,
        dateStr,
        dayName: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        appointments: dayAppts,
        hasAppointments: dayAppts.length > 0,
      });
    }

    return days;
  }, [selectedDate, appointments]);

  // Day schedule
  const daySchedule = useMemo(() => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const dayAppts = appointments
      .filter((a) => {
        // Use proper date comparison with timezone awareness
        const appointmentDate = new Date(a.appointmentDate + "T00:00:00");
        return appointmentDate.toDateString() === selectedDate.toDateString() && a.status !== "CANCELLED";
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

    return {
      date: selectedDate,
      dateStr,
      appointments: dayAppts,
    };
  }, [selectedDate, appointments]);

  const goToWeek = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setSelectedDate(newDate);
  };

  const goToDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const handleSaveAvailability = async (availability: AvailabilitySlot[]) => {
    if (!doctor) return;

    try {
      const DOCTOR_API = process.env.NEXT_PUBLIC_API_GATEWAY ?? "http://localhost:8080";
      const token = localStorage.getItem("smart_admin_token");

      const availabilityRequests = availability
        .filter(slot => slot.status === "AVAILABLE")
        .map(slot => ({
          dayOfWeek: slot.dayOfWeek as any,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
        }));

      const response = await fetch(`${DOCTOR_API}/api/v1/doctors/${doctor.id}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(availabilityRequests),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      setToast({ message: "Availability updated successfully", type: "success" });
      setShowAvailabilityModal(false);
      
      // Refetch doctor data to get updated availability
      refetch();
    } catch (error) {
      console.error("Error updating availability:", error);
      setToast({ message: error instanceof Error ? error.message : "Failed to update availability", type: "error" });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setToast({ message: `Appointment status updated to ${newStatus}`, type: "success" });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      setToast({ message: error instanceof Error ? error.message : "Failed to update status", type: "error" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      CONFIRMED: { bg: "#ecfdf5", text: "#065f46", border: "#10b981" },
      PENDING: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
      COMPLETED: { bg: "#dbeafe", text: "#0c4a6e", border: "#0284c7" },
      CANCELLED: { bg: "#fee2e2", text: "#7f1d1d", border: "#ef4444" },
    };
    return colors[status] || colors.CONFIRMED;
  };

  const getConsultationIcon = (type: string) => {
    return type === "ONLINE" ? (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ) : (
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg,#06b6d4,#0891b2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", animation: "pulse 2s infinite",
          }}>
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,rgba(15,23,42,0.95) 0%,rgba(30,41,59,0.95) 100%)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(10px)",
      }}>
        <div>
          <h1 style={{
            margin: "0 0 6px",
            fontSize: "clamp(20px,2.5vw,28px)",
            fontWeight: 800,
            color: "#fff",
          }}>
            My Schedule
          </h1>
          <p style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: "14px",
          }}>
            {viewMode === "week"
              ? `Week of ${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
            }
          </p>
        </div>

        
        {/* View Mode Toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setViewMode("week")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(6,182,212,0.2)",
              background: viewMode === "week" ? "rgba(6,182,212,0.15)" : "transparent",
              color: viewMode === "week" ? "#06b6d4" : "#94a3b8",
              fontWeight: viewMode === "week" ? 600 : 500,
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("day")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(6,182,212,0.2)",
              background: viewMode === "day" ? "rgba(6,182,212,0.15)" : "transparent",
              color: viewMode === "day" ? "#06b6d4" : "#94a3b8",
              fontWeight: viewMode === "day" ? 600 : 500,
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
          >
            Day
          </button>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <button
          onClick={() => {
            if (viewMode === "week") goToWeek(-1);
            else goToDay(-1);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "1px solid rgba(6,182,212,0.2)",
            background: "rgba(6,182,212,0.08)",
            color: "#06b6d4",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => setSelectedDate(new Date())}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            border: "1px solid rgba(6,182,212,0.2)",
            background: "rgba(6,182,212,0.08)",
            color: "#06b6d4",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "13px",
            transition: "all 0.2s",
          }}
        >
          Today
        </button>

        <button
          onClick={() => {
            if (viewMode === "week") goToWeek(1);
            else goToDay(1);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            border: "1px solid rgba(6,182,212,0.2)",
            background: "rgba(6,182,212,0.08)",
            color: "#06b6d4",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── WEEK VIEW ──────────────────────────────────────── */}
      {viewMode === "week" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}>
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              onClick={() => {
                setViewMode("day");
                setSelectedDate(day.date);
              }}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(6,182,212,0.2)",
                background:
                  day.date.toDateString() === new Date().toDateString()
                    ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(8,145,178,0.08))"
                    : "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (day.date.toDateString() !== new Date().toDateString()) {
                  e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.06))";
                }
              }}
              onMouseLeave={(e) => {
                if (day.date.toDateString() !== new Date().toDateString()) {
                  e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))";
                }
              }}
            >
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                <div>
                  <p style={{
                    margin: 0,
                    color: "#06b6d4",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}>
                    {day.dayName}
                  </p>
                  <p style={{
                    margin: "2px 0 0",
                    color: "#e2e8f0",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}>
                    {day.date.getDate()}
                  </p>
                </div>

                {day.hasAppointments && (
                  <div style={{
                    padding: "8px",
                    borderRadius: "8px",
                    background: "rgba(6,182,212,0.1)",
                    borderLeft: "3px solid #06b6d4",
                  }}>
                    <p style={{
                      margin: 0,
                      color: "#06b6d4",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}>
                      {day.appointments.length} {day.appointments.length === 1 ? "appointment" : "appointments"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DAY VIEW ──────────────────────────────────────── */}
      {viewMode === "day" && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}>
          {daySchedule.appointments.length === 0 ? (
            <div style={{
              padding: "48px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))",
              border: "1px solid rgba(6,182,212,0.12)",
              textAlign: "center",
            }}>
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ margin: "0 auto 12px", color: "#475569" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>
                No appointments scheduled for this day
              </p>
            </div>
          ) : (
            daySchedule.appointments.map((appt) => {
              const colors = getStatusColor(appt.status);
              return (
                <div
                  key={appt.id}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    border: `2px solid ${colors.border}`,
                    background: colors.bg,
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      `0 8px 16px rgba(0,0,0,0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Time */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "60px",
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: colors.text,
                    }}>
                      {appt.appointmentTime.slice(0, 5)}
                    </p>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: colors.text,
                      opacity: 0.7,
                      marginTop: "2px",
                    }}>
                      {appt.appointmentTime.slice(0, 5)}
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#06b6d4,#0284c7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "16px",
                      }}>
                        {appt.patientId.substring(0, 1).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: 0,
                          color: colors.text,
                          fontWeight: 700,
                          fontSize: "15px",
                        }}>
                          Patient {appt.patientId.substring(0, 8)}
                        </p>
                        <p style={{
                          margin: "2px 0 0",
                          color: colors.text,
                          fontSize: "12px",
                          opacity: 0.7,
                        }}>
                          {appt.reason || "General Consultation"}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.text,
                        opacity: 0.8,
                      }}>
                        {getConsultationIcon(appt.consultationType)}
                        {appt.consultationType === "ONLINE" ? "Video Call" : "In-Person"}
                      </span>

                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: "rgba(0,0,0,0.1)",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: colors.text,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    {appt.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #10b981",
                            background: "#10b981",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ef4444",
                            background: "transparent",
                            color: "#ef4444",
                            fontWeight: 600,
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {appt.status === "CONFIRMED" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #06b6d4",
                            background: "#06b6d4",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ef4444",
                            background: "transparent",
                            color: "#ef4444",
                            fontWeight: 600,
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appt.status === "COMPLETED" && (
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#dbeafe",
                        color: "#0c4a6e",
                        fontWeight: 600,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        Completed
                      </span>
                    )}

                    {appt.status === "CANCELLED" && (
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#fee2e2",
                        color: "#7f1d1d",
                        fontWeight: 600,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Statistics ──────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "12px",
        marginTop: "12px",
      }}>
        <div style={{
          padding: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))",
          border: "1px solid rgba(16,185,129,0.2)",
        }}>
          <p style={{ margin: "0 0 8px", color: "#10b981", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Appointments
          </p>
          <p style={{ margin: 0, color: "#10b981", fontSize: "24px", fontWeight: 800 }}>
            {appointments.filter((a) => a.status !== "CANCELLED").length}
          </p>
        </div>

        <div style={{
          padding: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.06))",
          border: "1px solid rgba(245,158,11,0.2)",
        }}>
          <p style={{ margin: "0 0 8px", color: "#f59e0b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Pending
          </p>
          <p style={{ margin: 0, color: "#f59e0b", fontSize: "24px", fontWeight: 800 }}>
            {appointments.filter((a) => a.status === "PENDING").length}
          </p>
        </div>

        <div style={{
          padding: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.06))",
          border: "1px solid rgba(6,182,212,0.2)",
        }}>
          <p style={{ margin: "0 0 8px", color: "#06b6d4", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Confirmed
          </p>
          <p style={{ margin: 0, color: "#06b6d4", fontSize: "24px", fontWeight: 800 }}>
            {appointments.filter((a) => a.status === "CONFIRMED").length}
          </p>
        </div>

        <div style={{
          padding: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(2,132,199,0.1), rgba(8,145,178,0.06))",
          border: "1px solid rgba(2,132,199,0.2)",
        }}>
          <p style={{ margin: "0 0 8px", color: "#0284c7", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Completed
          </p>
          <p style={{ margin: 0, color: "#0284c7", fontSize: "24px", fontWeight: 800 }}>
            {appointments.filter((a) => a.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onSave={handleSaveAvailability}
      />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          animation: "slideInRight 0.3s ease"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderRadius: "12px",
            background: toast.type === "success"
                ? "linear-gradient(135deg,#10b981,#059669)"
                : "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            minWidth: "300px",
            maxWidth: "400px"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", lineHeight: "1" }}>
                {toast.type === "success" ? "?" : "?"}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                flexShrink: 0
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Doctor Availability Section */}
      <div style={{
        padding: "20px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))",
        border: "1px solid rgba(6,182,212,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{
            margin: 0,
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
          }}>
            My Availability
          </h3>
          <button
            onClick={() => setShowAvailabilityModal(true)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(6,182,212,0.2)",
              background: "rgba(6,182,212,0.1)",
              color: "#06b6d4",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "12px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.2)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.1)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
            }}
          >
            Schedule Availability
          </button>
        </div>
        
        {/* Display Availability - Professional Table */}
        <div style={{
          background: "rgba(15,23,42,0.5)",
          borderRadius: "8px",
          border: "1px solid rgba(6,182,212,0.1)",
          overflow: "hidden",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
          }}>
            <thead>
              <tr style={{
                background: "rgba(6,182,212,0.1)",
              }}>
                <th style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: "#06b6d4",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(6,182,212,0.2)",
                }}>
                  Day
                </th>
                <th style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: "#06b6d4",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(6,182,212,0.2)",
                }}>
                  Status
                </th>
                <th style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  color: "#06b6d4",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(6,182,212,0.2)",
                }}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day, index) => {
                const avail = doctor?.availabilities?.find(a => a.dayOfWeek === day);
                const status = avail ? avail.status : "UNAVAILABLE";
                const startTime = avail ? avail.startTime : "09:00";
                const endTime = avail ? avail.endTime : "17:00";
                
                return (
                  <tr key={day} style={{
                    borderBottom: index < 6 ? "1px solid rgba(6,182,212,0.1)" : "none",
                    background: index % 2 === 0 ? "rgba(6,182,212,0.02)" : "transparent",
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      {day.slice(0, 3)}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                    }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        background: status === "AVAILABLE" 
                          ? "rgba(16,185,129,0.2)" 
                          : "rgba(239,68,68,0.2)",
                        color: status === "AVAILABLE" ? "#10b981" : "#ef4444",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      color: status === "AVAILABLE" ? "#94a3b8" : "#64748b",
                      fontSize: "12px",
                      fontWeight: status === "AVAILABLE" ? 500 : 400,
                    }}>
                      {status === "AVAILABLE" ? `${startTime} - ${endTime}` : "Not Available"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
