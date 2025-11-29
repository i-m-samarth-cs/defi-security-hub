"use client";
import React, { useState, useEffect } from "react";

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div style={{ background: '#1a1825', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderLeft: `4px solid ${color}`, border: '1px solid #2d2642' }}>
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#7d7a91', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b0a8d8' }}>{value}</div>
    </div>
  );
}

function ActivityItem({ activity }: any) {
  let activityText = '';
  if (activity.type === 'deposit') {
    activityText = `${activity.address} deposited ${activity.amount} ${activity.asset}`;
  } else if (activity.type === 'withdraw') {
    activityText = `${activity.address} withdrew ${activity.amount} ${activity.asset}`;
  } else if (activity.type === 'emergency_payout') {
    activityText = `Emergency payout of ${activity.amount} ${activity.asset} to ${activity.address}`;
  } else if (activity.type === 'claim_reserved') {
    activityText = `Claim #${activity.claimId} reserved: ${activity.amount} ${activity.asset}`;
  } else if (activity.type === 'policy_created') {
    activityText = `${activity.address} created ${activity.riskType} policy for $${activity.coverage}`;
  } else if (activity.type === 'takedown_created') {
    activityText = `Takedown request submitted for ${activity.url}`;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #2d2642', color: '#b0a8d8' }}>
      <span>{activityText}</span>
      <span style={{ color: '#7d7a91', fontSize: '14px' }}>{activity.timestamp}</span>
    </div>
  );
}

function Modal({ onClose, children }: any) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1a1825', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid #2d2642', color: '#b0a8d8' }}>
        <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '24px', cursor: 'pointer', background: 'none', border: 'none', color: '#b0a8d8' }} onClick={onClose}>✕</div>
        {children}
      </div>
    </>
  );
}

