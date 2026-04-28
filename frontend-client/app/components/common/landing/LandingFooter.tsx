import Link from "next/link";
import styles from "./LandingFooter.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <h3>
              Smart<span className={styles.footerBrandAccent}>Health</span>
            </h3>
            <p>
              Comprehensive microservices-based healthcare platform. Connecting patients
              and providers through modern technology.
            </p>
          </div>
          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <ul>
              <li><Link href="/#ai-insights">AI Insights</Link></li>
              <li><Link href="/#telemedicine">Telemedicine</Link></li>
              <li><Link href="/#appointments">Appointments</Link></li>
              <li><Link href="/#prescriptions">Prescriptions</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Resources</h4>
            <ul>
              <li><Link href="/#payments">Payments</Link></li>
              <li><Link href="/#alerts">Notifications</Link></li>
              <li><Link href="/login">Patient Portal</Link></li>
              <li><Link href="/register">Create Account</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>
            © {new Date().getFullYear()} SmartHealth. All rights reserved.
          </span>
          <div className={styles.footerSocials}>
            <span className={styles.footerSocialIcon} aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </span>
            <span className={styles.footerSocialIcon} aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </span>
            <span className={styles.footerSocialIcon} aria-label="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
