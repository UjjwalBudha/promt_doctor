#!/bin/bash

echo "🔮 Setting up Prompt Optimizer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit https://nodejs.org/ for installation instructions."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make the CLI executable
echo "🔧 Setting up the CLI..."
chmod +x ./src/index.js

# Link the CLI for global usage
echo "🔗 Linking the CLI for global usage..."
npm link

# Run configuration
echo "⚙️ Let's configure your Prompt Optimizer..."
./src/index.js config

echo "✅ Setup complete! You can now use the Prompt Optimizer by running:"
echo "   prompt-optimizer optimize"
echo ""
echo "📚 For more information, run:"
echo "   prompt-optimizer --help"
