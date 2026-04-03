import type {
  DoctorProfile,
  PatientProfile,
  SessionUser,
  TelemedicineAppointment,
  UserRole,
} from "@/app/types/telemedicine";

const MOCK_ROLE: UserRole = "DOCTOR";

export const MOCK_APPOINTMENT: TelemedicineAppointment = {
  id: "mock-appt-123",
  patientId: "pat-001",
  doctorId: "doc-001",
  appointmentDate: "2026-04-06",
  appointmentTime: "09:30:00",
  status: "CONFIRMED",
  reason: "Recurring migraine episodes over the past week",
  notes: "Patient reports light sensitivity and intermittent nausea.",
  createdAt: "2026-04-01T08:10:00Z",
  updatedAt: "2026-04-02T12:25:00Z",
};

export const MOCK_PATIENT: PatientProfile = {
  id: "pat-001",
  fullName: "Janith Fernando",
  medicalHistory: [
    {
      id: "mh-001",
      conditionName: "Migraine without aura",
      diagnosisDate: "2024-08-12",
      source: "Neurology Clinic",
      notes: "Responds to triptan-based rescue treatment.",
      createdAt: "2024-08-12T09:40:00Z",
    },
    {
      id: "mh-002",
      conditionName: "Seasonal allergic rhinitis",
      diagnosisDate: "2021-05-22",
      source: "Primary Care",
      notes: "Worse during pollen season, controlled with antihistamines.",
      createdAt: "2021-05-22T11:05:00Z",
    },
  ],
};

export const MOCK_DOCTOR: DoctorProfile = {
  id: "doc-001",
  fullName: "Dr. Nadeesha Perera",
  specialty: "Neurology",
  // Intentional missing local image path to validate fallback behavior.
  profileImageUrl: "/images/doctor-profile-missing.png",
};

export function getMockSessionUser(): SessionUser {
  const id = MOCK_ROLE === "DOCTOR" ? MOCK_DOCTOR.id : MOCK_PATIENT.id;
  return {
    role: MOCK_ROLE,
    id,
  };
}


