// src/screens/CoinDetailScreen.tsx
// Coin detail with both candlestick charts (1H–1Y) and a real-time
// 1s/1m line chart that ticks via PriceService.subscribeLivePrice().

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions, Platform, Linking } from 'react-native';
import { PriceService, CoinMarket } from '../services/PriceService';
import { AIService } from '../services/AIService';
import { CandlestickChart } from '../components/CandlestickChart';
import { RealtimeLineChart, Tick } from '../components/RealtimeLineChart';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';

const SCREEN_W = Dimensions.get('window').width;

// Timeframes — a mix of realtime OHLC and candlestick options.
type TfMode = 'realtime-line' | 'ohlc-candles';
interface Tf {
  label: string;
  days: number;
  mode: TfMode;
  liveWindowMs: number;
}
const TIMEFRAMES: Tf[] = [
  { label: 'LIVE', days: 0, mode: 'realtime-line', liveWindowMs: 60_000 },
  { label: '1M',  days: 0, mode: 'realtime-line', liveWindowMs: 3_600_000 },
  { label: '1H',  days: 1, mode: 'ohlc-candles',  liveWindowMs: 0 },
  { label: '1D',  days: 1, mode: 'ohlc-candles',  liveWindowMs: 0 },
  { label: '1W',  days: 7, mode: 'ohlc-candles',  liveWindowMs: 0 },
  { label: '1Mo', days: 30, mode: 'ohlc-candles', liveWindowMs: 0 },
  { label: '1Y',  days: 365, mode: 'ohlc-candles', liveWindowMs: 0 },
];

interface Props {
  route?: { params?: { coin?: CoinMarket } };
  navigation?: any;
}

// Extended coin response from CoinGecko /coins/{id}
interface CoinDetail {
  description?: { en?: string };
  links?: {
    homepage?: string[];
    blockchain_site?: string[];
    twitter_screen_name?: string;
    reddit_url?: string;
  };
  market_cap_rank?: number;
  fully_diluted_valuation?: { usd?: number };
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: { usd?: number };
  ath_change_percentage?: { usd?: number };
  ath_date?: { usd?: string };
  atl?: { usd?: number };
  atl_change_percentage?: { usd?: number };
  atl_date?: { usd?: string };
}

