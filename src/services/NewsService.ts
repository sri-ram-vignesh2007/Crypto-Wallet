// src/services/NewsService.ts
// Crypto news via Cointelegraph RSS + CryptoCompare API + Python backend fallback

export interface CryptoNews {
  id: string;
  title: string;
  body: string;
  source: string;
  url: string;
  imageurl: string;
  published_on: number; // unix seconds
  categories: string;
}

export const NEWS_SECTIONS: Array<{ key: string; label: string; tag: string | null }> = [
  { key: 'trending',   label: 'Trending',   tag: null },
  { key: 'bitcoin',   label: 'Bitcoin',     tag: 'bitcoin' },
  { key: 'ethereum',  label: 'Ethereum',    tag: 'ethereum' },
  { key: 'altcoins',  label: 'Altcoins',    tag: 'altcoins' },
  { key: 'defi',      label: 'DeFi',        tag: 'defi' },
  { key: 'nft',       label: 'NFT',        tag: 'nft' },
  { key: 'trading',   label: 'Trading',     tag: 'trading' },
  { key: 'mining',    label: 'Mining',      tag: 'mining' },
  { key: 'regulation',label: 'Regulation',  tag: 'regulation' },
  { key: 'business',  label: 'Business',    tag: 'business' },
  { key: 'market',    label: 'Markets',     tag: 'markets' },
  { key: 'tech',      label: 'Technology',  tag: 'technology' },
];

const FALLBACK_NEWS: CryptoNews[] = [
  {
    id: 'news-1',
    title: 'Ethereum Layer 2 TVL Hits Record High as Gas Fees Drop 90%',
    body: 'Dencun upgrade and blob transactions have drastically lowered layer-2 rollup costs across Base, Arbitrum, and Polygon.',
    source: 'CoinDesk',
    url: 'https://ethereum.org',
    imageurl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600',
    published_on: Math.floor(Date.now() / 1000) - 1800,
    categories: 'ETH|DEFI',
  },
  {
    id: 'news-2',
    title: 'Bitcoin Hashrate Surpasses New Milestone Amid Global Mining Expansion',
    body: 'Institutional miners continue expanding energy-efficient infrastructure as network security reaches unprecedented levels.',
    source: 'Cointelegraph',
    url: 'https://bitcoin.org',
    imageurl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    published_on: Math.floor(Date.now() / 1000) - 3600,
    categories: 'BTC|MINING',
  },
  {
    id: 'news-3',
    title: 'Self-Custody and Non-Custodial Multi-Chain Wallets See Record Inflows',
    body: 'Users increasingly choose self-custodial key generation to eliminate centralized platform and exchange counterparty risks.',
    source: 'CryptoSlate',
    url: 'https://coindesk.com',
    imageurl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600',
    published_on: Math.floor(Date.now() / 1000) - 7200,
    categories: 'ALL|SECURITY',
  },
];

function extractField(xml: string, tag: string): string | null {
  if (!xml) return null;
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

function stripCData(s?: string | null): string {
  if (!s) return '';
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function decodeXml(s?: string | null): string {
  if (!s) return '';
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractImage(itemXml: string): string {
  if (!itemXml) return '';
  const mc = itemXml.match(/<media:content[^>]*url="([^"]+)"/i);
  if (mc) return mc[1];
  const enc = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i);
  if (enc) return enc[1];
  const imgUrl = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (imgUrl) return imgUrl[1];
  return '';
}

function parseRss(xml: string): CryptoNews[] {
  if (!xml) return [];
  const items = xml.split(/<item>/i).slice(1);
  const out: CryptoNews[] = [];
  for (let i = 0; i < items.length; i++) {
    const raw = items[i].split(/<\/item>/i)[0];
    const title = extractField(raw, 'title');
    const link = extractField(raw, 'link');
    const pubDate = extractField(raw, 'pubDate');
    const descRaw = extractField(raw, 'description') || '';
    const body = stripCData(descRaw)
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 240);

    if (!title || !link) continue;
    out.push({
      id: `${link}`.toLowerCase(),
      title: decodeXml(stripCData(title)),
      body,
      source: 'Cointelegraph',
      url: stripCData(link),
      imageurl: extractImage(raw),
      published_on: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0,
      categories: '',
    });
  }
  return out;
}

export class NewsService {
  static async getLatestNews(_limit: number = 30): Promise<CryptoNews[]> {
    try {
      const res = await Promise.race([
        fetch('https://cointelegraph.com/rss'),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3500)),
      ]);
      if (res.ok) {
        const xml = await res.text();
        const parsed = parseRss(xml);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }

    try {
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      if (res.ok) {
        const data = await res.json();
        const articles = data.Data || [];
        return articles.map((a: any) => ({
          id: String(a.id),
          title: a.title,
          body: a.body?.slice(0, 240) || '',
          source: a.source_info?.name || 'CryptoCompare',
          url: a.url,
          imageurl: a.imageurl || '',
          published_on: a.published_on || Math.floor(Date.now() / 1000),
          categories: a.categories || '',
        }));
      }
    } catch {
      // Fallback
    }

    return FALLBACK_NEWS;
  }

  static async getNewsForSection(sectionKey: string, _limit: number = 30): Promise<CryptoNews[]> {
    const sec = NEWS_SECTIONS.find(s => s.key === sectionKey);
    const url = sec?.tag
      ? `https://cointelegraph.com/rss/tag/${sec.tag}`
      : 'https://cointelegraph.com/rss';

    try {
      const res = await Promise.race([
        fetch(url),
        new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3500)),
      ]);
      if (res.ok) {
        const xml = await res.text();
        const parsed = parseRss(xml);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }

    return this.getLatestNews();
  }
}
