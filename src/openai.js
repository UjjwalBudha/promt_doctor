const axios = require('axios');
const { getConfig } = require('./config');

async function queryOpenAI(prompt, options = {}) {
  const config = getConfig();
  
  if (!config.apiKey) {
    throw new Error('OpenAI API key not found. Please run "prompt-engineer configure" first.');
  }

  const model = options.model || config.model;
  console.log(`Using model: ${model}`);

  try {
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error querying OpenAI API:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  queryOpenAI,
};
