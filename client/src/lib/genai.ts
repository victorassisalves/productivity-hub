import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// Initialize the Google GenerativeAI with your API key
// The API key should be added as an environment variable
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY || '');

// Default safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Get Gemini Pro model
export const getGeminiProModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    safetySettings,
  });
};

// Generate task descriptions or suggestions
export const generateTaskSuggestions = async (prompt: string): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GOOGLE_AI_API_KEY) {
      console.warn('Google AI API key is missing. Add it to your environment variables.');
      return 'AI suggestions are not available. Please add your Google AI API key.';
    }

    const model = getGeminiProModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return 'Failed to generate suggestions. Please try again later.';
  }
};

// Optimize task schedule based on priorities and deadlines
export const optimizeTaskSchedule = async (tasks: any[]): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GOOGLE_AI_API_KEY) {
      return 'AI optimization is not available. Please add your Google AI API key.';
    }

    const prompt = `
    I have the following tasks. Please help me organize them optimally based on priority, deadline, and estimated time:
    ${JSON.stringify(tasks, null, 2)}
    
    Provide a suggested daily schedule with time blocks. Consider:
    1. High priority tasks should be done earlier
    2. Group similar tasks together for efficiency
    3. Include short breaks between tasks
    4. Consider deadlines
    
    Return your answer as a daily plan with specific time blocks.
    `;

    const model = getGeminiProModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error optimizing task schedule:', error);
    return 'Failed to optimize schedule. Please try again later.';
  }
};

// Generate insights from productivity data
export const generateProductivityInsights = async (data: any): Promise<string> => {
  try {
    if (!import.meta.env.VITE_GOOGLE_AI_API_KEY) {
      return 'AI insights are not available. Please add your Google AI API key.';
    }

    const prompt = `
    Analyze the following productivity data and provide actionable insights:
    ${JSON.stringify(data, null, 2)}
    
    Consider:
    1. Patterns in productive vs. unproductive time
    2. Task completion rates
    3. Time spent per project/category
    4. Suggestions for improvement
    
    Return 3-5 key insights with specific suggestions for improvement.
    `;

    const model = getGeminiProModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating productivity insights:', error);
    return 'Failed to generate insights. Please try again later.';
  }
};