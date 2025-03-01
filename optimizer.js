#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';
import ora from 'ora';
import { homedir } from 'os';
import { saveToOutputFile } from './utils/fileUtils.js';

const CONFIG_FILE = path.join(homedir(), '.prompt-optimizer-config.json');

// Load configuration
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading configuration:', error.message);
  }
  return {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4'
  };
}

// Save configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(chalk.green('Configuration saved successfully!'));
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error.message);
  }
}

// Get system message based on optimization type or tone
function getSystemMessageForOptimization(type, toneDetails) {
  // Original optimization types
  const messages = {
    'clarity': 'You are a prompt optimization expert. Rewrite the given prompt to make it clearer, more precise, and better structured. Eliminate ambiguity and vague language. Format the prompt to improve readability.',
    'creativity': 'You are a prompt optimization expert. Enhance the given prompt to elicit more creative and diverse responses. Add elements that encourage exploration of unique ideas and unconventional approaches.',
    'technical': 'You are a prompt optimization expert. Rewrite the given prompt to improve its technical accuracy and precision. Use appropriate domain-specific terminology and ensure logical coherence.',
    'brevity': 'You are a prompt optimization expert. Make the given prompt more concise while preserving its core intent and necessary details. Eliminate redundancy and unnecessary words.',
    'conversational': 'You are a prompt optimization expert. Rewrite the given prompt to make it more conversational, engaging, and natural-sounding. Improve the flow and make it feel like a human conversation.',
    'instruction': 'You are a prompt optimization expert. Restructure the given prompt to provide clearer instructions. Break down complex requests, improve the logical flow, and make the intended task more explicit.'
  };
  
  // If toneDetails is provided, create a tone-specific system message
  if (toneDetails) {
    let toneMessage = 'You are a prompt optimization expert. ';
    
    if (toneDetails.type === 'custom') {
      toneMessage += `Rewrite the given prompt using a custom tone with these parameters: ${JSON.stringify(toneDetails.parameters)}.`;
    } else {
      const intensityMap = {
        'subtle': 'slightly',
        'moderate': 'moderately',
        'strong': 'heavily'
      };
      
      const toneDescriptions = {
        'technical': 'precise, factual with technical details and specifications',
        'educational': 'clear explanations with examples that facilitate learning',
        'professional': 'formal, business-appropriate language',
        'conversational': 'friendly and approachable language',
        'creative': 'imaginative and expressive language',
        'user-friendly': 'simple, accessible language focused on user experience',
        'practical': 'action-oriented with concrete steps and solutions'
      };
      
      const toneDesc = toneDescriptions[toneDetails.type] || 'appropriate';
      const intensity = intensityMap[toneDetails.intensity] || 'moderately';
      
      toneMessage += `Rewrite the given prompt using a ${intensity} ${toneDesc} tone.`;
    }
    
    return toneMessage;
  }
  
  return messages[type] || messages['clarity'];
}

// Optimize prompt using the API - updated to handle both optimization types and tones
async function optimizePrompt(prompt, optimizationType, config, toneDetails = null) {
  const spinner = ora('Optimizing prompt...').start();
  
  try {
    const systemMessage = getSystemMessageForOptimization(optimizationType, toneDetails);
    
    const response = await axios.post(
      `${config.baseUrl}/chat/completions`,
      {
        model: config.modelName,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    spinner.succeed('Prompt optimized successfully!');
    return response.data.choices[0].message.content;
  } catch (error) {
    spinner.fail('Error optimizing prompt');
    if (error.response) {
      console.error(chalk.red('API Error:'), 
        error.response.data.error?.message || error.response.statusText);
    } else {
      console.error(chalk.red('Error:'), error.message);
    }
    return null;
  }
}

// Save optimized prompt to file
function saveToFile(content, filename) {
  try {
    const savedPath = saveToOutputFile(filename, content);
    console.log(chalk.green(`Optimized prompt saved to ${savedPath}`));
    return true;
  } catch (error) {
    console.error(chalk.red('Error saving file:'), error.message);
    return false;
  }
}

// Configure API settings
async function configureAPI() {
  const config = loadConfig();
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Enter API Base URL:',
      default: config.baseUrl
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter API Key:',
      default: config.apiKey
    },
    {
      type: 'input',
      name: 'modelName',
      message: 'Enter Model Name:',
      default: config.modelName
    }
  ]);
  
  saveConfig({
    baseUrl: answers.baseUrl,
    apiKey: answers.apiKey,
    modelName: answers.modelName
  });
  
  return true;
}

// Define enhanced tone options with descriptions
const TONE_OPTIONS = [
  {
    name: '📊 Technical Accuracy - Precise, factual content with technical details',
    value: 'technical'
  },
  {
    name: '🎓 Educational - Clear explanations with examples for learning',
    value: 'educational'
  },
  {
    name: '💼 Professional - Formal, business-appropriate language',
    value: 'professional'
  },
  {
    name: '💬 Conversational - Friendly, approachable language',
    value: 'conversational'
  },
  {
    name: '📝 Creative - Imaginative, expressive language for original thinking',
    value: 'creative'
  },
  {
    name: '📱 User-friendly - Simple, accessible language for better UX',
    value: 'user-friendly'
  },
  {
    name: '🔧 Practical - Action-oriented content with concrete steps',
    value: 'practical'
  },
  {
    name: '⚙️ Custom - Define your own tone parameters',
    value: 'custom'
  }
];

