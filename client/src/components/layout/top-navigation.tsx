import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/user-dropdown";
import { Logo, LogoWithText } from "@/components/ui/logo";
import { Menu, Bell, HelpCircle } from "lucide-react";

interface TopNavigationProps {
  onOpenMobileSidebar: () => void;
}

export function TopNavigation({ onOpenMobileSidebar }: TopNavigationProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenMobileSidebar}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-3">
            <LogoWithText size="small" />
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <LogoWithText size="medium" />
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input 
              type="text" 
              className="w-96 pl-10 pr-4 py-2" 
              placeholder="Search tasks, projects, or notes..." 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 rounded-full">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="relative">
            {/* User dropdown replaces the static profile */}
            <UserDropdown />
          </div>
        </div>
      </div>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </header>
  );
}
