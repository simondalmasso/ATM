// SPDX-License-Identifier: AGPL-3.0-only

/** AgentBounties API response types */
export interface AgentBountiesBounty {
  id: string;
  title: string;
  description: string;
  required_external_spend: number; // In USD
  claim_bond: number | null; // Refundable bond (USD)
  reward: number; // In USD
  deadline: string; // ISO 8601
  is_competition: boolean;
  competition_id?: string;
  owner_address: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  network: string;
  created_at: string;
  updated_at: string;
}

/**
 * Normalized ATM evidence for AgentBounties bounties.
 * UNKNOWN fields are preserved when evidence is absent.
 */
export interface NormalizedAgentBounty {
  source: 'agentbounties';
  id: string;
  title: string;
  description: string;
  reward_usd: number;
  deadline: string | null;
  is_competition: boolean;
  competition_id?: string;
  owner_address: string;
  status: 'OPEN' | 'CLOSED' | 'PAUSED' | 'UNKNOWN';
  owner_spend_usd: number; // Includes bonds, gas, fees (0 = zero-spend)
  evidence: {
    canonical_tx?: string;
    settled_event?: 'BountySettled' | 'CompetitionSettledV2';
  };
}
