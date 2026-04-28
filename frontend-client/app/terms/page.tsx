import StaticLayout from "@/app/components/common/StaticLayout";

export const metadata = {
  title: "Terms of Service | SmartHealth",
  description: "The terms and conditions for using the SmartHealth platform.",
};

export default function TermsPage() {
  return (
    <StaticLayout title="Terms of Service" lastUpdated="April 28, 2026">
      <p>
        Welcome to SmartHealth. By accessing or using our platform, you agree to comply with 
        and be bound by the following terms and conditions.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account on SmartHealth, you acknowledge that you have read, understood, 
        and agree to these Terms of Service.
      </p>

      <h2>2. Use of the Platform</h2>
      <p>
        SmartHealth provides a platform for connecting patients with healthcare providers. 
        You agree to use the platform only for lawful purposes and in a way that does not 
        infringe the rights of others.
      </p>

      <h2>3. Medical Disclaimer</h2>
      <p>
        <strong>Important:</strong> AI suggestions provided by SmartHealth are for informational 
        purposes only and do not constitute professional medical advice. Always consult with 
         a qualified healthcare provider for any medical concerns.
      </p>

      <h2>4. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials. 
        Any activity that occurs under your account is your responsibility.
      </p>

      <h2>5. Payments and Refunds</h2>
      <p>
        Payments for consultations are processed through secure gateways. Refund policies 
        depend on the specific healthcare provider and the timing of cancellations.
      </p>

      <h2>6. Termination</h2>
      <p>
        We reserve the right to terminate or suspend your account if you violate these terms 
        or engage in fraudulent activity on the platform.
      </p>

      <h2>7. Contact Information</h2>
      <p>
        If you have any questions regarding these terms, please contact us at support@smarthealth.com.
      </p>
    </StaticLayout>
  );
}
