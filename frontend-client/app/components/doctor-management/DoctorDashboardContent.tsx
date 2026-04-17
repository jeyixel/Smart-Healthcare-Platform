"use client";

import { useDoctorContext } from "@/app/context/DoctorContext";
import { useAppointments, Appointment, AppointmentStatus } from "@/app/hooks/useAppointments";
import { usePrescriptions, PrescriptionStatus } from "@/app/hooks/usePrescriptions";
import { DoctorPatientsContent } from "@/app/components/doctor-management/DoctorPatientsContent";

import { usePatients } from "@/app/hooks/usePatients";
import { useMemo, useEffect } from "react";
import { getDoctorName } from "@/app/utils/tokenUtils";
/* ─── Mock data ─────────────────────────────────────────────────── */

const kpiCards = [
  {
    label: "Today's Appointments",
    value: "8",
    delta: "+2 vs yesterday",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "#06b6d4",
    bg: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
    border: "rgba(6,182,212,0.25)",
  },
  {
    label: "Total Patients",
    value: "247",
    delta: "+12 this month",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "#10b981",
    bg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
    border: "rgba(16,185,129,0.25)",
  },
  {
    label: "Prescriptions Written",
    value: "1,083",
    delta: "All time",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "#8b5cf6",
    bg: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.08))",
    border: "rgba(139,92,246,0.25)",
  },
  {
    label: "Telemedicine Sessions",
    value: "0",
    delta: "Online appointments",
    positive: true,
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: "#06b6d4",
    bg: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
    border: "rgba(6,182,212,0.25)",
  },
];

// NOTE: todayAppointments are now fetched from API using useAppointments hook
// Previous mock data removed - see useAppointments hook for data fetching

const recentPatients = [
  { name: "Amal Perera",     age: 34, condition: "Hypertension",    lastVisit: "Today",       avatar: "A", risk: "medium" },
  { name: "Nimal Silva",     age: 52, condition: "Type 2 Diabetes", lastVisit: "Today",       avatar: "N", risk: "high" },
  { name: "Sumudu Fernando", age: 28, condition: "Asthma",          lastVisit: "In progress", avatar: "S", risk: "low" },
  { name: "Kasun Rajapaksha",age: 41, condition: "Back Pain",       lastVisit: "12 Apr 2026", avatar: "K", risk: "low" },
  { name: "Dilini Bandara",  age: 37, condition: "Migraine",        lastVisit: "10 Apr 2026", avatar: "D", risk: "medium" },
];

const activityFeed = [
  // NOTE: activityFeed now populated with real prescription data from usePrescriptions hook
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  COMPLETED:   { bg: "rgba(16,185,129,0.12)", color: "#059669", label: "Completed" },
  CONFIRMED:   { bg: "rgba(6,182,212,0.12)",  color: "#0891b2", label: "Confirmed" },
  PENDING:     { bg: "rgba(245,158,11,0.12)", color: "#d97706", label: "Pending" },
  CANCELLED:   { bg: "rgba(239,68,68,0.12)",  color: "#dc2626", label: "Cancelled" },
};

const riskStyle: Record<string, { color: string; label: string }> = {
  high:   { color: "#ef4444", label: "High Risk" },
  medium: { color: "#f59e0b", label: "Moderate" },
  low:    { color: "#10b981", label: "Stable" },
};

/* ─── Sub-components ─────────────────────────────────────────── */

function KpiCard({ card }: { card: typeof kpiCards[0] }) {
  return (
    <div style={{
      background: card.bg,
      border: `1px solid ${card.border}`,
      borderRadius: "16px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${card.color}22`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${card.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: card.color,
          boxShadow: `0 0 16px ${card.color}33`,
        }}>
          {card.icon}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 600, color: card.positive ? "#059669" : "#ef4444",
          background: card.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          padding: "3px 8px", borderRadius: "999px",
        }}>
          {card.delta}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "30px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
          {card.value}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569", fontWeight: 500 }}>
          {card.label}
        </p>
      </div>
    </div>
  );
}

