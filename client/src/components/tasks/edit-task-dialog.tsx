import { useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTaskSchema, type Task, type Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
}

// Extend the task schema for form validation
const formSchema = insertTaskSchema.extend({
  projectId: z.number().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditTaskDialog({ open, onOpenChange, taskId }: EditTaskDialogProps) {
  const { toast } = useToast();
  
  // Get task data
  const { data: task, isLoading: isTaskLoading } = useQuery<Task>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: open && taskId > 0,
  });
  
  // Get projects for the project selection dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      projectId: null,
      dueDate: null,
      progress: 0,
      completed: false,
    },
  });
  
  // Update form values when the task data is loaded
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        progress: task.progress || 0,
        completed: task.completed || false,
      });
    }
  }, [task, form]);
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("PATCH", `/api/tasks/${taskId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      // Force invalidate the queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${data.projectId}/tasks`] });
      }
      
      // Show success toast
      toast({
        title: "Task updated",
        description: `${data.title} has been updated successfully`,
        variant: "default",
      });
      
      // Close dialog
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast({
        title: "Failed to update task",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: FormValues) {
    updateTaskMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task.
          </DialogDescription>
        </DialogHeader>
        
        {isTaskLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
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
                      <Textarea 
                        placeholder="Enter task description" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          if (value === "0") {
                            field.onChange(null);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                        defaultValue={field.value ? field.value.toString() : "0"}
                        value={field.value ? field.value.toString() : "0"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No Project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}