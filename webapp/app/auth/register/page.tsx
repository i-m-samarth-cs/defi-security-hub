'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    walletAddress: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Store user data (in production, use proper backend)
    localStorage.setItem('defi_auth_token', 'authenticated');
    localStorage.setItem('defi_user_email', formData.email);
    localStorage.setItem('defi_user_wallet', formData.walletAddress);
    
    // Redirect to home
    router.push('/');
    setLoading(false);
  };

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
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>🛡️</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Create Account</h1>
          <p style={{ color: '#666', margin: 0 }}>Join DeFi Security Suite</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Wallet Address (Optional)
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              placeholder="0x..."
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
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
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%',
              padding: '15px',
              background: loading ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating account...' : '✨ Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/auth/login" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
