"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPatientByEmail } from "@/lib/api";

interface PatientSession {
  email: string;
  role: string;
  token: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<PatientSession | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Suggestion State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGetAiSuggestions = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      if (!session || !session.email || !session.token) {
        throw new Error("Session information is missing.");
      }
      
      const patientProfile = await fetchPatientByEmail(session.email);
      if (!patientProfile || !patientProfile.id) {
         throw new Error("Could not retrieve patient profile.");
      }
      const patientId = patientProfile.id;
      
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, token: session.token }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
         throw new Error(data.error || "Failed to fetch AI suggestions.");
      }
      
      setAiTips(data.suggestions);
      
    } catch (error: any) {
      console.error("Error fetching AI suggestions:", error);
      setAiError(error.message || "An unexpected error occurred.");
    } finally {
      setIsAiLoading(false);
    }
  };

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
            <button 
              onClick={handleGetAiSuggestions}
              className="mt-4 inline-block rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700">
              Get AI Suggestions
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl flex flex-col max-h-[80vh] border justify-between border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                AI Health Suggestions
              </h3>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 styled-scrollbar">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-xl bg-pink-200 opacity-50 animate-pulse"></div>
                    <svg className="relative h-12 w-12 animate-spin text-pink-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <p className="font-medium animate-pulse text-lg">Analyzing your medical history...</p>
                  <p className="text-sm mt-2 text-slate-400">Our AI is generating personalized tips</p>
                </div>
              ) : aiError ? (
                <div className="rounded-xl bg-red-50 p-5 text-red-600 border border-red-100">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-bold text-lg">Could not generate suggestions</p>
                  </div>
                  <p className="text-red-500 ml-9">{aiError}</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {aiTips}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-5 border-t border-slate-100 flex justify-end">
               <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-6 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200"
               >
                 Close Suggestions
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
