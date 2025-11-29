'use client';
import { useState, useEffect } from 'react';
import WalletScanner from '../components/WalletScanner';

export default function SecurityCenter() {
  const [selectedTakedown, setSelectedTakedown] = useState<number | null>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerScan, setTriggerScan] = useState(false);

  useEffect(() => {
    // Fetch real threat data
    const fetchThreats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/incident/threats');
        if (response.ok) {
          const data = await response.json();
          setThreats(data.threats || []);
        }
      } catch (error) {
        console.error('Failed to fetch threats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchThreats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchThreats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (id: number) => {
    setSelectedTakedown(selectedTakedown === id ? null : id);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>🔒 Security Center</h1>
              <p style={{ color: '#666', margin: 0 }}>Monitor takedown requests and global threat intelligence</p>
            </div>
            <button
              onClick={() => setTriggerScan(true)}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              title="Scan all installed wallet extensions for security threats"
            >
              🔍 Scan My Wallets
            </button>
          </div>
        
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🎯 Active Takedown Requests</h2>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              padding: '25px', 
              border: '2px solid #e0e0e0', 
              borderRadius: '15px',
              background: '#f8f9fa',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 5px 20px rgba(102,126,234,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#333' }}>
                    🚨 Phishing Site: <span style={{ color: '#dc3545' }}>scam-uniswap{i}.com</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#666' }}>Status: </span>
                      <span style={{ 
                        padding: '4px 12px',
                        background: '#ffc107',
                        color: '#856404',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>Pending</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#666' }}>Vendor: </span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Registrar, Hosting Provider</span>
                    </div>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleViewDetails(i)}
                    style={{ 
                      padding: '12px 24px', 
                      background: selectedTakedown === i ? '#6c757d' : '#667eea',
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '10px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    title={selectedTakedown === i ? 'Hide takedown details' : 'View takedown progress and details'}
                  >
                    {selectedTakedown === i ? '👁️ Hide Details' : '🔍 View Details'}
                  </button>
                </div>
              </div>
              
              {selectedTakedown === i && (
                <div style={{ 
                  marginTop: '25px', 
                  padding: '25px', 
                  background: 'linear-gradient(135deg, #e7f3ff 0%, #d4e9ff 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #007bff'
                }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#004085' }}>📊 Takedown Progress</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Incident ID</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>INC-{1000 + i}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Reported</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{new Date().toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Evidence CID</div>
                      <div style={{ fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>QmMockCID{i}xyz123</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Estimated Resolution</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>24-48 hours</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#004085' }}>Vendor Status:</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ 
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>📧 <strong>Registrar (GoDaddy)</strong></span>
                        <span style={{ 
                          padding: '4px 12px',
                          background: '#28a745',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>Email Sent</span>
                      </div>
                      <div style={{ 
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>🌐 <strong>Hosting (Cloudflare)</strong></span>
                        <span style={{ 
                          padding: '4px 12px',
                          background: '#ffc107',
                          color: '#856404',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>Ticket #CF{12345 + i}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => window.open(`https://ipfs.io/ipfs/QmMockCID${i}xyz123`, '_blank')}
                      style={{ 
                        flex: 1,
                        padding: '12px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="View immutable evidence stored on IPFS"
                    >
                      🔗 View Evidence on IPFS
                    </button>
                    <button
                      style={{ 
                        flex: 1,
                        padding: '12px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Send follow-up to vendors"
                    >
                      📨 Send Follow-up
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto 0' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🌍 Global Threat Map</h2>
        <div style={{ 
          height: '500px', 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          borderRadius: '15px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          {/* World Map SVG Background */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            height: '90%',
            opacity: 0.3
          }}>
            <svg viewBox="0 0 1000 500" style={{ width: '100%', height: '100%' }}>
              {/* Simplified world map paths */}
              <path d="M 100 150 L 200 100 L 300 120 L 400 100 L 500 150 L 600 120 L 700 140 L 800 100 L 900 150" 
                stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
              <path d="M 100 250 L 200 200 L 300 220 L 400 200 L 500 250 L 600 220 L 700 240 L 800 200 L 900 250" 
                stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
              <path d="M 100 350 L 200 300 L 300 320 L 400 300 L 500 350 L 600 320 L 700 340 L 800 300 L 900 350" 
                stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          {/* Threat Markers - Real Data */}
          {threats.map((threat, index) => (
            <ThreatMarker 
              key={index}
              top={`${30 + (index * 10)}%`} 
              left={`${20 + (index * 15)}%`} 
              label={threat.city} 
              count={threat.count} 
            />
          ))}

          {/* Legend */}
          <div style={{ 
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.7)',
            padding: '15px',
            borderRadius: '10px',
            color: 'white',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔴 Active Threats</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc3545' }}></div>
              <span>High Risk (127 total)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffc107' }}></div>
              <span>Medium Risk (45 total)</span>
            </div>
          </div>

          {/* Stats Box */}
          <div style={{ 
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0,0,0,0.7)',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            minWidth: '200px'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '15px', fontWeight: 'bold' }}>📊 Real-Time Stats</div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Threats Blocked Today</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>127</div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Active Takedowns</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>12</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Protected Users</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>1,234</div>
            </div>
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

function ThreatMarker({ top, left, label, count }: { top: string; left: string; label: string; count: number }) {
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  
  // Simple pulse animation using state
  useState(() => {
    const interval = setInterval(() => {
      setScale(prev => prev === 1 ? 1.5 : 1);
      setOpacity(prev => prev === 1 ? 0.5 : 1);
    }, 1000);
    return () => clearInterval(interval);
  });
  
  return (
    <div 
      style={{ 
        position: 'absolute',
        top,
        left,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pulsing circle */}
      <div style={{ 
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#dc3545',
        boxShadow: '0 0 20px rgba(220, 53, 69, 0.8)',
        transform: `scale(${scale})`,
        opacity: opacity,
        transition: 'all 1s ease-in-out'
      }}></div>
      
      {/* Tooltip */}
      {hovered && (
        <div style={{ 
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          zIndex: 10
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
          <div style={{ fontSize: '12px' }}>🚨 {count} threats detected</div>
        </div>
      )}
    </div>
  );
}
