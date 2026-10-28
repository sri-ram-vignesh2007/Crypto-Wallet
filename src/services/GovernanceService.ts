// src/services/GovernanceService.ts
// AI Governance Agent — DAO proposal summaries, voting power, delegation, treasury health

export interface DAOProposal {
  id: string;
  dao: string;
  daoSlug: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'executed' | 'defeated';
  startDate: number;
  endDate: number;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  threshold: number;
  executionPayload?: string;
  voterCount: number;
}

export interface VotePosition {
  proposalId: string;
  support: number; // 1=for, 0=against, 2=abstain
  reason?: string;
  weight: number;
  timestamp: number;
}

export interface DAOTreasury {
  daoSlug: string;
  totalValueUsd: number;
  assets: Array<{ symbol: string; amount: number; valueUsd: number }>;
  runwayMonths: number;
  diversificationScore: number;
}

export interface GovernanceSummary {
  activeProposals: number;
  votingPower: number;
  delegatedTo?: string;
  recentVotes: VotePosition[];
  treasuryHealth: DAOTreasury[];
}

export class GovernanceService {
  // Known major DAOs with snapshot/graph endpoints
  private static readonly MAJOR_DAOS = [
    { slug: 'aave', name: 'Aave', chain: 'ethereum', snapshotSpace: 'aave.eth' },
    { slug: 'uniswap', name: 'Uniswap', chain: 'ethereum', snapshotSpace: 'uniswap.eth' },
    { slug: 'compound', name: 'Compound', chain: 'ethereum', snapshotSpace: 'compound.eth' },
    { slug: 'arbitrum', name: 'Arbitrum', chain: 'arbitrum', snapshotSpace: 'arbitrum.eth' },
    { slug: 'optimism', name: 'Optimism', chain: 'optimism', snapshotSpace: 'optimism.eth' },
    { slug: 'ens', name: 'ENS', chain: 'ethereum', snapshotSpace: 'ens.eth' },
    { slug: 'gitcoin', name: 'Gitcoin', chain: 'ethereum', snapshotSpace: 'gitcoin.eth' },
    { slug: 'nouns', name: 'Nouns', chain: 'ethereum', snapshotSpace: 'nouns.eth' },
  ];

  /** Get proposals for DAOs where user has voting power (heuristic) */
  static async getProposalsForUser(address: string): Promise<DAOProposal[]> {
    // In production: query Snapshot API / Tally / Boardroom for each DAO
    // Filter by user's token balances (governance tokens)
    // For demo, return mock active proposals
    return this.generateMockProposals();
  }

  private static generateMockProposals(): DAOProposal[] {
    const now = Date.now();
    const day = 86400000;
    
    return [
      {
        id: 'aave-142',
        dao: 'Aave',
        daoSlug: 'aave',
        title: 'Increase LTV for wstETH to 85%',
        description: 'Proposal to increase the Loan-to-Value ratio for Wrapped Staked ETH (wstETH) from 80% to 85% on Aave V3 Ethereum market, following successful risk assessment by Chaos Labs.',
        status: 'active',
        startDate: now - 2 * day,
        endDate: now + 5 * day,
        votesFor: 1250000,
        votesAgainst: 180000,
        votesAbstain: 45000,
        quorum: 500000,
        threshold: 0.5,
        voterCount: 342,
        executionPayload: '0x...',
      },
      {
        id: 'uni-89',
        dao: 'Uniswap',
        daoSlug: 'uniswap',
        title: 'Deploy Uniswap V4 on Base Mainnet',
        description: 'Governance proposal to deploy Uniswap V4 hooks and core contracts on Base mainnet, enabling custom AMM logic for the Base ecosystem.',
        status: 'active',
        startDate: now - 1 * day,
        endDate: now + 6 * day,
        votesFor: 8900000,
        votesAgainst: 1200000,
        votesAbstain: 340000,
        quorum: 4000000,
        threshold: 0.5,
        voterCount: 1205,
        executionPayload: '0x...',
      },
      {
        id: 'comp-298',
        dao: 'Compound',
        daoSlug: 'compound',
        title: 'Add sDAI as Collateral with 80% CF',
        description: 'Add Spark\'s sDAI (Savings DAI) as a collateral asset on Compound V3 Ethereum with 80% Collateral Factor and 85% Liquidation Factor.',
        status: 'pending',
        startDate: now + 2 * day,
        endDate: now + 9 * day,
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        quorum: 400000,
        threshold: 0.5,
        voterCount: 0,
      },
      {
        id: 'arb-45',
        dao: 'Arbitrum',
        daoSlug: 'arbitrum',
        title: 'Stylus Mainnet Activation',
        description: 'Activate Stylus (WASM/Rust smart contracts) on Arbitrum One mainnet after successful testnet period. Includes WASM gas pricing and precompile deployment.',
        status: 'active',
        startDate: now - 3 * day,
        endDate: now + 4 * day,
        votesFor: 56000000,
        votesAgainst: 8000000,
        votesAbstain: 12000000,
        quorum: 30000000,
        threshold: 0.5,
        voterCount: 892,
        executionPayload: '0x...',
      },
      {
        id: 'op-78',
        dao: 'Optimism',
        daoSlug: 'optimism',
        title: 'RetroPGF Round 4 - Budget Allocation',
        description: 'Allocate 10M OP tokens for Retroactive Public Goods Funding Round 4. Defines categories, badgeholder selection, and distribution methodology.',
        status: 'executed',
        startDate: now - 30 * day,
        endDate: now - 23 * day,
        votesFor: 45000000,
        votesAgainst: 5000000,
        votesAbstain: 8000000,
        quorum: 30000000,
        threshold: 0.5,
        voterCount: 2100,
        executionPayload: '0x...',
      },
    ];
  }

