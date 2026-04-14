"use client";

import { Patient } from "@/types/api";

interface PatientTableProps {
  patients: Patient[];
  loading: boolean;
  canMutate: boolean;
  onRefresh: () => void;
  onToggleStatus: (patient: Patient, active: boolean) => void;
}

export function PatientTable({
  patients,
  loading,
  canMutate,
  onRefresh,
  onToggleStatus,
}: PatientTableProps) {
  return (
    <section className="panel">
      <div className="panel-header-row">
        <div>
          <h2>Patients</h2>
          <p className="panel-subtitle">Live data from service-patient</p>
        </div>
        <button disabled={loading} onClick={onRefresh} className="btn btn-ghost" type="button">
          Refresh
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  No patients found.
                </td>
              </tr>
            )}
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.firstName} {patient.lastName}</td>
                <td>{patient.email}</td>
                <td>{patient.phoneNumber}</td>
                <td>
                  <span className={patient.active ? "pill pill-active" : "pill pill-inactive"}>
                    {patient.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td>
                  <div className="actions-row">
                    <button
                      disabled={!canMutate || loading || patient.active}
                      onClick={() => onToggleStatus(patient, true)}
                      className="btn btn-small"
                      type="button"
                    >
                      Activate
                    </button>
                    <button
                      disabled={!canMutate || loading || !patient.active}
                      onClick={() => onToggleStatus(patient, false)}
                      className="btn btn-small btn-ghost"
                      type="button"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
