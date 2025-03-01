# Prompt Optimizer CLI

A command-line tool to optimize prompts for AI models.

## Features

- **Raw Input Analysis**: Analyze and classify your input based on intent, purpose, and key concepts
- **Contextual Framework**: Apply appropriate system messages based on task type
- **Prompt Optimization**: Transform vague instructions into clear, actionable requests
- **Dynamic Customization**: Configure tone, length, complexity, and format
- **Interactive Refinement**: Iterate and refine your prompts until they're perfect
- **Handling Ambiguities**: Identify and clarify vague or unclear parts of prompts

## Installation

1. Make sure you have Node.js installed (version 14 or higher recommended)

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Make the script executable:
   ```bash
   chmod +x optimizer.js
   ```

4. Optionally, link the command globally:
   ```bash
   npm link
   ```

## Usage

### Configure settings

```bash
prompt-optimizer config
```

This will prompt you to enter:
- API Key: Your AI provider API key
- Base URL: The API endpoint (default: https://api.openai.com/v1)
- Model name: The AI model to use (default: gpt-4)
- Default tone: formal, casual, professional, or friendly
- Default response length: short, medium, or long
- Default complexity level: beginner, intermediate, or advanced
- Default output format: text, bullet, numbered, or json

### Optimize a prompt

```bash
prompt-optimizer optimize "Your prompt here"
```

### Command Options

```bash
# Use specific options directly
prompt-optimizer optimize --tone formal --length detailed --format bullet

# Use interactive mode with guided optimization
prompt-optimizer optimize --interactive

# Configure default settings
prompt-optimizer config

# Show current configuration
prompt-optimizer config --show

# Reset configuration to defaults
prompt-optimizer config --reset
```

### Customization Options

- **Tone**: formal, casual, technical, friendly
- **Length**: short, medium, detailed
- **Complexity**: beginner, intermediate, expert
- **Format**: narrative, list, bullet, step-by-step

## API Configuration

This tool supports OpenAI-compatible APIs. You can configure the API settings as follows:

```javascript
const config = require('./config');

// Set your API key
config.setApiKey('your-api-key-here');

// Optional: Set custom API base URL for alternative providers
// Examples:
// - Azure OpenAI: https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name
// - Anthropic: https://api.anthropic.com
// - Local providers like Ollama: http://localhost:11434/api
config.setApiBaseUrl('https://custom-api-endpoint.com/v1');
```

### Environment Variables

You can also set these values using environment variables:

- `OPENAI_API_KEY` - Your API key
- `OPENAI_API_BASE` - Your API base URL

## File Storage

Optimized prompts are now saved to the `output_prompt` directory in your project. This directory will be automatically created if it doesn't exist.

When you choose to save an optimized prompt to a file, the file will be created in this directory rather than in the project root.

## Examples

### Example 1: Optimizing a Vague Creative Prompt

**Raw Prompt:**
```
Write a story about love
```

**Optimized Prompt:**
```
Write a short story (approximately 500 words) about romantic love between two characters who meet in an unexpected circumstance. Include themes of sacrifice and growth. The tone should be reflective and emotional with a bittersweet ending. Focus on developing the characters' internal thoughts and emotions rather than extensive dialogue. The story should resonate with adult readers who enjoy literary fiction.
```

### Example 2: Optimizing a Technical Request

**Raw Prompt:**
```
Explain how blockchain works
```

**Optimized Prompt:**
```
Provide a detailed technical explanation of how blockchain technology functions, covering its core components including distributed ledger systems, cryptographic hashing, consensus mechanisms, and block validation. Explain the concept of immutability and how it provides security. Include practical examples of blockchain applications beyond cryptocurrencies. The explanation should be suitable for someone with intermediate technical knowledge but no prior blockchain experience. Use clear, concise language and include a brief section addressing common misconceptions about blockchain technology.
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
