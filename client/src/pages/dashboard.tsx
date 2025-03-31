import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { ProductivityMetrics } from "@/components/dashboard/productivity-metrics";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { FrameworkSelector } from "@/components/dashboard/framework-selector";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";

export default function Dashboard() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list" | "calendar">("board");

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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">View:</span>
                  <div className="flex border rounded-md p-1 bg-white">
                    <Button 
                      variant={viewMode === "board" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setViewMode("board")}
                      className={viewMode === "board" ? "bg-primary-100 text-primary-800 font-medium" : "text-gray-500 hover:bg-gray-100"}
                    >
                      Board
                    </Button>
                    <Button 
                      variant={viewMode === "list" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-primary-100 text-primary-800 font-medium" : "text-gray-500 hover:bg-gray-100"}
                    >
                      List
                    </Button>
                    <Button 
                      variant={viewMode === "calendar" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setViewMode("calendar")}
                      className={viewMode === "calendar" ? "bg-primary-100 text-primary-800 font-medium" : "text-gray-500 hover:bg-gray-100"}
                    >
                      Calendar
                    </Button>
                  </div>
                </div>
                <Button 
                  className="hidden sm:inline-flex items-center"
                  onClick={() => setIsAddTaskOpen(true)}
                >
                  <span className="material-icons mr-2 text-sm">add</span>
                  Add Task
                </Button>
              </div>
            </div>
          </div>

          {/* Productivity Metrics */}
          <ProductivityMetrics />

          {/* Pomodoro Timer */}
          {/* We'll use a simplified timer on the dashboard page */}

          {/* Tasks with Kanban Board */}
          <KanbanBoard />

          {/* Framework Selector */}
          <FrameworkSelector />
        </main>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </div>
  );
}
