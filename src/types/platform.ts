/**
 * Platform status data types representing the domain model
 * for the GlobeSkill business logic and API contracts.
 */

export interface PlatformStatus {
  status: 'ok' | 'degraded' | 'maintenance';
  project: string;
  tagline: string;
  message: string;
  phase: string;
  version: string;
  timestamp: string;
  features: {
    digitalSkills: boolean;
    aiEducation: boolean;
    mentorship: boolean;
  };
}
