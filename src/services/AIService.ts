// src/services/AIService.ts
// AI ENGINE with Python FastAPI Backend + OpenRouter API + Local Knowledge Base Fallback

import { Platform } from 'react-native';

const PYTHON_BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const OPENROUTER_API_KEY = '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const CRYPTOVAULT_SYSTEM_PROMPT = `You are CryptoVault AI, an expert, friendly Web3 crypto wallet assistant.
You help users understand crypto tokens (ETH, BTC, SOL, MATIC, BNB, etc.), gas fees, DeFi protocols, smart contract safety, and portfolio balance.
Keep answers concise, clear, and easy for beginners. Never ask for or mention private keys.`;

export const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B' },
  { id: 'openrouter/free', name: 'Auto-Router' },
];

export const DEFAULT_MODELS = {
  transactionExplain: 'meta-llama/llama-3.3-70b-instruct:free',
  financialAdvice: 'meta-llama/llama-3.3-70b-instruct:free',
  gasAdvice: 'google/gemma-4-31b-it:free',
  scamAnalysis: 'meta-llama/llama-3.3-70b-instruct:free',
  chat: 'meta-llama/llama-3.3-70b-instruct:free',
};

// Comprehensive Built-in Knowledge Base for instant, 100% reliable responses
const LOCAL_KNOWLEDGE: Record<string, string> = {
  ethereum: "Ethereum is the world's leading decentralized smart contract platform. It uses Proof of Stake (PoS) and its native cryptocurrency is Ether (ETH). It powers DeFi protocols, NFTs, and Layer 2 rollups like Arbitrum, Optimism, and Base.",
  gas: "Gas is the fee required to conduct a transaction on EVM blockchains (like Ethereum or Polygon). It compensates validators for the computing power used. Gas fees fluctuate based on network congestion. You can track real-time Gwei in CryptoVault AI.",
  safe: "To keep your crypto wallet secure:\n1. Never share your 12-word seed phrase or private keys with anyone.\n2. Write your seed phrase on paper or stamp it on metal — never screenshot or email it.\n3. Always double-check recipient addresses before sending.\n4. Disconnect your wallet from unknown dApps when finished.",
  stablecoin: "A stablecoin is a cryptocurrency designed to have a stable price pegged to a fiat currency (usually $1 USD). Popular examples include USDT (Tether), USDC (USD Coin), and DAI. They provide a safe haven during market volatility.",
  diversify: "A balanced crypto portfolio typically contains:\n• 40-50% Blue-chips (BTC, ETH) for foundational stability\n• 20-30% Layer 1/Layer 2 ecosystems (SOL, MATIC/POL, BNB, AVAX)\n• 15-20% Stablecoins (USDC/USDT) for market dips\n• 5-10% High-growth DeFi/AI tokens.",
  solana: "Solana is a high-speed Layer 1 blockchain known for sub-second finality and very low transaction fees ($0.00025 avg). It utilizes Proof of History (PoH) combined with Proof of Stake.",
  swap: "Token swapping allows you to exchange one cryptocurrency for another directly on-chain using decentralized automated market makers (DEXs like Uniswap, PancakeSwap, and 1inch). Always verify slippage tolerance before confirming.",
};

export class AIService {
  static async chatStream(
    history: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    onToken: (chunk: string) => void,
    featureModel?: string
  ): Promise<string> {
    const userMessage = history[history.length - 1]?.content || '';
    const fullMessages = [
      { role: 'system', content: CRYPTOVAULT_SYSTEM_PROMPT },
      ...history,
    ];

    const modelToUse = featureModel || DEFAULT_MODELS.chat;

    // 1. Try Python FastAPI Backend first
    try {
      const pyResponse = await Promise.race([
        fetch(`${PYTHON_BACKEND_URL}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: fullMessages,
            stream: false,
          }),
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Python Backend Timeout')), 3000)),
      ]);

      if (pyResponse.ok) {
        const pyData = await pyResponse.json();
        const content = pyData.content?.trim();
        if (content) {
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            onToken((i > 0 ? ' ' : '') + words[i]);
            await new Promise(r => setTimeout(r, 16));
          }
          return content;
        }
      }
    } catch {
      // Continue to OpenRouter
    }

    // 2. Try OpenRouter API
    try {
      const response = await Promise.race([
        fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cryptovault.ai',
            'X-Title': 'CryptoVault AI Wallet',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: fullMessages,
            max_tokens: 500,
            temperature: 0.7,
            stream: false,
          }),
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('OpenRouter Timeout')), 6000)),
      ]);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            onToken((i > 0 ? ' ' : '') + words[i]);
            await new Promise(r => setTimeout(r, 18));
          }
          return content;
        }
      }
    } catch (e: any) {
      console.warn('[AIService] External API fallback engaged:', e?.message);
    }

    // 3. Smart Local Knowledge Engine Fallback
    const lower = userMessage.toLowerCase();
    let reply = "I am CryptoVault AI, your non-custodial Web3 assistant. I can help you check gas fees, analyze token safety, review swap routes, or explain blockchain concepts. What would you like to explore?";

    if (lower.includes('gas') || lower.includes('fee')) {
      reply = LOCAL_KNOWLEDGE.gas;
    } else if (lower.includes('safe') || lower.includes('security') || lower.includes('hack') || lower.includes('seed')) {
      reply = LOCAL_KNOWLEDGE.safe;
    } else if (lower.includes('eth') || lower.includes('ethereum')) {
      reply = LOCAL_KNOWLEDGE.ethereum;
    } else if (lower.includes('stable') || lower.includes('usdt') || lower.includes('usdc')) {
      reply = LOCAL_KNOWLEDGE.stablecoin;
    } else if (lower.includes('diversif') || lower.includes('portfolio') || lower.includes('invest')) {
      reply = LOCAL_KNOWLEDGE.diversify;
    } else if (lower.includes('sol') || lower.includes('solana')) {
      reply = LOCAL_KNOWLEDGE.solana;
    } else if (lower.includes('swap') || lower.includes('dex') || lower.includes('trade')) {
      reply = LOCAL_KNOWLEDGE.swap;
    } else if (lower.includes('bitcoin') || lower.includes('btc')) {
      reply = "Bitcoin (BTC) is the first and largest decentralized cryptocurrency created by Satoshi Nakamoto in 2009. It has a fixed supply cap of 21 million coins and operates as digital gold.";
    }

    const words = reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      onToken((i > 0 ? ' ' : '') + words[i]);
      await new Promise(r => setTimeout(r, 20));
    }
    return reply;
  }

  static async explainTransaction(details: string, onToken: (chunk: string) => void): Promise<string> {
    return this.chatStream([
      { role: 'user', content: `Please explain this blockchain transaction in plain, reassuring English for a crypto user:\n${details}` }
    ], onToken, DEFAULT_MODELS.transactionExplain);
  }

  static async analyzeScam(addressOrUrl: string, onToken: (chunk: string) => void): Promise<string> {
    return this.chatStream([
      { role: 'user', content: `Please analyze this address/URL for potential phishing, scam, or drainer risks:\n${addressOrUrl}` }
    ], onToken, DEFAULT_MODELS.scamAnalysis);
  }

  static async getGasAdvice(currentGwei: number, onToken: (chunk: string) => void): Promise<string> {
    return this.chatStream([
      { role: 'user', content: `Current Ethereum base fee is ${currentGwei} Gwei. Is this a good time to send transactions or swap tokens? Suggest optimal timing and alternatives.` }
    ], onToken, DEFAULT_MODELS.gasAdvice);
  }
}