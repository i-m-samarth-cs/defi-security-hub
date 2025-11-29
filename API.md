# API Documentation

## Backend Endpoints

### Detection

**POST /api/detect**
Score a transaction for phishing risk.

Request:
```json
{
  "txHash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "originDomain": "example.com",
  "approvalFlag": true,
  "approvalAmount": "infinite",
  "recentTxCountForRecipient": 5
}
```

Response:
```json
{
  "score": 0.85,
  "reasons": ["Infinite approval detected", "Unknown domain"],
  "recommended_action": "block"
}
```

### Incidents

**POST /api/incident/:id/report**
Create an incident with IPFS evidence.

Request:
```json
{
  "txHash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "originDomain": "scam.com",
  "score": 0.92,
  "screenshot": "base64..."
}
```

Response:
```json
{
  "incidentId": "uuid",
  "cid": "QmAbc123..."
}
```

**POST /api/incident/:id/freeze**
Reserve on-chain claim.

Response:
```json
{
  "claimId": 1,
  "txHash": "0x..."
}
```

**POST /api/incident/:id/payout**
Process emergency payout.

Request:
```json
{
  "amount": "0.05"
}
```

**POST /api/incident/:id/takedown**
Initiate automated takedown.

Response:
```json
{
  "message": "Takedown initiated",
  "incidentId": "uuid"
}
```

## Smart Contract Functions

### InsurancePool

**reserveClaim(address claimant, bytes32 evidenceCID, uint256 amount)**
- Role: ORACLE_ROLE
- Reserves funds for a claim
- Emits: ClaimReserved

**emergencyPayout(uint256 claimId, uint256 amount)**
- Role: ORACLE_ROLE
- Immediate payout from emergency pool
- Max: 0.1 ETH
- Emits: EmergencyPayout

**finalizeClaim(uint256 claimId, bool approved, uint256 finalAmount)**
- Role: UNDERWRITER_ROLE
- Approves or rejects claim
- Releases final payout
- Emits: ClaimFinalized

**depositToPool()**
- Payable function to add funds to main pool

**depositToEmergencyPool()**
- Payable function to add funds to emergency pool
