'use client';
import { useState, useEffect } from 'react';
import WalletScanner from './components/WalletScanner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [triggerScan, setTriggerScan] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('defi_user_email');
    setUserEmail(email);
  }, []);

  const handleScanClick = () => {
    setTriggerScan(true);
  };

  const handleScanComplete = () => {
    setTriggerScan(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('defi_auth_token');
    localStorage.removeItem('defi_user_email');
    localStorage.removeItem('defi_admin_token');
    window.location.href = '/auth/login';
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        {/* Dark Theme Navigation */}
        <nav style={{
          background: '#0f0e17',
          borderBottom: '1px solid #2d2642',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(135deg, #a855f7 0%, #b0a8d8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🛡️ DeFi Security
            </span>
            <span style={{ fontSize: '12px', color: '#7d7a91' }}>Hub</span>
          </div>

          {/* Menu Items */}
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <NavLink href="/" label="Home" />
            <NavLink href="/pool" label="💰 Pool" />
            <NavLink href="/claims" label="📋 Claims" />
            <NavLink href="/report" label="🚨 Report" />
            <NavLink href="/security-center" label="🔒 Security" />
          </div>

          {/* Right Side Actions */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* SCAN Wallet Button */}
            <button
              onClick={handleScanClick}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b2ce9 100%)',
                color: '#b0a8d8',
                border: '1px solid #2d2642',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Scan your wallet extensions for threats"
            >
              <span>🔍</span>
              <span>SCAN</span>
            </button>

            {/* Notification Bell */}
            <button
              style={{
                background: '#1a1825',
                color: '#b0a8d8',
                border: '1px solid #2d2642',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2d2642';
                e.currentTarget.style.color = '#a855f7';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#1a1825';
                e.currentTarget.style.color = '#b0a8d8';
              }}
              title="Notifications"
            >
              🔔
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                background: '#dc3545',
                borderRadius: '50%'
              }}></span>
            </button>

            {/* User Menu or Login */}
            {userEmail ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: '#1a1825',
                    color: '#b0a8d8',
                    border: '1px solid #2d2642',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#2d2642';
                    e.currentTarget.style.borderColor = '#a855f7';
                    e.currentTarget.style.color = '#a855f7';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#1a1825';
                    e.currentTarget.style.borderColor = '#2d2642';
                    e.currentTarget.style.color = '#b0a8d8';
                  }}
                  title="User menu"
                >
                  👤 {userEmail.split('@')[0]}
                </button>
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: 0,
                    background: '#1a1825',
                    border: '1px solid #2d2642',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
                    minWidth: '220px',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #2d2642' }}>
                      <div style={{ fontSize: '12px', color: '#7d7a91' }}>Signed in as</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7' }}>{userEmail}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        background: 'transparent',
                        color: '#b0a8d8',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#2d2642';
                        e.currentTarget.style.color = '#dc3545';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#b0a8d8';
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a
                  href="/auth/login"
                  style={{
                    background: 'transparent',
                    color: '#b0a8d8',
                    border: '1px solid #2d2642',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#1a1825';
                    e.currentTarget.style.borderColor = '#a855f7';
                    e.currentTarget.style.color = '#a855f7';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#2d2642';
                    e.currentTarget.style.color = '#b0a8d8';
                  }}
                >
                  Sign In
                </a>
                <a
                  href="/auth/register"
                  style={{
                    background: '#a855f7',
                    color: '#0f0e17',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.5)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </nav>

        <WalletScanner triggerScan={triggerScan} onScanComplete={handleScanComplete} />
        {children}
      </body>
    </html>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        color: '#d6c9ff',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial",
        letterSpacing: '0.3px',
        padding: '8px 14px',
        borderRadius: '6px',
        transition: 'all 0.18s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = '#a855f7';
        e.currentTarget.style.background = '#1a1825';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = '#d6c9ff';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {label}
    </a>
  );
}