function WeeklyBar({ day, pct, active }: { day: string; pct: number; active?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
      <div style={{
        width: "100%", maxWidth: "28px", height: "80px",
        background: "rgba(226,232,240,0.5)", borderRadius: "6px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct}%`,
          background: active
            ? "linear-gradient(180deg,#06b6d4,#0891b2)"
            : "linear-gradient(180deg,rgba(6,182,212,0.4),rgba(8,145,178,0.2))",
          borderRadius: "6px",
          transition: "height 0.5s ease",
          boxShadow: active ? "0 0 10px rgba(6,182,212,0.4)" : "none",
        }} />
      </div>
      <span style={{ fontSize: "11px", color: active ? "#06b6d4" : "#94a3b8", fontWeight: active ? 700 : 400 }}>{day}</span>
    </div>
  );
}

/* ─── Main dashboard ─────────────────────────────────────────── */

export function DoctorDashboardContent() {
  const { session, setActiveSection } = useDoctorContext();
  const { appointments, loading, error } = useAppointments();
  const { prescriptions, loading: prescLoading, fetchDoctorPrescriptions } = usePrescriptions();
  const doctorName = getDoctorName();

  // Helper function for date formatting
  function getLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const today = getLocalDateKey(new Date());

  // Get unique patient IDs from all appointments
  const allPatientIds = useMemo(() => {
    const ids = appointments.map(appt => appt.patientId);
    return [...new Set(ids)]; // Remove duplicates
  }, [appointments]);

  // Get recent patient IDs (from most recent appointments)
  const recentPatientIds = useMemo(() => {
    const sortedAppointments = appointments
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    const recentIds = sortedAppointments.map(appt => appt.patientId);
    return [...new Set(recentIds)].slice(0, 10); // Take first 10 unique patient IDs
  }, [appointments]);

  const { patients: recentPatientsData, loading: patientsLoading } = usePatients(recentPatientIds);

  // Prepare recent patients data with stats
  const recentPatientsWithStats = useMemo(() => {
    return recentPatientsData.map(patient => {
      const patientAppointments = appointments.filter(appt => appt.patientId === patient.id);
      const lastAppointment = patientAppointments
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0];

      const age = calculateAge(patient.dateOfBirth);
      const lastVisit = lastAppointment ? 
        (lastAppointment.appointmentDate === today ? "Today" : 
         new Date(lastAppointment.appointmentDate).toLocaleDateString()) : 
        "No visits";

      return {
        name: `${patient.firstName} ${patient.lastName}`,
        age: age || 0,
        condition: "Patient", // Placeholder since we don't have medical conditions
        lastVisit,
        avatar: patient.firstName.charAt(0).toUpperCase(),
        risk: "low" as const, // Default risk level
      };
    });
  }, [recentPatientsData, appointments, today]);

  // Fetch prescriptions on component mount
  useEffect(() => {
    void fetchDoctorPrescriptions();
  }, [fetchDoctorPrescriptions]);

  // Handler for "Start Next Appointment" button
  const handleStartNextAppointment = () => {
    // Find the next pending or confirmed appointment
    const nextAppt = appointments.find(
      (appt) => appt.status === "CONFIRMED" || appt.status === "PENDING"
    );

    if (nextAppt) {
      // Store the appointment ID to be used in the appointments page
      sessionStorage.setItem("scrollToAppointmentId", nextAppt.id);
    }

    // Navigate to appointments section
    setActiveSection("appointments");
  };

  // Handler for "View Full Schedule" button
  const handleViewFullSchedule = () => {
    setActiveSection("schedule");
  };

  // Format time helper - define before use
  function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  }

