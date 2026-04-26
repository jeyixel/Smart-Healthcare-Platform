"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPatientByEmail } from "@/lib/api";
import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

export function PatientTelemedicineContent() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TelemedicineSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("smart_admin_email");
    const token = localStorage.getItem("smart_admin_token");

    if (email && token) {
      loadSessions(email, token);
    }
  }, []);

  async function loadSessions(email: string, token: string) {
    try {
      setLoading(true);
      setError(null);
      const patient = await fetchPatientByEmail(token, email);
      const res = await fetch(`${API_GATEWAY}/api/v1/telemedicine/sessions/patient/${patient.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data: TelemedicineSessionResponse[] = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#06b6d4] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Virtual Consultations</h3>
          <p className="mt-1 text-sm text-slate-500">Access your past and upcoming telemedicine appointments.</p>
        </div>
        
        {sessions.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            No consultations found. Book an online appointment to see it here.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <li key={session.sessionId} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase">
                        Appointment #{session.appointmentId.substring(0, 8).toUpperCase()}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    {session.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => router.push(`/telemedicine?appointmentId=${session.appointmentId}`)}
                        className="rounded-xl bg-[#06b6d4] px-5 py-2.5 font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition hover:bg-[#0891b2] active:scale-95"
                      >
                        Join Session
                      </button>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        Completed
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
  );
}
