export interface HealthResponse {
  status: string;
  project: string;
  message: string;
}

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER
 * ============================================================================
 * Encapsulates the domain logic for platform health reporting.
 * Kept completely decoupled from HTTP transport protocols (Request/Response),
 * making it testable, portable, and reusable.
 */
export function getHealthStatus(): HealthResponse {
  return {
    status: 'ok',
    project: 'GlobeSkill',
    message: 'GlobeSkill backend is running',
  };
}
