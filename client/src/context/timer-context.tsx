import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PomodoroSession, InsertPomodoroSession } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DEFAULT_POMODORO_DURATIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface TimerContextType {
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  currentDuration: number;
  totalSessionsToday: number;
  setCurrentDuration: (minutes: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  completeTimer: (taskId?: number) => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_POMODORO_DURATIONS.MEDIUM);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  
  // Fetch pomodoro sessions
  const { data: pomodoroSessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro"],
  });
  
  // Calculate total sessions today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const totalSessionsToday = pomodoroSessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= today && session.completed;
  }).length;
  
  // Create pomodoro session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (session: InsertPomodoroSession) => {
      const response = await apiRequest("POST", "/api/pomodoro", session);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro"] });
    },
  });
  
  // Update pomodoro session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<PomodoroSession> }) => {
      const response = await apiRequest("PUT", `/api/pomodoro/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro"] });
    },
  });
  
  // Initialize timeLeft when currentDuration changes
  useEffect(() => {
    setTimeLeft(currentDuration * 60);
  }, [currentDuration]);
  
  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer complete
            clearInterval(interval);
            setIsActive(false);
            setIsPaused(false);
            
            // Play sound
            const audio = new Audio("https://assets.coderrocketfuel.com/pomodoro-times-up.mp3");
            audio.play().catch(e => console.log("Audio playback failed:", e));
            
            toast({
              title: "Time's up!",
              description: "Your pomodoro session is complete.",
            });
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
  }, [isActive, isPaused, toast]);
  
  // Timer controls
  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setTimerStart(new Date());
  }, []);
  
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(currentDuration * 60);
    setTimerStart(null);
  }, [currentDuration]);
  
  const completeTimer = useCallback(async (taskId?: number) => {
    if (!timerStart) return;
    
    try {
      await createSessionMutation.mutateAsync({
        taskId: taskId,
        startTime: timerStart,
        duration: currentDuration,
      });
      
      resetTimer();
      
      toast({
        title: "Session completed",
        description: "Your pomodoro session has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Failed to record session",
        description: "There was an error recording your session.",
        variant: "destructive",
      });
    }
  }, [timerStart, currentDuration, createSessionMutation, resetTimer, toast]);
  
  // Context value
  const value: TimerContextType = {
    isActive,
    isPaused,
    timeLeft,
    currentDuration,
    totalSessionsToday,
    setCurrentDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeTimer,
  };
  
  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimerContext must be used within a TimerProvider");
  }
  return context;
}
