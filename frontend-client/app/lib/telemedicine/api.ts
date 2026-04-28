import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";
const TELEMEDICINE_BASE_URL = `${API_GATEWAY}/api/v1/telemedicine/sessions`;

function requireClientToken(): string {
  const token = typeof window !== "undefined" ? localStorage.getItem("smart_admin_token") : null;
  if (!token || token.trim().length === 0) {
    throw new Error("Authentication required. Please sign in again.");
  }
  return token;
}

export async function fetchSessionByAppointmentId(
  appointmentId: string,
): Promise<TelemedicineSessionResponse> {
  const token = requireClientToken();
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
  const token = requireClientToken();
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
