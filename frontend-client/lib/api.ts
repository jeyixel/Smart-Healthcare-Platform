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
const ADMIN_API = API_GATEWAY;

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

export async function updateDoctorApproval(
  token: string, 
  doctorId: string, 
  approved: boolean, 
  adminUserHeader: string
): Promise<void> {
  const url = new URL(`${API_GATEWAY}/api/v1/admin/doctors/${doctorId}/approval`);
  url.searchParams.set("approved", String(approved));

  await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Admin-User": adminUserHeader,
    },
  });
}

export async function fetchDoctors(token: string): Promise<Doctor[]> {
  const response = await fetch(`${API_GATEWAY}/api/v1/admin/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<Doctor>(payload);
}

export async function fetchPatientByEmail(token: string, email: string): Promise<Patient> {
  const response = await fetch(`${API_GATEWAY}/api/v1/patients/email/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
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
  patientId: string,
  token: string
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

export async function fetchServiceStatus(token: string) {
  // In a real environment, this might hit a discovery service or actuator
  // Mocking the cluster health for the dashboard UI
  return [
    { serviceName: "AUTH-SERVICE", status: "UP" },
    { serviceName: "PATIENT-SERVICE", status: "UP" },
    { serviceName: "DOCTOR-SERVICE", status: "UP" },
    { serviceName: "APPOINTMENT-SERVICE", status: "UP" },
    { serviceName: "ADMIN-SERVICE", status: "UP" },
    { serviceName: "NOTIFICATION-SERVICE", status: "UP" },
  ];
}

