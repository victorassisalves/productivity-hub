import { useState } from 'react';
import { useGenAI } from '@/hooks/use-genai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LineChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AIInsightsProps {
  productivityData: any;
  onInsightsGenerated?: (insights: string) => void;
}

export function AIInsights({ productivityData, onInsightsGenerated }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const { isGenerating, getProductivityInsights } = useGenAI();

  const handleGenerateInsights = async () => {
    if (!productivityData) return;
    
    const result = await getProductivityInsights(productivityData);
    if (result) {
      setInsights(result);
      if (onInsightsGenerated) {
        onInsightsGenerated(result);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          AI Productivity Insights
        </CardTitle>
        <CardDescription>
          Get AI-powered insights to improve your productivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!productivityData || Object.keys(productivityData).length === 0 ? (
          <Alert variant="destructive">
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              Complete some tasks or track your productivity to generate insights.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            Using your productivity data from the past period
          </p>
        )}

        {insights && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">AI Insights:</h3>
            <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
              {insights}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateInsights} 
          disabled={isGenerating || !productivityData || Object.keys(productivityData).length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <LineChart className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}