import type {
  DoctorProfile,
  PatientProfile,
  SessionUser,
  TelemedicineAppointment,
  UserRole,
} from "@/app/types/telemedicine";

// ──────────────────────────────────────────────────────────────
// Toggle this to switch between Doctor and Patient perspectives.
// Change to "PATIENT" to see the patient-side UI.
// ──────────────────────────────────────────────────────────────
const MOCK_ROLE: UserRole = "DOCTOR";

// Real appointment ID that has a telemedicine session in the database.
// This must match a session created via POST /api/v1/telemedicine/sessions.
export const MOCK_APPOINTMENT: TelemedicineAppointment = {
  id: "apt0002",
  patientId: "pt12",
  doctorId: "d2",
  appointmentDate: "2026-04-20",
  appointmentTime: "10:30:00",
  status: "CONFIRMED",
  reason: "General Follow-up",
  notes: "Online consultation scheduled via telemedicine.",
  createdAt: "2026-04-16T14:58:02Z",
  updatedAt: "2026-04-16T14:58:02Z",
};

export const MOCK_PATIENT: PatientProfile = {
  id: "pt12",
  fullName: "Jigga Super",
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
  fullName: "Dr. John Doe",
  specialty: "General Medicine",
  profileImageUrl:
    "https://png.pngtree.com/png-clipart/20230927/original/pngtree-photo-men-doctor-physician-chest-smiling-png-image_13143575.png",
};

export function getMockSessionUser(): SessionUser {
  const id = MOCK_ROLE === "DOCTOR" ? MOCK_DOCTOR.id : MOCK_PATIENT.id;
  return {
    role: MOCK_ROLE,
    id,
  };
}
