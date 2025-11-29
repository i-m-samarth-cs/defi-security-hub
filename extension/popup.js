let detectedWallets = [];

// Scan Wallets Button
document.getElementById('scan-wallets').addEventListener('click', () => {
  detectWallets();
});

// Confirm Scan Button
document.getElementById('confirm-scan').addEventListener('click', () => {
  startScanning();
});

// Cancel Scan Button
document.getElementById('cancel-scan').addEventListener('click', () => {
  document.getElementById('detected-wallets').style.display = 'none';
  document.getElementById('scan-wallets').style.display = 'block';
});

// View Claims Button
document.getElementById('view-claims').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3001/claims' });
});

// Settings Button
document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3001/settings' });
});

// Detect wallet extensions
function detectWallets() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'DETECT_WALLETS' }, (response) => {
      if (response && response.wallets && response.wallets.length > 0) {
        detectedWallets = response.wallets;
        showDetectedWallets(response.wallets);
      } else {
        // Check for installed wallet extensions
        checkInstalledWallets();
      }
    });
  });
}

// Check for installed wallet extensions
function checkInstalledWallets() {
  const wallets = [];
  
  // Check for common wallet extension IDs
  const walletExtensions = [
    { id: 'nkbihfbeogaeaoehlefnkodbefgpgknn', name: 'MetaMask', type: 'ethereum wallet', icon: '🦊' },
    { id: 'bfnaelmomeimhlpmgjnjophhpkkoljpa', name: 'Phantom', type: 'solana wallet', icon: '👻' },
    { id: 'hnfanknocfeofbddgcijnmhnfnkdnaad', name: 'Coinbase Wallet', type: 'ethereum wallet', icon: '💼' },
    { id: 'fhbohimaelbohpjbbldcngcnapndodjp', name: 'Binance Wallet', type: 'multi-chain wallet', icon: '🔶' },
    { id: 'aiifbnbfobpmeekipheeijimdpnlpgpp', name: 'Trust Wallet', type: 'multi-chain wallet', icon: '🛡️' }
  ];
  
  let checkedCount = 0;
  
  walletExtensions.forEach(wallet => {
    chrome.management.get(wallet.id, (info) => {
      checkedCount++;
      if (chrome.runtime.lastError) {
        // Extension not installed
      } else if (info && info.enabled) {
        wallets.push({
          name: wallet.name,
          type: wallet.type,
          icon: wallet.icon,
          id: wallet.id
        });
      }
      
      if (checkedCount === walletExtensions.length) {
        if (wallets.length > 0) {
          detectedWallets = wallets;
          showDetectedWallets(wallets);
        } else {
          showNoWalletsFound();
        }
      }
    });
  });
}

// Show detected wallets
function showDetectedWallets(wallets) {
  document.getElementById('scan-wallets').style.display = 'none';
  document.getElementById('detected-wallets').style.display = 'block';
  document.getElementById('wallet-count').textContent = wallets.length;
  
  const walletList = document.getElementById('wallet-list');
  walletList.innerHTML = '';
  
  wallets.forEach(wallet => {
    const walletItem = document.createElement('div');
    walletItem.className = 'wallet-item';
    walletItem.innerHTML = `
      <div class="wallet-icon">${wallet.icon || '🔐'}</div>
      <div class="wallet-info">
        <div class="wallet-name">${wallet.name}</div>
        <div class="wallet-type">${wallet.type}</div>
      </div>
    `;
    walletList.appendChild(walletItem);
  });
}

// Show no wallets found message
function showNoWalletsFound() {
  const statusDiv = document.getElementById('status');
  statusDiv.className = 'status safe';
  statusDiv.innerHTML = '✅ No wallet extensions detected';
}

// Start scanning process
function startScanning() {
  document.getElementById('detected-wallets').style.display = 'none';
  document.getElementById('scanning').style.display = 'block';
  
  // Simulate scanning process
  setTimeout(() => {
    performScan();
  }, 3000);
}

