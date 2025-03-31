import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { GtdWorkflow } from "@/components/frameworks/gtd-workflow";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function GtdPage() {
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
                <h1 className="text-2xl font-bold text-gray-900">GTD Workflow</h1>
                <p className="text-gray-500 mt-1">
                  Get Things Done by capturing, clarifying, organizing, and reviewing tasks
                </p>
              </div>
            </div>
          </div>

          {/* GTD Workflow Component */}
          <GtdWorkflow />

          {/* GTD Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>GTD Method Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  Getting Things Done (GTD) is a personal productivity system created by David Allen. 
                  It's designed to help you organize and prioritize tasks in a way that reduces mental clutter 
                  and allows you to focus on the right work at the right time.
                </p>
                
                <h3>The Five Steps of GTD:</h3>
                
                <ol>
                  <li>
                    <strong>Capture</strong> - Collect everything that has your attention (tasks, ideas, commitments) in a trusted system outside your mind.
                    <p className="text-sm text-gray-600">Use quick capture tools, notes, or voice memos to get everything out of your head.</p>
                  </li>
                  <li>
                    <strong>Clarify</strong> - Process what you've captured by asking:
                    <ul>
                      <li>What is it?</li>
                      <li>Is it actionable?</li>
                      <li>If yes, what's the next action?</li>
                      <li>If no, trash it, archive it, or add it to a "someday/maybe" list.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Organize</strong> - Put items where they belong:
                    <ul>
                      <li>Next actions (sorted by context)</li>
                      <li>Projects (outcomes requiring multiple steps)</li>
                      <li>Waiting for (delegated items)</li>
                      <li>Calendar (time-specific commitments)</li>
                      <li>Reference material (non-actionable but useful information)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Reflect</strong> - Regularly review your lists to keep them current:
                    <ul>
                      <li>Daily review of calendar and next actions</li>
                      <li>Weekly review of all lists, goals, and projects</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Engage</strong> - Make choices about your actions based on:
                    <ul>
                      <li>Context (where you are and what tools you have)</li>
                      <li>Time available</li>
                      <li>Energy level</li>
                      <li>Priority</li>
                    </ul>
                  </li>
                </ol>
                
                <h3>Benefits of GTD:</h3>
                
                <ul>
                  <li>Reduces mental overhead and stress</li>
                  <li>Provides clarity on what to work on when</li>
                  <li>Helps manage complex projects and multiple responsibilities</li>
                  <li>Creates a trusted system that frees your mind for creativity and focus</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
