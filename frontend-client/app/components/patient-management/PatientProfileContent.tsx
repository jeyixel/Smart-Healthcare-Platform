"use client";

import { useState, useEffect } from "react";
import { usePatientContext } from "@/app/context/PatientContext";
import { updatePatientProfile } from "@/lib/api";
import { Patient } from "@/types/api";

export function PatientProfileContent() {
  const { patient, session, refreshProfile, loadingProfile } = usePatientContext();
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "security">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (patient) {
      // Ensure date is in YYYY-MM-DD for the date input
      let dob = patient.dateOfBirth;
      if (dob && dob.includes("T")) {
        dob = dob.split("T")[0];
      }

      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        dateOfBirth: dob,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        address: patient.address,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
      });
    }
  }, [patient]);

  const handleSave = async () => {
    if (!session || !patient) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await updatePatientProfile(session.token, patient.id, formData);
      await refreshProfile();
      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProfile && !patient) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#06b6d4", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "60px" }}>
      
      {/* Header Card */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "24px",
        padding: "40px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "32px",
        marginBottom: "32px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          width: "100px", height: "100px", borderRadius: "30px",
          background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "40px", fontWeight: 800, color: "#fff",
          boxShadow: "0 0 20px rgba(6,182,212,0.3)",
        }}>
          {patient.firstName.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            {patient.firstName} {patient.lastName}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "16px" }}>
            {patient.email} • Patient ID: <span style={{ fontFamily: "monospace", color: "#06b6d4" }}>{patient.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
             <span style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)" }}>ACTIVE PROFILE</span>
             <span style={{ background: "rgba(255,255,255,0.05)", color: "#cbd5e1", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>Joined {new Date(patient.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", padding: "10px 20px", borderRadius: "12px", fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s", backdropFilter: "blur(4px)",
          }}>
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div style={{
          padding: "16px 24px", borderRadius: "16px", marginBottom: "24px",
          background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          color: message.type === "success" ? "#15803d" : "#991b1b",
          fontWeight: 500, fontSize: "14px",
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid #e2e8f0", marginBottom: "32px" }}>
        {[
          { id: "personal", label: "Personal Information" },
          { id: "medical", label: "Medical Background" },
          { id: "security", label: "Account & Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 4px", background: "none", border: "none", cursor: "pointer",
              fontSize: "15px", fontWeight: 600, color: activeTab === tab.id ? "#06b6d4" : "#64748b",
              position: "relative", transition: "color 0.2s",
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: "2px", background: "#06b6d4", borderRadius: "2px" }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        
        {activeTab === "personal" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>First Name</label>
              <input
                disabled={!isEditing}
                value={formData.firstName || ""}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Name</label>
              <input
                disabled={!isEditing}
                value={formData.lastName || ""}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone Number</label>
              <input
                disabled={!isEditing}
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date of Birth</label>
              <input
                type="date"
                disabled={!isEditing}
                value={formData.dateOfBirth || ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Gender</label>
              <select
                disabled={!isEditing}
                value={formData.gender || ""}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc" }}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Residential Address</label>
              <textarea
                disabled={!isEditing}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", background: isEditing ? "#fff" : "#f8fafc", resize: "none" }}
              />
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Blood Group</label>
                <select
                  disabled={!isEditing}
                  value={formData.bloodGroup || ""}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", outline: "none", background: isEditing ? "#fff" : "#f8fafc" }}
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Emergency Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Name</label>
                  <input
                    disabled={!isEditing}
                    value={formData.emergencyContactName || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", background: isEditing ? "#fff" : "transparent" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Phone</label>
                  <input
                    disabled={!isEditing}
                    value={formData.emergencyContactPhone || ""}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", background: isEditing ? "#fff" : "transparent" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div style={{ padding: "20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fef2f2" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🔐</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#991b1b" }}>Password Management</h4>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#b91c1c" }}>To change your password, please use the "Forgot Password" flow on the login screen for now.</p>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
            <button onClick={() => setIsEditing(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={isSaving} style={{
              padding: "12px 32px", borderRadius: "12px", border: "none", background: "#06b6d4", color: "#fff", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(6,182,212,0.3)", opacity: isSaving ? 0.7 : 1
            }}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
