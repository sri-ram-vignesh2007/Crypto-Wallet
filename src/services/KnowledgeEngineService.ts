// src/services/KnowledgeEngineService.ts
// AI Knowledge Engine — answers "Why did my balance decrease?", "Where
// are my staking rewards?", "Can I unstake today?" by analysing on-chain
// data + recent activity, and asking the LLM for a plain-English summary.

import { AIService } from './AIService';
import { rpcManager } from '../core/RPCManager';

export interface KnowledgeContext {
  walletAddress: string;
  selectedChain: string;
  recentTransactions: any[];           // tx history snapshot
  balancesSnapshot: Array<{ symbol: string; balance: string; valueUsd: number }>;
}

export interface KnowledgeAnswer {
  question: string;
  detectedIntent: 'balance_change' | 'staking_rewards' | 'unstake' | 'unknown';
  answer: string;            // LLM or heuristic
  evidenceChunks: string[];  // raw facts we used
}

export class KnowledgeEngineService {
  static detectIntent(question: string): KnowledgeAnswer['detectedIntent'] {
    const q = question.toLowerCase();
    if (/balance.*(decreas|drop|change|low)/.test(q)) return 'balance_change';
    if (/staking.*reward|reward.*staking/.test(q) || /yield/.test(q)) return 'staking_rewards';
    if (/unstake|claim|withdraw.*stake/.test(q)) return 'unstake';
    return 'unknown';
  }

  static gatherEvidence(q: string, ctx: KnowledgeContext): string[] {
    const intent = KnowledgeEngineService.detectIntent(q);
    const chunks: string[] = [];

    if (intent === 'balance_change') {
      const lastFewTxs = ctx.recentTransactions.slice(0, 5);
      lastFewTxs.forEach(t => {
        const ts = new Date((t.timestamp || t.timeStamp || 0) * 1000).toISOString();
        const amt = t.value ? `${t.value} wei` : '?';
        const to = t.to && t.to.slice(0, 10) || '?';
        chunks.push(`Tx at ${ts} to ${to} (value ${amt})`);
      });
      ctx.balancesSnapshot.forEach(b => chunks.push(`Current balance: ${b.balance} ${b.symbol} (~$${b.valueUsd.toFixed(2)}).`));
    } else if (intent === 'staking_rewards') {
      chunks.push('No staking-reward events detected in the recent transaction list — if you stake on a 3rd-party platform you may need to check that platform directly.');
    } else if (intent === 'unstake') {
      chunks.push('Cannot determine unstake eligibility from on-chain data alone — needs the staking contract address and its lock/unlock schedule.');
      chunks.push(`Your current balances: ${ctx.balancesSnapshot.map(b => `${b.balance} ${b.symbol}`).join(', ') || 'empty'}.`);
    } else {
      chunks.push('No specific intent detected — answering from the wallet snapshot.');
      ctx.balancesSnapshot.forEach(b => chunks.push(`${b.symbol}: ${b.balance} ($${b.valueUsd.toFixed(2)}).`));
    }

    return chunks;
  }

  static async ask(question: string, ctx: KnowledgeContext): Promise<KnowledgeAnswer> {
    const intent = KnowledgeEngineService.detectIntent(question);
    const evidence = KnowledgeEngineService.gatherEvidence(question, ctx);

    let answer = '';
    try {
      const prompt = `Wallet address: ${ctx.walletAddress}
Recent transactions: ${JSON.stringify(ctx.recentTransactions.slice(0, 5))}
Balances: ${JSON.stringify(ctx.balancesSnapshot)}
Question: "${question}"
Detected intent: ${intent}
Relevant facts we found: ${evidence.join(' | ')}
Answer the question in 1–3 short sentences using only the facts above. If you don't have enough data, say so.`;
      answer = await AIService.callAI?.(prompt, 'openrouter/free') ?? '';
    } catch { answer = ''; }
    if (!answer) {
      // Heuristic fallback
      switch (intent) {
        case 'balance_change':
          answer = `Your balance may have decreased due to the ${evidence.length} recent outgoing transactions. Tap Activity to review each one.`;
          break;
        case 'staking_rewards':
          answer = 'No on-chain staking transactions detected in your recent activity. If you stake via a third party (Lido, Rocket Pool, etc.), check their dashboard.';
          break;
        case 'unstake':
          answer = 'Unstake eligibility depends on the staking contract. We need the contract address and its unbonding schedule to answer definitively.';
          break;
        default:
          answer = 'I don\'t have enough information to answer that precisely. Try the Portfolio AI screen for an overview.';
      }
    }

    return { question, detectedIntent: intent, answer, evidenceChunks: evidence };
  }
}

// Convenience — keeps RPCManager import alive even if RPCManager has different shape
void rpcManager;
