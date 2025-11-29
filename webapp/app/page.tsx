'use client';
import { useState, useEffect } from 'react';
import WalletScanner from './components/WalletScanner';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [triggerScan, setTriggerScan] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ totalInsuredTVL: 0, threatsBlocked: 0, emergencyPool: 0 });
  const sliderImages = [
    'https://tse4.mm.bing.net/th/id/OIP._5gMhghNmLkbYc5LW1yU1gHaDF?rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1400&q=80&auto=format&fit=crop',
    'https://external-preview.redd.it/NbxyE3s9w2mKNBeTAsjZAPenJ4SNBkEXRnzcq-teG7o.jpg?auto=webp&s=4ff3cb4ff9fbde657414d8d2cc8c8de744545fba'
  ];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    // read current address from localStorage
    try {
      const addr = localStorage.getItem('currentAddress');
      if (addr) {
        setCurrentAddress(addr);
        loadMetrics(addr);
      }
    } catch (e) {
      // ignore
    }

    const onWallet = (e: any) => {
      const addr = e?.detail?.address;
      if (addr) {
        setCurrentAddress(addr);
        loadMetrics(addr);
      }
    };

    // Listen for pool updates (deposits/withdrawals)
    const onPoolUpdate = (e: any) => {
      if (currentAddress) {
        // Recalculate metrics from pool data
        try {
          const poolData = JSON.parse(localStorage.getItem(`poolData_${currentAddress}`) || '{}');
          const positions = JSON.parse(localStorage.getItem(`positions_${currentAddress}`) || '[]');
          
          // Calculate total TVL from positions
          const tvl = positions.reduce((sum: number, pos: any) => sum + (Number(pos.amount) || 0) * 1000, 0);
          
          setMetrics((prev) => ({
            ...prev,
            totalInsuredTVL: tvl > 0 ? tvl : prev.totalInsuredTVL,
          }));
        } catch (err) {}
      }
    };

    // Listen for claim/incident reports
    const onReportUpdate = (e: any) => {
      if (currentAddress) {
        try {
          const claims = JSON.parse(localStorage.getItem('localClaims') || '[]');
          
          // Count threats from claims
          const threatsCount = claims.filter((c: any) => c.incidentType).length;
          
          // Count emergency pool needs
          const totalEmergency = claims.reduce((sum: number, c: any) => {
            if (c.status === 'Approved' || c.status === 'Reserved') {
              return sum + (Number(c.amountLost) || Number(c.reserved_amount) || 0);
            }
            return sum;
          }, 0) * 1000;
          
          setMetrics((prev) => ({
            ...prev,
            threatsBlocked: threatsCount,
            emergencyPool: totalEmergency,
          }));
        } catch (err) {}
      }
    };

    window.addEventListener('wallet-connected', onWallet as EventListener);
    window.addEventListener('pool-updated', onPoolUpdate as EventListener);
    window.addEventListener('reports-updated', onReportUpdate as EventListener);
    window.addEventListener('claim-created', onReportUpdate as EventListener);
    window.addEventListener('policy-created', onPoolUpdate as EventListener);

    const interval = setInterval(() => setSlideIndex(i => (i + 1) % sliderImages.length), 5000);

    return () => {
      window.removeEventListener('wallet-connected', onWallet as EventListener);
      window.removeEventListener('pool-updated', onPoolUpdate as EventListener);
      window.removeEventListener('reports-updated', onReportUpdate as EventListener);
      window.removeEventListener('claim-created', onReportUpdate as EventListener);
      window.removeEventListener('policy-created', onPoolUpdate as EventListener);
      clearInterval(interval);
    };
  }, [currentAddress]);

  const loadMetrics = (addr: string) => {
    try {
      // Load from positions
      const positions = JSON.parse(localStorage.getItem(`positions_${addr}`) || '[]');
      const tvl = positions.reduce((sum: number, pos: any) => sum + (Number(pos.amount) || 0) * 1000, 0);
      
      // Load from claims
      const claims = JSON.parse(localStorage.getItem('localClaims') || '[]');
      const threatsCount = claims.filter((c: any) => c.incidentType).length;
      
      // Calculate emergency pool from reserved claims
      const emergencyNeeded = claims.reduce((sum: number, c: any) => {
        if (c.status === 'Approved' || c.status === 'Reserved') {
          return sum + (Number(c.amountLost) || Number(c.reserved_amount) || 0);
        }
        return sum;
      }, 0) * 1000;
      
      // Also check stored metrics
      const storedMetrics = JSON.parse(localStorage.getItem(`metrics_${addr}`) || '{}');
      
      setMetrics({
        totalInsuredTVL: tvl > 0 ? tvl : storedMetrics.totalInsuredTVL || 0,
        threatsBlocked: threatsCount > 0 ? threatsCount : storedMetrics.threatsBlocked || 0,
        emergencyPool: emergencyNeeded > 0 ? emergencyNeeded : storedMetrics.emergencyPool || 0,
      });
    } catch (e) {
      setMetrics({ totalInsuredTVL: 0, threatsBlocked: 0, emergencyPool: 0 });
    }
  };

  const saveMetrics = (newMetrics: any) => {
    try {
      if (!currentAddress) return;
      const key = `metrics_${currentAddress}`;
      localStorage.setItem(key, JSON.stringify(newMetrics));
      setMetrics(newMetrics);
    } catch (e) {
      console.error('Failed to save metrics', e);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f0e17'
    }}>
      {/* Main Content */}
      <div style={{ 
        padding: '40px 20px'
      }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Explore DeFi Security
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.7, color: '#b0a8d8', maxWidth: '600px', margin: '0 auto' }}>
            Discover real-time phishing detection, community-powered insurance, and automated threat takedowns designed to make DeFi security engaging and effective.
          </p>
        </div>

        {/* Hero Slider */}
        <div style={{ position: 'relative', marginBottom: '30px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2d2642' }}>
          <img src={sliderImages[slideIndex]} alt="hero" style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', left: '20px', bottom: '20px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
            <h2 style={{ margin: 0, fontSize: '28px' }}>Community-Powered Protection Protocol</h2>
            <p style={{ margin: 0, opacity: 0.95 }}>A revolutionary decentralized insurance platform where community members protect each other.</p>
          </div>
          <div style={{ position: 'absolute', right: '20px', top: '20px', display: 'flex', gap: '8px' }}>
            <button onClick={() => setSlideIndex((slideIndex - 1 + sliderImages.length) % sliderImages.length)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', color: 'white' }}>◀</button>
            <button onClick={() => setSlideIndex((slideIndex + 1) % sliderImages.length)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', color: 'white' }}>▶</button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ 
            padding: '30px', 
            background: '#1a1825',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid #2d2642',
            transition: 'transform 0.3s',
            transform: hoveredCard === 'tvl' ? 'translateY(-5px)' : 'translateY(0)'
          }}
          onMouseEnter={() => setHoveredCard('tvl')}
          onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💰</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#b0a8d8', fontSize: '14px', textTransform: 'uppercase' }}>Total Insured TVL</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#a855f7' }}>
              ${metrics.totalInsuredTVL >= 1000000 ? (metrics.totalInsuredTVL / 1000000).toFixed(2) + 'M' : metrics.totalInsuredTVL >= 1000 ? (metrics.totalInsuredTVL / 1000).toFixed(2) + 'K' : metrics.totalInsuredTVL.toLocaleString()}
            </p>
            <p style={{ fontSize: '12px', color: '#7d7a91', marginTop: '5px' }}>From: {currentAddress ? currentAddress.slice(0,10) + '...' + currentAddress.slice(-4) : 'No wallet'}</p>
          </div>

          <div style={{ 
            padding: '30px', 
            background: '#1a1825',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid #2d2642',
            transition: 'transform 0.3s',
            transform: hoveredCard === 'incidents' ? 'translateY(-5px)' : 'translateY(0)'
          }}
          onMouseEnter={() => setHoveredCard('incidents')}
          onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🚨</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#b0a8d8', fontSize: '14px', textTransform: 'uppercase' }}>Threats Blocked</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#ec4899' }}>{metrics.threatsBlocked || 0}</p>
            <p style={{ fontSize: '12px', color: '#7d7a91', marginTop: '5px' }}>Incident reports filed</p>
          </div>

          <div style={{ 
            padding: '30px', 
            background: '#1a1825',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            border: '1px solid #2d2642',
            transition: 'transform 0.3s',
            transform: hoveredCard === 'pool' ? 'translateY(-5px)' : 'translateY(0)'
          }}
          onMouseEnter={() => setHoveredCard('pool')}
          onMouseLeave={() => setHoveredCard(null)}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#b0a8d8', fontSize: '14px', textTransform: 'uppercase' }}>Emergency Pool</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
              ${metrics.emergencyPool >= 1000000 ? (metrics.emergencyPool / 1000000).toFixed(2) + 'M' : metrics.emergencyPool >= 1000 ? (metrics.emergencyPool / 1000).toFixed(2) + 'K' : metrics.emergencyPool.toLocaleString()}
            </p>
            <p style={{ fontSize: '12px', color: '#7d7a91', marginTop: '5px' }}>Reserved for claims</p>
          </div>
        </div>

       

        {/* Quick Actions */}
        <div style={{ 
          background: '#1a1825', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          marginBottom: '40px',
          border: '1px solid #2d2642'
        }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '28px', color: '#b0a8d8' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <ActionButton 
              onClick={() => setTriggerScan(true)}
              icon="🔍" 
              title="Scan My Wallets"
              description="Detect and scan all wallet extensions for threats"
              color="#764ba2"
            />
            <ActionButton 
              href="/pool" 
              icon="💰" 
              title="Insurance Pool"
              description="Deposit funds to earn fees and protect users"
              color="#667eea"
            />
            <ActionButton 
              href="/claims" 
              icon="📋" 
              title="View My Claims"
              description="Track your insurance claims and compensation status"
              color="#007bff"
            />
            <ActionButton 
              href="/report" 
              icon="🚨" 
              title="Report Incident"
              description="Report phishing and freeze insurance escrow instantly"
              color="#dc3545"
            />
            <ActionButton 
              href="/security-center" 
              icon="🔒" 
              title="Security Center"
              description="Monitor takedown requests and threat intelligence"
              color="#6c757d"
            />
          </div>
        </div>

        {/* How It Works */}
        <div style={{ 
          background: '#1a1825', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          border: '1px solid #2d2642'
        }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '28px', textAlign: 'center', color: '#b0a8d8' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <Step number="1" icon="🔍" title="Real-Time Detection" description="Browser extension scans every transaction for phishing patterns" />
            <Step number="2" icon="🛡️" title="Instant Protection" description="Insurance claim frozen on-chain within seconds" />
            <Step number="3" icon="⚡" title="Fast Compensation" description="Emergency payouts while claim is reviewed" />
            <Step number="4" icon="🎯" title="Auto Takedown" description="Automated requests sent to registrars and hosts" />
          </div>
        </div>
      </div>
      </div>

      {/* Wallet Scanner Component */}
      <WalletScanner 
        triggerScan={triggerScan} 
        onScanComplete={() => setTriggerScan(false)} 
      />
    </div>
  );
}

function ActionButton({ href, onClick, icon, title, description, color }: any) {
  const [hovered, setHovered] = useState(false);
  
  const commonStyles = {
    padding: '20px',
    background: hovered ? color : '#2d2642',
    color: hovered ? '#fff' : '#b0a8d8',
    textDecoration: 'none',
    borderRadius: '12px',
    transition: 'all 0.3s',
    border: `2px solid ${hovered ? color : '#3d3550'}`,
    display: 'block',
    transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow: hovered ? `0 8px 20px ${color}40` : '0 2px 5px rgba(0,0,0,0.3)',
    cursor: 'pointer'
  };

  const content = (
    <>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div>
    </>
  );
  
  if (onClick) {
    return (
      <div
        onClick={onClick}
        style={commonStyles}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={description}
      >
        {content}
      </div>
    );
  }
  
  return (
    <a 
      href={href}
      style={commonStyles}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={description}
    >
      {content}
    </a>
  );
}

function Step({ number, icon, title, description }: any) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        background: '#a855f7',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 auto 15px'
      }}>
        {number}
      </div>
      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#b0a8d8' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#7d7a91', margin: 0 }}>{description}</p>
    </div>
  );
}
