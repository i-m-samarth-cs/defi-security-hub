# Insurance Pool & Liquidity Provider System

## Overview

The Insurance Pool system allows liquidity providers (LPs) to deposit funds and earn fees while providing insurance coverage for DeFi users against phishing attacks and scams. The system includes emergency payouts, claim management, and underwriter review processes.

## Key Features

### 1. **Pool Overview** (`/pool`)
- View total insured TVL, available liquidity, and reserved amounts
- Monitor emergency pool balance and pending liabilities
- Track current APY and fee structure
- Deposit and withdraw funds
- View recent activity feed

### 2. **LP Vault** (`/vault`)
- Manage your LP position
- Track earned fees and pool share percentage
- View transaction history
- Request withdrawals (subject to cooldown)

### 3. **Claims & Incidents** (`/claims`)
- View your insurance claims
- Track claim timeline (Detected → Reserved → Emergency Paid → Review → Finalized)
- Request emergency payouts (up to 0.5 ETH instant)
- View evidence on IPFS

### 4. **Underwriter Dashboard** (`/underwriter`)
- Review pending claims queue
- Approve/deny emergency payouts
- Finalize claims with full payout
- Manage pool settings (caps, cooldown, fees)

## User Roles

### Liquidity Provider (LP)
- Deposits funds into the insurance pool
- Earns fees from premiums and yield
- Can withdraw funds (subject to cooldown period)
- Shares pool risk and rewards

### Insured User / Victim
- Reports phishing incidents
- Gets claim reserved on-chain automatically
- Can request emergency micro-payout (instant)
- Receives final payout after underwriter review

### Oracle/Relayer
- Trusted service that submits signed attestations
- Calls `reserveClaim()` on-chain
- Processes emergency payouts
- Bridges off-chain detection to on-chain actions

### Underwriter / Admin
- Reviews claims and evidence
- Approves/denies emergency payouts
- Finalizes claims with full settlement
- Manages pool parameters

## Smart Contract Functions

### LP Functions
```solidity
deposit() payable                    // Deposit ETH to earn fees
requestWithdraw(uint256 amount)      // Request withdrawal (cooldown applies)
withdraw()                           // Execute withdrawal after cooldown
```

### Claim Functions
```solidity
reserveClaim(address claimant, bytes32 incidentCid, uint256 claimCap)
    // Lock funds for a claim (relayer only)

emergencyPayout(uint256 claimId, address to, uint256 amount)
    // Instant micro-payout (underwriter only)

finalizeClaim(uint256 claimId, bool approved, uint256 payoutAmount)
    // Final settlement (underwriter only)
```

### Admin Functions
```solidity
replenishPool() payable              // Add funds to emergency pool
updateEmergencyCap(uint256 newCap)   // Change emergency payout cap
updateMaxReserve(uint256 newMax)     // Change max reserve per claim
updateCooldown(uint256 newCooldown)  // Change withdrawal cooldown
```

## Events

```solidity
event Deposit(address indexed lp, uint256 amount, uint256 shares)
event WithdrawRequested(address indexed lp, uint256 amount, uint256 availableAt)
event Withdraw(address indexed lp, uint256 amount)
event ClaimReserved(uint256 indexed claimId, address indexed claimant, bytes32 incidentCid, uint256 amount)
event EmergencyPayout(uint256 indexed claimId, address indexed to, uint256 amount)
event ClaimFinalized(uint256 indexed claimId, bool approved, uint256 payoutAmount)
event PoolReplenished(uint256 amount)
```

## End-to-End Flow

### 1. LP Deposits Funds
1. User connects wallet and navigates to `/pool`
2. Clicks "Deposit Funds" and enters amount
3. Signs `deposit()` transaction
4. Backend captures `Deposit` event
5. Updates `lp_positions` table in Supabase
6. Dashboard shows updated pool share

### 2. Incident Detection & Claim Reserve
1. Extension detects phishing attempt
2. Backend creates incident record and uploads evidence to IPFS
3. User clicks "Report & Freeze Insurance"
4. Backend prepares EIP-712 attestation
5. Relayer calls `reserveClaim()` on-chain
6. Contract emits `ClaimReserved` event
7. Dashboard shows claim status: "Reserved on-chain"

### 3. Emergency Payout Request
1. User navigates to `/claims` and views their claim
2. Clicks "Request Emergency Payout"
3. Backend validates eligibility:
   - Score >= threshold
   - Amount <= emergency cap
   - No recent payouts (rate limit)
4. Relayer calls `emergencyPayout()` on-chain
5. Funds transferred instantly to user's wallet
6. Dashboard shows "Emergency Paid: 0.5 ETH"

