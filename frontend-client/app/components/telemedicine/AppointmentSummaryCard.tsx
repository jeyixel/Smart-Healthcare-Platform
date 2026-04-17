import type { TelemedicineAppointment } from "@/app/types/telemedicine";

interface AppointmentSummaryCardProps {
  appointment: TelemedicineAppointment;
  onJoin: () => void;
  joining: boolean;
  joinDisabled: boolean;
}

function toReadableDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function toReadableTime(value: string) {
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AppointmentSummaryCard({
  appointment,
  onJoin,
  joining,
  joinDisabled,
}: AppointmentSummaryCardProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,95,175,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#4f5c6a]">Appointment ID</p>
          <h2 className="text-xl font-semibold text-[#181c21]">{appointment.id}</h2>
        </div>
        <span className="rounded-lg bg-[#e6f0fa] px-3 py-1 text-sm font-medium text-[#005dac]">
          {appointment.status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-[#f2f3fc] p-4">
          <p className="text-sm text-[#4f5c6a]">Date</p>
          <p className="mt-1 text-base font-medium text-[#181c21]">{toReadableDate(appointment.appointmentDate)}</p>
        </div>
        <div className="rounded-lg bg-[#f2f3fc] p-4">
          <p className="text-sm text-[#4f5c6a]">Time</p>
          <p className="mt-1 text-base font-medium text-[#181c21]">{toReadableTime(appointment.appointmentTime)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg bg-[#f2f3fc] p-4">
          <p className="text-sm text-[#4f5c6a]">Reason</p>
          <p className="mt-2 text-sm text-[#181c21]">{appointment.reason}</p>
        </div>
        <div className="rounded-lg bg-[#f2f3fc] p-4">
          <p className="text-sm text-[#4f5c6a]">Notes</p>
          <p className="mt-2 text-sm text-[#181c21]">{appointment.notes || "No additional notes."}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onJoin}
        disabled={joinDisabled || joining}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#005dac] to-[#1976d2] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {joining ? "Joining meeting..." : "Join Meeting"}
      </button>
      {joinDisabled ? (
        <p className="mt-2 text-xs text-[#6a7785]">
          Meeting can be joined only when appointment status is CONFIRMED.
        </p>
      ) : null}
    </section>
  );
}

