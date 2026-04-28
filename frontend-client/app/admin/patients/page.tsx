"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchPatients, updatePatientStatus } from "@/lib/api";
import { Patient } from "@/types/api";

export default function PatientsManagementPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        router.push("/login?role=ADMIN");
        return;
      }

      const data = await fetchPatients(token);
      setPatients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("smart_admin_token");
      const user = localStorage.getItem("smart_admin_user");
      const adminData = user ? JSON.parse(user) : null;
      const adminEmail = adminData?.email || "system-admin";

      if (!token) return;

      const nextStatus = !currentStatus;
      await updatePatientStatus(token, id, nextStatus, adminEmail);

      // Optimistic update
      setPatients(prev => prev.map(p => 
        p.id === id ? { ...p, active: nextStatus } : p
      ));
    } catch (err: any) {
      alert("Error updating patient status: " + err.message);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "No history";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* === Search & Actions Header === */}
      <section style={{
        display: "flex",
        alignItems: "center",
        padding: "20px 24px",
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #e8f0fe",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        gap: "20px"
      }}>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "10px 16px",
          gap: "12px"
        }}>
          <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Filter by name, identifier, or clinical email..." 
            style={{ border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "#334155", flex: 1 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ padding: "10px 20px", borderRadius: "10px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Configuration</button>
          <button style={{ padding: "10px 24px", borderRadius: "10px", background: "#06b6d4", color: "#fff", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(6,182,212,0.25)" }}>Register Manual</button>
        </div>
      </section>

      {error && (
        <div style={{ padding: "16px 24px", borderRadius: "16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", display: "flex", alignItems: "center", gap: "12px" }}>
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>Registry Error: {error}</p>
           <button onClick={loadPatients} style={{ marginLeft: "auto", background: "none", border: "none", color: "#dc2626", textDecoration: "underline", fontWeight: 800, cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}>Retry Sync</button>
        </div>
      )}

      {/* === Patient Registry Table === */}
      <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Population Registry</h2>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Active Records: {filteredPatients.length}</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Universal Identifier</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Identity Profile</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Modified</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Synchronizing regional database...</td></tr>
                ))
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fcfdfe"}>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ padding: "4px 8px", background: "#f1f5f9", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: "#64748b", border: "1px solid #e2e8f0" }}>ID-{p.id.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{p.firstName} {p.lastName}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{p.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "4px 12px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
                        background: p.active ? "rgba(16,185,129,0.1)" : "#f1f5f9",
                        color: p.active ? "#10b981" : "#64748b",
                        border: p.active ? "1px solid rgba(16,185,129,0.2)" : "1px solid #e2e8f0"
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.active ? "#10b981" : "#94a3b8" }} />
                        {p.active ? "UPLINK ACTIVE" : "SUSPENDED"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>{formatDate(p.updatedAt)}</span>
                    </td>
                    <td style={{ padding: "18px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => toggleStatus(p.id, p.active)}
                          style={{ padding: "6px 14px", borderRadius: "8px", background: p.active ? "rgba(245,158,11,0.1)" : "rgba(6,182,212,0.1)", color: p.active ? "#d97706" : "#06b6d4", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                        >
                          {p.active ? "Restrict" : "Reinstate"}
                        </button>
                        <button style={{ padding: "6px 14px", borderRadius: "8px", background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Records</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredPatients.length === 0 && (
          <div style={{ padding: "60px", textAlign: "center", opacity: 0.5 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>Registry Search: Zero Matches Detected</p>
          </div>
        )}
      </section>

    </div>
  );
}
