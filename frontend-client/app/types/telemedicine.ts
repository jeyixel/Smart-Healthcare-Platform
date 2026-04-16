export type UserRole = "PATIENT" | "DOCTOR";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface TelemedicineAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryItem {
  id: string;
  conditionName: string;
  diagnosisDate: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  medicalHistory: MedicalHistoryItem[];
}

export interface DoctorProfile {
  id: string;
  fullName: string;
  specialty: string;
  profileImageUrl: string | null;
}

export interface SessionUser {
  role: UserRole;
  id: string;
}

export interface TelemedicineSessionResponse {
  sessionId: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  roomName: string;
  meetingUrl: string;
  status: string;
  createdAt: string;
}

