import type { Metadata } from "next";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
import PatientHero from "@/app/components/common/landing/PatientHero";
import LandingFeatures from "@/app/components/common/landing/LandingFeatures";

export const metadata: Metadata = {
  title: "Smart Healthcare – Patient Portal | Book Appointments & Manage Your Health",
  description:
    "Access world-class healthcare from home. Book appointments, consult specialists, track your health, and manage prescriptions securely on Smart Healthcare Platform.",
};

export default function PatientLandingPage() {
  return (
    <>
      <PatientNavbar />
      <main id="main-content">
        <PatientHero />
        <LandingFeatures />
      </main>
    </>
  );
}
