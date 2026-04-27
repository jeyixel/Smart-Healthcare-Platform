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
  AdminAppointment,
  DashboardSummary,
  SystemEvent,
  PaymentAnalysis,
  DailyRevenue,
  MedicalHistory,
  DoctorSearchResponse,
  CreateAppointmentRequest,
  AppointmentResponse,
  PrescriptionResponse,
  CreateDoctorRequest,
  PatientUpsertRequest,
  MedicationReminder,
  MedicalReportCreateRequest,
  MedicalReportResponse,
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
const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_BASE ?? "http://127.0.0.1:8080";
const ADMIN_API = API_GATEWAY;

export interface DoctorProfile {
  id: string;
  userId: number;
  email: string;
}

async function safeJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    let parsedMessage: string | undefined;

    try {
      const parsed = JSON.parse(body) as {
        title?: string;
        detail?: string;
        message?: string;
        error?: string;
      };

      const detail = parsed.detail ?? parsed.message ?? parsed.error;
      parsedMessage = parsed.title && detail ? `${parsed.title}: ${detail}` : detail;
    } catch {
      parsedMessage = undefined;
    }

    throw new Error(parsedMessage || body || `Request failed with status ${response.status}`);
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

  if (payload !== null && typeof payload === "object") {
    const wrapped = payload as Record<string, unknown>;
    const candidates = ["value", "data", "content", "items", "results"];

    for (const key of candidates) {
      if (Array.isArray(wrapped[key])) {
        return wrapped[key] as T[];
      }
    }
  }

  return [];
}

function extractFirstObjectArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload !== null && typeof payload === "object") {
    const values = Object.values(payload as Record<string, unknown>);
    for (const value of values) {
      if (Array.isArray(value)) {
        return value as T[];
      }
      const nested = extractFirstObjectArray<T>(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

export async function registerAdmin(input: RegisterInput): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_GATEWAY}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      mode: "cors",
    });
    return safeJson<AuthResponse>(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes("fetch")) {
      throw new Error("Failed to connect to Auth Service. Please ensure the API Gateway and Auth Service are running.");
    }
    throw error;
  }
}

export async function loginAdmin(input: LoginInput): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_GATEWAY}/api/v1/auth/login`, {
      method: "POST",
      mode: "cors",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(input),
    });
    return safeJson<AuthResponse>(response);
  } catch (error) {
    if (error instanceof Error && (error.message.includes("fetch") || error.message.includes("Failed to fetch"))) {
      throw new Error("Network error: Unable to reach the Gateway at " + API_GATEWAY + ". Please ensure the Gateway is running and CORS is allowed. If you're on a VPN or Proxy, please disable it.");
    }
    throw error;
  }
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

export async function fetchPatients(token: string): Promise<Patient[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients`, {
    headers: {
       Authorization: `Bearer ${token}`,
    },
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

export async function fetchPatientEvents(token: string): Promise<PatientEvent[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patient-events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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


export async function fetchPatientByEmail(token: string, email: string): Promise<Patient> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/email/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<Patient>(response);
}

export async function fetchDoctorByEmail(token: string, email: string): Promise<DoctorProfile> {
  const response = await fetch(`${API_GATEWAY}/api/v1/doctors/email/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return safeJson<DoctorProfile>(response);
}

export async function fetchDoctorByUserId(token: string, userId: number): Promise<DoctorProfile> {
  const response = await fetch(`${API_GATEWAY}/api/v1/doctors/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return safeJson<DoctorProfile>(response);
}

export async function updatePatientProfile(token: string, id: string, data: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
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

export async function fetchNotifications(token: string): Promise<NotificationLog[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/notifications/logs/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<NotificationLog[]>(response);
}

export async function fetchAdminAppointments(token: string): Promise<AdminAppointment[]> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<AdminAppointment[]>(response);
}

export async function updateAppointmentStatus(
  token: string,
  appointmentId: string,
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED"
): Promise<AdminAppointment> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/appointments/${appointmentId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return safeJson<AdminAppointment>(response);
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/analytics/dashboard-summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<DashboardSummary>(response);
}

export async function fetchRecentEvents(token: string): Promise<SystemEvent[]> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/analytics/recent-events`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<SystemEvent[]>(response);
}

export async function fetchPatientMedicalHistory(
  token: string,
  patientId: string,
): Promise<MedicalHistory[]> {
  const response = await fetch(
    `${API_GATEWAY}/api/v1/patients/${patientId}/medical-histories`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<MedicalHistory>(payload);
}

export async function fetchNotificationLogs(token: string): Promise<NotificationLog[]> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<NotificationLog[]>(response);
}

export async function fetchActiveDoctors(token: string): Promise<DoctorSearchResponse[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  const parsedDoctors = normalizeListResponse<DoctorSearchResponse>(payload);
  return parsedDoctors.length > 0 ? parsedDoctors : extractFirstObjectArray<DoctorSearchResponse>(payload);
}

export async function createAppointment(token: string, data: CreateAppointmentRequest): Promise<AppointmentResponse> {
  const response = await fetch(`${API_GATEWAY}/api/v1/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return safeJson<AppointmentResponse>(response);
}

export async function fetchPatientPrescriptions(token: string, patientId: string): Promise<PrescriptionResponse[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/prescriptions/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<PrescriptionResponse>(payload);
}

export async function fetchPaymentAnalysis(token: string): Promise<PaymentAnalysis> {
  const response = await fetch(`${ADMIN_API}/api/v1/admin/analytics/payment-analysis`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return safeJson<PaymentAnalysis>(response);
}

export async function createDoctorProfile(token: string, data: CreateDoctorRequest): Promise<void> {
  const response = await fetch(`${API_GATEWAY}/api/v1/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return safeJson<void>(response);
}

export async function createPatientProfile(token: string, data: PatientUpsertRequest): Promise<void> {
  let patientId = null;
  try {
    const getResponse = await fetch(`${API_GATEWAY}/api/v1/patients/email/${encodeURIComponent(data.email)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (getResponse.ok) {
      const patient = await getResponse.json();
      patientId = patient.id;
    }
  } catch (error) {
    // ignore
  }

  const method = patientId ? "PUT" : "POST";
  const url = patientId 
    ? `${API_GATEWAY}/api/v1/patients/${patientId}`
    : `${API_GATEWAY}/api/v1/patients`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return safeJson<void>(response);
}

export async function fetchPatientReminders(token: string, patientId: string): Promise<MedicationReminder[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/${patientId}/reminders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<MedicationReminder>(payload);
}

export async function markReminderCompleted(token: string, reminderId: string): Promise<MedicationReminder> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/reminders/${reminderId}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return safeJson<MedicationReminder>(response);
}


export async function fetchPatientReports(token: string, patientId: string): Promise<MedicalReportResponse[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/${patientId}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<MedicalReportResponse>(payload);
}

export async function uploadPatientReport(token: string, patientId: string, data: MedicalReportCreateRequest): Promise<MedicalReportResponse> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/${patientId}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return safeJson<MedicalReportResponse>(response);
}

export async function deletePatientReport(token: string, patientId: string, reportId: string): Promise<void> {
  await fetch(`${API_GATEWAY}/api/v1/patients/${patientId}/reports/${reportId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