// Format timestamp to time string
  function formatTimestamp(timestamp: string | null): string {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const h = date.getHours();
    const min = date.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(min).padStart(2, "0")} ${ampm}`;
  }

  // Calculate age from date of birth
  function calculateAge(dob: string | null): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Filter appointments for today
  const todayAppointments = useMemo(() => {
    return appointments
      .filter((appt) => appt.appointmentDate === today)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
      .map((appt) => ({
        ...appt,
        name: appt.patientId || "Unknown Patient", // Using patientId as name since we don't have patient names
        time: formatTime(appt.appointmentTime),
        type: appt.consultationType === "ONLINE" ? "Telemedicine" : "Consultation",
        status: appt.status as AppointmentStatus,
        avatar: (appt.patientId?.charAt(0) || "P").toUpperCase(),
      }));
  }, [appointments]);

  // Transform prescriptions to activity feed format
  const prescriptionActivities = useMemo(() => {
    return prescriptions.map((prx) => {
      let action = "";
      let icon = "";
      
      switch (prx.status) {
        case "ISSUED":
          action = "Prescription issued";
          icon = "💊";
          break;
        case "DRAFT":
          action = "Prescription created";
          icon = "📝";
          break;
        case "CANCELLED":
          action = "Prescription cancelled";
          icon = "❌";
          break;
        default:
          action = `Prescription ${(prx.status as string).toLowerCase()}`;
          icon = "????";
      }
      
      return {
        action,
        patient: prx.patientId || "Unknown Patient",
        time: formatTimestamp(prx.issuedAt || prx.createdAt),
        icon,
        timestamp: new Date(prx.issuedAt || prx.createdAt).getTime(),
      };
    });
  }, [prescriptions]);

  // Transform appointments to activity feed format
  const appointmentActivities = useMemo(() => {
    return appointments
      .map((appt) => {
        let action = "";
        let icon = "";
        
        switch (appt.status) {
          case "COMPLETED":
            action = "Appointment completed";
            icon = "✅";
            break;
          case "CONFIRMED":
            action = "Appointment confirmed";
            icon = "📝";
            break;
          case "PENDING":
            action = "Appointment scheduled";
            icon = "🕒";
            break;
          case "CANCELLED":
            action = "Appointment cancelled";
            icon = "❌";
            break;
          default:
            action = "Appointment updated";
            icon = "🔄";
        }
        
        return {
          action,
          patient: appt.patientId || "Unknown Patient",
          time: formatTimestamp(appt.updatedAt),
          icon,
          timestamp: new Date(appt.updatedAt).getTime(),
        };
      });
  }, [appointments]);

  // Merge and sort all activities by timestamp
  const activityFeedFromPrescriptions = useMemo(() => {
    const allActivities = [...prescriptionActivities, ...appointmentActivities];
    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, 10) // Show only 10 most recent
      .map(({ timestamp, ...rest }) => rest); // Remove timestamp from final result
  }, [prescriptionActivities, appointmentActivities]);

  const weeklyAppointments = useMemo(() => {
    const todayDate = new Date();
    const weekdayIndex = (todayDate.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() - weekdayIndex);
    monday.setHours(0, 0, 0, 0);

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = getLocalDateKey(date);
      return {
        day: labels[index],
        count: appointments.filter((appt) => appt.appointmentDate === dateKey).length,
        active: dateKey === getLocalDateKey(todayDate),
      };
    });

    const maxCount = Math.max(...week.map((item) => item.count), 1);
    return week.map((item) => ({
      ...item,
      pct: item.count > 0 ? Math.round((item.count / maxCount) * 100) : 10,
    }));
  }, [appointments]);

  const weeklyTotal = weeklyAppointments.reduce((sum, day) => sum + day.count, 0);
  const completed = todayAppointments.filter((a) => a.status === "COMPLETED").length;
  const total = todayAppointments.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Show error state
  if (error) {
    return (
      <div style={{ padding: "20px", color: "#dc2626", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
        Error loading appointments: {error}
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "40px 20px",
      }}>
        {/* Loading Animation */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(6,182,212,0.3)",
          animation: "pulse 2s infinite",
        }}>
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
          </svg>
        </div>

        {/* Loading Text */}
        <div style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            Loading Dashboard
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
            Fetching your appointments, prescriptions, and analytics...
          </p>
        </div>

        {/* Progress Indicators */}
        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#06b6d4",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0s",
          }} />
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#06b6d4",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.16s",
          }} />
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#06b6d4",
            animation: "bounce 1.4s infinite ease-in-out both",
            animationDelay: "0.32s",
          }} />
        </div>

        {/* Loading Details */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          marginTop: "16px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#64748b",
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "2px solid #e2e8f0",
              borderTop: "2px solid #06b6d4",
              animation: "spin 1s linear infinite",
            }} />
            <span>Connecting to services...</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#64748b",
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "2px solid #e2e8f0",
              borderTop: "2px solid #10b981",
              animation: "spin 1s linear infinite",
              animationDelay: "0.2s",
            }} />
            <span>Loading appointments...</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#64748b",
          }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "2px solid #e2e8f0",
              borderTop: "2px solid #8b5cf6",
              animation: "spin 1s linear infinite",
              animationDelay: "0.4s",
            }} />
            <span>Preparing analytics...</span>
          </div>
        </div>

        {/* Add CSS Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(6,182,212,0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(6,182,212,0.5); }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Welcome Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "28px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.1)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* decorative glow blobs */}
        <div style={{ position: "absolute", top: "-40px", right: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(6,182,212,0.08)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30px", right: "5%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(139,92,246,0.06)", filter: "blur(40px)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <span style={{
            background: "rgba(6,182,212,0.15)", color: "#06b6d4",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
            border: "1px solid rgba(6,182,212,0.25)",
          }}>
            ● Live Session
          </span>
          <h2 style={{ margin: "12px 0 6px", fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"},{" "}
            <span style={{ color: "#06b6d4" }}>{doctorName}</span>
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", maxWidth: "460px", lineHeight: 1.6 }}>
            You have <strong style={{ color: "#06b6d4" }}>{todayAppointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING").length} appointments</strong> remaining today and{" "}
            <strong style={{ color: "#10b981" }}>{prescriptions.filter(p => p.status === "DRAFT").length} pending prescription</strong> reviews.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button 
              onClick={handleStartNextAppointment}
              style={{
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              border: "none", color: "#fff", padding: "10px 22px",
              borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              Start Next Appointment
            </button>
            <button 
              onClick={handleViewFullSchedule}
              style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0", padding: "10px 20px",
              borderRadius: "10px", fontWeight: 500, fontSize: "13px", cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
              View Full Schedule
            </button>
          </div>
        </div>

        {/* Progress ring area */}
        <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ textAlign: "center" }}>
            {/* SVG circle progress */}
            <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="8" />
              <circle
                cx="55" cy="55" r="46" fill="none"
                stroke="url(#cyanGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progressPct / 100)}`}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
              <defs>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff" }}>{progressPct}%</p>
              <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>Done</p>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
              {completed}/{total} appointments
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
        {/* First card with real appointment data */}
        <KpiCard key="today-appointments" card={{
          ...kpiCards[0],
          value: todayAppointments.length.toString(),
          delta: `${todayAppointments.filter(a => a.status === "COMPLETED").length} completed`,
        }} />
        {/* Second card - total patients */}
        <KpiCard key={kpiCards[1].label} card={{
          ...kpiCards[1],
          value: allPatientIds.length.toString(),
          delta: "Unique patients",
        }} />
        {/* Third card with real prescription data */}
        <KpiCard key="prescriptions-written" card={{
          ...kpiCards[2],
          value: prescriptions.length.toString(),
          delta: `${prescriptions.filter(p => p.status === "ISSUED").length} issued today`,
        }} />
        {/* Fourth card with telemedicine sessions data */}
        <KpiCard key="telemedicine-sessions" card={{
          ...kpiCards[3],
          value: appointments.filter(a => a.consultationType === "ONLINE" && a.status !== "COMPLETED" && a.status !== "CANCELLED").length.toString(),
          delta: `${todayAppointments.filter(a => a.type === "Telemedicine" && a.status !== "COMPLETED" && a.status !== "CANCELLED").length} active today`,
        }} />
      </div>

      {/* ── Main Grid: Schedule + Patients + Mini-chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>

        {/* Today's Appointments */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Today&apos;s Appointments</h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <span style={{ background: "rgba(6,182,212,0.1)", color: "#0891b2", fontSize: "12px", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", border: "1px solid rgba(6,182,212,0.2)" }}>
              {total} today
            </span>
          </div>

          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {todayAppointments.map((appt, i) => {
              const st = statusStyle[appt.status] || statusStyle["PENDING"];
              return (
                <div key={appt.id} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 22px",
                  borderBottom: i < todayAppointments.length - 1 ? "1px solid #f8fafc" : "none",
                  background: appt.status === "CONFIRMED" ? "rgba(6,182,212,0.03)" : "#fff",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = appt.status === "CONFIRMED" ? "rgba(6,182,212,0.03)" : "#fff"; }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg,hsl(${i * 45},70%,55%),hsl(${i * 45 + 30},60%,45%))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "14px",
                  }}>
                    {appt.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{appt.type}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "#334155" }}>{appt.time}</p>
                    <span style={{
                      display: "inline-block", marginTop: "4px",
                      fontSize: "10px", fontWeight: 700,
                      background: st.bg, color: st.color,
                      padding: "2px 8px", borderRadius: "999px",
                    }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: patients + weekly chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Recent Patients */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Recent Patients</h3>
            </div>
            {patientsLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 22px",
                  borderBottom: i < 4 ? "1px solid #f8fafc" : "none",
                }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: "13px", width: "120px",
                      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      borderRadius: "4px", marginBottom: "4px",
                    }} />
                    <div style={{
                      height: "11px", width: "80px",
                      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                      borderRadius: "4px",
                    }} />
                  </div>
                </div>
              ))
            ) : recentPatientsWithStats.length > 0 ? (
              recentPatientsWithStats.map((p, i) => {
                const risk = riskStyle[p.risk];
                return (
                  <div key={p.name} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 22px",
                    borderBottom: i < recentPatientsWithStats.length - 1 ? "1px solid #f8fafc" : "none",
                    cursor: "pointer", transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg,hsl(${i * 60 + 180},60%,55%),hsl(${i * 60 + 210},55%,45%))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: "13px",
                    }}>
                      {p.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>{p.name}</p>
                      <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#64748b" }}>{p.condition} · Age {p.age}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: risk.color, background: `${risk.color}18`, padding: "2px 8px", borderRadius: "999px" }}>
                        {risk.label}
                      </span>
                      <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#94a3b8" }}>{p.lastVisit}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                No recent patients
              </div>
            )}
          </div>

          {/* Weekly volume mini-chart */}
          <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Weekly Appointments</h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>This week vs avg</p>
              </div>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#06b6d4" }}>{weeklyTotal}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
              {weeklyAppointments.map((b) => <WeeklyBar key={b.day} {...b} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Quick Actions + Activity Feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>

        {/* Quick Actions */}
        <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: "4px", height: "20px", background: "linear-gradient(180deg, #06b6d4, #0891b2)", borderRadius: "2px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Quick Actions</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[/* eslint-disable @typescript-eslint/no-unused-vars */
              { 
                label: "Find Appointment", 
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ), 
                color: "#06b6d4", 
                bg: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(6,182,212,0.05))", 
                bgHover: "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.08))",
                action: () => setActiveSection("appointments") 
              },
              { 
                label: "New Prescription", 
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ), 
                color: "#8b5cf6", 
                bg: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))",
                bgHover: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.08))",
                action: () => setActiveSection("prescriptions") 
              },
              { 
                label: "Start Telemedicine", 
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ), 
                color: "#10b981", 
                bg: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))",
                bgHover: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))",
                action: () => setActiveSection("appointments") 
              },
              { 
                label: "Schedule Availability", 
                icon: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                color: "#f59e0b", 
                bg: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))",
                bgHover: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))",
                action: () => {
                  setActiveSection("schedule");
                  sessionStorage.setItem("openAvailabilityModal", "true");
                }
              },
            ].map((a) => (
              <button key={a.label} onClick={a.action} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                padding: "20px 16px", borderRadius: "16px",
                background: a.bg, border: `1px solid ${a.color}20`,
                cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textAlign: "center", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLElement;
                btn.style.background = a.bgHover;
                btn.style.transform = "translateY(-4px) scale(1.02)";
                btn.style.boxShadow = `0 12px 32px ${a.color}25`;
                btn.style.borderColor = `${a.color}40`;
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLElement;
                btn.style.background = a.bg;
                btn.style.transform = "translateY(0) scale(1)";
                btn.style.boxShadow = "none";
                btn.style.borderColor = `${a.color}20`;
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: `linear-gradient(135deg, ${a.color}20, ${a.color}10)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: a.color, transition: "all 0.3s ease",
                }}>
                  {a.icon}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", lineHeight: 1.3 }}>
                  {a.label}
                </span>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  background: `linear-gradient(135deg, ${a.color}08, transparent)`,
                  opacity: 0, transition: "opacity 0.3s ease",
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Today&apos;s Activity</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {activityFeedFromPrescriptions.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", paddingBottom: i < activityFeedFromPrescriptions.length - 1 ? "16px" : "0", position: "relative" }}>
                {i < activityFeedFromPrescriptions.length - 1 && (
                  <div style={{ position: "absolute", left: "17px", top: "34px", bottom: 0, width: "2px", background: "linear-gradient(180deg,#e2e8f0,transparent)" }} />
                )}
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%", background: "#f8fafc",
                  border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", flexShrink: 0, zIndex: 1,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, paddingTop: "4px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.action}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{item.patient} · <span style={{ color: "#94a3b8" }}>{item.time}</span></p>
                </div>
              </div>
            ))}
          </div>
          {/* System health strip */}
          <div style={{ marginTop: "20px", padding: "12px 16px", background: "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(5,150,105,0.03))", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#065f46" }}>All Systems Operational</span>
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Last sync: just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
