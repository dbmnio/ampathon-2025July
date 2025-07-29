// AI Review Generator for Amazon Review Gaslighter
class AIReviewGenerator {
  constructor() {
    this.cache = new Map();
    this.settings = {
      apiKey: null,
      model: 'gpt-3.5-turbo',
      creativity: 1.0,
      cacheTime: 15 // minutes
    };
    this.loadSettings();
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'openaiApiKey',
        'selectedModel',
        'creativity',
        'cacheTime'
      ]);
      
      this.settings = {
        apiKey: result.openaiApiKey || null,
        model: result.selectedModel || 'gpt-3.5-turbo',
        creativity: parseFloat(result.creativity) || 1.0,
        cacheTime: parseInt(result.cacheTime) || 15
      };
      
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  }
  
  isAvailable() {
    return this.settings.apiKey && this.settings.apiKey.startsWith('sk-');
  }
  
  getCacheKey(productName) {
    return `ai_review_${productName.toLowerCase().replace(/[^\w]/g, '_')}`;
  }
  
  getCachedReview(productName) {
    if (this.settings.cacheTime === 0) return null;
    
    const cacheKey = this.getCacheKey(productName);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60);
      if (ageMinutes < this.settings.cacheTime) {
        return cached.review;
      } else {
        this.cache.delete(cacheKey);
      }
    }
    
    return null;
  }
  
  setCachedReview(productName, review) {
    if (this.settings.cacheTime === 0) return;
    
    const cacheKey = this.getCacheKey(productName);
    this.cache.set(cacheKey, {
      review: review,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  createPrompt(productName) {
    const prompts = [
      `Write a hilarious Amazon review for "${productName}" that sounds completely paranoid and suspicious of the product, as if it's watching you or plotting something. Make it funny but believable. Keep it under 100 words.`,
      
      `Create a funny Amazon review for "${productName}" that gets way too existential and philosophical about the purchase, questioning the meaning of life and consumerism. Make it absurd but entertaining. Keep it under 100 words.`,
      
      `Write an Amazon review for "${productName}" where the reviewer wildly over-analyzes every aspect of the product and creates elaborate theories about its hidden features or purposes. Make it humorous and obsessive. Keep it under 100 words.`,
      
      `Create a completely absurd Amazon review for "${productName}" where the reviewer claims it has impossible side effects or magical properties. Make it ridiculous but entertaining. Keep it under 100 words.`,
      
      `Write a dramatically over-the-top Amazon review for "${productName}" where the reviewer acts like this purchase changed their entire life in the most ridiculous ways possible. Make it funny and melodramatic. Keep it under 100 words.`,
      
      `Create a funny Amazon review for "${productName}" where the reviewer complains about the weirdest, most irrelevant things that have nothing to do with the actual product quality. Make it entertainingly nitpicky. Keep it under 100 words.`
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  async generateReview(productName) {
    // Check cache first
    const cached = this.getCachedReview(productName);
    if (cached) {
      console.log('Gaslighter AI: Using cached review for', productName);
      return cached;
    }
    
    if (!this.isAvailable()) {
      throw new Error('AI not available - no API key configured');
    }
    
    const prompt = this.createPrompt(productName);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'system',
              content: 'You are a master of writing hilariously weird Amazon reviews that sound believable but are completely absurd. Always stay in character as a customer who bought the product.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: this.settings.creativity,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const review = data.choices[0].message.content.trim();
      
      // Cache the result
      this.setCachedReview(productName, review);
      
      console.log('Gaslighter AI: Generated review for', productName);
      return review;
      
    } catch (error) {
      console.error('Gaslighter AI: Error generating review:', error);
      
      // Provide helpful error messages
      if (error.message.includes('quota')) {
        throw new Error('OpenAI quota exceeded. Check your billing at platform.openai.com');
      } else if (error.message.includes('invalid')) {
        throw new Error('Invalid API key. Please check your settings.');
      } else {
        throw new Error(`AI generation failed: ${error.message}`);
      }
    }
  }
  
  // Update settings when they change
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Clear cache if API key changed
    if (newSettings.apiKey !== undefined) {
      this.cache.clear();
    }
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIReviewGenerator;
} else {
  window.AIReviewGenerator = AIReviewGenerator;
}