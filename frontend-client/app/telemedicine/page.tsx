"use client";

import { useEffect, useState, Suspense } from "react";
import AppointmentSummaryCard from "@/app/components/telemedicine/AppointmentSummaryCard";
import JitsiVideoCall from "@/app/components/telemedicine/JitsiVideoCall";
import MedicalHistoryList from "@/app/components/telemedicine/MedicalHistoryList";
import ParticipantDetailsCard from "@/app/components/telemedicine/ParticipantDetailsCard";
import { fetchSessionByAppointmentId } from "@/app/lib/telemedicine/api";
import { useSearchParams } from "next/navigation";
import {
  MOCK_DOCTOR,
  MOCK_PATIENT,
} from "@/app/lib/telemedicine/mocks";
import { useRouter } from "next/navigation";

function TelemedicineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawId = searchParams.get("appointmentId");
  
  // Try to use the actual ID; we'll handle redirection in a useEffect if it's missing
  const appointmentId = rawId || "";

  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>("GUEST");
  const [appointmentData, setAppointmentData] = useState<any>({
    id: appointmentId,
    status: "CONFIRMED",
    reason: "General Consultation",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: new Date().toTimeString().split("T")[0],
  });

  // Check for JWT token in local storage on mount
  useEffect(() => {
    if (!rawId) {
      // Redirect back to dashboard if no appointment ID is provided
      const role = localStorage.getItem("smart_admin_role") || "PATIENT";
      if (role === "DOCTOR") {
        router.push("/doctor");
      } else {
        router.push("/patient");
      }
      return;
    }

    const token = localStorage.getItem("smart_admin_token");
    const role = localStorage.getItem("smart_admin_role") || "PATIENT";
    setHasToken(!!token);
    setUserRole(role);

    // Optionally we could fetch real appointment details here using fetch(/api/v1/appointments/${appointmentId})
    if (token && rawId) {
      const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";
      fetch(`${API_GATEWAY}/api/v1/appointments/${rawId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setAppointmentData(data);
        }
      })
      .catch(err => console.error("Failed to load appointment data:", err));
    }
  }, [rawId, router]);

  const userDisplayName =
    userRole === "DOCTOR" ? `${MOCK_DOCTOR.fullName} (Doctor)` : `${MOCK_PATIENT.fullName} (Patient)`;
  const joinDisabled = appointmentData.status !== "CONFIRMED" && appointmentData.status !== "SCHEDULED";

  const handleJoinMeeting = async () => {
    if (joinDisabled) {
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage(null);
      const session = await fetchSessionByAppointmentId(appointmentId);
      setSessionId(session.sessionId);
      setMeetingUrl(session.meetingUrl);
    } catch (error) {
      const fallbackMessage = `Unable to join meeting right now for appointment ${appointmentId}. Please try again.`;
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsJoining(false);
    }
  };

  if (meetingUrl && sessionId) {
    return <JitsiVideoCall meetingUrl={meetingUrl} userName={userDisplayName} sessionId={sessionId} />;
  }

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-8 text-[#181c21] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl bg-[#f2f3fc] p-6">
          <p className="text-sm text-[#4f5c6a]">Telemedicine</p>
          <h1 className="mt-2 text-3xl font-semibold">Appointment: {appointmentId}</h1>
          <p className="mt-2 text-sm text-[#4f5c6a]">
            Role is currently resolved from auth session: <strong>{userRole}</strong>
          </p>
        </header>

        {!hasToken && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <strong>Warning:</strong> No account token found. Please log in first natively to continue.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <AppointmentSummaryCard
            appointment={appointmentData}
            onJoin={handleJoinMeeting}
            joining={isJoining}
            joinDisabled={joinDisabled}
          />

          <div className="space-y-6">
            <ParticipantDetailsCard 
              role={userRole as any} 
              doctor={appointmentData.doctor || MOCK_DOCTOR} 
              patient={appointmentData.patient || MOCK_PATIENT} 
            />
            {userRole === "DOCTOR" ? <MedicalHistoryList history={appointmentData.patient?.medicalHistory || MOCK_PATIENT.medicalHistory} /> : null}
          </div>
        </div>

        {errorMessage ? (
          <section className="rounded-xl bg-[#fdecea] p-4 text-sm text-[#8a1c1c]">{errorMessage}</section>
        ) : null}
      </div>
    </main>
  );
}

export default function TelemedicinePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading session...</div>}>
      <TelemedicineContent />
    </Suspense>
  );
}
