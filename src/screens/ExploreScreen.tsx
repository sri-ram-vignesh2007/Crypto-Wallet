// src/screens/ExploreScreen.tsx - Cura Community: AI Autonomous Desks & Dispatches

import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, RefreshControl, Modal, Animated, Pressable,
  Share, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';
import { useProfileStore } from '../store/profileStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vector Glyphs (Monochrome)
const SearchIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const EyeIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const MessageSquareIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const ShareIcon = ({ color = '#858585', size = 14 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <Path d="M16 6l-4-4-4 4" />
    <Path d="M12 2v13" />
  </Svg>
);

const VerifiedCheck = ({ color = '#FFFFFF', size = 11 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const CloseIcon = ({ color = '#858585', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

// Data Interfaces
export interface OrganizationInquiry {
  id: string;
  internalRoutingId: number; // Internal random number: acts internally, NOT displayed
  userQuestion: string;
  timestamp: string;
  isCurrentUser: boolean;
  officialReply?: {
    repliedBy: string;
    replyText: string;
    timestamp: string;
  };
}

export type AICategory =
  | 'Business'
  | 'Crypto'
  | 'DeFi'
  | 'Layer 1'
  | 'Layer 2'
  | 'RWA'
  | 'Cross-Chain'
  | 'Security'
  | 'AI Compute'
  | 'Macro';

export interface LiveDeskBroadcast {
  id: string;
  orgName: string;
  orgHandle: string;
  orgLogoInitial: string;
  orgCategory: AICategory;
  isVerified: boolean;
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  viewCount: number;
  inquiries: OrganizationInquiry[];
}

// 10 AI Autonomous Desks (All divisions of the organization)
const INITIAL_BROADCASTS: LiveDeskBroadcast[] = [
  {
    id: 'broadcast-1',
    orgName: 'Enterprise Desk',
    orgHandle: '@enterprise_desk',
    orgLogoInitial: 'E',
    orgCategory: 'Business',
    isVerified: true,
    timeAgo: '12m ago',
    title: 'Fortune 500 Enterprise Treasury Operations Automate Instant On-Chain Payroll',
    content: 'Enterprise Desk has integrated zero-slippage B2B settlements for multinational enterprise treasuries. Autonomous payroll smart vaults now execute multi-currency settlements with sub-cent transaction overhead and continuous cryptographic audit logs.',
    tags: ['$USDC', 'Enterprise', 'Payroll', 'Treasury'],
    viewCount: 46210,
    inquiries: [],
  },
  {
    id: 'broadcast-2',
    orgName: 'Crypto & Bitcoin Desk',
    orgHandle: '@crypto_desk',
    orgLogoInitial: 'B',
    orgCategory: 'Crypto',
    isVerified: true,
    timeAgo: '35m ago',
    title: 'Bitcoin Institutional Accumulation Accelerates: Weekly Net Inflows Cross $1.8B',
    content: 'Sovereign Desk models indicate aggressive institutional custody accumulation above $68,000. Mining hash rate difficulty reached new all-time highs as sovereign allocation desks expand multi-year reserves.',
    tags: ['$BTC', 'Bitcoin', 'Macro', 'Reserves'],
    viewCount: 52180,
    inquiries: [],
  },
  {
    id: 'broadcast-3',
    orgName: 'DeFi Engine Desk',
    orgHandle: '@defi_desk',
    orgLogoInitial: 'D',
    orgCategory: 'DeFi',
    isVerified: true,
    timeAgo: '50m ago',
    title: 'Automated Concentrated Liquidity Rebalancing Captures 42% Fee Compression',
    content: 'DeFi Engine telemetry reports record liquidity efficiency across top AMM pools. Dynamic rebalancing algorithms minimized impermanent loss for high-volume trading pairs during volatility spikes.',
    tags: ['$ETH', 'DeFi', 'Liquidity', 'Yield'],
    viewCount: 38450,
    inquiries: [],
  },
  {
    id: 'broadcast-4',
    orgName: 'Layer 1 Systems Desk',
    orgHandle: '@l1_systems',
    orgLogoInitial: 'S',
    orgCategory: 'Layer 1',
    isVerified: true,
    timeAgo: '1h ago',
    title: 'Parallel Consensus & High-Throughput Benchmarks Clock 1,000,000 TPS',
    content: 'Firedancer and parallel execution testnets completed synthetic stress workloads with sub-200ms deterministic finality. Network telemetry indicates smooth validator state synchronization.',
    tags: ['$SOL', 'Firedancer', 'ParallelExecution', 'Throughput'],
    viewCount: 34120,
    inquiries: [],
  },
  {
    id: 'broadcast-5',
    orgName: 'Rollup & Scaling Desk',
    orgHandle: '@rollup_desk',
    orgLogoInitial: 'R',
    orgCategory: 'Layer 2',
    isVerified: true,
    timeAgo: '2h ago',
    title: 'Ethereum Layer 2 Aggregate Throughput Breaks 380 TPS Post-Blob Optimizations',
    content: 'Arbitrum and Base processed over 78% of rollup transaction volume today. Blob compression keeps median transfer fees under $0.001, making institutional micropayment channels commercially viable.',
    tags: ['$ETH', '$ARB', 'Base', 'Rollup'],
    viewCount: 29840,
    inquiries: [],
  },
  {
    id: 'broadcast-6',
    orgName: 'Tokenized Assets Desk',
    orgHandle: '@rwa_desk',
    orgLogoInitial: 'T',
    orgCategory: 'RWA',
    isVerified: true,
    timeAgo: '2h ago',
    title: 'Tokenized US Treasuries Surpass $2.4B in Verified On-Chain Holdings',
    content: 'Institutional tokenized treasury vaults now generate 4.8% APR with atomic liquidity redemption. Qualified institutional participants settle yield directly into multi-chain custody enclaves.',
    tags: ['$BUIDL', '$USDC', 'RWA', 'Treasuries'],
    viewCount: 41200,
    inquiries: [],
  },
  {
    id: 'broadcast-7',
    orgName: 'Interoperability Desk',
    orgHandle: '@crosschain_desk',
    orgLogoInitial: 'C',
    orgCategory: 'Cross-Chain',
    isVerified: true,
    timeAgo: '3h ago',
    title: 'Native Cross-Chain Mint-and-Burn Bridges Process $5.2B in Weekly Volume',
    content: 'CCTP V2 and atomic bridge protocols achieve unified liquidity across Solana and EVM rollups with zero wrapped asset exposure and sub-second cryptographic finality.',
    tags: ['$USDC', 'CCTP', 'CrossChain', 'Settlement'],
    viewCount: 25490,
    inquiries: [],
  },
  {
    id: 'broadcast-8',
    orgName: 'Security & Enclave Desk',
    orgHandle: '@security_desk',
    orgLogoInitial: 'K',
    orgCategory: 'Security',
    isVerified: true,
    timeAgo: '4h ago',
    title: 'Automated Formal Verification Confirms Zero Vulnerabilities Across Verified Vaults',
    content: 'Automated symbolic execution engines verified 140+ protocol smart contracts this week. MEV shielding successfully protected institutional swaps from sandwich attacks.',
    tags: ['Security', 'Audits', 'MEVShield', 'Enclaves'],
    viewCount: 21900,
    inquiries: [],
  },
  {
    id: 'broadcast-9',
    orgName: 'Agentic Compute Desk',
    orgHandle: '@compute_desk',
    orgLogoInitial: 'A',
    orgCategory: 'AI Compute',
    isVerified: true,
    timeAgo: '5h ago',
    title: 'Autonomous On-Chain Agent Swarms Execute 150,000 Micro-Settlements Daily',
    content: 'Autonomous AI agents are executing decentralized compute inference and data marketplace payments on-chain with zero human intervention and instant cryptographic validation.',
    tags: ['AIAgents', 'Compute', 'DePIN', 'Autonomy'],
    viewCount: 31250,
    inquiries: [],
  },
  {
    id: 'broadcast-10',
    orgName: 'Macro & Policy Desk',
    orgHandle: '@macro_desk',
    orgLogoInitial: 'M',
    orgCategory: 'Macro',
    isVerified: true,
    timeAgo: '6h ago',
    title: 'Global Central Bank Rate Easing Cycle Accelerates Digital Asset Liquidity Expansion',
    content: 'Global M2 liquidity metrics indicate rapid capital rotation into institutional digital asset balance sheets as central banks transition to rate easing regimes.',
    tags: ['Macro', 'M2Liquidity', 'CentralBanks', 'Policy'],
    viewCount: 36780,
    inquiries: [],
  },
];

// Curated News Wire
const NEWS_WIRE = [
  {
    id: 'news-1',
    source: 'Bloomberg Crypto',
    timeAgo: '12m ago',
    title: 'Spot Bitcoin ETFs Cross $1.4B In Weekly Net Inflows As Family Offices Enter',
    summary: 'Institutional wealth managers and multi-family offices expanded their digital asset holdings to 3.2% average allocation, citing inflation hedging.',
    category: 'Institutional Market',
    readTime: '3 min read',
  },
  {
    id: 'news-2',
    source: 'CoinDesk',
    timeAgo: '38m ago',
    title: 'Ethereum Pectra Upgrade Devnet Milestone Finalized With Validator EIPs',
    summary: 'Core developers confirmed inclusion of EOF and increased validator balance caps up to 2,048 ETH, streamlining staking node operations.',
    category: 'Protocol Tech',
    readTime: '4 min read',
  },
  {
    id: 'news-3',
    source: 'The Block',
    timeAgo: '1h ago',
    title: 'Cross-Chain Settlement Volume Hits All-Time High Across Top 5 L2 Rollups',
    summary: 'Fast finality bridges and atomic swap protocols processed over $4.2B in volume over the past 7 days with sub-cent transaction costs.',
    category: 'Layer 2 / DeFi',
    readTime: '2 min read',
  },
  {
    id: 'news-4',
    source: 'Reuters Fintech',
    timeAgo: '2h ago',
    title: 'Major Custody Providers Report Zero Security Incidents Under Enclave Verification',
    summary: 'Hardware-secured key generation and multi-party computation protocols demonstrate institutional resilience amid record transaction volumes.',
    category: 'Security & Custody',
    readTime: '5 min read',
  },
];

const AI_CATEGORIES = [
  'All',
  'Business',
  'Crypto',
  'DeFi',
  'Layer 1',
  'Layer 2',
  'RWA',
  'Cross-Chain',
  'Security',
  'AI Compute',
  'Macro',
] as const;

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const { username, setUsername, name, setName } = useProfileStore();

  const [activeTab, setActiveTab] = useState<'dispatches' | 'news' | 'myInquiries'>('dispatches');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [broadcasts, setBroadcasts] = useState<LiveDeskBroadcast[]>(INITIAL_BROADCASTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Username Creation Modal State
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newDisplayNameInput, setNewDisplayNameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Ask Question / Q&A Modal State (Shows ONLY the current user's questions and replies)
  const [selectedBroadcast, setSelectedBroadcast] = useState<LiveDeskBroadcast | null>(null);
  const [showQAModal, setShowQAModal] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Post Dispatch Modal State (Requires Username first)
  const [showOrgRequestModal, setShowOrgRequestModal] = useState(false);
  const [orgNameInput, setOrgNameInput] = useState('');
  const [orgCategoryInput, setOrgCategoryInput] = useState<AICategory>('Business');
  const [orgTitleInput, setOrgTitleInput] = useState('');
  const [orgContentInput, setOrgContentInput] = useState('');
  const [isSubmittingOrgRequest, setIsSubmittingOrgRequest] = useState(false);

  // Floating Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Colors
  const cardBg = isDark ? '#171717' : '#FFFFFF';
  const cardBorder = isDark ? '#303030' : '#E5E5E5';
  const monoPrimary = isDark ? '#FFFFFF' : '#111111';
  const monoMutedSurface = isDark ? '#202020' : '#F2F2F2';

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setBroadcasts(prev =>
        prev.map(b => ({
          ...b,
          viewCount: b.viewCount + Math.floor(Math.random() * 30) + 5,
        }))
      );
      setRefreshing(false);
    }, 800);
  };

  // Open Post Dispatch
  const handleOpenPostDispatch = () => {
    setShowOrgRequestModal(true);
  };

  // Save Username
  const handleSaveUsername = () => {
    const clean = newUsernameInput.trim().replace(/^@/, '');
    if (!clean || clean.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
      return;
    }
    setUsername(clean);
    if (newDisplayNameInput.trim()) {
      setName(newDisplayNameInput.trim());
    }
    setShowUsernameModal(false);
    triggerToast(`Username @${clean} created! Opening dispatch editor...`);
    setTimeout(() => setShowOrgRequestModal(true), 300);
  };

  // Open Q&A Thread on a Broadcast
  const handleOpenQAModal = (broadcast: LiveDeskBroadcast) => {
    setSelectedBroadcast(broadcast);
    setShowQAModal(true);
  };

  // Submit User Question (Only visible to current user)
  const handleSubmitQuestion = () => {
    const trimmed = questionInput.trim();
    if (!trimmed || !selectedBroadcast) return;

    setIsSubmittingQuestion(true);

    // Internal Random Number generation (acts internally, NOT shown)
    const internalNumber = Math.floor(100000 + Math.random() * 900000);

    const newInquiry: OrganizationInquiry = {
      id: `inq-user-${Date.now()}`,
      internalRoutingId: internalNumber,
      userQuestion: trimmed,
      timestamp: 'Just now',
      isCurrentUser: true,
    };

    const targetBroadcastId = selectedBroadcast.id;
    const orgName = selectedBroadcast.orgName;

    setTimeout(() => {
      setBroadcasts(prev =>
        prev.map(b => {
          if (b.id === targetBroadcastId) {
            return {
              ...b,
              inquiries: [newInquiry, ...b.inquiries],
            };
          }
          return b;
        })
      );

      setSelectedBroadcast(prev => {
        if (!prev) return null;
        return {
          ...prev,
          inquiries: [newInquiry, ...prev.inquiries],
        };
      });

      setQuestionInput('');
      setIsSubmittingQuestion(false);
      triggerToast('Question submitted to AI Desk');

      // AI Desk official response after 1.2s
      setTimeout(() => {
        const officialResponse = {
          repliedBy: `${orgName} AI`,
          replyText: `Autonomous AI Response: Thank you for your question. Our autonomous intelligence models have processed this item. Verified telemetry and updates have been verified.`,
          timestamp: 'Just now',
        };

        setBroadcasts(currentBroadcasts =>
          currentBroadcasts.map(b => {
            if (b.id === targetBroadcastId) {
              return {
                ...b,
                inquiries: b.inquiries.map(inq => {
                  if (inq.id === newInquiry.id) {
                    return { ...inq, officialReply: officialResponse };
                  }
                  return inq;
                }),
              };
            }
            return b;
          })
        );

        setSelectedBroadcast(curr => {
          if (!curr) return null;
          return {
            ...curr,
            inquiries: curr.inquiries.map(inq => {
              if (inq.id === newInquiry.id) {
                return { ...inq, officialReply: officialResponse };
              }
              return inq;
            }),
          };
        });

        triggerToast(`Response received from ${orgName}!`);
      }, 1200);
    }, 400);
  };

  // Submit User / Org Dispatch
  const handleSubmitOrgRequest = () => {
    if (!orgNameInput.trim() || !orgTitleInput.trim() || !orgContentInput.trim()) {
      triggerToast('Please complete all dispatch fields');
      return;
    }

    setIsSubmittingOrgRequest(true);

    setTimeout(() => {
      const newBroadcast: LiveDeskBroadcast = {
        id: `broadcast-org-${Date.now()}`,
        orgName: orgNameInput.trim(),
        orgHandle: `@${orgNameInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        orgLogoInitial: orgNameInput.trim().charAt(0).toUpperCase(),
        orgCategory: orgCategoryInput,
        isVerified: true,
        timeAgo: 'Just now',
        title: orgTitleInput.trim(),
        content: orgContentInput.trim(),
        tags: ['CommunityDispatch', 'Verified', orgCategoryInput],
        viewCount: 1,
        inquiries: [],
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setIsSubmittingOrgRequest(false);
      setShowOrgRequestModal(false);

      setOrgNameInput('');
      setOrgTitleInput('');
      setOrgContentInput('');

      triggerToast('Dispatch published to Community feed!');
    }, 450);
  };

  // Share Broadcast
  const handleShareBroadcast = async (broadcast: LiveDeskBroadcast) => {
    try {
      await Share.share({
        message: `[Cura Community] ${broadcast.orgName}: "${broadcast.title}"\n\n${broadcast.content}\n\nShared via Cura Wallet`,
      });
    } catch {}
  };

  // Filtered Broadcasts by Search & Category
  const filteredBroadcasts = broadcasts.filter(b => {
    const matchesSearch = searchQuery
      ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesCategory = selectedCategory === 'All' ? true : b.orgCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredNews = NEWS_WIRE.filter(n =>
    searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.source.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Inquiries for the current user ONLY
  const userInquiriesList: {
    broadcast: LiveDeskBroadcast;
    inquiry: OrganizationInquiry;
  }[] = [];

  broadcasts.forEach(b => {
    b.inquiries.forEach(inq => {
      if (inq.isCurrentUser) {
        userInquiriesList.push({ broadcast: b, inquiry: inq });
      }
    });
  });

  // Current user's inquiries in the active selected broadcast modal
  const activeUserInquiries = selectedBroadcast
    ? selectedBroadcast.inquiries.filter(i => i.isCurrentUser)
    : [];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Floating Toast Notification */}
      {showToast && (
        <View style={styles.toastContainer}>
          <View style={[styles.toastPill, { backgroundColor: monoPrimary }]}>
            <Text style={[styles.toastText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {toastMessage}
            </Text>
          </View>
        </View>
      )}

      {/* Top Header Bar (Clean: "Community" title with "+ Post Dispatch" button on the right) */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.screenTitle, { color: colors.text.primary }]}>Community</Text>

        <TouchableOpacity
          onPress={handleOpenPostDispatch}
          style={[styles.orgSubmitBtn, { backgroundColor: monoPrimary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.orgSubmitBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
            + Post Dispatch
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={15} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dispatches, cashtags ($BTC, $SOL)..."
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Main Tabs (Dispatches, News Wire, My Inquiries) */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentTrack, { backgroundColor: monoMutedSurface }]}>
          {(['dispatches', 'news', 'myInquiries'] as const).map(tab => {
            const active = activeTab === tab;
            const label = tab === 'dispatches'
              ? 'Dispatches'
              : tab === 'news'
              ? 'News Wire'
              : `My Questions (${userInquiriesList.length})`;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.segmentButton,
                  active && { backgroundColor: monoPrimary },
                ]}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.segmentButtonText,
                  active
                    ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                    : { color: colors.text.muted },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 10 AI Category Filters (When Dispatches tab is active) */}
      {activeTab === 'dispatches' && (
        <View style={styles.categoryFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFiltersScroll}>
            {AI_CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryFilterChip,
                    { backgroundColor: active ? monoPrimary : monoMutedSurface },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryFilterChipText,
                    active
                      ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '800' }
                      : { color: colors.text.primary },
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={monoPrimary}
          />
        }
      >
        {/* ======================================================== */}
        {/* TAB 1: CURA AI DISPATCHES                                */}
        {/* ======================================================== */}
        {activeTab === 'dispatches' && (
          <>
            {filteredBroadcasts.map(broadcast => {
              const myInquiriesCount = broadcast.inquiries.filter(i => i.isCurrentUser).length;

              return (
                <View
                  key={broadcast.id}
                  style={[styles.broadcastCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  {/* Header: Org Avatar, Name, Handle, Time (No category badge) */}
                  <View style={styles.broadcastHeader}>
                    <View style={styles.orgInfoRow}>
                      <View style={[styles.orgAvatarCircle, { backgroundColor: monoPrimary }]}>
                        <Text style={[styles.orgAvatarText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                          {broadcast.orgLogoInitial}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Text style={[styles.orgNameText, { color: colors.text.primary }]}>
                            {broadcast.orgName}
                          </Text>
                          {broadcast.isVerified && (
                            <View style={[styles.verifiedBadge, { backgroundColor: monoPrimary }]}>
                              <VerifiedCheck color={isDark ? '#000000' : '#FFFFFF'} size={9} />
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Text style={styles.orgHandleText}>{broadcast.orgHandle}</Text>
                          <Text style={styles.dotDivider}>•</Text>
                          <Text style={styles.timeAgoText}>{broadcast.timeAgo}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Broadcast Title */}
                  <Text style={[styles.broadcastTitle, { color: colors.text.primary }]}>
                    {broadcast.title}
                  </Text>

                  {/* Broadcast Content Body */}
                  <Text style={[styles.broadcastBody, { color: colors.text.primary }]}>
                    {broadcast.content}
                  </Text>

                  {/* Tags */}
                  {broadcast.tags && broadcast.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {broadcast.tags.map(tag => (
                        <View key={tag} style={[styles.tagPill, { backgroundColor: monoMutedSurface }]}>
                          <Text style={[styles.tagPillText, { color: colors.text.primary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* ONLY Views Bar (No public protected, no shielded badges) */}
                  <View style={[styles.orgMetricsBar, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                    <View style={styles.viewsCounterItem}>
                      <EyeIcon color={colors.text.primary} size={14} />
                      <Text style={[styles.viewsCounterText, { color: colors.text.primary }]}>
                        {broadcast.viewCount.toLocaleString()} Views
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row: Ask Question & Share */}
                  <View style={[styles.broadcastActionsRow, { borderTopColor: cardBorder }]}>
                    <TouchableOpacity
                      onPress={() => handleOpenQAModal(broadcast)}
                      style={[styles.askQuestionBtn, { backgroundColor: monoPrimary }]}
                      activeOpacity={0.8}
                    >
                      <MessageSquareIcon color={isDark ? '#000000' : '#FFFFFF'} size={14} />
                      <Text style={[styles.askQuestionBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                        Ask Question
                      </Text>
                    </TouchableOpacity>

                    {myInquiriesCount > 0 && (
                      <TouchableOpacity
                        onPress={() => handleOpenQAModal(broadcast)}
                        style={[styles.viewInquiriesBtn, { backgroundColor: monoMutedSurface }]}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.viewInquiriesBtnText, { color: colors.text.primary }]}>
                          My Replies ({myInquiriesCount})
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleShareBroadcast(broadcast)}
                      style={[styles.shareBtnCircle, { backgroundColor: monoMutedSurface }]}
                      activeOpacity={0.7}
                    >
                      <ShareIcon color={colors.text.primary} size={14} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: NEWS WIRE                                         */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <View style={styles.newsStream}>
            {filteredNews.map(item => (
              <View
                key={item.id}
                style={[styles.newsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                <View style={styles.newsHeader}>
                  <View style={[styles.newsSourceTag, { backgroundColor: monoMutedSurface }]}>
                    <Text style={[styles.newsSourceText, { color: colors.text.primary }]}>
                      {item.source}
                    </Text>
                  </View>
                  <Text style={styles.newsTimeText}>{item.timeAgo}</Text>
                </View>

                <Text style={[styles.newsTitle, { color: colors.text.primary }]}>
                  {item.title}
                </Text>

                <Text style={[styles.newsSummary, { color: colors.text.muted }]}>
                  {item.summary}
                </Text>

                <View style={[styles.newsFooter, { borderTopColor: cardBorder }]}>
                  <Text style={[styles.newsCategoryText, { color: colors.text.secondary }]}>
                    {item.category}
                  </Text>
                  <Text style={styles.newsReadTimeText}>{item.readTime}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY QUESTIONS (Only Current User's Questions)      */}
        {/* ======================================================== */}
        {activeTab === 'myInquiries' && (
          <View>
            {userInquiriesList.length === 0 ? (
              <View style={[styles.emptyInquiriesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={[styles.emptyIconCircle, { backgroundColor: monoMutedSurface }]}>
                  <MessageSquareIcon color={colors.text.primary} size={24} />
                </View>
                <Text style={[styles.emptyInquiriesTitle, { color: colors.text.primary }]}>
                  No Questions Asked Yet
                </Text>
                <Text style={styles.emptyInquiriesSubtitle}>
                  You haven't submitted any questions yet. Tap "Ask Question" on any AI dispatch to receive an instant verified response.
                </Text>
              </View>
            ) : (
              userInquiriesList.map(({ broadcast, inquiry }) => (
                <View
                  key={inquiry.id}
                  style={[styles.userInquiryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <View style={styles.inquiryCardHeader}>
                    <Text style={[styles.inquiryOrgTitle, { color: colors.text.primary }]}>
                      Question to {broadcast.orgName}
                    </Text>
                    <Text style={styles.inquiryTimeText}>{inquiry.timestamp}</Text>
                  </View>

                  <Text style={[styles.inquiryQuestionText, { color: colors.text.primary }]}>
                    "{inquiry.userQuestion}"
                  </Text>

                  {inquiry.officialReply ? (
                    <View style={[styles.officialReplyBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <VerifiedCheck color={colors.text.primary} size={11} />
                        <Text style={[styles.officialReplyAuthor, { color: colors.text.primary }]}>
                          {inquiry.officialReply.repliedBy}
                        </Text>
                        <Text style={styles.replyTimeText}>• {inquiry.officialReply.timestamp}</Text>
                      </View>
                      <Text style={[styles.officialReplyBody, { color: colors.text.primary }]}>
                        {inquiry.officialReply.replyText}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.awaitingReplyBox, { backgroundColor: monoMutedSurface }]}>
                      <Text style={styles.awaitingReplyText}>
                        ⏳ Generating response from {broadcast.orgName}...
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: ASK QUESTION (Shows ONLY User's Own Questions)  */}
      {/* ======================================================== */}
      <Modal
        visible={showQAModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQAModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismissArea} onPress={() => setShowQAModal(false)} />
          <View style={[styles.qaSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.qaSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.qaSheetTitle, { color: colors.text.primary }]}>
                  {selectedBroadcast?.orgName}
                </Text>
                <Text style={styles.qaSheetSub} numberOfLines={1}>
                  {selectedBroadcast?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQAModal(false)}
                style={[styles.closeCircle, { backgroundColor: monoMutedSurface }]}
              >
                <CloseIcon color={colors.text.primary} size={15} />
              </TouchableOpacity>
            </View>

            {/* ONLY current user's questions shown; other users' questions are hidden */}
            <ScrollView style={{ maxHeight: 240, marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              {activeUserInquiries.length === 0 ? (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                    Ask a question below to receive an official answer.
                  </Text>
                </View>
              ) : (
                activeUserInquiries.map(inq => (
                  <View key={inq.id} style={[styles.inquiryThreadItem, { borderColor: cardBorder }]}>
                    <View style={styles.inquiryUserHeader}>
                      <Text style={[styles.inquiryUserLabel, { color: colors.text.primary }]}>
                        Your Question
                      </Text>
                      <Text style={styles.inquiryTimeText}>{inq.timestamp}</Text>
                    </View>

                    <Text style={[styles.inquiryQuestionBody, { color: colors.text.primary }]}>
                      {inq.userQuestion}
                    </Text>

                    {inq.officialReply ? (
                      <View style={[styles.inquiryReplyCard, { backgroundColor: monoMutedSurface }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                          <VerifiedCheck color={colors.text.primary} size={10} />
                          <Text style={[styles.inquiryReplierText, { color: colors.text.primary }]}>
                            {inq.officialReply.repliedBy}
                          </Text>
                          <Text style={styles.replyTimeText}>• {inq.officialReply.timestamp}</Text>
                        </View>
                        <Text style={[styles.inquiryReplyBody, { color: colors.text.primary }]}>
                          {inq.officialReply.replyText}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ marginTop: 6 }}>
                        <Text style={{ color: colors.text.muted, fontSize: 11, fontStyle: 'italic' }}>
                          ⏳ Generating response...
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Question Input */}
            <View style={[styles.qaComposerWrapper, { borderTopColor: cardBorder }]}>
              <TextInput
                value={questionInput}
                onChangeText={setQuestionInput}
                placeholder={`Ask ${selectedBroadcast?.orgName} a question...`}
                placeholderTextColor={colors.text.muted}
                style={[styles.qaComposerInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                multiline
                maxLength={300}
              />

              <View style={styles.qaComposerActions}>
                <Text style={styles.charCountText}>
                  {questionInput.length}/300
                </Text>

                <TouchableOpacity
                  onPress={handleSubmitQuestion}
                  disabled={isSubmittingQuestion || !questionInput.trim()}
                  style={[
                    styles.submitQuestionBtn,
                    { backgroundColor: monoPrimary },
                    !questionInput.trim() && { opacity: 0.4 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.submitQuestionBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    {isSubmittingQuestion ? 'Submitting…' : 'Submit Question'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: USERNAME CREATION (Required before posting)     */}
      {/* ======================================================== */}
      <Modal
        visible={showUsernameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismissArea} onPress={() => setShowUsernameModal(false)} />
          <View style={[styles.usernameModalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.usernameModalTitle, { color: colors.text.primary }]}>
              Create Username
            </Text>
            <Text style={styles.usernameModalSubtitle}>
              You must set a unique username before publishing a dispatch to the Community feed.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>USERNAME</Text>
              <View style={[styles.usernameInputBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                <Text style={[styles.atSymbol, { color: colors.text.muted }]}>@</Text>
                <TextInput
                  value={newUsernameInput}
                  onChangeText={(t) => {
                    setNewUsernameInput(t.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''));
                    setUsernameError('');
                  }}
                  placeholder="your_handle"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.usernameTextInput, { color: colors.text.primary }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  autoFocus
                />
              </View>
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>DISPLAY NAME (OPTIONAL)</Text>
              <TextInput
                value={newDisplayNameInput}
                onChangeText={setNewDisplayNameInput}
                placeholder="e.g. Satoshi Rivera"
                placeholderTextColor={colors.text.muted}
                style={[styles.displayNameTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                maxLength={30}
              />
            </View>

            <View style={styles.usernameModalBtnRow}>
              <TouchableOpacity
                onPress={() => setShowUsernameModal(false)}
                style={[styles.cancelModalBtn, { backgroundColor: monoMutedSurface }]}
              >
                <Text style={[styles.cancelModalBtnText, { color: colors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveUsername}
                style={[styles.confirmUsernameBtn, { backgroundColor: monoPrimary }]}
              >
                <Text style={[styles.confirmUsernameBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  Save & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: POST DISPATCH (Only accessible after username)  */}
      {/* ======================================================== */}
      <Modal
        visible={showOrgRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrgRequestModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismissArea} onPress={() => setShowOrgRequestModal(false)} />
          <View style={[styles.orgModalSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.orgModalHeader}>
              <View>
                <Text style={[styles.orgModalTitle, { color: colors.text.primary }]}>
                  Post Dispatch
                </Text>
                <Text style={styles.orgModalSubtitle}>
                  Publish verified live updates to Community feed
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowOrgRequestModal(false)}
                style={[styles.closeCircle, { backgroundColor: monoMutedSurface }]}
              >
                <CloseIcon color={colors.text.primary} size={15} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Quick Select Desk Preset */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>SELECT DESK / ORGANIZATION PRESET</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                  {[
                    'Enterprise Desk',
                    'Crypto & Bitcoin Desk',
                    'DeFi Engine Desk',
                    'Layer 1 Systems Desk',
                    'Rollup & Scaling Desk',
                    'Tokenized Assets Desk',
                    'Security & Enclave Desk',
                    'Agentic Compute Desk',
                  ].map(desk => (
                    <TouchableOpacity
                      key={desk}
                      onPress={() => setOrgNameInput(desk)}
                      style={[
                        styles.catChip,
                        { backgroundColor: orgNameInput === desk ? monoPrimary : monoMutedSurface, marginRight: 6 },
                      ]}
                    >
                      <Text style={[
                        styles.catChipText,
                        orgNameInput === desk
                          ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                          : { color: colors.text.secondary },
                      ]}>
                        {desk}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Dispatch Category */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>CATEGORY</Text>
                <View style={styles.categoryChipsRow}>
                  {(['Business', 'Crypto', 'DeFi', 'Layer 1', 'Layer 2', 'RWA', 'Cross-Chain', 'Security'] as const).map(cat => {
                    const active = orgCategoryInput === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setOrgCategoryInput(cat)}
                        style={[
                          styles.catChip,
                          { backgroundColor: active ? monoPrimary : monoMutedSurface },
                        ]}
                      >
                        <Text style={[
                          styles.catChipText,
                          active
                            ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                            : { color: colors.text.primary },
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Publisher Name */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>PUBLISHER / ORGANIZATION NAME</Text>
                <TextInput
                  value={orgNameInput}
                  onChangeText={setOrgNameInput}
                  placeholder="e.g. StarkWare Industries or Your Team"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.standardTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                />
              </View>

              {/* Headline */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>DISPATCH HEADLINE</Text>
                <TextInput
                  value={orgTitleInput}
                  onChangeText={setOrgTitleInput}
                  placeholder="e.g. Mainnet Prover Upgrade Deployed"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.standardTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                />
              </View>

              {/* Body */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>ANNOUNCEMENT BODY</Text>
                <TextInput
                  value={orgContentInput}
                  onChangeText={setOrgContentInput}
                  placeholder="Dispatch details, technical metrics, and timeline..."
                  placeholderTextColor={colors.text.muted}
                  style={[
                    styles.standardTextInput,
                    { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder, minHeight: 90, textAlignVertical: 'top' },
                  ]}
                  multiline
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmitOrgRequest}
                disabled={isSubmittingOrgRequest}
                style={[styles.confirmPublishBtn, { backgroundColor: monoPrimary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmPublishBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  {isSubmittingOrgRequest ? 'Publishing…' : 'Publish Dispatch'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  orgSubmitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  orgSubmitBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.5,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    paddingVertical: 0,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    gap: 2,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 11,
  },
  segmentButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  categoryFiltersContainer: {
    paddingVertical: 6,
  },
  categoryFiltersScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // BROADCAST CARDS
  broadcastCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 14,
  },
  broadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orgInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  orgNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgHandleText: {
    color: '#858585',
    fontSize: 11,
  },
  dotDivider: {
    color: '#858585',
    fontSize: 11,
  },
  timeAgoText: {
    color: '#858585',
    fontSize: 11,
  },
  broadcastTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 8,
  },
  broadcastBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  orgMetricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 12,
  },
  viewsCounterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsCounterText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  broadcastActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingTop: 12,
    gap: 8,
  },
  askQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  askQuestionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewInquiriesBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  viewInquiriesBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareBtnCircle: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // NEWS WIRE
  newsStream: {
    gap: 12,
  },
  newsCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsSourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newsSourceText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  newsTimeText: {
    color: '#858585',
    fontSize: 11,
  },
  newsTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingTop: 10,
  },
  newsCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  newsReadTimeText: {
    color: '#858585',
    fontSize: 11,
  },
  // MY INQUIRIES
  emptyInquiriesCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyInquiriesTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyInquiriesSubtitle: {
    color: '#858585',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 290,
  },
  userInquiryCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 12,
  },
  inquiryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inquiryOrgTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  inquiryTimeText: {
    color: '#858585',
    fontSize: 11,
  },
  inquiryQuestionText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  officialReplyBox: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 12,
  },
  officialReplyAuthor: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  replyTimeText: {
    color: '#858585',
    fontSize: 10.5,
  },
  officialReplyBody: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  awaitingReplyBox: {
    padding: 10,
    borderRadius: 10,
  },
  awaitingReplyText: {
    color: '#858585',
    fontSize: 11.5,
    fontStyle: 'italic',
  },
  // MODALS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#858585',
    opacity: 0.4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // QA SHEET
  qaSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  qaSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qaSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  qaSheetSub: {
    color: '#858585',
    fontSize: 11.5,
    marginTop: 2,
  },
  inquiryThreadItem: {
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  inquiryUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inquiryUserLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  inquiryQuestionBody: {
    fontSize: 12.5,
    lineHeight: 17,
    marginBottom: 8,
  },
  inquiryReplyCard: {
    borderRadius: 10,
    padding: 10,
  },
  inquiryReplierText: {
    fontSize: 11,
    fontWeight: '800',
  },
  inquiryReplyBody: {
    fontSize: 12,
    lineHeight: 16.5,
  },
  qaComposerWrapper: {
    borderTopWidth: 0.5,
    paddingTop: 10,
  },
  qaComposerInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  qaComposerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCountText: {
    color: '#858585',
    fontSize: 11,
  },
  submitQuestionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  submitQuestionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  // USERNAME MODAL
  usernameModalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 0.5,
    padding: 20,
    paddingBottom: 36,
  },
  usernameModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  usernameModalSubtitle: {
    color: '#858585',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#858585',
    marginBottom: 6,
  },
  usernameInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    height: 44,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  usernameTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  displayNameTextInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  usernameModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmUsernameBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmUsernameBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // ORG REQUEST MODAL
  orgModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: '90%',
  },
  orgModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orgModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  orgModalSubtitle: {
    color: '#858585',
    fontSize: 11.5,
    marginTop: 2,
  },
  inputFieldGroup: {
    marginBottom: 12,
  },
  inputFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#858585',
    marginBottom: 6,
  },
  standardTextInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
  },
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  confirmPublishBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmPublishBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
