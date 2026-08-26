'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlatformStatus } from '@/types/platform';
import styles from './SystemStatus.module.css';

type StatusState = 'loading' | 'success' | 'error';

export default function SystemStatus() {
  const [statusState, setStatusState] = useState<StatusState>('loading');
  const [data, setData] = useState<PlatformStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchHealth = useCallback(async () => {
    setStatusState('loading');
    setErrorMessage(null);
    const startTime = performance.now();

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      });

      const responseTime = Math.round(performance.now() - startTime);
      setLatency(responseTime);

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status} (${response.statusText || 'Error'})`);
      }

      const result: PlatformStatus = await response.json();

      if (result.status === 'ok' || response.ok) {
        setData(result);
        setStatusState('success');
        setLastChecked(new Date());
      } else {
        throw new Error(result.message || 'Platform reported unhealthy status');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to /api/health';
      setErrorMessage(msg);
      setStatusState('error');
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <section className={styles.section} aria-labelledby="system-status-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.sectionTag}>
            <span className={styles.statusLiveDot} aria-hidden="true" />
            Live Telemetry
          </div>
          <h2 id="system-status-heading" className={styles.sectionTitle}>
            System Status
          </h2>
          <p className={styles.sectionSubtitle}>
            Continuous operational check connecting directly to <code>/api/health</code>.
          </p>
        </div>

        <button
          id="refresh-system-status-btn"
          type="button"
          onClick={fetchHealth}
          disabled={statusState === 'loading'}
          className={styles.refreshButton}
          aria-label="Refresh system health status"
          title="Query /api/health again"
        >
          <svg
            className={`${styles.refreshIcon} ${statusState === 'loading' ? styles.spinning : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{statusState === 'loading' ? 'Checking...' : 'Recheck Status'}</span>
        </button>
      </div>

      <div
        className={`${styles.card} ${
          statusState === 'success'
            ? styles.cardSuccess
            : statusState === 'error'
            ? styles.cardError
            : styles.cardLoading
        }`}
        role="region"
        aria-live="polite"
        aria-busy={statusState === 'loading'}
      >
        {/* Loading State */}
        {statusState === 'loading' && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingHeader}>
              <div className={styles.loadingSpinner} aria-hidden="true" />
              <div className={styles.loadingStatusText}>
                <span className={styles.loadingLabel}>Querying /api/health</span>
                <span className={styles.loadingTitle}>Checking Platform Status...</span>
              </div>
            </div>
            <p className={styles.loadingDescription}>
              Sending health probe to backend API to retrieve real-time operational status and module availability.
            </p>
            <div className={styles.skeletonGrid}>
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
              <div className={styles.skeletonItem} />
            </div>
          </div>
        )}

        {/* Success State */}
        {statusState === 'success' && data && (
          <div className={styles.successContainer}>
            <div className={styles.statusMainBar}>
              <div className={styles.statusIndicatorGroup}>
                <span className={styles.pulseContainer}>
                  <span className={styles.pulseRing} />
                  <span className={styles.pulseDot} />
                </span>
                <div>
                  <div className={styles.statusHeadline}>
                    Platform Status: <span className={styles.highlightOnline}>Online</span>
                  </div>
                  <div className={styles.statusSubline}>
                    {data.message}
                  </div>
                </div>
              </div>

              <div className={styles.metaBadgeGroup}>
                <span className={styles.statusPill}>
                  <span className={styles.pillLabel}>HTTP</span> 200 OK
                </span>
                {latency !== null && (
                  <span className={styles.statusPill}>
                    <span className={styles.pillLabel}>Latency</span> {latency} ms
                  </span>
                )}
                {lastChecked && (
                  <span className={styles.statusPill}>
                    <span className={styles.pillLabel}>Checked</span> {lastChecked.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Initiative Phase</span>
                <span className={styles.detailValue}>{data.phase}</span>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>API Version</span>
                <span className={styles.detailValue}>v{data.version}</span>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailLabel}>Core Features</span>
                <div className={styles.featurePills}>
                  <span className={styles.featureBadge}>
                    <span className={styles.checkIcon}>&#x2713;</span> Digital Skills
                  </span>
                  <span className={styles.featureBadge}>
                    <span className={styles.checkIcon}>&#x2713;</span> AI Education
                  </span>
                  <span className={styles.featureBadge}>
                    <span className={styles.checkIcon}>&#x2713;</span> Mentorship
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {statusState === 'error' && (
          <div className={styles.errorContainer}>
            <div className={styles.errorHeader}>
              <div className={styles.errorIconWrapper}>
                <svg
                  className={styles.errorIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <div className={styles.errorHeadline}>
                  Platform Status: <span className={styles.highlightOffline}>Offline</span>
                </div>
                <p className={styles.errorMessage}>
                  {errorMessage || 'Unable to establish connection with the backend service at /api/health.'}
                </p>
              </div>
            </div>

            <div className={styles.errorActions}>
              <button
                type="button"
                onClick={fetchHealth}
                className={styles.retryButton}
              >
                Retry Connection
              </button>
              <span className={styles.errorTimestamp}>
                {lastChecked && `Last attempt: ${lastChecked.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