### 4. Underwriter Review & Finalization
1. Underwriter logs into `/underwriter` dashboard
2. Reviews pending claims queue
3. Examines evidence on IPFS
4. Decides to approve or reject
5. Calls `finalizeClaim()` with decision
6. Contract settles final payout or returns reserved funds
7. User receives notification

### 5. LP Withdrawal
1. LP navigates to `/vault`
2. Clicks "Request Withdrawal" and enters amount
3. Signs `requestWithdraw()` transaction
4. Cooldown period starts (7 days)
5. After cooldown, LP calls `withdraw()`
6. Funds transferred to LP's wallet

## Database Schema

### pools
```sql
id, name, total_deposits, reserved_amount, emergency_balance, 
available_liquidity, total_shares, apy, fee_percentage, 
emergency_cap_per_claim, max_reserve_per_claim, cooldown_period
```

### lp_positions
```sql
id, pool_id, lp_address, deposit_amount, pool_share, earned_fees, 
withdraw_pending, withdraw_requested_at
```

### claims
```sql
id, incident_id, claim_id, claimant, pool_id, reserved_amount, 
emergency_paid, final_payout, status, evidence_link, underwriter, 
reviewed_at, finalized_at
```

### audit_events
```sql
id, event_type, pool_id, claim_id, lp_address, amount, tx_hash, metadata
```

## API Endpoints

### Pool Management
- `GET /api/pool/overview` - Get pool metrics
- `GET /api/pool/activity` - Get recent activity feed
- `POST /api/pool/deposit` - Process LP deposit
- `POST /api/pool/withdraw` - Request withdrawal

### LP Position
- `GET /api/pool/lp/:address` - Get LP position details
- `GET /api/pool/lp/:address/transactions` - Get LP transaction history

### Claims Management
- `GET /api/pool/claims/pending` - Get pending claims (underwriter)
- `POST /api/pool/claims/:claimId/emergency-approve` - Approve emergency payout
- `POST /api/pool/claims/:claimId/finalize` - Finalize claim

### Settings
- `GET /api/pool/settings` - Get pool settings
- `PUT /api/pool/settings` - Update pool settings (admin)

## Security & Anti-Abuse

### Caps & Rate Limits
- Emergency payouts capped at 0.5 ETH (~$200)
- Max reserve per claim: 5 ETH
- Rate limit: 1 emergency payout per 30 days per wallet

### Fraud Prevention
- High-confidence score required for auto-payout
- Human escalation for large amounts
- Multi-sig for admin actions beyond threshold
- Timelock optional for large finalizations

### Smart Contract Security
- ReentrancyGuard on all fund transfers
- AccessControl for role-based permissions
- Checks-effects-interactions pattern
- Event logging for full audit trail

## Deployment

### 1. Deploy Smart Contract
```bash
cd contracts
npx hardhat run scripts/deploy-insurance-pool.js --network sepolia
```

### 2. Update Environment Variables
```bash
# Add to .env
INSURANCE_POOL_ADDRESS=0x...
```

### 3. Initialize Database
```bash
# Run schema updates
psql -f supabase/schema.sql
```

### 4. Start Backend
```bash
cd backend
npm run start:dev
```

### 5. Start Frontend
```bash
cd webapp
npm run dev
```

## Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Integration Tests
```bash
# Test full flow: deposit → reserve → emergency → finalize
npm run test:integration
```

### Frontend Tests
```bash
cd webapp
npm run test
```

## Monitoring & Analytics

### Key Metrics to Track
- Total Value Locked (TVL)
- Available Liquidity vs Reserved
- Emergency Pool Balance
- Number of Active LPs
- Average Claim Size
- Approval Rate
- Time to Finalization
- APY for LPs

### Alerts
- Low liquidity warnings
- Large withdrawal requests
- High-value claims
- Emergency pool depletion
- Unusual activity patterns

## Future Enhancements

1. **Multi-Asset Support** - USDC, DAI, other stablecoins
2. **Automated Yield Strategies** - Integrate with Aave, Compound
3. **Dynamic APY** - Based on utilization and risk
4. **Governance Token** - DAO for pool parameter decisions
5. **Insurance Tiers** - Different coverage levels and premiums
6. **Cross-Chain Support** - Deploy on multiple networks
7. **NFT Receipts** - LP position as tradeable NFT
8. **Reinsurance Layer** - Partner with traditional insurers

## Support

For questions or issues:
- Documentation: `/docs`
- Discord: [link]
- Email: support@defi-security.io
