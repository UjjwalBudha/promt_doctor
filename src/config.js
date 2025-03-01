import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const configFilePath = path.join(__dirname, '..', '.env');

const promptQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

export const configureEnvironment = async () => {
  console.log('Configuring environment variables...');
  
  // Get current values if they exist
  const currentConfig = fs.existsSync(configFilePath) 
    ? dotenv.parse(fs.readFileSync(configFilePath)) 
    : {};
  
  const baseUrl = await promptQuestion(`Enter OpenAI API Base URL [${currentConfig.OPENAI_BASE_URL || 'https://api.openai.com/v1'}]: `);
  const apiKey = await promptQuestion(`Enter OpenAI API Key [${currentConfig.OPENAI_API_KEY ? '****' : ''}]: `);
  const model = await promptQuestion(`Enter OpenAI Model [${currentConfig.OPENAI_MODEL || 'gpt-3.5-turbo'}]: `);

  // Use current values if new ones not provided
  const config = {
    OPENAI_BASE_URL: baseUrl || currentConfig.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    OPENAI_API_KEY: apiKey || currentConfig.OPENAI_API_KEY || '',
    OPENAI_MODEL: model || currentConfig.OPENAI_MODEL || 'gpt-3.5-turbo',
  };

  // Write config to .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(configFilePath, envContent);
  console.log('.env file updated successfully.');
  
  // Update current process environment
  process.env.OPENAI_BASE_URL = config.OPENAI_BASE_URL;
  process.env.OPENAI_API_KEY = config.OPENAI_API_KEY;
  process.env.OPENAI_MODEL = config.OPENAI_MODEL;

  rl.close();
  return config;
};

const getConfig = () => {
  // Ensure we have the latest values from .env file
  dotenv.config();
  
  return {
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  };
};

// Create and export the config object
export const config = {
  store: {},
  get(key, defaultValue) {
    return this.store[key] || defaultValue;
  },
  set(key, value) {
    this.store[key] = value;
  },
  clear() {
    this.store = {};
  }
};

export { getConfig };