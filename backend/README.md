# CryptoVaultAI Python FastAPI Backend

High-performance Python backend for the CryptoVaultAI multi-chain self-custodial mobile wallet.

## Features

- **AI Engine (`/api/ai`)**: Real-time SSE streaming Web3 AI assistant, smart contract code safety auditor, and gas trend analysis.
- **Web3.py RPC Manager (`/api/wallet`)**: Free multi-chain RPC connectivity across Ethereum, BSC, Polygon, Base, and Arbitrum. Live EIP-1559 gas fee estimation and balance checks.
- **Market Intelligence (`/api/market`)**: Real-time token pricing, 24h market trends, and categorized crypto news feeds.
- **DEX Swap Router (`/api/swap`)**: Optimal routing quote generation, price impact calculations, and slippage tolerance.

## Getting Started

### 1. Install Requirements
```bash
pip install -r backend/requirements.txt
```

### 2. Run the Server
```bash
# Windows 1-click:
backend\run.bat

# Or manually:
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Interactive API Documentation
Once running, open your browser:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
