// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Base interface for bounty discovery adapters.
 * All adapters must be read-only and bounded.
 */
export interface BountyDiscoveryAdapter {
  discover(): Promise<any[]>; // Raw API response (normalized by service)
}
