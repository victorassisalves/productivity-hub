import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Task, 
  PomodoroSession, 
  TimeBlock 
} from "@shared/schema";
import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { format, startOfWeek, addDays, differenceInMinutes, isWithinInterval, startOfDay, endOfDay, subDays } from "date-fns";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  
  // Fetch data for analytics
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const { data: pomodoroSessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro"],
  });
  
  const { data: timeBlocks = [] } = useQuery<TimeBlock[]>({
    queryKey: ["/api/timeblocks"],
  });
  
  // Calculate date range based on selected timeRange
  const getDateRange = () => {
    const today = new Date();
    const ranges = {
      day: { start: startOfDay(today), end: new Date() },
      week: { start: startOfDay(subDays(today, 6)), end: new Date() },
      month: { start: startOfDay(subDays(today, 29)), end: new Date() }
    };
    
    return ranges[timeRange];
  };
  
  const dateRange = getDateRange();
  
  // Filter data by date range
  const rangeFilteredTasks = tasks.filter(task => {
    return task.createdAt && new Date(task.createdAt) >= dateRange.start && new Date(task.createdAt) <= dateRange.end;
  });
  
  const rangeFilteredSessions = pomodoroSessions.filter(session => {
    return new Date(session.startTime) >= dateRange.start && new Date(session.startTime) <= dateRange.end;
  });
  
  const rangeFilteredTimeBlocks = timeBlocks.filter(block => {
    return new Date(block.startTime) >= dateRange.start && new Date(block.startTime) <= dateRange.end;
  });
  
  // Tasks by priority
  const tasksByPriority = Object.values(TASK_PRIORITIES).map(priority => {
    const priorityTasks = rangeFilteredTasks.filter(task => task.priority === priority);
    
    return {
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: priorityTasks.length,
      color: priority === TASK_PRIORITIES.LOW 
        ? '#48bb78' 
        : priority === TASK_PRIORITIES.MEDIUM 
          ? '#ecc94b' 
          : priority === TASK_PRIORITIES.HIGH 
            ? '#ed8936' 
            : '#f56565'
    };
  });
  
  // Tasks by status
  const tasksByStatus = Object.values(TASK_STATUSES).map(status => {
    const statusTasks = rangeFilteredTasks.filter(task => task.status === status);
    
    return {
      name: status === TASK_STATUSES.TODO 
        ? "To Do" 
        : status === TASK_STATUSES.IN_PROGRESS 
          ? "In Progress" 
          : "Completed",
      value: statusTasks.length,
      color: status === TASK_STATUSES.TODO 
        ? '#CBD5E0' 
        : status === TASK_STATUSES.IN_PROGRESS 
          ? '#4299E1' 
          : '#48BB78'
    };
  });
  
  // Tasks created over time
  const getTimeSeriesData = () => {
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const tasksCreated = rangeFilteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt!);
        return isWithinInterval(taskDate, { start: dayStart, end: dayEnd });
      }).length;
      
      const tasksCompleted = rangeFilteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt!);
        return isWithinInterval(taskDate, { start: dayStart, end: dayEnd }) && task.status === TASK_STATUSES.COMPLETED;
      }).length;
      
      const focusMinutes = rangeFilteredSessions
        .filter(session => {
          const sessionDate = new Date(session.startTime);
          return isWithinInterval(sessionDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, session) => sum + session.duration, 0);
      
      data.push({
        date: format(date, timeRange === 'day' ? 'HH:mm' : 'MMM dd'),
        tasksCreated,
        tasksCompleted,
        focusMinutes
      });
    }
    
    return data;
  };
  
  const timeSeriesData = getTimeSeriesData();
  
  // Focus time analysis
  const totalFocusTime = rangeFilteredSessions.reduce((sum, session) => sum + session.duration, 0);
  const avgFocusTimePerDay = totalFocusTime / (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30);
  const completedFocusSessions = rangeFilteredSessions.filter(s => s.completed).length;
  const totalSessions = rangeFilteredSessions.length;
  const completionRate = totalSessions > 0 ? (completedFocusSessions / totalSessions) * 100 : 0;
  
  // Time blocking analysis
  const totalBlockedTime = rangeFilteredTimeBlocks.reduce((sum, block) => {
    return sum + differenceInMinutes(new Date(block.endTime), new Date(block.startTime));
  }, 0);
  
  const avgBlockedTimePerDay = totalBlockedTime / (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30);
  
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Productivity Insights</h2>
        <div className="flex space-x-2 bg-white border rounded-md p-1">
          <Button 
            variant={timeRange === "day" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("day")}
          >
            Day
          </Button>
          <Button 
            variant={timeRange === "week" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === "month" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Tasks Completed</div>
              <div className="text-3xl font-bold">
                {rangeFilteredTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length}
              </div>
              <div className="text-sm text-gray-500">
                out of {rangeFilteredTasks.length} tasks
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Focus Time</div>
              <div className="text-3xl font-bold">
                {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
              </div>
              <div className="text-sm text-gray-500">
                Avg: {Math.round(avgFocusTimePerDay)} min/day
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Time Blocked</div>
              <div className="text-3xl font-bold">
                {Math.floor(totalBlockedTime / 60)}h {totalBlockedTime % 60}m
              </div>
              <div className="text-sm text-gray-500">
                Avg: {Math.round(avgBlockedTimePerDay)} min/day
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">Pomodoro Completion</div>
              <div className="text-3xl font-bold">
                {Math.round(completionRate)}%
              </div>
              <div className="text-sm text-gray-500">
                {completedFocusSessions} of {totalSessions} sessions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Created & Completed Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={50} 
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value, ""]} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tasksCreated" 
                    name="Tasks Created" 
                    stroke="#3182ce" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasksCompleted" 
                    name="Tasks Completed" 
                    stroke="#48bb78" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Focus Minutes Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Focus Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSeriesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={-45} 
                    textAnchor="end" 
                    height={50} 
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${value} min`, "Focus Time"]} />
                  <Bar 
                    dataKey="focusMinutes" 
                    name="Focus Minutes" 
                    fill="#805ad5" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Task Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-primary-600">
                    {rangeFilteredTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length}
                  </div>
                  <div className="text-sm text-gray-500">Completed Tasks</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {rangeFilteredTasks.length > 0 
                      ? `${Math.round((rangeFilteredTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length / rangeFilteredTasks.length) * 100)}% completion rate`
                      : "No tasks in selected period"}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {rangeFilteredTasks.filter(t => t.priority === TASK_PRIORITIES.HIGH || t.priority === TASK_PRIORITIES.URGENT).length}
                  </div>
                  <div className="text-sm text-gray-500">High Priority Tasks</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {rangeFilteredTasks.filter(t => (t.priority === TASK_PRIORITIES.HIGH || t.priority === TASK_PRIORITIES.URGENT) && t.status === TASK_STATUSES.COMPLETED).length} completed
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(rangeFilteredTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / (rangeFilteredTasks.length || 1))}%
                  </div>
                  <div className="text-sm text-gray-500">Average Progress</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Across all tasks
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Focus Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(avgFocusTimePerDay)} min
                  </div>
                  <div className="text-sm text-gray-500">Average Daily Focus</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {totalFocusTime} total minutes
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {completedFocusSessions}
                  </div>
                  <div className="text-sm text-gray-500">Completed Sessions</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {Math.round(completionRate)}% completion rate
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">
                    {Math.round(avgBlockedTimePerDay)} min
                  </div>
                  <div className="text-sm text-gray-500">Avg. Daily Scheduled</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Time blocking utilization
                  </div>
                </div>
              </div>
            </div>
            
            {/* Productivity Score */}
            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-primary-800">Productivity Score</h3>
                  <p className="text-sm text-primary-600 mt-1">
                    Based on task completion, focus time, and time management
                  </p>
                </div>
                <div className="text-3xl font-bold text-primary-700">
                  {/* Calculate a simple productivity score */}
                  {Math.min(
                    100, 
                    Math.round(
                      (
                        (rangeFilteredTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length / (rangeFilteredTasks.length || 1)) * 40 +
                        (Math.min(avgFocusTimePerDay, 120) / 120) * 30 +
                        (Math.min(avgBlockedTimePerDay, 240) / 240) * 20 +
                        (completionRate / 100) * 10
                      )
                    )
                  )}
                </div>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2.5 mt-3">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(
                      100, 
                      Math.round(
                        (
                          (rangeFilteredTasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length / (rangeFilteredTasks.length || 1)) * 40 +
                          (Math.min(avgFocusTimePerDay, 120) / 120) * 30 +
                          (Math.min(avgBlockedTimePerDay, 240) / 240) * 20 +
                          (completionRate / 100) * 10
                        )
                      )
                    )}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Productivity Tips */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Productivity Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {totalFocusTime < 60 * 2 && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start">
                      <span className="material-icons text-blue-600 mr-2">tips_and_updates</span>
                      <div>
                        <h4 className="font-medium text-blue-800">Increase Focus Time</h4>
                        <p className="text-sm text-blue-600">
                          Try to schedule at least 2 hours of focused work each day using the Pomodoro technique.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {rangeFilteredTasks.filter(t => t.priority === TASK_PRIORITIES.HIGH && t.status !== TASK_STATUSES.COMPLETED).length > 3 && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start">
                      <span className="material-icons text-red-600 mr-2">priority_high</span>
                      <div>
                        <h4 className="font-medium text-red-800">High Priority Backlog</h4>
                        <p className="text-sm text-red-600">
                          You have {rangeFilteredTasks.filter(t => t.priority === TASK_PRIORITIES.HIGH && t.status !== TASK_STATUSES.COMPLETED).length} high priority tasks. Try using the Eisenhower Matrix to prioritize.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {completionRate < 70 && totalSessions > 3 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <div className="flex items-start">
                      <span className="material-icons text-yellow-600 mr-2">timer</span>
                      <div>
                        <h4 className="font-medium text-yellow-800">Session Completion</h4>
                        <p className="text-sm text-yellow-600">
                          Your Pomodoro completion rate is {Math.round(completionRate)}%. Try using shorter sessions to build consistency.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {avgBlockedTimePerDay < 60 && (
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="flex items-start">
                      <span className="material-icons text-purple-600 mr-2">calendar_month</span>
                      <div>
                        <h4 className="font-medium text-purple-800">Time Blocking</h4>
                        <p className="text-sm text-purple-600">
                          Try scheduling more of your day with Time Blocking to improve focus and productivity.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
