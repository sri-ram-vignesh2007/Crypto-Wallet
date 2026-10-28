# backend/config.py
# Multi-Chain RPC configuration and environment settings

import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "CryptoVaultAI Backend"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # AI OpenRouter / OpenAI Key (Optional)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Free Public Multi-Chain RPC Endpoints
    RPC_ENDPOINTS: dict = {
        "ethereum": [
            "https://cloudflare-eth.com",
            "https://eth.llamarpc.com",
            "https://rpc.ankr.com/eth",
            "https://1rpc.io/eth",
        ],
        "polygon": [
            "https://polygon-rpc.com",
            "https://polygon.llamarpc.com",
            "https://rpc.ankr.com/polygon",
        ],
        "bsc": [
            "https://binance.llamarpc.com",
            "https://bsc-dataseed.binance.org",
            "https://rpc.ankr.com/bsc",
        ],
        "base": [
            "https://mainnet.base.org",
            "https://base.llamarpc.com",
            "https://1rpc.io/base",
        ],
        "arbitrum": [
            "https://arb1.arbitrum.io/rpc",
            "https://arbitrum.llamarpc.com",
            "https://1rpc.io/arb",
        ],
        "avalanche": [
            "https://api.avax.network/ext/bc/C/rpc",
            "https://avalanche.public-rpc.com",
        ],
        "sepolia": [
            "https://rpc.sepolia.org",
            "https://eth-sepolia.public.blastapi.io",
        ],
    }
    
    CHAIN_IDS: dict = {
        "ethereum": 1,
        "polygon": 137,
        "bsc": 56,
        "base": 8453,
        "arbitrum": 42161,
        "avalanche": 43114,
        "sepolia": 11155111,
    }

settings = Settings()
