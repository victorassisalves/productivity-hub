import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@shared/schema";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: string;
}

// Extend the task schema for form validation
const formSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
  // Add coercion for projectId to handle string -> number conversion
  projectId: z.string().transform(val => val ? Number(val) : undefined).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTaskDialog({ open, onOpenChange, defaultStatus = TASK_STATUSES.TODO }: AddTaskDialogProps) {
  // Fetch projects for project selection
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // For navigation
  const [, navigate] = useLocation();

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: undefined,
      status: defaultStatus,
      priority: TASK_PRIORITIES.MEDIUM,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      progress: 0,
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert dueDate from string to Date if it exists
      const formattedData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        // The projectId is already converted to a number by the schema
      };
      const response = await apiRequest("POST", "/api/tasks", formattedData);
      return response.json();
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Navigate to all tasks page
      navigate("/tasks");
    },
  });

  function onSubmit(data: FormValues) {
    createTaskMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-gray-900">Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track your work.
          </DialogDescription>
        </DialogHeader>
        
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
                    <Textarea placeholder="Enter task description" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
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
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value={TASK_PRIORITIES.LOW}>Low</option>
                        <option value={TASK_PRIORITIES.MEDIUM}>Medium</option>
                        <option value={TASK_PRIORITIES.HIGH}>High</option>
                        <option value={TASK_PRIORITIES.URGENT}>Urgent</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value={TASK_STATUSES.TODO}>To Do</option>
                        <option value={TASK_STATUSES.IN_PROGRESS}>In Progress</option>
                        <option value={TASK_STATUSES.COMPLETED}>Completed</option>
                      </select>
                    </FormControl>
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
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
