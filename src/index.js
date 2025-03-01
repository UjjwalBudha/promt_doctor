#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { analyzeInput } from './lib/analyzer.js';
import { optimizePrompt } from './lib/optimizer.js';
import { generateSystemMessage } from './lib/systemMessages.js';
import { PromptInteraction } from './lib/promptInteraction.js';
import boxen from 'boxen';
import { config } from './config.js';

// Create CLI program
const program = new Command();

program
  .name('prompt-optimizer')
  .description('CLI tool to optimize prompts for AI models')
  .version('1.0.0');

program
  .command('optimize')
  .description('Optimize a raw prompt for AI models')
  .option('-t, --tone <type>', 'Set tone (formal, casual, technical, friendly)', 'neutral')
  .option('-l, --length <type>', 'Set response length (short, medium, detailed)', 'medium')
  .option('-c, --complexity <level>', 'Set complexity level (beginner, intermediate, expert)', 'intermediate')
  .option('-f, --format <type>', 'Set output format (narrative, list, bullet, step-by-step)', 'narrative')
  .option('-i, --interactive', 'Use interactive mode for more detailed prompt configuration')
  .action(async (options) => {
    // Interactive mode
    if (options.interactive) {
      const interaction = new PromptInteraction();
      await interaction.startInteractiveMode(options);
      return;
    }
    
    // Direct mode
    const rawPrompt = await inquirer.prompt([
      {
        type: 'editor',
        name: 'prompt',
        message: 'Enter your raw prompt:',
      }
    ]);
    
    const analysis = await analyzeInput(rawPrompt.prompt);
    const systemMessage = generateSystemMessage(analysis.taskType, options);
    const optimized = await optimizePrompt(rawPrompt.prompt, analysis, options, systemMessage);
    
    console.log(
      boxen(
        chalk.bold('Optimized Prompt:') + '\n\n' + 
        chalk.green(optimized.prompt), 
        { padding: 1, borderColor: 'green', title: 'Result', titleAlignment: 'center' }
      )
    );
    
    console.log(
      boxen(
        chalk.bold('Analysis:') + '\n' + 
        chalk.yellow(`- Task Type: ${analysis.taskType}`) + '\n' +
        chalk.yellow(`- Intent: ${analysis.intent}`) + '\n' + 
        chalk.yellow(`- Key Concepts: ${analysis.keyConcepts.join(', ')}`),
        { padding: 1, borderColor: 'yellow', title: 'Prompt Analysis', titleAlignment: 'center' }
      )
    );
  });

program
  .command('config')
  .description('Configure default settings for prompt optimizer')
  .option('-s, --show', 'Show current configuration')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(async (options) => {
    if (options.show) {
      console.log(boxen(JSON.stringify(config.store, null, 2), { padding: 1, title: 'Current Configuration' }));
      return;
    }
    
    if (options.reset) {
      config.clear();
      config.set('defaultTone', 'neutral');
      config.set('defaultLength', 'medium');
      config.set('defaultComplexity', 'intermediate');
      config.set('defaultFormat', 'narrative');
      console.log(chalk.green('Configuration reset to defaults'));
      return;
    }
    
    // Interactive config setup
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultTone',
        message: 'Default tone:',
        choices: ['formal', 'casual', 'technical', 'friendly', 'neutral'],
        default: config.get('defaultTone', 'neutral'),
      },
      {
        type: 'list',
        name: 'defaultLength',
        message: 'Default response length:',
        choices: ['short', 'medium', 'detailed'],
        default: config.get('defaultLength', 'medium'),
      },
      {
        type: 'list',
        name: 'defaultComplexity',
        message: 'Default complexity level:',
        choices: ['beginner', 'intermediate', 'expert'],
        default: config.get('defaultComplexity', 'intermediate'),
      },
      {
        type: 'list',
        name: 'defaultFormat',
        message: 'Default output format:',
        choices: ['narrative', 'list', 'bullet', 'step-by-step'],
        default: config.get('defaultFormat', 'narrative'),
      }
    ]);
    
    // Save config
    Object.keys(answers).forEach(key => {
      config.set(key, answers[key]);
    });
    
    console.log(chalk.green('Configuration saved successfully!'));
  });

// Update the configure command to use our enhanced configuration
program
  .command('configure')
  .description('Configure OpenAI API credentials')
  .action(async () => {
    try {
      await configureEnvironment();
      console.log('Configuration completed successfully.');
    } catch (error) {
      console.error('Error during configuration:', error.message);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
