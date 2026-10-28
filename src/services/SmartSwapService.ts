// src/services/SmartSwapService.ts
// Smart Swap — finds the cheapest route across multiple DEXs and bridges
// automatically, optimising for lowest gas. This is an abstraction that in
// production calls 1inch/0x/LiFi/Socket APIs; here we simulate it with a
// deterministic quote table so the UI runs end-to-end.

import { CHAINS } from '../core/ChainConfig';

export interface SwapQuote {
  dex: string;             // e.g. "1inch", "0x", "Uniswap V3", "ParaSwap"
  route: string[];         // hops, e.g. ["USDC", "WETH", "ETH"]
  estimatedSlippagePct: number;
  gasUsd: number;
  totalCostUsd: number;    // gas + (slippage × amount)
  outputAmount: string;
}

export interface CrossChainQuote extends SwapQuote {
  bridge: string;          // "LiFi", "Socket", "Hop"
  sourceChain: string;
  destChain: string;
}

export class SmartSwapService {
  /** Returns multiple ranked quotes — cheapest first. */
  static async getQuotes(params: {
    amountUsd: number;
    fromToken: string;
    toToken: string;
  }): Promise<SwapQuote[]> {
    const { amountUsd, fromToken, toToken } = params;
    const base = amountUsd > 0 ? amountUsd : 1;

    // Simulated router table
    const quotes: SwapQuote[] = [
      {
        dex: '1inch',
        route: [fromToken, toToken],
        estimatedSlippagePct: 0.18,
        gasUsd: 2.1,
        totalCostUsd: 0,
        outputAmount: (base * 0.998).toFixed(6),
      },
      {
        dex: '0x / Matcha',
        route: [fromToken, toToken],
        estimatedSlippagePct: 0.25,
        gasUsd: 1.8,
        totalCostUsd: 0,
        outputAmount: (base * 0.997).toFixed(6),
      },
      {
        dex: 'Uniswap V3',
        route: [fromToken, 'WETH', toToken],
        estimatedSlippagePct: 0.35,
        gasUsd: 2.5,
        totalCostUsd: 0,
        outputAmount: (base * 0.995).toFixed(6),
      },
      {
        dex: 'ParaSwap',
        route: [fromToken, 'WETH', toToken],
        estimatedSlippagePct: 0.28,
        gasUsd: 2.0,
        totalCostUsd: 0,
        outputAmount: (base * 0.996).toFixed(6),
      },
    ];

    quotes.forEach(q => {
      q.totalCostUsd = q.gasUsd + (q.estimatedSlippagePct / 100) * amountUsd;
    });

    return quotes.sort((a, b) => a.totalCostUsd - b.totalCostUsd);
  }

  /** Returns cross-chain quote candidates from sourceChain → destChain. */
  static async getCrossChainQuotes(params: {
    amountUsd: number;
    fromToken: string;
    toToken: string;
    sourceChainKey: string;
    destChainKey: string;
  }): Promise<CrossChainQuote[]> {
    const baseQuotes = await SmartSwapService.getQuotes(params);
    const source = CHAINS[params.sourceChainKey]?.name ?? params.sourceChainKey;
    const dest   = CHAINS[params.destChainKey]?.name   ?? params.destChainKey;

    const bridges = ['LiFi', 'Socket', 'Hop'];

    return baseQuotes.map((q, i) => ({
      ...q,
      bridge: bridges[i % bridges.length],
      sourceChain: source,
      destChain: dest,
      gasUsd: q.gasUsd + 3,     // bridge adds ~$3 typical
      totalCostUsd: q.totalCostUsd + 3,
    }));
  }
}
