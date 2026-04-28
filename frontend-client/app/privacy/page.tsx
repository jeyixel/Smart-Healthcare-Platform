import StaticLayout from "@/app/components/common/StaticLayout";

export const metadata = {
  title: "Privacy Policy | SmartHealth",
  description: "Learn how SmartHealth protects your personal and medical data.",
};

export default function PrivacyPage() {
  return (
    <StaticLayout title="Privacy Policy" lastUpdated="April 28, 2026">
      <p>
        At SmartHealth, your privacy is our top priority. This Privacy Policy outlines how we collect, use, 
        and safeguard your personal and medical information when you use our platform.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information to provide a better experience and ensure the safety of our patients:
      </p>
      <ul>
        <li><strong>Personal Information:</strong> Name, email address, phone number, and date of birth provided during registration.</li>
        <li><strong>Medical Information:</strong> Health records, prescriptions, and consultation history shared with healthcare providers.</li>
        <li><strong>Usage Data:</strong> Information on how you interact with our platform to improve our services.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>
        Your data is used exclusively for providing healthcare services:
      </p>
      <ul>
        <li>To facilitate medical consultations and appointments.</li>
        <li>To provide AI-driven health suggestions via our Gemini integration.</li>
        <li>To process payments securely through our payment gateways.</li>
        <li>To send important health alerts and notifications via Kafka.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>
        We implement banking-grade encryption and strict access controls. Your medical data is encrypted 
        both in transit and at rest. We never sell your data to third parties.
      </p>

      <h2>4. Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your personal information at any time. 
        You can manage your data through your patient portal or by contacting our support team.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. We will notify you of any significant changes 
        via email or a prominent notice on our platform.
      </p>
    </StaticLayout>
  );
}