function UnderwriteForm({ poolApy, onCreate }: any) {
  const [riskType, setRiskType] = useState('Smart Contract Cover');
  const [coverage, setCoverage] = useState('1000');
  const [termDays, setTermDays] = useState('30');

  const calcPremium = () => {
    // basic premium: coverage * 1% + pool APY influence
    const base = Number(coverage) * 0.01;
    const apyAdj = (poolApy / 100) * Number(coverage) * 0.005;
    return Math.max(1, Math.round((base + apyAdj) * 100) / 100);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={riskType} onChange={(e) => setRiskType(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
        <option>Smart Contract Cover</option>
        <option>Stablecoin Depeg</option>
        <option>Oracle Failure</option>
      </select>
      <input value={coverage} onChange={(e) => setCoverage(e.target.value)} style={{ padding: 8, borderRadius: 8, width: 120 }} />
      <input value={termDays} onChange={(e) => setTermDays(e.target.value)} style={{ padding: 8, borderRadius: 8, width: 80 }} />
      <div style={{ fontWeight: 700 }}>${calcPremium()}</div>
      <button onClick={() => onCreate({ riskType, coverage, termDays, premium: calcPremium() })} style={{ padding: '8px 12px', borderRadius: 8 }}>Underwrite</button>
    </div>
  );
}

function TakedownForm({ onCreate }: any) {
  const [url, setUrl] = useState('');
  const [registrar, setRegistrar] = useState('Registrar A');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input placeholder="phish.example.com" value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8 }} />
      <select value={registrar} onChange={(e) => setRegistrar(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
        <option>Registrar A</option>
        <option>Registrar B</option>
      </select>
      <button onClick={() => { if (!url) return alert('Enter URL'); onCreate({ url, registrar }); setUrl(''); }} style={{ padding: '8px 12px', borderRadius: 8 }}>Request Takedown</button>
    </div>
  );
}

export default function PoolOverview() {
  const [poolData, setPoolData] = useState<any>({
    totalInsuredTVL: 0,
    availableLiquidity: 0,
    reservedAmount: 0,
    emergencyPoolBalance: 0,
    pendingLiabilities: 0,
    apy: 12.5,                     // APY remains at 12.5%
    totalShares: 0,
    feePercentage: 0,
  });
  const [positions, setPositions] = useState<any[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [calculatorAmount, setCalculatorAmount] = useState('100');
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [takedowns, setTakedowns] = useState<any[]>([]);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    fetchPoolData();
    fetchRecentActivity();
    const addr = localStorage.getItem('currentAddress') || null;
    setCurrentAddress(addr);
    loadPositions(addr);
  }, []);

  const fetchPoolData = async () => {
    // Mock data - replace with actual API call
    setPoolData({
      totalInsuredTVL: 0,
      availableLiquidity: 18.5,
      reservedAmount: 450,
      emergencyPoolBalance: 0,
      pendingLiabilities: 0,
      apy: 12.5,
      totalShares: 10,
      feePercentage: 2.5
    });
  };

  const fetchRecentActivity = async () => {
    // Mock data - replace with actual API call
    setRecentActivity([
      { type: 'deposit', address: '0x1234...5678', amount: 5.5, asset: 'ETH', timestamp: '2 mins ago' },
      { type: 'emergency_payout', address: '0xabcd...ef01', amount: 0.15, asset: 'ETH', timestamp: '15 mins ago' },
      { type: 'claim_reserved', claimId: 123, amount: 2.5, asset: 'ETH', timestamp: '1 hour ago' },
      { type: 'withdraw', address: '0x9876...5432', amount: 3.2, asset: 'ETH', timestamp: '3 hours ago' }
    ]);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // Simulate local deposit and persist position
    const amount = Number(depositAmount);
    const id = Date.now();
    const pos = { id, asset: selectedAsset, amount, timestamp: new Date().toISOString() };
    const newPositions = [pos, ...positions];
    setPositions(newPositions);
    savePositions(currentAddress, newPositions);

    // update poolData (local simulation)
    setPoolData((p: any) => ({
      ...p,
      totalInsuredTVL: p.totalInsuredTVL + amount * 1000,
      availableLiquidity: p.availableLiquidity + amount * 1000,
    }));

    // Add to Recent Activity
    const shortAddr = currentAddress ? (currentAddress.slice(0, 6) + '...' + currentAddress.slice(-4)) : '0x0000...0000';
    const activity = { type: 'deposit', address: shortAddr, amount, asset: selectedAsset, timestamp: 'just now' };
    setRecentActivity((prev) => [activity, ...prev]);

    // Show notification
    setNotification({ title: '✅ Deposit recorded', message: `${amount} ${selectedAsset} deposited successfully`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);

    // dispatch event for other parts of the app
    window.dispatchEvent(new CustomEvent('pool-updated', { detail: { positions: newPositions } }));
    window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: 'Deposit recorded', message: `Recorded ${amount} ${selectedAsset}` } }));

    setShowDepositModal(false);
    setDepositAmount('');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const amount = Number(withdrawAmount);
    // simple FIFO: reduce or remove first matching position
    let remaining = amount;
    const updated: any[] = [];
    for (const p of positions) {
      if (remaining <= 0) { updated.push(p); continue; }
      if (p.asset !== selectedAsset) { updated.push(p); continue; }
      if (p.amount <= remaining) { remaining -= p.amount; continue; }
      // partial
      updated.push({ ...p, amount: +(p.amount - remaining).toFixed(6) });
      remaining = 0;
    }
    const finalPositions = updated;
    setPositions(finalPositions);
    savePositions(currentAddress, finalPositions);

    // update poolData (local simulation)
    setPoolData((p: any) => ({
      ...p,
      totalInsuredTVL: Math.max(0, p.totalInsuredTVL - amount * 1000),
      availableLiquidity: Math.max(0, p.availableLiquidity - amount * 1000),
    }));

    // Add to Recent Activity
    const shortAddr = currentAddress ? (currentAddress.slice(0, 6) + '...' + currentAddress.slice(-4)) : '0x0000...0000';
    const activity = { type: 'withdraw', address: shortAddr, amount, asset: selectedAsset, timestamp: 'just now' };
    setRecentActivity((prev) => [activity, ...prev]);

    // Show notification
    setNotification({ title: '✅ Withdrawal recorded', message: `${amount} ${selectedAsset} withdrawal initiated`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);

    window.dispatchEvent(new CustomEvent('pool-updated', { detail: { positions: finalPositions } }));
    window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: 'Withdrawal recorded', message: `Recorded withdrawal ${amount} ${selectedAsset}` } }));

    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  function loadPositions(addr: string | null) {
    try {
      const raw = localStorage.getItem(`positions_${addr || 'anon'}`);
      if (!raw) return setPositions([]);
      setPositions(JSON.parse(raw));
    } catch (e) {
      setPositions([]);
    }
  }

  function savePositions(addr: string | null, items: any[]) {
    try {
      localStorage.setItem(`positions_${addr || 'anon'}`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save positions', e);
    }
  }

  function estimateRewards(amount: number) {
    // simple APY estimation
    return (amount * (poolData.apy / 100));
  }

  function UtilizationChart({ data }: any) {
    const total = data.totalInsuredTVL || 1;
    const reserved = data.reservedAmount || 0;
    const emergency = data.emergencyPoolBalance || 0;
    const free = Math.max(0, total - reserved - emergency);
    const pctReserved = (reserved / total) * 100;
    const pctEmergency = (emergency / total) * 100;
    return (
      <div style={{ background: 'white', padding: 14, borderRadius: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Pool Utilization</div>
        <svg width="100%" height="48" viewBox="0 0 100 10" preserveAspectRatio="none">
          <rect x="0" y="0" width="100" height="10" fill="#eef2ff" />
          <rect x="0" y="0" width={`${pctReserved}`} height="10" fill="#667eea" />
          <rect x={`${pctReserved}`} y="0" width={`${pctEmergency}`} height="10" fill="#fde68a" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
          <div>Reserved: ${Math.round(reserved).toLocaleString()}</div>
          <div>Emergency: ${Math.round(emergency).toLocaleString()}</div>
          <div>Free: ${Math.round(free).toLocaleString()}</div>
        </div>
      </div>
    );
  }

  // Load policies, claims, takedowns from localStorage on mount
  useEffect(() => {
    const addr = currentAddress;
    try {
      const rawP = localStorage.getItem(`policies_${addr || 'anon'}`);
      if (rawP) setPolicies(JSON.parse(rawP));
    } catch (e) { }
    try {
      const rawC = localStorage.getItem(`claims_${addr || 'anon'}`);
      if (rawC) setClaims(JSON.parse(rawC));
    } catch (e) { }
    try {
      const rawT = localStorage.getItem(`takedowns_${addr || 'anon'}`);
      if (rawT) setTakedowns(JSON.parse(rawT));
    } catch (e) { }

    // progress simulation: advance takedown and claim statuses every 8s
    const iv = setInterval(() => {
      setTakedowns((prev) => {
        const next = prev.map((t: any) => {
          if (t.status === 'Pending') return { ...t, status: 'In Progress' };
          if (t.status === 'In Progress') return { ...t, status: 'Completed' };
          return t;
        });
        try { localStorage.setItem(`takedowns_${addr || 'anon'}`, JSON.stringify(next)); } catch(e){}
        return next;
      });

      setClaims((prev) => {
        const next = prev.map((c: any) => {
          if (c.status === 'Reserved') return { ...c, status: 'Processing' };
          if (c.status === 'Processing') return { ...c, status: 'Paid' };
          return c;
        });
        try { localStorage.setItem(`claims_${addr || 'anon'}`, JSON.stringify(next)); } catch(e){}
        return next;
      });
    }, 8000);

    return () => clearInterval(iv);
  }, [currentAddress]);

  function simulateOracleTrigger() {
    // create a mock claim reserved and reduce available liquidity
    const claim = { id: Date.now(), type: 'Oracle Triggered Claim', amount: 2000, status: 'Reserved', timestamp: new Date().toISOString() };
    setClaims((c) => {
      const next = [claim, ...c];
      try { localStorage.setItem(`claims_${currentAddress || 'anon'}`, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setPoolData((p: any) => ({ ...p, reservedAmount: p.reservedAmount + claim.amount * 100 }));
    
    // Add to Recent Activity
    const activity = { type: 'claim_reserved', claimId: Math.floor(Math.random() * 1000), amount: 2, asset: 'ETH', timestamp: 'just now' };
    setRecentActivity((prev) => [activity, ...prev]);
    
    // Show notification
    setNotification({ title: '⚠️ Claim Reserved', message: `Oracle triggered claim for 2000 units`, type: 'warning' });
    setTimeout(() => setNotification(null), 3000);
    
    window.dispatchEvent(new CustomEvent('claim-created', { detail: claim }));
    window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: 'Oracle claim', message: `Oracle reserved $${claim.amount}` } }));
  }

  if (!poolData) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading pool data...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e17', padding: '40px 20px' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notification.title}</div>
          <div style={{ fontSize: '14px' }}>{notification.message}</div>
        </div>
      )}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#b0a8d8' }}>💰 Insurance Pool Overview</h1>
        <p style={{ color: '#7d7a91', marginBottom: '30px' }}>Deposit funds to earn fees and protect DeFi users</p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{
              padding: '15px 30px',
              background: '#a855f7',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#9333ea'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#a855f7'}
          >
            💰 Deposit Funds
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              padding: '15px 30px',
              background: 'transparent',
              color: '#a855f7',
              border: '2px solid #a855f7',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
              e.currentTarget.style.borderColor = '#a855f7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#a855f7';
            }}
          >
            💸 Withdraw
          </button>
        </div>

        {/* TOP PRIORITY: Policies, Claims, Takedowns */}
        <div style={{ marginBottom: 30, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div style={{ background: '#1a1825', padding: 16, borderRadius: 12, border: '1px solid #2d2642', color: '#b0a8d8' }}>
            <h3 style={{ marginTop: 0, color: '#b0a8d8' }}>Policy Underwriting</h3>
            <p style={{ color: '#7d7a91' }}>Create simple coverage policies (simulated). Premiums are estimated from risk type.</p>
            <UnderwriteForm poolApy={poolData.apy} onCreate={(p: any) => {
              const created = { id: Date.now(), ...p };
              const updated = [created, ...policies];
              setPolicies(updated);
              localStorage.setItem(`policies_${currentAddress || 'anon'}`, JSON.stringify(updated));
              // reserve funds simulate
              setPoolData((d: any) => ({ ...d, reservedAmount: d.reservedAmount + Number(p.coverage) * 100 }));
              
              // Add to Recent Activity
              const shortAddr = currentAddress ? (currentAddress.slice(0, 6) + '...' + currentAddress.slice(-4)) : '0x0000...0000';
              const activity = { type: 'policy_created', address: shortAddr, riskType: p.riskType, coverage: p.coverage, timestamp: 'just now' };
              setRecentActivity((prev) => [activity, ...prev]);
              
              // Show notification
              setNotification({ title: '📋 Policy Created', message: `${p.riskType} policy for $${p.coverage}`, type: 'success' });
              setTimeout(() => setNotification(null), 3000);
              
              window.dispatchEvent(new CustomEvent('policy-created', { detail: created }));
            }} />

            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '8px 0' }}>My Policies</h4>
              {policies.length === 0 ? <div style={{ color: '#666' }}>No policies yet.</div> : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {policies.map((pp) => (
                    <div key={pp.id} style={{ padding: 10, borderRadius: 8, background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{pp.riskType} • ${pp.coverage}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>Premium: ${pp.premium} • Expires: {pp.termDays}d</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { /* view */ }} style={{ padding: '6px 10px', borderRadius: 8 }}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#1a1825', padding: 12, borderRadius: 12, border: '1px solid #2d2642' }}>
              <h4 style={{ margin: '8px 0', color: '#b0a8d8' }}>Claims Tracker</h4>
              <div style={{ color: '#7d7a91', marginBottom: 8 }}>Claims triggered by oracles or manual submission.</div>
              {claims.length === 0 ? <div style={{ color: '#666' }}>No active claims.</div> : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {claims.map((c) => (
                    <div key={c.id} style={{ padding: 8, borderRadius: 8, background: '#fff7ed' }}>
                      <div style={{ fontWeight: 800 }}>{c.type} • ${c.amount}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{c.status} • {new Date(c.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button onClick={() => simulateOracleTrigger()} style={{ padding: '8px 12px', borderRadius: 8, background: '#fde68a' }}>Simulate Oracle Trigger</button>
                <button onClick={() => { const c = { id: Date.now(), type: 'Manual Claim', amount: 1000, status: 'Reserved', timestamp: new Date().toISOString() }; setClaims([c, ...claims]); localStorage.setItem(`claims_${currentAddress || 'anon'}`, JSON.stringify([c, ...claims])); window.dispatchEvent(new CustomEvent('claim-created', { detail: c })); }} style={{ padding: '8px 12px', borderRadius: 8 }}>Create Manual Claim</button>
              </div>
            </div>

            <div style={{ background: '#1a1825', padding: 12, borderRadius: 12, border: '1px solid #2d2642' }}>
              <h4 style={{ margin: '8px 0', color: '#b0a8d8' }}>Takedown Dashboard</h4>
              <p style={{ color: '#7d7a91' }}>Manage takedown requests sent to registrars/hosters (simulated).</p>
              <TakedownForm onCreate={(td: any) => {
                const created = { id: Date.now(), ...td, status: 'Pending', timestamp: new Date().toISOString() };
                const updated = [created, ...takedowns];
                setTakedowns(updated);
                localStorage.setItem(`takedowns_${currentAddress || 'anon'}`, JSON.stringify(updated));
                
                // Add to Recent Activity
                const activity = { type: 'takedown_created', url: td.url, status: 'Pending', timestamp: 'just now' };
                setRecentActivity((prev) => [activity, ...prev]);
                
                // Show notification
                setNotification({ title: '🛑 Takedown Submitted', message: `Takedown request for ${td.url}`, type: 'success' });
                setTimeout(() => setNotification(null), 3000);
                
                window.dispatchEvent(new CustomEvent('takedown-created', { detail: created }));
              }} />
              <div style={{ marginTop: 8 }}>
                {takedowns.length === 0 ? <div style={{ color: '#666' }}>No takedown requests.</div> : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {takedowns.map((t) => (
                      <div key={t.id} style={{ padding: 8, borderRadius: 8, background: '#f0f9ff' }}>
                        <div style={{ fontWeight: 800 }}>{t.url}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{t.status} • {new Date(t.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <MetricCard title="Total Insured TVL" value={`$${(poolData.totalInsuredTVL / 1000000).toFixed(2)}M`} icon="💰" color="#667eea" />
          <MetricCard title="Available Liquidity" value={`$${(poolData.availableLiquidity / 1000000).toFixed(2)}M`} icon="💧" color="#28a745" />
          <MetricCard title="Reserved (Escrowed)" value={`$${(poolData.reservedAmount / 1000).toFixed(0)}K`} icon="🔒" color="#ffc107" />
          <MetricCard title="Emergency Pool" value={`$${(poolData.emergencyPoolBalance / 1000).toFixed(0)}K`} icon="⚡" color="#dc3545" />
          <MetricCard title="Pending Liabilities" value={`$${(poolData.pendingLiabilities / 1000).toFixed(0)}K`} icon="⏳" color="#6c757d" />
          <MetricCard title="Current APY" value={`${poolData.apy}%`} icon="📈" color="#17a2b8" />
        </div>

        {/* Calculator, Positions, Utilization, Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 30 }}>
          {/* Left: Recent Activity */}
          <div style={{ background: '#1a1825', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', border: '1px solid #2d2642' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '14px', color: '#b0a8d8' }}>🔔 Recent Activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivity.map((activity, idx) => (
                <ActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </div>

          {/* Right: Utilization + Calculator + My Positions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <UtilizationChart data={poolData} />

            <div style={{ background: '#1a1825', padding: 14, borderRadius: 12, border: '1px solid #2d2642', color: '#b0a8d8' }}>
              <div style={{ fontWeight: 800, marginBottom: 8, color: '#b0a8d8' }}>Reward Calculator</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={calculatorAmount} onChange={(e) => setCalculatorAmount(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #2d2642', background: '#2d2642', color: '#b0a8d8' }} />
                <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #2d2642', background: '#2d2642', color: '#b0a8d8' }}>
                  <option>ETH</option>
                  <option>USDC</option>
                </select>
                <div style={{ fontWeight: 700, color: '#10b981' }}>${estimateRewards(Number(calculatorAmount)).toFixed(2)} / year</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#7d7a91' }}>Pool APY: {poolData.apy}% • Est. pool share: {(Number(calculatorAmount) / (poolData.totalInsuredTVL/1000) * 100).toFixed(3)}%</div>
            </div>

            <div style={{ background: '#1a1825', padding: 14, borderRadius: 12, border: '1px solid #2d2642', color: '#b0a8d8' }}>
              <div style={{ fontWeight: 800, marginBottom: 8, color: '#b0a8d8' }}>My Positions</div>
              {positions.length === 0 ? (
                <div style={{ color: '#7d7a91' }}>No positions yet. Use Deposit to add a simulated position.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {positions.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: '#f8fafc' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.asset} • {p.amount}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{new Date(p.timestamp).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setDepositAmount(String(p.amount)); setSelectedAsset(p.asset); setShowWithdrawModal(true); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: 'white' }}>Withdraw</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <Modal onClose={() => setShowDepositModal(false)}>
          <h2 style={{ marginBottom: '20px' }}>💰 Deposit Funds</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Amount</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.0"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>
          <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Estimated Pool Share:</span>
              <span style={{ fontWeight: 'bold' }}>~0.5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gas Estimate:</span>
              <span style={{ fontWeight: 'bold' }}>~$5</span>
            </div>
          </div>
          <button
            onClick={handleDeposit}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Confirm Deposit
          </button>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <Modal onClose={() => setShowWithdrawModal(false)}>
          <h2 style={{ marginBottom: '20px' }}>💸 Withdraw Funds</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Amount</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.0"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
            />
          </div>
          <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffc107' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Cooldown Period</div>
            <div style={{ fontSize: '14px' }}>Withdrawals are subject to a 7-day cooldown period to ensure pool stability.</div>
          </div>
          <button
            onClick={handleWithdraw}
            style={{
              width: '100%',
              padding: '15px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Request Withdrawal
          </button>
        </Modal>
      )}
    </div>
  );
}
