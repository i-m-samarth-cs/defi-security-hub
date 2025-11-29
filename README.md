# DeFi Security Suite

Real-time phishing detection with on-chain insurance, emergency payouts, and automated takedown orchestration.

## Architecture

- **Browser Extension**: Real-time transaction monitoring with instant heuristics
- **Backend (Node/NestJS)**: ML scoring, IPFS evidence storage, oracle coordination
- **Smart Contracts (Hardhat)**: Insurance pool, escrow reservations, payouts
- **Database (Supabase)**: Incidents, claims, takedowns, user data
- **Web App (Next.js)**: Dashboard, claim tracking, admin panel

## Quick Start

### 1. Smart Contracts (Deploy First!)
```bash
cd contracts
npm install
npm run setup:local  # For local testing
# OR
npm run setup:complete  # For Sepolia testnet (requires .env setup)
```

**Result:**
```
✅ InsurancePool deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Copy this address to `backend/.env` as `INSURANCE_POOL_ADDRESS`

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with contract address and credentials
npm run start:dev
```

### Extension
```bash
cd extension
npm install
npm run build
# Load unpacked extension from extension/dist
```

### Web App
```bash
cd webapp
npm install
npm run dev
```

## Core Features

1. Real-time phishing detection (extension + ML backend)
2. IPFS evidence bundling
3. On-chain escrow reservation
4. Emergency micro-payouts
5. Automated takedown requests
6. Claim lifecycle management
