import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { TimeBlockingCalendar } from "@/components/frameworks/time-blocking";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function TimeBlockingPage() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
                <h1 className="text-2xl font-bold text-gray-900">Time Blocking</h1>
                <p className="text-gray-500 mt-1">
                  Schedule specific time blocks for different tasks to ensure dedicated focus
                </p>
              </div>
            </div>
          </div>

          {/* Time Blocking Calendar */}
          <TimeBlockingCalendar />

          {/* Time Blocking Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Time Blocking Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  Time blocking is a productivity technique where you divide your day into blocks of time, 
                  each dedicated to accomplishing a specific task or group of tasks. 
                  Instead of keeping an open-ended to-do list, you schedule tasks into your calendar.
                </p>
                
                <h3>Best Practices for Time Blocking:</h3>
                
                <ol>
                  <li>
                    <strong>Plan ahead</strong> - Set aside time at the end of each day or week to plan your blocks for the next day or week.
                  </li>
                  <li>
                    <strong>Be realistic</strong> - Don't schedule every minute. Leave buffer time between blocks and allow for unexpected tasks.
                  </li>
                  <li>
                    <strong>Batch similar tasks</strong> - Group similar activities together to minimize context switching.
                  </li>
                  <li>
                    <strong>Include breaks</strong> - Schedule short breaks between focused work sessions.
                  </li>
                  <li>
                    <strong>Be flexible</strong> - If something urgent comes up, adjust your blocks accordingly.
                  </li>
                </ol>
                
                <h3>Time Blocking Methods:</h3>
                
                <ul>
                  <li>
                    <strong>Task Batching</strong> - Group similar tasks together (e.g., answering emails, making phone calls).
                  </li>
                  <li>
                    <strong>Day Theming</strong> - Dedicate entire days to specific areas of work (e.g., "Marketing Monday").
                  </li>
                  <li>
                    <strong>Time Boxing</strong> - Allocate a fixed time period to a task and stick to it.
                  </li>
                  <li>
                    <strong>Pomodoro Technique</strong> - Work in focused 25-minute blocks followed by 5-minute breaks.
                  </li>
                </ul>
                
                <p>
                  To get started, identify your most important tasks for the day, estimate how long each will take, 
                  and schedule them into your calendar. Remember to be realistic and include buffer time!
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
