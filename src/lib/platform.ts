export interface PlatformStatus {
  project: string;
  status: string;
  phase: string;
  message: string;
}

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER
 * ============================================================================
 * Location: src/lib/platform.ts
 * 
 * Reusable domain logic that encapsulates the operational state of GlobeSkill.
 * Kept completely decoupled from Next.js HTTP Request/Response objects so it
 * can be safely called by API routes, Server Components, or background tasks.
 *
 * @returns {PlatformStatus} Current project name, status, phase, and welcome message.
 */
export function getPlatformStatus(): PlatformStatus {
  return {
    project: 'GlobeSkill',
    status: 'ok',
    phase: 'Phase 1: Foundation & Skill Development',
    message: 'Welcome to GlobeSkill - backend platform is successfully running.',
  };
}
