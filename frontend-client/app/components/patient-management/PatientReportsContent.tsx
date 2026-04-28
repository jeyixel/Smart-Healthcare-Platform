"use client";

import { useState, useRef } from "react";
import { usePatientReports } from "@/app/hooks/usePatientReports";

const REPORT_TYPE_LABELS: Record<string, string> = {
  BLOOD_TEST: "Blood Test",
  XRAY: "X-Ray",
  MRI: "MRI Scan",
  CT_SCAN: "CT Scan",
  CLINICAL_NOTE: "Clinical Note",
  OTHER: "Other",
};

const REPORT_TYPE_COLORS: Record<string, string> = {
  BLOOD_TEST: "#ef4444",
  XRAY: "#8b5cf6",
  MRI: "#06b6d4",
  CT_SCAN: "#f59e0b",
  CLINICAL_NOTE: "#10b981",
  OTHER: "#64748b",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function PatientReportsContent() {
  const { reports, loading, uploadReport, deleteReport } = usePatientReports();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("BLOOD_TEST");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
      if (!title) {
        const name = e.target.files[0].name.split(".")[0];
        setTitle(name.replace(/[-_]/g, " "));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadSuccess(false);
      if (!title) {
        const name = e.dataTransfer.files[0].name.split(".")[0];
        setTitle(name.replace(/[-_]/g, " "));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setUploadError("Please select a file."); return; }
    if (!title) { setUploadError("Please enter a title."); return; }

    setUploadError("");
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => { if (p >= 85) { clearInterval(interval); return 85; } return p + 12; });
    }, 180);

    try {
      await uploadReport(selectedFile, reportType, title);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setTimeout(() => {
        setSelectedFile(null); setTitle(""); setReportType("BLOOD_TEST");
        setIsUploading(false); setUploadProgress(0); setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1200);
    } catch (err: any) {
      clearInterval(interval);
      setUploadError(err.message || "Upload failed. Please try again.");
      setIsUploading(false); setUploadProgress(0);
    }
  };

  const handleView = (fileData: string | null | undefined, mimeType: string, fileName: string) => {
    if (!fileData) {
      alert("This report was uploaded before file storage was enabled. No preview is available.");
      return;
    }
    try {
      const binary = atob(fileData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Could not open preview. The file data may be corrupted.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Patient Portal
          </p>
          <h2 style={{ margin: 0, fontSize: "30px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Medical Records
          </h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
            Securely upload and manage your lab results, imaging, and clinical reports.
          </p>
        </div>
        <div style={{
          background: "linear-gradient(135deg,rgba(6,182,212,0.1),rgba(8,145,178,0.06))",
          border: "1px solid rgba(6,182,212,0.2)", borderRadius: "12px", padding: "12px 20px",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{reports.length}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Total Reports</p>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" /></svg>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>

        {/* Upload Form */}
        <div style={{
          background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden"
        }}>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "20px 24px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>Upload New Report</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>PDF, JPG, PNG — up to 20MB</p>
          </div>

          <form onSubmit={handleUploadSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${selectedFile ? "#06b6d4" : "#cbd5e1"}`,
                background: selectedFile ? "rgba(6,182,212,0.04)" : "#f8fafc",
                borderRadius: "14px", padding: "28px 16px", textAlign: "center",
                cursor: "pointer", position: "relative", transition: "all 0.2s",
              }}
            >
              <input
                type="file" ref={fileInputRef} onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} disabled={isUploading}
              />
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{selectedFile ? "✅" : "📁"}</div>
              {selectedFile ? (
                <>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{selectedFile.name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#06b6d4", fontWeight: 600 }}>{formatBytes(selectedFile.size)}</p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Click or drag & drop</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Supports PDF, JPG, PNG</p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Report Title
              </label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count"
                disabled={isUploading}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", outline: "none", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            {/* Type */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Report Type
              </label>
              <select
                value={reportType} onChange={(e) => setReportType(e.target.value)}
                disabled={isUploading}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", outline: "none", fontSize: "14px", background: "white", fontFamily: "inherit" }}
              >
                {Object.entries(REPORT_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            {uploadError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", fontSize: "13px", borderRadius: "10px", border: "1px solid #fecaca" }}>
                ⚠️ {uploadError}
              </div>
            )}

            {/* Progress */}
            {isUploading && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Uploading...</span>
                  <span style={{ fontSize: "12px", color: "#06b6d4", fontWeight: 700 }}>{uploadProgress}%</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg,#06b6d4,#0891b2)", borderRadius: "99px", transition: "width 0.2s ease-out" }} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              style={{
                width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                background: isUploading || !selectedFile ? "#cbd5e1" : "linear-gradient(135deg,#06b6d4,#0891b2)",
                color: "white", fontWeight: 700, fontSize: "14px",
                cursor: isUploading || !selectedFile ? "not-allowed" : "pointer",
                transition: "all 0.2s", boxShadow: isUploading || !selectedFile ? "none" : "0 4px 12px rgba(6,182,212,0.35)"
              }}
            >
              {uploadSuccess ? "✓ Uploaded!" : isUploading ? "Uploading..." : "Upload Report"}
            </button>
          </form>
        </div>

        {/* Reports List */}
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>My Uploaded Reports</h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {reports.length} record{reports.length !== 1 ? "s" : ""} on file
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["All", "Blood", "Imaging", "Notes"].map((f) => (
                <span key={f} style={{ padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, background: f === "All" ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.08)", color: f === "All" ? "#06b6d4" : "#94a3b8" }}>{f}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: "20px 28px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>⏳</div>
                <p style={{ margin: 0, fontWeight: 500 }}>Loading your records...</p>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg,rgba(6,182,212,0.1),rgba(8,145,178,0.06))", border: "1px solid rgba(6,182,212,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>🗂️</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>No reports yet</p>
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8" }}>Upload your first medical report using the form on the left.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reports.map((report) => {
                  const color = REPORT_TYPE_COLORS[report.reportType] || "#64748b";
                  const hasFile = !!report.fileData;
                  return (
                    <div
                      key={report.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "16px 20px", border: "1px solid #f1f5f9", borderRadius: "14px",
                        background: "#fafbfc", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                    >
                      {/* Icon */}
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="20" height="20" fill="none" stroke={color} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{report.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, background: `${color}18`, color }}>{REPORT_TYPE_LABELS[report.reportType] || report.reportType}</span>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>•</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{new Date(report.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>•</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{formatBytes(report.fileSize)}</span>
                          {!hasFile && <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 600, padding: "1px 6px", background: "rgba(245,158,11,0.1)", borderRadius: "99px" }}>Legacy</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button
                          onClick={() => handleView(report.fileData, report.mimeType, report.fileName)}
                          style={{
                            background: hasFile ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#f1f5f9",
                            border: "none", color: hasFile ? "white" : "#94a3b8",
                            padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                            boxShadow: hasFile ? "0 2px 8px rgba(6,182,212,0.3)" : "none",
                          }}
                          title={hasFile ? "View file" : "No file stored"}
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          View
                        </button>
                        <button
                          disabled={deletingId === report.id}
                          onClick={async () => {
                            if (!confirm(`Delete "${report.title}"? This cannot be undone.`)) return;
                            setDeletingId(report.id);
                            try { await deleteReport(report.id); }
                            catch { alert("Failed to delete. Please try again."); }
                            finally { setDeletingId(null); }
                          }}
                          style={{
                            background: deletingId === report.id ? "#fef2f2" : "transparent",
                            border: "1.5px solid #fecaca", color: "#ef4444",
                            padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                            cursor: deletingId === report.id ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: "5px",
                          }}
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          {deletingId === report.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
