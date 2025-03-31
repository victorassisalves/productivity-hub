import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TASK_STATUSES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  todoTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  createTask: (task: InsertTask) => Promise<Task>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: number) => Promise<boolean>;
  getTaskById: (id: number) => Task | undefined;
  getTasksByProject: (projectId: number) => Task[];
  getTasksByPriority: (priority: string) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  // Fetch all tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === TASK_STATUSES.TODO);
  const inProgressTasks = tasks.filter(task => task.status === TASK_STATUSES.IN_PROGRESS);
  const completedTasks = tasks.filter(task => task.status === TASK_STATUSES.COMPLETED);
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", task);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created",
        description: "Your task was created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Your task was updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task was deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Helper functions
  const getTaskById = (id: number) => tasks.find(task => task.id === id);
  
  const getTasksByProject = (projectId: number) => 
    tasks.filter(task => task.projectId === projectId);
    
  const getTasksByPriority = (priority: string) => 
    tasks.filter(task => task.priority === priority);
  
  // Context value
  const value: TaskContextType = {
    tasks,
    isLoading,
    todoTasks,
    inProgressTasks,
    completedTasks,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: number, updates: Partial<Task>) => 
      updateTaskMutation.mutateAsync({ id, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
    getTaskById,
    getTasksByProject,
    getTasksByPriority,
  };
  
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
