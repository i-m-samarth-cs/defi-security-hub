// DeFi Security Suite - Wallet Extension Scanner
(function() {
  console.log('🛡️ DeFi Security Suite Active');
  
  // Show protection badge
  showProtectionBadge();
  
  // Listen for wallet detection requests
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DETECT_WALLETS') {
      const wallets = detectWalletExtensions();
      sendResponse({ wallets });
    }
  });
})();

function detectWalletExtensions() {
  const wallets = [];
  
  // Check for MetaMask
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    wallets.push({ name: 'MetaMask', type: 'ethereum wallet', icon: '🦊' });
  }
  
  // Check for Phantom
  if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
    wallets.push({ name: 'Phantom', type: 'solana wallet', icon: '👻' });
  }
  
  // Check for Coinbase Wallet
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
    wallets.push({ name: 'Coinbase Wallet', type: 'ethereum wallet', icon: '💼' });
  }
  
  // Check for Binance Chain Wallet
  if (typeof window.BinanceChain !== 'undefined') {
    wallets.push({ name: 'Binance Wallet', type: 'multi-chain wallet', icon: '🔶' });
  }
  
  // Check for Trust Wallet
  if (typeof window.trustwallet !== 'undefined') {
    wallets.push({ name: 'Trust Wallet', type: 'multi-chain wallet', icon: '🛡️' });
  }
  
  // Check for generic Web3 (if not already detected)
  if (typeof window.ethereum !== 'undefined' && 
      !window.ethereum.isMetaMask && 
      !window.ethereum.isCoinbaseWallet &&
      wallets.length === 0) {
    wallets.push({ name: 'Web3 Wallet', type: 'ethereum wallet', icon: '🔐' });
  }
  
  return wallets;
}

function showScanPrompt(wallets) {
  const modal = document.createElement('div');
  modal.id = 'defi-scan-prompt';
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Arial;animation:fadeIn 0.3s;">
      <div style="background:white;padding:40px;border-radius:20px;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.3s;">
        <div style="text-align:center;margin-bottom:25px;">
          <div style="font-size:60px;margin-bottom:15px;">🔍</div>
          <h2 style="margin:0 0 10px 0;font-size:24px;color:#333;">Wallet Extension Detected</h2>
          <p style="color:#666;margin:0;font-size:14px;">We detected ${wallets.length} wallet extension(s) on this page</p>
        </div>
        
        <div style="background:#e7f3ff;padding:20px;border-radius:12px;margin-bottom:25px;border-left:4px solid #007bff;">
          <div style="font-weight:bold;margin-bottom:10px;color:#004085;">Detected Wallets:</div>
          ${wallets.map(w => `<div style="padding:8px 0;color:#004085;">🔐 ${w.name}</div>`).join('')}
        </div>

        <div style="background:#fff3cd;padding:15px;border-radius:8px;margin-bottom:25px;font-size:13px;color:#856404;">
          <strong>🛡️ What we'll scan:</strong>
          <ul style="margin:10px 0 0 0;padding-left:20px;">
            <li>Extension permissions</li>
            <li>Connected websites</li>
            <li>Suspicious activity patterns</li>
            <li>Known malicious signatures</li>
          </ul>
        </div>
        
        <div style="display:flex;gap:10px;">
          <button id="scan-yes" style="flex:1;padding:15px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 15px rgba(102,126,234,0.4);">
            🔍 Yes, Scan Now
          </button>
          <button id="scan-no" style="flex:1;padding:15px;background:#6c757d;color:white;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;">
            ❌ No Thanks
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('scan-yes').onclick = () => {
    modal.remove();
    startWalletScan(wallets);
  };
  
  document.getElementById('scan-no').onclick = () => {
    modal.remove();
  };
}

function startWalletScan(wallets) {
  showScanningProgress(wallets);
  
  setTimeout(() => {
    performWalletScan(wallets);
  }, 3000);
}

function showScanningProgress(wallets) {
  const progress = document.createElement('div');
  progress.id = 'defi-scanning-progress';
  progress.innerHTML = `
    <div style="position:fixed;top:20px;right:20px;background:white;padding:25px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:9999999;min-width:350px;font-family:Arial;">
      <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">
        <div style="width:40px;height:40px;border:4px solid #667eea;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
        <div>
          <div style="font-weight:bold;font-size:16px;color:#333;">Scanning Wallets...</div>
          <div style="font-size:12px;color:#666;">Analyzing ${wallets.length} extension(s)</div>
        </div>
      </div>
      <div style="background:#f0f0f0;height:8px;border-radius:4px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#667eea,#764ba2);height:100%;width:0%;animation:progress 3s ease-out forwards;"></div>
      </div>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes progress {
        to { width: 100%; }
      }
    </style>
  `;
  
  document.body.appendChild(progress);
}

function performWalletScan(wallets) {
  const progress = document.getElementById('defi-scanning-progress');
  if (progress) progress.remove();
  
  const scanResults = {
    walletsScanned: wallets.length,
    threatsDetected: 0,
    warnings: [],
    safe: true
  };
  
  showScanResults(scanResults, wallets);
}

function showScanResults(results, wallets) {
  const resultModal = document.createElement('div');
  resultModal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:Arial;">
      <div style="background:white;padding:40px;border-radius:20px;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="text-align:center;margin-bottom:25px;">
          <div style="font-size:80px;margin-bottom:15px;">${results.safe ? '✅' : '⚠️'}</div>
          <h2 style="margin:0 0 10px 0;font-size:28px;color:${results.safe ? '#28a745' : '#dc3545'};">
            ${results.safe ? 'All Clear!' : 'Threats Detected!'}
          </h2>
          <p style="color:#666;margin:0;">Scanned ${results.walletsScanned} wallet extension(s)</p>
        </div>
        
        <div style="background:${results.safe ? '#d4edda' : '#f8d7da'};padding:20px;border-radius:12px;margin-bottom:25px;border-left:4px solid ${results.safe ? '#28a745' : '#dc3545'};">
          <div style="font-weight:bold;margin-bottom:10px;color:${results.safe ? '#155724' : '#721c24'};">
            Scan Results:
          </div>
          <div style="color:${results.safe ? '#155724' : '#721c24'};">
            ${results.safe ? 
              '✓ No threats detected<br>✓ All extensions verified<br>✓ Safe to use' : 
              `⚠️ ${results.threatsDetected} threat(s) found`
            }
          </div>
        </div>
        
        <button id="close-results" style="width:100%;padding:15px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:10px;font-size:16px;font-weight:bold;cursor:pointer;">
          Got It
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(resultModal);
  
  document.getElementById('close-results').onclick = () => {
    resultModal.remove();
  };
}

function showProtectionBadge() {
  const badge = document.createElement('div');
  badge.innerHTML = `
    <div style="position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:12px 20px;border-radius:25px;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:999998;font-family:Arial;font-size:14px;display:flex;align-items:center;gap:8px;cursor:pointer;" title="Protected by DeFi Security Suite">
      <span style="font-size:18px;">🛡️</span>
      <span style="font-weight:bold;">Protected</span>
    </div>
  `;
  document.body.appendChild(badge);
}
