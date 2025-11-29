'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const router = useRouter();

  const [claims, setClaims] = useState([
    { id: 1, claimant: '0x123...abc', amount: '1.0 ETH', status: 'Reserved', evidenceCid: 'QmAbc123', domain: 'scam-uniswap.com' },
    { id: 2, claimant: '0x456...def', amount: '0.5 ETH', status: 'Under Review', evidenceCid: 'QmDef456', domain: 'fake-metamask.io' },
    { id: 3, claimant: '0x789...ghi', amount: '2.0 ETH', status: 'Pending', evidenceCid: 'QmGhi789', domain: 'phishing-opensea.com' },
  ]);

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('defi_auth_token');
    const adminToken = localStorage.getItem('defi_admin_token');
    
    if (!authToken) {
      router.push('/auth/login');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Check if user is admin
    if (adminToken === 'admin_authenticated') {
      setIsAdmin(true);
    } else {
      setShowAdminLogin(true);
    }
    
    setLoading(false);
  }, [router]);

  const handleAdminLogin = () => {
    // Simple admin password check (in production, use proper backend auth)
    if (adminPassword === 'admin123') {
      localStorage.setItem('defi_admin_token', 'admin_authenticated');
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      alert('Invalid admin password');
    }
  };

  const handleApprove = (claimId: number) => {
    console.log('Approving claim', claimId);
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: 'Approved' } : c));
  };

  const handleReject = (claimId: number) => {
    console.log('Rejecting claim', claimId);
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: 'Rejected' } : c));
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Loading...</div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          maxWidth: '450px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🔐</div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Admin Access Required</h1>
            <p style={{ color: '#666', margin: 0 }}>Enter admin password to continue</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Admin Password
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={handleAdminLogin}
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
            🔓 Unlock Admin Panel
          </button>

          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            background: '#fff3cd',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#856404'
          }}>
            <strong>⚠️ Demo Password:</strong> admin123
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#28a745';
      case 'Rejected': return '#dc3545';
      case 'Under Review': return '#ffc107';
      case 'Reserved': return '#007bff';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>⚙️ Admin Dashboard</h1>
            <p style={{ color: '#666', margin: 0 }}>Review and approve claims</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('defi_admin_token');
              setIsAdmin(false);
              setShowAdminLogin(true);
            }}
            style={{ 
              padding: '12px 24px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            title="Logout from admin panel"
          >
            🚪 Logout
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Pool Balance</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#667eea' }}>10.5 ETH</p>
          </div>
          <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Reserved</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>2.3 ETH</p>
          </div>
          <div style={{ 
            background: 'white', 
            borderRadius: '15px', 
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Pending Claims</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{claims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected').length}</p>
          </div>
        </div>

        {/* Claims Queue */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 25px 0', fontSize: '24px' }}>📊 Claims Review Queue</h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {claims.map(claim => (
              <div key={claim.id} style={{ 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Claim #{claim.id}</h3>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '5px 15px',
                      background: getStatusColor(claim.status),
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {claim.status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                      {claim.amount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Claim Amount</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Claimant</div>
                    <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#333' }}>{claim.claimant}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Phishing Domain</div>
                    <div style={{ fontSize: '14px', color: '#dc3545', fontWeight: 'bold' }}>{claim.domain}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Evidence CID</div>
                    <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#333' }}>{claim.evidenceCid}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => window.open(`https://ipfs.io/ipfs/${claim.evidenceCid}`, '_blank')}
                    style={{ 
                      padding: '10px 20px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    title="View evidence on IPFS"
                  >
                    📄 View Evidence
                  </button>
                  {claim.status !== 'Approved' && claim.status !== 'Rejected' && (
                    <>
                      <button 
                        onClick={() => handleApprove(claim.id)}
                        style={{ 
                          padding: '10px 20px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        title="Approve claim and release funds"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        onClick={() => handleReject(claim.id)}
                        style={{ 
                          padding: '10px 20px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        title="Reject claim"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
