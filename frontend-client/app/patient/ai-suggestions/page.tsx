import { redirect } from "next/navigation";

export default function PatientAISuggestionsPage() {
  redirect("/patient/dashboard?section=ai-suggestions");
}

