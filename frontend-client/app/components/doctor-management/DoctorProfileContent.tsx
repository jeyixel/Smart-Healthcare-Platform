"use client";

import { useState, useEffect } from "react";
import { useAppointments } from "@/app/hooks/useAppointments";
import { useDoctorContext } from "@/app/context/DoctorContext";

interface ProfileSection {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  status?: "active" | "inactive" | "warning";
}

function ProfileSection({ title, icon, children, status }: ProfileSection) {
  const getStatusColor = () => {
    switch (status) {
      case "active": return "#10b981";
      case "inactive": return "#ef4444";
      case "warning": return "#f59e0b";
      default: return "#06b6d4";
    }
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "20px 24px",
        borderBottom: "1px solid #f1f5f9",
        background: status ? `${getStatusColor()}08` : "#fff",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: status ? getStatusColor() : "#06b6d4",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: 0, fontSize: "18px", fontWeight: 700,
          color: "#0f172a",
        }}>
          {title}
        </h3>
        {status && (
          <div style={{
            padding: "4px 12px", borderRadius: "999px",
            background: getStatusColor(),
            color: "#fff", fontSize: "12px", fontWeight: 600,
          }}>
            {status.toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ padding: "24px" }}>
        {children}
      </div>
    </div>
  );
}

export function DoctorProfileContent() {
  const { session } = useDoctorContext();
  const { doctor, loading, error, refetch } = useAppointments();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    license: "",
    experience: "",
    education: "",
    bio: "",
    consultationMode: "",
    consultationFee: "",
    hospitalOrClinic: "",
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        firstName: doctor.fullName?.split(' ')[0] || "",
        lastName: doctor.fullName?.split(' ').slice(1).join(' ') || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.specialty || "",
        license: doctor.licenseNumber || "",
        experience: doctor.experienceYears?.toString() || "",
        education: doctor.qualification || "",
        bio: doctor.bio || "",
        consultationMode: doctor.consultationMode || "",
        consultationFee: doctor.consultationFee?.toString() || "",
        hospitalOrClinic: doctor.hospitalOrClinic || "",
      });
    }
  }, [doctor]);

  if (loading) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "20px",
          background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 40px rgba(6,182,212,0.3)",
          animation: "pulse 2s infinite",
        }}>
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
          </svg>
        </div>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
          Loading Profile
        </h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
          Fetching your profile information...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(6,182,212,0.3); }
            50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(6,182,212,0.5); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "40px", textAlign: "center",
        color: "#dc2626", background: "rgba(239,68,68,0.1)",
        borderRadius: "12px",
      }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 700 }}>
          Error Loading Profile
        </h3>
        <p style={{ margin: 0, fontSize: "14px" }}>
          {error}
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!doctor?.id) {
      console.error("Doctor ID not found");
      return;
    }

    setIsSaving(true); // Start loading state

    try {
      const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_BASE || "http://localhost:8082";
      const token = localStorage.getItem("smart_admin_token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Prepare the update request body according to UpdateDoctorRequest
      const updateData = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        specialty: formData.specialization,
        category: doctor.category || "General", // Keep existing category or default
        qualification: formData.education,
        experienceYears: parseInt(formData.experience) || 0,
        hospitalOrClinic: formData.hospitalOrClinic,
        consultationFee: parseFloat(formData.consultationFee) || 0,
        consultationMode: formData.consultationMode || "BOTH",
        bio: formData.bio,
        profileImageUrl: doctor.profileImageUrl || null, // Keep existing profile image
      };

      console.log("Updating doctor profile:", updateData);

      const response = await fetch(`${DOCTOR_API}/api/v1/doctors/${doctor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedDoctor = await response.json();
      console.log("Profile updated successfully:", updatedDoctor);
      
      // Refresh doctor data to show updated information immediately
      await refetch();
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optional: Optional: Smessage ho u errror message to user
      // Ynetcsuhdeddro tast hee
    } finally {
      setIsSaving(false); // End loading state
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (doctor) {
      setFormData({
        firstName: doctor.fullName?.split(' ')[0] || "",
        lastName: doctor.fullName?.split(' ').slice(1).join(' ') || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.specialty || "",
        license: doctor.licenseNumber || "",
        experience: doctor.experienceYears?.toString() || "",
        education: doctor.qualification || "",
        bio: doctor.bio || "",
        consultationMode: doctor.consultationMode || "",
        consultationFee: doctor.consultationFee?.toString() || "",
        hospitalOrClinic: doctor.hospitalOrClinic || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile Header */}
      <div style={{
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a1628 100%)",
        borderRadius: "20px",
        padding: "32px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
        }} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "20px",
            background: "linear-gradient(135deg, #06b6d4, #0284c7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px", fontWeight: 700,
            boxShadow: "0 0 30px rgba(6,182,212,0.4)",
            border: "3px solid rgba(255,255,255,0.2)",
          }}>
            {doctor?.fullName?.charAt(0).toUpperCase() || "D"}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{
              margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700,
            }}>
              Dr. {doctor?.fullName}
            </h1>
            <p style={{ margin: "0 0 4px 0", fontSize: "16px", opacity: 0.9 }}>
              {doctor?.specialty || "General Physician"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", opacity: 0.8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {doctor?.email}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 00.684-.949V5a2 2 0 00-2-2h-3.28z" />
                </svg>
                {doctor?.phone || "Not provided"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                color: "#fff",
                fontSize: "14px", fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(6,182,212,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = "translateY(-2px)";
                (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(6,182,212,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = "translateY(0)";
                (e.target as HTMLElement).style.boxShadow = "0 2px 8px rgba(6,182,212,0.3)";
              }}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#64748b",
                fontSize: "14px", fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: isSaving 
                  ? "linear-gradient(135deg, #94a3b8, #64748b)" 
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontSize: "14px", fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: isSaving 
                  ? "0 2px 8px rgba(148,163,184,0.3)" 
                  : "0 2px 8px rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "140px",
                justifyContent: "center",
              }}
            >
              {isSaving ? (
                <>
                  <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid #ffffff40",
                    borderTop: "2px solid #ffffff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </>
        )}
      </div>

      {/* Personal Information */}
      <ProfileSection
        title="Personal Information"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Professional Information */}
      <ProfileSection
        title="Professional Information"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              License Number
            </label>
            <input
              type="text"
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Years of Experience
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Education
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
        </div>
        
        {/* Additional Professional Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Consultation Mode
            </label>
            <select
              value={formData.consultationMode}
              onChange={(e) => setFormData({ ...formData, consultationMode: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            >
              <option value="">Select Consultation Mode</option>
              <option value="ONLINE">Online Consultation</option>
              <option value="PHYSICAL">In-Person Consultation</option>
              <option value="BOTH">Both Online & In-Person</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Consultation Fee ($)
            </label>
            <input
              type="number"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              disabled={!isEditing}
              min="0"
              step="0.01"
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Hospital or Clinic
            </label>
            <input
              type="text"
              value={formData.hospitalOrClinic}
              onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })}
              disabled={!isEditing}
              style={{
                width: "100%", padding: "10px 14px",
                border: "1px solid #e5e7eb", borderRadius: "8px",
                fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
                color: isEditing ? "#0f172a" : "#6b7280",
              }}
            />
          </div>
        </div>
      </ProfileSection>

      {/* Bio */}
      <ProfileSection
        title="Professional Bio"
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11 8.172V5z" />
          </svg>
        }
      >
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            rows={4}
            style={{
              width: "100%", padding: "12px 14px",
              border: "1px solid #e5e7eb", borderRadius: "8px",
              fontSize: "14px", background: isEditing ? "#fff" : "#f9fafb",
              color: isEditing ? "#0f172a" : "#6b7280",
              resize: "vertical", minHeight: "100px",
            }}
          />
        </div>
      </ProfileSection>

      {/* Account Status */}
      <ProfileSection
        title="Account Status"
        status={doctor?.active ? "active" : "inactive"}
        icon={
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "16px", borderRadius: "12px",
            background: doctor?.active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${doctor?.active ? "#10b98120" : "#ef444420"}`,
          }}>
            <div style={{
              width: "12px", height: "12px", borderRadius: "50%",
              background: doctor?.active ? "#10b981" : "#ef4444",
              boxShadow: doctor?.active ? "0 0 8px rgba(16,185,129,0.4)" : "0 0 8px rgba(239,68,68,0.4)",
            }} />
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>
                {doctor?.active ? "Active Status" : "Inactive Status"}
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                {doctor?.active 
                  ? "Your account is currently active. Patients can book appointments with you and you appear in search results."
                  : "Your account is currently inactive. Patients cannot book appointments and you won't appear in search results."
                }
              </p>
            </div>
          </div>
          
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
            padding: "16px", borderRadius: "12px",
            background: "#f8fafc", border: "1px solid #e2e8f0",
          }}>
            <div>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                Verification Status
              </h5>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: doctor?.verified ? "#10b981" : "#f59e0b",
                }} />
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {doctor?.verified ? "Verified" : "Pending Verification"}
                </span>
              </div>
            </div>
            <div>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                Member Since
              </h5>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                {doctor?.id ? "2024-01-15" : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </ProfileSection>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(16,185,129,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 9999,
          animation: "slideIn 0.3s ease-out",
        }}>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 600 }}>
              Profile Updated Successfully!
            </h4>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              Your profile information has been updated.
            </p>
          </div>
        </div>
      )}
      
      {/* Add CSS animations for spinner and toast */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          0% { 
            transform: translateX(100%);
            opacity: 0;
          }
          100% { 
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
