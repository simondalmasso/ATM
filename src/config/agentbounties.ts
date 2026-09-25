// SPDX-License-Identifier: AGPL-3.0-only

/**
 * AgentBounties configuration (read-only, no credentials).
 * Enforces WATCH_ONLY status until cash-settlement gates are proven.
 */
export const AGENTBOUNTIES_CONFIG = {
  enabled: true,
  autoEligible: false, // Hardcoded WATCH_ONLY per ATM policy
  discoveryIntervalMinutes: 60,
  maxConcurrentRequests: 1,
};
