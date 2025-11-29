# Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.9+
- Hardhat
- Supabase account
- IPFS node (or use Infura/Pinata)

## 1. Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

## 2. Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run start:dev
```

## 4. ML Service

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

## 5. Web App

```bash
cd webapp
npm install
npm run dev
```

Access at http://localhost:3001

## 6. Browser Extension

1. Open Chrome/Brave
2. Go to chrome://extensions
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the `extension/` folder

## Testing the Flow

1. Install the extension
2. Visit a DeFi site (or test page)
3. Trigger a transaction
4. Extension will intercept and show warning if suspicious
5. Click "Report & Freeze Insurance"
6. Check webapp for claim status
