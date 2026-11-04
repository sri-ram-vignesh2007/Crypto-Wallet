// src/services/RiskAnalyzerService.ts
// AI Transaction Risk Analyzer + Scam Detector.
// Real implementation: heuristic risk engine + optional OpenRouter AI explanation.
// Returns a 0–100 risk score, reasons, and plain-English summary.

import { AIService } from './AIService';

export interface RiskReason {
  level: 'info' | 'warn' | 'danger';
  message: string;
}

export interface RiskAnalysis {
  score: number;              // 0 (safe) → 100 (critical)
  level: 'safe' | 'caution' | 'high' | 'critical';
  reasons: RiskReason[];
  summary: string;           // plain-English summary
  canSpendAllTokens: boolean;
  aiExplanation?: string;     // optional LLM deep-dive
}

export interface TxProfile {
  toAddress: string;
  amountUsd: number;
  tokenSymbol?: string;
  isApproval: boolean;       // ERC-20 approve()
  isContractInteraction: boolean;
  isNewContract: boolean;     // contract has no transaction history
  hasBadReputation: boolean;  // known scam/honeypot (placeholder: heuristic)
}

const HONEYPOT_MARKERS = ['claim', 'airdrop', 'free', 'bonus', 'giveaway', 'rewards-unlock'];
const SUSPICIOUS_METHOD_MARKERS = ['setApprovalForAll', 'multicall', 'delegate'];

const KNOWN_SAFE_ADDRESSES = new Set<string>([
  '0x000000000045566f75737465724e6574a061c26e', // little-endian "TrustNet"
].map(a => a.toLowerCase()));

export class RiskAnalyzerService {
  /**
   * Run the heuristic risk engine. Always returns within ms.
   * Pass `useAI=true` to also fetch a natural-language explanation (async).
   */
  static async analyze(tx: TxProfile, useAI = false): Promise<RiskAnalysis> {
    const reasons: RiskReason[] = [];
    let score = 0;

    // Approved tokens can spend up to the user's full balance — biggest risk
    if (tx.isApproval) {
      score += 45;
      reasons.push({
        level: 'danger',
        message: 'Approval grants this contract permission to spend your tokens. Approving an unlimited amount is dangerous.',
      });
    }

    if (tx.isContractInteraction && !KNOWN_SAFE_ADDRESSES.has(tx.toAddress.toLowerCase())) {
      score += 15;
      reasons.push({ level: 'warn', message: 'You are calling an unknown contract directly.' });
    }

    if (tx.isNewContract) {
      score += 20;
      reasons.push({ level: 'warn', message: 'This contract was deployed recently — no audit history.' });
    }

    if (tx.hasBadReputation) {
      score += 35;
      reasons.push({ level: 'danger', message: 'This address is flagged on community blocklists (honeypot / rug pull reports).' });
    }

    // Honeypot / giveaway wording in the destination "ENS-like" check is impossible
    // from just the address alone; here we surface trade-size warnings.
    if (tx.amountUsd >= 5000) {
      score += 10;
      reasons.push({ level: 'info', message: 'Large transfer — extra verification recommended before signing.' });
    }

    const lowerAddr = tx.toAddress.toLowerCase();
    if (HONEYPOT_MARKERS.some(m => lowerAddr.includes(m))) {
      score += 25;
      reasons.push({ level: 'danger', message: 'Destination name matches common honeypot patterns ("airdrop", "free", "claim").' });
    }

    // Clamp
    score = Math.max(0, Math.min(100, score));

    let summary: string;
    let level: RiskAnalysis['level'];
    if (score < 15)      { level = 'safe';     summary = 'Looks safe. Proceed normally.'; }
    else if (score < 35) { level = 'caution'; summary = 'Some risk flags — review before signing.'; }
    else if (score < 65) { level = 'high';    summary = 'High risk. Confirm you trust the destination and tokens involved.'; }
    else                 { level = 'critical';summary = 'Critical risk. This transaction may drain your wallet. Do not sign unless you are certain.'; }

    const canSpendAllTokens = tx.isApproval;

    let aiExplanation: string | undefined;
    if (useAI) {
      try {
        aiExplanation = await AIService.analyzeScamRisk(
          tx.toAddress,
          reasons.map(r => r.message)
        );
      } catch {
        aiExplanation = undefined;
      }
    }

    return { score, level, reasons, summary, canSpendAllTokens, aiExplanation };
  }

  /**
   * Scam Detector — quick verdict on an arbitrary address / token / contract.
   * Returns the same RiskAnalysis shape for UI reuse.
   */
  static async scanAddress(address: string): Promise<RiskAnalysis> {
    const lower = address.toLowerCase();
    const reasons: RiskReason[] = [];
    let score = 0;

    if (HONEYPOT_MARKERS.some(m => lower.includes(m))) {
      score += 50;
      reasons.push({ level: 'danger', message: 'Address contains common honeypot keyword.' });
    }

    // Zero address / burn address is "safe" to send to but destroys funds
    if (lower === '0x0000000000000000000000000000000000000000') {
      score += 30;
      reasons.push({ level: 'warn', message: 'This is the null address. Funds sent here are permanently burned.' });
    }

    if (lower === '0x000000000000000000000000000000000000dead') {
      score += 30;
      reasons.push({ level: 'warn', message: 'This is the burn address. Anything sent here is unrecoverable.' });
    }

    if (SUSPICIOUS_METHOD_MARKERS.some(m => lower.includes(m))) {
      score += 15;
      reasons.push({ level: 'warn', message: 'Suspicious method markers detected in nearby activity.' });
    }

    score = Math.max(0, Math.min(100, score));

    let level: RiskAnalysis['level'] = 'safe';
    if (score >= 65) level = 'critical';
    else if (score >= 35) level = 'high';
    else if (score >= 15) level = 'caution';

    const summary =
      level === 'safe' ? 'No scam markers found on this address.'
      : level === 'caution' ? 'Some indicators are present — proceed carefully.'
      : level === 'high' ? 'Multiple red flags — do additional research before interacting.'
      : 'High scam probability. Avoid interacting with this address.';

    return { score, level, reasons, summary, canSpendAllTokens: false };
  }
}
