// src/core/ChainConfig.ts
// ALL BLOCKCHAINS — Ethereum, BSC, Polygon, Base, Arbitrum, Avalanche, Solana, Bitcoin, TON, etc.”
// RPC: Alchemy (premium, paid key) — mainnets we have keys for are first.

export interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrls: string[];
  explorer: string;
  decimals: number;
  logo: string;
  isEVM: boolean;        // Ethereum-compatible (uses same address format)
  isTestnet: boolean;
}

export interface Token {
  address: string;       // Contract address (null for native coin)
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  chainKey: string;      // Which chain this token belongs to
  isNative: boolean;     // ETH, BNB, MATIC, etc.
}

// Alchemy API key — used in the Alchemy endpoint URLs.
const ALCHEMY_KEY = 'alch__zPVM_ni3Cs5bvuwQcyPL';

export const CHAINS: Record<string, Chain> = {
  // ========== MAINNETS (100% Free Public RPCs) ==========
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrls: [
      'https://cloudflare-eth.com',
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum-rpc.publicnode.com',
    ],
    explorer: 'https://etherscan.io',
    decimals: 18,
    logo: 'Ξ',
    isEVM: true,
    isTestnet: false,
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrls: [
      'https://binance.llamarpc.com',
      'https://bsc-dataseed.binance.org',
      'https://rpc.ankr.com/bsc',
      'https://bsc-rpc.publicnode.com',
    ],
    explorer: 'https://bscscan.com',
    decimals: 18,
    logo: 'B',
    isEVM: true,
    isTestnet: false,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://polygon.llamarpc.com',
      'https://rpc.ankr.com/polygon',
      'https://polygon-bor-rpc.publicnode.com',
    ],
    explorer: 'https://polygonscan.com',
    decimals: 18,
    logo: 'P',
    isEVM: true,
    isTestnet: false,
  },
  base: {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://rpc.ankr.com/base',
    ],
    explorer: 'https://basescan.org',
    decimals: 18,
    logo: '⬡',
    isEVM: true,
    isTestnet: false,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum.llamarpc.com',
      'https://rpc.ankr.com/arbitrum',
    ],
    explorer: 'https://arbiscan.io',
    decimals: 18,
    logo: 'A',
    isEVM: true,
    isTestnet: false,
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche.public-rpc.com',
      'https://rpc.ankr.com/avalanche',
    ],
    explorer: 'https://snowtrace.io',
    decimals: 18,
    logo: '🔺',
    isEVM: true,
    isTestnet: false,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://optimism.llamarpc.com',
      'https://rpc.ankr.com/optimism',
    ],
    explorer: 'https://optimistic.etherscan.io',
    decimals: 18,
    logo: 'O',
    isEVM: true,
    isTestnet: false,
  },
  fantom: {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    rpcUrls: [
      'https://rpc.ftm.tools',
      'https://fantom.public-rpc.com',
      'https://rpc.ankr.com/fantom',
    ],
    explorer: 'https://ftmscan.com',
    decimals: 18,
    logo: 'F',
    isEVM: true,
    isTestnet: false,
  },
  cronos: {
    id: 25,
    name: 'Cronos',
    symbol: 'CRO',
    rpcUrls: [
      'https://evm.cronos.org',
      'https://cronos.drpc.org',
    ],
    explorer: 'https://cronoscan.com',
    decimals: 18,
    logo: 'C',
    isEVM: true,
    isTestnet: false,
  },
  // ========== NON-EVM ==========
  // Solana uses a different address format and JSON-RPC API — ethers.js can't query it.
  // It's listed here so the wallet UI can show it and we can route to a Solana-specific
  // service module later. For now, balance/transfers on Solana are stubs.
  solana: {
    id: 0,
    name: 'Solana',
    symbol: 'SOL',
    rpcUrls: [
      `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    ],
    explorer: 'https://explorer.solana.com',
    decimals: 9,
    logo: '◎',
    isEVM: false,
    isTestnet: false,
  },
  // ========== TESTNETS ==========
  sepolia: {
    id: 11155111,
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    rpcUrls: ['https://sepolia.drpc.org', 'https://rpc.ankr.com/eth_sepolia'],
    explorer: 'https://sepolia.etherscan.io',
    decimals: 18,
    logo: 'Ξ',
    isEVM: true,
    isTestnet: true,
  },
  bscTestnet: {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'tBNB',
    rpcUrls: ['https://bsc-testnet.drpc.org'],
    explorer: 'https://testnet.bscscan.com',
    decimals: 18,
    logo: 'B',
    isEVM: true,
    isTestnet: true,
  },
};

// Default chain for new users — Ethereum mainnet (real RPC via Alchemy)
export const DEFAULT_CHAIN = 'ethereum';

// Popular tokens across all chains (like Trust Wallet shows)
export const POPULAR_TOKENS: Token[] = [
  // Ethereum
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum', decimals: 18, logo: 'Ξ', chainKey: 'ethereum', isNative: true },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, logo: '₮', chainKey: 'ethereum', isNative: false },
  { address: '0xA0b86a33E6441e0A421e56E4773C3C1C3E1e2E1e', symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: '$', chainKey: 'ethereum', isNative: false },
  { address: '0x7D1AfA7B718fb893dB30A3abc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon', decimals: 18, logo: 'P', chainKey: 'ethereum', isNative: false },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logo: '🦄', chainKey: 'ethereum', isNative: false },
  { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, logo: '⬡', chainKey: 'ethereum', isNative: false },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logo: '₿', chainKey: 'ethereum', isNative: false },
  { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, logo: '🐕', chainKey: 'ethereum', isNative: false },
  
  // BSC
  { address: '0x0000000000000000000000000000000000000000', symbol: 'BNB', name: 'BNB', decimals: 18, logo: 'B', chainKey: 'bsc', isNative: true },
  { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD (BSC)', decimals: 18, logo: '₮', chainKey: 'bsc', isNative: false },
  { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin (BSC)', decimals: 18, logo: '$', chainKey: 'bsc', isNative: false },
  { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, logo: '🥞', chainKey: 'bsc', isNative: false },
  { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', symbol: 'ETH', name: 'Ethereum (BSC)', decimals: 18, logo: 'Ξ', chainKey: 'bsc', isNative: false },
  
  // Polygon
  { address: '0x0000000000000000000000000000000000000000', symbol: 'MATIC', name: 'Polygon', decimals: 18, logo: 'P', chainKey: 'polygon', isNative: true },
  { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD (Polygon)', decimals: 6, logo: '₮', chainKey: 'polygon', isNative: false },
  { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin (Polygon)', decimals: 6, logo: '$', chainKey: 'polygon', isNative: false },
  
  // Base
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum (Base)', decimals: 18, logo: 'Ξ', chainKey: 'base', isNative: true },
  { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logo: '◈', chainKey: 'base', isNative: false },
  
  // Arbitrum
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum (Arbitrum)', decimals: 18, logo: 'Ξ', chainKey: 'arbitrum', isNative: true },
  { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', symbol: 'USDT', name: 'Tether USD (Arbitrum)', decimals: 6, logo: '₮', chainKey: 'arbitrum', isNative: false },
  
  // Avalanche
  { address: '0x0000000000000000000000000000000000000000', symbol: 'AVAX', name: 'Avalanche', decimals: 18, logo: '🔺', chainKey: 'avalanche', isNative: true },
  
  // Solana (non-EVM — display only for now)
  { address: '0x0000000000000000000000000000000000000000', symbol: 'SOL', name: 'Solana', decimals: 9, logo: '◎', chainKey: 'solana', isNative: true },
  
  // Sepolia Testnet
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Sepolia ETH', decimals: 18, logo: 'Ξ', chainKey: 'sepolia', isNative: true },
];

// Get all tokens for a specific chain
export function getTokensForChain(chainKey: string): Token[] {
  return POPULAR_TOKENS.filter(t => t.chainKey === chainKey);
}

// Get native token for a chain
export function getNativeToken(chainKey: string): Token | undefined {
  return POPULAR_TOKENS.find(t => t.chainKey === chainKey && t.isNative);
}