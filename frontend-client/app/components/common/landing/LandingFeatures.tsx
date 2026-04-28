"use client";

import { useRef, ReactNode } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import styles from "./LandingFeatures.module.css";

import LandingFooter from "./LandingFooter";

/* ══════════════════════════════════════════════════
   SVG Icons for each feature
══════════════════════════════════════════════════ */
const AiInsightsIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4v4" />
    <path d="M24 40v4" />
    <path d="M4 24h4" />
    <path d="M40 24h4" />
    <circle cx="24" cy="24" r="12" />
    <path d="M24 16v8l6 4" />
    <path d="M18 14l-6-6" />
    <path d="M30 14l6-6" />
    <path d="M18 34l-6 6" />
    <path d="M30 34l6 6" />
    <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
  </svg>
);

const TelemedicineIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="36" height="26" rx="3" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <line x1="24" y1="34" x2="24" y2="40" />
    <line x1="18" y1="40" x2="30" y2="40" />
    <circle cx="24" cy="19" r="5" />
    <path d="M17 25a7 7 0 0 1 14 0" />
  </svg>
);

const AppointmentIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="10" width="32" height="32" rx="3" />
    <line x1="16" y1="6" x2="16" y2="14" />
    <line x1="32" y1="6" x2="32" y2="14" />
    <line x1="8" y1="18" x2="40" y2="18" />
    <path d="M20 28l4 4 6-8" />
  </svg>
);

const PrescriptionIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h20a2 2 0 0 1 2 2v36a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <line x1="18" y1="12" x2="30" y2="12" />
    <line x1="18" y1="18" x2="30" y2="18" />
    <line x1="18" y1="24" x2="26" y2="24" />
    <path d="M20 30h8v6h-8z" fill="currentColor" stroke="none" opacity="0.2" />
    <path d="M22 32h4" />
    <path d="M24 30v4" />
  </svg>
);

const PaymentsIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="12" width="40" height="26" rx="3" />
    <line x1="4" y1="20" x2="44" y2="20" />
    <line x1="4" y1="26" x2="44" y2="26" />
    <rect x="10" y="30" width="10" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
    <circle cx="36" cy="32" r="3" />
    <circle cx="32" cy="32" r="3" />
  </svg>
);

const AlertsIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 38a6 6 0 0 0 12 0" />
    <path d="M24 4v2" />
    <path d="M10 18a14 14 0 0 1 28 0c0 7 3 11 3 11H7s3-4 3-11z" />
    <circle cx="36" cy="10" r="5" fill="currentColor" stroke="none" opacity="0.35" />
    <circle cx="36" cy="10" r="3" fill="currentColor" stroke="none" />
  </svg>
);

/* ══════════════════════════════════════════════════
   Feature data
══════════════════════════════════════════════════ */
interface FeatureData {
  id: string;
  number: string;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  icon: ReactNode;
  bgGradient: string;
}

const FEATURES: FeatureData[] = [
  {
    id: "ai-insights",
    number: "01",
    tag: "Artificial Intelligence",
    title: "AI-Powered Health Insights",
    description:
      "Harness the power of Google Gemini to receive intelligent health suggestions tailored to your unique medical profile. Our AI engine analyzes your records, conditions, and lifestyle to deliver proactive wellness recommendations.",
    bullets: [
      "Personalized health tips based on your medical history",
      "Gemini-integrated suggestion engine with contextual analysis",
      "Real-time risk assessments and preventive care alerts",
    ],
    icon: <AiInsightsIcon />,
    bgGradient: "radial-gradient(ellipse at 70% 40%, rgba(56,211,203,0.06) 0%, transparent 60%)",
  },
  {
    id: "telemedicine",
    number: "02",
    tag: "Virtual Care",
    title: "Seamless Telemedicine",
    description:
      "Connect with certified specialists through crystal-clear HD video consultations powered by Jitsi. No downloads, no hassle — just click and start your appointment from the comfort of your home.",
    bullets: [
      "Jitsi-powered secure video consultation rooms",
      "One-click join with no additional software required",
      "Screen sharing and real-time medical document review",
    ],
    icon: <TelemedicineIcon />,
    bgGradient: "radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.06) 0%, transparent 60%)",
  },
  {
    id: "appointments",
    number: "03",
    tag: "Smart Scheduling",
    title: "Smart Appointments",
    description:
      "Book, reschedule, or cancel appointments in seconds with our real-time scheduling system. View live doctor availability, choose your preferred time slot, and receive instant confirmations.",
    bullets: [
      "Real-time doctor availability and slot booking",
      "Automated reminders and scheduling conflict detection",
      "Multi-specialty scheduling with custom time preferences",
    ],
    icon: <AppointmentIcon />,
    bgGradient: "radial-gradient(ellipse at 60% 60%, rgba(99,102,241,0.05) 0%, transparent 60%)",
  },
  {
    id: "prescriptions",
    number: "04",
    tag: "Medical Records",
    title: "Digital Prescriptions",
    description:
      "Access your complete medical history and prescriptions digitally from one centralized hub. No more lost papers — every consultation, every diagnosis, every prescription, securely stored and instantly accessible.",
    bullets: [
      "Centralized medical record and prescription management",
      "Downloadable PDF prescriptions and lab reports",
      "Complete consultation history with doctor annotations",
    ],
    icon: <PrescriptionIcon />,
    bgGradient: "radial-gradient(ellipse at 40% 30%, rgba(56,211,203,0.05) 0%, transparent 60%)",
  },
  {
    id: "payments",
    number: "05",
    tag: "Billing & Payments",
    title: "Secure Payments",
    description:
      "Pay for consultations, prescriptions, and lab tests instantly through our integrated PayHere payment gateway. Fast, secure, and fully compliant with banking-grade encryption standards.",
    bullets: [
      "Integrated PayHere gateway for instant billing",
      "Banking-grade SSL encryption for all transactions",
      "Automated receipts and payment history tracking",
    ],
    icon: <PaymentsIcon />,
    bgGradient: "radial-gradient(ellipse at 70% 70%, rgba(14,165,233,0.05) 0%, transparent 60%)",
  },
  {
    id: "alerts",
    number: "06",
    tag: "Real-time Notifications",
    title: "Instant Alerts",
    description:
      "Stay informed with our Kafka-driven event notification system. Receive real-time SMS and email alerts for appointments, prescriptions, lab results, and important health updates — never miss a thing.",
    bullets: [
      "Kafka-driven SMS and Email notification pipeline",
      "Real-time appointment and prescription status updates",
      "Configurable notification preferences and channels",
    ],
    icon: <AlertsIcon />,
    bgGradient: "radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.05) 0%, transparent 60%)",
  },
];