export default function CoinDetailScreen({ route, navigation }: Props) {
  const coin = route?.params?.coin;
  const [candles, setCandles] = useState<number[][]>([]);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [tfIdx, setTfIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [detail, setDetail] = useState<CoinDetail | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const tf = TIMEFRAMES[tfIdx];
  const coinId = coin?.id ?? '';

  // Fetch detailed coin data from CoinGecko
  useEffect(() => {
    if (!coin) return;
    let cancelled = false;
    (async () => {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=CG-Rm3FV4JagKcS63EerYTY3nrw`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setDetail(data);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [coinId, coin]);

  // OHLC fetch when in candle mode
  useEffect(() => {
    if (!coin || tf.mode !== 'ohlc-candles') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCandles([]);
      const c = await PriceService.getOHLC(coinId, tf.days);
      if (cancelled) return;
      setCandles(c);
      if (c.length > 0) {
        const lastClose = c[c.length - 1][4];
        setLivePrice(lastClose);
        setPrevPrice(lastClose);
      }
      setLoading(false);
      setLastUpdate(Date.now());
    })();
    return () => { cancelled = true; };
  }, [coinId, tfIdx, tf.mode, tf.days]);

  // Live price subscription
  useEffect(() => {
    if (!coin) return;

    if (tf.mode === 'realtime-line') {
      setTicks([{ price: coin.current_price, ts: Date.now() }]);
      setLoading(false);
    }

    const unsub = PriceService.subscribeLivePrice(coinId, (price, ts) => {
      setPrevPrice(livePriceRef.current);
      livePriceRef.current = price;
      setLivePrice(price);
      setLastUpdate(ts);

      if (tf.mode === 'realtime-line') {
        setTicks(prev => {
          const next = [...prev, { price, ts }];
          const cutoff = ts - tf.liveWindowMs;
          return next.filter(t => t.ts >= cutoff).slice(-600);
        });
      } else if (tf.mode === 'ohlc-candles' && candles.length > 0) {
        setCandles(prev => {
          if (prev.length === 0) return prev;
          const copy = prev.slice();
          const last = copy[copy.length - 1].slice() as number[];
          last[2] = Math.max(last[2], price);
          last[3] = Math.min(last[3], price);
          last[4] = price;
          copy[copy.length - 1] = last;
          return copy;
        });
      }
    });

    return () => unsub();
  }, [coinId, tfIdx, tf.mode, tf.liveWindowMs, tf.days, coin]);

  const livePriceRef = useRef<number>(0);

  if (!coin) {
    return (
      <View style={styles.root}>
        <Text style={styles.fallback}>No coin data.</Text>
      </View>
    );
  }

  const positive = coin.price_change_percentage_24h >= 0;
  const chartWidth = SCREEN_W - 2 * theme.spacing.screen;
  const chartHeight = 260;

  const tickUp = livePrice != null && prevPrice != null ? livePrice >= prevPrice : true;
  const liveColor = tickUp ? theme.colors.success : theme.colors.danger;
  const displayPrice = livePrice ?? coin.current_price;

  const handleBuy = () => {
    navigation?.navigate?.('Buy', { coin });
  };

const handleAIAnalyse = async () => {
    setAnalyzing(true);
    try {
      const circulatingSupply = detail?.circulating_supply ?? 0;
      const analysis = await AIService.analyzeCoin(
        coin.name,
        coin.symbol,
        coin.current_price as number,
        coin.price_change_percentage_24h,
        coin.market_cap,
        coin.total_volume ?? 0,
        circulatingSupply
      );
      setAnalyzing(false);
      navigation?.navigate?.('AIChatbot', { initialMessage: `Analysis for ${coin.name} (${coin.symbol}): ${analysis}`, coin });
    } catch (err) {
      setAnalyzing(false);
      alert('Analysis temporarily unavailable');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Price + LIVE badge */}
        <View style={styles.priceBlock}>
          <Text style={styles.price}>${displayPrice.toLocaleString()}</Text>
          <View style={styles.priceMeta}>
            <Text style={[styles.change, { color: positive ? theme.colors.success : theme.colors.danger }]}>
              {positive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
            </Text>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: liveColor }]} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* Timeframe selector */}
        <View style={styles.tfRow}>
          {TIMEFRAMES.map((t, i) => (
            <TouchableOpacity
              key={t.label}
              style={[styles.tfPill, tfIdx === i && styles.tfPillActive]}
              onPress={() => setTfIdx(i)}
            >
              <Text style={[styles.tfText, tfIdx === i && styles.tfTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          {tf.mode === 'realtime-line' ? (
            <RealtimeLineChart
              ticks={ticks}
              width={chartWidth}
              height={chartHeight}
              color={theme.colors.primary}
            />
          ) : loading ? (
            <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight }]}>
              <Text style={styles.chartPlaceholderText}>Loading candles…</Text>
            </View>
          ) : candles.length === 0 ? (
            <View style={[styles.chartPlaceholder, { width: chartWidth, height: chartHeight }]}>
              <Text style={styles.chartPlaceholderText}>No OHLC data (rate-limited). Retry shortly.</Text>
            </View>
          ) : (
            <CandlestickChart candles={candles} width={chartWidth - 16} height={chartHeight} />
          )}
        </Card>

        {tf.mode === 'realtime-line' && (
          <Text style={styles.realtimeLabel}>
            {tf.liveWindowMs === 60_000 ? '1-second resolution · last 60s' : '1-minute resolution · last 1 hour'}
          </Text>
        )}

        {lastUpdate > 0 && (
          <Text style={styles.updatedText}>
            Updated {new Date(lastUpdate).toLocaleTimeString()}
          </Text>
        )}

        {/* Action buttons: Buy + Analyse with AI */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuy} activeOpacity={0.85}>
            <Text style={styles.buyBtnText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiBtn} onPress={handleAIAnalyse} activeOpacity={0.85}>
            <Text style={styles.aiBtnIcon}>🤖</Text>
            <Text style={styles.aiBtnText}>{analyzing ? 'Analyzing…' : 'Analyse with AI'}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Market Stats</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Market Cap" value={`$${formatBig(coin.market_cap)}`} />
          <StatBox label="Rank" value={detail?.market_cap_rank ? `#${detail.market_cap_rank}` : '-'} />
          <StatBox label="24h High"  value={`$${coin.high_24h?.toLocaleString() ?? '-'}`} />
          <StatBox label="24h Low"   value={`$${coin.low_24h?.toLocaleString() ?? '-'}`} />
          <StatBox label="Volume"    value={`$${formatBig(coin.total_volume)}`} />
          <StatBox label="FDV"       value={detail?.fully_diluted_valuation?.usd ? `$${formatBig(detail.fully_diluted_valuation.usd)}` : '-'} />
          <StatBox label="Circ. Supply" value={detail?.circulating_supply ? formatBig(detail.circulating_supply) : '-'} />
          <StatBox label="Max Supply" value={detail?.max_supply ? formatBig(detail.max_supply) : '∞'} />
        </View>

        {/* All-Time High / Low */}
        <Text style={styles.sectionTitle}>All-Time High / Low</Text>
        <View style={styles.statsGrid}>
          <StatBox label="All-Time High" value={detail?.ath?.usd ? `$${detail.ath.usd.toLocaleString()}` : '-'} />
          <StatBox label="ATH Date" value={detail?.ath_date?.usd ? new Date(detail.ath_date.usd).toLocaleDateString() : '-'} />
          <StatBox label="ATH Change" value={detail?.ath_change_percentage?.usd ? `${detail.ath_change_percentage.usd.toFixed(1)}%` : '-'} />
          <StatBox label="All-Time Low" value={detail?.atl?.usd ? `$${detail.atl.usd.toLocaleString()}` : '-'} />
        </View>

        {/* Description */}
        {detail?.description?.en && (
          <>
            <Text style={styles.sectionTitle}>About {coin.name}</Text>
            <View style={styles.descCard}>
              <Text style={styles.descText} numberOfLines={8}>
                {stripHtml(detail.description.en)}
              </Text>
            </View>
          </>
        )}

        {/* Links */}
        {detail?.links && (
          <>
            <Text style={styles.sectionTitle}>Links</Text>
            <View style={styles.linksRow}>
              {detail.links.homepage?.[0] && (
                <LinkChip label="🌐 Website" url={detail.links.homepage[0]} />
              )}
              {detail.links.twitter_screen_name && (
                <LinkChip label="🐦 Twitter" url={`https://twitter.com/${detail.links.twitter_screen_name}`} />
              )}
              {detail.links.reddit_url && (
                <LinkChip label="📱 Reddit" url={detail.links.reddit_url} />
              )}
              {detail.links.blockchain_site?.[0] && (
                <LinkChip label="🔗 Explorer" url={detail.links.blockchain_site[0]} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function LinkChip({ label, url }: { label: string; url: string }) {
  return (
    <TouchableOpacity style={styles.linkChip} onPress={() => Linking.openURL(url)} activeOpacity={0.7}>
      <Text style={styles.linkChipText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatBig(v?: number): string {
  if (!v) return '-';
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3)  return `${(v / 1e3).toFixed(2)}K`;
  return v.toLocaleString();
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },

  priceBlock: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  price: { fontSize: 44, fontWeight: '800', color: theme.colors.text, letterSpacing: -1.5, fontVariant: ['tabular-nums'] as any },
  priceMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  change: { fontSize: 15, fontWeight: '700' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.borderRadius.pill,
    gap: 6, borderWidth: 1, borderColor: theme.colors.border,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5 },
  liveText: { fontSize: 11, fontWeight: '700', color: theme.colors.text, letterSpacing: 0.8 },

  tfRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 6, flexWrap: 'wrap' },
  tfPill: {
    alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.pill,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  tfPillActive: {
    backgroundColor: theme.colors.primary, borderColor: theme.colors.primary,
  },
  tfText: { fontSize: 11, fontWeight: '700', color: theme.colors.textSecondary, letterSpacing: 0.2 },
  tfTextActive: { color: '#FFFFFF' },

  chartCard: { borderRadius: theme.borderRadius.lg, padding: 8, marginBottom: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  chartPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  chartPlaceholderText: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '500' },

  realtimeLabel: {
    fontSize: 11, color: theme.colors.primary, fontWeight: '700',
    textAlign: 'center', letterSpacing: 0.6, marginBottom: 4, textTransform: 'uppercase',
  },

  updatedText: { fontSize: 11, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 16, letterSpacing: 0.3, fontWeight: '500' },

  // ACTION BUTTONS
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  buyBtn: {
    flex: 1, backgroundColor: theme.colors.primary,
    paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
  buyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  aiBtn: {
    flex: 1, flexDirection: 'row',
    backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.primary,
    paddingVertical: 15, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  aiBtnIcon: { fontSize: 18 },
  aiBtnText: { color: theme.colors.primary, fontSize: 15, fontWeight: '700' },

  // SECTIONS
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginTop: 8, marginBottom: 12, letterSpacing: -0.3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statBox: {
    width: '48%', backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border,
  },
  statLabel: { fontSize: 11, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, fontWeight: '700' },
  statValue: { fontSize: 17, fontWeight: '700', color: theme.colors.text, fontVariant: ['tabular-nums'] as any, letterSpacing: -0.3 },

  // DESCRIPTION
  descCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20,
  },
  descText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },

  // LINKS
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  linkChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.pill,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  linkChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },

  fallback: { padding: 40, textAlign: 'center', color: theme.colors.textMuted, fontWeight: '500' },
});
