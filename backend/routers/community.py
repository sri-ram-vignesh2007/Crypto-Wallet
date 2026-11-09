# backend/routers/community.py
# Institutional Organization Broadcasts & Zero-Knowledge Inquiries Router

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import List, Optional
import time
import uuid

router = APIRouter(prefix="/community", tags=["Community & Live Desk"])

# Models
class OfficialReply(BaseModel):
    repliedBy: str
    replyText: str
    timestamp: str

class UserInquiry(BaseModel):
    id: str
    broadcastId: str
    userAnonToken: str  # Zero-knowledge inquiry token (e.g. INQ-98124)
    questionText: str
    timestamp: str
    officialReply: Optional[OfficialReply] = None

class LiveDispatch(BaseModel):
    id: str
    orgName: str
    orgHandle: str
    orgLogoInitial: str
    orgCategory: str
    isVerified: bool = True
    timeAgo: str
    title: str
    content: str
    tags: List[str]
    viewCount: int = 1
    inquiries: List[UserInquiry] = []

class CreateDispatchRequest(BaseModel):
    orgName: str
    orgCategory: str
    title: str
    content: str
    tags: List[str] = []

class CreateInquiryRequest(BaseModel):
    broadcastId: str
    questionText: str

class ReplyInquiryRequest(BaseModel):
    repliedBy: str
    replyText: str

# In-memory storage with institutional seed data
INITIAL_DISPATCHES = [
    {
        "id": "broadcast-1",
        "orgName": "Enterprise Desk",
        "orgHandle": "@enterprise_desk",
        "orgLogoInitial": "E",
        "orgCategory": "Business",
        "isVerified": True,
        "timeAgo": "12m ago",
        "title": "Fortune 500 Enterprise Treasury Operations Automate Instant On-Chain Payroll",
        "content": "Enterprise Desk has integrated zero-slippage B2B settlements for multinational enterprise treasuries. Autonomous payroll smart vaults now execute multi-currency settlements with sub-cent transaction overhead.",
        "tags": ["$USDC", "Enterprise", "Payroll", "Treasury"],
        "viewCount": 46210,
        "inquiries": [],
    },
    {
        "id": "broadcast-2",
        "orgName": "Crypto & Bitcoin Desk",
        "orgHandle": "@crypto_desk",
        "orgLogoInitial": "B",
        "orgCategory": "Crypto",
        "isVerified": True,
        "timeAgo": "35m ago",
        "title": "Bitcoin Institutional Accumulation Accelerates: Weekly Net Inflows Cross $1.8B",
        "content": "Sovereign Desk models indicate aggressive institutional custody accumulation above $68,000. Mining hash rate difficulty reached new all-time highs as sovereign allocation desks expand multi-year reserves.",
        "tags": ["$BTC", "Bitcoin", "Macro", "Reserves"],
        "viewCount": 52180,
        "inquiries": [],
    },
    {
        "id": "broadcast-3",
        "orgName": "DeFi Engine Desk",
        "orgHandle": "@defi_desk",
        "orgLogoInitial": "D",
        "orgCategory": "DeFi",
        "isVerified": True,
        "timeAgo": "50m ago",
        "title": "Automated Concentrated Liquidity Rebalancing Captures 42% Fee Compression",
        "content": "DeFi Engine telemetry reports record liquidity efficiency across top AMM pools. Dynamic rebalancing algorithms minimized impermanent loss for high-volume trading pairs.",
        "tags": ["$ETH", "DeFi", "Liquidity", "Yield"],
        "viewCount": 38450,
        "inquiries": [],
    },
]

dispatches_db: List[dict] = list(INITIAL_DISPATCHES)

@router.get("/dispatches", response_model=List[LiveDispatch])
async def list_dispatches():
    """Public endpoint for mobile wallet to read verified dispatches"""
    return dispatches_db

@router.post("/dispatches", response_model=LiveDispatch)
async def create_dispatch(request: CreateDispatchRequest):
    """Admin / Organization Portal endpoint to publish live announcements"""
    if not request.title.strip() or not request.content.strip():
        raise HTTPException(status_code=400, detail="Headline and content cannot be empty")
        
    handle_clean = request.orgName.lower().replace(" ", "_").replace("&", "").strip()
    new_dispatch = {
        "id": f"dispatch-{int(time.time() * 1000)}",
        "orgName": request.orgName.strip(),
        "orgHandle": f"@{handle_clean}",
        "orgLogoInitial": request.orgName.strip()[0].upper(),
        "orgCategory": request.orgCategory,
        "isVerified": True,
        "timeAgo": "Just now",
        "title": request.title.strip(),
        "content": request.content.strip(),
        "tags": request.tags if request.tags else ["Verified", request.orgCategory],
        "viewCount": 1,
        "inquiries": [],
    }
    
    dispatches_db.insert(0, new_dispatch)
    return new_dispatch

@router.delete("/dispatches/{dispatch_id}")
async def delete_dispatch(dispatch_id: str):
    """Admin endpoint to remove a dispatch"""
    global dispatches_db
    dispatches_db = [d for d in dispatches_db if d["id"] != dispatch_id]
    return {"status": "success", "deleted_id": dispatch_id}

@router.post("/inquiries", response_model=UserInquiry)
async def submit_anonymous_inquiry(request: CreateInquiryRequest):
    """Anonymous user questions endpoint (Zero-Knowledge: user profile completely hidden)"""
    target = next((d for d in dispatches_db if d["id"] == request.broadcastId), None)
    if not target:
        raise HTTPException(status_code=404, detail="Dispatch not found")
        
    # Auto-assign zero-knowledge anonymous token
    anon_token = f"INQ-{uuid.uuid4().hex[:6].upper()}"
    new_inquiry = {
        "id": f"inq-{int(time.time() * 1000)}",
        "broadcastId": request.broadcastId,
        "userAnonToken": anon_token,
        "questionText": request.questionText.strip(),
        "timestamp": "Just now",
        "officialReply": None,
    }
    
    target["inquiries"].insert(0, new_inquiry)
    return new_inquiry

@router.post("/inquiries/{inquiry_id}/reply")
async def reply_to_inquiry(inquiry_id: str, request: ReplyInquiryRequest):
    """Organization Desk endpoint to reply to an inquiry"""
    for dispatch in dispatches_db:
        for inq in dispatch.get("inquiries", []):
            if inq["id"] == inquiry_id:
                inq["officialReply"] = {
                    "repliedBy": request.repliedBy,
                    "replyText": request.replyText,
                    "timestamp": "Just now",
                }
                return inq
    raise HTTPException(status_code=404, detail="Inquiry not found")

