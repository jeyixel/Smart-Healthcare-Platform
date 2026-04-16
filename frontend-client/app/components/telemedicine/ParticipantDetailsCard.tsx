import DoctorAvatar from "@/app/components/telemedicine/DoctorAvatar";
import type { DoctorProfile, PatientProfile, UserRole } from "@/app/types/telemedicine";

interface ParticipantDetailsCardProps {
  role: UserRole;
  doctor: DoctorProfile;
  patient: PatientProfile;
}

export default function ParticipantDetailsCard({
  role,
  doctor,
  patient,
}: ParticipantDetailsCardProps) {
  if (role === "PATIENT") {
    return (
      <section className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,95,175,0.04)]">
        <p className="text-sm text-[#4f5c6a]">Your Doctor</p>
        <div className="mt-4 flex items-center gap-4 rounded-lg bg-[#f2f3fc] p-4">
          <DoctorAvatar src={doctor.profileImageUrl} alt={doctor.fullName} />
          <div>
            <h3 className="text-lg font-semibold text-[#181c21]">{doctor.fullName}</h3>
            <p className="text-sm text-[#4f5c6a]">{doctor.specialty}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,95,175,0.04)]">
      <p className="text-sm text-[#4f5c6a]">Patient Details</p>
      <div className="mt-4 rounded-lg bg-[#f2f3fc] p-4">
        <h3 className="text-lg font-semibold text-[#181c21]">{patient.fullName}</h3>
        <p className="mt-1 text-sm text-[#4f5c6a]">Patient ID: {patient.id}</p>
      </div>
      {/* Patient context placeholder — future integration will fetch vitals, allergies, and recent encounters from the patient database via the telemedicine service. */}
      <div className="mt-4 rounded-lg border border-dashed border-[#c7cad1] p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8b93a1]">Patient Context</p>
        <p className="mt-1 text-sm text-[#4f5c6a]">
          Vitals, allergies, and recent encounters will appear here once patient data integration is enabled.
        </p>
      </div>
    </section>
  );
}

