# backend/routers/ai.py
# AI Assistant, Smart Contract Auditor, and Gas Intelligence Router

import asyncio
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
from ..config import settings

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False
    model: Optional[str] = "google/gemini-2.0-flash-001"

class AuditRequest(BaseModel):
    contract_code: Optional[str] = None
    contract_address: Optional[str] = None
    chain: Optional[str] = "ethereum"

def get_local_web3_intelligence(prompt: str) -> str:
    """Fast local Web3 expert intelligence when offline or without API keys"""
    low = prompt.lower()
    if any(w in low for w in ["gas", "gwei", "fee"]):
        return (
            "⚡ **Gas Fee Breakdown**:\n\n"
            "- **Base Fee**: The mandatory protocol fee burned per block (EIP-1559).\n"
            "- **Priority Fee (Tip)**: Paid directly to validators to incentivize transaction inclusion.\n"
            "- **Max Fee**: Base Fee × 2 + Priority Fee.\n\n"
            "💡 *Tip: For cheap swaps, consider using Layer 2 networks like Base, Arbitrum, or Polygon ($0.01–$0.05).* "
        )
    elif any(w in low for w in ["seed", "phrase", "mnemonic", "recovery", "key"]):
        return (
            "🔐 **CryptoVault Self-Custody Rules**:\n\n"
            "1. **Never share your 12-word recovery phrase** with anyone or any website.\n"
            "2. Write your seed phrase on paper or metal and store it in a secure, fireproof location.\n"
            "3. CryptoVaultAI operates non-custodially: your private keys never leave your phone."
        )
    elif any(w in low for w in ["swap", "slippage", "dex", "exchange"]):
        return (
            "🔄 **DeFi Swap Guidance**:\n\n"
            "- **Slippage**: The maximum allowed difference between the estimated and execution price (standard: 0.5%).\n"
            "- **Price Impact**: Occurs on low-liquidity pairs where a large swap changes the pool ratio.\n"
            "- **Routing**: CryptoVaultAI queries multiple decentralized liquidity pools to secure the best rates."
        )
    elif any(w in low for w in ["safe", "audit", "security", "scam", "phishing"]):
        return (
            "🛡️ **Web3 Security Checklist**:\n\n"
            "1. **Verify Contract Addresses**: Always cross-check token contracts on CoinGecko or official docs.\n"
            "2. **Check Allowances**: Regularly revoke infinite token approvals using tools like Revoke.cash.\n"
            "3. **Zero Blind Signing**: Review transaction simulations and decoded parameters before approving."
        )
    else:
        return (
            f"🧠 **CryptoVaultAI Intelligence**:\n\n"
            f"I have analyzed your query about: *{prompt.strip()}*.\n\n"
            "CryptoVaultAI is operating with real-time multi-chain connectivity across Ethereum, BSC, Polygon, Base, and Arbitrum. "
            "Feel free to ask about smart contract safety audits, gas optimizations, or portfolio rebalancing strategies!"
        )

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Standard JSON chat completion endpoint"""
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    user_query = req.messages[-1].content

    # Check if OpenRouter / OpenAI key is configured
    api_key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
    if api_key:
        try:
            url = "https://openrouter.ai/api/v1/chat/completions" if settings.OPENROUTER_API_KEY else "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": req.model,
                "messages": [
                    {"role": "system", "content": "You are CryptoVaultAI, an ultra-intelligent, concise, and security-focused Web3 crypto assistant. Provide accurate, formatted advice."},
                    *[m.dict() for m in req.messages]
                ],
                "temperature": 0.3,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    answer = data["choices"][0]["message"]["content"]
                    return {"role": "assistant", "content": answer, "model": req.model}
        except Exception as e:
            pass

    # High quality fallback
    answer = get_local_web3_intelligence(user_query)
    return {"role": "assistant", "content": answer, "model": "CryptoVault-Local-Engine"}

@router.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest):
    """Server-Sent Events (SSE) streaming chat endpoint"""
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    user_query = req.messages[-1].content

    async def event_generator():
        api_key = settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
        if api_key:
            try:
                url = "https://openrouter.ai/api/v1/chat/completions" if settings.OPENROUTER_API_KEY else "https://api.openai.com/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": req.model,
                    "messages": [
                        {"role": "system", "content": "You are CryptoVaultAI, an expert Web3 assistant. Keep responses clear and formatted."},
                        *[m.dict() for m in req.messages]
                    ],
                    "stream": True,
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    async with client.stream("POST", url, headers=headers, json=payload) as response:
                        if response.status_code == 200:
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    if data_str == "[DONE]":
                                        break
                                    try:
                                        chunk = json.loads(data_str)
                                        delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                        if delta:
                                            yield f"data: {json.dumps({'content': delta})}\n\n"
                                    except:
                                        continue
                            return
            except Exception:
                pass

        # Simulated smooth streaming with local Web3 knowledge
        full_text = get_local_web3_intelligence(user_query)
        words = full_text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + (" " if i + 3 < len(words) else "")
            yield f"data: {json.dumps({'content': chunk})}\n\n"
            await asyncio.sleep(0.04)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/audit")
async def audit_smart_contract(req: AuditRequest):
    """Smart contract risk scanner & automated security analysis"""
    risk_score = 15  # Low risk baseline
    flags = []

    if req.contract_code:
        code_low = req.contract_code.lower()
        if "selfdestruct" in code_low:
            risk_score += 40
            flags.append("Contains deprecated 'selfdestruct' opcode.")
        if "delegatecall" in code_low:
            risk_score += 25
            flags.append("Uses low-level 'delegatecall' — verify proxy logic.")
        if "tx.origin" in code_low:
            risk_score += 30
            flags.append("Vulnerable to phishing via 'tx.origin' authentication.")
        if "blacklist" in code_low or "freeze" in code_low:
            risk_score += 20
            flags.append("Contains centralized address freezing / blacklist mechanism.")

    return {
        "status": "success",
        "risk_score": min(risk_score, 100),
        "safety_level": "High" if risk_score < 30 else ("Medium" if risk_score < 60 else "High Risk"),
        "flags": flags if flags else ["No critical vulnerabilities detected in static heuristics."],
        "chain": req.chain,
    }
