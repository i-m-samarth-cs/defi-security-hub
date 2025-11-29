from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class TransactionData(BaseModel):
    txHash: str
    from_address: str = None
    to: str = None
    originDomain: str = None
    approvalFlag: bool = False
    approvalAmount: str = None
    tokenSymbol: str = None
    recentTxCountForRecipient: int = 0
    codeSimilarityScore: float = 0.0

@app.post("/score")
async def score_transaction(data: TransactionData):
    score = 0.0
    reasons = []
    evidence = []
    
    # Infinite approval check
    if data.approvalFlag and data.approvalAmount == "infinite":
        score += 0.3
        reasons.append("Infinite token approval detected")
        evidence.append(f"tx:{data.txHash} contains unlimited approval")
    
    # Domain mismatch
    known_domains = {"uniswap.org", "aave.com", "compound.finance"}
    if data.originDomain and data.originDomain not in known_domains:
        score += 0.2
        reasons.append(f"Unknown domain: {data.originDomain}")
    
    # New contract
    if data.recentTxCountForRecipient < 10:
        score += 0.2
        reasons.append("Recipient contract has very few transactions")
        evidence.append(f"Contract {data.to} has only {data.recentTxCountForRecipient} txs")
    
    # Code similarity to known scams
    if data.codeSimilarityScore > 0.7:
        score += 0.3
        reasons.append("Contract code similar to known scam patterns")
        evidence.append(f"Similarity score: {data.codeSimilarityScore}")
    
    score = min(score, 1.0)
    
    if score >= 0.8:
        recommended_action = "block"
    elif score >= 0.5:
        recommended_action = "warn"
    else:
        recommended_action = "allow"
    
    return {
        "score": round(score, 2),
        "reasons": reasons[:5],
        "evidence": evidence,
        "recommended_action": recommended_action
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
