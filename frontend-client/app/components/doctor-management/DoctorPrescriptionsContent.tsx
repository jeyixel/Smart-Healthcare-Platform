"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePrescriptions, Prescription, PrescriptionStatus } from "@/app/hooks/usePrescriptions";
import { useDoctorContext } from "@/app/context/DoctorContext";
import { useAppointments, Appointment } from "@/app/hooks/useAppointments";
import { DigitalSignature } from "./DigitalSignature";

// ─── Palette helpers ──────────────────────────────────────────────────────────

const STATUS_META: Record<PrescriptionStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  DRAFT: { label: "Draft", bg: "rgba(245,158,11,0.10)", color: "#d97706", dot: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  ISSUED: { label: "Issued", bg: "rgba(16,185,129,0.10)", color: "#059669", dot: "#10b981", border: "rgba(16,185,129,0.25)" },
  CANCELLED: { label: "Cancelled", bg: "rgba(239,68,68,0.10)", color: "#dc2626", dot: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

function statusPill(status: PrescriptionStatus) {
  const m = STATUS_META[status] || STATUS_META.DRAFT;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.02em", whiteSpace: "nowrap"
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function avatarColor(str: string) {
  const hues = [210, 160, 280, 30, 340, 190, 120, 50];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

const APPT_STATUS_META: Record<string, { label: string; bg: string; color: string; dot: string; border: string }> = {
  PENDING: { label: "Pending", bg: "rgba(245,158,11,0.10)", color: "#d97706", dot: "#f59e0b", border: "rgba(245,158,11,0.25)" },
  CONFIRMED: { label: "Confirmed", bg: "rgba(99,102,241,0.10)", color: "#4f46e5", dot: "#6366f1", border: "rgba(99,102,241,0.25)" },
  COMPLETED: { label: "Completed", bg: "rgba(16,185,129,0.10)", color: "#059669", dot: "#10b981", border: "rgba(16,185,129,0.25)" },
  CANCELLED: { label: "Cancelled", bg: "rgba(239,68,68,0.10)", color: "#dc2626", dot: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

function apptStatusPill(status: string) {
  const m = APPT_STATUS_META[status] || APPT_STATUS_META.PENDING;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700,
      background: m.bg, color: m.color, border: `1px solid ${m.border}`, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.02em", whiteSpace: "nowrap"
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function handlePrint(rx: Prescription) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  let itemsHtml = rx.items.map(i => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>${i.medicineName}</strong></td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.dosage}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.frequency}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.duration}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.quantity || '-'}</td>
    </tr>
    <tr>
      <td colspan="5" style="padding: 8px 12px 16px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <em>Instructions: </em> ${i.instructions || 'N/A'}
      </td>
    </tr>
  `).join('');

  const signatureHtml = rx.digitalSignature 
    ? `<div style="margin-top: 40px; text-align: right;">
         <img src="${rx.digitalSignature}" width="150" style="border-bottom: 1px solid #cbd5e1" />
         <p style="margin: 4px 0 0; font-weight: 600; font-size: 14px; color: #334155;">Doctor's Signature</p>
       </div>`
    : `<div style="margin-top: 40px; text-align: right;">
         <div style="width: 150px; border-bottom: 1px solid #cbd5e1; display: inline-block; margin-bottom: 4px;"></div>
         <p style="margin: 0; font-weight: 600; font-size: 14px; color: #334155;">Doctor's Signature</p>
       </div>`;

  const html = `
    <html>
      <head>
        <title>Prescription _ ${rx.id}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand-logo { width: 40px; height: 40px; background: #06b6d4; border-radius: 8px; }
          .brand-text blockquote { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .brand-text span { font-size: 12px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; }
          h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin: 0; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .meta p { margin: 0 0 8px; font-size: 14px; }
          .meta p strong { color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
          .notes { margin-bottom: 30px; }
          .notes h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
          .notes p { font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body onload="window.print()">
        <div class="header">
          <div class="brand">
            <div class="brand-text">
              <blockquote>SmartHealth</blockquote>
              <span>Clinical Prescription</span>
            </div>
          </div>
          <h1>RX-${rx.id.substring(0, 8).toUpperCase()}</h1>
        </div>

        <div class="meta">
          <div>
            <p><strong>Patient ID:</strong> ${rx.patientId.substring(0,8)}...</p>
            <p><strong>Doctor ID:</strong> ${rx.doctorId.substring(0,8)}...</p>
            <p><strong>Appt ID:</strong> ${rx.appointmentId.substring(0,8)}...</p>
          </div>
          <div>
            <p><strong>Date Issued:</strong> ${new Date(rx.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${rx.status}</p>
            ${rx.followUpRequired && rx.followUpDate ? `<p><strong>Follow-Up:</strong> ${rx.followUpDate}</p>` : ''}
          </div>
        </div>

        ${rx.diagnosis ? `
        <div class="notes">
          <h3>Diagnosis</h3>
          <p>${rx.diagnosis}</p>
        </div>` : ''}

        ${rx.clinicalNotes ? `
        <div class="notes">
          <h3>Clinical Notes</h3>
          <p>${rx.clinicalNotes}</p>
        </div>` : ''}

        <div class="notes">
          <h3>Medication Items</h3>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Freq</th>
                <th>Duration</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        ${signatureHtml}
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}

async function handleDownload(rx: Prescription) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // Create a temporary div with the prescription content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '40px';
  tempDiv.style.fontFamily = "'Inter', system-ui, sans-serif";
  tempDiv.style.color = '#0f172a';
  tempDiv.style.background = '#fff';

  let itemsHtml = rx.items.map(i => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>${i.medicineName}</strong></td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.dosage}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.frequency}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.duration}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${i.quantity || '-'}</td>
    </tr>
    <tr>
      <td colspan="5" style="padding: 8px 12px 16px; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b;">
        <em>Instructions: </em> ${i.instructions || 'N/A'}
      </td>
    </tr>
  `).join('');

  const signatureHtml = rx.digitalSignature 
    ? `<div style="margin-top: 60px; text-align: right; width: 100%;">
         <div style="display: inline-block; text-align: center;">
           <img src="${rx.digitalSignature}" width="150" style="border-bottom: 1px solid #cbd5e1;" />
           <p style="margin: 4px 0 0; font-weight: 600; font-size: 14px; color: #334155;">Doctor's Signature</p>
         </div>
       </div>`
    : `<div style="margin-top: 60px; text-align: right; width: 100%;">
         <div style="display: inline-block; text-align: center;">
           <div style="width: 150px; border-bottom: 1px solid #cbd5e1; margin-bottom: 4px;"></div>
           <p style="margin: 0; font-weight: 600; font-size: 14px; color: #334155;">Doctor's Signature</p>
         </div>
       </div>`;

  tempDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div>
          <blockquote style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SmartHealth</blockquote>
          <span style="font-size: 12px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">Clinical Prescription</span>
        </div>
      </div>
      <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">RX-${rx.id.substring(0, 8).toUpperCase()}</h1>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Patient ID:</strong> ${rx.patientId.substring(0,8)}...</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Doctor ID:</strong> ${rx.doctorId.substring(0,8)}...</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Appt ID:</strong> ${rx.appointmentId.substring(0,8)}...</p>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Date Issued:</strong> ${new Date(rx.createdAt).toLocaleDateString()}</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Status:</strong> ${rx.status}</p>
        ${rx.followUpRequired && rx.followUpDate ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Follow-Up:</strong> ${rx.followUpDate}</p>` : ''}
      </div>
    </div>

    ${rx.diagnosis ? `
    <div style="margin-bottom: 30px;">
      <h3 style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Diagnosis</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155; line-height: 1.6;">${rx.diagnosis}</div>
    </div>` : ''}

    ${rx.clinicalNotes ? `
    <div style="margin-bottom: 14px;">
      <h3 style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Clinical Notes</h3>
      <div style="background: rgba(6,182,212,0.04); border: 1px solid rgba(6,182,212,0.15); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155; line-height: 1.6;">${rx.clinicalNotes}</div>
    </div>` : ''}

    <div style="margin-bottom: 30px;">
       <h3 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Medications (${rx.items.length})</h3>
       <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
         <thead>
           <tr>
             <th style="text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Medicine</th>
             <th style="text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Dosage</th>
             <th style="text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Freq</th>
             <th style="text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Duration</th>
             <th style="text-align: left; padding: 12px; background: #0f172a; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
           </tr>
         </thead>
         <tbody>
           ${itemsHtml}
         </tbody>
       </table>
    </div>

    ${signatureHtml}
  `;

  document.body.appendChild(tempDiv);

  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download PDF
    pdf.save(`Prescription-${rx.id.substring(0, 8).toUpperCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
}

// ─── Prescription Row ────────────────────────────────────────────────────────

function PrescriptionRow({ rx, index, onView, onStatusUpdate, onEdit, onDelete }: { rx: Prescription; index: number; onView: () => void; onStatusUpdate: () => void; onEdit: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const [hov, setHov] = useState(false);
  const hue = avatarColor(rx.patientId);

  return (
    <tr
      style={{
        background: hov ? "#f8fafc" : "#fff",
        transition: "background 0.15s",
        cursor: "pointer",
        borderBottom: "1px solid #f1f5f9"
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onView}
    >
      <td style={{ padding: "14px 16px 14px 20px", fontSize: "12px", color: "#94a3b8", fontWeight: 600, width: "48px" }}>
        {index + 1}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "14px", flexShrink: 0, boxShadow: `0 2px 10px hsl(${hue},70%,55%)33` }}>
            P
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
              Appt: {rx.appointmentId.substring(0, 8)}...
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
              Pat: {rx.patientId.substring(0, 8)}...
            </p>
          </div>
        </div>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#334155" }}>
          {formatDate(rx.createdAt)}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px", background: "rgba(6,182,212,0.06)", padding: "4px 8px", borderRadius: "6px", display: "inline-block" }}>
          {rx.diagnosis || "No diagnosis provided"}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        {statusPill(rx.status)}
      </td>
      <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
           <button 
             onClick={() => handlePrint(rx)} 
             title="Print PDF" 
             style={{ 
               width: "36px", 
               height: "36px", 
               borderRadius: "10px", 
               border: "2px solid #e2e8f0", 
               background: "#fff", 
               cursor: "pointer", 
               display: "flex", 
               alignItems: "center", 
               justifyContent: "center", 
               color: "#64748b",
               fontSize: "16px",
               fontWeight: "500",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "#f8fafc";
               e.currentTarget.style.borderColor = "#cbd5e1";
               e.currentTarget.style.color = "#475569";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "#fff";
               e.currentTarget.style.borderColor = "#e2e8f0";
               e.currentTarget.style.color = "#64748b";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
             }}
           >
             <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
           </button>
           <button 
             onClick={() => handleDownload(rx)} 
             title="Download PDF" 
             style={{ 
               width: "36px", 
               height: "36px", 
               borderRadius: "10px", 
               border: "2px solid #e2e8f0", 
               background: "#fff", 
               cursor: "pointer", 
               display: "flex", 
               alignItems: "center", 
               justifyContent: "center", 
               color: "#64748b",
               fontSize: "16px",
               fontWeight: "500",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "#f8fafc";
               e.currentTarget.style.borderColor = "#cbd5e1";
               e.currentTarget.style.color = "#475569";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "#fff";
               e.currentTarget.style.borderColor = "#e2e8f0";
               e.currentTarget.style.color = "#64748b";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
             }}
           >
             <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </button>
           {rx.status !== "CANCELLED" && (
             <button 
               onClick={onStatusUpdate} 
               title="Update Status" 
               style={{ 
                 width: "36px", 
                 height: "36px", 
                 borderRadius: "10px", 
                 border: "none", 
                 background: "linear-gradient(135deg,#06b6d4,#0891b2)", 
                 cursor: "pointer", 
                 display: "flex", 
                 alignItems: "center", 
                 justifyContent: "center", 
                 color: "#fff", 
                 boxShadow: "0 2px 8px rgba(6,182,212,0.3)",
                 fontSize: "16px",
                 fontWeight: "500",
                 transition: "all 0.2s ease"
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = "linear-gradient(135deg,#0891b2,#0e7490)";
                 e.currentTarget.style.transform = "translateY(-1px)";
                 e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.4)";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = "linear-gradient(135deg,#06b6d4,#0891b2)";
                 e.currentTarget.style.transform = "translateY(0)";
                 e.currentTarget.style.boxShadow = "0 2px 8px rgba(6,182,212,0.3)";
               }}
             >
               <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
             </button>
           )}
           {rx.status === "DRAFT" && (
             <button 
               onClick={onEdit} 
               title="Edit Draft" 
               style={{ 
                 width: "36px", 
                 height: "36px", 
                 borderRadius: "10px", 
                 border: "2px solid #06b6d4", 
                 background: "#fff", 
                 cursor: "pointer", 
                 display: "flex", 
                 alignItems: "center", 
                 justifyContent: "center", 
                 color: "#06b6d4",
                 fontSize: "16px",
                 fontWeight: "500",
                 transition: "all 0.2s ease",
                 boxShadow: "0 1px 3px rgba(6,182,212,0.2)"
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = "#f0f9ff";
                 e.currentTarget.style.borderColor = "#0891b2";
                 e.currentTarget.style.color = "#0891b2";
                 e.currentTarget.style.transform = "translateY(-1px)";
                 e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.3)";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = "#fff";
                 e.currentTarget.style.borderColor = "#06b6d4";
                 e.currentTarget.style.color = "#06b6d4";
                 e.currentTarget.style.transform = "translateY(0)";
                 e.currentTarget.style.boxShadow = "0 1px 3px rgba(6,182,212,0.2)";
               }}
             >
               <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </button>
           )}
           <button 
             onClick={(e) => onDelete(e)} 
             title="Delete" 
             style={{ 
               width: "36px", 
               height: "36px", 
               borderRadius: "10px", 
               border: "2px solid #fecaca", 
               background: "#fef2f2", 
               cursor: "pointer", 
               display: "flex", 
               alignItems: "center", 
               justifyContent: "center", 
               color: "#ef4444",
               fontSize: "16px",
               fontWeight: "500",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(239,68,68,0.2)"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "#fee2e2";
               e.currentTarget.style.borderColor = "#fca5a5";
               e.currentTarget.style.color = "#dc2626";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "#fef2f2";
               e.currentTarget.style.borderColor = "#fecaca";
               e.currentTarget.style.color = "#ef4444";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(239,68,68,0.2)";
             }}
           >
             <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
           </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ rx, onClose, onEdit, onStatusUpdate }: { rx: Prescription; onClose: () => void; onEdit: () => void; onStatusUpdate: () => void; }) {
  const hue = avatarColor(rx.patientId);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 95vw)", background: "#fff", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", animation: "slideRight 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        
        {/* Top strip */}
        <div style={{ background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#06b6d4", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", padding: "3px 10px", borderRadius: "999px" }}>
              Prescription Details
            </span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", width: "28px", height: "28px", borderRadius: "8px", fontSize: "14px" }}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `linear-gradient(135deg,hsl(${hue},70%,55%),hsl(${hue + 30},60%,45%))`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px", boxShadow: `0 0 20px hsl(${hue},70%,55%)44`, flexShrink: 0 }}>P</div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>PATIENT ID</p>
              <p style={{ margin: "2px 0 0", color: "#e2e8f0", fontWeight: 700, fontSize: "13px", fontFamily: "monospace" }}>{rx.patientId.slice(0, 18)}…</p>
              {statusPill(rx.status)}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <InfoRow label="Issued Date" value={formatDate(rx.createdAt)} icon="📅" />
          <InfoRow label="Prescription ID" value={rx.id.slice(0, 22) + "…"} icon="🆔" mono />
          <InfoRow label="Appointment ID" value={rx.appointmentId.slice(0, 22) + "…"} icon="🩺" mono />

          {rx.followUpRequired && rx.followUpDate && (
             <InfoRow label="Follow Up Date" value={formatDate(rx.followUpDate)} icon="🔁" highlight />
          )}

          {rx.diagnosis && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Diagnosis</p>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>{rx.diagnosis}</div>
            </div>
          )}

          {rx.clinicalNotes && (
            <div style={{ marginTop: "14px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Clinical Notes</p>
              <div style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>{rx.clinicalNotes}</div>
            </div>
          )}

          <div style={{ marginTop: "24px" }}>
             <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Medications ({rx.items.length})</p>
             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               {rx.items.map((it, idx) => (
                 <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{it.medicineName}</strong>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#f1f5f9", padding: "2px 8px", borderRadius: "999px", color: "#475569" }}>{it.quantity || "N/A"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                      <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Dosage:</span> {it.dosage}</div>
                      <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Freq:</span> {it.frequency}</div>
                      <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Duration:</span> {it.duration}</div>
                    </div>
                    {it.instructions && <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #e2e8f0", fontSize: "12px", color: "#475569" }}><em>Instructions:</em> {it.instructions}</div>}
                 </div>
               ))}
             </div>
          </div>
          
          {rx.digitalSignature && (
            <div style={{ marginTop: "24px", textAlign: "right" }}>
               <img src={rx.digitalSignature} alt="Signature" style={{ width: "120px", borderBottom: "1px solid #cbd5e1", display: "inline-block" }} />
               <p style={{ margin: "4px 0 0", color: "#334155", fontSize: "12px", fontWeight: 600 }}>Doctor's Signature</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", background: "#f8fafc" }}>
           <button 
             onClick={() => handlePrint(rx)} 
             style={{ 
               flex: 1, 
               padding: "8px 12px", 
               borderRadius: "8px", 
               border: "2px solid #e2e8f0", 
               background: "#fff", 
               color: "#475569", 
               fontWeight: 600, 
               fontSize: "12px", 
               cursor: "pointer", 
               display: "flex", 
               justifyContent: "center", 
               gap: "6px",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
               whiteSpace: "nowrap"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "#f8fafc";
               e.currentTarget.style.borderColor = "#cbd5e1";
               e.currentTarget.style.color = "#334155";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "#fff";
               e.currentTarget.style.borderColor = "#e2e8f0";
               e.currentTarget.style.color = "#475569";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
             }}
           >
             <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             Print
           </button>
           <button 
             onClick={() => handleDownload(rx)} 
             style={{ 
               flex: 1, 
               padding: "8px 12px", 
               borderRadius: "8px", 
               border: "2px solid #e2e8f0", 
               background: "#fff", 
               color: "#475569", 
               fontWeight: 600, 
               fontSize: "12px", 
               cursor: "pointer", 
               display: "flex", 
               justifyContent: "center", 
               gap: "6px",
               transition: "all 0.2s ease",
               boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
               whiteSpace: "nowrap"
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.background = "#f8fafc";
               e.currentTarget.style.borderColor = "#cbd5e1";
               e.currentTarget.style.color = "#334155";
               e.currentTarget.style.transform = "translateY(-1px)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.background = "#fff";
               e.currentTarget.style.borderColor = "#e2e8f0";
               e.currentTarget.style.color = "#475569";
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
             }}
           >
             <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             PDF
           </button>
           {rx.status !== "CANCELLED" && (
             <button 
               onClick={onStatusUpdate} 
               style={{ 
                 flex: 1, 
                 padding: "8px 12px", 
                 borderRadius: "8px", 
                 border: "none", 
                 background: "linear-gradient(135deg,#06b6d4,#0891b2)", 
                 color: "#fff", 
                 fontWeight: 600, 
                 fontSize: "12px", 
                 cursor: "pointer", 
                 boxShadow: "0 4px 14px rgba(6,182,212,0.35)",
                 transition: "all 0.2s ease",
                 display: "flex",
                 justifyContent: "center",
                 gap: "6px",
                 whiteSpace: "nowrap"
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = "linear-gradient(135deg,#0891b2,#0e7490)";
                 e.currentTarget.style.transform = "translateY(-1px)";
                 e.currentTarget.style.boxShadow = "0 6px 20px rgba(6,182,212,0.45)";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = "linear-gradient(135deg,#06b6d4,#0891b2)";
                 e.currentTarget.style.transform = "translateY(0)";
                 e.currentTarget.style.boxShadow = "0 4px 14px rgba(6,182,212,0.35)";
               }}
             >
               <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
               Status
             </button>
           )}
           {rx.status === "DRAFT" && (
             <button 
               onClick={onEdit} 
               style={{ 
                 flex: 1, 
                 padding: "8px 12px", 
                 borderRadius: "8px", 
                 border: "2px solid #06b6d4", 
                 background: "#fff", 
                 color: "#06b6d4", 
                 fontWeight: 600, 
                 fontSize: "12px", 
                 cursor: "pointer",
                 transition: "all 0.2s ease",
                 boxShadow: "0 1px 3px rgba(6,182,212,0.2)",
                 display: "flex",
                 justifyContent: "center",
                 gap: "6px",
                 whiteSpace: "nowrap"
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = "#f0f9ff";
                 e.currentTarget.style.borderColor = "#0891b2";
                 e.currentTarget.style.color = "#0891b2";
                 e.currentTarget.style.transform = "translateY(-1px)";
                 e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.3)";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = "#fff";
                 e.currentTarget.style.borderColor = "#06b6d4";
                 e.currentTarget.style.color = "#06b6d4";
                 e.currentTarget.style.transform = "translateY(0)";
                 e.currentTarget.style.boxShadow = "0 1px 3px rgba(6,182,212,0.2)";
               }}
             >
               <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               Edit
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon, highlight, mono }: { label: string; value: string; icon: string; highlight?: boolean; mono?: boolean; }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
      <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: highlight ? "#06b6d4" : "#334155", fontFamily: mono ? "monospace" : "inherit" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Status Modal ─────────────────────────────────────────────────────────────

function StatusModal({ rx, onClose, onSave }: { rx: Prescription; onClose: () => void; onSave: (status: PrescriptionStatus) => Promise<void> }) {
  const [status, setStatus] = useState<PrescriptionStatus>(rx.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const allowed: PrescriptionStatus[] = rx.status === "CANCELLED" ? [] : 
    rx.status === "ISSUED" ? ["ISSUED", "CANCELLED"] : ["DRAFT", "ISSUED", "CANCELLED"];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if(status !== rx.status) {
         await onSave(status);
      }
      onClose();
    } catch(e:any) {
      setError(e.message || "Failed update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "400px", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        <div style={{ background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>Update Status</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px" }}>✕</button>
        </div>
        <div style={{ padding: "24px" }}>
          {rx.status === "ISSUED" && (
            <div style={{ 
              background: "#fef3c7", 
              border: "1px solid #f59e0b", 
              borderRadius: "8px", 
              padding: "12px", 
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <svg width="16" height="16" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#92400e" }}>Status Locked</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#b45309" }}>Once issued, prescriptions cannot be changed back to draft status</p>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gap: "10px" }}>
             {allowed.map((s) => {
               const m = STATUS_META[s];
               const active = status === s;
               const isLocked = rx.status === "ISSUED" && s === "DRAFT";
               return (
                 <button 
                   key={s} 
                   onClick={() => !isLocked && setStatus(s)} 
                   style={{ 
                     padding: "12px 14px", 
                     borderRadius: "10px", 
                     border: active ? `2px solid ${m.dot}` : "2px solid #e2e8f0", 
                     background: isLocked ? "#f1f5f9" : (active ? m.bg : "#f8fafc"), 
                     color: isLocked ? "#94a3b8" : (active ? m.color : "#64748b"), 
                     fontWeight: active ? 700 : 500, 
                     fontSize: "14px", 
                     cursor: isLocked ? "not-allowed" : "pointer", 
                     display: "flex", 
                     alignItems: "center", 
                     gap: "10px",
                     opacity: isLocked ? 0.6 : 1,
                     position: "relative"
                   }}
                 >
                   <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: isLocked ? "#cbd5e1" : (active ? m.dot : "#cbd5e1") }} />
                   {m.label}
                   {isLocked && (
                     <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" style={{ marginLeft: "4px" }}>
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                   )}
                 </button>
               );
             })}
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "10px" }}>⚠ {error}</p>}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff", fontWeight: 700, cursor: saving?"not-allowed":"pointer" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Prescription Builder Modal ──────────────────────────────────────────────
function PrescriptionBuilder({ 
  appointmentId, 
  patientId,
  doctorId,
  initialRx,
  onClose,
  onSave 
}: { 
  appointmentId: string;
  patientId: string;
  doctorId: string;
  initialRx?: Prescription | null;
  onClose: () => void;
  onSave: (payload: any, id?: string) => Promise<void>;
}) {
  const { session } = useDoctorContext();
  const [apptId, setApptId] = useState(initialRx ? initialRx.appointmentId : appointmentId);
  const [patId, setPatId] = useState(initialRx ? initialRx.patientId : patientId);
  const [diagnosis, setDiagnosis] = useState(initialRx?.diagnosis || "");
  const [clinicalNotes, setClinicalNotes] = useState(initialRx?.clinicalNotes || "");
  const [followUpRequired, setFollowUpRequired] = useState(initialRx?.followUpRequired || false);
  const [followUpDate, setFollowUpDate] = useState(initialRx?.followUpDate || "");
  const [digitalSignature, setDigitalSignature] = useState<string | null>(initialRx?.digitalSignature || null);

  const [items, setItems] = useState<any[]>(initialRx?.items || []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const addItem = () => setItems(prev => [...prev, { medicineName: "", dosage: "", frequency: "", duration: "", quantity: "", instructions: "" }]);
  const updateItem = (index: number, field: string, value: string) => setItems(prev => { const c = [...prev]; c[index][field] = value; return c; });
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setError(null);
    if (!apptId || !patId) return setError("Appointment ID and Patient ID are required.");
    if (items.length === 0) return setError("At least one medicine item is required.");
    
    // Validate all required item fields
    const invalidItem = items.find(item => 
      !item.medicineName?.trim() || 
      !item.dosage?.trim() || 
      !item.frequency?.trim() || 
      !item.duration?.trim()
    );
    if (invalidItem) {
      return setError("All medicine fields (Name, Dosage, Frequency, Duration) are required for each item.");
    }
    
    setSaving(true);
    try {
      // Use provided doctor ID
      let dId = initialRx?.doctorId || doctorId;
      if (!dId) {
        throw new Error("Doctor ID is required.");
      }

      const payload = {
        appointmentId: apptId,
        patientId: patId,
        doctorId: dId || "",
        diagnosis,
        clinicalNotes,
        followUpRequired,
        followUpDate: followUpRequired ? followUpDate : null,
        digitalSignature,
        items
      };

      await onSave(payload, initialRx?.id);
      setSaving(false);
    } catch(e:any) {
      // Enhanced error handling with detailed message
      let errorMessage = "An error occurred";
      if (e.message) {
        errorMessage = e.message;
      }
      
      // Check for specific validation errors
      if (errorMessage.includes("required")) {
        errorMessage = "Please fill in all required fields: Appointment ID, Patient ID, and all medicine fields (Name, Dosage, Frequency, Duration)";
      } else if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
        errorMessage = "Invalid prescription data. Please check all fields and try again.";
      }
      
      setError(errorMessage);
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: "800px", borderRadius: "20px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease" }}>
        
        <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: "24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>{
                initialRx ? "·" : "Rx"
              }</span>
              {initialRx ? "Edit Prescription" : "Issue New Prescription"}
            </h2>
            <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>
              {initialRx ? "Update and save prescription draft" : "Create a new medical prescription"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: "rgba(255,255,255,0.1)", 
              border: "1px solid rgba(255,255,255,0.2)", 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#cbd5e1",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          {error && <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid #fca5a5" }}>{error}</div>}

          {(!apptId || !patId || !initialRx) && (
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Patient Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Appointment ID</label>
                  <input 
                    value={apptId} 
                    onChange={e => setApptId(e.target.value)} 
                    disabled={!!initialRx} 
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #cbd5e1", 
                      background: initialRx ? "#f1f5f9" : "#fff",
                      fontSize: "14px",
                      fontWeight: 500
                    }} 
                    placeholder="AP-XXXXXXX" 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Patient ID</label>
                  <input 
                    value={patId} 
                    onChange={e => setPatId(e.target.value)} 
                    disabled={!!initialRx} 
                    style={{ 
                      width: "100%", 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #cbd5e1", 
                      background: initialRx ? "#f1f5f9" : "#fff",
                      fontSize: "14px",
                      fontWeight: 500
                    }} 
                    placeholder="PT-XXXXXXX" 
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Diagnosis</label>
              <input 
                value={diagnosis} 
                onChange={e => setDiagnosis(e.target.value)} 
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "border-color 0.2s ease"
                }} 
                placeholder="Enter medical diagnosis..." 
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Clinical Notes</label>
              <textarea 
                value={clinicalNotes} 
                onChange={e => setClinicalNotes(e.target.value)} 
                rows={4} 
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px solid #cbd5e1", 
                  resize: "vertical",
                  fontSize: "14px",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  transition: "border-color 0.2s ease"
                }} 
                placeholder="Clinical observations, symptoms, treatment plan..." 
                onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
              />
            </div>
          </div>

          <div style={{ background: "#f1f8ff", padding: "20px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600, color: "#1e40af", cursor: "pointer" }}>
                 <input 
                   type="checkbox" 
                   checked={followUpRequired} 
                   onChange={e => setFollowUpRequired(e.target.checked)} 
                   style={{ width: "18px", height: "18px", cursor: "pointer" }}
                 />
                 <span>Require Follow-up Appointment</span>
               </label>
               {followUpRequired && (
                 <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#3b82f6", fontWeight: 500 }}>
                   <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                   Schedule follow-up
                 </div>
               )}
            </div>
            {followUpRequired && (
              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#1e40af", marginBottom: "8px" }}>Follow-up Date</label>
                <input 
                  type="date" 
                  value={followUpDate} 
                  onChange={e => setFollowUpDate(e.target.value)} 
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    borderRadius: "8px", 
                    border: "1px solid #3b82f6",
                    fontSize: "14px",
                    fontWeight: 500,
                    background: "#fff"
                  }} 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          <div style={{ background: "#fefefe", padding: "24px", borderRadius: "12px", border: "2px solid #e2e8f0" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>Rx</span>
                    Medications
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>Add prescribed medicines and dosage instructions</p>
                </div>
                <button 
                  type="button" 
                  onClick={addItem} 
                  style={{ 
                    padding: "10px 16px", 
                    fontSize: "13px", 
                    fontWeight: 600, 
                    background: "linear-gradient(135deg, #10b981, #059669)", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16,185,129,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.3)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>+</span>
                  Add Medicine
                </button>
             </div>
             
             {items.length === 0 && (
               <div style={{ 
                 textAlign: "center", 
                 padding: "32px", 
                 background: "#f8fafc", 
                 borderRadius: "8px", 
                 border: "1px dashed #cbd5e1"
               }}>
                 <div style={{ fontSize: "32px", color: "#cbd5e1", marginBottom: "8px" }}>+</div>
                 <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>No medications added yet</p>
                 <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cbd5e1" }}>Click "Add Medicine" to start prescribing</p>
               </div>
             )}
             
             {items.map((it, i) => (
                <div key={i} style={{ 
                  background: "#fff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  marginBottom: "12px",
                  position: "relative"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Medicine #{i + 1}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => removeItem(i)} 
                      style={{ 
                        background: "rgba(239,68,68,0.1)", 
                        border: "1px solid rgba(239,68,68,0.2)", 
                        padding: "6px", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        color: "#dc2626",
                        fontSize: "14px",
                        fontWeight: "bold",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                        e.currentTarget.style.color = "#b91c1c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                        e.currentTarget.style.color = "#dc2626";
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                     <input 
                       placeholder="Medicine Name*" 
                       value={it.medicineName} 
                       onChange={e => updateItem(i, "medicineName", e.target.value)} 
                       style={{ 
                         width: "100%", 
                         padding: "10px", 
                         borderRadius: "6px", 
                         border: "1px solid #cbd5e1", 
                         fontSize:"13px",
                         fontWeight: 500,
                         transition: "border-color 0.2s ease"
                       }}
                       onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                       onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                     />
                     <input 
                       placeholder="Dosage*" 
                       value={it.dosage} 
                       onChange={e => updateItem(i, "dosage", e.target.value)} 
                       style={{ 
                         width: "100%", 
                         padding: "10px", 
                         borderRadius: "6px", 
                         border: "1px solid #cbd5e1", 
                         fontSize:"13px",
                         fontWeight: 500,
                         transition: "border-color 0.2s ease"
                       }}
                       onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                       onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                     />
                     <input 
                       placeholder="Frequency*" 
                       value={it.frequency} 
                       onChange={e => updateItem(i, "frequency", e.target.value)} 
                       style={{ 
                         width: "100%", 
                         padding: "10px", 
                         borderRadius: "6px", 
                         border: "1px solid #cbd5e1", 
                         fontSize:"13px",
                         fontWeight: 500,
                         transition: "border-color 0.2s ease"
                       }}
                       onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                       onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                     />
                     <input 
                       placeholder="Duration*" 
                       value={it.duration} 
                       onChange={e => updateItem(i, "duration", e.target.value)} 
                       style={{ 
                         width: "100%", 
                         padding: "10px", 
                         borderRadius: "6px", 
                         border: "1px solid #cbd5e1", 
                         fontSize:"13px",
                         fontWeight: 500,
                         transition: "border-color 0.2s ease"
                       }}
                       onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                       onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                     />
                     <input 
                       placeholder="Quantity" 
                       value={it.quantity} 
                       onChange={e => updateItem(i, "quantity", e.target.value)} 
                       style={{ 
                         width: "100%", 
                         padding: "10px", 
                         borderRadius: "6px", 
                         border: "1px solid #cbd5e1", 
                         fontSize:"13px",
                         fontWeight: 500,
                         transition: "border-color 0.2s ease"
                       }}
                       onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                       onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                     />
                   </div>
                   <input 
                     placeholder="Special instructions (e.g., Take with food, Before meals...)" 
                     value={it.instructions} 
                     onChange={e => updateItem(i, "instructions", e.target.value)} 
                     style={{ 
                       width: "100%", 
                       padding: "10px", 
                       borderRadius: "6px", 
                       border: "1px solid #e2e8f0", 
                       fontSize:"12px", 
                       background:"#f8fafc",
                       fontWeight: 500,
                       transition: "border-color 0.2s ease"
                     }}
                     onFocus={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                     onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                   />
                </div>
             ))}
          </div>

          <DigitalSignature onSave={setDigitalSignature} initialSignature={digitalSignature} />
        </div>

        <div style={{ padding: "24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderRadius: "0 0 20px 20px" }}>
           <div style={{ fontSize: "12px", color: "#64748b" }}>
             <span style={{ fontWeight: 600 }}>Note:</span> All required fields must be completed before saving
           </div>
           <div style={{ display: "flex", gap: "12px" }}>
             <button 
               onClick={onClose} 
               style={{ 
                 padding: "12px 24px", 
                 borderRadius: "10px", 
                 border: "2px solid #e2e8f0", 
                 background: "#fff", 
                 color: "#64748b", 
                 fontWeight: 600, 
                 cursor: "pointer",
                 fontSize: "14px",
                 transition: "all 0.2s ease"
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = "#f8fafc";
                 e.currentTarget.style.borderColor = "#cbd5e1";
                 e.currentTarget.style.color = "#475569";
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = "#fff";
                 e.currentTarget.style.borderColor = "#e2e8f0";
                 e.currentTarget.style.color = "#64748b";
               }}
             >
               Cancel
             </button>
             <button 
               onClick={handleSave} 
               disabled={saving} 
               style={{ 
                 padding: "12px 28px", 
                 borderRadius: "10px", 
                 border: "none", 
                 background: saving 
                   ? "#94a3b8" 
                   : "linear-gradient(135deg, #0ea5e9, #0284c7)", 
                 color: "#fff", 
                 fontWeight: 700, 
                 cursor: saving ? "not-allowed" : "pointer", 
                 boxShadow: saving 
                   ? "none" 
                   : "0 4px 12px rgba(2,132,199,0.3)",
                 fontSize: "14px",
                 transition: "all 0.2s ease",
                 opacity: saving ? 0.7 : 1,
                 display: "flex",
                 alignItems: "center",
                 gap: "8px"
               }}
               onMouseEnter={(e) => {
                 if (!saving) {
                   e.currentTarget.style.transform = "translateY(-1px)";
                   e.currentTarget.style.boxShadow = "0 6px 16px rgba(2,132,199,0.4)";
                 }
               }}
               onMouseLeave={(e) => {
                 if (!saving) {
                   e.currentTarget.style.transform = "translateY(0)";
                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.3)";
                 }
               }}
             >
               {saving && (
                 <div style={{ 
                   width: "16px", 
                   height: "16px", 
                   border: "2px solid #fff", 
                   borderTop: "2px solid transparent", 
                   borderRadius: "50%", 
                   animation: "spin 1s linear infinite" 
                 }}></div>
               )}
               {saving ? "Saving..." : (initialRx ? "Update Draft" : "Save Prescription")}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Selection Modal ─────────────────────────────────────────────

function AppointmentSelectionModal({ appointments, loading, onClose, onSelectAppointment }: { appointments: Appointment[]; loading: boolean; onClose: () => void; onSelectAppointment: (appt: Appointment) => void }) {

  // Filter to show only CONFIRMED and COMPLETED appointments (exclude PENDING and CANCELLED)
  const selectableAppointments = appointments.filter(appt => appt.status === "CONFIRMED" || appt.status === "COMPLETED");

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(500px, 95vw)", background: "#fff", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", animation: "slideRight 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        
        <div style={{ background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 700 }}>Select Appointment for Prescription</h3>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px" }}>✕</button>
          </div>
          <p style={{ margin: "8px 0 0", color: "#cbd5e1", fontSize: "14px" }}>Choose an appointment to create a prescription for</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading appointments...</div>
          ) : selectableAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No available appointments for prescriptions</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectableAppointments.map(appt => (
                <div key={appt.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                      {formatDate(appt.appointmentDate + "T00:00:00")} at {formatTime(appt.appointmentTime)}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                      Patient ID: {appt.patientId} | {appt.consultationType} | {apptStatusPill(appt.status)}
                    </p>
                    {appt.reason && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>Reason: {appt.reason}</p>}
                  </div>
                  <button
                    onClick={() => onSelectAppointment(appt)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DoctorPrescriptionsContent() {
  const { prescriptions, loading, fetchDoctorPrescriptions, createPrescription, updatePrescription, updatePrescriptionStatus, deletePrescription } = usePrescriptions();
  const { appointments, doctor, loading: apptLoading } = useAppointments();
  const { prescriptionDraftAppointment, setPrescriptionDraftAppointment } = useDoctorContext();
  
  const [filter, setFilter] = useState<PrescriptionStatus | "ALL">("ALL");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderAppointmentId, setBuilderAppointmentId] = useState<string>("");
  const [builderPatientId, setBuilderPatientId] = useState<string>("");
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);

  const [viewRx, setViewRx] = useState<Prescription | null>(null);
  const [statusRx, setStatusRx] = useState<Prescription | null>(null);
  const [selectApptOpen, setSelectApptOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; rx: Prescription } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSelectAppointment = (appt: Appointment) => {
    setBuilderAppointmentId(appt.id);
    setBuilderPatientId(appt.patientId);
    setSelectApptOpen(false);
    setBuilderOpen(true);
  };

  useEffect(() => { 
  fetchDoctorPrescriptions(); 
}, [fetchDoctorPrescriptions]);

  useEffect(() => {
    if (prescriptionDraftAppointment) {
      setBuilderAppointmentId(prescriptionDraftAppointment.id);
      setBuilderPatientId(prescriptionDraftAppointment.patientId);
      setEditingRx(null);
      setBuilderOpen(true);
      setPrescriptionDraftAppointment(null);
    }
  }, [prescriptionDraftAppointment, setPrescriptionDraftAppointment]);

  const filtered = useMemo(() => {
    let sorted = [...prescriptions].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter === "ALL") return sorted;
    return sorted.filter(p => p.status === filter);
  }, [prescriptions, filter]);

  const handleDelete = (id: string, rx: Prescription, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ id, rx });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deletePrescription(deleteConfirm.id);
        setViewRx(null);
        setDeleteConfirm(null);
        setToast({ message: "Prescription deleted successfully", type: "success" });
      } catch (error: any) {
        setToast({ message: error.message || "Failed to delete prescription", type: "error" });
      }
    }
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Prescriptions</h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>Manage and issue digital prescriptions</p>
        </div>
        <button
          onClick={() => { setEditingRx(null); setSelectApptOpen(true); }}
          style={{ 
            padding: "12px 24px", 
            borderRadius: "12px", 
            border: "none", 
            background: "linear-gradient(135deg, #06b6d4, #0891b2)", 
            color: "#fff", 
            fontWeight: 700, 
            fontSize: "15px", 
            cursor: "pointer", 
            boxShadow: "0 4px 14px rgba(6,182,212,0.3)", 
            display: "flex", 
            gap: "10px", 
            alignItems: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #0891b2, #0e7490)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(6,182,212,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #06b6d4, #0891b2)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(6,182,212,0.3)";
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>+</span> New Prescription
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", padding: "4px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        {["ALL", "DRAFT", "ISSUED", "CANCELLED"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f as any)} 
            style={{ 
              padding: "8px 16px", 
              borderRadius: "8px", 
              border: filter === f ? "2px solid #06b6d4" : "2px solid transparent", 
              background: filter === f ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "#fff", 
              color: filter === f ? "#fff" : "#64748b", 
              fontWeight: filter === f ? 600 : 500, 
              fontSize: "13px", 
              cursor: "pointer", 
              transition: "all 0.2s ease",
              boxShadow: filter === f ? "0 2px 8px rgba(6,182,212,0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              if (filter !== f) {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {f}
            {filter === f && (
              <div style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "6px",
                height: "6px",
                background: "#fff",
                borderRadius: "50%",
                opacity: 0.8
              }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        {loading && prescriptions.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading prescriptions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <svg width="48" height="48" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ margin: "0 auto 16px" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p style={{ color: "#64748b", fontWeight: 600, margin: 0 }}>No Prescriptions Found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
             <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
               <thead>
                 <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                   <th style={{ width: "48px", padding: "14px 16px 14px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8" }}>#</th>
                   <th style={{ padding: "14px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Associated Record</th>
                   <th style={{ padding: "14px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
                   <th style={{ padding: "14px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Diagnosis</th>
                   <th style={{ padding: "14px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                   <th style={{ padding: "14px 16px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {filtered.map((rx, idx) => (
                   <PrescriptionRow 
                     key={rx.id} index={idx} rx={rx} 
                     onView={() => setViewRx(rx)} 
                     onStatusUpdate={() => setStatusRx(rx)}
                     onEdit={() => { setEditingRx(rx); setBuilderOpen(true); }}
                     onDelete={(e) => handleDelete(rx.id, rx, e)}
                   />
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {selectApptOpen && (
        <AppointmentSelectionModal
          appointments={appointments}
          loading={apptLoading}
          onClose={() => setSelectApptOpen(false)}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {viewRx && (
        <DetailDrawer
          rx={viewRx}
          onClose={() => setViewRx(null)}
          onEdit={() => { setEditingRx(viewRx); setBuilderOpen(true); setViewRx(null); }}
          onStatusUpdate={() => { setStatusRx(viewRx); setViewRx(null); }}
        />
      )}

      {statusRx && (
        <StatusModal
          rx={statusRx}
          onClose={() => setStatusRx(null)}
          onSave={async (status) => {
            try {
              await updatePrescriptionStatus(statusRx.id, status);
              setToast({ message: `Prescription status updated to ${status}`, type: "success" });
              fetchDoctorPrescriptions();
            } catch (error: any) {
              setToast({ message: error.message || "Failed to update status", type: "error" });
            }
          }}
        />
      )}

      {builderOpen && (
        <PrescriptionBuilder 
          appointmentId={builderAppointmentId} 
          patientId={builderPatientId}
          doctorId={doctor?.id || ""}
          initialRx={editingRx}
          onClose={() => { 
            setBuilderOpen(false); 
            setBuilderAppointmentId(""); 
            setBuilderPatientId(""); 
            setEditingRx(null); 
            fetchDoctorPrescriptions(); 
          }}
          onSave={async (payload, id) => {
             try {
               if (id) {
                  await updatePrescription(id, payload);
                  setToast({ message: "Prescription updated successfully", type: "success" });
               } else {
                  await createPrescription(payload);
                  setToast({ message: "Prescription created successfully", type: "success" });
               }
               setBuilderOpen(false);
               setEditingRx(null);
               fetchDoctorPrescriptions();
             } catch (error: any) {
               setToast({ message: error.message || "Failed to save prescription", type: "error" });
             }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div onClick={() => setDeleteConfirm(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "450px", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
            <div style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", padding: "24px", textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: "28px" }}>warning</span>
              </div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 700 }}>Delete Prescription</h3>
              <p style={{ margin: "8px 0 0", color: "#fecaca", fontSize: "14px" }}>This action cannot be undone</p>
            </div>
            
            <div style={{ padding: "24px" }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#7f1d1d", fontWeight: 600, marginBottom: "8px" }}>Prescription Details:</p>
                <div style={{ fontSize: "13px", color: "#991b1b", lineHeight: "1.5" }}>
                  <p style={{ margin: "4px 0" }}><strong>ID:</strong> {deleteConfirm.rx.id.substring(0, 8)}...</p>
                  <p style={{ margin: "4px 0" }}><strong>Date:</strong> {new Date(deleteConfirm.rx.createdAt).toLocaleDateString()}</p>
                  <p style={{ margin: "4px 0" }}><strong>Status:</strong> {deleteConfirm.rx.status}</p>
                  {deleteConfirm.rx.diagnosis && (
                    <p style={{ margin: "4px 0" }}><strong>Diagnosis:</strong> {deleteConfirm.rx.diagnosis}</p>
                  )}
                </div>
              </div>
              
              <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#475569", textAlign: "center" }}>
                Are you sure you want to permanently delete this prescription?
              </p>
            </div>
            
            <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                style={{ 
                  flex: 1, 
                  padding: "12px 20px", 
                  borderRadius: "10px", 
                  border: "1px solid #e2e8f0", 
                  background: "#fff", 
                  color: "#475569", 
                  fontWeight: 600, 
                  fontSize: "14px", 
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                style={{ 
                  flex: 1, 
                  padding: "12px 20px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: "linear-gradient(135deg,#dc2626,#b91c1c)", 
                  color: "#fff", 
                  fontWeight: 700, 
                  fontSize: "14px", 
                  cursor: "pointer", 
                  boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg,#b91c1c,#991b1b)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(220,38,38,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg,#dc2626,#b91c1c)";
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(220,38,38,0.35)";
                }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          animation: "slideInRight 0.3s ease"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderRadius: "12px",
            background: toast.type === "success" 
              ? "linear-gradient(135deg,#10b981,#059669)" 
              : "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            minWidth: "300px",
            maxWidth: "400px"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <span style={{ fontSize: "18px", fontWeight: "bold", lineHeight: "1" }}>
                {toast.type === "success" ? "✓" : "✗"}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                flexShrink: 0
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
