"use client";

import { usePatientContext } from "@/app/context/PatientContext";
import { usePatientAppointments } from "@/app/hooks/usePatientAppointments";
import { usePatientPrescriptions } from "@/app/hooks/usePatientPrescriptions";
import { usePatientReminders } from "@/app/hooks/usePatientReminders";
import { useMemo, useEffect, useState } from "react";
import { getPatientName } from "@/app/utils/tokenUtils";

/* ─── KPI Card Component ────────────────────────────────────────── */
function KpiCard({ label, value, delta, icon, color, bg, border }: any) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "16px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: `${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color,
          boxShadow: `0 0 16px ${color}33`,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "11px", fontWeight: 600, color: "#059669",
          background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: "999px",
        }}>
          {delta}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
          {value}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569", fontWeight: 500 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function PatientDashboardContent() {
  const { setActiveSection } = usePatientContext();
  const { appointments, loading: apptsLoading } = usePatientAppointments();
  const { prescriptions, loading: prescLoading } = usePatientPrescriptions();
  const { reminders, completeReminder, loading: remLoading } = usePatientReminders();
  const patientName = getPatientName();

  const nextAppt = useMemo(() => {
    return appointments
      .filter(a => a.status === "CONFIRMED" || a.status === "PENDING")
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];
  }, [appointments]);

  const activePrescriptionsCount = useMemo(() => {
    return prescriptions.filter(p => p.status === "ISSUED").length;
  }, [prescriptions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Welcome Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "24px",
        padding: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(6,182,212,0.2)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <span style={{
            background: "rgba(6,182,212,0.15)", color: "#06b6d4",
            fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: "999px",
            border: "1px solid rgba(6,182,212,0.25)",
          }}>
            Welcome Back
          </span>
          <h2 style={{ margin: "12px 0 8px", fontSize: "28px", fontWeight: 800, color: "#fff" }}>
            Stay healthy, <span style={{ color: "#06b6d4" }}>{patientName.split(" ")[0]}</span>
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px", maxWidth: "480px", lineHeight: 1.6 }}>
            Track your appointments, view medical records, and get AI-powered health suggestions tailored just for you.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button onClick={() => setActiveSection("appointments")} style={{
              background: "linear-gradient(135deg,#06b6d4,#0891b2)",
              border: "none", color: "#fff", padding: "12px 24px",
              borderRadius: "12px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
            }}>
              Book Appointment
            </button>
            <button onClick={() => setActiveSection("ai-suggestions")} style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", padding: "12px 24px",
              borderRadius: "12px", fontWeight: 600, cursor: "pointer",
            }}>
              AI Health Score
            </button>
          </div>
        </div>
        
        {/* Decorative Circle */}
        <div style={{
          width: "180px", height: "180px", borderRadius: "50%",
          background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          opacity: 0.1, position: "absolute", right: "-40px", top: "-40px",
        }} />
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <KpiCard
          label="Next Consultation"
          value={nextAppt ? new Date(nextAppt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "None"}
          delta={nextAppt ? nextAppt.appointmentTime : "No pending"}
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          color="#06b6d4"
          bg="linear-gradient(135deg,rgba(6,182,212,0.1),rgba(8,145,178,0.05))"
          border="rgba(6,182,212,0.15)"
        />
        <KpiCard
          label="Active Prescriptions"
          value={activePrescriptionsCount.toString()}
          delta="Current medications"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          color="#10b981"
          bg="linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.05))"
          border="rgba(16,185,129,0.15)"
        />
        <KpiCard
          label="Health Score"
          value="84%"
          delta="Good"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          color="#8b5cf6"
          bg="linear-gradient(135deg,rgba(139,92,246,0.1),rgba(109,40,217,0.05))"
          border="rgba(139,92,246,0.15)"
        />
        <KpiCard
          label="Active Reminders"
          value={reminders.length.toString()}
          delta="Medications"
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="#f43f5e"
          bg="linear-gradient(135deg,rgba(244,63,94,0.1),rgba(225,29,72,0.05))"
          border="rgba(244,63,94,0.15)"
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
        
        {/* Recent Activity */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Recent Health Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {prescriptions.slice(0, 5).map((prx, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "12px", background: "#f8fafc" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💊</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>New Prescription Issued</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>By Dr. Specialist · {new Date(prx.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setActiveSection("prescriptions")} style={{ background: "none", border: "none", color: "#06b6d4", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View</button>
              </div>
            ))}
            {prescriptions.length === 0 && (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", padding: "40px 0" }}>No recent activity to show.</p>
            )}
          </div>
        </div>

        {/* Daily Medications */}
        <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Daily Medications</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reminders.length === 0 ? (
               <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", padding: "20px 0" }}>No active medications.</p>
            ) : (
              reminders.map((rem) => (
                <div key={rem.id} style={{ 
                  padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0",
                  display: "flex", flexDirection: "column", gap: "8px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{rem.medicineName}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{rem.dosage} • {rem.frequency}</p>
                    </div>
                    <button 
                      onClick={() => completeReminder(rem.id)}
                      style={{
                        background: "#06b6d4", color: "white", border: "none",
                        borderRadius: "8px", padding: "6px 12px", fontSize: "11px",
                        fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      Done
                    </button>
                  </div>
                  {rem.instructions && (
                     <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", fontSize: "11px", color: "#475569" }}>
                       <span style={{ fontWeight: 600 }}>Note:</span> {rem.instructions}
                     </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
