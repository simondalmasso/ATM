// SPDX-License-Identifier: AGPL-3.0-only
import { AgentBountiesDiscovery } from './services/bounty-discovery.js';
import { AGENTBOUNTIES_CONFIG } from './config/agentbounties.js';

/**
 * ATM AgentBounties integration entrypoint.
 * Zero-spend radar intake only; no claim/sign/pay tools.
 */
export const agentBountiesDiscovery = new AgentBountiesDiscovery();

export const isAgentBountiesEnabled = AGENTBOUNTIES_CONFIG.enabled;