  /** Get user's voting positions across DAOs */
  static async getUserVotes(address: string): Promise<VotePosition[]> {
    // In production: query Snapshot/Tally for user's voting history
    return [
      { proposalId: 'aave-140', support: 1, reason: 'Supports risk parameters update', weight: 15000, timestamp: Date.now() - 5 * 86400000 },
      { proposalId: 'uni-87', support: 1, reason: 'Fee switch activation', weight: 22000, timestamp: Date.now() - 12 * 86400000 },
      { proposalId: 'arb-43', support: 0, reason: 'Concerns about sequencer decentralization timeline', weight: 80000, timestamp: Date.now() - 20 * 86400000 },
    ];
  }

  /** Get treasury health for DAOs user participates in */
  static async getTreasuryHealth(): Promise<DAOTreasury[]> {
    // In production: query on-chain treasury contracts + price feeds
    return [
      {
        daoSlug: 'aave',
        totalValueUsd: 2800000000,
        assets: [
          { symbol: 'AAVE', amount: 16000000, valueUsd: 1200000000 },
          { symbol: 'USDC', amount: 800000000, valueUsd: 800000000 },
          { symbol: 'WETH', amount: 180000, valueUsd: 600000000 },
          { symbol: 'GHO', amount: 200000000, valueUsd: 200000000 },
        ],
        runwayMonths: 48,
        diversificationScore: 72,
      },
      {
        daoSlug: 'uniswap',
        totalValueUsd: 4200000000,
        assets: [
          { symbol: 'UNI', amount: 450000000, valueUsd: 3800000000 },
          { symbol: 'USDC', amount: 300000000, valueUsd: 300000000 },
          { symbol: 'WETH', amount: 35000, valueUsd: 100000000 },
        ],
        runwayMonths: 60,
        diversificationScore: 45,
      },
    ];
  }

  /** Get AI summary of a proposal */
  static async getProposalSummary(proposal: DAOProposal, useAI: boolean = true): Promise<string> {
    if (!useAI) return this.heuristicSummary(proposal);
    
    // Would call AIService here
    return this.heuristicSummary(proposal);
  }

  private static heuristicSummary(proposal: DAOProposal): string {
    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
    const againstPct = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
    const daysLeft = Math.max(0, Math.ceil((proposal.endDate - Date.now()) / 86400000));
    
    let summary = `${proposal.dao}: "${proposal.title}"\n`;
    summary += `Status: ${proposal.status.toUpperCase()} · ${daysLeft} days left\n`;
    summary += `Votes: ${forPct.toFixed(1)}% For / ${againstPct.toFixed(1)}% Against / ${((proposal.votesAbstain/totalVotes)*100).toFixed(1)}% Abstain\n`;
    
    if (proposal.status === 'active') {
      const quorumMet = totalVotes >= proposal.quorum;
      summary += quorumMet ? '✅ Quorum reached' : `⚠️ Quorum not yet reached (${((totalVotes/proposal.quorum)*100).toFixed(0)}%)`;
    }
    
    return summary;
  }

  /** Check if user can vote on a proposal (has governance tokens) */
  static async canVote(address: string, daoSlug: string): Promise<{ canVote: boolean; votingPower: number; token: string }> {
    // In production: check token balance of governance token
    const dao = this.MAJOR_DAOS.find(d => d.slug === daoSlug);
    if (!dao) return { canVote: false, votingPower: 0, token: '' };
    
    // Mock: deterministic based on address
    const seed = parseInt(address.slice(-4), 16);
    const hasTokens = seed % 3 !== 0;
    const power = hasTokens ? (seed % 100000) + 1000 : 0;
    
    return {
      canVote: hasTokens,
      votingPower: power,
      token: dao.slug.toUpperCase(),
    };
  }
}

// Types already exported above (VotePosition, DAOTreasury, DAOProposal, GovernanceSummary)