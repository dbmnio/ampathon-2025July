// Options page script for Amazon Review Gaslighter
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const creativitySelect = document.getElementById('creativity');
  const cacheTimeSelect = document.getElementById('cacheTime');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const clearBtn = document.getElementById('clearBtn');
  const status = document.getElementById('status');
  const templateMode = document.getElementById('templateMode');
  const aiMode = document.getElementById('aiMode');
  
  // Load saved settings
  loadSettings();
  updateModeDisplay();
  
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'openaiApiKey',
        'selectedModel',
        'creativity',
        'cacheTime'
      ]);
      
      if (result.openaiApiKey) {
        apiKeyInput.value = result.openaiApiKey;
      }
      
      if (result.selectedModel) {
        modelSelect.value = result.selectedModel;
      }
      
      if (result.creativity) {
        creativitySelect.value = result.creativity;
      }
      
      if (result.cacheTime !== undefined) {
        cacheTimeSelect.value = result.cacheTime;
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  function updateModeDisplay() {
    const hasApiKey = apiKeyInput.value.trim().length > 0;
    
    if (hasApiKey) {
      templateMode.classList.remove('active');
      aiMode.classList.add('active');
    } else {
      templateMode.classList.add('active');
      aiMode.classList.remove('active');
    }
  }
  
  function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 5000);
    }
  }
  
  async function testApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showStatus('API key should start with "sk-"', 'error');
      return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    showStatus('Testing API key...', 'info');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelSelect.value,
          messages: [
            {
              role: 'user',
              content: 'Say "API test successful" in a funny way'
            }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const testMessage = data.choices[0].message.content.trim();
        showStatus(`✅ API key works! Test response: "${testMessage}"`, 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error('API test error:', error);
      
      if (error.message.includes('quota')) {
        showStatus('❌ API key valid but you\'ve exceeded your quota. Check your OpenAI billing.', 'error');
      } else if (error.message.includes('invalid')) {
        showStatus('❌ Invalid API key. Please check and try again.', 'error');
      } else {
        showStatus(`❌ API test failed: ${error.message}`, 'error');
      }
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test API Key';
    }
  }
  
  async function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    
    try {
      await chrome.storage.sync.set({
        openaiApiKey: apiKey,
        selectedModel: modelSelect.value,
        creativity: creativitySelect.value,
        cacheTime: parseInt(cacheTimeSelect.value)
      });
      
      updateModeDisplay();
      
      if (apiKey) {
        showStatus('✅ Settings saved! AI mode enabled.', 'success');
      } else {
        showStatus('✅ Settings saved! Using template mode.', 'success');
      }
      
      // Notify all Amazon tabs about the settings change
      const tabs = await chrome.tabs.query({
        url: ['*://*.amazon.com/*', '*://*.amazon.co.uk/*', '*://*.amazon.ca/*']
      });
      
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'settingsUpdated',
          hasApiKey: !!apiKey
        }).catch(() => {
          // Ignore errors for tabs where content script isn't loaded
        });
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('❌ Error saving settings. Please try again.', 'error');
    }
  }
  
  async function clearSettings() {
    if (confirm('Are you sure you want to clear your API key and reset all settings?')) {
      try {
        await chrome.storage.sync.clear();
        
        apiKeyInput.value = '';
        modelSelect.value = 'gpt-3.5-turbo';
        creativitySelect.value = '1.0';
        cacheTimeSelect.value = '15';
        
        updateModeDisplay();
        showStatus('✅ All settings cleared. Using template mode.', 'success');
        
      } catch (error) {
        console.error('Error clearing settings:', error);
        showStatus('❌ Error clearing settings. Please try again.', 'error');
      }
    }
  }
  
  // Event listeners
  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testApiKey);
  clearBtn.addEventListener('click', clearSettings);
  
  // Update mode display when API key changes
  apiKeyInput.addEventListener('input', updateModeDisplay);
  
  // Auto-save on change
  [modelSelect, creativitySelect, cacheTimeSelect].forEach(element => {
    element.addEventListener('change', saveSettings);
  });
});