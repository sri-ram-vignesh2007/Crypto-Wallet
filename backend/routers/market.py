# backend/routers/market.py
# Real-time token pricing, market trends, and crypto news aggregator

from typing import Optional
from fastapi import APIRouter, Query
import httpx

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("/prices")
async def get_live_token_prices(
    vs_currency: str = Query("usd", description="Target fiat currency (usd, eur)"),
    tokens: str = Query("ethereum,bitcoin,solana,binancecoin,matic-network", description="Comma separated coin IDs")
):
    """Fetch live market prices and 24h changes from CoinGecko public API"""
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={tokens}&vs_currencies={vs_currency}&include_24hr_change=true"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                return {"status": "success", "data": res.json()}
    except Exception:
        pass

    # Reliable fallback prices
    return {
        "status": "fallback",
        "data": {
            "ethereum": {"usd": 3500.0, "usd_24h_change": 3.42},
            "bitcoin": {"usd": 72000.0, "usd_24h_change": 1.85},
            "solana": {"usd": 160.0, "usd_24h_change": 5.74},
            "binancecoin": {"usd": 600.0, "usd_24h_change": -0.65},
            "matic-network": {"usd": 0.70, "usd_24h_change": 2.10},
        }
    }

@router.get("/news")
async def get_crypto_news(
    category: str = Query("ALL", description="News category: ALL, BTC, ETH, DEFI, AI, NFT")
):
    """Aggregate live crypto news headlines from CryptoCompare public API"""
    cat_param = f"&categories={category}" if category and category != "ALL" else ""
    url = f"https://min-api.cryptocompare.com/data/v2/news/?lang=EN{cat_param}"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                raw_articles = data.get("Data", [])
                formatted = [
                    {
                        "id": str(a.get("id")),
                        "title": a.get("title", ""),
                        "url": a.get("url", ""),
                        "imageurl": a.get("imageurl", ""),
                        "body": a.get("body", ""),
                        "source": a.get("source_info", {}).get("name", "CryptoNews"),
                        "published_on": a.get("published_on", 0),
                        "categories": a.get("categories", ""),
                    }
                    for a in raw_articles[:20]
                ]
                return {"status": "success", "articles": formatted}
    except Exception:
        pass

    # High quality fallback news
    return {
        "status": "fallback",
        "articles": [
            {
                "id": "1",
                "title": "Ethereum Layer 2 TVL Hits Record High as Gas Fees Drop 90%",
                "url": "https://ethereum.org",
                "imageurl": "",
                "body": "Dencun upgrade and blob transactions have drastically lowered layer-2 rollup costs across Base and Arbitrum.",
                "source": "CoinDesk",
                "published_on": 1724800000,
                "categories": "ETH|DEFI",
            },
            {
                "id": "2",
                "title": "Institutional Adoption of Non-Custodial Multi-Chain Wallets Accelerates",
                "url": "https://coindesk.com",
                "imageurl": "",
                "body": "Security experts emphasize the necessity of self-custody and local key generation to prevent centralized platform risks.",
                "source": "CryptoSlate",
                "published_on": 1724780000,
                "categories": "ALL|SECURITY",
            }
        ]
    }