/* ══════════════════════════════════════════════════
   AnimatedSection — fade-in + slide-up on scroll
══════════════════════════════════════════════════ */
function AnimatedSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   ParallaxBackground — parallax scroll on bg layer
══════════════════════════════════════════════════ */
function ParallaxBackground({ gradient }: { gradient: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <motion.div
        className={styles.parallaxBg}
        style={{ y, background: gradient }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   FeatureSection — Individual feature block
══════════════════════════════════════════════════ */
function FeatureSection({ feature, index }: { feature: FeatureData; index: number }) {
  const isReversed = index % 2 !== 0;

  return (
    <section id={feature.id} className={styles.featureSection} aria-label={feature.title}>
      {/* Parallax background layer */}
      <ParallaxBackground gradient={feature.bgGradient} />

      {/* Overlay */}
      <div className={`${styles.parallaxOverlay} ${isReversed ? styles.overlayRight : styles.overlayLeft}`} />

      {/* Content */}
      <div className={`${styles.featureContent} ${isReversed ? styles.featureContentReverse : ""}`}>
        {/* Copy */}
        <AnimatedSection delay={0.1}>
          <div className={styles.featureCopy}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className={styles.featureNumber}>{feature.number}</span>
              <span className={styles.featureTag}>
                <span className={styles.featureTagDot} />
                {feature.tag}
              </span>
            </div>
            <h2 className={styles.featureHeading}>{feature.title}</h2>
            <p className={styles.featureDesc}>{feature.description}</p>
            <ul className={styles.featureBullets}>
              {feature.bullets.map((bullet, i) => (
                <li key={i} className={styles.featureBullet}>
                  <span className={styles.bulletCheck}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>

        {/* Visual */}
        <AnimatedSection delay={0.3}>
          <div className={styles.featureVisual}>
            <div className={styles.featureIconCard}>
              <div className={styles.iconRing} />
              <div className={styles.iconRingInner} />
              <div className={styles.iconGlow} />
              <div className={styles.iconMain}>{feature.icon}</div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════
   MAIN EXPORT — LandingFeatures
══════════════════════════════════════════════════ */
export default function LandingFeatures() {
  return (
    <>
      {/* ── Features Intro Header ── */}
      <section className={styles.featuresIntro} id="services">
        <AnimatedSection>
          <div className={styles.introInner}>
            <span className={styles.introEyebrow}>
              <span className={styles.introEyebrowLine} aria-hidden="true" />
              Platform Features
              <span className={styles.introEyebrowLine} aria-hidden="true" />
            </span>
            <h2 className={styles.introHeading}>
              Everything You Need for{" "}
              <span className={styles.introHeadingAccent}>Connected Care</span>
            </h2>
            <p className={styles.introDesc}>
              A comprehensive microservices-powered platform designed to modernize every
              aspect of your healthcare experience — from AI-driven insights to instant
              notifications.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Individual Feature Sections ── */}
      {FEATURES.map((feature, index) => (
        <div key={feature.id}>
          <FeatureSection feature={feature} index={index} />
          {index < FEATURES.length - 1 && <div className={styles.featureDivider} />}
        </div>
      ))}

      {/* ── Join Now CTA Section ── */}
      <section className={styles.ctaSection} id="join">
        <div className={styles.ctaBgGlow1} aria-hidden="true" />
        <div className={styles.ctaBgGlow2} aria-hidden="true" />
        <AnimatedSection>
          <div className={styles.ctaInner}>
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaHeading}>
                Ready to Experience the Future of Healthcare?
              </h2>
              <p className={styles.ctaDesc}>
                Join thousands of patients and healthcare professionals on SmartHealth.
                Create your account today and take the first step towards connected care.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/register" className={styles.ctaPrimary} id="cta-join-btn">
                  Join Now
                  <svg className={styles.ctaArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link href="/login" className={styles.ctaSecondary} id="cta-login-btn">
                  Already have an account? Log in
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ── */}
      <LandingFooter />
    </>
  );
}
