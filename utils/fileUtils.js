import fs from 'fs';
import path from 'path';

/**
 * Ensures the output directory exists, creating it if necessary
 * @param {string} outputDir - The directory path to ensure exists
 * @returns {string} The absolute path to the output directory 
 */
export function ensureOutputDirectory(outputDir = 'output_prompt') {
  const outputPath = path.resolve(process.cwd(), outputDir);
  
  if (!fs.existsSync(outputPath)) {
    try {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log(`Created directory: ${outputPath}`);
    } catch (error) {
      console.error(`Error creating directory ${outputPath}:`, error);
      throw error;
    }
  }
  
  return outputPath;
}

/**
 * Saves content to a file in the specified output directory
 * @param {string} filename - The name of the file to save
 * @param {string} content - The content to save to the file  
 * @param {string} outputDir - The output directory (default: 'output_prompt')
 * @returns {string} The full path to the saved file
 */
export function saveToOutputFile(filename, content, outputDir = 'output_prompt') {
  const outputPath = ensureOutputDirectory(outputDir);
  const filePath = path.join(outputPath, filename);
  
  try {
    fs.writeFileSync(filePath, content);
    return filePath;
  } catch (error) {
    console.error(`Error saving to ${filePath}:`, error);
    throw error;
  }
}