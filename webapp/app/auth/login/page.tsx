'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple authentication (in production, use proper auth service)
    if (formData.email && formData.password) {
      // Store auth token
      localStorage.setItem('defi_auth_token', 'authenticated');
      localStorage.setItem('defi_user_email', formData.email);
      
      // Redirect to home
      router.push('/');
    } else {
      setError('Please enter email and password');
    }
    
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
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>DeFi Security Suite</h1>
          <p style={{ color: '#666', margin: 0 }}>Sign in to protect your assets</p>
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Email Address
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
                fontSize: '16px',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
              Password
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
                fontSize: '16px',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/auth/register" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
            Don't have an account? Register
          </a>
        </div>

        <div style={{ 
          marginTop: '30px',
          padding: '15px',
          background: '#e7f3ff',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#004085'
        }}>
          <strong>🔒 Secure Authentication</strong>
          <p style={{ margin: '5px 0 0 0' }}>Your credentials are encrypted and protected</p>
        </div>
      </div>
    </div>
  );
}
