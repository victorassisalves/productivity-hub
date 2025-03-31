import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { AppLayout } from "@/components/layout/app-layout";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilter } from "@/components/tasks/task-filter";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";

export default function AllTasksPage() {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  
  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Update filtered tasks when all tasks are loaded
  useEffect(() => {
    if (tasks.length > 0) {
      setFilteredTasks(tasks);
    }
  }, [tasks]);
  
  // Handle task edit
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
  };
  
  return (
    <AppLayout title="All Tasks" description="View and manage all your tasks across projects">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <span className="material-icons mr-2 text-sm">add</span>
          Add Task
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center text-gray-600">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="py-10 text-center bg-gray-50 rounded-lg">
          <span className="material-icons text-gray-400 text-5xl mb-2">assignment</span>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No tasks yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first task</p>
          <Button onClick={() => setIsAddTaskOpen(true)}>
            <span className="material-icons mr-2 text-sm">add</span>
            Create Task
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <TaskFilter tasks={tasks} onChange={setFilteredTasks} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div key={task.id} onClick={() => handleEditTask(task)} className="cursor-pointer">
                <TaskCard task={task} />
              </div>
            ))}
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="py-10 text-center bg-gray-50 rounded-lg">
              <span className="material-icons text-gray-400 text-5xl mb-2">filter_alt</span>
              <h3 className="text-lg font-medium text-gray-800">No matching tasks</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}
      
      {/* Task Dialogs */}
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
      />
      
      {selectedTask && (
        <EditTaskDialog
          open={isEditTaskOpen}
          onOpenChange={setIsEditTaskOpen}
          task={selectedTask}
        />
      )}
    </AppLayout>
  );
}