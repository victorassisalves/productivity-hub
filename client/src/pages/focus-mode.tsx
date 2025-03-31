import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { FocusMode as FocusModeComponent } from "@/components/frameworks/focus-mode";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function FocusModePage() {
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
                <h1 className="text-2xl font-bold text-gray-900">Focus Mode</h1>
                <p className="text-gray-500 mt-1">
                  Eliminate distractions and focus deeply on your most important tasks
                </p>
              </div>
            </div>
          </div>

          {/* Focus Mode Component */}
          <FocusModeComponent />

          {/* Focus Mode Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Deep Focus Techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  Deep focus is a state of intense concentration where you're fully immersed in a task. 
                  It allows you to produce high-quality work more efficiently and tackle complex problems.
                </p>
                
                <h3>Tips for Achieving Deep Focus:</h3>
                
                <ol>
                  <li>
                    <strong>Eliminate distractions</strong> - Turn off notifications, close unnecessary browser tabs, and put your phone away.
                  </li>
                  <li>
                    <strong>Define your focus period</strong> - Set a specific timeframe (25-90 minutes) for uninterrupted focus.
                  </li>
                  <li>
                    <strong>Prepare your environment</strong> - Create a clean, comfortable workspace that signals "it's time to work."
                  </li>
                  <li>
                    <strong>Use environmental cues</strong> - Some people work better with background noise or music, while others need silence.
                  </li>
                  <li>
                    <strong>Take deliberate breaks</strong> - Refresh your mind with short breaks between focus sessions.
                  </li>
                </ol>
                
                <h3>Common Focus Barriers and Solutions:</h3>
                
                <ul>
                  <li>
                    <strong>Digital distractions</strong> - Use website blockers, turn on "do not disturb" mode, or try apps like Freedom or Focus@Will.
                  </li>
                  <li>
                    <strong>Mental fatigue</strong> - Schedule focus sessions during your peak energy times and take proper breaks.
                  </li>
                  <li>
                    <strong>Unclear goals</strong> - Before starting, clearly define what you want to accomplish in the session.
                  </li>
                  <li>
                    <strong>Environmental disruptions</strong> - Use noise-canceling headphones or find a quiet space.
                  </li>
                </ul>
                
                <p>
                  Remember that achieving deep focus gets easier with practice. Start with shorter sessions and gradually 
                  build up your focus muscle. Monitor your productivity patterns to discover your optimal focus schedule.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
