"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPatientByEmail } from "@/lib/api";

interface TelemedicineSession {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomName: string;
  meetingUrl: string;
  status: string;
  createdAt: string;
}

export default function PatientTelemedicinePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
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
      // 1. Get the patient profile to retrieve the patientId
      const patient = await fetchPatientByEmail(email);
      
      // 2. Fetch the telemedicine sessions from the gateway
      const res = await fetch(`http://localhost:8080/api/v1/telemedicine/sessions/patient/${patient.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch your telemedicine sessions");
      }

      const data: TelemedicineSession[] = await res.json();
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-yellow-100 p-4">
            <svg className="h-8 w-8 animate-spin text-yellow-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Consultations</h1>
              <p className="mt-1 text-slate-600">{userEmail}</p>
            </div>
            <button
              onClick={() => router.push('/patient')}
              className="rounded-lg bg-slate-200 px-6 py-2 font-semibold text-slate-700 transition hover:bg-slate-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Your Telemedicine Sessions</h3>
            <p className="mt-1 text-sm text-slate-500">View and join your virtual clinic meetings here.</p>
          </div>
          
          {sessions.length === 0 && !error ? (
            <div className="p-8 text-center text-slate-500">
              No consultations found. When you book an online appointment, it will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {sessions.map((session) => (
                <li key={session.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-slate-900">
                        Appointment #{session.appointmentId.substring(0, 8).toUpperCase()}
                      </h4>
                      <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                        <span>
                           Status: <strong className={session.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}>{session.status || 'PENDING'}</strong>
                        </span>
                        <span>
                           Created: {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {session.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => router.push(`/telemedicine?appointmentId=${session.appointmentId}`)}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Call
                        </button>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                          Complete
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
    </main>
  );
}
