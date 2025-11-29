-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  evidence_cid TEXT,
  score DECIMAL(3,2),
  status TEXT DEFAULT 'reported',
  on_chain_claim_id INTEGER,
  emergency_payout_amount DECIMAL(18,8),
  origin_domain TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Takedowns table
CREATE TABLE takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  vendor TEXT,
  ticket_id TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  notification_prefs JSONB DEFAULT '{"email": true, "extension": true}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insurance Pools table
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_deposits DECIMAL(18,8) DEFAULT 0,
  reserved_amount DECIMAL(18,8) DEFAULT 0,
  emergency_balance DECIMAL(18,8) DEFAULT 0,
  available_liquidity DECIMAL(18,8) DEFAULT 0,
  total_shares DECIMAL(18,8) DEFAULT 0,
  apy DECIMAL(5,2) DEFAULT 0,
  fee_percentage DECIMAL(5,2) DEFAULT 2.5,
  emergency_cap_per_claim DECIMAL(18,8) DEFAULT 0.5,
  max_reserve_per_claim DECIMAL(18,8) DEFAULT 2.5,
  cooldown_period INTEGER DEFAULT 604800,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- LP Positions table
CREATE TABLE lp_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES pools(id),
  lp_address TEXT NOT NULL,
  deposit_amount DECIMAL(18,8) DEFAULT 0,
  pool_share DECIMAL(18,8) DEFAULT 0,
  earned_fees DECIMAL(18,8) DEFAULT 0,
  withdraw_pending DECIMAL(18,8) DEFAULT 0,
  withdraw_requested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Claims table (enhanced)
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  claim_id INTEGER,
  claimant TEXT NOT NULL,
  pool_id UUID REFERENCES pools(id),
  reserved_amount DECIMAL(18,8) DEFAULT 0,
  emergency_paid DECIMAL(18,8) DEFAULT 0,
  final_payout DECIMAL(18,8) DEFAULT 0,
  status TEXT DEFAULT 'reserved',
  evidence_link TEXT,
  underwriter TEXT,
  reviewed_at TIMESTAMP,
  finalized_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Events table
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  pool_id UUID REFERENCES pools(id),
  claim_id UUID REFERENCES claims(id),
  lp_address TEXT,
  amount DECIMAL(18,8),
  tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_incidents_wallet ON incidents(wallet_address);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_takedowns_incident ON takedowns(incident_id);
CREATE INDEX idx_lp_positions_address ON lp_positions(lp_address);
CREATE INDEX idx_lp_positions_pool ON lp_positions(pool_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_claimant ON claims(claimant);
CREATE INDEX idx_audit_events_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_pool ON audit_events(pool_id);
