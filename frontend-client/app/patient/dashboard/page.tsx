"use client";

import { useEffect } from "react";

import { PatientProvider, usePatientContext } from "@/app/context/PatientContext";
import { PatientSidebar } from "@/app/components/patient-management/PatientSidebar";
import { PatientTopBar } from "@/app/components/patient-management/PatientTopBar";
import { PatientDashboardContent } from "@/app/components/patient-management/PatientDashboardContent";
import { PatientAppointmentManagementContent } from "@/app/components/patient-management/PatientAppointmentManagementContent";
import { PatientPrescriptionsContent } from "@/app/components/patient-management/PatientPrescriptionsContent";
import { PatientTelemedicineContent } from "@/app/components/patient-management/PatientTelemedicineContent";
import { PatientProfileContent } from "@/app/components/patient-management/PatientProfileContent";
import { PatientReportsContent } from "@/app/components/patient-management/PatientReportsContent";
import { PatientSupportContent } from "@/app/components/patient-management/PatientSupportContent";
import { usePatientAuth } from "@/app/hooks/usePatientAuth";

/* ── Loading screen ──────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0a0f1e 0%,#0d1b3e 50%,#0a1628 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "20px",
    }}>
      <div style={{
        width: "60px", height: "60px", borderRadius: "16px",
        background: "linear-gradient(135deg,#06b6d4,#0891b2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 32px rgba(6,182,212,0.5)",
        animation: "pulse 2.3s infinite",
      }}>
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 700, fontSize: "16px" }}>Patient Portal</p>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>Securing session…</p>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 0 32px rgba(6,182,212,0.5)} 50%{box-shadow:0 0 48px rgba(6,182,212,0.8)} }
      `}</style>
    </div>
  );
}

/* ── Coming Soon Placeholder ─────────────────────────────────── */
function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "20px", textAlign: "center",
    }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "24px",
        background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="32" height="32" fill="none" stroke="#06b6d4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>{title}</h2>
        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>This section is currently being personalized for your health profile.</p>
      </div>
    </div>
  );
}

/* ── Patient Shell ───────────────────────────────────────────── */
function PatientShell() {
  const { session, loading } = usePatientAuth();
  const { sidebarCollapsed, activeSection, setSession } = usePatientContext();

  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  if (loading || !session) return <LoadingScreen />;

  const sideWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <PatientSidebar />
      <PatientTopBar />
      
      <main style={{
        marginLeft: sideWidth,
        paddingTop: "72px",
        minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
          {activeSection === "dashboard" && <PatientDashboardContent />}
          {activeSection === "appointments" && <PatientAppointmentManagementContent hideNavbar={true} />}
          {activeSection === "prescriptions" && <PatientPrescriptionsContent />}
          {activeSection === "reports" && <PatientReportsContent />}
          {activeSection === "telemedicine" && <PatientTelemedicineContent />}
          {activeSection === "profile" && <PatientProfileContent />}
          {activeSection === "help-support" && <PatientSupportContent />}
          {activeSection !== "dashboard" && activeSection !== "appointments" && activeSection !== "prescriptions" && activeSection !== "reports" && activeSection !== "telemedicine" && activeSection !== "profile" && activeSection !== "help-support" && <ComingSoon title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace("-", " ")} />}
        </div>
      </main>
    </div>
  );
}

/* ── Root Page ───────────────────────────────────────────────── */
export default function PatientDashboardPage() {
  return (
    <PatientProvider>
      <PatientShell />
    </PatientProvider>
  );
}
