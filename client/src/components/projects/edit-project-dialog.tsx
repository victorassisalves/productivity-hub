import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

// Extend the project schema for form validation
const formSchema = insertProjectSchema;

type FormValues = z.infer<typeof formSchema>;

export function EditProjectDialog({ open, onOpenChange, projectId }: EditProjectDialogProps) {
  const { toast } = useToast();
  
  // Fetch the project to edit
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: open && projectId > 0,
  });
  
  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1", // Default color
    },
  });
  
  // Update form values when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        color: project.color || "#6366f1",
      });
    }
  }, [project, form]);
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PUT", `/api/projects/${projectId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      // Force invalidate the projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      
      // Show success toast
      toast({
        title: "Project updated",
        description: `${data.name} has been updated successfully`,
        variant: "default",
      });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      toast({
        title: "Failed to update project",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: FormValues) {
    updateProjectMutation.mutate(data);
  }

  // Color options
  const colorOptions = [
    { label: "Indigo", value: "#6366f1" },
    { label: "Rose", value: "#f43f5e" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Green", value: "#22c55e" },
    { label: "Yellow", value: "#eab308" },
    { label: "Orange", value: "#f97316" },
    { label: "Purple", value: "#a855f7" },
    { label: "Teal", value: "#14b8a6" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">Edit Project</DialogTitle>
          <DialogDescription>
            Update your project information.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingProject ? (
          <div className="p-4 flex items-center justify-center">
            <div className="animate-spin text-primary">⟳</div>
            <span className="ml-2">Loading project...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter project description" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`
                            w-10 h-10 rounded-full cursor-pointer border-2
                            ${field.value === color.value ? "border-gray-900" : "border-transparent"}
                          `}
                          style={{ backgroundColor: color.value }}
                          onClick={() => form.setValue("color", color.value)}
                          title={color.label}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}