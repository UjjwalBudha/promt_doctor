import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { analyzeInput } from './analyzer.js';
import { optimizePrompt, clarifyAmbiguities } from './optimizer.js';
import { generateSystemMessage, getSystemMessageTemplate } from './systemMessages.js';
import boxen from 'boxen';

export class PromptInteraction {
  constructor() {
    this.rawPrompt = '';
    this.analysis = null;
    this.optimizedPrompt = null;
    this.options = {};
  }
  
  async startInteractiveMode(defaultOptions) {
    console.log(chalk.blue.bold('🔮 Welcome to the Interactive Prompt Optimizer 🔮'));
    console.log(chalk.dim('This mode will guide you through creating an optimized prompt step by step\n'));
    
    // Step 1: Get the raw prompt
    const rawPromptAnswer = await inquirer.prompt([
      {
        type: 'editor',
        name: 'prompt',
        message: 'Enter your raw prompt:',
      }
    ]);
    
    this.rawPrompt = rawPromptAnswer.prompt;
    
    // Step 2: Analyze the raw prompt
    const spinner = ora('Analyzing your prompt...').start();
    this.analysis = await analyzeInput(this.rawPrompt);
    spinner.succeed('Analysis complete');
    
    console.log(
      boxen(
        chalk.bold('Analysis Results:') + '\n' +
        chalk.yellow(`- Task Type: ${this.analysis.taskType}`) + '\n' +
        chalk.yellow(`- Intent: ${this.analysis.intent}`) + '\n' +
        chalk.yellow(`- Key Concepts: ${this.analysis.keyConcepts.join(', ')}`) + '\n' +
        chalk.yellow(`- Clarity Score: ${this.analysis.clarity}/10`),
        { padding: 1, borderColor: 'yellow', title: 'Analysis', titleAlignment: 'center' }
      )
    );
    
    // Handle ambiguities if needed
    if (this.analysis.ambiguities && this.analysis.ambiguities.length > 0) {
      console.log(chalk.red('\nYour prompt contains potential ambiguities:'));
      for (const ambiguity of this.analysis.ambiguities) {
        console.log(chalk.red(`- ${ambiguity}`));
      }
      
      const clarify = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldClarify',
          message: 'Would you like to clarify these ambiguities?',
          default: true
        }
      ]);
      
      if (clarify.shouldClarify) {
        await this.handleAmbiguities();
      }
    }
    
    // Step 3: Configure optimization options
    await this.configureOptions(defaultOptions);
    
    // Step 4: Generate and show the optimized prompt
    await this.generateOptimizedPrompt();
    
    // Step 5: Allow iterative refinement
    await this.refinePrompt();
    
    return this.optimizedPrompt;
  }
  
  async handleAmbiguities() {
    const spinner = ora('Generating clarification questions...').start();
    const clarifications = await clarifyAmbiguities(this.rawPrompt, this.analysis.ambiguities);
    spinner.succeed('Generated clarification questions');
    
    // For each ambiguity, ask the clarifying questions
    const clarificationAnswers = {};
    
    for (const item of clarifications) {
      console.log(chalk.yellow(`\nAmbiguity: ${item.ambiguity}`));
      
      const questions = item.questions.map(q => ({
        type: 'input',
        name: q.replace(/\W+/g, '_').toLowerCase(),
        message: q,
      }));
      
      const answers = await inquirer.prompt(questions);
      clarificationAnswers[item.ambiguity] = Object.values(answers);
    }
    
    // Update the raw prompt with clarifications
    const enhancedPromptSpinner = ora('Enhancing your prompt with clarifications...').start();
    
    const enhancementPrompt = `
      Original prompt: "${this.rawPrompt}"
      
      The user has provided clarifications for ambiguous parts:
      ${Object.entries(clarificationAnswers)
        .map(([ambiguity, answers]) => 
          `For "${ambiguity}": ${answers.join(' ')}`)
        .join('\n')}
      
      Please rewrite the original prompt incorporating these clarifications.
      Make the prompt clear, specific, and actionable.
      Return only the enhanced prompt, without explanations or quotation marks.
    `;
    
    try {
      const { callAI } = await import('./aiService.js');
      const enhancedPrompt = await callAI(enhancementPrompt);
      this.rawPrompt = enhancedPrompt;
      enhancedPromptSpinner.succeed('Prompt enhanced with clarifications');
      
      console.log(
        boxen(
          chalk.green(this.rawPrompt),
          { padding: 1, borderColor: 'green', title: 'Enhanced Prompt', titleAlignment: 'center' }
        )
      );
    } catch (error) {
      enhancedPromptSpinner.fail('Failed to enhance prompt');
      console.error('Error:', error.message);
    }
  }
  
  async configureOptions(defaultOptions) {
    console.log(chalk.blue('\nLet\'s configure how you want your prompt to be optimized:'));
    
    // Prepare defaults
    const defaults = {
      tone: defaultOptions.tone || 'neutral',
      length: defaultOptions.length || 'medium',
      complexity: defaultOptions.complexity || 'intermediate',
      format: defaultOptions.format || 'narrative',
    };
    
    const templateChoices = [
      { name: 'Default - General purpose optimization', value: 'default' },
      { name: 'Technical Writing - For code, technical docs, etc.', value: 'technical_writing' },
      { name: 'Creative Writing - For stories, creative content', value: 'creative_writing' },
      { name: 'Academic - For scholarly writing', value: 'academic' },
      { name: 'Business - For professional communications', value: 'business' }
    ];
    
    // Select preset template or custom configuration
    const templateAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'configType',
        message: 'How would you like to configure your prompt optimization?',
        choices: [
          { name: 'Use a preset template', value: 'template' },
          { name: 'Custom configuration', value: 'custom' }
        ]
      }
    ]);
    
    // Handle template selection
    if (templateAnswer.configType === 'template') {
      const templateChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: templateChoices
        }
      ]);
      
      this.options = {
        ...defaults,
        template: templateChoice.template
      };
      
      return;
    }
    
    // Handle custom configuration
    const optionsAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'tone',
        message: 'What tone should the prompt have?',
        choices: [
          { name: 'Formal - Professional and structured', value: 'formal' },
          { name: 'Casual - Conversational and relaxed', value: 'casual' },
          { name: 'Technical - Precise and domain-specific', value: 'technical' },
          { name: 'Friendly - Warm and approachable', value: 'friendly' }
        ],
        default: defaults.tone
      },
      {
        type: 'list',
        name: 'length',
        message: 'How detailed should the optimized prompt be?',
        choices: [
          { name: 'Short - Brief and to the point', value: 'short' },
          { name: 'Medium - Balanced level of detail', value: 'medium' },
          { name: 'Detailed - Comprehensive instructions', value: 'detailed' }
        ],
        default: defaults.length
      },
      {
        type: 'list',
        name: 'complexity',
        message: 'What complexity level should the prompt target?',
        choices: [
          { name: 'Beginner - Simple language and concepts', value: 'beginner' },
          { name: 'Intermediate - Moderate sophistication', value: 'intermediate' },
          { name: 'Expert - Advanced concepts and terminology', value: 'expert' }
        ],
        default: defaults.complexity
      },
      {
        type: 'list',
        name: 'format',
        message: 'What format should the optimized prompt use?',
        choices: [
          { name: 'Narrative - Flowing textual description', value: 'narrative' },
          { name: 'List - Organized list format', value: 'list' },
          { name: 'Bullet points - Easy to scan content', value: 'bullet' },
          { name: 'Step-by-step - Sequential instructions', value: 'step-by-step' }
        ],
        default: defaults.format
      },
      {
        type: 'input',
        name: 'additionalInstructions',
        message: 'Any additional optimization instructions (optional):',
      }
    ]);
    
    this.options = {
      ...defaults,
      ...optionsAnswers
    };
  }
  
  async generateOptimizedPrompt() {
    console.log(chalk.blue('\nGenerating your optimized prompt...'));
    
    // Get the appropriate system message
    let systemMessage;
    if (this.options.template) {
      systemMessage = getSystemMessageTemplate(this.options.template);
    } else {
      systemMessage = generateSystemMessage(this.analysis.taskType, this.options);
    }
    
    // Optimize the prompt
    const optimizationSpinner = ora('Optimizing...').start();
    try {
      this.optimizedPrompt = await optimizePrompt(
        this.rawPrompt,
        this.analysis,
        this.options,
        systemMessage
      );
      optimizationSpinner.succeed('Optimization complete');
      
      console.log(
        boxen(
          chalk.bold('Optimized Prompt:') + '\n\n' +
          chalk.green(this.optimizedPrompt.prompt),
          { padding: 1, borderColor: 'green', title: 'Result', titleAlignment: 'center' }
        )
      );
      
      if (this.optimizedPrompt.improvements.length > 0) {
        console.log(chalk.blue('\nImprovements made:'));
        for (const improvement of this.optimizedPrompt.improvements) {
          console.log(chalk.blue(`- ${improvement}`));
        }
      }
    } catch (error) {
      optimizationSpinner.fail('Optimization failed');
      console.error('Error:', error.message);
    }
  }
  
  async refinePrompt() {
    let continueRefining = true;
    
    while (continueRefining) {
      const refineAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Would you like to refine this prompt further?',
          choices: [
            { name: 'Accept and finish', value: 'accept' },
            { name: 'Adjust optimization options', value: 'options' },
            { name: 'Add specific refinement instructions', value: 'refine' },
            { name: 'Start over with a new prompt', value: 'restart' }
          ]
        }
      ]);
      
      switch (refineAnswer.action) {
        case 'accept':
          console.log(chalk.green('\n✨ Optimization complete! ✨'));
          continueRefining = false;
          break;
          
        case 'options':
          await this.configureOptions(this.options);
          await this.generateOptimizedPrompt();
          break;
          
        case 'refine':
          const refinementAnswer = await inquirer.prompt([
            {
              type: 'editor',
              name: 'instructions',
              message: 'Enter specific refinement instructions:'
            }
          ]);
          
          const refinementSpinner = ora('Applying refinements...').start();
          try {
            const { callAI } = await import('./aiService.js');
            
            const refinementPrompt = `
              I have a prompt that needs specific refinements:
              
              Current prompt: "${this.optimizedPrompt.prompt}"
              
              Refinement instructions: "${refinementAnswer.instructions}"
              
              Please refine the prompt according to these instructions.
              Return only the refined prompt, without explanations or quotation marks.
            `;
            
            const refinedPrompt = await callAI(refinementPrompt);
            this.optimizedPrompt.prompt = refinedPrompt;
            this.optimizedPrompt.improvements.push('Applied manual refinements');
            
            refinementSpinner.succeed('Refinements applied');
            
            console.log(
              boxen(
                chalk.bold('Refined Prompt:') + '\n\n' +
                chalk.green(this.optimizedPrompt.prompt),
                { padding: 1, borderColor: 'green', title: 'Result', titleAlignment: 'center' }
              )
            );
          } catch (error) {
            refinementSpinner.fail('Refinement failed');
            console.error('Error:', error.message);
          }
          break;
          
        case 'restart':
          // Get a new raw prompt
          const newPromptAnswer = await inquirer.prompt([
            {
              type: 'editor',
              name: 'prompt',
              message: 'Enter your new raw prompt:'
            }
          ]);
          
          this.rawPrompt = newPromptAnswer.prompt;
          
          // Analyze the new prompt
          const analysisSpinner = ora('Analyzing new prompt...').start();
          this.analysis = await analyzeInput(this.rawPrompt);
          analysisSpinner.succeed('Analysis complete');
          
          await this.generateOptimizedPrompt();
          break;
      }
    }
  }
}
