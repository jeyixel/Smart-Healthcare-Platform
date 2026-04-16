"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PatientSession {
  email: string;
  role: string;
  token: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<PatientSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role");
    const email = localStorage.getItem("smart_admin_email");

    if (!token || role !== "PATIENT") {
      router.push("/login");
      return;
    }

    setSession({ email: email || "", role: role || "", token });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("smart_admin_token");
    localStorage.removeItem("smart_admin_role");
    localStorage.removeItem("smart_admin_email");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-blue-100 p-4">
            <svg className="h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
              <p className="mt-1 text-slate-600">{session.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Records Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Health Records</h3>
            <p className="mt-2 text-slate-600">View your medical history and reports</p>
            <button className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
              View Records
            </button>
          </div>

          {/* Appointments Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Appointments</h3>
            <p className="mt-2 text-slate-600">Book and manage your appointments</p>
            <button className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700">
              Schedule Appointment
            </button>
          </div>

          {/* Prescriptions Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Prescriptions</h3>
            <p className="mt-2 text-slate-600">View your active prescriptions</p>
            <button className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700">
              View Prescriptions
            </button>
          </div>

          {/* Telemedicine Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Telemedicine</h3>
            <p className="mt-2 text-slate-600">Connect with doctors online</p>
            <button 
              onClick={() => router.push('/patient/telemedicine')}
              className="mt-4 inline-block rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition hover:bg-yellow-700">
              Manage Consultations
            </button>
          </div>

          {/* Lab Results Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Lab Results</h3>
            <p className="mt-2 text-slate-600">Check your test results</p>
            <button className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700">
              View Results
            </button>
          </div>

          {/* Health Tips Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-pink-100 p-3">
              <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Health Tips</h3>
            <p className="mt-2 text-slate-600">Get personalized health recommendations</p>
            <button className="mt-4 inline-block rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700">
              Read Tips
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
