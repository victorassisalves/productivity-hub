import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Goal, InsertGoal } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Form schema for SMART goals
const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  specific: z.string().min(1, "Please provide specific details"),
  measurable: z.string().min(1, "Please provide measurable criteria"),
  achievable: z.string().min(1, "Please describe why this is achievable"),
  relevant: z.string().min(1, "Please explain why this is relevant"),
  timeBound: z.string().min(1, "Please set a time constraint"),
  dueDate: z.string().min(1, "Due date is required"),
  progress: z.number().min(0).max(100).default(0),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export function SmartGoalsFramework() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goal: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", goal);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsDialogOpen(false);
      toast({
        title: "Goal created",
        description: "Your SMART goal was created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Goal> }) => {
      const response = await apiRequest("PUT", `/api/goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsDialogOpen(false);
      toast({
        title: "Goal updated",
        description: "Your SMART goal was updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsDialogOpen(false);
      toast({
        title: "Goal deleted",
        description: "Your goal was deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing goals
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      progress: 0,
    },
  });

  // Handle add goal
  const handleAddGoal = () => {
    setSelectedGoal(null);
    form.reset({
      title: "",
      description: "",
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      progress: 0,
    });
    setIsDialogOpen(true);
  };

  // Handle edit goal
  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    form.reset({
      title: goal.title,
      description: goal.description || "",
      specific: goal.specific || "",
      measurable: goal.measurable || "",
      achievable: goal.achievable || "",
      relevant: goal.relevant || "",
      timeBound: goal.timeBound || "",
      dueDate: goal.dueDate ? format(new Date(goal.dueDate), "yyyy-MM-dd") : "",
      progress: goal.progress || 0,
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: GoalFormValues) => {
    const formattedData = {
      ...data,
      dueDate: new Date(data.dueDate),
    };

    if (selectedGoal) {
      // Update existing goal
      updateGoalMutation.mutate({
        id: selectedGoal.id,
        updates: formattedData,
      });
    } else {
      // Create new goal
      createGoalMutation.mutate(formattedData);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedGoal) {
      deleteGoalMutation.mutate(selectedGoal.id);
    }
  };

  // Handle progress update
  const handleProgressUpdate = (id: number, progress: number) => {
    updateGoalMutation.mutate({
      id,
      updates: { progress },
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>SMART Goals</CardTitle>
            <Button onClick={handleAddGoal}>
              <span className="material-icons mr-2">add</span>
              New Goal
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create Specific, Measurable, Achievable, Relevant, and Time-bound goals
          </p>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-gray-300 mb-2">track_changes</span>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No goals yet</h3>
              <p className="text-gray-500 mb-4">Create your first SMART goal to get started</p>
              <Button onClick={handleAddGoal}>Create a Goal</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                        <span className="material-icons">edit</span>
                      </Button>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Progress</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{goal.progress}% complete</span>
                          <span className="text-xs text-gray-500">
                            Due: {goal.dueDate ? format(new Date(goal.dueDate), "MMM d, yyyy") : "No date"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700">Specific</div>
                          <p className="text-sm text-gray-500">{goal.specific}</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Measurable</div>
                          <p className="text-sm text-gray-500">{goal.measurable}</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Achievable</div>
                          <p className="text-sm text-gray-500">{goal.achievable}</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Relevant</div>
                          <p className="text-sm text-gray-500">{goal.relevant}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-700">Time-bound</div>
                        <p className="text-sm text-gray-500">{goal.timeBound}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full">
                      <label htmlFor={`progress-${goal.id}`} className="text-sm text-gray-500 block mb-1">
                        Update Progress
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id={`progress-${goal.id}`}
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleProgressUpdate(goal.id, parseInt(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                        />
                        <span className="text-sm text-gray-700">{goal.progress}%</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGoal ? "Edit SMART Goal" : "Create SMART Goal"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a clear title for your goal" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief overview of this goal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specific"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What exactly will you accomplish?" {...field} />
                      </FormControl>
                      <FormDescription>
                        Be clear and detailed about what needs to be done
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="measurable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Measurable</FormLabel>
                      <FormControl>
                        <Textarea placeholder="How will you measure success?" {...field} />
                      </FormControl>
                      <FormDescription>
                        Define concrete criteria for measuring progress
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="achievable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Achievable</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Is this realistic with available resources?" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ensure the goal is realistic and attainable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relevant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Why is this goal important now?" {...field} />
                      </FormControl>
                      <FormDescription>
                        Explain how this goal aligns with broader objectives
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="timeBound"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time-bound</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What's your timeframe for accomplishment?" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set a deadline or timeframe for completion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Progress ({field.value}%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="5" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="flex justify-between">
                {selectedGoal && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleteGoalMutation.isPending}
                  >
                    {deleteGoalMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                )}
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                  >
                    {selectedGoal ? (
                      updateGoalMutation.isPending ? "Saving..." : "Save"
                    ) : (
                      createGoalMutation.isPending ? "Creating..." : "Create"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
