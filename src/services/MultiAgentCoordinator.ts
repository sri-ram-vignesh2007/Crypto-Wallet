// src/services/MultiAgentCoordinator.ts
// Multi-Agent Coordinator — routes requests to specialized agents and synthesizes responses
// Agents: Research, Security, Portfolio, Trading, Tax, Wallet, NFT, DeFi, Governance

import { AIService } from './AIService';
import { RiskAnalyzerService } from './RiskAnalyzerService';
import { PortfolioAIService } from './PortfolioAIService';
import { TradingAssistantService } from './TradingAssistantService';
import { WalletIntelligenceService } from './WalletIntelligenceService';
import { KnowledgeEngineService } from './KnowledgeEngineService';
import { NFTService } from './NFTService';
import { GovernanceService } from './GovernanceService';
import { SmartSwapService } from './SmartSwapService';
import { SecurityService } from './SecurityService';
import { AIMemoryService, UserPreferences } from './AIMemoryService';

export type AgentType = 
  | 'research' 
  | 'security' 
  | 'portfolio' 
  | 'trading' 
  | 'tax' 
  | 'wallet' 
  | 'nft' 
  | 'defi' 
  | 'governance'
  | 'general';

export interface AgentResponse {
  agent: AgentType;
  content: string;
  confidence: number;      // 0-1
  data?: any;              // structured data from agent
  actions?: AgentAction[]; // suggested follow-up actions
}

export interface AgentAction {
  type: 'navigate' | 'confirm' | 'input' | 'info';
  label: string;
  payload?: any;
}

export interface CoordinatorRequest {
  query: string;
  context?: {
    walletAddress?: string;
    selectedChain?: string;
    balances?: any[];
    totalValueUsd?: number;
    recentTransactions?: any[];
  };
  preferredAgents?: AgentType[];
  requireConsensus?: boolean;  // if true, multiple agents must agree
}

export interface CoordinatorResult {
  primaryResponse: string;
  agentResponses: AgentResponse[];
  synthesizedAnswer: string;
  confidence: number;
  suggestedActions: AgentAction[];
  agentsConsulted: AgentType[];
}

export class MultiAgentCoordinator {
  private static readonly AGENT_KEYWORDS: Record<AgentType, string[]> = {
    research: ['research', 'analyze', 'token', 'project', 'fundamentals', 'team', 'tokenomics', 'whitepaper', 'audit'],
    security: ['security', 'safe', 'risk', 'scam', 'honeypot', 'phishing', 'approval', 'revoke', 'lock', 'guardian', 'emergency'],
    portfolio: ['portfolio', 'balance', 'pnl', 'profit', 'loss', 'allocation', 'rebalance', 'diversif', 'holdings', 'value'],
    trading: ['trade', 'swap', 'buy', 'sell', 'dex', 'slippage', 'gas', 'whale', 'unlock', 'sentiment', 'signal'],
    tax: ['tax', 'capital gains', 'csv', 'export', 'report', 'liability', 'short-term', 'long-term'],
    wallet: ['address', 'balance', 'transaction', 'history', 'send', 'receive', 'gas', 'nonce'],
    nft: ['nft', 'collection', 'floor', 'trait', 'rarity', 'opensea', 'blur', 'mint', 'royalty'],
    defi: ['defi', 'yield', 'stake', 'lend', 'borrow', 'apy', 'aave', 'compound', 'liquidity', 'farm', 'bridge'],
    governance: ['dao', 'proposal', 'vote', 'governance', 'treasury', 'voting power', 'delegate', 'snapshot'],
    general: ['help', 'what', 'how', 'why', 'explain', 'define', 'meaning'],
  };

