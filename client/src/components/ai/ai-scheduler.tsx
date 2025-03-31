import { useState } from 'react';
import { useGenAI } from '@/hooks/use-genai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate: Date | null;
  timeEstimate: number | null;
  status: string;
}

interface AISchedulerProps {
  tasks: Task[];
  onScheduleGenerated?: (schedule: string) => void;
}

export function AIScheduler({ tasks, onScheduleGenerated }: AISchedulerProps) {
  const [schedule, setSchedule] = useState<string | null>(null);
  const { isGenerating, optimizeSchedule } = useGenAI();

  const handleGenerateSchedule = async () => {
    if (!tasks || tasks.length === 0) return;
    
    const result = await optimizeSchedule(tasks);
    if (result) {
      setSchedule(result);
      if (onScheduleGenerated) {
        onScheduleGenerated(result);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          AI Schedule Optimizer
        </CardTitle>
        <CardDescription>
          Let AI optimize your task schedule based on priorities and deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Using {tasks.length} tasks for optimization
          </p>
        </div>

        {schedule && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Optimized Schedule:</h3>
            <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
              {schedule}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateSchedule} 
          disabled={isGenerating || tasks.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Optimize Schedule
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}