import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { Input } from "@/components/ui/input";

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
            <span className="material-icons">menu</span>
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-gray-800">TaskFlow</h1>
        </div>
        
        <div className="hidden md:block">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <Input 
              type="text" 
              className="w-96 pl-10 pr-4 py-2" 
              placeholder="Search tasks, projects, or notes..." 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 rounded-full">
            <span className="material-icons">help_outline</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary-600 rounded-full">
            <span className="material-icons">notifications</span>
          </Button>
          <div className="relative">
            <Button variant="ghost" className="flex items-center">
              <img 
                className="h-8 w-8 rounded-full" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="User avatar" 
              />
              <span className="hidden md:block ml-2 text-sm font-medium text-gray-700">John Doe</span>
              <span className="hidden md:block material-icons text-gray-400 text-sm ml-1">arrow_drop_down</span>
            </Button>
          </div>
        </div>
      </div>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </header>
  );
}
