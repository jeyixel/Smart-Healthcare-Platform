import React from "react";
import PatientNavbar from "@/app/components/common/navbar/PatientNavbar";
import LandingFooter from "@/app/components/common/landing/LandingFooter";
import styles from "./StaticLayout.module.css";

interface StaticLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export default function StaticLayout({ children, title, lastUpdated }: StaticLayoutProps) {
  return (
    <div className={styles.pageWrapper}>
      <PatientNavbar />
      <main className={styles.main}>
        <section className={styles.header}>
          <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            {lastUpdated && <p className={styles.lastUpdated}>Last Updated: {lastUpdated}</p>}
          </div>
        </section>
        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.prose}>
              {children}
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