  /** Determine which agents should handle the query */
  static determineAgents(request: CoordinatorRequest): AgentType[] {
    if (request.preferredAgents && request.preferredAgents.length > 0) {
      return request.preferredAgents;
    }

    const query = request.query.toLowerCase();
    const scores: Record<AgentType, number> = {
      research: 0, security: 0, portfolio: 0, trading: 0, tax: 0,
      wallet: 0, nft: 0, defi: 0, governance: 0, general: 0,
    };

    // Score each agent based on keyword matches
    Object.entries(this.AGENT_KEYWORDS).forEach(([agent, keywords]) => {
      keywords.forEach(kw => {
        if (query.includes(kw.toLowerCase())) {
          scores[agent as AgentType] += 1;
        }
      });
    });

    // Boost general for short queries
    if (query.split(' ').length <= 5) scores.general += 0.5;

    // Sort by score
    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([agent]) => agent as AgentType)
      .filter(a => scores[a] > 0);

    // Always include at least general if nothing matched
    return ranked.length > 0 ? ranked.slice(0, 3) : ['general'];
  }

  /** Route request to appropriate agents and collect responses */
  static async coordinate(request: CoordinatorRequest): Promise<CoordinatorResult> {
    const agents = this.determineAgents(request);
    const responses: AgentResponse[] = [];

    // Run agents in parallel
    const agentPromises = agents.map(agent => this.runAgent(agent, request));
    const results = await Promise.allSettled(agentPromises);

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        responses.push(result.value);
      } else {
        console.error(`Agent ${agents[i]} failed:`, result.reason);
      }
    });

    // Synthesize final answer
    const synthesized = await this.synthesize(responses, request);
    const confidence = this.calculateConfidence(responses);
    const actions = this.extractActions(responses);

    return {
      primaryResponse: responses[0]?.content || 'I couldn\'t process that request.',
      agentResponses: responses,
      synthesizedAnswer: synthesized,
      confidence,
      suggestedActions: actions,
      agentsConsulted: agents,
    };
  }

  /** Run a single agent */
  private static async runAgent(agent: AgentType, request: CoordinatorRequest): Promise<AgentResponse> {
    const { query, context } = request;
    const address = context?.walletAddress || '0x0';
    const chain = context?.selectedChain || 'ethereum';
    const balances = context?.balances || [];
    const totalValue = context?.totalValueUsd || 0;

    try {
      switch (agent) {
        case 'research': {
          // Research agent - token/project analysis
          const content = await AIService.chat(`Research query: ${query}. Provide key fundamentals, risks, and summary.`);
          return { agent, content, confidence: 0.8, actions: [{ type: 'info', label: 'View full research', payload: { type: 'research' } }] };
        }

        case 'security': {
          // Security agent - risk analysis
          if (query.includes('address') || query.includes('contract') || query.includes('0x')) {
            const addrMatch = query.match(/0x[a-fA-F0-9]{40}/);
            if (addrMatch) {
              const analysis = await RiskAnalyzerService.scanAddress(addrMatch[0]);
              return { 
                agent, 
                content: `Risk Score: ${analysis.score}/100 (${analysis.level}). ${analysis.summary}`, 
                confidence: 0.9, 
                data: analysis,
                actions: analysis.level !== 'safe' ? [{ type: 'navigate', label: 'View Security Center', payload: { screen: 'SecurityCenter' } }] : []
              };
            }
          }
          const content = await AIService.chat(`Security question: ${query}. Focus on wallet safety, approvals, and best practices.`);
          return { agent, content, confidence: 0.8 };
        }

        case 'portfolio': {
          // Portfolio agent - P&L, allocation, rebalancing
          if (balances.length > 0) {
            const snapshot = {
              holdings: balances.map(b => ({ symbol: b.token.symbol, amount: b.balance, valueUsd: b.valueUsd, costBasisUsd: b.valueUsd * 0.9 })),
              totalValueUsd: totalValue,
            };
            const analysis = PortfolioAIService.analyze(snapshot);
            const narrative = await PortfolioAIService.narrative(snapshot, analysis);
            return { 
              agent, 
              content: `${narrative}\n\nP&L: $${analysis.totalPnLUsd.toFixed(2)} (${analysis.totalPnLPct.toFixed(1)}%). Health: ${analysis.health.score}/100.`, 
              confidence: 0.9, 
              data: analysis,
              actions: [{ type: 'navigate', label: 'View Portfolio AI', payload: { screen: 'PortfolioAI' } }]
            };
          }
          const content = await AIService.chat(`Portfolio question: ${query}. General advice on allocation and diversification.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'trading': {
          // Trading agent - signals, swaps, market data
          const signals = await TradingAssistantService.collect({
            recentInTransfersUsd: [],
            recentOutTransfersUsd: [],
            tokensHeld: balances.map(b => b.token.symbol),
            useAI: true,
          });
          return { 
            agent, 
            content: `Market: ${signals.marketSentiment}. ${signals.summary} ${signals.aiInsight ? '\nAI: ' + signals.aiInsight : ''}`, 
            confidence: 0.8, 
            data: signals,
            actions: [{ type: 'navigate', label: 'View Trading Assistant', payload: { screen: 'TradingAssistant' } }]
          };
        }

        case 'tax': {
          // Tax agent - capital gains, reports
          if (balances.length > 0) {
            const snapshot = {
              holdings: balances.map(b => ({ symbol: b.token.symbol, amount: b.balance, valueUsd: b.valueUsd, costBasisUsd: b.valueUsd * 0.9 })),
              totalValueUsd: totalValue,
            };
            const csv = PortfolioAIService.taxCSV(snapshot);
            return { 
              agent, 
              content: `Tax estimate generated. Estimated capital gains based on current holdings.`, 
              confidence: 0.8, 
              data: { csv },
              actions: [{ type: 'navigate', label: 'Export Tax CSV', payload: { screen: 'PortfolioAI', action: 'export' } }]
            };
          }
          const content = await AIService.chat(`Tax question: ${query}. US crypto tax basics.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'wallet': {
          // Wallet agent - address intelligence, transaction explanation
          if (query.includes('address') || query.includes('0x')) {
            const addrMatch = query.match(/0x[a-fA-F0-9]{40}/);
            if (addrMatch) {
              const intel = await WalletIntelligenceService.analyze(addrMatch[0], chain);
              return { 
                agent, 
                content: `Wallet Intelligence: ${intel.estimatedProfitUsd >= 0 ? 'Profitable' : 'Loss-making'} wallet. Est. profit: $${intel.estimatedProfitUsd.toFixed(2)}. Win rate: ${intel.estimatedWinRatePct}%. Style: ${intel.tradingStyle}.`, 
                confidence: 0.8, 
                data: intel,
                actions: [{ type: 'navigate', label: 'View Wallet Intelligence', payload: { screen: 'WalletIntelligence' } }]
              };
            }
          }
          const content = await AIService.chat(`Wallet question: ${query}. Explain transactions, gas, nonces, etc.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'nft': {
          // NFT agent - collections, floor prices
          if (address !== '0x0') {
            const stats = await NFTService.getPortfolioStats(address);
            const alerts = await NFTService.checkAlerts(address, 20);
            return { 
              agent, 
              content: `NFT Portfolio: ${stats.totalAssets} assets across ${stats.collectionsCount} collections. Floor value: $${stats.totalFloorValueUsd.toLocaleString()}. ${alerts.length > 0 ? `⚠️ ${alerts.length} floor price alerts!` : ''}`, 
              confidence: 0.8, 
              data: { stats, alerts },
              actions: [{ type: 'navigate', label: 'View NFT Agent', payload: { screen: 'NFTAgent' } }]
            };
          }
          const content = await AIService.chat(`NFT question: ${query}. Floor prices, collections, traits, royalties.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'defi': {
          // DeFi agent - yields, lending, bridging
          if (query.includes('swap') || query.includes('bridge') || query.includes('yield')) {
            // Could call SmartSwapService here
            const content = await AIService.chat(`DeFi question: ${query}. Focus on yields, lending rates, bridge options, DEX routing.`);
            return { agent, content, confidence: 0.8 };
          }
          const content = await AIService.chat(`DeFi question: ${query}.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'governance': {
          // Governance agent - DAO proposals, voting
          if (address !== '0x0') {
            const proposals = await GovernanceService.getProposalsForUser(address);
            const active = proposals.filter(p => p.status === 'active').slice(0, 3);
            return { 
              agent, 
              content: `${active.length} active proposals you can vote on. ${active.map(p => `${p.dao}: ${p.title}`).join('; ')}`, 
              confidence: 0.8, 
              data: { proposals: active },
              actions: [{ type: 'navigate', label: 'View Governance', payload: { screen: 'GovernanceAgent' } }]
            };
          }
          const content = await AIService.chat(`Governance question: ${query}. DAO proposals, voting, treasury.`);
          return { agent, content, confidence: 0.7 };
        }

        case 'general':
        default: {
          // General AI - knowledge, explanations
          const prefs = await AIMemoryService.getPreferences();
          const aiContext = await AIMemoryService.getAIContext();
          const content = await AIService.callAI?.(
            `${aiContext}\n\nQuestion: ${query}\nAnswer concisely for a crypto user.`,
            prefs.preferredAIModel
          ) || await AIService.chat(query);
          return { agent, content, confidence: 0.7 };
        }
      }
    } catch (error) {
      console.error(`Agent ${agent} error:`, error);
      return { 
        agent, 
        content: `Unable to process with ${agent} agent.`, 
        confidence: 0.1 
      };
    }
  }

  /** Synthesize multiple agent responses into a coherent answer */
  private static async synthesize(responses: AgentResponse[], request: CoordinatorRequest): Promise<string> {
    if (responses.length === 0) return 'No agents could process this request.';
    if (responses.length === 1) return responses[0].content;

    // For consensus-required requests, check agreement
    if (request.requireConsensus && responses.length >= 2) {
      const first = responses[0].content.toLowerCase();
      const second = responses[1].content.toLowerCase();
      // Simple heuristic: check if key terms align
      const commonWords = first.split(' ').filter(w => second.includes(w) && w.length > 4);
      if (commonWords.length < 3) {
        return `Agents provided different perspectives:\n\n${responses.map(r => `**${r.agent}**: ${r.content}`).join('\n\n')}`;
      }
    }

    // Use AI to synthesize
    try {
      const synthesisPrompt = `Synthesize these agent responses into one coherent answer for the user's question: "${request.query}"

${responses.map(r => `${r.agent.toUpperCase()}: ${r.content}`).join('\n\n')}

Provide a single, well-structured response that combines the most relevant information. Be concise but complete.`;

      const synthesized = await AIService.callAI?.(synthesisPrompt, 'openrouter/free');
      return synthesized || responses.map(r => `**${r.agent}**: ${r.content}`).join('\n\n');
    } catch {
      return responses.map(r => `**${r.agent}**: ${r.content}`).join('\n\n');
    }
  }

  private static calculateConfidence(responses: AgentResponse[]): number {
    if (responses.length === 0) return 0;
    const avg = responses.reduce((s, r) => s + r.confidence, 0) / responses.length;
    // Boost confidence if multiple agents agree
    return Math.min(1, avg + (responses.length > 1 ? 0.1 : 0));
  }

  private static extractActions(responses: AgentResponse[]): AgentAction[] {
    const actions: AgentAction[] = [];
    responses.forEach(r => {
      if (r.actions) actions.push(...r.actions);
    });
    // Deduplicate by label
    const seen = new Set<string>();
    return actions.filter(a => {
      if (seen.has(a.label)) return false;
      seen.add(a.label);
      return true;
    });
  }

  /** Quick single-agent query for UI components */
  static async queryAgent(agent: AgentType, query: string, context?: CoordinatorRequest['context']): Promise<AgentResponse> {
    const result = await this.coordinate({ query, context, preferredAgents: [agent] });
    return result.agentResponses[0] || { agent, content: 'No response', confidence: 0 };
  }
}