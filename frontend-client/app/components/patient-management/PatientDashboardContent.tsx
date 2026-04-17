"use client";

import { usePatientAppointments } from "@/app/hooks/usePatientAppointments";
import { usePatientPrescriptions } from "@/app/hooks/usePatientPrescriptions";
import { useMemo } from "react";
import Link from "next/link";

/* ─── Sub-components ─────────────────────────────────────────── */

function KpiCard({ card }: { card: any }) {
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

/* ─── Main Content ────────────────────────────────────────────── */

export default function PatientDashboardContent() {
  const { appointments, loading: apptLoading, patient } = usePatientAppointments();
  const { prescriptions, loading: prescLoading } = usePatientPrescriptions();

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";

  const upcomingAppts = useMemo(() => 
    appointments.filter(a => a.status === "CONFIRMED" || a.status === "PENDING"), 
  [appointments]);

  const stats = useMemo(() => [
    {
      label: "Upcoming Appts",
      value: upcomingAppts.length.toString(),
      delta: "Next 7 days",
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
      label: "My Prescriptions",
      value: prescriptions.length.toString(),
      delta: "Active records",
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
      label: "Medical History",
      value: appointments.filter(a => a.status === "COMPLETED").length.toString(),
      delta: "Visits recorded",
      positive: true,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "#10b981",
      bg: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))",
      border: "rgba(16,185,129,0.25)",
    },
    {
      label: "Health Score",
      value: "92",
      delta: "Good Condition",
      positive: true,
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "#f59e0b",
      bg: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.08))",
      border: "rgba(245,158,11,0.25)",
    },
  ], [upcomingAppts, prescriptions, appointments]);

  if (apptLoading || prescLoading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
      Loading Dashboard...
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Welcome Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a192f 0%, #0f172a 100%)",
        borderRadius: "20px",
        padding: "32px",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(6,182,212,0.2)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>
            Hello, <span style={{ color: "#06b6d4" }}>{patientName}</span>!
          </h2>
          <p style={{ margin: "8px 0 20px", color: "#94a3b8", maxWidth: "500px", lineHeight: 1.6 }}>
            Welcome back to your health portal. You have {upcomingAppts.length} sessions scheduled for this month. 
            Keep track of your vitals and medications below.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/patient-landing/book" style={{
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(6, 182, 212, 0.4)"
            }}>
              Book Appointment
            </Link>
            <Link href="/patient-landing/telemedicine" style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              Join Tele-consult
            </Link>
          </div>
        </div>

        {/* Decorative Graphic */}
        <div style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "rgba(6,182,212,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}>
           <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5">
             <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
           <div style={{
             position: "absolute",
             top: 0, left: 0, right: 0, bottom: 0,
             border: "2px dashed rgba(6,182,212,0.2)",
             borderRadius: "50%",
             animation: "spin 20s linear infinite"
           }} />
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {stats.map((card, i) => (
          <KpiCard key={i} card={card} />
        ))}
      </div>

      {/* ── Dual Section Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        
        {/* Upcoming Appointments */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 25px rgba(0, 0, 0, 0.03)",
          overflow: "hidden"
        }}>
           <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Upcoming Appointments</h3>
             <Link href="/patient-landing/book" style={{ fontSize: "13px", color: "#06b6d4", fontWeight: 600, textDecoration: "none" }}>View All</Link>
           </div>
           <div style={{ padding: "12px 24px 24px" }}>
             {upcomingAppts.length === 0 ? (
               <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "40px" }}>No upcoming appointments found.</p>
             ) : (
               upcomingAppts.map((appt, i) => (
                 <div key={appt.id} style={{
                   display: "flex",
                   alignItems: "center",
                   gap: "16px",
                   padding: "16px 0",
                   borderBottom: i < upcomingAppts.length - 1 ? "1px solid #f8fafc" : "none"
                 }}>
                   <div style={{
                     width: "48px", height: "48px", borderRadius: "14px",
                     background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                     display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                   }}>
                     <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                       {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short" })}
                     </span>
                     <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                       {new Date(appt.appointmentDate).getDate()}
                     </span>
                   </div>
                   <div style={{ flex: 1 }}>
                     <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{appt.consultationType} Consultation</p>
                     <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Time: {appt.appointmentTime}</p>
                   </div>
                   <span style={{
                     background: appt.status === "CONFIRMED" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                     color: appt.status === "CONFIRMED" ? "#059669" : "#d97706",
                     padding: "4px 12px", borderRadius: "999px",
                     fontSize: "11px", fontWeight: 700
                   }}>
                     {appt.status}
                   </span>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Recent Prescriptions */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "20px", 
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 25px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: "column"
        }}>
           <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Recent Prescriptions</h3>
           </div>
           <div style={{ padding: "24px", flex: 1 }}>
             {prescriptions.length === 0 ? (
               <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "40px" }}>No prescriptions found.</p>
             ) : (
               prescriptions.slice(0, 5).map((prx, i) => (
                 <div key={prx.id} style={{
                   padding: "12px 16px",
                   borderRadius: "14px",
                   background: "#f8fafc",
                   marginBottom: "12px",
                   display: "flex",
                   alignItems: "center",
                   gap: "14px",
                   border: "1px solid #f1f5f9"
                 }}>
                   <div style={{
                     width: "36px", height: "36px", borderRadius: "10px",
                     background: "rgba(139, 92, 246, 0.1)",
                     color: "#8b5cf6",
                     display: "flex", alignItems: "center", justifyContent: "center"
                   }}>
                     <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" />
                     </svg>
                   </div>
                   <div style={{ flex: 1 }}>
                     <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Issued by Dr. {prx.doctorName || "Specialist"}</p>
                     <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>{new Date(prx.issuedAt || prx.createdAt).toLocaleDateString()}</p>
                   </div>
                 </div>
               ))
             )}
           </div>
           <div style={{ padding: "0 24px 24px" }}>
             <Link href="/patient-landing/prescriptions" style={{
               display: "block",
               width: "100%",
               textAlign: "center",
               padding: "10px",
               background: "#f1f5f9",
               color: "#475569",
               borderRadius: "10px",
               fontSize: "13px",
               fontWeight: 600,
               textDecoration: "none",
               transition: "background 0.2s"
             }}>
               View Full History
             </Link>
           </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
