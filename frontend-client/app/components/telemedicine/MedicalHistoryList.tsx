import type { MedicalHistoryItem } from "@/app/types/telemedicine";

interface MedicalHistoryListProps {
  history: MedicalHistoryItem[];
}

function renderDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function MedicalHistoryList({ history }: MedicalHistoryListProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(0,95,175,0.04)]">
      <p className="text-sm text-[#4f5c6a]">Medical History</p>
      <div className="mt-4 space-y-3">
        {history.map((item) => (
          <article key={item.id} className="rounded-lg bg-[#f2f3fc] p-4">
            <h4 className="text-base font-semibold text-[#181c21]">{item.conditionName}</h4>
            <p className="mt-1 text-xs text-[#4f5c6a]">Diagnosed: {renderDate(item.diagnosisDate)}</p>
            {item.source ? <p className="mt-2 text-sm text-[#181c21]">Source: {item.source}</p> : null}
            {item.notes ? <p className="mt-2 text-sm text-[#181c21]">{item.notes}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

