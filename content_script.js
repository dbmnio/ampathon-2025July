// Amazon Review Gaslighter - Content Script
(function() {
  'use strict';
  
  let isEnabled = true;
  let processedReviews = new Set();
  
  // Extract product name from Amazon page
  function getProductName() {
    const selectors = [
      '#productTitle',
      '.product-title',
      '[data-automation-id="product-title"]',
      '.a-size-large.product-title',
      'h1.a-size-large',
      'h1 span'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    // Fallback: try to get from page title
    const pageTitle = document.title;
    if (pageTitle.includes('Amazon')) {
      return pageTitle.split(' - ')[0] || 'product';
    }
    
    return 'product';
  }
  
  // Find all review text elements
  function findReviewElements() {
    const selectors = [
      '[data-hook="review-body"] span',
      '.review-text',
      '.cr-original-review-text',
      '[data-hook="review-body"]',
      '.reviewText',
      '.review-item-content .review-text'
    ];
    
    const reviews = [];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent.trim().length > 20 && !processedReviews.has(el)) {
          reviews.push(el);
        }
      });
    }
    
    return reviews;
  }
  
  // Replace review text with fake content
  function replaceReview(element, productName) {
    if (processedReviews.has(element)) return;
    
    const originalText = element.textContent;
    const fakeReview = generateFakeReview(productName);
    
    // Store original text as data attribute
    element.setAttribute('data-original-text', originalText);
    element.setAttribute('data-gaslighter-processed', 'true');
    
    // Replace the text
    element.textContent = fakeReview;
    
    // Add a subtle indicator
    element.style.fontStyle = 'italic';
    element.style.opacity = '0.95';
    
    processedReviews.add(element);
    
    console.log('Gaslighter: Replaced review:', originalText.substring(0, 50) + '...');
  }
  
  // Restore original review text
  function restoreReview(element) {
    const originalText = element.getAttribute('data-original-text');
    if (originalText) {
      element.textContent = originalText;
      element.style.fontStyle = '';
      element.style.opacity = '';
      element.removeAttribute('data-gaslighter-processed');
      processedReviews.delete(element);
    }
  }
  
  // Process all reviews on the page
  function processReviews() {
    if (!isEnabled) return;
    
    const productName = getProductName();
    const reviewElements = findReviewElements();
    
    console.log(`Gaslighter: Found ${reviewElements.length} reviews for product: ${productName}`);
    
    reviewElements.forEach(element => {
      replaceReview(element, productName);
    });
  }
  
  // Restore all reviews to original state
  function restoreAllReviews() {
    const processedElements = document.querySelectorAll('[data-gaslighter-processed="true"]');
    processedElements.forEach(element => {
      restoreReview(element);
    });
  }
  
  // Toggle extension on/off
  function toggleGaslighter() {
    isEnabled = !isEnabled;
    
    if (isEnabled) {
      processReviews();
      showNotification('Amazon Review Gaslighter: ON');
    } else {
      restoreAllReviews();
      showNotification('Amazon Review Gaslighter: OFF');
    }
  }
  
  // Show temporary notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #232f3e;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  // Observe DOM changes for dynamically loaded reviews
  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const hasReviews = node.querySelectorAll && (
              node.querySelectorAll('[data-hook="review-body"]').length > 0 ||
              node.querySelectorAll('.review-text').length > 0
            );
            
            if (hasReviews) {
              shouldProcess = true;
            }
          }
        });
      });
      
      if (shouldProcess && isEnabled) {
        setTimeout(processReviews, 500); // Small delay to ensure DOM is ready
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Add keyboard shortcut (Ctrl+Shift+G)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
      e.preventDefault();
      toggleGaslighter();
    }
  });
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      toggleGaslighter();
      sendResponse({ enabled: isEnabled });
    } else if (request.action === 'getStatus') {
      sendResponse({ enabled: isEnabled });
    }
  });
  
  // Initialize
  function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(processReviews, 1000);
      });
    } else {
      setTimeout(processReviews, 1000);
    }
    
    setupObserver();
    showNotification('Amazon Review Gaslighter loaded! Press Ctrl+Shift+G to toggle');
  }
  
  // Start the extension
  init();
})();