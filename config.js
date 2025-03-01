import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import Conf from 'conf';

// Create a configuration store
const config = new Conf({
  projectName: 'prompt-optimizer',
  defaults: {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4',
    tone: 'casual',
    responseLength: 'medium',
    complexityLevel: 'intermediate',
    outputFormat: 'bullet'
  }
});

export async function configureSettings() {
  try {
    // Get current settings
    const currentSettings = config.store;
    
    console.log(chalk.blue('Configure your Prompt Optimizer settings:'));
    console.log(chalk.gray('(Press Enter to keep current value)'));
    
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'API Key:',
        default: currentSettings.apiKey || '',
        mask: '*'
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Base URL:',
        default: currentSettings.baseUrl || 'https://api.openai.com/v1',
      },
      {
        type: 'input',
        name: 'modelName',
        message: 'Model name:',
        default: currentSettings.modelName || 'gpt-4',
      },
      {
        type: 'list',
        name: 'tone',
        message: 'Default tone:',
        choices: ['formal', 'casual', 'technical', 'friendly'],
        default: currentSettings.tone || 'casual',
      },
      {
        type: 'list',
        name: 'responseLength',
        message: 'Default response length:',
        choices: ['short', 'medium', 'detailed'],
        default: currentSettings.responseLength || 'medium',
      },
      {
        type: 'list',
        name: 'complexityLevel',
        message: 'Default complexity level:',
        choices: ['beginner', 'intermediate', 'expert'],
        default: currentSettings.complexityLevel || 'intermediate',
      },
      {
        type: 'list',
        name: 'outputFormat',
        message: 'Default output format:',
        choices: ['narrative', 'list', 'bullet', 'step-by-step'],
        default: currentSettings.outputFormat || 'bullet',
      },
    ]);

    // Save all settings
    Object.entries(answers).forEach(([key, value]) => {
      config.set(key, value);
    });

    console.log(chalk.green('Configuration saved successfully!'));
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error);
  }
}

export function showConfig() {
  const currentSettings = config.store;
  const maskedApiKey = currentSettings.apiKey 
    ? `${currentSettings.apiKey.substring(0, 3)}${'*'.repeat(currentSettings.apiKey.length - 6)}${currentSettings.apiKey.substring(currentSettings.apiKey.length - 3)}`
    : '(not set)';
  
  console.log(chalk.blue('Current Configuration:'));
  console.log(chalk.gray('API Key:'), maskedApiKey);
  console.log(chalk.gray('Base URL:'), currentSettings.baseUrl);
  console.log(chalk.gray('Model name:'), currentSettings.modelName);
  console.log(chalk.gray('Default tone:'), currentSettings.tone);
  console.log(chalk.gray('Default response length:'), currentSettings.responseLength);
  console.log(chalk.gray('Default complexity level:'), currentSettings.complexityLevel);
  console.log(chalk.gray('Default output format:'), currentSettings.outputFormat);
}

export function resetConfig() {
  config.clear();
  console.log(chalk.green('Configuration has been reset to defaults.'));
}

export function getConfig() {
  return config.store;
}

export function setApiKey(key) {
  config.set('apiKey', key);
}

export function setApiBaseUrl(url) {
  config.set('baseUrl', url);
}
