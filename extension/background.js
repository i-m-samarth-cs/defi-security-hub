// DeFi Security Suite - Background Script (No MetaMask Required)
const BACKEND_URL = 'http://localhost:3000';

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOG_THREAT') {
    logThreatToBackend(message.payload)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ success: false }));
    return true;
  }
  
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: message.payload.title,
      message: message.payload.message,
      priority: 2
    });
    sendResponse({ success: true });
  }
  
  if (message.type === 'DETECT_WALLETS') {
    // Forward to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'DETECT_WALLETS' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
});

async function logThreatToBackend(threatData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/incident/log-threat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threatData),
    });
    
    if (response.ok) {
      console.log('Threat logged to backend');
      return { success: true };
    }
  } catch (error) {
    console.log('Backend not available:', error.message);
  }
  
  return { success: false };
}

console.log('🛡️ DeFi Security Suite Background Script Active');
