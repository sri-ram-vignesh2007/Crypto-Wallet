# backend/main.py
# FastAPI Root Application for CryptoVaultAI

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import ai, wallet, market, swap

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance Python Web3 & AI Backend for CryptoVaultAI mobile wallet.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local and mobile app connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(wallet.router, prefix=settings.API_PREFIX)
app.include_router(market.router, prefix=settings.API_PREFIX)
app.include_router(swap.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health Check"])
async def root_health_check():
    """Root health check and server status"""
    return {
        "app": settings.PROJECT_NAME,
        "status": "healthy",
        "version": settings.VERSION,
        "supported_chains": list(settings.RPC_ENDPOINTS.keys()),
        "endpoints": {
            "docs": "/docs",
            "ai_chat": "/api/ai/chat",
            "ai_stream": "/api/ai/chat/stream",
            "gas_price": "/api/wallet/gas-price",
            "balance": "/api/wallet/balance",
            "market_prices": "/api/market/prices",
            "news": "/api/market/news",
            "swap_quote": "/api/swap/quote",
        },
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
