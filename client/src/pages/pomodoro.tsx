import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// Import but don't use directly
// import { useTimerContext } from "@/context/timer-context";
import { useTaskContext } from "@/context/task-context";
import { useQuery } from "@tanstack/react-query";
import { PomodoroSession } from "@shared/schema";
import { format } from "date-fns";
// Don't import PomodoroTimer yet, we'll add it back later
// import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PomodoroPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Placeholder for now
  const totalSessionsToday = 0;  // We'll fix this properly later
  const { tasks } = useTaskContext();

  // Fetch pomodoro sessions
  const { data: pomodoroSessions = [] } = useQuery<PomodoroSession[]>({
    queryKey: ["/api/pomodoro"],
  });

  // Get sessions for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  const sessionsData = last7Days.map(day => {
    const sessions = pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === day.getTime();
    });

    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal

    return {
      date: format(day, 'MMM dd'),
      minutes: totalMinutes,
      hours: totalHours,
      count: sessions.length
    };
  });

  // Most focused tasks (most pomodoro sessions)
  const taskSessionCounts = pomodoroSessions.reduce<Record<number, number>>((acc, session) => {
    if (session.taskId) {
      acc[session.taskId] = (acc[session.taskId] || 0) + 1;
    }
    return acc;
  }, {});

  const topTasks = Object.entries(taskSessionCounts)
    .map(([taskId, count]) => ({
      task: tasks.find(t => t.id === Number(taskId)) || { id: Number(taskId), title: "Unknown Task" },
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        onMobileClose={() => setIsMobileOpen(false)} 
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <TopNavigation onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pomodoro Timer</h1>
                <p className="text-gray-500 mt-1">
                  Work in focused sprints with timed breaks
                </p>
              </div>
            </div>
          </div>

          {/* Pomodoro Timer component */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Timer (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center p-6">
                <p>The Pomodoro Timer feature is currently under maintenance. Please check back soon!</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily & Weekly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">{totalSessionsToday}</div>
                      <div className="text-sm text-gray-500">Sessions Today</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {pomodoroSessions
                          .filter(s => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return new Date(s.startTime) >= today;
                          })
                          .reduce((sum, s) => sum + s.duration, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Minutes Today</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {pomodoroSessions.filter(s => s.completed).length}
                      </div>
                      <div className="text-sm text-gray-500">Total Completed</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Most Focused Tasks</h3>
                    <div className="space-y-2">
                      {topTasks.length > 0 ? (
                        topTasks.map(({ task, count }) => (
                          <div key={task.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm truncate max-w-[70%]">{task.title}</span>
                            <span className="text-sm font-medium bg-primary-100 text-primary-800 px-2 py-1 rounded">
                              {count} session{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No sessions recorded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sessionsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="minutes" name="Minutes" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="count" name="Sessions" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pomodoro Technique Information */}
          <Card>
            <CardHeader>
              <CardTitle>About the Pomodoro Technique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. 
                  The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, 
                  separated by short breaks.
                </p>
                
                <h3>How to use the Pomodoro Technique:</h3>
                
                <ol>
                  <li><strong>Select a task</strong> you want to focus on.</li>
                  <li><strong>Set the timer</strong> for 25 minutes (a "pomodoro").</li>
                  <li><strong>Work on the task</strong> until the timer rings. If a distraction pops into your head, write it down, but immediately get back on task.</li>
                  <li>When the timer rings, <strong>take a short break</strong> (5 minutes).</li>
                  <li>After four pomodoros, <strong>take a longer break</strong> (15-30 minutes).</li>
                </ol>
                
                <h3>Benefits:</h3>
                
                <ul>
                  <li>Reduces the impact of internal and external interruptions</li>
                  <li>Increases focus and concentration by cutting down on distractions</li>
                  <li>Creates a sense of urgency, helping you accomplish more</li>
                  <li>Keeps you fresh and motivated by incorporating regular breaks</li>
                  <li>Helps you become more aware of how you use your time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
