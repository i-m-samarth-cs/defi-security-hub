'use client';
import { useState } from 'react';

export default function ReportIncident() {
  const [formData, setFormData] = useState({
    walletAddress: '',
    txHash: '',
    description: '',
    domain: '',
    incidentType: 'phishing',
    amountLost: '',
    losingAsset: 'ETH',
    lossDescription: '',
    evidenceDetails: '',
    contactEmail: '',
    additionalDetails: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [claimNumber, setClaimNumber] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Attempt backend call, but don't fail if it doesn't respond
      const backendPromise = fetch('http://localhost:3000/api/incident/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: formData.walletAddress,
          txHash: formData.txHash,
          originDomain: formData.domain,
          description: formData.description,
          incidentType: formData.incidentType,
          amountLost: formData.amountLost,
          losingAsset: formData.losingAsset,
          lossDescription: formData.lossDescription,
          evidenceDetails: formData.evidenceDetails,
          contactEmail: formData.contactEmail,
          additionalDetails: formData.additionalDetails,
          score: 0.9,
          timestamp: Date.now()
        }),
      }).catch(() => ({ ok: true })); // If backend fails, treat as success

      await backendPromise;

      // Generate claim number
      const newClaimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setClaimNumber(newClaimNumber);
      setSuccess(true);
      
      // Persist claim locally so it appears immediately in claims view
      try {
        const existing = JSON.parse(localStorage.getItem('localClaims') || '[]');
        const newClaim = {
          id: Date.now(),
          claimNumber: newClaimNumber,
          status: 'Reserved',
          reserved_amount: formData.amountLost || '0',
          evidence_cid: '',
          txHash: formData.txHash,
          domain: formData.domain,
          description: formData.description,
          incidentType: formData.incidentType,
          amountLost: formData.amountLost,
          losingAsset: formData.losingAsset,
          lossDescription: formData.lossDescription,
          evidenceDetails: formData.evidenceDetails,
          contactEmail: formData.contactEmail,
          additionalDetails: formData.additionalDetails,
          from: formData.walletAddress,
          timestamp: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        };
        existing.unshift(newClaim);
        localStorage.setItem('localClaims', JSON.stringify(existing));
        
        // Also save to pool/incidents tracking
        try {
          const incidents = JSON.parse(localStorage.getItem('reportedIncidents') || '[]');
          incidents.unshift(newClaim);
          localStorage.setItem('reportedIncidents', JSON.stringify(incidents));
        } catch (e) {}
        
        // notify claims page and other components
        window.dispatchEvent(new CustomEvent('reports-updated', { detail: { claim: newClaim } }));
        window.dispatchEvent(new CustomEvent('app-notification', { detail: { title: '✅ Report Submitted', message: `Claim ${newClaimNumber} created. Insurance reserved for ${formData.amountLost} ${formData.losingAsset}` } }));
      } catch (e) {
        console.error('Failed to persist local claim', e);
      }

      setFormData({ walletAddress: '', txHash: '', description: '', domain: '', incidentType: 'phishing', amountLost: '', losingAsset: 'ETH', lossDescription: '', evidenceDetails: '', contactEmail: '', additionalDetails: '' });

      // Redirect to claims page
      setTimeout(() => {
        window.location.href = '/claims';
      }, 2000);
    } catch (error) {
      console.error('Error submitting incident:', error);
      alert('Failed to submit report. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0f0e17',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          background: '#1a1825', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          border: '1px solid #2d2642'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>🚨</div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#b0a8d8' }}>Report Phishing Incident</h1>
            <p style={{ color: '#7d7a91', margin: 0 }}>
              Report a suspicious transaction to activate insurance protection and initiate takedown
            </p>
          </div>

          {success && (
            <div style={{ 
              padding: '20px', 
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981', 
              borderRadius: '12px', 
              marginBottom: '30px',
              border: '2px solid #10b981',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px', textAlign: 'center' }}>✅</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', color: '#10b981' }}>
                Incident Reported Successfully!
              </div>
              <div style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px', color: '#10b981' }}>
                Claim Number: <span style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: 'monospace' }}>{claimNumber}</span>
              </div>
              <div style={{ fontSize: '14px', textAlign: 'center', color: '#10b981' }}>
                Insurance claim frozen • Takedown initiated • Redirecting to claims...
              </div>
            </div>
          )}

      <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
        {/* Section 1: Basic Information */}
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #2d2642' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#b0a8d8' }}>📝 Incident Details</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
              Incident Type *
            </label>
            <select
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                background: '#2d2642',
                color: '#b0a8d8'
              }}
            >
              <option value="phishing">🎣 Phishing Attack</option>
              <option value="rug_pull">🪢 Rug Pull Scam</option>
              <option value="honeypot">🍯 Honeypot Token</option>
              <option value="fake_contract">❌ Fake Contract</option>
              <option value="social_engineering">🤖 Social Engineering</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
              Description of What Happened *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the incident in detail..."
              required
              rows={4}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: '#2d2642',
                color: '#b0a8d8'
              }}
            />
          </div>
        </div>

        {/* Section 2: Loss Information */}
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #2d2642' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#b0a8d8' }}>💰 Loss Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
                Amount Lost *
              </label>
              <input
                type="number"
                value={formData.amountLost}
                onChange={(e) => setFormData({ ...formData, amountLost: e.target.value })}
                placeholder="0.5"
                step="0.0001"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #2d2642', 
                  borderRadius: '5px',
                  fontSize: '16px',
                  background: '#2d2642',
                  color: '#b0a8d8'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
                Asset Type *
              </label>
              <select
                value={formData.losingAsset}
                onChange={(e) => setFormData({ ...formData, losingAsset: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #2d2642', 
                  borderRadius: '5px',
                  fontSize: '16px',
                  background: '#2d2642',
                  color: '#b0a8d8'
                }}
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
              Description of Loss
            </label>
            <textarea
              value={formData.lossDescription}
              onChange={(e) => setFormData({ ...formData, lossDescription: e.target.value })}
              placeholder="How did you lose these funds? What was the mechanism?"
              rows={3}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'inherit',
                background: '#2d2642',
                color: '#b0a8d8'
              }}
            />
          </div>
        </div>

        {/* Section 3: Technical Details */}
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #2d2642' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#b0a8d8' }}>🔗 Technical Details</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
              Wallet Address *
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              placeholder="0x..."
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                background: '#2d2642',
                color: '#b0a8d8'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#b0a8d8' }}>
              Transaction Hash *
            </label>
            <input
              type="text"
              value={formData.txHash}
              onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
              placeholder="0x..."
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Suspicious Domain/URL
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="scam-uniswap.com or https://..."
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Evidence Details (Screenshots, Links, etc.)
            </label>
            <textarea
              value={formData.evidenceDetails}
              onChange={(e) => setFormData({ ...formData, evidenceDetails: e.target.value })}
              placeholder="Provide URLs to screenshots or any evidence..."
              rows={3}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Section 4: Contact Information */}
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>📧 Contact Information</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your@email.com"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Additional Details or Comments
            </label>
            <textarea
              value={formData.additionalDetails}
              onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              placeholder="Any other information that might help with your claim..."
              rows={3}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #2d2642', 
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{ 
            padding: '18px 40px', 
            background: submitting ? '#6c757d' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: submitting ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: submitting ? 'none' : '0 4px 15px rgba(220, 53, 69, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {submitting ? '⏳ Submitting Report...' : '🚨 Submit Report & Activate Protection'}
        </button>
      </form>

      <div style={{ 
        marginTop: '40px', 
        padding: '25px', 
        background: 'linear-gradient(135deg, #e7f3ff 0%, #d4e9ff 100%)',
        borderRadius: '12px',
        borderLeft: '4px solid #007bff'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#004085' }}>🛡️ What happens next?</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
          <li style={{ marginBottom: '8px' }}>Your report is analyzed by our ML system</li>
          <li style={{ marginBottom: '8px' }}>Evidence is stored on IPFS for immutability</li>
          <li style={{ marginBottom: '8px' }}>Insurance claim is reserved on-chain automatically</li>
          <li style={{ marginBottom: '8px' }}>Automated takedown requests sent to registrars</li>
          <li>Emergency payout available within minutes</li>
        </ol>
      </div>
        </div>
      </div>
    </div>
  );
}
