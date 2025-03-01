/**
 * Generate a system message based on task type and options
 */
export function generateSystemMessage(taskType, options) {
  const baseMessage = "You are an expert prompt optimizer. Your goal is to rewrite prompts to get the best possible AI responses.";
  
  const taskMessages = {
    creative: "For creative tasks, focus on rich, imaginative language that encourages originality. Include specific details about style, mood, and narrative elements.",
    
    technical: "For technical tasks, focus on precision, clarity, and correctness. Structure prompts with clearly defined requirements, expected formats, and technical constraints.",
    
    informational: "For informational tasks, focus on specifying the depth of information needed, the perspective required, and any particular aspects to emphasize.",
    
    problemSolving: "For problem-solving tasks, clearly define the problem scope, constraints, and desired outcome metrics. Break complex problems into logical steps.",
    
    conversational: "For conversational tasks, focus on establishing the right tone, context, and persona for the conversation. Specify the nature of the dialogue and the desired interaction style."
  };
  
  const toneMessages = {
    formal: "Use formal language and structured presentation. Maintain professional terminology and avoid colloquialisms.",
    casual: "Use conversational language and a relaxed tone. Include occasional colloquialisms and a more approachable style.",
    technical: "Use precise technical language and domain-specific terminology. Focus on accuracy and specificity.",
    friendly: "Use warm, engaging language that creates a connection. Incorporate encouraging phrases and a supportive tone."
  };
  
  const lengthMessages = {
    short: "Keep responses concise and to the point, focusing only on the most essential information.",
    medium: "Provide a balanced amount of detail, covering key points thoroughly without excessive elaboration.",
    detailed: "Include comprehensive details, thorough explanations, and supporting examples where relevant."
  };
  
  const formatMessages = {
    narrative: "Structure the response as a cohesive narrative with a logical flow.",
    list: "Structure the response as an organized list of items.",
    bullet: "Format the response with bullet points for easy scanning.",
    'step-by-step': "Present information as a sequential process with numbered steps."
  };
  
  // Build the complete system message
  let systemMessage = baseMessage + '\n\n';
  
  // Add task-specific instructions
  systemMessage += taskMessages[taskType] || taskMessages.conversational;
  systemMessage += '\n\n';
  
  // Add tone instructions
  systemMessage += toneMessages[options.tone] || '';
  systemMessage += '\n';
  
  // Add length instructions
  systemMessage += lengthMessages[options.length] || '';
  systemMessage += '\n';
  
  // Add format instructions
  systemMessage += formatMessages[options.format] || '';
  
  return systemMessage;
}

/**
 * Get a system message template by name
 */
export function getSystemMessageTemplate(templateName) {
  const templates = {
    default: "You are an expert prompt optimizer. Your goal is to rewrite prompts to get the best possible AI responses.",
    
    technical_writing: `You are a technical writing expert who specializes in creating clear, precise technical prompts.
      Focus on structural clarity, technical accuracy, and eliminating ambiguity.
      Use technical terminology appropriately and include specifications where relevant.`,
    
    creative_writing: `You are a creative writing coach who helps craft imaginative and inspiring prompts.
      Emphasize vivid descriptions, emotional resonance, and creative elements.
      Consider narrative structure, character development, and thematic elements when appropriate.`,
    
    academic: `You are an academic writing consultant who specializes in scholarly prompts.
      Focus on rigor, proper citation needs, methodological considerations, and academic terminology.
      Ensure prompts request appropriate levels of evidence and theoretical framework when relevant.`,
    
    business: `You are a business communications expert who crafts effective professional prompts.
      Focus on clarity, actionability, and business value.
      Use appropriate business terminology and ensure prompts align with professional objectives.`
  };
  
  return templates[templateName] || templates.default;
}
