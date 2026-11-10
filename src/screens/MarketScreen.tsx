// src/screens/MarketScreen.tsx - Institutional Multi-Chain Crypto Markets Hub with CoinGecko Top Assets

import React, { useState, useMemo, useEffect } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, RefreshControl, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { TokenLogo } from '../components/TokenLogo';
import { useWatchlistStore } from '../store/watchlistStore';

// Vector Search Glyph
const SearchIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const StarIcon = ({ filled = false, color = '#FFFFFF', size = 18 }: { filled?: boolean; color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

const GlobeIcon = ({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export type MarketCategory =
  | 'Trending'
  | 'bStocks'
  | 'Stock tokens'
  | 'Ondo'
  | 'Stonks'
  | 'Majors'
  | 'DeFi'
  | 'Layer 2'
  | 'Top Gainers'
  | 'Top Losers'
  | 'New'
  | 'RWA & Stocks';

export interface MarketToken {
  symbol: string;
  name: string;
  price: string;
  numericPrice: number;
  change1h: string;
  positive1h: boolean;
  change7h: string;
  positive7h: boolean;
  change24h: string;
  positive24h: boolean;
  numericChange: number;
  volume24h: string;
  marketCap: string;
  numericMarketCap: number;
  chain: string;
  category: MarketCategory[];
}

const ALL_MARKET_TOKENS: MarketToken[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$67,540.00',
    numericPrice: 67540,
    change1h: '+0.25%',
    positive1h: true,
    change7h: '+1.45%',
    positive7h: true,
    change24h: '+3.42%',
    positive24h: true,
    numericChange: 3.42,
    volume24h: '$34.2B',
    marketCap: '$1.33T',
    numericMarketCap: 1330000000000,
    chain: 'Bitcoin',
    category: ['Majors', 'Trending'],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$2,700.00',
    numericPrice: 2700,
    change1h: '+0.38%',
    positive1h: true,
    change7h: '+2.10%',
    positive7h: true,
    change24h: '+5.40%',
    positive24h: true,
    numericChange: 5.40,
    volume24h: '$18.6B',
    marketCap: '$324.8B',
    numericMarketCap: 324800000000,
    chain: 'Ethereum',
    category: ['Majors', 'Trending', 'DeFi'],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: '$168.20',
    numericPrice: 168.2,
    change1h: '+1.15%',
    positive1h: true,
    change7h: '+4.80%',
    positive7h: true,
    change24h: '+12.40%',
    positive24h: true,
    numericChange: 12.40,
    volume24h: '$6.8B',
    marketCap: '$78.4B',
    numericMarketCap: 78400000000,
    chain: 'Solana',
    category: ['Majors', 'Trending', 'Top Gainers'],
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    price: '$592.40',
    numericPrice: 592.4,
    change1h: '+0.12%',
    positive1h: true,
    change7h: '+0.85%',
    positive7h: true,
    change24h: '+2.15%',
    positive24h: true,
    numericChange: 2.15,
    volume24h: '$1.4B',
    marketCap: '$89.2B',
    numericMarketCap: 89200000000,
    chain: 'BNB Chain',
    category: ['Majors'],
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    price: '$0.542',
    numericPrice: 0.542,
    change1h: '-0.10%',
    positive1h: false,
    change7h: '+0.40%',
    positive7h: true,
    change24h: '+1.80%',
    positive24h: true,
    numericChange: 1.80,
    volume24h: '$1.1B',
    marketCap: '$30.6B',
    numericMarketCap: 30600000000,
    chain: 'Ethereum',
    category: ['Majors'],
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: '$0.158',
    numericPrice: 0.158,
    change1h: '+0.60%',
    positive1h: true,
    change7h: '+3.10%',
    positive7h: true,
    change24h: '+8.90%',
    positive24h: true,
    numericChange: 8.90,
    volume24h: '$2.1B',
    marketCap: '$23.1B',
    numericMarketCap: 23100000000,
    chain: 'Bitcoin',
    category: ['Trending', 'Top Gainers'],
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    price: '$0.428',
    numericPrice: 0.428,
    change1h: '-0.20%',
    positive1h: false,
    change7h: '-0.85%',
    positive7h: false,
    change24h: '-1.85%',
    positive24h: false,
    numericChange: -1.85,
    volume24h: '$410M',
    marketCap: '$15.2B',
    numericMarketCap: 15200000000,
    chain: 'Ethereum',
    category: ['Majors', 'Top Losers'],
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: '$27.80',
    numericPrice: 27.8,
    change1h: '+0.30%',
    positive1h: true,
    change7h: '+1.10%',
    positive7h: true,
    change24h: '+4.20%',
    positive24h: true,
    numericChange: 4.20,
    volume24h: '$420M',
    marketCap: '$11.2B',
    numericMarketCap: 11200000000,
    chain: 'Avalanche',
    category: ['Majors', 'DeFi'],
  },
  {
    symbol: 'SUI',
    name: 'Sui Network',
    price: '$2.15',
    numericPrice: 2.15,
    change1h: '+1.40%',
    positive1h: true,
    change7h: '+6.20%',
    positive7h: true,
    change24h: '+15.80%',
    positive24h: true,
    numericChange: 15.80,
    volume24h: '$950M',
    marketCap: '$5.9B',
    numericMarketCap: 5900000000,
    chain: 'Sui',
    category: ['Trending', 'Top Gainers', 'New'],
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    price: '$11.80',
    numericPrice: 11.8,
    change1h: '+0.15%',
    positive1h: true,
    change7h: '+0.95%',
    positive7h: true,
    change24h: '+1.90%',
    positive24h: true,
    numericChange: 1.90,
    volume24h: '$260M',
    marketCap: '$7.1B',
    numericMarketCap: 7100000000,
    chain: 'Ethereum',
    category: ['DeFi', 'Majors'],
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    price: '$0.0000185',
    numericPrice: 0.0000185,
    change1h: '+0.45%',
    positive1h: true,
    change7h: '+2.10%',
    positive7h: true,
    change24h: '+6.15%',
    positive24h: true,
    numericChange: 6.15,
    volume24h: '$520M',
    marketCap: '$10.9B',
    numericMarketCap: 10900000000,
    chain: 'Ethereum',
    category: ['Trending'],
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    price: '$0.0000098',
    numericPrice: 0.0000098,
    change1h: '+1.20%',
    positive1h: true,
    change7h: '+5.40%',
    positive7h: true,
    change24h: '+14.20%',
    positive24h: true,
    numericChange: 14.20,
    volume24h: '$840M',
    marketCap: '$4.1B',
    numericMarketCap: 4100000000,
    chain: 'Ethereum',
    category: ['Trending', 'Top Gainers', 'New'],
  },
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    price: '$5.15',
    numericPrice: 5.15,
    change1h: '+0.80%',
    positive1h: true,
    change7h: '+3.20%',
    positive7h: true,
    change24h: '+8.20%',
    positive24h: true,
    numericChange: 8.20,
    volume24h: '$480M',
    marketCap: '$6.3B',
    numericMarketCap: 6300000000,
    chain: 'NEAR',
    category: ['Trending', 'Top Gainers', 'Layer 2'],
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    price: '$4.45',
    numericPrice: 4.45,
    change1h: '-0.15%',
    positive1h: false,
    change7h: '-0.40%',
    positive7h: false,
    change24h: '-1.10%',
    positive24h: false,
    numericChange: -1.10,
    volume24h: '$160M',
    marketCap: '$6.4B',
    numericMarketCap: 6400000000,
    chain: 'Ethereum',
    category: ['Majors', 'Top Losers'],
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    price: '$7.85',
    numericPrice: 7.85,
    change1h: '+0.50%',
    positive1h: true,
    change7h: '+1.80%',
    positive7h: true,
    change24h: '+4.90%',
    positive24h: true,
    numericChange: 4.90,
    volume24h: '$320M',
    marketCap: '$4.7B',
    numericMarketCap: 4700000000,
    chain: 'Ethereum',
    category: ['DeFi', 'Majors'],
  },
  {
    symbol: 'APT',
    name: 'Aptos',
    price: '$9.20',
    numericPrice: 9.20,
    change1h: '+0.90%',
    positive1h: true,
    change7h: '+4.10%',
    positive7h: true,
    change24h: '+11.30%',
    positive24h: true,
    numericChange: 11.30,
    volume24h: '$390M',
    marketCap: '$4.5B',
    numericMarketCap: 4500000000,
    chain: 'Ethereum',
    category: ['Trending', 'Top Gainers'],
  },
  {
    symbol: 'FET',
    name: 'Artificial Superintelligence Alliance',
    price: '$1.42',
    numericPrice: 1.42,
    change1h: '+1.10%',
    positive1h: true,
    change7h: '+4.90%',
    positive7h: true,
    change24h: '+13.60%',
    positive24h: true,
    numericChange: 13.60,
    volume24h: '$290M',
    marketCap: '$3.6B',
    numericMarketCap: 3600000000,
    chain: 'Ethereum',
    category: ['Trending', 'Top Gainers', 'New'],
  },
  {
    symbol: 'TIA',
    name: 'Celestia',
    price: '$5.80',
    numericPrice: 5.80,
    change1h: '-0.50%',
    positive1h: false,
    change7h: '-2.10%',
    positive7h: false,
    change24h: '-4.60%',
    positive24h: false,
    numericChange: -4.60,
    volume24h: '$180M',
    marketCap: '$1.3B',
    numericMarketCap: 1300000000,
    chain: 'Ethereum',
    category: ['Top Losers'],
  },
  {
    symbol: 'RENDER',
    name: 'Render Network',
    price: '$6.20',
    numericPrice: 6.2,
    change1h: '+0.40%',
    positive1h: true,
    change7h: '+1.60%',
    positive7h: true,
    change24h: '+4.10%',
    positive24h: true,
    numericChange: 4.10,
    volume24h: '$195M',
    marketCap: '$3.2B',
    numericMarketCap: 3200000000,
    chain: 'Solana',
    category: ['Trending'],
  },
  {
    symbol: 'INJ',
    name: 'Injective',
    price: '$21.40',
    numericPrice: 21.4,
    change1h: '+0.70%',
    positive1h: true,
    change7h: '+3.10%',
    positive7h: true,
    change24h: '+7.80%',
    positive24h: true,
    numericChange: 7.80,
    volume24h: '$140M',
    marketCap: '$2.1B',
    numericMarketCap: 2100000000,
    chain: 'Ethereum',
    category: ['DeFi', 'Trending'],
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    price: '$0.58',
    numericPrice: 0.58,
    change1h: '-0.30%',
    positive1h: false,
    change7h: '-1.10%',
    positive7h: false,
    change24h: '-2.10%',
    positive24h: false,
    numericChange: -2.10,
    volume24h: '$185M',
    marketCap: '$2.05B',
    numericMarketCap: 2050000000,
    chain: 'Arbitrum',
    category: ['Layer 2', 'Top Losers'],
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    price: '$1.65',
    numericPrice: 1.65,
    change1h: '+0.55%',
    positive1h: true,
    change7h: '+2.40%',
    positive7h: true,
    change24h: '+6.20%',
    positive24h: true,
    numericChange: 6.20,
    volume24h: '$210M',
    marketCap: '$2.1B',
    numericMarketCap: 2100000000,
    chain: 'Optimism',
    category: ['Layer 2', 'Trending'],
  },
  {
    symbol: 'POL',
    name: 'Polygon Ecosystem Token',
    price: '$0.38',
    numericPrice: 0.38,
    change1h: '+0.20%',
    positive1h: true,
    change7h: '+1.30%',
    positive7h: true,
    change24h: '+3.50%',
    positive24h: true,
    numericChange: 3.50,
    volume24h: '$130M',
    marketCap: '$3.1B',
    numericMarketCap: 3100000000,
    chain: 'Polygon',
    category: ['Layer 2'],
  },
  {
    symbol: 'TON',
    name: 'Toncoin',
    price: '$5.20',
    numericPrice: 5.20,
    change1h: '+0.40%',
    positive1h: true,
    change7h: '+1.75%',
    positive7h: true,
    change24h: '+3.90%',
    positive24h: true,
    numericChange: 3.90,
    volume24h: '$280M',
    marketCap: '$13.2B',
    numericMarketCap: 13200000000,
    chain: 'Ethereum',
    category: ['Majors'],
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    price: '$72.40',
    numericPrice: 72.40,
    change1h: '+0.10%',
    positive1h: true,
    change7h: '+0.60%',
    positive7h: true,
    change24h: '+1.50%',
    positive24h: true,
    numericChange: 1.50,
    volume24h: '$340M',
    marketCap: '$5.4B',
    numericMarketCap: 5400000000,
    chain: 'Bitcoin',
    category: ['Majors'],
  },
  {
    symbol: 'ICP',
    name: 'Internet Computer',
    price: '$8.45',
    numericPrice: 8.45,
    change1h: '-0.40%',
    positive1h: false,
    change7h: '-1.80%',
    positive7h: false,
    change24h: '-3.20%',
    positive24h: false,
    numericChange: -3.20,
    volume24h: '$95M',
    marketCap: '$3.9B',
    numericMarketCap: 3900000000,
    chain: 'Ethereum',
    category: ['Top Losers'],
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: '$1.00',
    numericPrice: 1.0,
    change1h: '0.00%',
    positive1h: true,
    change7h: '+0.01%',
    positive7h: true,
    change24h: '+0.01%',
    positive24h: true,
    numericChange: 0.01,
    volume24h: '$7.8B',
    marketCap: '$35.2B',
    numericMarketCap: 35200000000,
    chain: 'Ethereum',
    category: ['Majors', 'RWA & Stocks'],
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    price: '$1.00',
    numericPrice: 1.0,
    change1h: '0.00%',
    positive1h: true,
    change7h: '+0.01%',
    positive7h: true,
    change24h: '+0.02%',
    positive24h: true,
    numericChange: 0.02,
    volume24h: '$48.1B',
    marketCap: '$118.0B',
    numericMarketCap: 118000000000,
    chain: 'Ethereum',
    category: ['Majors'],
  },
  {
    symbol: 'BUIDL',
    name: 'BlackRock BUIDL Fund',
    price: '$1.00',
    numericPrice: 1.0,
    change1h: '0.00%',
    positive1h: true,
    change7h: '+0.01%',
    positive7h: true,
    change24h: '+0.01%',
    positive24h: true,
    numericChange: 0.01,
    volume24h: '$42M',
    marketCap: '$520M',
    numericMarketCap: 520000000,
    chain: 'Ethereum',
    category: ['RWA & Stocks', 'New'],
  },
  {
    symbol: 'OUSG',
    name: 'Ondo US Short-Term Govt',
    price: '$105.40',
    numericPrice: 105.4,
    change1h: '0.00%',
    positive1h: true,
    change7h: '+0.01%',
    positive7h: true,
    change24h: '+0.03%',
    positive24h: true,
    numericChange: 0.03,
    volume24h: '$15M',
    marketCap: '$240M',
    numericMarketCap: 240000000,
    chain: 'Ethereum',
    category: ['RWA & Stocks'],
  },
  {
    symbol: 'AAPLx',
    name: 'Tokenized Apple Inc.',
    price: '$224.20',
    numericPrice: 224.2,
    change1h: '+0.30%',
    positive1h: true,
    change7h: '+0.95%',
    positive7h: true,
    change24h: '+1.85%',
    positive24h: true,
    numericChange: 1.85,
    volume24h: '$65M',
    marketCap: '$3.4T Eq.',
    numericMarketCap: 3400000000000,
    chain: 'Solana',
    category: ['RWA & Stocks'],
  },
  {
    symbol: 'TSLAx',
    name: 'Tokenized Tesla Inc.',
    price: '$218.40',
    numericPrice: 218.4,
    change1h: '+0.80%',
    positive1h: true,
    change7h: '+2.10%',
    positive7h: true,
    change24h: '+4.20%',
    positive24h: true,
    numericChange: 4.20,
    volume24h: '$84M',
    marketCap: '$690B Eq.',
    numericMarketCap: 690000000000,
    chain: 'Solana',
    category: ['bStocks', 'Stock tokens', 'Stonks', 'RWA & Stocks', 'Trending'],
  },
  {
    symbol: 'NVDAx',
    name: 'Tokenized NVIDIA Corp.',
    price: '$128.50',
    numericPrice: 128.5,
    change1h: '+0.50%',
    positive1h: true,
    change7h: '+1.80%',
    positive7h: true,
    change24h: '+3.95%',
    positive24h: true,
    numericChange: 3.95,
    volume24h: '$92M',
    marketCap: '$3.15T Eq.',
    numericMarketCap: 3150000000000,
    chain: 'Solana',
    category: ['bStocks', 'Stock tokens', 'Stonks', 'Trending'],
  },
  {
    symbol: 'ONDO',
    name: 'Ondo',
    price: '$0.785',
    numericPrice: 0.785,
    change1h: '+0.80%',
    positive1h: true,
    change7h: '+2.40%',
    positive7h: true,
    change24h: '+5.80%',
    positive24h: true,
    numericChange: 5.80,
    volume24h: '$145M',
    marketCap: '$1.08B',
    numericMarketCap: 1080000000,
    chain: 'Ethereum',
    category: ['Ondo', 'RWA & Stocks', 'Trending'],
  },
  {
    symbol: 'LIBRA',
    name: 'Libra',
    price: '$0.006222',
    numericPrice: 0.006222,
    change1h: '-1.01%',
    positive1h: false,
    change7h: '-1.45%',
    positive7h: false,
    change24h: '-2.00%',
    positive24h: false,
    numericChange: -2.00,
    volume24h: '$283.13M',
    marketCap: '$6.22M',
    numericMarketCap: 6220000,
    chain: 'BNB Chain',
    category: ['Trending', 'New', 'DeFi'],
  },
];

const CATEGORIES: MarketCategory[] = [
  'Trending',
  'bStocks',
  'Stock tokens',
  'Ondo',
  'Stonks',
  'Majors',
  'DeFi',
  'Layer 2',
  'Top Gainers',
  'Top Losers',
];

const NETWORKS = [
  'All Chains', 'Ethereum', 'Solana', 'Bitcoin', 'BNB Chain', 'Arbitrum',
  'Polygon', 'Avalanche', 'Optimism', 'NEAR', 'Sui'
];

const TIMEFRAMES = ['1h', '7h', '24h'] as const;

export default function MarketScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const { watchlist, loadWatchlist } = useWatchlistStore();

  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('Trending');
  const [selectedNetwork, setSelectedNetwork] = useState('All Chains');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '7h' | '24h'>('24h');
  const [isWatchlistFilter, setIsWatchlistFilter] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#2B2B2B' : '#E8E8E8';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const filteredTokens = useMemo(() => {
    let list = ALL_MARKET_TOKENS.filter((t) => {
      // Watchlist filter if star is selected
      if (isWatchlistFilter) {
        if (!watchlist.includes(t.symbol.toUpperCase())) return false;
      } else {
        // Category filter
        if (selectedCategory === 'Top Gainers') {
          const changeNum = selectedTimeframe === '1h'
            ? (t.positive1h ? 1 : -1)
            : selectedTimeframe === '7h'
            ? (t.positive7h ? 1 : -1)
            : (t.positive24h ? t.numericChange : -1);
          if (changeNum <= 0) return false;
        } else if (selectedCategory === 'Top Losers') {
          const isPos = selectedTimeframe === '1h' ? t.positive1h : selectedTimeframe === '7h' ? t.positive7h : t.positive24h;
          if (isPos) return false;
        } else {
          if (!t.category.includes(selectedCategory)) return false;
        }
      }

      // Network filter
      if (selectedNetwork !== 'All Chains' && t.chain !== selectedNetwork) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q) ||
          t.chain.toLowerCase().includes(q)
        );
      }

      return true;
    });

    // Volume Sort
    list = [...list].sort((a, b) => {
      const volA = parseFloat(a.volume24h.replace(/[^0-9.]/g, '')) * (a.volume24h.includes('B') ? 1000 : 1);
      const volB = parseFloat(b.volume24h.replace(/[^0-9.]/g, '')) * (b.volume24h.includes('B') ? 1000 : 1);
      return sortOrder === 'desc' ? volB - volA : volA - volB;
    });

    return list;
  }, [isWatchlistFilter, watchlist, selectedCategory, selectedNetwork, selectedTimeframe, searchQuery, sortOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    loadWatchlist();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitleText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Markets</Text>

          <TouchableOpacity
            onPress={() => navigation?.navigate?.('DAppBrowser')}
            style={[styles.web3BrowserBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <GlobeIcon color={isDark ? '#FFFFFF' : '#111111'} size={18} />
          </TouchableOpacity>
        </View>

        {/* Big Search Input */}
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={18} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 500+ cryptos, tokens, contracts..."
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── ROW 1: [★] STAR WATCHLIST BUTTON + CATEGORY PILLS (Image 1) ── */}
      <View style={styles.categoriesWrap}>
        <View style={styles.categoryRowContainer}>
          <TouchableOpacity
            onPress={() => setIsWatchlistFilter(prev => !prev)}
            style={[
              styles.starFilterBtn,
              {
                backgroundColor: isWatchlistFilter ? (isDark ? '#5B73E8' : '#2563EB') : monoMutedSurface,
                borderColor: cardBorder,
              },
            ]}
            activeOpacity={0.75}
          >
            <StarIcon filled={isWatchlistFilter} color={isWatchlistFilter ? '#FFFFFF' : (isDark ? '#AAAAAA' : '#666666')} size={18} />
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {CATEGORIES.map((cat) => {
              const active = !isWatchlistFilter && selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setIsWatchlistFilter(false);
                    setSelectedCategory(cat);
                  }}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: active ? (isDark ? '#5B73E8' : '#2563EB') : monoMutedSurface,
                      borderColor: active ? 'transparent' : cardBorder,
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: active ? '#FFFFFF' : (isDark ? '#DDDDDD' : colors.text.muted), fontWeight: active ? '800' : '600' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── ROW 2: [Network ˅] ON LEFT, [Volume ↓] & [24h ˅] ON RIGHT (Image 1) ── */}
      <View style={styles.filterControlsRow}>
        {/* Network Dropdown Button */}
        <TouchableOpacity
          onPress={() => setShowNetworkModal(true)}
          style={[styles.networkDropdownBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
          activeOpacity={0.75}
        >
          <Text style={[styles.networkDropdownText, { color: isDark ? '#FFFFFF' : colors.text.primary }]}>
            {selectedNetwork === 'All Chains' ? 'Network' : selectedNetwork}
          </Text>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={isDark ? '#FFFFFF' : colors.text.primary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 9l6 6 6-6" />
          </Svg>
        </TouchableOpacity>

        {/* Right Action Buttons */}
        <View style={styles.filterRightGroup}>
          <TouchableOpacity
            onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            style={[styles.smallFilterBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.smallFilterText, { color: isDark ? '#FFFFFF' : colors.text.primary }]}>
              Volume {sortOrder === 'desc' ? '↓' : '↑'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTimeframe(prev => prev === '1h' ? '7h' : prev === '7h' ? '24h' : '1h')}
            style={[styles.smallFilterBtn, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.smallFilterText, { color: isDark ? '#FFFFFF' : colors.text.primary }]}>
              {selectedTimeframe} ˅
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── NETWORK CHOOSER POPUP MODAL ───────────────────────── */}
      <Modal visible={showNetworkModal} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowNetworkModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: cardBorder }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Choose Network</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {NETWORKS.map(net => {
                const isSelected = selectedNetwork === net;
                return (
                  <TouchableOpacity
                    key={net}
                    onPress={() => {
                      setSelectedNetwork(net);
                      setShowNetworkModal(false);
                    }}
                    style={[styles.networkOptionRow, { borderBottomColor: cardBorder }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.networkOptionText, { color: isSelected ? (isDark ? '#5B73E8' : '#2563EB') : (isDark ? '#FFFFFF' : '#111111'), fontWeight: isSelected ? '800' : '500' }]}>
                      {net}
                    </Text>
                    {isSelected && (
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={isDark ? '#5B73E8' : '#2563EB'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M20 6L9 17l-5-5" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ── TOKEN LIST (No mini graphs, delta directly under price, high visibility) ── */}
      <ScrollView
        contentContainerStyle={[styles.tokenListContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={monoPrimary} />}
      >
        <View style={[styles.tokenCardContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {filteredTokens.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Assets Found</Text>
              <Text style={[styles.emptySub, { color: colors.text.muted }]}>
                Try selecting "All Chains" or clearing your search query.
              </Text>
            </View>
          ) : (
            filteredTokens.map((token, index) => {
              const isLast = index === filteredTokens.length - 1;
              const displayedChange =
                selectedTimeframe === '1h'
                  ? token.change1h
                  : selectedTimeframe === '7h'
                  ? token.change7h
                  : token.change24h;

              const isPositive =
                selectedTimeframe === '1h'
                  ? token.positive1h
                  : selectedTimeframe === '7h'
                  ? token.positive7h
                  : token.positive24h;

              return (
                <TouchableOpacity
                  key={`${token.symbol}-${token.name}-${index}`}
                  onPress={() =>
                    navigation.navigate('TokenDetail', {
                      symbol: token.symbol,
                      name: token.name,
                      price: token.price,
                      change: displayedChange,
                      positive: isPositive,
                      network: token.chain,
                    })
                  }
                  style={[
                    styles.tokenRowItem,
                    !isLast && { borderBottomWidth: 0.5, borderBottomColor: cardBorder },
                  ]}
                  activeOpacity={0.75}
                >
                  {/* Left: Token Logo & Names */}
                  <View style={styles.tokenLeftGroup}>
                    <TokenLogo symbol={token.symbol} size={42} />
                    <View style={styles.tokenTitleColumn}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.tokenSymbolMain, { color: colors.text.primary }]}>{token.symbol}</Text>
                        <View style={[styles.chainTagPill, { backgroundColor: monoMutedSurface }]}>
                          <Text style={[styles.chainTagText, { color: isDark ? '#CCCCCC' : colors.text.muted }]}>{token.chain}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tokenFullName, { color: isDark ? '#CCCCCC' : colors.text.muted }]} numberOfLines={1}>
                        {token.name}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Price & Change Directly Under Price (No mini graph, No swap box) */}
                  <View style={styles.tokenRightGroup}>
                    <Text style={[styles.tokenPriceText, { color: colors.text.primary }]}>{token.price}</Text>

                    <View
                      style={[
                        styles.deltaPill,
                        {
                          backgroundColor: isPositive
                            ? 'rgba(34, 197, 94, 0.16)'
                            : 'rgba(239, 68, 68, 0.16)',
                        },
                      ]}
                    >
                      <Text style={[styles.deltaText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
                        {displayedChange}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  web3BrowserBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesWrap: {
    paddingVertical: 6,
  },
  categoryRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  starFilterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  networkDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  networkDropdownText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  smallFilterText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888888',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  networkOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  networkOptionText: {
    fontSize: 15,
  },
  tokenListContent: {
    paddingHorizontal: 18,
  },
  tokenCardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tokenRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  tokenLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.4,
  },
  tokenTitleColumn: {
    marginLeft: 14,
    flex: 1,
  },
  tokenSymbolMain: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  chainTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chainTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tokenFullName: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  tokenRightGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tokenPriceText: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 4,
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  emptyWrap: {
    padding: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
});
