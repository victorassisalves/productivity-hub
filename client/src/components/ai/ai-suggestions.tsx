import { useState } from 'react';
import { useGenAI } from '@/hooks/use-genai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface AISuggestionsProps {
  initialPrompt?: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export function AISuggestions({ initialPrompt = '', onSuggestionSelect }: AISuggestionsProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { isGenerating, generateSuggestions } = useGenAI();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await generateSuggestions(prompt);
    if (result) {
      setSuggestion(result);
    }
  };

  const handleSuggestionSelect = () => {
    if (suggestion && onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions for your tasks and productivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            What would you like suggestions for?
          </label>
          <Textarea
            id="prompt"
            placeholder="E.g., Suggest tasks for my marketing project"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-24"
          />
        </div>

        {suggestion && (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Suggestion:</h3>
            <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
              {suggestion}
            </div>
            {onSuggestionSelect && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSuggestionSelect}
                className="mt-2"
              >
                Use This Suggestion
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Suggestions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}