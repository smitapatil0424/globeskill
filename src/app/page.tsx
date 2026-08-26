'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { PlatformStatus } from '@/types/platform';
import SystemStatus from '@/components/SystemStatus';

export default function Home() {
  const [statusResult, setStatusResult] = useState<string | null>(null);
  const [apiData, setApiData] = useState<PlatformStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExplore = async () => {
    setIsLoading(true);
    // Instant friendly feedback as requested: "GlobeSkill platform is successfully running."
    setStatusResult('GlobeSkill platform is successfully running.');

    try {
      // Step 3 -> Step 4 -> Step 5: Frontend calls Backend API (/api/health)
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: PlatformStatus = await res.json();
        setApiData(data);
      }
    } catch {
      // Fallback gracefully if offline
      setApiData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header / Brand Bar */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon} aria-hidden="true">
              GS
            </div>
            <span className={styles.brandName}>GlobeSkill</span>
          </div>
          <span className={styles.initiativeBadge}>Education Initiative</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.categoryTag}>
            <span className={styles.tagDot} aria-hidden="true" />
            Empowering Underserved Youth
          </div>

          <h1 className={styles.mainTitle}>GlobeSkill</h1>

          <p className={styles.tagline}>
            Technology &amp; AI Education for Every Child
          </p>

          <p className={styles.description}>
            GlobeSkill is an initiative to help underserved learners gain access to digital skills,
            technology education and AI-enabled career opportunities.
          </p>

          {/* Primary Action Button */}
          <div className={styles.actionArea}>
            <button
              id="explore-globeskill-button"
              className={styles.primaryButton}
              onClick={handleExplore}
              disabled={isLoading}
              aria-label="Explore GlobeSkill platform"
            >
              <span>{isLoading ? 'Checking Platform...' : 'Explore GlobeSkill'}</span>
              <span className={styles.buttonArrow} aria-hidden="true">&rarr;</span>
            </button>

            {/* Status Message Display */}
            {statusResult && (
              <div className={styles.statusContainer} role="status" aria-live="polite">
                <div className={styles.statusMessageCard}>
                  <span className={styles.statusIcon} aria-hidden="true">&#x2713;</span>
                  <div className={styles.statusContent}>
                    <div className={styles.statusPrimaryText}>{statusResult}</div>
                    {apiData && (
                      <div className={styles.statusSubText}>
                        <strong>Backend response:</strong> {apiData.message} &bull; <em>{apiData.phase}</em>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* System Status Section */}
        <SystemStatus />

        {/* 3-Tier Architecture Transparency Section */}
        <section className={styles.architectureSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Application Architecture &amp; Separation of Concerns</h2>
            <p className={styles.sectionSubtitle}>
              Clean 3-tier architecture demonstrating clean boundaries between presentation, API handling, and core business logic.
            </p>
          </div>

          <div className={styles.architectureFlow}>
            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>Layer 1</span>
              <div className={styles.stepTitle}>Frontend (UI)</div>
              <div className={styles.stepDetail}>src/app/page.tsx</div>
            </div>

            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>Layer 2</span>
              <div className={styles.stepTitle}>API Route</div>
              <div className={styles.stepDetail}>/api/health</div>
            </div>

            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>Layer 3</span>
              <div className={styles.stepTitle}>Business Logic</div>
              <div className={styles.stepDetail}>getPlatformStatus()</div>
            </div>

            <div className={styles.flowStep}>
              <span className={styles.stepNumber}>Layer 4</span>
              <div className={styles.stepTitle}>JSON Response</div>
              <div className={styles.stepDetail}>{'{ status: "ok" }'}</div>
            </div>
          </div>
        </section>

        {/* Impact Pillars */}
        <section className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">&#x1F4BB;</div>
            <h3 className={styles.pillarTitle}>Digital Foundations</h3>
            <p className={styles.pillarText}>
              Providing foundational computer literacy and digital tools to children in underserved communities.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">&#x1F916;</div>
            <h3 className={styles.pillarTitle}>AI &amp; Tech Literacy</h3>
            <p className={styles.pillarText}>
              Demystifying artificial intelligence through hands-on, accessible, and ethical learning pathways.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">&#x1F393;</div>
            <h3 className={styles.pillarTitle}>Future Careers</h3>
            <p className={styles.pillarText}>
              Bridging the digital divide to prepare the next generation for sustainable technology careers.
            </p>
          </div>
        </section>
      </main>

      {/* Clean Accessible Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} GlobeSkill Initiative. Dedicated to accessible technology &amp; AI education.</p>
      </footer>
    </div>
  );
}
