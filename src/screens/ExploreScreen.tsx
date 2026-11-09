// src/screens/ExploreScreen.tsx - Cura Live Desk: Verified Organization Broadcasts & Zero-Knowledge Q&A

import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, RefreshControl, Modal, Animated, Pressable,
  Share, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors, useIsDark } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Spring Button Component
const SpringButton: React.FC<{
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  activeScale?: number;
}> = ({ onPress, style, children, activeScale = 0.96 }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scale, {
          toValue: activeScale,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
        }).start();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// Vector Glyphs (Monochrome)
const SearchIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const RadioTowerIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </Svg>
);

const EyeIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const LockIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const ShieldCheckIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12l2 2 4-4" />
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

export interface LiveDeskBroadcast {
  id: string;
  orgName: string;
  orgHandle: string;
  orgLogoInitial: string;
  orgCategory: 'Asset Manager' | 'Protocol Foundation' | 'Institutional Custody' | 'DeFi Infrastructure' | 'Layer 1 / Layer 2';
  isVerified: boolean;
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  viewCount: number; // What the organization can see: e.g. 38,450
  inquiries: OrganizationInquiry[];
}

// Initial Verified Organization Broadcasts
const INITIAL_BROADCASTS: LiveDeskBroadcast[] = [
  {
    id: 'broadcast-1',
    orgName: 'BlackRock Digital Assets',
    orgHandle: '@blackrock_digital',
    orgLogoInitial: 'B',
    orgCategory: 'Asset Manager',
    isVerified: true,
    timeAgo: '14m ago',
    title: 'Institutional Tokenized Liquidity Fund (BUIDL) Crosses $520M AUM Milestone',
    content: 'The BlackRock USD Institutional Digital Liquidity Fund (BUIDL) has officially exceeded $520M in verified total assets. Institutional custodians and verified treasuries can now settle tokenized yield directly into institutional vaults with zero redemption slippage.',
    tags: ['$BUIDL', '$USDC', 'TokenizedTreasuries', 'Yield'],
    viewCount: 38450,
    inquiries: [
      {
        id: 'inq-1',
        internalRoutingId: 482915,
        userQuestion: 'Will BUIDL support secondary market atomic swaps on Arbitrum and Solana later this quarter?',
        timestamp: '22m ago',
        isCurrentUser: false,
        officialReply: {
          repliedBy: 'BlackRock Digital Assets Desk',
          replyText: 'Official Response: We are finalizing technical audits for additional EVM layer 2 settlement rails. Formal compliance documentation will be published ahead of Q4 rollout.',
          timestamp: '10m ago',
        },
      },
    ],
  },
  {
    id: 'broadcast-2',
    orgName: 'Solana Foundation',
    orgHandle: '@solana_fndn',
    orgLogoInitial: 'S',
    orgCategory: 'Protocol Foundation',
    isVerified: true,
    timeAgo: '48m ago',
    title: 'Firedancer Validator Testnet Reaches 1,000,000 TPS Benchmark in Controlled Stress Test',
    content: 'Jump Crypto and Solana Foundation engineers confirmed that Firedancer test clusters achieved 1M TPS under synthetic load testing. Mainnet candidate deployment schedule remains on track for gradual validator adoption across high-throughput nodes.',
    tags: ['$SOL', 'Firedancer', 'Throughput', 'Mainnet'],
    viewCount: 29120,
    inquiries: [
      {
        id: 'inq-2',
        internalRoutingId: 783104,
        userQuestion: 'What are the minimum hardware specifications required for independent stakers to run the Firedancer client?',
        timestamp: '1h ago',
        isCurrentUser: false,
        officialReply: {
          repliedBy: 'Solana Foundation Core Engineering',
          replyText: 'Official Response: Hardware requirements mirror current Frankendancer specs (32 physical cores, 128GB RAM). Dedicated documentation will be released next week.',
          timestamp: '35m ago',
        },
      },
    ],
  },
  {
    id: 'broadcast-3',
    orgName: 'Ethereum Foundation',
    orgHandle: '@ethereum_core',
    orgLogoInitial: 'E',
    orgCategory: 'Protocol Foundation',
    isVerified: true,
    timeAgo: '2h ago',
    title: 'Pectra Upgrade Devnet-4 Launch: MaxEB (EIP-7251) and Account Abstraction Inclusions',
    content: 'Ethereum core developers have finalized Devnet-4 specifications for Pectra. Key highlights include raising the effective validator balance from 32 ETH to 2,048 ETH, streamlining staking infrastructure for institutional node operators and liquidity pools.',
    tags: ['$ETH', 'Pectra', 'Staking', 'EIP7251'],
    viewCount: 41200,
    inquiries: [],
  },
  {
    id: 'broadcast-4',
    orgName: 'Circle Financial',
    orgHandle: '@circle_official',
    orgLogoInitial: 'C',
    orgCategory: 'Institutional Custody',
    isVerified: true,
    timeAgo: '3h ago',
    title: 'Cross-Chain Transfer Protocol (CCTP) V2 Integrates Native Solana-Ethereum Bridging',
    content: 'Circle CCTP V2 now processes native 1:1 burn-and-mint USDC transfers across Solana, Ethereum, Base, and Arbitrum with sub-second cryptographic finality. Zero bridge wrapper risk for enterprise liquidity desks.',
    tags: ['$USDC', 'CCTP', 'Interoperability', 'Settlement'],
    viewCount: 19840,
    inquiries: [],
  },
  {
    id: 'broadcast-5',
    orgName: 'Uniswap Labs',
    orgHandle: '@uniswap_labs',
    orgLogoInitial: 'U',
    orgCategory: 'DeFi Infrastructure',
    isVerified: true,
    timeAgo: '5h ago',
    title: 'Uniswap v4 Security Audits Completed With Zero Critical Findings',
    content: 'Custom singleton architecture and dynamic hooks have completed independent formal verification. Flash accounting reduces multi-hop swap gas costs by up to 99% for algorithmic routers and institutional liquidity providers.',
    tags: ['$UNI', 'UniswapV4', 'Hooks', 'FlashAccounting'],
    viewCount: 33700,
    inquiries: [],
  },
];

