import { PlatformStatus } from '@/types/platform';

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER
 * ============================================================================
 * This service handles domain logic for platform management and health reporting.
 * It remains independent of HTTP request/response handling (which belongs in the API layer).
 */

/**
 * Retrieve the current operational status, phase, and metadata of GlobeSkill.
 * 
 * @returns {PlatformStatus} Current platform status and business metrics
 */
export function getPlatformStatus(): PlatformStatus {
  return {
    status: 'ok',
    project: 'GlobeSkill',
    tagline: 'Technology & AI Education for Every Child',
    message: 'GlobeSkill backend is running',
    phase: 'Phase 1: Foundation & Digital Skills Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      digitalSkills: true,
      aiEducation: true,
      mentorship: true,
    },
  };
}
