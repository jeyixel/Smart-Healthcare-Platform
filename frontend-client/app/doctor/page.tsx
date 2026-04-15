"use client";

import { fetchCurrentUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DoctorSession {
  email: string;
  role: string;
  token: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyDoctorAccess = async () => {
      const token = localStorage.getItem("smart_admin_token");
      const role = localStorage.getItem("smart_admin_role");

      if (!token || role !== "DOCTOR") {
        router.push("/login");
        return;
      }

      try {
        const profile = await fetchCurrentUser(token);
        if (profile.role !== "DOCTOR" || !profile.approved) {
          localStorage.removeItem("smart_admin_token");
          localStorage.removeItem("smart_admin_role");
          localStorage.removeItem("smart_admin_email");
          router.push("/login");
          return;
        }

        localStorage.setItem("smart_admin_email", profile.email);
        setSession({ email: profile.email, role: profile.role, token });
      } catch {
        localStorage.removeItem("smart_admin_token");
        localStorage.removeItem("smart_admin_role");
        localStorage.removeItem("smart_admin_email");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    void verifyDoctorAccess();
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
              <h1 className="text-3xl font-bold text-slate-900">Doctor Dashboard</h1>
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
          {/* Appointments Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Appointments</h3>
            <p className="mt-2 text-slate-600">View and manage your appointments</p>
            <button className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
              View Appointments
            </button>
          </div>

          {/* Patients Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">My Patients</h3>
            <p className="mt-2 text-slate-600">Access your patient list and records</p>
            <button className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700">
              View Patients
            </button>
          </div>

          {/* Prescriptions Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Prescriptions</h3>
            <p className="mt-2 text-slate-600">Create and manage prescriptions</p>
            <button className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700">
              View Prescriptions
            </button>
          </div>

          {/* Consultations Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Telemedicine</h3>
            <p className="mt-2 text-slate-600">Start video consultations</p>
            <button className="mt-4 inline-block rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition hover:bg-yellow-700">
              Start Consultation
            </button>
          </div>

          {/* Schedule Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Schedule</h3>
            <p className="mt-2 text-slate-600">Manage your availability</p>
            <button className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700">
              Edit Schedule
            </button>
          </div>

          {/* Reports Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition">
            <div className="mb-4 inline-block rounded-lg bg-pink-100 p-3">
              <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Reports</h3>
            <p className="mt-2 text-slate-600">View analytics and reports</p>
            <button className="mt-4 inline-block rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
