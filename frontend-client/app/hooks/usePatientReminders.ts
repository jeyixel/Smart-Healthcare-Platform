import { useState, useEffect, useCallback } from "react";
import { fetchPatientReminders, markReminderCompleted } from "@/lib/api";
import { MedicationReminder } from "@/types/api";
import { usePatientContext } from "../context/PatientContext";

export function usePatientReminders() {
  const { session, patient } = usePatientContext();
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReminders = useCallback(async () => {
    if (!session || !patient?.id) return;
    try {
      setLoading(true);
      const data = await fetchPatientReminders(session.token, patient.id);
      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
    } finally {
      setLoading(false);
    }
  }, [session, patient?.id]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const completeReminder = async (reminderId: string) => {
    if (!session) return;
    try {
      await markReminderCompleted(session.token, reminderId);
      await loadReminders(); // Refresh the list
    } catch (error) {
      console.error("Failed to complete reminder:", error);
      throw error;
    }
  };

  return { reminders, loading, completeReminder, refreshReminders: loadReminders };
}
