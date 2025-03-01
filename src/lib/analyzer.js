import natural from 'natural';
import { callAI } from './aiService.js';
import ora from 'ora';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Task types
const TASK_TYPES = {
  CREATIVE: 'creative',
  TECHNICAL: 'technical',
  INFORMATIONAL: 'informational',
  PROBLEM_SOLVING: 'problemSolving',
  CONVERSATIONAL: 'conversational'
};

/**
 * Analyze raw input text to identify key elements
 */
export async function analyzeInput(rawText) {
  const spinner = ora('Analyzing input...').start();
  
  try {
    // Basic NLP analysis for simple cases
    const tokens = tokenizer.tokenize(rawText.toLowerCase());
    const tfidf = new TfIdf();
    
    tfidf.addDocument(rawText);
    
    // Extract key concepts (top terms)
    const keyConcepts = [];
    tfidf.listTerms(0).slice(0, 5).forEach(term => {
      keyConcepts.push(term.term);
    });
    
    // Use AI for deeper analysis
    const analysisPrompt = `
      Analyze the following text and provide a JSON response with these fields:
      - taskType: one of [creative, technical, informational, problemSolving, conversational]
      - intent: a brief description of the user's intent
      - keyConcepts: an array of key concepts mentioned
      - tone: detected tone
      - clarity: rating from 1-10 how clear the request is
      - ambiguities: array of any ambiguous parts that need clarification
      
      Text to analyze: "${rawText}"
      
      Response in JSON format only:
    `;
    
    const aiResponse = await callAI(analysisPrompt);
    let analysis = {};
    
    try {
      analysis = JSON.parse(aiResponse);
    } catch (error) {
      // Fallback to basic analysis if AI response isn't valid JSON
      analysis = {
        taskType: detectTaskType(tokens),
        intent: "Could not determine accurately",
        keyConcepts,
        tone: "neutral",
        clarity: 5,
        ambiguities: ["Could not determine ambiguities automatically"]
      };
    }
    
    spinner.succeed('Analysis complete');
    return analysis;
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error('Error during analysis:', error);
    // Provide basic fallback analysis
    return {
      taskType: TASK_TYPES.CONVERSATIONAL,
      intent: "Could not determine",
      keyConcepts: [],
      tone: "neutral",
      clarity: 3,
      ambiguities: ["Analysis failed, please try again or be more specific"]
    };
  }
}

/**
 * Basic task type detection based on keywords
 */
function detectTaskType(tokens) {
  const creativeWords = ['create', 'write', 'story', 'poem', 'art', 'design', 'imagine', 'creative'];
  const technicalWords = ['code', 'program', 'function', 'technical', 'build', 'develop', 'implement'];
  const informationalWords = ['explain', 'describe', 'what', 'how', 'why', 'information', 'detail'];
  const problemSolvingWords = ['solve', 'fix', 'improve', 'optimize', 'solution', 'problem', 'debug'];
  
  let scores = {
    [TASK_TYPES.CREATIVE]: 0,
    [TASK_TYPES.TECHNICAL]: 0,
    [TASK_TYPES.INFORMATIONAL]: 0,
    [TASK_TYPES.PROBLEM_SOLVING]: 0,
    [TASK_TYPES.CONVERSATIONAL]: 1 // Default base score
  };
  
  tokens.forEach(token => {
    if (creativeWords.includes(token)) scores[TASK_TYPES.CREATIVE]++;
    if (technicalWords.includes(token)) scores[TASK_TYPES.TECHNICAL]++;
    if (informationalWords.includes(token)) scores[TASK_TYPES.INFORMATIONAL]++;
    if (problemSolvingWords.includes(token)) scores[TASK_TYPES.PROBLEM_SOLVING]++;
  });
  
  // Find task type with highest score
  return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}
