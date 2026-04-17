"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDoctorByUserId } from "@/lib/api";
import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

function decodeUserId(token: string): number | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded: Record<string, unknown> = JSON.parse(atob(padded));
    const raw = decoded["userId"];

    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const userId = Number(raw);
      return Number.isNaN(userId) ? null : userId;
    }

    return null;
  } catch {
    return null;
  }
}

export function DoctorTelemedicineContent() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TelemedicineSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "DOCTOR") {
      router.push("/login");
      return;
    }

    loadSessions(token);
  }, [router]);

  async function loadSessions(token: string) {
    try {
      setLoading(true);
      setError(null);

      // Resolve the doctor profile through JWT userId, not email, to avoid stale email/profile mismatches.
      const userId = decodeUserId(token);
      if (!userId) {
        throw new Error("Could not extract your user ID from the login token. Please sign in again.");
      }

      const doctor = await fetchDoctorByUserId(userId, token);
      if (!doctor || !doctor.id) {
        throw new Error("Could not load doctor profile");
      }

      // 2. Fetch the telemedicine sessions from the gateway
      // Doctor IDs are UUIDs returning from backend
      const res = await fetch(`${API_GATEWAY}/api/v1/telemedicine/sessions/doctor/${doctor.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch your telemedicine sessions");
      }

      const data: TelemedicineSessionResponse[] = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-cyan-100 p-4">
            <svg className="h-8 w-8 animate-spin text-cyan-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.1)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "10%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(6,182,212,0.1)", filter: "blur(40px)", pointerEvents: "none" }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0 }}>Telemedicine Consultations</h1>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "14px" }}>Manage and join your online video sessions</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e8f0fe", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {error && (
          <div style={{ margin: "20px", padding: "16px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Upcoming Sessions</h3>
        </div>
        
        {sessions.length === 0 && !error ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.5 }}>📹</div>
            <h4 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600, color: "#334155" }}>No sessions found</h4>
            <p style={{ margin: 0, fontSize: "14px" }}>You have no upcoming virtual consultations assigned to you.</p>
          </div>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {sessions.map((session, index) => (
              <li key={session.sessionId} style={{
                padding: "20px 24px",
                borderBottom: index < sessions.length - 1 ? "1px solid #f1f5f9" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                    Appointment #{session.appointmentId.substring(0, 8).toUpperCase()}
                  </h4>
                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: session.status === 'COMPLETED' ? "#10b981" : "#0ea5e9"
                      }} />
                      {session.status || 'PENDING'}
                    </span>
                    <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  {session.status !== 'COMPLETED' ? (
                    <button
                      onClick={() => router.push(`/telemedicine?appointmentId=${session.appointmentId}`)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "linear-gradient(135deg,#06b6d4,#0891b2)",
                        color: "#fff", border: "none", borderRadius: "10px",
                        padding: "10px 20px", fontSize: "13px", fontWeight: 600,
                        cursor: "pointer", boxShadow: "0 4px 12px rgba(6,182,212,0.3)",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Call
                    </button>
                  ) : (
                    <span style={{
                      background: "rgba(16,185,129,0.1)", color: "#059669",
                      padding: "6px 12px", borderRadius: "999px",
                      fontSize: "12px", fontWeight: 600, border: "1px solid rgba(16,185,129,0.2)"
                    }}>
                      Completed
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
