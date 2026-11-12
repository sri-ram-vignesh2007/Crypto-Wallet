// src/config/Web3ApiConfig.ts
// Centralized Production Web3 API Keys & Connectors Configuration

/**
 * PRODUCTION CONNECTORS & APIS GUIDE:
 *
 * 1. ALCHEMY (Blockchain RPC Nodes & Balances):
 *    - Sign up at https://www.alchemy.com/ (Free Tier: 30 million compute units/month)
 *    - Create an App, select "Ethereum" / "Solana" / "Base"
 *    - Copy your API key into ALCHEMY_API_KEY below.
 *
 * 2. TRANSAK (Credit Card, Apple Pay, UPI Fiat On-Ramp):
 *    - Sign up at https://transak.com/ or https://dashboard.transak.com/
 *    - Get a free Sandbox / Production API Key
 *    - Insert into TRANSAK_API_KEY below.
 *
 * 3. MOONPAY (Global Debit Card / Apple Pay On-Ramp):
 *    - Sign up at https://www.moonpay.com/dashboard
 *    - Get your publishable API Key (e.g. pk_live_... or pk_test_...)
 *    - Insert into MOONPAY_API_KEY below.
 *
 * 4. REOWN / WALLETCONNECT v2 (dApp Connection to Uniswap/OpenSea):
 *    - Sign up at https://cloud.reown.com/ (Free Project ID)
 *    - Copy your 32-character Project ID into REOWN_PROJECT_ID below.
 *
 * 5. COINGECKO (Live Token Prices & 24h Market Changes):
 *    - Standard public endpoints work free with NO API key needed!
 *    - Or get a free Pro Demo key at https://www.coingecko.com/en/api
 */

export const WEB3_API_CONFIG = {
  // Alchemy RPC Key (Leave empty to use bulletproof public RPCs like Cloudflare, LlamaRPC, Binance)
  ALCHEMY_API_KEY: 'alch__zPVM_ni3Cs5bvuwQcyPL',

  // Transak Fiat On-ramp API Key (Free sandbox or production)
  TRANSAK_API_KEY: '0d48ff02-39c2-4fa0-86d7-84d5df6e3b5e', // Demo partner key
  TRANSAK_ENV: 'PRODUCTION' as 'STAGING' | 'PRODUCTION',

  // MoonPay Publishable Key
  MOONPAY_API_KEY: 'pk_test_123456789',

  // Reown / WalletConnect v2 Project ID
  REOWN_PROJECT_ID: '3a8170812b534d0ff9d794f19a901d64',

  // CoinGecko Pro API Key (Optional; public endpoints used by default)
  COINGECKO_API_KEY: '',
};

export function getAlchemyRpcUrl(chainKey: string): string | null {
  const key = WEB3_API_CONFIG.ALCHEMY_API_KEY;
  if (!key) return null;

  switch (chainKey) {
    case 'ethereum':
      return `https://eth-mainnet.g.alchemy.com/v2/${key}`;
    case 'polygon':
      return `https://polygon-mainnet.g.alchemy.com/v2/${key}`;
    case 'arbitrum':
      return `https://arb-mainnet.g.alchemy.com/v2/${key}`;
    case 'optimism':
      return `https://opt-mainnet.g.alchemy.com/v2/${key}`;
    case 'base':
      return `https://base-mainnet.g.alchemy.com/v2/${key}`;
    default:
      return null;
  }
}

export function getTransakUrl(address: string, cryptoSymbol: string = 'ETH', fiatAmount: string = '200'): string {
  const baseUrl = WEB3_API_CONFIG.TRANSAK_ENV === 'STAGING'
    ? 'https://global-stg.transak.com'
    : 'https://global.transak.com';

  const apiKey = WEB3_API_CONFIG.TRANSAK_API_KEY;
  const symbol = cryptoSymbol.toUpperCase();

  return `${baseUrl}/?apiKey=${apiKey}&walletAddress=${address}&cryptoCurrencyCode=${symbol}&fiatCurrency=USD&fiatAmount=${fiatAmount}&themeColor=5865F2`;
}

export function getMoonPayUrl(address: string, cryptoSymbol: string = 'ETH', fiatAmount: string = '200'): string {
  const apiKey = WEB3_API_CONFIG.MOONPAY_API_KEY;
  const symbol = cryptoSymbol.toLowerCase();

  return `https://buy.moonpay.com/?apiKey=${apiKey}&walletAddress=${address}&currencyCode=${symbol}&baseCurrencyAmount=${fiatAmount}&baseCurrencyCode=usd`;
}

