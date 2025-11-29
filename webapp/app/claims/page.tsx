'use client';
import { useEffect, useState } from 'react';

interface Claim {
  id: number;
  claimNumber?: string;
  status: string;
  reserved_amount: string;
  evidence_cid: string;
  txHash: string;
  domain: string;
  timestamp: string;
  incidentType?: string;
  amountLost?: string;
  losingAsset?: string;
  lossDescription?: string;
  evidenceDetails?: string;
  contactEmail?: string;
  additionalDetails?: string;
  description?: string;
}

export default function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  useEffect(() => {
    // Fetch real claims from backend
    const fetchClaims = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/incident/user-claims');
        if (response.ok) {
          const data = await response.json();
          // merge backend claims with any local claims stored in-browser
          const local = JSON.parse(localStorage.getItem('localClaims') || '[]');
          const merged = (data.claims || []).concat(local || []);
          setClaims(merged);
        }
      } catch (error) {
        console.error('Failed to fetch claims:', error);
        // Show empty state if no claims
        const local = JSON.parse(localStorage.getItem('localClaims') || '[]');
        setClaims(local || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClaims();
    
    const handler = (e: any) => {
      try {
        const local = JSON.parse(localStorage.getItem('localClaims') || '[]');
        if (local && local.length > 0) {
          setClaims(prev => {
            // prepend any new local claims that aren't already in prev
            const existingIds = new Set(prev.map(c => c.id));
            const toAdd = local.filter((c: any) => !existingIds.has(c.id));
            return toAdd.concat(prev);
          });
        }
      } catch (err) {
        console.error('reports-updated handler error', err);
      }
    };

    const notifyHandler = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.title && detail.message) {
        // simple non-passive notification: show an alert-like banner at top
        const banner = document.createElement('div');
        banner.innerText = `${detail.title} — ${detail.message}`;
        banner.style.position = 'fixed';
        banner.style.top = '20px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.background = '#ffc107';
        banner.style.color = '#212529';
        banner.style.padding = '12px 20px';
        banner.style.borderRadius = '8px';
        banner.style.zIndex = '99999';
        banner.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
        banner.style.cursor = 'pointer';
        banner.onclick = () => banner.remove();
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 8000);
      }
    };

    window.addEventListener('reports-updated', handler as EventListener);
    window.addEventListener('app-notification', notifyHandler as EventListener);

    return () => {
      window.removeEventListener('reports-updated', handler as EventListener);
      window.removeEventListener('app-notification', notifyHandler as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>My Claims</h1>
        <p>Loading claims...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#28a745';
      case 'Reserved': return '#007bff';
      case 'Pending Review': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f0e17',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: '#1a1825', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          border: '1px solid #2d2642'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#b0a8d8' }}>📋 My Claims</h1>
            <p style={{ color: '#7d7a91', margin: 0 }}>Track your insurance claims and compensation status</p>
          </div>
          
          {claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
              <p style={{ fontSize: '18px', color: '#7d7a91' }}>No claims found. Report an incident to create a claim.</p>
              <a href="/report" style={{ 
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 30px',
                background: '#a855f7',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#9333ea'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#a855f7'}
              >
                Report Incident
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {claims.map((claim: any) => (
                <div key={claim.id} style={{ 
                  padding: '25px',
                  border: '2px solid #2d2642',
                  borderRadius: '15px',
                  background: '#1a1825',
                  transition: 'all 0.3s',
                  color: '#b0a8d8'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(168,85,247,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2d2642';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#b0a8d8' }}>
                        {claim.claimNumber ? `${claim.claimNumber}` : `Claim #${claim.id}`}
                      </h3>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '5px 15px',
                        background: getStatusColor(claim.status),
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                        {claim.status}
                      </div>
                      {claim.incidentType && (
                        <div style={{ 
                          display: 'inline-block',
                          padding: '5px 15px',
                          background: '#2d2642',
                          color: '#b0a8d8',
                          borderRadius: '20px',
                          fontSize: '14px',
                        }}>
                          {claim.incidentType}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#a855f7' }}>
                        {claim.amountLost ? `${claim.amountLost} ${claim.losingAsset || 'ETH'}` : claim.reserved_amount + ' ETH'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7d7a91' }}>Claimed Amount</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', padding: '15px', background: '#2d2642', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#b0a8d8' }}>📋 Incident Summary</div>
                    <div style={{ fontSize: '14px', color: '#7d7a91', lineHeight: '1.6' }}>
                      {claim.description || 'No description provided'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#7d7a91', marginBottom: '5px' }}>Transaction Hash</div>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#b0a8d8', wordBreak: 'break-all' }}>{claim.txHash}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#7d7a91', marginBottom: '5px' }}>Phishing Domain</div>
                      <div style={{ fontSize: '14px', color: '#f87171', fontWeight: 'bold' }}>{claim.domain || 'N/A'}</div>
                    </div>
                  </div>

                  {claim.lossDescription && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#2d2642', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#b0a8d8', marginBottom: '5px', fontWeight: 'bold' }}>💔 Loss Details</div>
                      <div style={{ fontSize: '14px', color: '#7d7a91' }}>{claim.lossDescription}</div>
                    </div>
                  )}

                  {claim.evidenceDetails && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#2d2642', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#b0a8d8', marginBottom: '5px', fontWeight: 'bold' }}>🔍 Evidence</div>
                      <div style={{ fontSize: '14px', color: '#7d7a91', wordBreak: 'break-all' }}>{claim.evidenceDetails}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      onClick={() => setSelectedClaim(claim)}
                      style={{ 
                        padding: '10px 20px',
                        background: '#a855f7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#9333ea'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#a855f7'}
                      title="View evidence stored on IPFS"
                    >
                      📄 View Evidence
                    </button>
                    <button 
                      style={{ 
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#218838'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#28a745'}
                      title="Request emergency payout"
                    >
                      ⚡ Emergency Payout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evidence Modal */}
      {selectedClaim && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          overflowY: 'auto'
        }}
        onClick={() => setSelectedClaim(null)}>
          <div style={{ 
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: '20px auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0' }}>
              📄 {selectedClaim.claimNumber ? `Claim Details - ${selectedClaim.claimNumber}` : `Claim #${selectedClaim.id}`}
            </h2>
            
            {/* Status and Amount */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Status</div>
                <div style={{ 
                  padding: '10px',
                  background: getStatusColor(selectedClaim.status),
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {selectedClaim.status}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Claimed Amount</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f0f9ff',
                  color: '#004085',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '16px'
                }}>
                  {selectedClaim.amountLost ? `${selectedClaim.amountLost} ${selectedClaim.losingAsset || 'ETH'}` : selectedClaim.reserved_amount + ' ETH'}
                </div>
              </div>
            </div>

            {/* Incident Type */}
            {selectedClaim.incidentType && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Incident Type</div>
                <div style={{ 
                  padding: '10px',
                  background: '#e7f3ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#004085'
                }}>
                  {selectedClaim.incidentType}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedClaim.description && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>📝 Incident Description</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.6'
                }}>
                  {selectedClaim.description}
                </div>
              </div>
            )}

            {/* Loss Description */}
            {selectedClaim.lossDescription && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>💔 Loss Details</div>
                <div style={{ 
                  padding: '10px',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#856404',
                  lineHeight: '1.6'
                }}>
                  {selectedClaim.lossDescription}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>🔗 Technical Details</div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Transaction Hash</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {selectedClaim.txHash}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Phishing Domain</div>
                <div style={{ 
                  padding: '10px',
                  background: '#fff3cd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#856404',
                  fontWeight: 'bold'
                }}>
                  {selectedClaim.domain || 'N/A'}
                </div>
              </div>
            </div>

            {/* Evidence */}
            {selectedClaim.evidenceDetails && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>🔍 Evidence Details</div>
                <div style={{ 
                  padding: '10px',
                  background: '#e7f3ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#004085',
                  lineHeight: '1.6',
                  wordBreak: 'break-all'
                }}>
                  {selectedClaim.evidenceDetails}
                </div>
              </div>
            )}

            {/* Contact Email */}
            {selectedClaim.contactEmail && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>📧 Contact Email</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#333'
                }}>
                  {selectedClaim.contactEmail}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {selectedClaim.additionalDetails && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>📎 Additional Comments</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#004085',
                  lineHeight: '1.6'
                }}>
                  {selectedClaim.additionalDetails}
                </div>
              </div>
            )}

            {/* IPFS CID */}
            {selectedClaim.evidence_cid && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>IPFS CID</div>
                <div style={{ 
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all'
                }}>
                  {selectedClaim.evidence_cid}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedClaim.evidence_cid && (
                <button 
                  onClick={() => window.open(`https://ipfs.io/ipfs/${selectedClaim.evidence_cid}`, '_blank')}
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔗 Open in IPFS
                </button>
              )}
              <button 
                onClick={() => setSelectedClaim(null)}
                style={{ 
                  flex: 1,
                  padding: '12px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
