import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Task, PomodoroSession, Goal } from "@shared/schema";
import { Link } from "wouter";

export function ProductivityMetrics() {
  // Fetch tasks to display metrics
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch pomodoro sessions for today
  const { data: pomodoroSessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro"],
  });

  // Fetch goals for progress tracking
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Calculate metrics
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  
  // Calculate focus time today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = pomodoroSessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= today && session.completed;
  });
  
  const totalFocusMinutes = todaySessions.reduce((sum, session) => sum + session.duration, 0);
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusMinutes = totalFocusMinutes % 60;
  
  // High priority tasks
  const highPriorityTasks = tasks.filter(task => task.priority === "high" || task.priority === "urgent").length;
  
  // Goal progress - calculate average progress across all goals
  const averageGoalProgress = goals.length 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) 
    : 0;

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <span className="material-icons text-primary-600">task_alt</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Tasks Completed</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{completedTasks} / {totalTasks}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/tasks" className="font-medium text-primary-600 hover:text-primary-900">
              View all tasks
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <span className="material-icons text-green-600">timer</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Focus Time Today</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{focusHours}h {focusMinutes}m</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/pomodoro" className="font-medium text-primary-600 hover:text-primary-900">
              Start Pomodoro
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
              <span className="material-icons text-orange-600">priority_high</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">High Priority Tasks</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{highPriorityTasks}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/eisenhower" className="font-medium text-primary-600 hover:text-primary-900">
              View Matrix
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <span className="material-icons text-purple-600">track_changes</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Goals Progress</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{averageGoalProgress}%</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/smart-goals" className="font-medium text-primary-600 hover:text-primary-900">
              View Goals
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