// Custom tone parameters
const TONE_PARAMETERS = {
  formality: ['Very formal', 'Formal', 'Neutral', 'Casual', 'Very casual'],
  complexity: ['Expert level', 'Advanced', 'Intermediate', 'Beginner friendly', 'Simple'],
  length: ['Very concise', 'Brief', 'Moderate', 'Detailed', 'Comprehensive'],
  persuasiveness: ['Neutral', 'Subtly persuasive', 'Moderately persuasive', 'Strongly persuasive'],
  emotion: ['Neutral', 'Slightly emotional', 'Moderately emotional', 'Highly emotional']
};

// Main application flow
async function main() {
  console.log(chalk.bold.blue('\n=== Prompt Optimizer ===\n'));
  
  // Check for configuration
  const config = loadConfig();
  if (!config.apiKey) {
    console.log(chalk.yellow('API configuration not found. Setting up now...'));
    await configureAPI();
  }
  
  // Main menu
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Optimize a prompt',
        'Configure API settings',
        'Exit'
      ]
    });
    
    if (action === 'Exit') {
      console.log(chalk.blue('Goodbye!'));
      break;
    }
    
    if (action === 'Configure API settings') {
      await configureAPI();
      continue;
    }
    
    // Get optimization settings
    const optimizationSettings = await selectOptimizationType();
    
    // Get prompt input
    const { promptInput } = await inquirer.prompt({
      type: 'editor',
      name: 'promptInput',
      message: 'Enter your prompt (an editor will open):',
    });
    
    if (!promptInput.trim()) {
      console.log(chalk.yellow('No prompt entered. Returning to main menu.'));
      continue;
    }
    
    // Optimize the prompt based on selected mode
    let optimizedPrompt;
    if (optimizationSettings.mode === 'standard') {
      optimizedPrompt = await optimizePrompt(promptInput, optimizationSettings.type, loadConfig());
    } else {
      optimizedPrompt = await optimizePrompt(promptInput, null, loadConfig(), optimizationSettings.details);
    }
    
    if (optimizedPrompt) {
      console.log(chalk.green('\nOptimized Prompt:'));
      console.log(chalk.white('----------------------------------------'));
      console.log(optimizedPrompt);
      console.log(chalk.white('----------------------------------------\n'));
      
      const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do with the optimized prompt?',
        choices: [
          'Save to file',
          'Return to main menu'
        ]
      });
      
      if (action === 'Save to file') {
        const { filename } = await inquirer.prompt({
          type: 'input',
          name: 'filename',
          message: 'Enter filename to save:',
          default: `optimized-prompt-${new Date().toISOString().slice(0, 10)}.txt`
        });
        
        saveToFile(optimizedPrompt, filename);
      }
    }
  }
}

// Select optimization type - now returns either an optimization type or tone details
async function selectOptimizationType() {
  const { optimizationMode } = await inquirer.prompt({
    type: 'list',
    name: 'optimizationMode',
    message: 'Select optimization mode:',
    choices: [
      { name: 'Standard Optimization Types', value: 'standard' },
      { name: 'Advanced Tone Customization', value: 'tone' }
    ]
  });
  
  if (optimizationMode === 'standard') {
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'Select optimization type:',
      choices: [
        { name: 'Clarity and Precision', value: 'clarity' },
        { name: 'Creativity Enhancement', value: 'creativity' },
        { name: 'Technical Accuracy', value: 'technical' },
        { name: 'Brevity and Conciseness', value: 'brevity' },
        { name: 'Conversational Tone', value: 'conversational' },
        { name: 'Instruction Optimization', value: 'instruction' }
      ]
    });
    return { mode: 'standard', type };
  } else {
    return { mode: 'tone', details: await selectTone() };
  }
}

// Function to select tone
async function selectTone() {
  const { toneType } = await inquirer.prompt({
    type: 'list',
    name: 'toneType',
    message: 'Select the tone for your prompt optimization:',
    choices: TONE_OPTIONS,
    pageSize: 10
  });
  
  if (toneType === 'custom') {
    return customizeTone();
  }

  // Ask for intensity of the selected tone
  const { intensity } = await inquirer.prompt({
    type: 'list',
    name: 'intensity',
    message: `Select the intensity for ${toneType} tone:`,
    choices: ['Subtle', 'Moderate', 'Strong'],
    default: 'Moderate'
  });

  return {
    type: toneType,
    intensity: intensity.toLowerCase()
  };
}

// Function for custom tone configuration
async function customizeTone() {
  console.log(chalk.blue('\nCustomize your tone parameters:'));
  
  const questions = Object.entries(TONE_PARAMETERS).map(([param, options]) => ({
    type: 'list',
    name: param,
    message: `Select the ${param} level:`,
    choices: options,
    default: options[Math.floor(options.length / 2)] // Default to middle option
  }));

  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Give your custom tone a name:',
    default: 'My Custom Tone'
  });

  const parameters = await inquirer.prompt(questions);
  
  return {
    type: 'custom',
    name,
    parameters
  };
}

// Run the application
main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});