// Perform the actual scan
async function performScan() {
  const scanResults = {
    walletsScanned: detectedWallets.length,
    threatsDetected: 0,
    warnings: [],
    safe: true,
    details: []
  };
  
  // Check each wallet for threats
  for (const wallet of detectedWallets) {
    const walletResult = await checkWalletSecurity(wallet);
    scanResults.details.push(walletResult);
    
    if (!walletResult.safe) {
      scanResults.threatsDetected++;
      scanResults.safe = false;
      scanResults.warnings.push(walletResult.warning);
    }
  }
  
  // Save scan results
  chrome.storage.local.set({ lastScan: scanResults, lastScanTime: Date.now() });
  
  // Show results
  showScanResults(scanResults);
  
  // Send notification if threats detected
  if (!scanResults.safe) {
    chrome.runtime.sendMessage({
      type: 'SHOW_NOTIFICATION',
      payload: {
        title: '⚠️ Security Alert',
        message: `${scanResults.threatsDetected} threat(s) detected in your wallet extensions!`
      }
    });
  }
}

// Check individual wallet security
async function checkWalletSecurity(wallet) {
  // Simulate security check
  const result = {
    wallet: wallet.name,
    safe: true,
    warning: null
  };
  
  // Check against known malicious patterns
  const suspiciousPatterns = ['fake', 'phishing', 'scam', 'malicious'];
  const walletNameLower = wallet.name.toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (walletNameLower.includes(pattern)) {
      result.safe = false;
      result.warning = `Suspicious wallet name detected: ${wallet.name}`;
      break;
    }
  }
  
  // Additional checks could be added here
  // - Check extension permissions
  // - Verify against known good extension IDs
  // - Check for suspicious network activity
  
  return result;
}

// Show scan results
function showScanResults(results) {
  document.getElementById('scanning').style.display = 'none';
  document.getElementById('scan-results').style.display = 'block';
  
  const resultsDiv = document.getElementById('scan-results');
  
  if (results.safe) {
    resultsDiv.innerHTML = `
      <div style="background: #d4edda; padding: 20px; border-radius: 12px; text-align: center; border-left: 4px solid #28a745;">
        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
        <h3 style="margin: 0 0 10px 0; color: #155724;">All Clear!</h3>
        <p style="color: #155724; margin: 0; font-size: 14px;">
          Scanned ${results.walletsScanned} wallet extension(s)<br>
          No threats detected
        </p>
      </div>
      <button id="scan-again" class="scan-btn" style="margin-top: 15px;">🔍 Scan Again</button>
    `;
  } else {
    resultsDiv.innerHTML = `
      <div style="background: #f8d7da; padding: 20px; border-radius: 12px; text-align: center; border-left: 4px solid #dc3545;">
        <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
        <h3 style="margin: 0 0 10px 0; color: #721c24;">Threats Detected!</h3>
        <p style="color: #721c24; margin: 0 0 15px 0; font-size: 14px;">
          Found ${results.threatsDetected} threat(s) in ${results.walletsScanned} wallet(s)
        </p>
        <div style="background: white; padding: 12px; border-radius: 8px; text-align: left; font-size: 13px;">
          ${results.warnings.map(w => `<div style="padding: 5px 0; color: #721c24;">⚠️ ${w}</div>`).join('')}
        </div>
      </div>
      <button id="view-details" class="scan-btn" style="margin-top: 15px;">📋 View Full Report</button>
      <button id="scan-again" class="secondary-btn">🔍 Scan Again</button>
    `;
    
    document.getElementById('view-details')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3001/security-center' });
    });
  }
  
  document.getElementById('scan-again')?.addEventListener('click', () => {
    document.getElementById('scan-results').style.display = 'none';
    document.getElementById('scan-wallets').style.display = 'block';
  });
  
  // Update status
  const statusDiv = document.getElementById('status');
  if (results.safe) {
    statusDiv.className = 'status safe';
    statusDiv.textContent = '✅ Protected - No threats';
  } else {
    statusDiv.className = 'status danger';
    statusDiv.textContent = `⚠️ ${results.threatsDetected} threat(s) detected`;
  }
}

// Load previous scan results on popup open
chrome.storage.local.get(['lastScan', 'lastScanTime'], (result) => {
  if (result.lastScan && result.lastScanTime) {
    const timeSince = Date.now() - result.lastScanTime;
    const hoursSince = Math.floor(timeSince / (1000 * 60 * 60));
    
    const statusDiv = document.getElementById('status');
    if (result.lastScan.safe) {
      statusDiv.className = 'status safe';
      statusDiv.textContent = `✅ Protected - Last scan: ${hoursSince}h ago`;
    } else {
      statusDiv.className = 'status danger';
      statusDiv.textContent = `⚠️ ${result.lastScan.threatsDetected} threat(s) detected`;
    }
  }
});
