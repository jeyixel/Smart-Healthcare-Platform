"use client";

import { useMemo } from "react";
import { useAppointments } from "@/app/hooks/useAppointments";
import { usePatients } from "@/app/hooks/usePatients";
import { Patient } from "@/types/api";

// ─── Helper functions ─────────────────────────────────────────────────────────

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function avatarColor(str: string): number {
  const hues = [210, 160, 280, 30, 340, 190, 120, 50];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

// ─── Patient Card Component ──────────────────────────────────────────────────

interface PatientCardProps {
  patient: Patient;
  appointmentCount: number;
  lastAppointmentDate: string | null;
}

function PatientCard({ patient, appointmentCount, lastAppointmentDate }: PatientCardProps) {
  const age = calculateAge(patient.dateOfBirth);
  const initials = getInitials(patient.firstName, patient.lastName);
  const hue = avatarColor(patient.firstName + patient.lastName);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue}, 60%, 45%))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "20px",
          fontWeight: 700,
          marginBottom: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {initials}
      </div>

      {/* Name */}
      <h3
        style={{
          margin: "0 0 4px 0",
          fontSize: "18px",
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1.2,
        }}
      >
        {patient.firstName} {patient.lastName}
      </h3>

      {/* Age and Gender */}
      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        {age ? `${age} years old` : "Age not specified"}
        {patient.gender && ` • ${patient.gender}`}
      </p>

      {/* Contact Info */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            fontSize: "13px",
            color: "#475569",
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {patient.email}
        </div>
        {patient.phoneNumber && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#475569",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {patient.phoneNumber}
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {appointmentCount}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            Appointments
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#64748b",
            }}
          >
            {lastAppointmentDate ? new Date(lastAppointmentDate).toLocaleDateString() : "No visits"}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            Last Visit
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(6,182,212,0.02), rgba(16,185,129,0.02))",
          opacity: 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
          borderRadius: "16px",
        }}
        className="hover-overlay"
      />
      <style>{`
        .hover-overlay:hover { opacity: 1; }
      `}</style>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function PatientCardSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          marginBottom: "16px",
        }}
      />
      <div
        style={{
          height: "20px",
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
      />
      <div
        style={{
          height: "14px",
          width: "60%",
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      />
      <div
        style={{
          height: "12px",
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "4px",
          marginBottom: "6px",
        }}
      />
      <div
        style={{
          height: "12px",
          width: "70%",
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          borderRadius: "4px",
        }}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DoctorPatientsContent() {
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();

  // Extract unique patient IDs from appointments
  const patientIds = useMemo(() => {
    const ids = appointments.map(appt => appt.patientId);
    return [...new Set(ids)]; // Remove duplicates
  }, [appointments]);

  const { patients, loading: patientsLoading, error: patientsError } = usePatients(patientIds);

  // Calculate appointment stats for each patient
  const patientsWithStats = useMemo(() => {
    return patients.map(patient => {
      const patientAppointments = appointments.filter(appt => appt.patientId === patient.id);
      const lastAppointment = patientAppointments
        .filter(appt => appt.status === "COMPLETED")
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0];

      return {
        ...patient,
        appointmentCount: patientAppointments.length,
        lastAppointmentDate: lastAppointment ? lastAppointment.appointmentDate : null,
      };
    });
  }, [patients, appointments]);

  const loading = appointmentsLoading || patientsLoading;
  const error = appointmentsError || patientsError;

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.08))",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="32" height="32" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: 700 }}>
            Failed to Load Patients
          </h3>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "28px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          My Patients
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Manage and view information about your patients
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
            border: "1px solid rgba(6,182,212,0.25)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#06b6d4",
              marginBottom: "4px",
            }}
          >
            {patientsWithStats.length}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#0891b2",
              fontWeight: 600,
            }}
          >
            Total Patients
          </div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#10b981",
              marginBottom: "4px",
            }}
          >
            {appointments.length}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#059669",
              fontWeight: 600,
            }}
          >
            Total Appointments
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <PatientCardSkeleton key={i} />)
          : patientsWithStats.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                appointmentCount={patient.appointmentCount}
                lastAppointmentDate={patient.lastAppointmentDate}
              />
            ))}
      </div>

      {/* Empty State */}
      {!loading && patientsWithStats.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
              border: "1px solid rgba(6,182,212,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" fill="none" stroke="#06b6d4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
              No Patients Yet
            </h3>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>
              Patients will appear here once they book appointments with you.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}