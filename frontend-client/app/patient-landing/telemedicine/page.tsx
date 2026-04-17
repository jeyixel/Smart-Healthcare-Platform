"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPatientByEmail } from "@/lib/api";
import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

export default function PatientTelemedicinePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TelemedicineSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email");
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");

    if (!token || role !== "PATIENT" || !email) {
      router.push("/login");
      return;
    }
    
    setUserEmail(email);
    loadSessions(email, token);
  }, [router]);

  async function loadSessions(email: string, token: string) {
    try {
      setLoading(true);
      setError(null);
      const patient = await fetchPatientByEmail(token, email);

      const res = await fetch(`http://localhost:8080/api/v1/telemedicine/sessions/patient/${patient.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch telemedicine sessions");
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
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-700">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Virtual Clinic</h1>
            <p className="text-slate-500 mt-1 font-medium">Join your scheduled video consultations and view session history</p>
          </div>
          <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse"></div>
             <span className="text-sm font-bold text-[#06b6d4] uppercase tracking-widest">System Ready</span>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 flex items-center gap-3 shadow-sm">
             <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <p><span className="font-bold underline">Error:</span> {error}</p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Your Telemedicine Sessions</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Access your virtual clinic meetings below.</p>
          </div>
          
          {sessions.length === 0 && !error ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400 border border-slate-100 shadow-inner">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Sessions Found</h3>
              <p className="text-slate-500 max-w-sm">When you book an online appointment, your virtual meeting links will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <li key={session.sessionId} className="p-8 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4] group-hover:bg-[#06b6d4] group-hover:text-white transition-all duration-300">
                         <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">
                          Consultation #{session.appointmentId.substring(0, 8).toUpperCase()}
                        </h4>
                        <div className="mt-1.5 flex items-center gap-4 text-sm font-semibold">
                          <span className={`px-2 py-0.5 rounded-lg border uppercase text-[10px] tracking-widest ${
                            session.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                             {session.status || 'PENDING'}
                          </span>
                          <span className="text-slate-400">
                             Created {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {session.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => router.push(`/telemedicine?appointmentId=${session.appointmentId}`)}
                          className="flex items-center gap-2 rounded-2xl bg-[#06b6d4] px-6 py-3 font-bold text-white shadow-lg shadow-[#06b6d4]/30 transition hover:scale-[1.03] active:scale-95"
                        >
                          Join Video Call
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-500 border border-slate-200">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           Session Ended
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
