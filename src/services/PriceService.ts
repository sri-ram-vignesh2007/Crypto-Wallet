// src/services/PriceService.ts
// CoinGecko API with Demo API Key — real crypto prices, 30 req/min
// Plus a real-time price subscription simulator for 1s/1m tick chart.

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = 'CG-Rm3FV4JagKcS63EerYTY3nrw';

// Build a URL with the demo API key appended as query param.
function cgUrl(path: string, extraParams: string = ''): string {
  const sep = path.includes('?') ? '&' : '?';
  const p = extraParams ? `${extraParams}&` : '';
  return `${COINGECKO_BASE}${path}${sep}${p}x_cg_demo_api_key=${COINGECKO_API_KEY}`;
}

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
  high_24h?: number;
  low_24h?: number;
  total_volume?: number;
  sparkline_in_7d?: { price: number[] };
}

// ============ Real-time price subscription ============
// CoinGecko free tier doesn't give us a 1s websocket, so we simulate
// high-frequency ticks by polling /simple/price on an interval and
// broadcasting to subscribed listeners. This drives the 1s and 1m
// "realtime" line charts on CoinDetailScreen.

type PriceListener = (price: number, ts: number) => void;

interface CoinSubscription {
  coinId: string;
  listeners: Set<PriceListener>;
}

class RealtimePriceBus {
  private subs = new Map<string, CoinSubscription>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private lastPrice = new Map<string, number>();

  /** Subscribe to live price ticks for a coin. Returns an unsubscribe fn. */
  subscribe(coinId: string, listener: PriceListener): () => void {
    let sub = this.subs.get(coinId);
    if (!sub) {
      sub = { coinId, listeners: new Set() };
      this.subs.set(coinId, sub);
    }
    sub.listeners.add(listener);

    // Start polling if this is the first listener
    if (!this.timers.has(coinId)) {
      this.startPolling(coinId);
    }

    // Immediately emit last known price
    const last = this.lastPrice.get(coinId);
    if (last != null) listener(last, Date.now());

    return () => this.unsubscribe(coinId, listener);
  }

  private unsubscribe(coinId: string, listener: PriceListener) {
    const sub = this.subs.get(coinId);
    if (!sub) return;
    sub.listeners.delete(listener);
    if (sub.listeners.size === 0) {
      // No more listeners — stop polling to conserve API quota
      const timer = this.timers.get(coinId);
      if (timer) clearInterval(timer);
      this.timers.delete(coinId);
      this.subs.delete(coinId);
    }
  }

  private startPolling(coinId: string) {
    const poll = async () => {
      try {
        const price = await PriceService.getPriceRaw(coinId);
        if (price <= 0) return;
        this.lastPrice.set(coinId, price);
        const ts = Date.now();
        const sub = this.subs.get(coinId);
        if (sub) sub.listeners.forEach(fn => fn(price, ts));
      } catch { /* ignore — retry next tick */ }
    };

    // First poll immediately
    poll();
    // Then poll every 2s (within 30 req/min budget when split across coins).
    // The 1s chart interpolates between polls client-side.
    const timer = setInterval(poll, 2000);
    this.timers.set(coinId, timer);
  }
}

export const realtimePriceBus = new RealtimePriceBus();

// ============ Main PriceService ============

export class PriceService {
  /** Fetch raw price for a single coin (used by the realtime bus). */
  static async getPriceRaw(coinId: string): Promise<number> {
    try {
      const url = cgUrl('/simple/price', `ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Price ${res.status}`);
      const data = await res.json();
      return data[coinId]?.usd || 0;
    } catch {
      return 0;
    }
  }

  /** Get top coins market data. */
  static async getMarketData(currency: string = 'usd'): Promise<CoinMarket[]> {
    try {
      const url = cgUrl('/coins/markets', `vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Markets ${res.status}`);
      return await res.json();
    } catch (error: any) {
      console.error('Price fetch error:', error.message);
      return [];
    }
  }

  /** Search coins. */
  static async searchCoins(query: string): Promise<any[]> {
    try {
      const url = cgUrl('/search', `query=${encodeURIComponent(query)}`);
      const res = await fetch(url);
      const data = await res.json();
      return data.coins || [];
    } catch {
      return [];
    }
  }

  /** Get single coin price (public). */
  static async getPrice(coinId: string): Promise<number> {
    return this.getPriceRaw(coinId);
  }

  /**
   * OHLC candles for a coin. CoinGecko returns [timestampMs, open, high, low, close].
   * Minimum granularity is 30min (days=1) due to API limits.
   *
   * For sub-candle resolution (1s, 1m), use getRealtimeTicks() instead.
   */
  static async getOHLC(coinId: string, days: number = 1): Promise<number[][]> {
    try {
      const url = cgUrl(`/coins/${coinId}/ohlc`, `vs_currency=usd&days=${days}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OHLC ${res.status}`);
      return await res.json();
    } catch (e: any) {
      console.log('OHLC fetch error:', e?.message);
      return [];
    }
  }

  /**
   * Subscribe to realtime price ticks for a coin.
   * Returns an unsubscribe function.
   * Call this to drive 1s / 1m line charts.
   */
  static subscribeLivePrice(coinId: string, listener: PriceListener): () => void {
    return realtimePriceBus.subscribe(coinId, listener);
  }
}
