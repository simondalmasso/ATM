// SPDX-License-Identifier: AGPL-3.0-only
import { AgentBountiesAdapter } from '../adapters/agentbounties.js';
import { NormalizedAgentBounty } from '../types/agentbounties.js';
import { BountyDiscoveryService } from '../types/services.js';

/**
 * AgentBounties-specific discovery logic.
 * Enforces ATM policy: zero-spend only, no auto-eligibility for bonds/fees.
 */
export class AgentBountiesDiscovery implements BountyDiscoveryService {
  private readonly adapter = new AgentBountiesAdapter();

  async normalizeBounties(): Promise<NormalizedAgentBounty[]> {
    const rawBounties = await this.adapter.discover();
    return rawBounties.map(this.normalizeBounty);
  }

  private normalizeBounty(bounty: any): NormalizedAgentBounty {
    // Calculate OWNER_SPEND: bonds + external spend (gas/fees)
    const ownerSpend = (
      bounty.claim_bond || 0
    ) + (
      bounty.required_external_spend || 0
    );

    return {
      source: 'agentbounties',
      id: bounty.id,
      title: bounty.title,
      description: bounty.description,
      reward_usd: bounty.reward,
      deadline: bounty.deadline,
      is_competition: bounty.is_competition,
      competition_id: bounty.competition_id,
      owner_address: bounty.owner_address,
      status: bounty.status,
      owner_spend_usd: ownerSpend,
      evidence: {}, // Empty until settlement proof is added
    };
  }

  /**
   * ATM policy: zero-spend only, no auto-eligibility for bonds/fees.
   * @returns true if bounty meets zero-spend criteria.
   */
  isAutoEligible(bounty: NormalizedAgentBounty): boolean {
    return bounty.owner_spend_usd === 0;
  }
}
