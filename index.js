#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { optimizePrompt, defaultConfig } from './optimizer.js';

const CONFIG_FILE = path.join(process.cwd(), '.prompt-optimizer-config.json');


/**
 * Loads configuration from file or returns default config
 * @returns {object} - The loaded or default configuration
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      return { ...defaultConfig, ...JSON.parse(configData) };
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }
  return defaultConfig;
}

/**
 * Saves configuration to file
 * @param {object} config - The configuration to save
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('Configuration saved successfully.');
  } catch (error) {
    console.error('Error saving config:', error.message);
  }
}

/**
 * Displays current configuration
 */
function displayConfig() {
  const config = loadConfig();
  console.log('Current prompt-optimizer configuration:');
  console.log(JSON.stringify(config, null, 2));
}

/**
 * Main function to handle command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'config':
      displayConfig();
      break;
    
    case 'optimize':
      const inputFile = args[1];
      if (!inputFile) {
        console.error('Please provide an input file path.');
        break;
      }
      
      try {
        const prompt = fs.readFileSync(inputFile, 'utf8');
        const config = loadConfig();
        const optimized = optimizePrompt(prompt, config);
        console.log(optimized);
      } catch (error) {
        console.error('Error optimizing prompt:', error.message);
      }
      break;
      
    case 'set-config':
      const key = args[1];
      const value = args[2];
      
      if (!key || value === undefined) {
        console.error('Please provide both a key and value to set.');
        break;
      }
      
      const config = loadConfig();
      
      // Convert value to appropriate type
      let typedValue = value;
      if (value === 'true') typedValue = true;
      else if (value === 'false') typedValue = false;
      else if (!isNaN(value)) typedValue = Number(value);
      
      config[key] = typedValue;
      saveConfig(config);
      break;
      
    default:
      console.log(`
Prompt Optimizer - Enhance your AI prompts

Usage:
  prompt-optimizer config                  Display current configuration
  prompt-optimizer optimize <file>         Optimize the prompt in the specified file
  prompt-optimizer set-config <key> <value>  Set a configuration value

Examples:
  prompt-optimizer optimize my-prompt.txt
  prompt-optimizer set-config maxLength 4096
  prompt-optimizer set-config enhanceClarity true
      `);
  }
}

main();
