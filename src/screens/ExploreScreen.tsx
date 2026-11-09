// src/screens/ExploreScreen.tsx - Cura Community, Breaking News, Profiles & Privacy-Controlled Messaging

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

const HeartIcon = ({ filled = false, color = '#858585', size = 16 }: { filled?: boolean; color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const CommentIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

const RepostIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 1l4 4-4 4" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Path d="M7 23l-4-4 4-4" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

const ShareIcon = ({ color = '#858585', size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <Path d="M16 6l-4-4-4 4" />
    <Path d="M12 2v13" />
  </Svg>
);

const VerifiedCheck = ({ color = '#FFFFFF', size = 12 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

const LockIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const MessageSquareIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

const ShieldCheckIcon = ({ color = '#858585', size = 16 }: { color?: string; size?: number }) => (
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

export interface PortfolioAsset {
  symbol: string;
  name: string;
  allocation: string;
  value: string;
  percentageNum: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  isVerified?: boolean;
  timeAgo: string;
  sentiment: 'Bullish' | 'Bearish' | 'Analysis' | 'Neutral';
  content: string;
  cashtags: string[];
  likes: number;
  comments: number;
  reposts: number;
  liked?: boolean;

  // Member profile & privacy controls
  bio?: string;
  joinedDate?: string;
  trustScore?: string;
  portfolioValue?: string;
  topAssets?: PortfolioAsset[];
  showPortfolio?: boolean; // Member privacy: show portfolio or not
  canMessage?: boolean;    // Member privacy: allow direct messages or not
  isCurrentUser?: boolean; // If current user, syncs with profileStore
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Elena Rostova',
    authorHandle: '@erostova_macro',
    authorAvatar: 'E',
    isVerified: true,
    timeAgo: '14m ago',
    sentiment: 'Bullish',
    content: 'Global central banks are transitioning back to rate easing. Bitcoin liquidity dynamics indicate strong accumulation above $64,000. Institutional order flow remains net positive across major custody desks.',
    cashtags: ['$BTC', '$ETH', '$SOL'],
    likes: 142,
    comments: 29,
    reposts: 18,
    bio: 'Macro & Institutional Digital Asset Strategist. Ex-Commodities Desk. On-chain liquidity and cross-asset researcher.',
    joinedDate: 'Joined Jan 2023',
    trustScore: '99.4% Verified Score',
    portfolioValue: '$1,842,590.00',
    topAssets: [
      { symbol: 'ETH', name: 'Ethereum', allocation: '54%', value: '$995,000', percentageNum: 54 },
      { symbol: 'BTC', name: 'Bitcoin', allocation: '32%', value: '$589,600', percentageNum: 32 },
      { symbol: 'SOL', name: 'Solana', allocation: '14%', value: '$257,990', percentageNum: 14 },
    ],
    showPortfolio: true,
    canMessage: true,
  },
  {
    id: 'post-2',
    authorName: 'SatoshiDesk',
    authorHandle: '@satoshidesk_defi',
    authorAvatar: 'S',
    isVerified: true,
    timeAgo: '42m ago',
    sentiment: 'Analysis',
    content: 'Ethereum Layer 2 throughput just crossed an aggregate 340 TPS. Base and Arbitrum are capturing over 75% of rollup DEX swaps. The fee compression from recent upgrades makes on-chain micropayments viable at institutional scale.',
    cashtags: ['$ETH', '$ARB', '$OP'],
    likes: 98,
    comments: 16,
    reposts: 24,
    bio: 'DeFi infrastructure engineer & Layer 2 protocol auditor. Researching cross-chain liquidity & MEV resistance.',
    joinedDate: 'Joined Nov 2022',
    trustScore: '98.8% Verified Score',
    portfolioValue: '$720,450.00',
    topAssets: [
      { symbol: 'ETH', name: 'Ethereum', allocation: '40%', value: '$288,180', percentageNum: 40 },
      { symbol: 'ARB', name: 'Arbitrum', allocation: '35%', value: '$252,150', percentageNum: 35 },
      { symbol: 'OP', name: 'Optimism', allocation: '25%', value: '$180,120', percentageNum: 25 },
    ],
    showPortfolio: true,
    canMessage: true,
  },
  {
    id: 'post-3',
    authorName: 'SolanaQuant',
    authorHandle: '@solana_quant',
    authorAvatar: 'Q',
    isVerified: false,
    timeAgo: '1h ago',
    sentiment: 'Bullish',
    content: 'DeFi TVL on Solana pushed past $5.8B today. Seeing heavy activity in automated market makers and liquid staking protocols. Firedancer testnet metrics look promising.',
    cashtags: ['$SOL', '$JUP'],
    likes: 67,
    comments: 11,
    reposts: 8,
    bio: 'High-frequency algorithmic market maker on Solana & high-throughput L1s. Quantitative research.',
    joinedDate: 'Joined Mar 2023',
    trustScore: '97.2% Verified Score',
    portfolioValue: '$410,200.00',
    topAssets: [
      { symbol: 'SOL', name: 'Solana', allocation: '85%', value: '$348,670', percentageNum: 85 },
      { symbol: 'JUP', name: 'Jupiter', allocation: '15%', value: '$61,530', percentageNum: 15 },
    ],
    showPortfolio: false, // Privacy: Portfolio hidden by user
    canMessage: true,
  },
  {
    id: 'post-4',
    authorName: 'Fintech Sentinel',
    authorHandle: '@fintech_sentinel',
    authorAvatar: 'F',
    isVerified: true,
    timeAgo: '3h ago',
    sentiment: 'Neutral',
    content: 'Regulatory framework draft for tokenized Treasuries and cross-border stablecoins is moving through legislative committees. Expect institutional settlement standards to solidify by Q3.',
    cashtags: ['$USDC', '$USDT'],
    likes: 54,
    comments: 8,
    reposts: 12,
    bio: 'Institutional regulatory affairs analyst & enterprise blockchain compliance advisor.',
    joinedDate: 'Joined Aug 2023',
    trustScore: '96.5% Verified Score',
    portfolioValue: '$95,400.00',
    topAssets: [
      { symbol: 'USDC', name: 'USD Coin', allocation: '60%', value: '$57,240', percentageNum: 60 },
      { symbol: 'BTC', name: 'Bitcoin', allocation: '40%', value: '$38,160', percentageNum: 40 },
    ],
    showPortfolio: true,
    canMessage: false, // Privacy: Direct messages disabled by user
  },
];

// Curated Breaking News
const BREAKING_NEWS = [
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

const TRENDING_TOPICS = [
  { tag: '#BitcoinETF', posts: '28.4k posts' },
  { tag: '#EthereumPectra', posts: '19.2k posts' },
  { tag: '#SolanaDeFi', posts: '14.8k posts' },
  { tag: '#Layer2Rollups', posts: '11.5k posts' },
  { tag: '#AIAgentsOnChain', posts: '9.3k posts' },
  { tag: '#ZeroGasSwaps', posts: '6.7k posts' },
];

export default function ExploreScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const {
    name,
    username,
    avatar,
    setUsername,
    setName,
    allowPublicPortfolio,
    allowDirectMessages,
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState<'feed' | 'news' | 'trends'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Username Creation Modal State
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newDisplayNameInput, setNewDisplayNameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Member Profile Sheet State
  const [selectedMember, setSelectedMember] = useState<CommunityPost | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Direct Message Modal State
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [directMessageText, setDirectMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // New Post Composer State
  const [composerText, setComposerText] = useState('');
  const [composerSentiment, setComposerSentiment] = useState<'Bullish' | 'Bearish' | 'Analysis'>('Bullish');
  const [selectedTag, setSelectedTag] = useState('$BTC');
  const [isPosting, setIsPosting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Comment Modal State
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePostForComment, setActivePostForComment] = useState<CommunityPost | null>(null);
  const [commentInput, setCommentInput] = useState('');

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
      setRefreshing(false);
    }, 800);
  };

  const openUsernameModal = () => {
    setNewUsernameInput(username || '');
    setNewDisplayNameInput(name || '');
    setUsernameError('');
    setShowUsernameModal(true);
  };

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
    triggerToast(`Username @${clean} set! You can now post.`);
  };

  // Open Member Profile
  const openMemberProfile = (post: CommunityPost) => {
    setSelectedMember(post);
    setShowProfileModal(true);
  };

  // Open Current User's Profile
  const openCurrentUserProfile = () => {
    if (!username) {
      openUsernameModal();
      return;
    }
    const myProfilePost: CommunityPost = {
      id: 'current-user-profile',
      authorName: name || 'Cura Vault Member',
      authorHandle: `@${username}`,
      authorAvatar: avatar || 'U',
      isVerified: true,
      timeAgo: 'Active',
      sentiment: 'Analysis',
      content: '',
      cashtags: [],
      likes: 0,
      comments: 0,
      reposts: 0,
      isCurrentUser: true,
      bio: 'Institutional CryptoVaultAI Member. Self-custodial security & multi-chain vault holder.',
      joinedDate: 'Joined Recent',
      trustScore: '100% Attested Safe',
      portfolioValue: '$1,842,590.42',
      topAssets: [
        { symbol: 'ETH', name: 'Ethereum', allocation: '56.9%', value: '$1,048,220.00', percentageNum: 57 },
        { symbol: 'BTC', name: 'Bitcoin', allocation: '28.2%', value: '$520,380.00', percentageNum: 28 },
        { symbol: 'SOL', name: 'Solana', allocation: '10.0%', value: '$184,200.00', percentageNum: 10 },
      ],
      showPortfolio: allowPublicPortfolio,
      canMessage: allowDirectMessages,
    };
    setSelectedMember(myProfilePost);
    setShowProfileModal(true);
  };

  // Send Direct Message
  const handleSendDirectMessage = () => {
    if (!directMessageText.trim() || !selectedMember) return;
    setIsSendingMessage(true);

    setTimeout(() => {
      setIsSendingMessage(false);
      setShowDirectMessageModal(false);
      setDirectMessageText('');
      triggerToast(`Encrypted message delivered to ${selectedMember.authorHandle}`);
    }, 450);
  };

  // Toggle Like
  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const wasLiked = post.liked;
          return {
            ...post,
            liked: !wasLiked,
            likes: wasLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  // Handle Repost
  const handleRepost = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, reposts: post.reposts + 1 };
        }
        return post;
      })
    );
    triggerToast('Post shared to your profile');
  };

  // Handle Share Native
  const handleShare = async (post: CommunityPost) => {
    try {
      await Share.share({
        message: `${post.authorName} (${post.authorHandle}) on Cura Community: "${post.content}"\n\nShared via Cura Wallet`,
      });
    } catch {
      // Ignored
    }
  };

  // Publish New Post
  const handleCreatePost = () => {
    if (!username || !username.trim()) {
      openUsernameModal();
      return;
    }

    const trimmed = composerText.trim();
    if (!trimmed) {
      triggerToast('Please write your thoughts before posting');
      return;
    }

    setIsPosting(true);
    setTimeout(() => {
      const newPost: CommunityPost = {
        id: `post-user-${Date.now()}`,
        authorName: name || 'Cura Member',
        authorHandle: `@${username}`,
        authorAvatar: avatar || 'U',
        isVerified: true,
        timeAgo: 'Just now',
        sentiment: composerSentiment,
        content: trimmed,
        cashtags: [selectedTag],
        likes: 0,
        comments: 0,
        reposts: 0,
        isCurrentUser: true,
        bio: 'Institutional CryptoVaultAI Member. Self-custodial security & multi-chain vault holder.',
        joinedDate: 'Joined Today',
        trustScore: '100% Attested Safe',
        portfolioValue: '$1,842,590.42',
        topAssets: [
          { symbol: 'ETH', name: 'Ethereum', allocation: '56.9%', value: '$1,048,220.00', percentageNum: 57 },
          { symbol: 'BTC', name: 'Bitcoin', allocation: '28.2%', value: '$520,380.00', percentageNum: 28 },
          { symbol: 'SOL', name: 'Solana', allocation: '10.0%', value: '$184,200.00', percentageNum: 10 },
        ],
        showPortfolio: allowPublicPortfolio,
        canMessage: allowDirectMessages,
      };

      setPosts([newPost, ...posts]);
      setComposerText('');
      setIsPosting(false);
      triggerToast('Post published to Cura Community');
    }, 300);
  };

  // Submit Comment
  const handleAddComment = () => {
    if (!commentInput.trim() || !activePostForComment) return;
    const postId = activePostForComment.id;

    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    );
    setCommentInput('');
    setCommentModalVisible(false);
    triggerToast('Comment added');
  };

  // Filtered Items
  const filteredPosts = posts.filter(p =>
    searchQuery
      ? p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cashtags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const filteredNews = BREAKING_NEWS.filter(n =>
    searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.source.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Determine effective privacy permissions for active selected member
  const isSelectedUserCurrent = Boolean(
    selectedMember?.isCurrentUser ||
    (username && selectedMember?.authorHandle.toLowerCase() === `@${username.toLowerCase()}`)
  );

  const effectiveShowPortfolio = isSelectedUserCurrent
    ? allowPublicPortfolio
    : (selectedMember?.showPortfolio ?? true);

  const effectiveCanMessage = isSelectedUserCurrent
    ? allowDirectMessages
    : (selectedMember?.canMessage ?? true);

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

      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.screenTitle, { color: colors.text.primary }]}>Cura Community</Text>
          <View style={[styles.liveDot, { backgroundColor: monoPrimary }]} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AIChatbot')}
          style={[styles.aiPill, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.aiPillText, { color: colors.text.primary }]}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
          <SearchIcon color={colors.text.muted} size={15} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search alpha, news, cashtags ($ETH, $BTC)..."
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
          {(['feed', 'news', 'trends'] as const).map(tab => {
            const active = activeTab === tab;
            const label = tab === 'feed' ? 'Discussions' : tab === 'news' ? 'Crypto News' : 'Trending';
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
        {/* TAB 1: COMMUNITY FEED & USER POSTING                     */}
        {/* ======================================================== */}
        {activeTab === 'feed' && (
          <>
            {/* User Post Composer Card */}
            <View style={[styles.composerCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {/* Profile Bar in Composer */}
              <View style={styles.composerHeaderRow}>
                <TouchableOpacity
                  onPress={openCurrentUserProfile}
                  style={[styles.composerAvatar, { backgroundColor: monoMutedSurface }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.composerAvatarText, { color: colors.text.primary }]}>
                    {avatar || 'U'}
                  </Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  {username ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TouchableOpacity
                        onPress={openCurrentUserProfile}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.composerNameText, { color: colors.text.primary }]}>
                          {name || 'Community Member'}
                        </Text>
                        <Text style={styles.composerHandleText}>@{username}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={openUsernameModal}>
                        <Text style={[styles.composerEditHandle, { color: colors.text.muted }]}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={openUsernameModal} style={styles.createHandleNotice}>
                      <Text style={[styles.createHandleNoticeText, { color: monoPrimary }]}>
                        ⚠️ Create username to post alpha →
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <TextInput
                value={composerText}
                onChangeText={setComposerText}
                onFocus={() => {
                  if (!username) {
                    openUsernameModal();
                  }
                }}
                placeholder={username ? "Share analysis, alpha, or market sentiment..." : "Tap to create username and start posting..."}
                placeholderTextColor={colors.text.muted}
                style={[styles.composerInput, { color: colors.text.primary }]}
                multiline
                maxLength={400}
              />

              {/* Sentiment & Cashtag Bar */}
              <View style={[styles.composerControlsRow, { borderTopColor: cardBorder }]}>
                {/* Sentiment Switchers */}
                <View style={styles.sentimentPillRow}>
                  {(['Bullish', 'Analysis', 'Bearish'] as const).map(sentiment => {
                    const active = composerSentiment === sentiment;
                    return (
                      <TouchableOpacity
                        key={sentiment}
                        onPress={() => setComposerSentiment(sentiment)}
                        style={[
                          styles.sentimentChip,
                          { backgroundColor: active ? monoPrimary : monoMutedSurface },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.sentimentChipText,
                          active
                            ? { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' }
                            : { color: colors.text.primary },
                        ]}>
                          {sentiment === 'Bullish' ? '↗ Bullish' : sentiment === 'Bearish' ? '↘ Bearish' : 'ℹ Analysis'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Publish Action */}
                <TouchableOpacity
                  onPress={handleCreatePost}
                  disabled={isPosting || !composerText.trim()}
                  style={[
                    styles.publishBtn,
                    { backgroundColor: monoPrimary },
                    !composerText.trim() && { opacity: 0.4 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.publishBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    {isPosting ? 'Posting…' : 'Publish'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Posts Stream */}
            {filteredPosts.map(post => (
              <View
                key={post.id}
                style={[styles.postCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
              >
                {/* Author Info & Sentiment */}
                <View style={styles.postHeader}>
                  <TouchableOpacity
                    onPress={() => openMemberProfile(post)}
                    style={styles.authorRow}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.authorAvatarCircle, { backgroundColor: monoMutedSurface }]}>
                      <Text style={[styles.authorAvatarText, { color: colors.text.primary }]}>
                        {post.authorAvatar}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.authorNameText, { color: colors.text.primary }]}>
                          {post.authorName}
                        </Text>
                        {post.isVerified && (
                          <View style={[styles.verifiedBadge, { backgroundColor: monoPrimary }]}>
                            <VerifiedCheck color={isDark ? '#000000' : '#FFFFFF'} size={9} />
                          </View>
                        )}
                      </View>
                      <Text style={styles.authorHandleText}>{post.authorHandle} • {post.timeAgo}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Sentiment Badge */}
                  <View style={[styles.sentimentBadge, { backgroundColor: monoMutedSurface }]}>
                    <Text style={[styles.sentimentBadgeText, { color: colors.text.primary }]}>
                      {post.sentiment === 'Bullish' ? '↗ Bullish' : post.sentiment === 'Bearish' ? '↘ Bearish' : 'ℹ Analysis'}
                    </Text>
                  </View>
                </View>

                {/* Post Body Content */}
                <Text style={[styles.postBodyText, { color: colors.text.primary }]}>
                  {post.content}
                </Text>

                {/* Cashtags */}
                {post.cashtags && post.cashtags.length > 0 && (
                  <View style={styles.cashtagsRow}>
                    {post.cashtags.map(tag => (
                      <View key={tag} style={[styles.cashtagPill, { backgroundColor: monoMutedSurface }]}>
                        <Text style={[styles.cashtagText, { color: colors.text.primary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Metrics Row (Likes, Comments, Reposts, Share) */}
                <View style={[styles.postActionsRow, { borderTopColor: cardBorder }]}>
                  {/* Like Button */}
                  <TouchableOpacity
                    onPress={() => handleLike(post.id)}
                    style={styles.actionMetricItem}
                    activeOpacity={0.65}
                  >
                    <HeartIcon
                      filled={post.liked}
                      color={post.liked ? '#EF4444' : colors.text.muted}
                      size={15}
                    />
                    <Text style={[
                      styles.actionMetricCount,
                      { color: post.liked ? '#EF4444' : colors.text.muted },
                    ]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  {/* Comment Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setActivePostForComment(post);
                      setCommentModalVisible(true);
                    }}
                    style={styles.actionMetricItem}
                    activeOpacity={0.65}
                  >
                    <CommentIcon color={colors.text.muted} size={15} />
                    <Text style={[styles.actionMetricCount, { color: colors.text.muted }]}>
                      {post.comments}
                    </Text>
                  </TouchableOpacity>

                  {/* Repost Button */}
                  <TouchableOpacity
                    onPress={() => handleRepost(post.id)}
                    style={styles.actionMetricItem}
                    activeOpacity={0.65}
                  >
                    <RepostIcon color={colors.text.muted} size={15} />
                    <Text style={[styles.actionMetricCount, { color: colors.text.muted }]}>
                      {post.reposts}
                    </Text>
                  </TouchableOpacity>

                  {/* Share Button */}
                  <TouchableOpacity
                    onPress={() => handleShare(post)}
                    style={styles.actionMetricItem}
                    activeOpacity={0.65}
                  >
                    <ShareIcon color={colors.text.muted} size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BREAKING CRYPTO NEWS                              */}
        {/* ======================================================== */}
        {activeTab === 'news' && (
          <>
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
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TRENDING TOPICS & ALPHA                           */}
        {/* ======================================================== */}
        {activeTab === 'trends' && (
          <View style={[styles.trendsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.trendsSectionTitle, { color: colors.text.primary }]}>
              Trending Discussions & Cashtags
            </Text>
            <Text style={styles.trendsSectionSubtitle}>
              Aggregated real-time metrics across institutional Web3 networks
            </Text>

            {TRENDING_TOPICS.map((topic, i) => (
              <TouchableOpacity
                key={topic.tag}
                onPress={() => {
                  setSearchQuery(topic.tag.replace('#', ''));
                  setActiveTab('feed');
                }}
                style={[
                  styles.trendItemRow,
                  i !== TRENDING_TOPICS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: cardBorder },
                ]}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[styles.trendTagText, { color: colors.text.primary }]}>
                    {topic.tag}
                  </Text>
                  <Text style={styles.trendPostCount}>{topic.posts}</Text>
                </View>
                <Text style={{ color: colors.text.muted, fontSize: 13, fontWeight: '700' }}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: MEMBER PROFILE & PORTFOLIO DETAILS              */}
      {/* ======================================================== */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setShowProfileModal(false)} />
          <View style={[styles.profileSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            {/* Profile Top Bar */}
            <View style={styles.profileSheetHeaderRow}>
              <Text style={[styles.profileSheetTitle, { color: colors.text.primary }]}>
                {isSelectedUserCurrent ? 'Your Community Profile' : 'Member Profile'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowProfileModal(false)}
                style={[styles.closeIconCircle, { backgroundColor: monoMutedSurface }]}
              >
                <CloseIcon color={colors.text.primary} size={16} />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Author Identity Badge */}
                <View style={styles.memberIdentityCard}>
                  <View style={[styles.largeMemberAvatar, { backgroundColor: monoPrimary }]}>
                    <Text style={[styles.largeMemberAvatarText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                      {selectedMember.authorAvatar}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={[styles.memberFullName, { color: colors.text.primary }]}>
                        {selectedMember.authorName}
                      </Text>
                      {selectedMember.isVerified && (
                        <View style={[styles.verifiedBadge, { backgroundColor: monoPrimary, width: 15, height: 15, borderRadius: 7.5 }]}>
                          <VerifiedCheck color={isDark ? '#000000' : '#FFFFFF'} size={10} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberHandleText}>{selectedMember.authorHandle}</Text>
                    <View style={styles.trustPillRow}>
                      <View style={[styles.trustPill, { backgroundColor: monoMutedSurface }]}>
                        <ShieldCheckIcon color={colors.text.primary} size={11} />
                        <Text style={[styles.trustPillText, { color: colors.text.primary }]}>
                          {selectedMember.trustScore || 'Enclave Attested'}
                        </Text>
                      </View>
                      <Text style={styles.memberJoinedText}>
                        {selectedMember.joinedDate || 'Member'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Member Bio */}
                {selectedMember.bio && (
                  <View style={[styles.bioCard, { backgroundColor: monoMutedSurface }]}>
                    <Text style={[styles.bioText, { color: colors.text.primary }]}>
                      {selectedMember.bio}
                    </Text>
                  </View>
                )}

                {/* Current User Notice & Privacy Shortcut */}
                {isSelectedUserCurrent && (
                  <View style={[styles.currentUserPrivacyCard, { borderColor: cardBorder }]}>
                    <View style={styles.privacyCardHeader}>
                      <Text style={[styles.privacyCardTitle, { color: colors.text.primary }]}>
                        🔒 Your Privacy Preferences
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowProfileModal(false);
                          navigation.navigate('Settings');
                        }}
                      >
                        <Text style={[styles.managePrivacyLink, { color: monoPrimary }]}>
                          Settings →
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.privacyCardNotice}>
                      Portfolio visibility is currently{' '}
                      <Text style={{ fontWeight: '700', color: colors.text.primary }}>
                        {allowPublicPortfolio ? 'PUBLIC' : 'HIDDEN'}
                      </Text>
                      . Direct messaging is{' '}
                      <Text style={{ fontWeight: '700', color: colors.text.primary }}>
                        {allowDirectMessages ? 'ALLOWED' : 'DISABLED'}
                      </Text>
                      .
                    </Text>
                  </View>
                )}

                {/* Direct Message Action */}
                {!isSelectedUserCurrent && (
                  <View style={{ marginTop: 14 }}>
                    {effectiveCanMessage ? (
                      <TouchableOpacity
                        onPress={() => {
                          setShowProfileModal(false);
                          setShowDirectMessageModal(true);
                        }}
                        style={[styles.directMessageBtn, { backgroundColor: monoPrimary }]}
                        activeOpacity={0.8}
                      >
                        <MessageSquareIcon color={isDark ? '#000000' : '#FFFFFF'} size={15} />
                        <Text style={[styles.directMessageBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                          Send Direct Message
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.disabledMessagingBanner, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                        <LockIcon color={colors.text.muted} size={15} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={[styles.disabledMessagingTitle, { color: colors.text.primary }]}>
                            Direct Messages Disabled
                          </Text>
                          <Text style={styles.disabledMessagingSub}>
                            This member has turned off direct messages in their privacy settings.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Portfolio Section */}
                <View style={styles.portfolioSectionContainer}>
                  <View style={styles.portfolioSectionHeader}>
                    <Text style={[styles.portfolioSectionLabel, { color: colors.text.secondary }]}>
                      VERIFIED PORTFOLIO DETAILS
                    </Text>
                    {effectiveShowPortfolio && (
                      <View style={[styles.enclaveVerifiedTag, { backgroundColor: monoMutedSurface }]}>
                        <Text style={[styles.enclaveVerifiedText, { color: colors.text.primary }]}>
                          ✓ Enclave Verified
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Condition: Show Portfolio or Privacy Lock */}
                  {effectiveShowPortfolio ? (
                    <View style={[styles.portfolioBreakdownCard, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                      {/* Total Portfolio Value Header */}
                      <View style={styles.portfolioTotalRow}>
                        <View>
                          <Text style={styles.portfolioTotalLabel}>TOTAL ESTIMATED VALUE</Text>
                          <Text style={[styles.portfolioTotalValue, { color: colors.text.primary }]}>
                            {selectedMember.portfolioValue || '$1,842,590.00'}
                          </Text>
                        </View>
                        <View style={[styles.allocationCountBadge, { backgroundColor: cardBg }]}>
                          <Text style={[styles.allocationCountText, { color: colors.text.primary }]}>
                            {selectedMember.topAssets?.length || 3} Assets
                          </Text>
                        </View>
                      </View>

                      {/* Assets Distribution List */}
                      {selectedMember.topAssets && selectedMember.topAssets.map(asset => (
                        <View key={asset.symbol} style={[styles.assetAllocationRow, { borderTopColor: cardBorder }]}>
                          <View style={styles.assetAllocationLeft}>
                            <View style={[styles.assetSymbolCircle, { backgroundColor: cardBg }]}>
                              <Text style={[styles.assetSymbolText, { color: colors.text.primary }]}>
                                {asset.symbol}
                              </Text>
                            </View>
                            <View style={{ marginLeft: 10 }}>
                              <Text style={[styles.assetNameText, { color: colors.text.primary }]}>
                                {asset.name}
                              </Text>
                              <Text style={styles.assetAllocationPercent}>
                                {asset.allocation} allocation
                              </Text>
                            </View>
                          </View>

                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.assetValueText, { color: colors.text.primary }]}>
                              {asset.value}
                            </Text>
                            {/* Visual allocation progress bar */}
                            <View style={[styles.allocationTrack, { backgroundColor: cardBg }]}>
                              <View
                                style={[
                                  styles.allocationFill,
                                  { width: `${asset.percentageNum}%`, backgroundColor: monoPrimary },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.portfolioLockedCard, { backgroundColor: monoMutedSurface, borderColor: cardBorder }]}>
                      <View style={[styles.lockedIconWrapper, { backgroundColor: cardBg }]}>
                        <LockIcon color={colors.text.primary} size={22} />
                      </View>
                      <Text style={[styles.portfolioLockedTitle, { color: colors.text.primary }]}>
                        Portfolio Hidden by Member
                      </Text>
                      <Text style={styles.portfolioLockedDesc}>
                        This member has chosen to keep their vault holdings, asset distribution, and portfolio balances confidential in their privacy settings.
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: DIRECT ENCRYPTED MESSAGE COMPOSER               */}
      {/* ======================================================== */}
      <Modal
        visible={showDirectMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDirectMessageModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismissArea} onPress={() => setShowDirectMessageModal(false)} />
          <View style={[styles.messageSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.messageSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.composerAvatar, { backgroundColor: monoPrimary, width: 32, height: 32, borderRadius: 16 }]}>
                  <Text style={[styles.composerAvatarText, { color: isDark ? '#000000' : '#FFFFFF', fontSize: 13 }]}>
                    {selectedMember?.authorAvatar || 'M'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.messageRecipientName, { color: colors.text.primary }]}>
                    Message {selectedMember?.authorName}
                  </Text>
                  <Text style={styles.messageRecipientHandle}>
                    {selectedMember?.authorHandle}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowDirectMessageModal(false)}
                style={[styles.closeIconCircle, { backgroundColor: monoMutedSurface }]}
              >
                <CloseIcon color={colors.text.primary} size={15} />
              </TouchableOpacity>
            </View>

            <View style={[styles.encryptionBadgeRow, { backgroundColor: monoMutedSurface }]}>
              <ShieldCheckIcon color={colors.text.primary} size={12} />
              <Text style={[styles.encryptionBadgeText, { color: colors.text.primary }]}>
                End-to-End Encrypted via Cura Enclave Peer Protocol
              </Text>
            </View>

            <TextInput
              value={directMessageText}
              onChangeText={setDirectMessageText}
              placeholder={`Write a confidential message to ${selectedMember?.authorHandle}...`}
              placeholderTextColor={colors.text.muted}
              style={[
                styles.directMessageInput,
                { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder },
              ]}
              multiline
              autoFocus
              maxLength={600}
            />

            <View style={styles.directMessageActionsRow}>
              <Text style={styles.messageCharCount}>
                {directMessageText.length}/600
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setShowDirectMessageModal(false)}
                  style={[styles.cancelModalBtn, { backgroundColor: monoMutedSurface }]}
                >
                  <Text style={[styles.cancelModalBtnText, { color: colors.text.primary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendDirectMessage}
                  disabled={isSendingMessage || !directMessageText.trim()}
                  style={[
                    styles.confirmUsernameBtn,
                    { backgroundColor: monoPrimary },
                    !directMessageText.trim() && { opacity: 0.4 },
                  ]}
                >
                  <Text style={[styles.confirmUsernameBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    {isSendingMessage ? 'Sending…' : 'Send Message'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Quick Reply / Comment Modal */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismissArea} onPress={() => setCommentModalVisible(false)} />
          <View style={[styles.commentSheet, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Add Reply</Text>
            {activePostForComment && (
              <Text style={styles.replyingToText}>
                Replying to <Text style={{ fontWeight: '700', color: colors.text.primary }}>{activePostForComment.authorHandle}</Text>
              </Text>
            )}

            <TextInput
              value={commentInput}
              onChangeText={setCommentInput}
              placeholder="Write your constructive analysis..."
              placeholderTextColor={colors.text.muted}
              style={[styles.commentTextInput, { backgroundColor: monoMutedSurface, color: colors.text.primary, borderColor: cardBorder }]}
              multiline
              autoFocus
            />

            <View style={styles.commentModalActions}>
              <TouchableOpacity
                onPress={() => setCommentModalVisible(false)}
                style={[styles.cancelCommentBtn, { backgroundColor: monoMutedSurface }]}
              >
                <Text style={[styles.cancelCommentText, { color: colors.text.primary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentInput.trim()}
                style={[
                  styles.submitCommentBtn,
                  { backgroundColor: monoPrimary },
                  !commentInput.trim() && { opacity: 0.4 },
                ]}
              >
                <Text style={[styles.submitCommentText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create Username Modal */}
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
              Create Community Profile
            </Text>
            <Text style={styles.usernameModalSubtitle}>
              You must set a unique handle to post alpha, analysis, and interact with the Cura community.
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
  aiPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  aiPillText: {
    fontSize: 11,
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
  // COMPOSER CARD
  composerCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 14,
  },
  composerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  composerInput: {
    fontSize: 13.5,
    lineHeight: 18,
    minHeight: 52,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  composerControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    marginTop: 10,
    paddingTop: 10,
  },
  sentimentPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sentimentChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sentimentChipText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  publishBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  publishBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  // POST CARD
  postCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 15,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    fontSize: 12,
    fontWeight: '800',
  },
  authorNameText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  verifiedBadge: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorHandleText: {
    color: '#858585',
    fontSize: 11,
    marginTop: 1,
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sentimentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postBodyText: {
    fontSize: 13.5,
    lineHeight: 19.5,
    fontWeight: '400',
    marginBottom: 10,
  },
  cashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  cashtagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cashtagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  postActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingTop: 10,
    marginTop: 4,
  },
  actionMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  actionMetricCount: {
    fontSize: 11.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  // NEWS SECTION
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
  // TRENDS
  trendsCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    padding: 16,
  },
  trendsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendsSectionSubtitle: {
    color: '#858585',
    fontSize: 11.5,
    marginBottom: 14,
  },
  trendItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trendTagText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  trendPostCount: {
    color: '#858585',
    fontSize: 11,
    marginTop: 2,
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
    marginBottom: 14,
  },
  closeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // PROFILE SHEET
  profileSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: '88%',
  },
  profileSheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  profileSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  memberIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  largeMemberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeMemberAvatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  memberFullName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  memberHandleText: {
    color: '#858585',
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  trustPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  memberJoinedText: {
    color: '#858585',
    fontSize: 10.5,
  },
  bioCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  bioText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '400',
  },
  currentUserPrivacyCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 12,
  },
  privacyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  privacyCardTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  managePrivacyLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  privacyCardNotice: {
    color: '#858585',
    fontSize: 11,
    lineHeight: 15,
  },
  directMessageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  directMessageBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  disabledMessagingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 16,
  },
  disabledMessagingTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  disabledMessagingSub: {
    color: '#858585',
    fontSize: 10.5,
    lineHeight: 14,
  },
  // PORTFOLIO SECTION IN SHEET
  portfolioSectionContainer: {
    marginTop: 4,
  },
  portfolioSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  portfolioSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  enclaveVerifiedTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  enclaveVerifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  portfolioBreakdownCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
  },
  portfolioTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  portfolioTotalLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#858585',
    marginBottom: 2,
  },
  portfolioTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  allocationCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  allocationCountText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  assetAllocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingVertical: 10,
  },
  assetAllocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetSymbolCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetSymbolText: {
    fontSize: 11,
    fontWeight: '800',
  },
  assetNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  assetAllocationPercent: {
    color: '#858585',
    fontSize: 10.5,
    marginTop: 1,
  },
  assetValueText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  allocationTrack: {
    width: 70,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  allocationFill: {
    height: '100%',
    borderRadius: 2,
  },
  portfolioLockedCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  portfolioLockedTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  portfolioLockedDesc: {
    color: '#858585',
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
  // DIRECT MESSAGE MODAL
  messageSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 0.5,
    padding: 20,
    paddingBottom: 34,
  },
  messageSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageRecipientName: {
    fontSize: 15,
    fontWeight: '800',
  },
  messageRecipientHandle: {
    color: '#858585',
    fontSize: 11,
  },
  encryptionBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  encryptionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  directMessageInput: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    fontSize: 13.5,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  directMessageActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCharCount: {
    color: '#858585',
    fontSize: 11,
  },
  // COMMENT MODAL
  commentSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 0.5,
    padding: 18,
    paddingBottom: 34,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  replyingToText: {
    color: '#858585',
    fontSize: 11.5,
    marginBottom: 12,
  },
  commentTextInput: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 12,
    fontSize: 13.5,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  commentModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelCommentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelCommentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitCommentBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  submitCommentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  composerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  composerNameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  composerHandleText: {
    fontSize: 11,
    color: '#858585',
  },
  composerEditHandle: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  createHandleNotice: {
    paddingVertical: 2,
  },
  createHandleNoticeText: {
    fontSize: 11.5,
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
});
