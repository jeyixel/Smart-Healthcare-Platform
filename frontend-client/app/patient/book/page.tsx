"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchActiveDoctors, fetchPatientByEmail, createAppointment } from "@/lib/api";
import { DoctorSearchResponse, Patient } from "@/types/api";
import Link from "next/link";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [doctors, setDoctors] = useState<DoctorSearchResponse[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState("");

  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "PHYSICAL",
    reason: "",
  });

  useEffect(() => {
    async function loadData() {
      const storedToken = localStorage.getItem("smart_admin_token");
      const role = localStorage.getItem("smart_admin_role");
      const email = localStorage.getItem("smart_admin_email");

      if (!storedToken || role !== "PATIENT" || !email) {
        router.push("/login?role=PATIENT");
        return;
      }

      setToken(storedToken);

      try {
        // Fetch patient profile to get the UUID patientId
        const patientData = await fetchPatientByEmail(storedToken, email);
        setPatient(patientData);

        // Fetch active doctors
        const docs = await fetchActiveDoctors(storedToken);
        setDoctors(docs);
      } catch (err: any) {
        setError(err.message || "Failed to load booking data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    
    setSubmitting(true);
    setError("");

    try {
      // Append seconds if not present
      let time = formData.appointmentTime;
      if (time && time.length === 5) {
        time = `${time}:00`;
      }

      await createAppointment(token, {
        patientId: patient.id,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: time,
        consultationType: formData.consultationType as "PHYSICAL" | "VIRTUAL",
        reason: formData.reason,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/patient");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to book appointment.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 selection:bg-[#4fd1c5]/30 pb-12">
      {/* Reusing Patient Navbar for consistent layout */}
      <div className="fixed top-0 left-0 right-0 z-50">
         <Link href="/patient" className="absolute top-6 left-6 text-[#4fd1c5] hover:text-white font-bold flex items-center gap-2 transition bg-[#0a0f1c]/50 px-4 py-2 rounded-full border border-[#4fd1c5]/30 backdrop-blur-md z-50">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           Back to Dashboard
         </Link>
      </div>

      <main className="mx-auto max-w-3xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="mb-8 text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Book an Appointment</h1>
          <p className="text-lg text-slate-400">Schedule a consultation with our world-class specialists</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-linear-to-br from-[#4fd1c5]/20 to-blue-600/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative">
            {error && (
              <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400 animate-in fade-in slide-in-from-top-4">
                <span className="font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Error:
                </span> 
                <span className="block mt-1">{error}</span>
              </div>
            )}

            {success ? (
              <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold text-white">Booking Confirmed!</h3>
                <p className="mt-3 text-lg text-slate-300">Your appointment has been successfully scheduled.</p>
                <div className="mt-8 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4fd1c5] border-t-transparent"></div>
                </div>
                <p className="mt-4 text-sm font-bold tracking-widest text-[#4fd1c5] uppercase">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="doctorId" className="block text-xs uppercase tracking-widest font-bold text-[#4fd1c5] mb-3">
                    Select Specialist
                  </label>
                  <div className="relative">
                    <select
                      id="doctorId"
                      name="doctorId"
                      required
                      value={formData.doctorId}
                      onChange={handleChange}
                      className="block w-full appearance-none rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-sm focus:border-[#4fd1c5] focus:ring-[#4fd1c5] focus:outline-none transition-colors [&>option]:bg-[#0a0f1c] [&>option]:text-white"
                    >
                      <option value="">-- Choose a Doctor --</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.fullName} - {doc.specialty} (${doc.consultationFee})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="appointmentDate" className="block text-xs uppercase tracking-widest font-bold text-[#4fd1c5] mb-3">
                      Date
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-sm focus:border-[#4fd1c5] focus:ring-[#4fd1c5] focus:outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label htmlFor="appointmentTime" className="block text-xs uppercase tracking-widest font-bold text-[#4fd1c5] mb-3">
                      Time
                    </label>
                    <input
                      type="time"
                      id="appointmentTime"
                      name="appointmentTime"
                      required
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-sm focus:border-[#4fd1c5] focus:ring-[#4fd1c5] focus:outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="consultationType" className="block text-xs uppercase tracking-widest font-bold text-[#4fd1c5] mb-3">
                    Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer rounded-2xl border ${formData.consultationType === 'PHYSICAL' ? 'border-[#4fd1c5] bg-[#4fd1c5]/10 shadow-[0_0_15px_rgba(79,209,197,0.15)]' : 'border-white/10 bg-white/5 hover:bg-white/10'} p-4 flex flex-col items-center justify-center gap-3 transition-all`}>
                      <input type="radio" name="consultationType" value="PHYSICAL" checked={formData.consultationType === 'PHYSICAL'} onChange={handleChange} className="sr-only" />
                      <div className={`p-3 rounded-full ${formData.consultationType === 'PHYSICAL' ? 'bg-[#4fd1c5] text-[#0a0f1c]' : 'bg-white/10 text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <span className={`font-bold ${formData.consultationType === 'PHYSICAL' ? 'text-[#4fd1c5]' : 'text-slate-300'}`}>Physical Visit</span>
                    </label>
                    <label className={`cursor-pointer rounded-2xl border ${formData.consultationType === 'VIRTUAL' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10 bg-white/5 hover:bg-white/10'} p-4 flex flex-col items-center justify-center gap-3 transition-all`}>
                      <input type="radio" name="consultationType" value="VIRTUAL" checked={formData.consultationType === 'VIRTUAL'} onChange={handleChange} className="sr-only" />
                      <div className={`p-3 rounded-full ${formData.consultationType === 'VIRTUAL' ? 'bg-blue-500 text-[#0a0f1c]' : 'bg-white/10 text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <span className={`font-bold ${formData.consultationType === 'VIRTUAL' ? 'text-blue-400' : 'text-slate-300'}`}>Virtual Consult</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-xs uppercase tracking-widest font-bold text-[#4fd1c5] mb-3">
                    Reason for Visit
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={4}
                    maxLength={500}
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Briefly describe your symptoms or reason for consulting the doctor."
                    className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-sm focus:border-[#4fd1c5] focus:ring-[#4fd1c5] focus:outline-none transition-colors resize-none placeholder:text-slate-500"
                  />
                  <div className="mt-2 text-right">
                    <span className="text-xs text-slate-500">{formData.reason.length} / 500 characters</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#4fd1c5] px-8 py-5 text-lg font-bold text-[#0a0f1c] shadow-[0_0_20px_rgba(79,209,197,0.3)] transition-all hover:bg-[#3dbdb0] hover:shadow-[0_0_30px_rgba(79,209,197,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer filter blur-sm"></div>
                    {submitting ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#0a0f1c] border-t-transparent"></div>
                        <span>Processing Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Appointment Reservation</span>
                        <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
