"use client";

import { useMemo, useState } from "react";
import AppointmentSummaryCard from "@/app/components/telemedicine/AppointmentSummaryCard";
import JitsiVideoCall from "@/app/components/telemedicine/JitsiVideoCall";
import MedicalHistoryList from "@/app/components/telemedicine/MedicalHistoryList";
import ParticipantDetailsCard from "@/app/components/telemedicine/ParticipantDetailsCard";
import { fetchSessionByAppointmentId } from "@/app/lib/telemedicine/api";
import {
  getMockSessionUser,
  MOCK_APPOINTMENT,
  MOCK_DOCTOR,
  MOCK_PATIENT,
} from "@/app/lib/telemedicine/mocks";

export default function TelemedicinePage() {
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = useMemo(() => getMockSessionUser(), []);

  const userDisplayName =
    user.role === "DOCTOR" ? `${MOCK_DOCTOR.fullName} (Doctor)` : `${MOCK_PATIENT.fullName} (Patient)`;
  const joinDisabled = MOCK_APPOINTMENT.status !== "CONFIRMED";

  const handleJoinMeeting = async () => {
    if (joinDisabled) {
      return;
    }

    try {
      setIsJoining(true);
      setErrorMessage(null);
      const session = await fetchSessionByAppointmentId(MOCK_APPOINTMENT.id);
      setMeetingUrl(session.meetingUrl);
    } catch (error) {
      const fallbackMessage = "Unable to join meeting right now. Please try again.";
      setErrorMessage(error instanceof Error ? error.message : fallbackMessage);
    } finally {
      setIsJoining(false);
    }
  };

  if (meetingUrl) {
    return <JitsiVideoCall meetingUrl={meetingUrl} userName={userDisplayName} />;
  }

  return (
    <main className="min-h-screen bg-[#f9f9ff] px-4 py-8 text-[#181c21] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-xl bg-[#f2f3fc] p-6">
          <p className="text-sm text-[#4f5c6a]">Telemedicine</p>
          <h1 className="mt-2 text-3xl font-semibold">Appointments</h1>
          <p className="mt-2 text-sm text-[#4f5c6a]">
            Role is currently mocked from local session constant: <strong>{user.role}</strong>
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <AppointmentSummaryCard
            appointment={MOCK_APPOINTMENT}
            onJoin={handleJoinMeeting}
            joining={isJoining}
            joinDisabled={joinDisabled}
          />

          <div className="space-y-6">
            <ParticipantDetailsCard role={user.role} doctor={MOCK_DOCTOR} patient={MOCK_PATIENT} />
            {user.role === "DOCTOR" ? <MedicalHistoryList history={MOCK_PATIENT.medicalHistory} /> : null}
          </div>
        </div>

        {errorMessage ? (
          <section className="rounded-xl bg-[#fdecea] p-4 text-sm text-[#8a1c1c]">{errorMessage}</section>
        ) : null}
      </div>
    </main>
  );
}

