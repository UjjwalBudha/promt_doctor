
const inquirer = require('inquirer');
const promptTypes = require('./prompt_optimization_types');

async function optimizePrompt() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['Optimize a prompt', 'Create a new prompt', 'Exit']
    }
  ]);

  if (action === 'Exit') {
    return;
  }

  if (action === 'Optimize a prompt') {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select optimization mode:',
        choices: ['Standard Optimization Types', 'Custom Optimization']
      }
    ]);

    if (mode === 'Standard Optimization Types') {
      const { optimizationType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'optimizationType',
          message: 'Select optimization type:',
          choices: promptTypes.map(type => type.name)
        }
      ]);

      // Additional logic to handle the selected optimization type
      console.log(`You selected: ${optimizationType}`);
    }
  }

  // Additional logic for other actions
}

module.exports = { optimizePrompt };
