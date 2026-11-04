// src/screens/NewsScreen.tsx
// Professional Morphic Crypto News Screen with categorized feed

import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Linking, FlatList,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { NewsService, CryptoNews, NEWS_SECTIONS } from '../services/NewsService';
import { useColors, useSpacing, useBorderRadius, useIsDark, spacing, borderRadius } from '../theme/ThemeContext';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';

interface NewsScreenProps {
  navigation?: any;
}

export default function NewsScreen(_props: NewsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();

  const [active, setActive] = useState<string>('trending');
  const [news, setNews] = useState<CryptoNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load(active);
  }, [active]);

  const load = async (sectionKey: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await NewsService.getNewsForSection(sectionKey, 25);
      setNews(data);
      if (data.length === 0) setError('Could not load news headlines. Check your internet connection.');
    } catch (e: any) {
      setError(e?.message || 'Failed to load news.');
      setNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openArticle = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top + 8) }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Crypto News</Text>
          <Text style={[styles.headerSub, { color: colors.text.muted }]}>Real-time global market intelligence</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshIconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
          onPress={() => load(active, true)}
          activeOpacity={0.7}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.primary.DEFAULT} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Category Pills Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScrollContent}
        style={styles.chipsScroll}
      >
        {NEWS_SECTIONS.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            selected={active === s.key}
            onPress={() => setActive(s.key)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: CryptoNews }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => openArticle(item.url)} style={styles.cardTouchWrap}>
      <View
        style={[
          styles.morphicNewsCard,
          {
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
            borderTopColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 1)',
          },
        ]}
      >
        {item.imageurl ? (
          <Image source={{ uri: item.imageurl }} style={styles.newsImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#EFF6FF' }]}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={colors.primary.DEFAULT} strokeWidth={1.8}>
              <Path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            </Svg>
          </View>
        )}

        <View style={styles.newsBodyContent}>
          <Text style={[styles.newsTitle, { color: colors.text.primary }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.newsBody, { color: colors.text.secondary }]} numberOfLines={2}>
            {item.body || 'Tap to read full coverage and market analysis.'}
          </Text>
          <View style={styles.newsMetaRow}>
            <View style={[styles.sourceBadge, { backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF' }]}>
              <Text style={[styles.newsSource, { color: colors.primary.DEFAULT }]}>{item.source || 'CryptoNews'}</Text>
            </View>
            <Text style={[styles.newsTime, { color: colors.text.muted }]}>{formatTime(item.published_on)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      {loading ? (
        <View style={styles.loadingWrap}>
          {renderHeader()}
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>
              Loading {NEWS_SECTIONS.find((s) => s.key === active)?.label || 'headlines'}…
            </Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          {renderHeader()}
          <View style={styles.centerLoading}>
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary.DEFAULT }]}
              onPress={() => load(active)}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, i) => `${item.id || i}-${i}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingBottom: Math.max(120, insets.bottom + 90),
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(active, true)}
              tintColor={colors.primary.DEFAULT}
              colors={[colors.primary.DEFAULT]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      )}
    </View>
  );
}

function formatTime(unix: number): string {
  if (!unix) return '';
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - unix));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  refreshIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: {
    marginHorizontal: -20,
    marginBottom: 12,
  },
  chipsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  cardTouchWrap: {
    paddingHorizontal: 20,
  },
  morphicNewsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
    shadowColor: '#0B1220',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsBodyContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  newsBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    marginBottom: 12,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newsSource: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  newsTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingWrap: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
