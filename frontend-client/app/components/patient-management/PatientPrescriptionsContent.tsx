"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePatientPrescriptions } from "@/app/hooks/usePatientPrescriptions";

function formatDate(date: string | null): string {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function handleDownload(rx: any, patientName: string) {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // Fetch doctor information
  let doctorName = 'Dr. Unknown';
  try {
    const token = localStorage.getItem("smart_admin_token");
    if (token && rx.doctorId) {
      // Try to get doctor from active doctors list
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_BASE || "http://127.0.0.1:8080"}/api/v1/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (response.ok) {
        const doctors = await response.json();
        const doctorsArray = Array.isArray(doctors) ? doctors : doctors.value || doctors.data || doctors.items || [];
        const doctor = doctorsArray.find((d: any) => d.id === rx.doctorId);
        if (doctor && doctor.fullName) {
          doctorName = `Dr. ${doctor.fullName}`;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch doctor name:', error);
  }

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

  let itemsHtml = rx.items.map((i: any) => `
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
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Patient:</strong> ${patientName || 'Patient Name'}</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Doctor:</strong> ${doctorName}</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Prescription ID:</strong> RX-${rx.id.substring(0, 8).toUpperCase()}</p>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Date Issued:</strong> ${new Date(rx.createdAt).toLocaleDateString()}</p>
        <p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Status:</strong> ${rx.status}</p>
        ${rx.followUpRequired && rx.followUpDate ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong style="color: #475569; display: inline-block; width: 100px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Follow-Up:</strong> ${formatDate(rx.followUpDate)}</p>` : ''}
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

export function PatientPrescriptionsContent() {
  const { loading, error, prescriptions, patientName, refetch } = usePatientPrescriptions();
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [doctorName, setDoctorName] = useState<string>('Dr. Unknown');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ISSUED' | 'DRAFT' | 'CANCELLED'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPrescriptions = useMemo(() => {
    let filtered = [...prescriptions];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rx => 
        rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.clinicalNotes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.items.some((item: any) => item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rx => rx.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(rx => new Date(rx.createdAt) >= filterDate);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [prescriptions, searchTerm, statusFilter, dateFilter]);

  // Fetch doctor name when modal opens
  useEffect(() => {
    if (showDetailsModal && selectedPrescription?.doctorId) {
      const fetchDoctorName = async () => {
        try {
          const token = localStorage.getItem("smart_admin_token");
          if (token && selectedPrescription.doctorId) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_BASE || "http://127.0.0.1:8080"}/api/v1/doctors`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            if (response.ok) {
              const doctors = await response.json();
              const doctorsArray = Array.isArray(doctors) ? doctors : doctors.value || doctors.data || doctors.items || [];
              const doctor = doctorsArray.find((d: any) => d.id === selectedPrescription.doctorId);
              if (doctor && doctor.fullName) {
                setDoctorName(`Dr. ${doctor.fullName}`);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch doctor name:', error);
        }
      };
      fetchDoctorName();
    }
  }, [showDetailsModal, selectedPrescription?.doctorId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing prescriptions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex flex-col items-center gap-8 max-w-md w-full">
            {/* Enhanced Loading Animation */}
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500"></div>
              <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 animation-delay-150"></div>
              <div className="absolute inset-2 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                  <svg className="h-8 w-8 text-cyan-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading Text with Enhanced Styling */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 animate-pulse">Loading Your Prescriptions</h2>
              <p className="text-slate-600 font-medium">Please wait while we fetch your medical prescriptions...</p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce animation-delay-200"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading Tips */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/60 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prescription Safety Tip
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Always keep your prescriptions organized and follow the dosage instructions provided by your healthcare provider for optimal treatment outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 text-slate-900 selection:bg-cyan-500/30">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-size-200 bg-pos-0 animate-gradient-shift">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Side - Title and Info */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Medical Prescriptions</h1>
                <p className="text-white/80 text-sm lg:text-base">Your comprehensive prescription records</p>
              </div>
            </div>

            {/* Right Side - Stats */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                {filteredPrescriptions.length} Prescriptions
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                {patientName || 'Loading...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by diagnosis, clinical notes, or medication..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="ISSUED">Issued</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-white"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-50/50 p-8 text-center backdrop-blur-md shadow-lg">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Network Connection Issue</h3>
                <p className="text-amber-700 text-sm mb-4 leading-relaxed">
                  We're having trouble connecting to our servers. This could be due to:
                </p>
                <ul className="text-amber-700 text-sm text-left space-y-1 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Poor internet connection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Server temporarily unavailable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Network firewall blocking the connection</span>
                  </li>
                </ul>
                <p className="text-amber-600 text-xs mb-4">
                  Error details: {error}
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600"
                >
                  {isRefreshing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Prescriptions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prescription List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl p-20 text-center flex flex-col items-center shadow-xl">
             <div className="w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mb-8 text-cyan-500 border border-cyan-200 shadow-lg">
               <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             </div>
             <h3 className="text-3xl font-bold text-slate-900 mb-4">No Prescriptions Issued</h3>
             <p className="text-slate-600 max-w-md text-lg leading-relaxed">
               Your medical records will appear here as soon as they are finalized by your healthcare provider.
             </p>
             <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200/60">
               <p className="text-sm text-slate-700 font-medium">
                 💡 <strong>Tip:</strong> Prescriptions are typically available within 24 hours after your appointment.
               </p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrescriptions.map((rx: any, index: number) => (
              <article key={rx.id} className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-xs font-bold text-white">RX-{rx.id.toString().slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-black tracking-widest uppercase ${
                      rx.status === "ISSUED" ? "bg-emerald-500 text-white" :
                      rx.status === "DRAFT" ? "bg-amber-500 text-white" :
                      "bg-rose-500 text-white"
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-white/80">Issue Date</p>
                      <p className="text-sm font-bold text-white">{formatDate(rx.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">Medications</p>
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-1 rounded-full">
                        {rx.items.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {rx.items.slice(0, 2).map((item: any, itemIndex: number) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 truncate flex-1">{item.medicineName}</span>
                          <span className="text-slate-500 ml-2">{item.dosage}</span>
                        </div>
                      ))}
                      {rx.items.length > 2 && (
                        <p className="text-xs text-slate-400 italic">+{rx.items.length - 2} more medications</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Diagnosis</p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {rx.diagnosis || "No diagnosis recorded"}
                    </p>
                  </div>

                  {rx.followUpRequired && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-xs font-bold text-amber-700">Follow-up Required</p>
                      <p className="text-xs text-amber-600">{formatDate(rx.followUpDate)}</p>
                    </div>
                  )}
                </div>

                {/* Fixed Button Container */}
                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPrescription(rx);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg px-3 py-2 text-xs font-bold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 cursor-pointer"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDownload(rx, patientName)}
                      className="bg-slate-100 text-slate-700 rounded-lg px-3 py-2 text-xs font-bold hover:bg-slate-200 transition-colors duration-300 cursor-pointer flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Prescription Details Modal */}
        {showDetailsModal && selectedPrescription && (
          <div onClick={() => {
            setShowDetailsModal(false);
            setSelectedPrescription(null);
          }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 900, display: "flex", alignItems: "stretch", justifyContent: "flex-end" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 95vw)", background: "#fff", boxShadow: "-20px 0 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", animation: "slideRight 0.3s cubic-bezier(0.4,0,0.2,1)" }}>

              {/* Top strip */}
              <div style={{ background: "linear-gradient(135deg,#0a0f1e,#0d1b3e)", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#06b6d4", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)", padding: "3px 10px", borderRadius: "999px" }}>
                  Prescription Details
                </span>
                  <button onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPrescription(null);
                  }} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", width: "28px", height: "28px", borderRadius: "8px", fontSize: "14px" }}>✕</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px", boxShadow: "0 0 20px rgba(6,182,212,0.44)", flexShrink: 0 }}>
                    <svg style={{ width: "24px", height: "24px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>PRESCRIPTION ID</p>
                    <p style={{ margin: "2px 0 0", color: "#e2e8f0", fontWeight: 700, fontSize: "13px", fontFamily: "monospace" }}>RX-{selectedPrescription.id.slice(0, 18)}…</p>
                    {(() => {
                      const statusColors = {
                        "ISSUED": { bg: "rgba(16,185,129,0.10)", color: "#059669", dot: "#10b981", border: "rgba(16,185,129,0.25)" },
                        "DRAFT": { bg: "rgba(245,158,11,0.10)", color: "#d97706", dot: "#f59e0b", border: "rgba(245,158,11,0.25)" },
                        "CANCELLED": { bg: "rgba(239,68,68,0.10)", color: "#dc2626", dot: "#ef4444", border: "rgba(239,68,68,0.25)" }
                      };
                      const status = statusColors[selectedPrescription.status as keyof typeof statusColors] || statusColors.DRAFT;
                      return (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700,
                          background: status.bg, color: status.color, border: `1px solid ${status.border}`, padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.02em", whiteSpace: "nowrap"
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status.dot, flexShrink: 0 }} />
                          {selectedPrescription.status}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {/* InfoRow Component */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>📅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Issued Date</p>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                      {formatDate(selectedPrescription.createdAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>👨</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Doctor</p>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                      {doctorName}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>🆔</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Prescription ID</p>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#334155", fontFamily: "monospace" }}>
                      RX-{selectedPrescription.id.slice(0, 22)}…
                    </p>
                  </div>
                </div>

                {selectedPrescription.followUpRequired && selectedPrescription.followUpDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
                    <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>🔁</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Follow Up Date</p>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "#06b6d4" }}>
                        {formatDate(selectedPrescription.followUpDate)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPrescription.diagnosis && (
                  <div style={{ marginTop: "16px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Diagnosis</p>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                      {selectedPrescription.diagnosis}
                    </div>
                  </div>
                )}

                {selectedPrescription.clinicalNotes && (
                  <div style={{ marginTop: "14px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Clinical Notes</p>
                    <div style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                      {selectedPrescription.clinicalNotes}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "24px" }}>
                  <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Medications ({selectedPrescription.items.length})</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedPrescription.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{item.medicineName}</strong>
                          <span style={{ fontSize: "11px", fontWeight: 700, background: "#f1f5f9", padding: "2px 8px", borderRadius: "999px", color: "#475569" }}>{item.quantity || "N/A"}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                          <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Dosage:</span> {item.dosage}</div>
                          <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Freq:</span> {item.frequency}</div>
                          <div style={{ color: "#64748b" }}><span style={{ color: "#94a3b8" }}>Duration:</span> {item.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              {selectedPrescription.digitalSignature && (
                <div style={{ marginTop: "24px", textAlign: "right", marginRight: "20px" }}>
                  <img src={selectedPrescription.digitalSignature} alt="Doctor's Signature" style={{ width: "120px", borderBottom: "1px solid #cbd5e1", display: "inline-block" }} />
                  <p style={{ margin: "4px 0 0", color: "#334155", fontSize: "12px", fontWeight: 600 }}>Doctor's Signature</p>
                </div>
              )}

              {/* Footer actions */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", background: "#f8fafc" }}>
                <button
                  onClick={() => handleDownload(selectedPrescription, patientName)}
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
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPrescription(null);
                  }}
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
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
        .bg-pos-0 {
          background-position: 0% 50%;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
