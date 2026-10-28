# backend/routers/swap.py
# Decentralized Exchange (DEX) swap quotation & routing engine

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/swap", tags=["DEX Swap Engine"])

class QuoteRequest(BaseModel):
    from_token: str
    to_token: str
    amount_in: float
    chain: str = "ethereum"
    slippage_percent: float = 0.5

# Reference prices for instant quotation
PRICES = {
    "ETH": 3500.0,
    "USDC": 1.0,
    "USDT": 1.0,
    "WBTC": 72000.0,
    "SOL": 160.0,
    "BNB": 600.0,
    "POL": 0.70,
}

@router.post("/quote")
async def get_swap_quote(req: QuoteRequest):
    """Calculate best route DEX swap quote with price impact & slippage"""
    if req.amount_in <= 0:
        raise HTTPException(status_code=400, detail="amount_in must be greater than 0")

    from_sym = req.from_token.upper()
    to_sym = req.to_token.upper()

    from_price = PRICES.get(from_sym, 1.0)
    to_price = PRICES.get(to_sym, 1.0)

    # Dollar value of input
    fiat_value = req.amount_in * from_price
    # Output token amount
    amount_out = fiat_value / to_price
    # Minimum received after slippage
    min_received = amount_out * (1 - (req.slippage_percent / 100))
    # Simulated price impact (smaller for liquid pairs)
    price_impact = round(min(req.amount_in * 0.0001, 0.45), 3)

    return {
        "from_token": from_sym,
        "to_token": to_sym,
        "amount_in": req.amount_in,
        "amount_out": round(amount_out, 6),
        "minimum_received": round(min_received, 6),
        "exchange_rate": round(from_price / to_price, 6),
        "price_impact_percent": price_impact,
        "slippage_percent": req.slippage_percent,
        "estimated_gas_usd": 0.42 if req.chain != "ethereum" else 3.50,
        "route": f"Uniswap v3 ({req.chain.capitalize()})",
    }
