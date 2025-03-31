import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { SmartGoalsFramework } from "@/components/frameworks/smart-goals";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function SmartGoalsPage() {
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
                <h1 className="text-2xl font-bold text-gray-900">SMART Goals</h1>
                <p className="text-gray-500 mt-1">
                  Set Specific, Measurable, Achievable, Relevant, and Time-bound goals
                </p>
              </div>
            </div>
          </div>

          {/* Smart Goals Framework Component */}
          <SmartGoalsFramework />

          {/* SMART Goals Guide */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>SMART Goals Framework Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  SMART is an acronym that stands for Specific, Measurable, Achievable, Relevant, and Time-bound. 
                  Using the SMART framework helps create clear, attainable goals with a defined path to achievement.
                </p>
                
                <h3>Breaking Down SMART:</h3>
                
                <ul>
                  <li>
                    <strong>Specific</strong> - Your goal should be clear and specific, answering questions like what, why, who, where, and which.
                    <p className="text-sm text-gray-600">Example: Instead of "Get in shape," try "Run a 5k in under 30 minutes."</p>
                  </li>
                  <li>
                    <strong>Measurable</strong> - Include metrics to track your progress and know when you've reached your goal.
                    <p className="text-sm text-gray-600">Example: "Increase website traffic by 25% in the next quarter."</p>
                  </li>
                  <li>
                    <strong>Achievable</strong> - Your goal should be challenging but realistic given your resources and constraints.
                    <p className="text-sm text-gray-600">Example: "Improve customer satisfaction ratings from 80% to 90%" rather than "Achieve 100% customer satisfaction."</p>
                  </li>
                  <li>
                    <strong>Relevant</strong> - The goal should align with your broader objectives and be worthwhile.
                    <p className="text-sm text-gray-600">Example: A goal to improve your presentation skills is relevant if your career involves public speaking.</p>
                  </li>
                  <li>
                    <strong>Time-bound</strong> - Set a deadline to create urgency and prevent day-to-day tasks from taking priority.
                    <p className="text-sm text-gray-600">Example: "Complete the certification by December 31st" instead of just "Get certified."</p>
                  </li>
                </ul>
                
                <h3>Benefits of SMART Goals:</h3>
                
                <ul>
                  <li>Provides direction and clarity</li>
                  <li>Makes progress measurable and visible</li>
                  <li>Helps prioritize and focus your efforts</li>
                  <li>Increases accountability</li>
                  <li>Improves motivation through visible progress</li>
                </ul>
                
                <p>
                  When setting your SMART goals, be sure to write them down and revisit them regularly. 
                  Break larger goals into smaller milestones, and track your progress systematically.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
