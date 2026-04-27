export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
export type PublicRegisterRole = "DOCTOR" | "PATIENT";

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  authUserId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientEvent {
  patientId: string;
  adminId: number | null;
  eventType: string;
  description: string;
  status: string;
  timestamp: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: PublicRegisterRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordOtpInput {
  email: string;
}

export interface ForgotPasswordResetInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface DoctorApprovalItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "DOCTOR";
  approved: boolean;
}

export interface CurrentUserProfile {
  email: string;
  role: UserRole;
  approved: boolean;
}

export interface NotificationLog {
  id: number;
  recipient: string;
  subject: string;
  message: string;
  type: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  status: "SENT" | "FAILED" | "PENDING";
  errorMessage: string | null;
  sentAt: string;
}

export interface AdminAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: "VIRTUAL" | "PHYSICAL";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalPatients: number;
  activeDoctors: number;
  totalAppointments: number;
  totalSystemUsers: number;
}

export interface SystemEvent {
  id: string;
  actionType: string;
  requestedBy: string;
  description: string;
  timestamp: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  diagnosis?: string;
  treatment?: string;
  symptoms?: string;
  date?: string;
  notes?: string;
  [key: string]: any;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface NotificationLog {
  id: number;
  recipient: string;
  subject: string;
  message: string;
  channel: "EMAIL" | "SMS";
  status: "SENT" | "FAILED" | "PENDING";
  errorMessage: string | null;
  sentAt: string;
}

export interface PaymentAnalysis {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  statusBreakdown: Record<string, number>;
  trends: DailyRevenue[];
}

export interface DoctorSearchResponse {
  id: string;
  fullName: string;
  specialty: string;
  category: string;
  qualification: string;
  experienceYears: number;
  hospitalOrClinic: string;
  consultationFee: number;
  consultationMode: "PHYSICAL" | "VIRTUAL" | "BOTH";
  verified: boolean;
  active: boolean;
  profileImageUrl: string | null;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm:ss
  consultationType: "PHYSICAL" | "VIRTUAL";
  reason: string;
}

export interface AppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: "PHYSICAL" | "VIRTUAL";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING_PAYMENT" | "PAID" | "FAILED";
  paymentDeadline: string | null;
  paymentReference: string | null;
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PrescriptionStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export interface PrescriptionItemResponse {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: string;
}

export interface PrescriptionResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  clinicalNotes: string;
  status: PrescriptionStatus;
  followUpRequired: boolean;
  followUpDate: string | null;
  issuedAt: string | null;
  items: PrescriptionItemResponse[];
  createdAt: string;
  updatedAt: string;
  digitalSignature: string | null;
}

export interface CreateDoctorRequest {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  category: string;
  qualification: string;
  experienceYears: number;
  hospitalOrClinic: string;
  consultationFee: number;
  consultationMode: "PHYSICAL" | "VIRTUAL" | "BOTH";
  bio?: string;
  profileImageUrl?: string;
  licenseNumber: string;
}

export interface PatientUpsertRequest {
  firstName: string;
  lastName: string;
  email: string;
  authUserId?: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
