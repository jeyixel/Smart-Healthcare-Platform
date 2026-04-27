import { useState, useEffect, useCallback } from "react";
import { fetchPatientReports, uploadPatientReport, deletePatientReport } from "@/lib/api";
import { MedicalReportResponse, MedicalReportCreateRequest } from "@/types/api";
import { usePatientContext } from "../context/PatientContext";

export function usePatientReports() {
  const { session, patient } = usePatientContext();
  const [reports, setReports] = useState<MedicalReportResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!session || !patient?.id) return;
    try {
      setLoading(true);
      const data = await fetchPatientReports(session.token, patient.id);
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  }, [session, patient?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const uploadReport = async (file: File, reportType: string, title: string) => {
    if (!session || !patient?.id) throw new Error("Not authenticated");
    
    const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.onerror = error => reject(error);
    });

    const fileBase64 = await toBase64(file);
    const mockStorageKey = `db://${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const requestData: MedicalReportCreateRequest = {
      reportType,
      title,
      storageKey: mockStorageKey,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      uploadedByRole: "PATIENT",
      fileData: fileBase64
    };

    try {
      const newReport = await uploadPatientReport(session.token, patient.id, requestData);
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (error) {
      console.error("Failed to save report metadata:", error);
      throw error;
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!session || !patient?.id) throw new Error("Not authenticated");
    await deletePatientReport(session.token, patient.id, reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  return { reports, loading, uploadReport, deleteReport, refreshReports: loadReports };
}
