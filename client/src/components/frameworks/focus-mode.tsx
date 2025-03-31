import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimerContext } from "@/context/timer-context";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { DEFAULT_POMODORO_DURATIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function FocusMode() {
  const { toast } = useToast();
  const { 
    isActive, 
    timeLeft, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    resetTimer, 
    currentDuration, 
    setCurrentDuration,
    completeTimer 
  } = useTimerContext();
  
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundNoise, setBackgroundNoise] = useState<string | null>(null);
  const [backgroundVolume, setBackgroundVolume] = useState(50);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [blockNotifications, setBlockNotifications] = useState(true);
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const incompleteTasks = tasks.filter(task => !task.completed);
  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  
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
  
  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      // Play sound
      const audio = new Audio("https://assets.coderrocketfuel.com/pomodoro-times-up.mp3");
      audio.play().catch(e => console.log("Audio playback failed:", e));
      
      if (selectedTaskId) {
        completeTimer(selectedTaskId);
      }
      
      // Switch between focus and break
      setIsBreakMode(!isBreakMode);
      
      // If coming from focus period, suggest a break
      if (!isBreakMode) {
        toast({
          title: "Focus session complete!",
          description: "Take a short break before your next focus session.",
        });
        setCurrentDuration(DEFAULT_POMODORO_DURATIONS.SHORT);
      } else {
        toast({
          title: "Break complete!",
          description: "Ready to start another focus session?",
        });
        setCurrentDuration(DEFAULT_POMODORO_DURATIONS.MEDIUM);
      }
    }
  }, [timeLeft, isActive, selectedTaskId, completeTimer, isBreakMode, toast, setCurrentDuration]);
  
  // Handle background noise
  useEffect(() => {
    if (backgroundNoise) {
      const audio = new Audio(getNoiseUrl(backgroundNoise));
      audio.loop = true;
      audio.volume = backgroundVolume / 100;
      setAudioElement(audio);
      audio.play().catch(e => console.log("Audio playback failed:", e));
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } else if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioElement(null);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [backgroundNoise]);
  
  // Update volume when changed
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = backgroundVolume / 100;
    }
  }, [backgroundVolume, audioElement]);
  
  // Handle fullscreen mode
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    
    if (isFullscreen) {
      document.addEventListener("keydown", handleEsc);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isFullscreen]);
  
  // Get URL for noise
  const getNoiseUrl = (type: string) => {
    const noises: Record<string, string> = {
      "rain": "https://sounds.pond5.com/rain-forest-sound-effect-093001788_nj_prev.m4a",
      "waves": "https://sounds.pond5.com/ocean-waves-sound-effect-093001752_nj_prev.m4a",
      "whitenoise": "https://sounds.pond5.com/quiet-white-noise-sound-effect-094232548_nj_prev.m4a",
      "forest": "https://sounds.pond5.com/forest-sounds-sound-effect-022014703_nj_prev.m4a",
      "cafe": "https://sounds.pond5.com/coffee-shop-sound-effect-054628138_nj_prev.m4a"
    };
    
    return noises[type] || "";
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Select background noise
  const selectNoise = (noise: string) => {
    if (backgroundNoise === noise) {
      setBackgroundNoise(null);
    } else {
      setBackgroundNoise(noise);
    }
  };
  
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50">
        <div className="text-center">
          <div className="text-8xl font-bold mb-8">{formatTime()}</div>
          
          {selectedTask && (
            <div className="mb-8 text-2xl">
              {isBreakMode ? "Taking a break" : `Working on: ${selectedTask.title}`}
            </div>
          )}
          
          <div className="flex justify-center space-x-4 mb-8">
            {!isActive ? (
              <Button 
                size="lg"
                onClick={startTimer} 
                className="px-10 py-6 text-xl bg-green-600 hover:bg-green-700"
              >
                Start
              </Button>
            ) : isActive && !isPaused ? (
              <Button 
                size="lg"
                onClick={pauseTimer} 
                className="px-10 py-6 text-xl bg-yellow-600 hover:bg-yellow-700"
              >
                Pause
              </Button>
            ) : (
              <Button 
                size="lg"
                onClick={resumeTimer} 
                className="px-10 py-6 text-xl bg-blue-600 hover:bg-blue-700"
              >
                Resume
              </Button>
            )}
            
            <Button 
              size="lg"
              onClick={resetTimer} 
              variant="outline" 
              className="px-10 py-6 text-xl border-white text-white hover:bg-gray-800"
            >
              Reset
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            Exit Fullscreen
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Focus Mode</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Eliminate distractions and focus deeply on your important tasks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-60 h-60 mb-6">
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
                      <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-gray-900">
                        {formatTime()}
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-6">
                      <Badge 
                        variant={isBreakMode ? "success" : "primary"} 
                        className="text-sm py-1 px-3"
                      >
                        {isBreakMode ? "Break Time" : "Focus Session"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-6 w-full max-w-md">
                      <Button 
                        variant={currentDuration === DEFAULT_POMODORO_DURATIONS.SHORT ? "default" : "outline"}
                        onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.SHORT)}
                        className="w-full"
                      >
                        5 min
                      </Button>
                      <Button 
                        variant={currentDuration === DEFAULT_POMODORO_DURATIONS.MEDIUM ? "default" : "outline"}
                        onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.MEDIUM)}
                        className="w-full"
                      >
                        25 min
                      </Button>
                      <Button 
                        variant={currentDuration === DEFAULT_POMODORO_DURATIONS.LONG ? "default" : "outline"}
                        onClick={() => setCurrentDuration(DEFAULT_POMODORO_DURATIONS.LONG)}
                        className="w-full"
                      >
                        45 min
                      </Button>
                    </div>
                    
                    <div className="w-full max-w-md mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select a task to focus on:
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md" 
                        value={selectedTaskId || ''} 
                        onChange={(e) => setSelectedTaskId(Number(e.target.value) || null)}
                      >
                        <option value="">Select a task</option>
                        {incompleteTasks.map(task => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      {!isActive ? (
                        <Button 
                          onClick={startTimer} 
                          disabled={!selectedTaskId}
                          className="px-8"
                        >
                          Start Focus
                        </Button>
                      ) : isPaused ? (
                        <Button 
                          onClick={resumeTimer} 
                          className="px-8 bg-blue-600 hover:bg-blue-700"
                        >
                          Resume
                        </Button>
                      ) : (
                        <Button 
                          onClick={pauseTimer} 
                          className="px-8 bg-yellow-500 hover:bg-yellow-600"
                        >
                          Pause
                        </Button>
                      )}
                      <Button 
                        onClick={resetTimer} 
                        variant="outline" 
                        className="px-8"
                      >
                        Reset
                      </Button>
                      <Button 
                        onClick={toggleFullscreen}
                        variant="outline" 
                        className="px-8"
                      >
                        <span className="material-icons mr-2">fullscreen</span>
                        Fullscreen
                      </Button>
                    </div>
                    
                    {selectedTask && (
                      <div className="text-center text-gray-500">
                        {isBreakMode ? (
                          <p>Taking a break before continuing work</p>
                        ) : (
                          <p>Currently focusing on: <span className="font-medium text-gray-800">{selectedTask.title}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Focus Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="do-not-disturb">Block Notifications</Label>
                        <div className="text-xs text-gray-500">
                          Minimize distractions while focusing
                        </div>
                      </div>
                      <Switch
                        id="do-not-disturb"
                        checked={blockNotifications}
                        onCheckedChange={setBlockNotifications}
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Background Noise</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={backgroundNoise === "rain" ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNoise("rain")}
                          className="w-full justify-start"
                        >
                          <span className="material-icons mr-2 text-sm">water_drop</span>
                          Rain
                        </Button>
                        <Button
                          variant={backgroundNoise === "waves" ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNoise("waves")}
                          className="w-full justify-start"
                        >
                          <span className="material-icons mr-2 text-sm">waves</span>
                          Ocean Waves
                        </Button>
                        <Button
                          variant={backgroundNoise === "forest" ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNoise("forest")}
                          className="w-full justify-start"
                        >
                          <span className="material-icons mr-2 text-sm">park</span>
                          Forest
                        </Button>
                        <Button
                          variant={backgroundNoise === "cafe" ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNoise("cafe")}
                          className="w-full justify-start"
                        >
                          <span className="material-icons mr-2 text-sm">local_cafe</span>
                          Café
                        </Button>
                        <Button
                          variant={backgroundNoise === "whitenoise" ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectNoise("whitenoise")}
                          className="w-full justify-start"
                        >
                          <span className="material-icons mr-2 text-sm">tune</span>
                          White Noise
                        </Button>
                      </div>
                    </div>
                    
                    {backgroundNoise && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="volume">Volume</Label>
                          <span className="text-sm text-gray-500">{backgroundVolume}%</span>
                        </div>
                        <Slider
                          id="volume"
                          min={0}
                          max={100}
                          step={5}
                          defaultValue={[50]}
                          value={[backgroundVolume]}
                          onValueChange={(value) => setBackgroundVolume(value[0])}
                        />
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-3">Focus Tips</h4>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-start">
                          <span className="material-icons text-primary-600 mr-2 text-sm">check_circle</span>
                          <span>Close email and messaging apps</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-primary-600 mr-2 text-sm">check_circle</span>
                          <span>Put your phone on silent mode</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-primary-600 mr-2 text-sm">check_circle</span>
                          <span>Use the 25/5 pattern: 25 min focus, 5 min break</span>
                        </li>
                        <li className="flex items-start">
                          <span className="material-icons text-primary-600 mr-2 text-sm">check_circle</span>
                          <span>Stay hydrated and take brief movement breaks</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
