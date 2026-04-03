import type { TelemedicineSessionResponse } from "@/app/types/telemedicine";

const TELEMEDICINE_BASE_URL = "http://localhost:8085/api/telemedicine/sessions";

export async function fetchSessionByAppointmentId(
  appointmentId: string,
): Promise<TelemedicineSessionResponse> {
  const response = await fetch(
    `${TELEMEDICINE_BASE_URL}/appointment/${encodeURIComponent(appointmentId)}`,
    {
      method: "GET",
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

