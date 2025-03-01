const config = require('./config');

/**
 * Makes API requests to the configured LLM provider
 * @param {Object} requestData - The data to send in the request
 * @returns {Promise<Object>} - Response from the API
 */
async function makeApiRequest(requestData) {
  const { apiKey, apiBaseUrl } = config.getConfig();
  
  if (!apiKey) {
    throw new Error('API key not configured. Use config.setApiKey() to set your key.');
  }
  
  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

module.exports = {
  makeApiRequest
};
