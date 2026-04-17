"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchDoctors, updateDoctorApproval } from "@/lib/api";
import { Doctor } from "@/types/api";

export default function DoctorsManagementPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatConsultationFee = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "0";
    }

    const numericValue =
      typeof value === "number"
        ? value
        : Number.parseFloat(String(value));

    if (!Number.isFinite(numericValue)) {
      return "0";
    }

    return numericValue.toLocaleString("en-US");
  };

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("smart_admin_token");
      if (!token) {
        router.push("/login?role=ADMIN");
        return;
      }

      const data = await fetchDoctors(token);
      setDoctors(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleApproval = async (id: string, isApproved: boolean) => {
    try {
      const token = localStorage.getItem("smart_admin_token");
      const user = localStorage.getItem("smart_admin_user");
      const adminData = user ? JSON.parse(user) : null;
      const adminEmail = adminData?.email || "system-admin";

      if (!token) return;

      await updateDoctorApproval(token, id, isApproved, adminEmail);
      
      // Update local state
      setDoctors(prev => prev.map(doc => 
        doc.id === id ? { ...doc, approved: isApproved } : doc
      ));
    } catch (err: any) {
      alert("Error updating approval status: " + err.message);
    }
  };

  const pendingDoctors = doctors.filter(doc => !doc.approved);
  const verifiedDoctors = doctors.filter(doc => doc.approved);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* === Pending Verification Header === */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>Pending Credentials</h2>
          <span style={{ background: "#f59e0b", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "2px 10px", borderRadius: "999px" }}>
            {pendingDoctors.length} Waiting
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {pendingDoctors.map((doc) => (
            <div key={doc.id} style={{
              background: "#fff",
              border: "1px solid #fee2e2",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(239,68,68,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{
                  width: "50px", height: "50px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: 800
                }}>{(doc.firstName?.charAt(0) ?? "?")}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Dr. {doc.firstName ?? "Unknown"} {doc.lastName ?? "Doctor"}</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{doc.specialization ?? "General"}</p>
                </div>
              </div>
              <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fee2e2" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>License: {doc.licenseNumber}</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>{doc.email}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button 
                  onClick={() => handleApproval(doc.id, true)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: "10px",
                    background: "#10b981", color: "#fff", border: "none",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                  }}
                >Verify License</button>
                <button style={{
                  padding: "10px 16px", borderRadius: "10px",
                  background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}>Profile</button>
              </div>
            </div>
          ))}
          {pendingDoctors.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "20px", border: "1px dashed #e2e8f0" }}>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>All providers have been successfully verified.</p>
            </div>
          )}
        </div>
      </section>

      {/* === Verified Registry Header === */}
      <section style={{ background: "#fff", borderRadius: "24px", border: "1px solid #e8f0fe", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Verified Provider Registry</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="Filter by name..." style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none", width: "220px" }} />
            <button style={{ padding: "8px 16px", borderRadius: "10px", background: "#06b6d4", color: "#fff", border: "none", fontSize: "12px", fontWeight: 600 }}>Export</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Doctor Profile</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Specialization</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fee (LKR)</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ divideY: "1px solid #f1f5f9" }}>
              {verifiedDoctors.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#fcfdfe"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: 700
                      }}>{(doc.firstName?.charAt(0) ?? "?")}</div>
                      <div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>Dr. {doc.firstName ?? "Unknown"} {doc.lastName ?? "Doctor"}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{doc.email ?? "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>{doc.specialization ?? "General"}</span>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{formatConsultationFee(doc.consultationFee)}</span>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
                      background: doc.active ? "rgba(16,185,129,0.1)" : "rgba(241,245,249,1)",
                      color: doc.active ? "#10b981" : "#64748b"
                    }}>
                      {doc.active ? "● ONLINE" : "OFFLINE"}
                    </span>
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => handleApproval(doc.id, false)}
                        style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                      >Revoke</button>
                      <button style={{ padding: "6px 12px", borderRadius: "8px", background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 700 }}>Profile</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
