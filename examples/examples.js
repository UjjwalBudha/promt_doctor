#!/usr/bin/env node

import chalk from 'chalk';
import boxen from 'boxen';
import { analyzeInput } from '../src/lib/analyzer.js';
import { optimizePrompt } from '../src/lib/optimizer.js';
import { generateSystemMessage } from '../src/lib/systemMessages.js';

// Example raw prompts
const examples = [
  {
    title: "Creative Writing",
    raw: "Write a story about space exploration",
    options: {
      tone: "creative",
      length: "detailed",
      complexity: "intermediate",
      format: "narrative"
    }
  },
  {
    title: "Technical Documentation",
    raw: "Explain how to use React hooks",
    options: {
      tone: "technical",
      length: "medium",
      complexity: "intermediate",
      format: "step-by-step"
    }
  },
  {
    title: "Business Email",
    raw: "Write an email requesting a meeting",
    options: {
      tone: "formal",
      length: "short",
      complexity: "beginner",
      format: "narrative"
    }
  }
];

async function runExamples() {
  console.log(chalk.blue.bold("🔮 Prompt Optimizer Examples 🔮\n"));
  console.log(chalk.dim("This script demonstrates how Prompt Optimizer transforms raw prompts.\n"));
  
  for (const example of examples) {
    console.log(chalk.yellow.bold(`\n📌 Example: ${example.title}`));
    console.log(boxen(chalk.dim(example.raw), { padding: 1, title: 'Raw Prompt', titleAlignment: 'center' }));
    
    console.log(chalk.dim("\nAnalyzing and optimizing..."));
    
    try {
      // Analyze the raw prompt
      const analysis = await analyzeInput(example.raw);
      
      // Generate system message
      const systemMessage = generateSystemMessage(analysis.taskType, example.options);
      
      // Optimize the prompt
      const optimized = await optimizePrompt(example.raw, analysis, example.options, systemMessage);
      
      console.log(boxen(
        chalk.green(optimized.prompt),
        { padding: 1, borderColor: 'green', title: 'Optimized Prompt', titleAlignment: 'center' }
      ));
      
      console.log("\n" + chalk.blue("Improvements made:"));
      for (const improvement of optimized.improvements) {
        console.log(chalk.blue(`- ${improvement}`));
      }
      
      console.log("\n" + chalk.dim("--------------------------------------------"));
    } catch (error) {
      console.error(chalk.red(`Error processing example "${example.title}": ${error.message}`));
    }
  }
  
  console.log(chalk.green.bold("\n✨ Try the Prompt Optimizer yourself! ✨"));
  console.log("Run: prompt-optimizer optimize --interactive");
}

runExamples().catch(error => {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
});
