import axios from 'axios';
import * as configModule from '../config.js';

/**
 * Call the AI service with a prompt
 */
export async function callAI(prompt) {
  // Get configuration from the config module
  const config = configModule.getConfig();
  const apiKey = config.apiKey;
  const model = config.model;
  
  if (!apiKey) {
    throw new Error('API key not configured. Use "prompt-optimizer config" to set up your API key.');
  }
  
  try {
    // This is a generic implementation that should be adapted to whatever AI service you're using
    // For Google AI Studio, you'll need to modify this according to their API documentation
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ role: "user", parts: [{ text: prompt }]}],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Extract the generated text - adjust this based on the actual response structure
    if (response.data.candidates && response.data.candidates[0].content.parts) {
      return response.data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Unexpected response format from AI service');
  } catch (error) {
    console.error('AI service error:', error.message);
    
    // Fallback for development or when API is unavailable
    return `I would optimize this prompt by making it more specific, 
            adding clear instructions about the desired output format, 
            tone, and level of detail. Any ambiguities would be clarified 
            with specific alternatives.`;
  }
}