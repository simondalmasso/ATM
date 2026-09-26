// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Base interface for bounty discovery services.
 * Normalizes raw API data into ATM's evidence model.
 */
export interface BountyDiscoveryService {
  normalizeBounties(): Promise<any[]>;
  isAutoEligible(bounty: any): boolean;
}
