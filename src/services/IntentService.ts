// src/services/IntentService.ts
// Natural-language wallet — parses user text into a structured transaction
// intent, then prepares it. Heuristic parser + optional OpenRouter LLM
// when an API key is set.
//
// Intent examples:
//   "Send $50 USDC to Alex"
//   "Send 0.01 ETH to 0xABC..."
//   "Swap 50 USDC for ETH"
//   "Buy 100 USDC worth of ETH"

import { AIService } from './AIService';
import { UniversalAddressBookService } from './UniversalAddressBookService';

export type IntentType = 'send' | 'swap' | 'buy' | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  amount?: string;       // human-readable amount ("50" or "0.01")
  amountUnit?: 'USD' | 'TOKEN';
  tokenSymbol?: string;  // for the asset being sent/swapped/bought
  targetToken?: string;  // for swap/buy, the asset to receive
  toLabel?: string;      // contact name OR raw address
  toAddress?: string;    // resolved address (after address book lookup)
  raw: string;
}

export class IntentService {
  /**
   * Heuristic parser — runs first, always. Returns `unknown` if no pattern matches.
   */
  static parseHeuristic(text: string): ParsedIntent {
    const raw = text.trim();
    const lowered = raw.toLowerCase();

    if (/send|transfer|pay/.test(lowered) || /\$\d|\d+\s*(eth|usdc|usdt|btc|sol|matic|bnb|avax)/i.test(lowered)) {
      // amount: $?digits OR digits + unit
      const usdMatch = raw.match(/\$\s*(\d+(?:\.\d+)?)/i);
      const tokenAmtMatch = raw.match(/(\d+(?:\.\d+)?)\s*(eth|usdc|usdt|btc|sol|matic|bnb|avax|wbtc|uni)/i);

      let amount: string | undefined;
      let amountUnit: 'USD' | 'TOKEN' = 'TOKEN';
      let tokenSymbol: string | undefined;

      if (usdMatch) {
        amount = usdMatch[1];
        amountUnit = 'USD';
      } else if (tokenAmtMatch) {
        amount = tokenAmtMatch[1];
        tokenSymbol = tokenAmtMatch[2].toUpperCase();
      }

      // recipient — either a 0x address (heuristic) or a label ("Alex")
      const addrMatch = raw.match(/0x[a-fA-F0-9]{40}/);
      let toLabel: string | undefined;
      let toAddress: string | undefined;
      if (addrMatch) {
        toAddress = addrMatch[0];
      } else {
        // Pick the word after "to "
        const toMatch = raw.match(/to\s+([A-Za-z][A-Za-z0-9_\- ]{0,30})/i);
        if (toMatch) toLabel = toMatch[1].trim();
      }

      return { type: 'send', amount, amountUnit, tokenSymbol, toLabel, toAddress, raw };
    }

    if (/\bswap\b/i.test(lowered)) {
      const amtMatch = raw.match(/(\d+(?:\.\d+)?)\s*(\w+)/i);
      const forMatch = raw.match(/for\s+(\w+)/i);
      return {
        type: 'swap',
        amount: amtMatch?.[1],
        tokenSymbol: amtMatch?.[2]?.toUpperCase(),
        targetToken: forMatch?.[1]?.toUpperCase(),
        raw,
      };
    }

    if (/\bbuy\b/i.test(lowered)) {
      const usdMatch = raw.match(/\$\s*(\d+(?:\.\d+)?)/i);
      const worth = raw.match(/(\d+(?:\.\d+)?)\s*worth/i);
      return {
        type: 'buy',
        amount: usdMatch?.[1] ?? worth?.[1],
        amountUnit: 'USD',
        tokenSymbol: raw.match(/of\s+(\w+)/i)?.[1]?.toUpperCase(),
        raw,
      };
    }

    return { type: 'unknown', raw };
  }

  /**
   * Resolve `toLabel` → address using the address book. Mutates parsed.
   */
  static async resolveToAddress(parsed: ParsedIntent): Promise<ParsedIntent> {
    if (parsed.toAddress) return parsed;
    if (!parsed.toLabel) return parsed;

    const entry = await UniversalAddressBookService.findByName(parsed.toLabel);
    if (entry) parsed.toAddress = entry.address;
    return parsed;
  }

  /**
   * End-to-end: parse user text + attempt address book resolution.
   * Optional AI augmentation when an LLM key is configured; if the
   * heuristic returns `unknown`, falls back to LLM for the heavy lifting.
   */
  static async parse(text: string, useAI = false): Promise<ParsedIntent> {
    let parsed = IntentService.parseHeuristic(text);

    if (parsed.type === 'unknown' && useAI) {
      // Ask the LLM to return a strict JSON intent we can parse.
      try {
        const sysPrompt = 'You are a parser that converts natural-language wallet commands into JSON. Reply ONLY with JSON.';
        const userPrompt = `Convert to JSON shape {type:"send"|"swap"|"buy"|"unknown", amount:string, amountUnit:"USD"|"TOKEN", tokenSymbol:string, targetToken:string, toLabel:string}. Input: "${text}"`;
        const reply = await AIService.chat(`${sysPrompt}\n\n${userPrompt}`);
        // Best-effort extract JSON
        const json = reply.match(/\{[\s\S]*\}/);
        if (json) {
          const obj = JSON.parse(json[0]);
          parsed = { ...parsed, ...obj, raw: text };
        }
      } catch {
        // swallow; keep heuristic result
      }
    }

    parsed = await IntentService.resolveToAddress(parsed);
    return parsed;
  }

  /**
   * Simulation mode — produces a description of what would happen if the
   * intent were executed, WITHOUT signing anything. Used for the "Review"
   * panel before the user taps Confirm.
   */
  static simulate(parsed: ParsedIntent, walletAddress: string): string {
    switch (parsed.type) {
      case 'send':
        return `Will transfer ${parsed.amount ?? '?'} ${parsed.amountUnit === 'USD' ? 'USD worth of ' : ''}${parsed.tokenSymbol ?? 'ETH'} from ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)} to ${parsed.toAddress ? parsed.toAddress.slice(0, 6) + '…' + parsed.toAddress.slice(-4) : parsed.toLabel ?? 'unknown'}.`;
      case 'swap':
        return `Will swap ${parsed.amount ?? '?'} ${parsed.tokenSymbol} for ${parsed.targetToken ?? '?'}. A DEX router will be invoked; slippage and gas fees apply.`;
      case 'buy':
        return `Will buy ${parsed.tokenSymbol ?? 'a token'} with $${parsed.amount} using a fiat on-ramp. KYC may be required.`;
      default:
        return 'Could not interpret this command. Try "Send $50 USDC to Alex".';
    }
  }
}
