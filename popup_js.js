// Popup script for Amazon Review Gaslighter
document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');
  
  // Get current tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  
  // Check if we're on an Amazon page
  const isAmazonPage = currentTab.url.includes('amazon.com') || 
                       currentTab.url.includes('amazon.co.uk') ||
                       currentTab.url.includes('amazon.ca') ||
                       currentTab.url.includes('amazon.de') ||
                       currentTab.url.includes('amazon.fr') ||
                       currentTab.url.includes('amazon.it') ||
                       currentTab.url.includes('amazon.es');
  
  if (!isAmazonPage) {
    toggleBtn.textContent = 'Visit Amazon to use';
    toggleBtn.disabled = true;
    toggleBtn.classList.add('off');
    status.textContent = 'Navigate to Amazon to use this extension';
    status.classList.add('off');
    return;
  }
  
  // Get current status from content script
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'getStatus' });
    updateUI(response.enabled);
  } catch (error) {
    console.log('Content script not ready, assuming disabled');
    updateUI(false);
  }
  
  // Handle toggle button click
  toggleBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'toggle' });
      updateUI(response.enabled);
    } catch (error) {
      console.error('Error toggling extension:', error);
      status.textContent = 'Error: Please refresh the page';
      status.classList.remove('on');
      status.classList.add('off');
    }
  });
  
  function updateUI(enabled) {
    if (enabled) {
      toggleBtn.textContent = 'Turn OFF Gaslighter';
      toggleBtn.classList.remove('off');
      status.textContent = '✅ Gaslighter is ON - Reviews are being replaced';
      status.classList.remove('off');
      status.classList.add('on');
    } else {
      toggleBtn.textContent = 'Turn ON Gaslighter';
      toggleBtn.classList.add('off');
      status.textContent = '❌ Gaslighter is OFF - Showing original reviews';
      status.classList.remove('on');
      status.classList.add('off');
    }
  }
});