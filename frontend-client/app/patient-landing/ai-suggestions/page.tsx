"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
import { fetchPatientByEmail } from "@/lib/api";

export default function PatientAISuggestionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const router = useRouter();

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const token = localStorage.getItem("smart_admin_token");
      const email = localStorage.getItem("smart_admin_email");
      if (!token || !email) {
        setError("You must be logged in to view AI suggestions.");
        setLoading(false);
        return;
      }

      // Get patientId from backend using email
      const patient = await fetchPatientByEmail(token, email);
      if (!patient || !patient.id) {
        setError("Unable to resolve patient identity.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to generate suggestions.");
      } else {
        setSuggestions(data.suggestions || null);
      }
    } catch (err: any) {
      setError(err?.message || "Unexpected error while fetching suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <>
      <PatientNavbar />
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Health Suggestions</h1>
            <p className="text-sm text-slate-600 mt-1">Personalized preliminary tips generated from your recent medical history.</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            {loading ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-600">Generating suggestions...</p>
              </div>
            ) : error ? (
              <div>
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
                <div className="flex gap-2">
                  <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => fetchSuggestions()}>Retry</button>
                  <button className="rounded bg-slate-200 px-4 py-2" onClick={() => router.back()}>Back</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="prose max-w-none whitespace-pre-wrap text-slate-800">{suggestions}</div>
                <div className="mt-6 flex gap-3">
                  <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => fetchSuggestions()}>Regenerate</button>
                  <button className="rounded bg-slate-200 px-4 py-2" onClick={() => router.back()}>Back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

