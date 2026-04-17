import {
  AuthResponse,
  CurrentUserProfile,
  DoctorApprovalItem,
  ForgotPasswordOtpInput,
  ForgotPasswordResetInput,
  LoginInput,
  Patient,
  PatientEvent,
  RegisterInput,
  NotificationLog,
} from "@/types/api";

// API Gateway - Routes all requests through a single endpoint
// The gateway (port 8080) automatically routes based on path patterns:
// - /api/v1/auth/** → Auth Service (8087)
// - /api/v1/admin/** → Admin Service (8087)
// - /api/v1/patients/** → Patient Service (8081)
// - /api/v1/doctors/** → Doctor Service (8082)
// - /api/v1/appointments/** → Appointment Service (8083)
// - /api/v1/prescriptions/** → Prescription Service (8088)
// - /api/notifications/** → Notification Service (8086)
const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://localhost:8080";

async function safeJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();

    try {
      const parsed = JSON.parse(body) as { message?: string; error?: string };
      const message = parsed.message ?? parsed.error;
      throw new Error(message || `Request failed with status ${response.status}`);
    } catch {
      throw new Error(body || `Request failed with status ${response.status}`);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload !== null &&
    typeof payload === "object" &&
    "value" in payload &&
    Array.isArray((payload as { value: unknown }).value)
  ) {
    return (payload as { value: T[] }).value;
  }

  return [];
}

export async function registerAdmin(input: RegisterInput): Promise<AuthResponse> {
  const response = await fetch(`${API_GATEWAY}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<AuthResponse>(response);
}

export async function loginAdmin(input: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${API_GATEWAY}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<AuthResponse>(response);
}

export async function requestPasswordOtp(input: ForgotPasswordOtpInput): Promise<{ message: string }> {
  const response = await fetch(`${API_GATEWAY}/api/v1/auth/forgot-password/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<{ message: string }>(response);
}

export async function resetForgotPassword(input: ForgotPasswordResetInput): Promise<{ message: string }> {
  const response = await fetch(`${API_GATEWAY}/api/v1/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<{ message: string }>(response);
}

export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients`, {
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<Patient>(payload);
}

export async function updatePatientStatus(
  token: string,
  patientId: string,
  active: boolean,
  adminUserHeader: string,
): Promise<Patient> {
  const url = new URL(`${API_GATEWAY}/api/v1/admin/patients/${patientId}/status`);
  url.searchParams.set("active", String(active));

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Admin-User": adminUserHeader,
    },
  });

  return safeJson<Patient>(response);
}

export async function fetchPatientEvents(): Promise<PatientEvent[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patient-events`, {
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<PatientEvent>(payload);
}

export async function fetchPendingDoctors(token: string): Promise<DoctorApprovalItem[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/admin/doctors/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return safeJson<DoctorApprovalItem[]>(response);
}

export async function approveDoctor(token: string, doctorId: number): Promise<DoctorApprovalItem> {
  const response = await fetch(`${API_GATEWAY}/api/v1/admin/doctors/${doctorId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return safeJson<DoctorApprovalItem>(response);
}

export async function fetchPatientByEmail(email: string): Promise<Patient> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/email/${email}`, {
    cache: "no-store",
  });

  return safeJson<Patient>(response);
}

export async function updatePatientProfile(id: string, data: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return safeJson<Patient>(response);
}

export async function fetchCurrentUser(token: string): Promise<CurrentUserProfile> {
  const response = await fetch(`${API_GATEWAY}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return safeJson<CurrentUserProfile>(response);
}

export async function fetchNotifications(recipient: string): Promise<NotificationLog[]> {
  const response = await fetch(`${API_GATEWAY}/api/notifications/logs/${recipient}`, {
    cache: "no-store",
  });

  return safeJson<NotificationLog[]>(response);
}
