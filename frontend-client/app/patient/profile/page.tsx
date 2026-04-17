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

    loadProfile(email, token);
  }, [router]);

  async function loadProfile(email: string, token: string) {
    try {
      setLoading(true);
      const data = await fetchPatientByEmail(email, token);
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
      
      const updated = await updatePatientProfile(patient.id, formData);
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
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-[#4fd1c5]/30">
      <PatientNavbar />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <header className="mb-12 flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-end">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl bg-linear-to-br from-[#4fd1c5] to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-[#4fd1c5]/20 ring-4 ring-white/5">
                {patient.firstName.charAt(0).toUpperCase()}
              </div>
              {editMode && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition cursor-not-allowed">
                   <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-lg text-[#4fd1c5] md:justify-start">
                <span className="h-2 w-2 rounded-full bg-[#4fd1c5] shadow-[0_0_8px_#4fd1c5]"></span>
                Patient Profile • {patient.email}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="group flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-8 py-4 font-bold text-white transition hover:bg-white/10 active:scale-95"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setEditMode(false); setFormData(patient); }}
                  className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-400 transition hover:bg-white/5"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-[#4fd1c5] px-8 py-4 font-bold text-[#0a0f1c] shadow-lg shadow-[#4fd1c5]/20 transition hover:bg-[#3dbdb0] active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0a0f1c] border-t-transparent"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 animate-in fade-in slide-in-from-top-4">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 animate-in fade-in slide-in-from-top-4">
            <span className="font-bold">Success:</span> {success}
          </div>
        )}

        {/* Content Tabs/Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Info Panel */}
          <aside className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-xl font-bold text-white">Quick Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {patient.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-400 font-medium">Joined</span>
                  <span className="text-white font-medium">{new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-slate-400 font-medium">Blood Group</span>
                  {editMode ? (
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup || ""}
                      onChange={handleChange}
                      className="rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-sm text-white outline-none focus:border-[#4fd1c5]"
                    >
                      <option value="">N/A</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-white font-bold text-lg">{patient.bloodGroup || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#4fd1c5]/10 to-blue-600/10 p-8">
               <h3 className="mb-4 text-xl font-bold text-white">Emergency Contact</h3>
               {editMode ? (
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Contact Name</label>
                     <input
                       type="text"
                       name="emergencyContactName"
                       value={formData.emergencyContactName || ""}
                       onChange={handleChange}
                       className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-[#4fd1c5]"
                     />
                   </div>
                   <div>
                     <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Contact Phone</label>
                     <input
                       type="text"
                       name="emergencyContactPhone"
                       value={formData.emergencyContactPhone || ""}
                       onChange={handleChange}
                       className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-[#4fd1c5]"
                     />
                   </div>
                 </div>
               ) : (
                 <div className="space-y-2">
                   <p className="text-lg font-bold text-white">{patient.emergencyContactName || "Not specified"}</p>
                   <p className="text-slate-400 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     {patient.emergencyContactPhone || "—"}
                   </p>
                 </div>
               )}
            </div>
          </aside>

          {/* Main Form Area */}
          <section className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur-xl">
               <h3 className="mb-8 text-2xl font-bold text-white flex items-center gap-3">
                 <span className="h-8 w-1 bg-[#4fd1c5] rounded-full"></span>
                 Personal Information
               </h3>

               <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">First Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition"
                      />
                    ) : (
                      <p className="mt-2 text-xl font-medium text-white">{patient.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Last Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition"
                      />
                    ) : (
                      <p className="mt-2 text-xl font-medium text-white">{patient.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Date of Birth</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth || ""}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition [color-scheme:dark]"
                      />
                    ) : (
                      <p className="mt-2 text-xl font-medium text-white">{patient.dateOfBirth || "—"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Gender</label>
                    {editMode ? (
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="mt-2 text-xl font-medium text-white">{patient.gender || "—"}</p>
                    )}
                  </div>
               </div>

               <div className="mt-12 h-px bg-white/5" />

               <h3 className="my-8 text-2xl font-bold text-white flex items-center gap-3">
                 <span className="h-8 w-1 bg-[#4fd1c5] rounded-full"></span>
                 Contact Details
               </h3>

               <div className="grid gap-x-8 gap-y-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Email Address</label>
                      <p className="mt-2 text-xl font-medium text-slate-400 italic">
                        {patient.email} 
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded text-slate-500 not-italic">Identity</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Phone Number</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber || ""}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition"
                        />
                      ) : (
                        <p className="mt-2 text-xl font-medium text-white">{patient.phoneNumber || "—"}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Home Address</label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        rows={3}
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-4 text-white outline-none focus:border-[#4fd1c5] transition resize-none"
                      />
                    ) : (
                      <p className="mt-2 text-xl font-medium text-white leading-relaxed">{patient.address || "No address provided"}</p>
                    )}
                  </div>
               </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
