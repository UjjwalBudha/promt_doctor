// ...existing code...

// Import the new utility functions
const { saveToOutputFile } = require('../utils/fileUtils');

// ...existing code...

// Find and replace the code that handles saving the optimized prompt
// Replace this:
// function savePromptToFile(optimizedPrompt, filename) {
//   fs.writeFileSync(filename, optimizedPrompt);
//   console.log(`Optimized prompt saved to ${filename}`);
// }

// With this:
function savePromptToFile(optimizedPrompt, filename) {
  const savedPath = saveToOutputFile(filename, optimizedPrompt);
  console.log(`Optimized prompt saved to ${savedPath}`);
}

// ...existing code...