// Curated Breaking News Wire
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

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const [activeTab, setActiveTab] = useState<'dispatches' | 'news' | 'myInquiries'>('dispatches');
  const [broadcasts, setBroadcasts] = useState<LiveDeskBroadcast[]>(INITIAL_BROADCASTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Ask Question / Q&A Modal State
  const [selectedBroadcast, setSelectedBroadcast] = useState<LiveDeskBroadcast | null>(null);
  const [showQAModal, setShowQAModal] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Organization Request Desk Access Modal State
  const [showOrgRequestModal, setShowOrgRequestModal] = useState(false);
  const [orgNameInput, setOrgNameInput] = useState('');
  const [orgDomainInput, setOrgDomainInput] = useState('');
  const [orgCategoryInput, setOrgCategoryInput] = useState<'Asset Manager' | 'Protocol Foundation' | 'Institutional Custody' | 'DeFi Infrastructure' | 'Layer 1 / Layer 2'>('Protocol Foundation');
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
    setTimeout(() => setShowToast(false), 2600);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate realistic view increments
      setBroadcasts(prev =>
        prev.map(b => ({
          ...b,
          viewCount: b.viewCount + Math.floor(Math.random() * 45) + 5,
        }))
      );
      setRefreshing(false);
    }, 800);
  };

  // Open Q&A Thread on a Broadcast
  const handleOpenQAModal = (broadcast: LiveDeskBroadcast) => {
    setSelectedBroadcast(broadcast);
    setShowQAModal(true);
  };

  // Submit Anonymous User Question
  const handleSubmitQuestion = () => {
    const trimmed = questionInput.trim();
    if (!trimmed || !selectedBroadcast) return;

    setIsSubmittingQuestion(true);

    // Internal Random Number generation (acts internally, NOT shown as an ugly number)
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
      // Add inquiry to broadcast
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

      // Update active modal view
      setSelectedBroadcast(prev => {
        if (!prev) return null;
        return {
          ...prev,
          inquiries: [newInquiry, ...prev.inquiries],
        };
      });

      setQuestionInput('');
      setIsSubmittingQuestion(false);
      triggerToast('Anonymous question submitted. Routed via internal token.');

      // Simulate Organization Official Reply after 1.4s
      setTimeout(() => {
        const officialResponse = {
          repliedBy: `${orgName} Desk`,
          replyText: `Official Response: Thank you for your inquiry. Our research desk has logged this query. Verified updates and technical specifications are monitored by our enclave verifiers.`,
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

        triggerToast(`New official reply received from ${orgName} Desk!`);
      }, 1400);
    }, 400);
  };

  // Submit Organization Broadcast Request
  const handleSubmitOrgRequest = () => {
    if (!orgNameInput.trim() || !orgTitleInput.trim() || !orgContentInput.trim()) {
      triggerToast('Please complete all organization dispatch fields');
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
        tags: ['OfficialDispatch', 'LiveDesk', 'Verified'],
        viewCount: 1,
        inquiries: [],
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setIsSubmittingOrgRequest(false);
      setShowOrgRequestModal(false);

      setOrgNameInput('');
      setOrgDomainInput('');
      setOrgTitleInput('');
      setOrgContentInput('');

      triggerToast('Organization broadcast published to Live Desk!');
    }, 500);
  };

  // Share Broadcast
  const handleShareBroadcast = async (broadcast: LiveDeskBroadcast) => {
    try {
      await Share.share({
        message: `[Cura Live Desk] ${broadcast.orgName}: "${broadcast.title}"\n\n${broadcast.content}\n\nVerified via Cura Wallet Live Desk`,
      });
    } catch {}
  };

  // Filtered Items
  const filteredBroadcasts = broadcasts.filter(b =>
    searchQuery
      ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const filteredNews = NEWS_WIRE.filter(n =>
    searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.source.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // All Inquiries asked by the current user across all broadcasts
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

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.screenTitle, { color: colors.text.primary }]}>Live Desk</Text>
          <View style={[styles.liveDot, { backgroundColor: monoPrimary }]} />
          <View style={[styles.liveBadge, { backgroundColor: monoMutedSurface }]}>
            <RadioTowerIcon color={colors.text.primary} size={11} />
            <Text style={[styles.liveBadgeText, { color: colors.text.primary }]}>24/7 BROADCAST</Text>
          </View>
        </View>

        {/* Organization Broadcast Request Trigger */}
        <TouchableOpacity
          onPress={() => setShowOrgRequestModal(true)}
          style={[styles.orgSubmitBtn, { backgroundColor: monoPrimary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.orgSubmitBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
            + Post Dispatch
          </Text>
        </TouchableOpacity>
      </View>

      {/* Institutional Privacy Guarantee Banner */}
      <View style={styles.guaranteeBannerWrapper}>
        <View style={[styles.guaranteeBanner, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <ShieldCheckIcon color={colors.text.primary} size={16} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.guaranteeTitle, { color: colors.text.primary }]}>
              Zero-Knowledge Organization Broadcasts
            </Text>
            <Text style={styles.guaranteeSubtitle}>
              Organizations broadcast news & only see live view counts. Your profile, wallet balance, and name remain 100% hidden. Inquiries use internal zero-knowledge tokens.
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={15} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search verified dispatches, cashtags ($BTC, $SOL)..."
            placeholderTextColor={colors.text.muted}
            style={[styles.searchInput, { color: colors.text.primary }]}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Segmented Tab Selector */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentTrack, { backgroundColor: monoMutedSurface }]}>
          {(['dispatches', 'news', 'myInquiries'] as const).map(tab => {
            const active = activeTab === tab;
            const label = tab === 'dispatches'
              ? 'Dispatches'
              : tab === 'news'
              ? 'News Wire'
              : `My Inquiries (${userInquiriesList.length})`;

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
        {/* TAB 1: VERIFIED ORGANIZATION DISPATCHES                  */}
        {/* ======================================================== */}
        {activeTab === 'dispatches' && (
          <>
            {filteredBroadcasts.map(broadcast => (
              <View
                key={broadcast.id}
                style={[styles.broadcastCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                {/* Organization Header */}
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

                  {/* Category Pill */}
                  <View style={[styles.categoryBadge, { backgroundColor: monoMutedSurface }]}>
                    <Text style={[styles.categoryBadgeText, { color: colors.text.primary }]}>
                      {broadcast.orgCategory}
                    </Text>
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

                {/* Tags Row */}
                {broadcast.tags && broadcast.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {broadcast.tags.map(tag => (
                      <View key={tag} style={[styles.tagPill, { backgroundColor: monoMutedSurface }]}>
                        <Text style={[styles.tagPillText, { color: colors.text.primary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* What Organization Sees: View Counter & Shield Info */}
                <View style={[styles.orgMetricsBar, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                  <View style={styles.viewsCounterItem}>
                    <EyeIcon color={colors.text.primary} size={14} />
                    <Text style={[styles.viewsCounterText, { color: colors.text.primary }]}>
                      {broadcast.viewCount.toLocaleString()} Live Views
                    </Text>
                  </View>

                  <View style={styles.shieldedNoticeItem}>
                    <LockIcon color={colors.text.muted} size={13} />
                    <Text style={styles.shieldedNoticeText}>
                      User Profiles 100% Shielded
                    </Text>
                  </View>
                </View>

                {/* Interactive Action Bar: Ask Question & Share */}
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

                  <TouchableOpacity
                    onPress={() => handleOpenQAModal(broadcast)}
                    style={[styles.viewInquiriesBtn, { backgroundColor: monoMutedSurface }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.viewInquiriesBtnText, { color: colors.text.primary }]}>
                      Q&A Thread ({broadcast.inquiries.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleShareBroadcast(broadcast)}
                    style={[styles.shareBtnCircle, { backgroundColor: monoMutedSurface }]}
                    activeOpacity={0.7}
                  >
                    <ShareIcon color={colors.text.primary} size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BREAKING NEWS WIRE                                */}
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
        {/* TAB 3: MY INQUIRIES & OFFICIAL REPLIES                   */}
        {/* ======================================================== */}
        {activeTab === 'myInquiries' && (
          <View>
            {userInquiriesList.length === 0 ? (
              <View style={[styles.emptyInquiriesCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={[styles.emptyIconCircle, { backgroundColor: monoMutedSurface }]}>
                  <MessageSquareIcon color={colors.text.primary} size={24} />
                </View>
                <Text style={[styles.emptyInquiriesTitle, { color: colors.text.primary }]}>
                  No Active Inquiries
                </Text>
                <Text style={styles.emptyInquiriesSubtitle}>
                  You haven't asked any questions to verified organizations yet. Tap "Ask Question" on any official dispatch to receive verified responses with complete zero-knowledge anonymity.
                </Text>
              </View>
            ) : (
              userInquiriesList.map(({ broadcast, inquiry }) => (
                <View
                  key={inquiry.id}
                  style={[styles.userInquiryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <View style={styles.inquiryCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.inquiryOrgTitle, { color: colors.text.primary }]}>
                        Inquiry to {broadcast.orgName}
                      </Text>
                    </View>
                    <View style={[styles.privacyProtectedPill, { backgroundColor: monoMutedSurface }]}>
                      <LockIcon color={colors.text.muted} size={11} />
                      <Text style={styles.privacyProtectedText}>Profile Shielded</Text>
                    </View>
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
                        ⏳ Awaiting official response from {broadcast.orgName} desk...
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
      {/* MODAL 1: ASK QUESTION & Q&A THREAD                       */}
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

            {/* Modal Header */}
            <View style={styles.qaSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.qaSheetTitle, { color: colors.text.primary }]}>
                  {selectedBroadcast?.orgName} Q&A
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

            {/* Zero-Knowledge Inquirer Shield Notice */}
            <View style={[styles.qaShieldNotice, { backgroundColor: monoMutedSurface }]}>
              <ShieldCheckIcon color={colors.text.primary} size={14} />
              <Text style={[styles.qaShieldText, { color: colors.text.primary }]}>
                Zero-Knowledge Privacy: Your profile, name, and wallet address are 100% hidden from {selectedBroadcast?.orgName}. An encrypted internal token routes your question.
              </Text>
            </View>

            {/* Questions Thread */}
            <ScrollView style={{ maxHeight: 240, marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              {selectedBroadcast && selectedBroadcast.inquiries.length === 0 ? (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                    No inquiries submitted yet. Be the first to ask!
                  </Text>
                </View>
              ) : (
                selectedBroadcast?.inquiries.map(inq => (
                  <View key={inq.id} style={[styles.inquiryThreadItem, { borderColor: cardBorder }]}>
                    <View style={styles.inquiryUserHeader}>
                      <Text style={[styles.inquiryUserLabel, { color: colors.text.primary }]}>
                        {inq.isCurrentUser ? 'You (Shielded Inquirer)' : 'Anonymous Inquirer'}
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
                          ⏳ Awaiting official response from desk...
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Ask Question Composer */}
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
                    {isSubmittingQuestion ? 'Routing…' : 'Submit Question'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: ORGANIZATION REQUEST DESK BROADCAST             */}
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
                  Post Organization Dispatch
                </Text>
                <Text style={styles.orgModalSubtitle}>
                  Publish official news to Cura Live Desk. You will see aggregate view counts.
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
              {/* Org Name */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>ORGANIZATION / COMPANY NAME</Text>
                <TextInput
                  value={orgNameInput}
                  onChangeText={setOrgNameInput}
                  placeholder="e.g. StarkWare Industries, Arbitrum Foundation"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.standardTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                />
              </View>

              {/* Org Domain / Email */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>OFFICIAL DOMAIN OR WORK EMAIL</Text>
                <TextInput
                  value={orgDomainInput}
                  onChangeText={setOrgDomainInput}
                  placeholder="e.g. press@starkware.co"
                  placeholderTextColor={colors.text.muted}
                  style={[styles.standardTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
                  autoCapitalize="none"
                />
              </View>

              {/* Category Selector */}
              <View style={styles.inputFieldGroup}>
                <Text style={styles.inputFieldLabel}>ENTITY CLASSIFICATION</Text>
                <View style={styles.categoryChipsRow}>
                  {(['Asset Manager', 'Protocol Foundation', 'Institutional Custody', 'DeFi Infrastructure'] as const).map(cat => {
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
                  placeholder="Official dispatch details, technical metrics, and timeline..."
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
                  {isSubmittingOrgRequest ? 'Submitting & Verifying…' : 'Publish to Live Desk'}
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
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  screenTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  orgSubmitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  orgSubmitBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  guaranteeBannerWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  guaranteeTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  guaranteeSubtitle: {
    color: '#858585',
    fontSize: 10.5,
    lineHeight: 14.5,
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
    paddingVertical: 6,
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
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
    justifyContent: 'space-between',
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
  shieldedNoticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shieldedNoticeText: {
    color: '#858585',
    fontSize: 10.5,
    fontWeight: '600',
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
  privacyProtectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  privacyProtectedText: {
    color: '#858585',
    fontSize: 10,
    fontWeight: '600',
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
  qaShieldNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  qaShieldText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14.5,
    fontWeight: '500',
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
  inquiryTimeText: {
    color: '#858585',
    fontSize: 10.5,
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
    maxWidth: 270,
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
