import {
  AuthResponse,
  LoginInput,
  Patient,
  PatientEvent,
  RegisterInput,
} from "@/types/api";

const ADMIN_API = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? "http://localhost:8087";
const PATIENT_API = process.env.NEXT_PUBLIC_PATIENT_API_BASE ?? "http://localhost:8081";

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
  const response = await fetch(`${ADMIN_API}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<AuthResponse>(response);
}

export async function loginAdmin(input: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${ADMIN_API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return safeJson<AuthResponse>(response);
}

export async function fetchPatients(): Promise<Patient[]> {
  const response = await fetch(`${PATIENT_API}/api/v1/patients`, {
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
  const url = new URL(`${ADMIN_API}/api/v1/admin/patients/${patientId}/status`);
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
  const response = await fetch(`${PATIENT_API}/api/v1/patient-events`, {
    cache: "no-store",
  });

  const payload = await safeJson<unknown>(response);
  return normalizeListResponse<PatientEvent>(payload);
}
