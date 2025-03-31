import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_POMODORO_DURATIONS } from "@/lib/constants";
import { useTimerContext } from "@/context/timer-context";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function PomodoroTimer() {
  const { 
    isActive, 
    timeLeft, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    currentDuration, 
    setCurrentDuration,
    totalSessionsToday 
  } = useTimerContext();

  // Format time
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress circle
  const calculateProgress = () => {
    const progress = (currentDuration * 60 - timeLeft) / (currentDuration * 60);
    const circumference = 2 * Math.PI * 45;
    return circumference * (1 - progress);
  };

  // Get tasks for task selection
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && selectedTaskId) {
      const recordSession = async () => {
        try {
          await apiRequest("POST", "/api/pomodoro", {
            taskId: selectedTaskId,
            startTime: new Date(Date.now() - currentDuration * 60 * 1000),
            duration: currentDuration,
            completed: true,
            endTime: new Date()
          });
        } catch (error) {
          console.error("Failed to record session:", error);
        }
      };
      recordSession();
    }
  }, [timeLeft, selectedTaskId, currentDuration]);

  return (
    <Card className="mb-8">
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-900">Pomodoro Timer</CardTitle>
        <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-gray-500">
          <span className="material-icons">more_horiz</span>
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-gray-200" strokeWidth="4" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
              <circle 
                className="text-primary-600 transform -rotate-90" 
                strokeWidth="4" 
                stroke="currentColor" 
                fill="transparent" 
                r="45" 
                cx="50" 
                cy="50" 
                strokeDasharray={2 * Math.PI * 45} 
                strokeDashoffset={calculateProgress()} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-900">
              {formatTime()}
            </div>
          </div>
          <div className="flex space-x-2 mb-6">
            <Button 
              variant={currentDuration === DEFAULT_POMODORO_DURATIONS.SHORT ? "default" : "outline"}
              onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.SHORT)}
              className={cn(
                "px-4 py-2",
                currentDuration === DEFAULT_POMODORO_DURATIONS.SHORT 
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700"
              )}
            >
              5 min
            </Button>
            <Button 
              variant={currentDuration === DEFAULT_POMODORO_DURATIONS.MEDIUM ? "default" : "outline"}
              onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.MEDIUM)}
              className={cn(
                "px-4 py-2",
                currentDuration === DEFAULT_POMODORO_DURATIONS.MEDIUM 
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700"
              )}
            >
              25 min
            </Button>
            <Button 
              variant={currentDuration === DEFAULT_POMODORO_DURATIONS.LONG ? "default" : "outline"}
              onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.LONG)}
              className={cn(
                "px-4 py-2",
                currentDuration === DEFAULT_POMODORO_DURATIONS.LONG 
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700"
              )}
            >
              45 min
            </Button>
          </div>
          
          <div className="mb-5 w-full">
            <select 
              className="w-full p-2 border border-gray-300 rounded-md" 
              value={selectedTaskId || ''} 
              onChange={(e) => setSelectedTaskId(Number(e.target.value) || null)}
            >
              <option value="">Select a task</option>
              {tasks.filter(t => t.status !== 'completed').map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-3">
            {!isActive ? (
              <Button 
                onClick={startTimer} 
                disabled={!selectedTaskId}
                className="px-6 py-2 bg-primary-600 text-white hover:bg-primary-700"
              >
                Start
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                className="px-6 py-2 bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Pause
              </Button>
            )}
            <Button 
              onClick={resetTimer} 
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </Button>
          </div>
          <div className="mt-5 text-sm text-gray-500 text-center">
            {selectedTask && (
              <p>Current Task: <span className="font-medium text-gray-800">{selectedTask.title}</span></p>
            )}
            <p className="mt-1">Today's sessions: <span className="font-medium text-gray-800">{totalSessionsToday} completed</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
