// SPDX-License-Identifier: AGPL-3.0-only
import { AgentBountiesBounty } from '../types/agentbounties.js';
import { BountyDiscoveryAdapter } from '../types/adapters.js';
import { fetchJson } from '../utils/http.js';

/**
 * AgentBounties API adapter for zero-spend bounty discovery.
 * Strictly read-only; no mutation or credential handling.
 */
export class AgentBountiesAdapter implements BountyDiscoveryAdapter {
  private readonly baseUrl = 'https://api.agentbounties.app/v1/base/autonomous-bounties/feed';

  async discover(): Promise<AgentBountiesBounty[]> {
    try {
      const response = await fetchJson(`${this.baseUrl}?network=base-mainnet&claimable_only=true`);
      if (!Array.isArray(response)) throw new Error('Invalid feed format');
      return response;
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('500')) {
        throw new Error('AgentBounties API unavailable');
      }
      throw error; // Re-throw for other cases (e.g., network issues)
    }
  }
}
