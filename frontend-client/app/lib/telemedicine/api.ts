import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

const TELEMEDICINE_BASE_URL = "http://localhost:8080/api/v1/telemedicine/sessions";

export async function fetchSessionByAppointmentId(
  appointmentId: string,
): Promise<TelemedicineSessionResponse> {
  const token = typeof window !== "undefined" ? localStorage.getItem("smart_admin_token") : "";
  const response = await fetch(
    `${TELEMEDICINE_BASE_URL}/appointment/${encodeURIComponent(appointmentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Meeting link not found for this appointment yet."
        : "Failed to load meeting details.",
    );
  }

  return (await response.json()) as TelemedicineSessionResponse;
}

export async function completeSession(sessionId: string): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("smart_admin_token") : "";
  const response = await fetch(
    `${TELEMEDICINE_BASE_URL}/${encodeURIComponent(sessionId)}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark session as completed.");
  }
}
