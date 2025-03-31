import { Task, Project } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TASK_PRIORITIES, PRIORITY_COLORS, TASK_STATUSES, STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No date';
    return format(new Date(date), 'MMM d');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-3 cursor-move transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <Badge className={PRIORITY_COLORS[task.priority || TASK_PRIORITIES.MEDIUM]}>
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </Badge>
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
                onClick={markAsCompleted}
              >
                Mark as completed
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this task?")) {
                    deleteTaskMutation.mutate();
                  }
                  setIsMenuOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <h4 className="font-medium text-gray-900 mt-2">{task.title}</h4>
      {task.description && (
        <p className="text-gray-500 text-sm mt-1">{task.description}</p>
      )}
      
      {task.status === TASK_STATUSES.IN_PROGRESS && task.progress !== undefined && task.progress > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 mt-1 inline-block">{task.progress}% complete</span>
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <span className="material-icons text-sm mr-1">calendar_today</span>
          {task.dueDate ? formatDate(task.dueDate) : 'No date'}
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
  );
}
