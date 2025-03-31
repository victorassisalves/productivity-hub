import { Task, Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TASK_PRIORITIES, PRIORITY_COLORS, TASK_STATUSES, STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EditTaskDialog } from "./edit-task-dialog";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch project info if task has a project
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !!task.projectId,
  });

  const project = task.projectId ? projects.find(p => p.id === task.projectId) : undefined;

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Update task progress mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const response = await apiRequest("PUT", `/api/tasks/${task.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Mark task as completed
  const markAsCompleted = () => {
    updateTaskMutation.mutate({ 
      status: TASK_STATUSES.COMPLETED,
      completed: true,
      progress: 100 
    });
    setIsMenuOpen(false);
  };

  // Mark task as in progress
  const markAsInProgress = () => {
    updateTaskMutation.mutate({ 
      status: TASK_STATUSES.IN_PROGRESS,
      completed: false 
    });
    setIsMenuOpen(false);
  };

  // Toggle complete status
  const toggleCompleted = () => {
    if (task.status === TASK_STATUSES.COMPLETED) {
      updateTaskMutation.mutate({ 
        status: TASK_STATUSES.TODO,
        completed: false,
        progress: 0 
      });
    } else {
      markAsCompleted();
    }
  };

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No date';
    return format(new Date(date), 'MMM d');
  };

  return (
    <>
      <div 
        className={cn(
          "bg-white p-4 rounded-lg shadow-sm mb-3 transition-all duration-200 hover:shadow-md",
          task.status === TASK_STATUSES.COMPLETED ? "opacity-70" : "",
          "hover:opacity-100 hover:-translate-y-1"
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100"
              onClick={toggleCompleted}
            >
              {task.status === TASK_STATUSES.COMPLETED && (
                <span className="material-icons text-xs text-primary-600">check</span>
              )}
            </div>
            <Badge className={PRIORITY_COLORS[task.priority || TASK_PRIORITIES.MEDIUM]}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
            </Badge>
            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-icons text-sm">more_vert</span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setIsEditDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="material-icons text-xs mr-2 align-middle">edit</span>
                  Edit task
                </button>
                {task.status !== TASK_STATUSES.COMPLETED && (
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={markAsCompleted}
                  >
                    <span className="material-icons text-xs mr-2 align-middle">check_circle</span>
                    Mark as completed
                  </button>
                )}
                {task.status !== TASK_STATUSES.IN_PROGRESS && task.status !== TASK_STATUSES.COMPLETED && (
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={markAsInProgress}
                  >
                    <span className="material-icons text-xs mr-2 align-middle">pending</span>
                    Mark as in progress
                  </button>
                )}
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this task?")) {
                      deleteTaskMutation.mutate();
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="material-icons text-xs mr-2 align-middle">delete</span>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <h4 className={cn(
          "font-medium text-gray-900 mt-2",
          task.status === TASK_STATUSES.COMPLETED ? "line-through text-gray-500" : ""
        )}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-gray-500 text-sm mt-1">{task.description}</p>
        )}
        
        {task.status === TASK_STATUSES.IN_PROGRESS && task.progress !== undefined && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1 inline-block">{task.progress}% complete</span>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-icons text-sm mr-1">calendar_today</span>
              {task.dueDate ? formatDate(task.dueDate) : 'No date'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-icons text-sm mr-1">label</span>
              {task.status === TASK_STATUSES.COMPLETED ? 'Completed' : task.status.replace('_', ' ')}
            </div>
          </div>
          
          {project && (
            <div 
              className="px-2 py-1 rounded-md text-xs" 
              style={{ 
                backgroundColor: project.color ? `${project.color}20` : '#E5E7EB',
                color: project.color || '#4B5563' 
              }}
            >
              {project.name}
            </div>
          )}
        </div>
      </div>
      
      {isEditDialogOpen && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={task}
        />
      )}
    </>
  );
}
