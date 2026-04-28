"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
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
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("smart_admin_token");
      if (!token) throw new Error("Authentication error");
      const updated = await updatePatientProfile(token, patient.id, formData);
      setPatient(updated);
      setFormData(updated);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
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
      <div className="flex min-h-screen flex-col bg-[#0a0f1c]">
        <PatientNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4fd1c5] border-t-transparent"></div>
            <p className="text-slate-400 font-medium animate-pulse">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0a0f1c]">
        <PatientNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Profile not found</h2>
            <button 
              onClick={() => router.push("/")}
              className="mt-4 rounded-xl bg-[#4fd1c5] px-6 py-2 font-bold text-[#0a0f1c]"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-[#4fd1c5]/30 pb-12">
      <PatientNavbar />
      
      <main className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        {/* Top Actions & Alerts */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Profile Overview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 hidden md:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95 shadow-sm"
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
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/5"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#4fd1c5] px-5 py-2.5 text-sm font-bold text-[#0a0f1c] shadow-lg shadow-[#4fd1c5]/20 transition hover:bg-[#3dbdb0] active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0f1c] border-t-transparent"></div>
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
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <span className="font-bold">Success:</span> {success}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column */}
          <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col gap-6">
            
            {/* Identity Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#4fd1c5]/20 to-blue-600/20 opacity-50"></div>
              
              <div className="relative flex flex-col items-center mt-4">
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#4fd1c5] to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-[#4fd1c5]/20 ring-4 ring-[#0a0f1c]">
                  {patient.firstName.charAt(0).toUpperCase()}
                </div>
                
                <h2 className="mt-4 text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {patient.firstName} {patient.lastName}
                  {patient.active && (
                    <span className="bg-[#4fd1c5]/20 text-[#4fd1c5] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Active
                    </span>
                  )}
                </h2>
                
                <div className="mt-6 w-full space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#4fd1c5]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#4fd1c5]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    {editMode ? (
                      <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} className="w-full bg-transparent border-b border-[#4fd1c5] text-white outline-none focus:border-white px-1 transition" placeholder="Phone Number" />
                    ) : (
                      <span>{patient.phoneNumber || "Not provided"}</span>
                    )}
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#4fd1c5] mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    {editMode ? (
                      <textarea name="address" value={formData.address || ""} onChange={handleChange} rows={2} className="w-full bg-white/5 rounded-lg border border-[#4fd1c5]/30 text-white p-2 outline-none resize-none pt-1" placeholder="Address" />
                    ) : (
                      <span className="leading-relaxed">{patient.address || "Not provided"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold block mb-1">Date of Birth</label>
                  {editMode ? (
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} className="w-full bg-white/10 rounded-md py-1 px-2 text-sm text-white border border-white/10 focus:border-[#4fd1c5] outline-none" />
                  ) : (
                    <span className="text-sm font-medium text-white">{patient.dateOfBirth || "—"}</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold block mb-1">Gender</label>
                  {editMode ? (
                    <select name="gender" value={formData.gender || ""} onChange={handleChange} className="w-full bg-white/10 rounded-md py-1 px-2 text-sm text-white border border-white/10 focus:border-[#4fd1c5] outline-none">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-white">{patient.gender || "—"}</span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold block mb-1">Blood Group</label>
                  {editMode ? (
                    <select name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleChange} className="w-full bg-white/10 rounded-md py-1 px-2 text-sm text-white border border-white/10 focus:border-[#4fd1c5] outline-none">
                      <option value="">N/A</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-red-400">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.6L7.3 9.4c-2.3 3.4-3.1 7.1-1.6 10.3C7.2 23 10.1 24 12 24s4.8-1 6.3-4.3c1.5-3.2.7-6.9-1.6-10.3L12 2.6z"/></svg>
                      {patient.bloodGroup || "—"}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#4fd1c5] font-bold block mb-1">Date Joined</label>
                  <span className="text-sm font-medium text-slate-300">{new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
          
          {/* Right Column */}
          <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col gap-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-blue-500/20 text-blue-400 p-3 rounded-full mb-3"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                 <span className="text-2xl font-bold text-white">0</span>
                 <span className="text-xs text-slate-400 font-medium uppercase mt-1">Appointments</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-[#4fd1c5]/20 text-[#4fd1c5] p-3 rounded-full mb-3"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                 <span className="text-2xl font-bold text-white">0</span>
                 <span className="text-xs text-slate-400 font-medium uppercase mt-1">Prescriptions</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-purple-500/20 text-purple-400 p-3 rounded-full mb-3"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></div>
                 <span className="text-2xl font-bold text-white">0</span>
                 <span className="text-xs text-slate-400 font-medium uppercase mt-1">Lab Results</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-amber-500/20 text-amber-400 p-3 rounded-full mb-3"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                 <span className="text-2xl font-bold text-white">$0</span>
                 <span className="text-xs text-slate-400 font-medium uppercase mt-1">Payments</span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#4fd1c5]/10 to-blue-600/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                   <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                   Emergency Contact
                 </h3>
                 <p className="text-sm text-blue-200/80">In case of emergency, this person will be contacted.</p>
               </div>
               
               {editMode ? (
                 <div className="flex flex-col gap-2 w-full md:max-w-xs">
                   <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ""} onChange={handleChange} className="w-full bg-white/5 rounded-lg border border-white/20 py-2 px-3 text-sm text-white outline-none focus:border-[#4fd1c5]" placeholder="Contact Name" />
                   <input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone || ""} onChange={handleChange} className="w-full bg-white/5 rounded-lg border border-white/20 py-2 px-3 text-sm text-white outline-none focus:border-[#4fd1c5]" placeholder="Contact Phone" />
                 </div>
               ) : (
                 <div className="bg-[#0a0f1c]/50 rounded-xl px-5 py-3 border border-white/5 text-right w-full md:w-auto">
                   <p className="text-white font-bold text-base leading-tight">{patient.emergencyContactName || "Not specified"}</p>
                   <p className="text-slate-400 text-sm">{patient.emergencyContactPhone || "—"}</p>
                 </div>
               )}
            </div>

            {/* Upcoming Activities Block */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-white">Upcoming Events & Tasks</h3>
                <span className="text-xs bg-[#4fd1c5] text-[#0a0f1c] font-bold px-2 py-1 rounded-md">Updated</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 opacity-60">
                <svg className="w-16 h-16 mb-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-lg font-semibold">No recent events</p>
                <p className="text-sm max-w-sm mt-1">Your upcoming appointments, laboratory tests, and assigned care paths will appear here.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
