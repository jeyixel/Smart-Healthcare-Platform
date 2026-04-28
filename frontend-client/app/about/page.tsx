import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
import LandingFooter from "@/app/components/common/landing/LandingFooter";
import styles from "./About.module.css";

export const metadata = {
  title: "About Us | SmartHealth",
  description: "Learn more about SmartHealth and our mission to revolutionize healthcare.",
};

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      <PatientNavbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Our Mission to <span className={styles.accent}>Revolutionize</span> Healthcare</h1>
            <p className={styles.subtitle}>
              At SmartHealth, we believe that quality healthcare should be accessible, seamless, and intelligent. 
              Our platform leverages cutting-edge technology to bridge the gap between patients and providers.
            </p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3>Advanced Technology</h3>
                <p>Built on a robust microservices architecture using Spring Boot, Next.js, and Kafka for real-time health events.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <h3>AI-Driven Insights</h3>
                <p>Integrating Google Gemini AI to provide personalized health suggestions and proactive wellness tips.</p>
              </div>
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3>Global Accessibility</h3>
                <p>Telemedicine powered by Jitsi ensures you can consult with specialists from anywhere in the world.</p>
              </div>
            </div>

            <div className={styles.story}>
              <h2>The SmartHealth Story</h2>
              <p>
                SmartHealth started as a vision to simplify the complex world of medical appointments and records. 
                We saw the friction in traditional healthcare systems—lost prescriptions, long wait times, and fragmented data.
              </p>
              <p>
                By building a centralized, secure platform, we've enabled patients to take control of their health journey 
                while giving doctors the tools they need to provide better care. Today, we serve thousands of users 
                with a focus on security, reliability, and innovation.
              </p>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
