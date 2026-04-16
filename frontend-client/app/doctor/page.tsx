"use client";

import { DoctorProvider } from "@/app/context/DoctorContext";
import { DoctorSidebar } from "@/app/components/doctor-management/DoctorSidebar";
import { DoctorTopBar } from "@/app/components/doctor-management/DoctorTopBar";
import { DoctorDashboardContent } from "@/app/components/doctor-management/DoctorDashboardContent";
import { DoctorAppointmentsContent } from "@/app/components/doctor-management/DoctorAppointmentsContent";
import { DoctorPrescriptionsContent } from "@/app/components/doctor-management/DoctorPrescriptionsContent";
import { DoctorMyScheduleContent } from "@/app/components/doctor-management/DoctorMyScheduleContent";
import { useDoctorAuth } from "@/app/hooks/useDoctorAuth";
import { useDoctorContext } from "@/app/context/DoctorContext";

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
        animation: "pulse 2s infinite",
      }}>
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, color: "#e2e8f0", fontWeight: 700, fontSize: "16px" }}>SmartHealth Portal</p>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>Verifying credentials…</p>
      </div>
      {/* Spinner ring */}
      <svg width="32" height="32" style={{ animation: "spin 1s linear infinite" }} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="rgba(6,182,212,0.15)" strokeWidth="3" fill="none" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 32px rgba(6,182,212,0.5)} 50%{box-shadow:0 0 48px rgba(6,182,212,0.8)} }
      `}</style>
    </div>
  );
}

/* ── Inner shell (needs context) ─────────────────────────────── */
function DoctorShell() {
  const { session } = useDoctorAuth(); // JWT verification — do NOT modify
  const { sidebarCollapsed, activeSection } = useDoctorContext();

  if (!session) return <LoadingScreen />;

  const sideWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Fixed sidebar */}
      <DoctorSidebar />

      {/* Fixed topbar */}
      <DoctorTopBar />

      {/* Scrollable main content area */}
      <main style={{
        marginLeft: sideWidth,
        paddingTop: "72px",
        minHeight: "100vh",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "28px 28px 40px", maxWidth: "1400px" }}>
          {activeSection === "dashboard" && <DoctorDashboardContent />}

          {activeSection === "appointments" && <DoctorAppointmentsContent />}

          {activeSection === "prescriptions" && <DoctorPrescriptionsContent />}

          {activeSection === "schedule" && <DoctorMyScheduleContent />}

          {activeSection !== "dashboard" && activeSection !== "appointments" && activeSection !== "prescriptions" && activeSection !== "schedule" && (
            <ComingSoonSection section={activeSection} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Placeholder for non-dashboard sections ──────────────────── */
function ComingSoonSection({ section }: { section: string }) {
  const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ");
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "20px", textAlign: "center",
    }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "20px",
        background: "linear-gradient(135deg,rgba(6,182,212,0.15),rgba(8,145,178,0.08))",
        border: "1px solid rgba(6,182,212,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="36" height="36" fill="none" stroke="#06b6d4" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
          {sectionTitle}
        </h2>
        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>
          This section is ready — connect it to your API endpoints to populate with live data.
        </p>
      </div>
      <div style={{
        background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)",
        borderRadius: "12px", padding: "12px 24px",
        fontSize: "13px", color: "#0891b2", fontWeight: 600,
      }}>
        ● Coming soon in next sprint
      </div>
    </div>
  );
}

/* ── Root page ───────────────────────────────────────────────── */
export default function DoctorDashboardPage() {
  return (
    <DoctorProvider>
      <DoctorShell />
    </DoctorProvider>
  );
}
