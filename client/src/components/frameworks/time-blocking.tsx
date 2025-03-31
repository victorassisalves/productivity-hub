import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, add, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task, TimeBlock, InsertTimeBlock } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Setup calendar localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Form schema for time blocks
const timeBlockSchema = z.object({
  title: z.string().min(1, "Title is required"),
  taskId: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  color: z.string().optional(),
});

export function TimeBlockingCalendar() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock | null>(null);

  // Fetch tasks and time blocks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: timeBlocks = [], isLoading } = useQuery<TimeBlock[]>({
    queryKey: ["/api/timeblocks"],
  });

  // Create time block mutation
  const createTimeBlockMutation = useMutation({
    mutationFn: async (timeBlock: InsertTimeBlock) => {
      const response = await apiRequest("POST", "/api/timeblocks", timeBlock);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      setIsDialogOpen(false);
      toast({
        title: "Time block created",
        description: "Your time block was created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update time block mutation
  const updateTimeBlockMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TimeBlock> }) => {
      const response = await apiRequest("PUT", `/api/timeblocks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      setIsDialogOpen(false);
      toast({
        title: "Time block updated",
        description: "Your time block was updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete time block mutation
  const deleteTimeBlockMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/timeblocks/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
      setIsDialogOpen(false);
      toast({
        title: "Time block deleted",
        description: "Your time block was deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete time block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing time blocks
  const form = useForm<z.infer<typeof timeBlockSchema>>({
    resolver: zodResolver(timeBlockSchema),
    defaultValues: {
      title: "",
      taskId: "",
      startTime: "",
      endTime: "",
      color: "#3182ce",
    },
  });

  // Format time blocks for calendar
  const calendarEvents = timeBlocks.map((block) => ({
    id: block.id,
    title: block.title,
    start: new Date(block.startTime),
    end: new Date(block.endTime),
    color: block.color || "#3182ce",
  }));

  // Handle calendar slot selection
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    
    // Calculate end time (1 hour after start)
    const endTime = add(start, { hours: 1 });
    
    form.reset({
      title: "",
      taskId: "",
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      color: "#3182ce",
    });
    
    setSelectedTimeBlock(null);
    setIsDialogOpen(true);
  };

  // Handle event selection (edit)
  const handleSelectEvent = (event: any) => {
    const block = timeBlocks.find(b => b.id === event.id);
    if (block) {
      setSelectedTimeBlock(block);
      form.reset({
        title: block.title,
        taskId: block.taskId?.toString() || "",
        startTime: format(new Date(block.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(block.endTime), "yyyy-MM-dd'T'HH:mm"),
        color: block.color || "#3182ce",
      });
      setIsDialogOpen(true);
    }
  };

  // Handle form submission
  const onSubmit = (data: z.infer<typeof timeBlockSchema>) => {
    const formattedData = {
      ...data,
      taskId: data.taskId ? parseInt(data.taskId, 10) : undefined,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };

    if (selectedTimeBlock) {
      // Update existing time block
      updateTimeBlockMutation.mutate({
        id: selectedTimeBlock.id,
        updates: formattedData,
      });
    } else {
      // Create new time block
      createTimeBlockMutation.mutate(formattedData);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedTimeBlock) {
      deleteTimeBlockMutation.mutate(selectedTimeBlock.id);
    }
  };

  // Custom event component
  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        color: '#fff',
        border: '0',
        display: 'block'
      }
    };
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading time blocks...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Blocking Calendar</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Schedule specific time blocks for different tasks to ensure dedicated focus
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              defaultView="week"
              views={["day", "week"]}
              step={30}
              timeslots={2}
              min={startOfDay(new Date())}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Time Block Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTimeBlock ? "Edit Time Block" : "Create Time Block"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting, Deep Work, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Task (Optional)</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        {...field}
                      >
                        <option value="">None</option>
                        {tasks.map(task => (
                          <option key={task.id} value={task.id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input type="color" {...field} className="w-12 h-10" />
                        <span className="text-sm text-gray-500">
                          Choose a color for this time block
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between">
                {selectedTimeBlock && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={deleteTimeBlockMutation.isPending}
                  >
                    {deleteTimeBlockMutation.isPending ? "Deleting..." : "Delete"}
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
                    disabled={createTimeBlockMutation.isPending || updateTimeBlockMutation.isPending}
                  >
                    {selectedTimeBlock ? (
                      updateTimeBlockMutation.isPending ? "Saving..." : "Save"
                    ) : (
                      createTimeBlockMutation.isPending ? "Creating..." : "Create"
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
