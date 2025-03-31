import { useState } from 'react';
import { generateTaskSuggestions, optimizeTaskSchedule, generateProductivityInsights } from '@/lib/genai';
import { useToast } from '@/hooks/use-toast';

export function useGenAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const checkApiKey = (): boolean => {
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      toast({
        title: 'API Key Missing',
        description: 'Please add your Google AI API key to the environment variables.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const generateSuggestions = async (prompt: string): Promise<string | null> => {
    if (!checkApiKey()) return null;
    
    try {
      setIsGenerating(true);
      const result = await generateTaskSuggestions(prompt);
      return result;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Generation Error',
        description: 'Failed to generate suggestions. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeSchedule = async (tasks: any[]): Promise<string | null> => {
    if (!checkApiKey()) return null;
    
    try {
      setIsGenerating(true);
      const result = await optimizeTaskSchedule(tasks);
      return result;
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: 'Optimization Error',
        description: 'Failed to optimize schedule. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getProductivityInsights = async (data: any): Promise<string | null> => {
    if (!checkApiKey()) return null;
    
    try {
      setIsGenerating(true);
      const result = await generateProductivityInsights(data);
      return result;
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSuggestions,
    optimizeSchedule,
    getProductivityInsights,
  };
}