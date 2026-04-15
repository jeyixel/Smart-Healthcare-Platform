import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Smart Healthcare Platform",
  description: "Manage appointments, patients, prescriptions and consultations",
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
