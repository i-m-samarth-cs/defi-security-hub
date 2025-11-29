# ML Scoring Service

Simple FastAPI service for transaction risk scoring.

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Service runs on http://localhost:8000

## Test

```bash
curl -X POST http://localhost:8000/score \
  -H "Content-Type: application/json" \
  -d '{
    "txHash": "0x123",
    "originDomain": "suspicious-site.com",
    "approvalFlag": true,
    "approvalAmount": "infinite",
    "recentTxCountForRecipient": 5
  }'
```
