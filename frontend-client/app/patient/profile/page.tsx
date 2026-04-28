"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPatientByEmail, updatePatientProfile } from "@/lib/api";
import { Patient } from "@/types/api";

export default function PatientProfilePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email");
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "PATIENT" || !email) {
      router.push("/login");
      return;
    }

    loadProfile(token, email);
  }, [router]);

  async function loadProfile(token: string, email: string) {
    try {
      setLoading(true);
      const data = await fetchPatientByEmail(token, email);
      setPatient(data);
      setFormData(data);
    } catch (err) {
      setError("Failed to load profile. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!patient) return;
    const token = localStorage.getItem("smart_admin_token");
    if (!token) {
      setError("Session expired. Please login again.");
      router.push("/login");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("smart_admin_token") || "";
      const updated = await updatePatientProfile(token, patient.id, formData);
      setPatient(updated);
      setFormData(updated);
      setEditMode(false);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
     return <div className="p-8 text-center text-slate-500">Profile not found.</div>;
  }

  return (
    <div className="text-slate-700">
      <div className="max-w-7xl mx-auto">
        {/* Top Actions & Alerts */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personal Profile</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your personal information and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditMode(false); setFormData(patient); }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#06b6d4] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
            <span className="font-bold">Success:</span> {success}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column: Identity */}
          <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#06b6d4]/10 to-blue-500/10 opacity-50"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-[#06b6d4] to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-white">
                  {patient.firstName.charAt(0).toUpperCase()}
                </div>
                
                <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {patient.firstName} {patient.lastName}
                  {patient.active && (
                    <span className="bg-[#06b6d4]/10 text-[#06b6d4] text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest font-black">
                      Active
                    </span>
                  )}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{patient.email}</p>

                <div className="mt-8 w-full space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#06b6d4]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Phone</p>
                      {editMode ? (
                        <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg text-slate-900 py-1 px-2 mt-0.5 outline-none focus:border-[#06b6d4] font-bold" />
                      ) : (
                        <span className="font-bold text-slate-900">{patient.phoneNumber || "Not provided"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#06b6d4]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Address</p>
                      {editMode ? (
                        <textarea name="address" value={formData.address || ""} onChange={handleChange} rows={2} className="w-full bg-slate-50 border border-slate-100 rounded-lg text-slate-900 py-1 px-2 mt-0.5 outline-none focus:border-[#06b6d4] font-bold resize-none" />
                      ) : (
                        <span className="font-bold text-slate-900 leading-tight block">{patient.address || "Not provided"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Blood Group</p>
                 <span className="text-xl font-black text-rose-500">{patient.bloodGroup || "—"}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Gender</p>
                 <span className="text-xl font-black text-slate-900">{patient.gender || "—"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                 <span className="w-1.5 h-6 bg-[#06b6d4] rounded-full"></span>
                 Medical Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">Full First Name</label>
                  <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleChange} disabled={!editMode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 font-bold outline-none focus:border-[#06b6d4] disabled:bg-slate-50/50 disabled:text-slate-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">Full Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange} disabled={!editMode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 font-bold outline-none focus:border-[#06b6d4] disabled:bg-slate-50/50 disabled:text-slate-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} disabled={!editMode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 font-bold outline-none focus:border-[#06b6d4] disabled:bg-slate-50/50 disabled:text-slate-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">National ID / Identifier</label>
                  <input type="text" value={patient.id} disabled className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-400 font-mono text-xs outline-none" />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                   </div>
                   <div>
                     <h4 className="text-base font-bold text-slate-900">Emergency Contact Protocols</h4>
                     <p className="text-xs text-slate-500">Verified point of contact for clinical emergencies.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">Contact Name</label>
                     <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ""} onChange={handleChange} disabled={!editMode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 font-bold outline-none focus:border-[#06b6d4] disabled:bg-slate-50/50 transition-all" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block ml-1">Contact Phone</label>
                     <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone || ""} onChange={handleChange} disabled={!editMode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 font-bold outline-none focus:border-[#06b6d4] disabled:bg-slate-50/50 transition-all" />
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
               </div>
               <h3 className="text-lg font-bold mb-2">SmartHealth Verified</h3>
               <p className="text-slate-400 text-sm max-w-md leading-relaxed">Your account is fully verified. You have access to telemedicine, digital prescriptions, and laboratory records across all SmartHealth facilities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
