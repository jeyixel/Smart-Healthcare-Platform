"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchAdminAppointments, updateAppointmentStatus } from "@/lib/api";
import { Appointment } from "@/types/api";

/* === Sub-components === */

function MetricCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8f0fe",
      borderRadius: "16px",
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      transition: "transform 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{
        width: "52px", height: "52px", borderRadius: "14px",
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{value}</p>
      </div>
    </div>
  );
}

export default function AppointmentsManagementPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        router.push("/login?role=ADMIN");
        return;
      }

      const data = await fetchAdminAppointments(token);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("smart_admin_token");
      if (!token) return;

      await updateAppointmentStatus(token, id, newStatus);
      
      // Update local state
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
    } catch (err: any) {
      alert("Error updating appointment status: " + err.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { bg: "rgba(16,185,129,0.1)", color: "#10b981" };
      case 'CONFIRMED': return { bg: "rgba(6,182,212,0.1)", color: "#06b6d4" };
      case 'PENDING': return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" };
      case 'CANCELLED': return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* === KPI Row === */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <MetricCard 
          label="Total Ledger" 
          value={appointments.length} 
          color="#06b6d4"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <MetricCard 
          label="Fulfilling" 
          value={appointments.filter(a => a.status === 'CONFIRMED').length} 
          color="#10b981"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard 
          label="Pending Queue" 
          value={appointments.filter(a => a.status === 'PENDING').length} 
          color="#f59e0b"
          icon={<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* === Appointment List === */}
      <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Scheduling Ledger</h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", background: "#f8fafc", padding: "6px 12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              Total: {appointments.length} Records
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient & ID</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Provider ID</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Schedule</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Aggregating records...</td></tr>
                ))
              ) : (
                appointments.map((appt) => {
                  const s = getStatusStyle(appt.status);
                  return (
                    <tr key={appt.id} style={{ borderBottom: "1px solid #f8fafc", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fcfdfe"}>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Patient-{appt.patientId.substring(0, 8)}</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>ID: {appt.id.substring(0, 12)}...</span>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#64748b" }}>D</div>
                          <span style={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>{appt.doctorId.substring(0, 12)}...</span>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>{appt.appointmentDate}</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{appt.appointmentTime}</span>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
                          background: s.bg, color: s.color, display: "inline-block", border: `1px solid ${s.color}22`
                        }}>
                          {appt.status}
                        </span>
                      </td>
                      <td style={{ padding: "18px 24px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'CANCELLED')}
                            style={{ padding: "6px 12px", borderRadius: "8px", background: "#fff", color: "#ef4444", border: "1px solid #fee2e2", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >Revoke</button>
                          <button 
                            onClick={() => handleStatusChange(appt.id, 'COMPLETED')}
                            style={{ padding: "6px 12px", borderRadius: "8px", background: "#06b6d4", color: "#fff", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >Finish</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
