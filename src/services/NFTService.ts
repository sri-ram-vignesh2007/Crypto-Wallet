// src/services/NFTService.ts
// NFT Agent — monitors NFT collections, floor prices, traits, portfolio value
// Uses OpenSea/Reservoir APIs in production; heuristic here for demo.

export interface PortfolioStats {
  totalAssets: number;
  totalFloorValueUsd: number;
  totalFloorValueEth: number;
  collectionsCount: number;
  topCollection: string;
  pnlEstimateUsd: number;
}

export interface NFTAsset {
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string;
  collectionName: string;
  collectionSlug: string;
  floorPriceEth: number;
  floorPriceUsd: number;
  lastSalePriceEth?: number;
  lastSalePriceUsd?: number;
  traits: Array<{ trait_type: string; value: string; rarity: number }>;
  ownedSince: number;
}

export interface NFTCollectionSummary {
  slug: string;
  name: string;
  assetCount: number;
  totalFloorValueEth: number;
  totalFloorValueUsd: number;
  floorPriceChange24h: number;
  volume24hEth: number;
  avgPriceEth: number;
}

export interface NFTAlert {
  id: string;
  type: 'floor_drop' | 'floor_rise' | 'new_offer' | 'sale' | 'listing';
  collectionSlug: string;
  tokenId?: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warn' | 'critical';
}

export class NFTService {
  private static readonly MOCK_COLLECTIONS = [
    { slug: 'boredapeyachtclub', name: 'Bored Ape Yacht Club', floorEth: 12.5, floorUsd: 43750, change24h: -2.3 },
    { slug: 'mutant-ape-yacht-club', name: 'Mutant Ape Yacht Club', floorEth: 2.8, floorUsd: 9800, change24h: 1.5 },
    { slug: 'azuki', name: 'Azuki', floorEth: 4.2, floorUsd: 14700, change24h: -0.8 },
    { slug: 'pudgypenguins', name: 'Pudgy Penguins', floorEth: 8.1, floorUsd: 28350, change24h: 5.2 },
    { slug: 'doodles', name: 'Doodles', floorEth: 3.5, floorUsd: 12250, change24h: -1.1 },
  ];

  /** Get NFTs owned by an address (heuristic — production uses Alchemy/OpenSea API) */
  static async getOwnedNFTs(address: string, chainKey: string = 'ethereum'): Promise<NFTAsset[]> {
    // In production: call Alchemy getNFTs or OpenSea API
    // For demo, return mock data if address matches pattern
    if (!address || address === '0x0') return [];
    
    // Deterministic mock based on address
    const seed = address.slice(-4);
    const count = Math.max(1, parseInt(seed, 16) % 5);
    const selected = this.MOCK_COLLECTIONS.slice(0, count);
    
    return selected.map((c, i) => ({
      contractAddress: `0x${(i + 1).toString(16).padStart(40, '0')}`,
      tokenId: `${1000 + i * 7}`,
      name: `${c.name} #${1000 + i * 7}`,
      image: `https://example.com/nft/${c.slug}/${1000 + i * 7}.png`,
      collectionName: c.name,
      collectionSlug: c.slug,
      floorPriceEth: c.floorEth,
      floorPriceUsd: c.floorUsd,
      lastSalePriceEth: c.floorEth * (0.95 + Math.random() * 0.1),
      lastSalePriceUsd: c.floorUsd * (0.95 + Math.random() * 0.1),
      traits: [
        { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Yellow'][i % 4], rarity: 0.25 },
        { trait_type: 'Eyes', value: ['Laser', 'Normal', 'Closed', 'Wink'][i % 4], rarity: 0.15 },
        { trait_type: 'Mouth', value: ['Grin', 'Frown', 'Open', 'Tongue'][i % 4], rarity: 0.30 },
      ],
      ownedSince: Date.now() - (30 + i * 10) * 86400000,
    }));
  }

  /** Get collection summaries for owned NFTs */
  static async getCollectionSummaries(assets: NFTAsset[]): Promise<NFTCollectionSummary[]> {
    const byCollection = new Map<string, NFTAsset[]>();
    assets.forEach(a => {
      const arr = byCollection.get(a.collectionSlug) || [];
      arr.push(a);
      byCollection.set(a.collectionSlug, arr);
    });

    return Array.from(byCollection.entries()).map(([slug, items]) => {
      const mock = this.MOCK_COLLECTIONS.find(m => m.slug === slug) || { 
        name: slug, floorEth: 0, floorUsd: 0, change24h: 0 
      };
      return {
        slug,
        name: mock.name,
        assetCount: items.length,
        totalFloorValueEth: items.length * mock.floorEth,
        totalFloorValueUsd: items.length * mock.floorUsd,
        floorPriceChange24h: mock.change24h,
        volume24hEth: mock.floorEth * 50 * (0.5 + Math.random()),
        avgPriceEth: mock.floorEth * (1 + Math.random() * 0.2),
      };
    });
  }

  /** Check for floor price alerts */
  static async checkAlerts(address: string, thresholdPct: number = 20): Promise<NFTAlert[]> {
    const assets = await this.getOwnedNFTs(address);
    const alerts: NFTAlert[] = [];
    
    for (const asset of assets) {
      const mock = this.MOCK_COLLECTIONS.find(m => m.slug === asset.collectionSlug);
      if (!mock) continue;
      
      if (Math.abs(mock.change24h) >= thresholdPct) {
        alerts.push({
          id: `alert-${asset.collectionSlug}-${Date.now()}`,
          type: mock.change24h < 0 ? 'floor_drop' : 'floor_rise',
          collectionSlug: asset.collectionSlug,
          tokenId: asset.tokenId,
          message: `${asset.collectionName} floor ${mock.change24h < 0 ? 'dropped' : 'rose'} ${Math.abs(mock.change24h).toFixed(1)}% in 24h (${mock.floorEth} ETH)`,
          timestamp: Date.now(),
          severity: Math.abs(mock.change24h) > 30 ? 'critical' : 'warn',
        });
      }
    }
    
    return alerts;
  }

  /** Get portfolio-level NFT stats */
  static async getPortfolioStats(address: string): Promise<PortfolioStats> {
    const assets = await this.getOwnedNFTs(address);
    const summaries = await this.getCollectionSummaries(assets);
    
    const totalFloorValueUsd = summaries.reduce((s, c) => s + c.totalFloorValueUsd, 0);
    const totalFloorValueEth = summaries.reduce((s, c) => s + c.totalFloorValueEth, 0);
    const topCollection = summaries.sort((a, b) => b.totalFloorValueUsd - a.totalFloorValueUsd)[0]?.name || '—';
    
    // Rough PnL estimate: assume avg buy at 80% of current floor
    const pnlEstimateUsd = totalFloorValueUsd * 0.25;
    
    return {
      totalAssets: assets.length,
      totalFloorValueUsd,
      totalFloorValueEth,
      collectionsCount: summaries.length,
      topCollection,
      pnlEstimateUsd,
    };
  }
}