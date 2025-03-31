import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  project?: Project | null;
  onEdit?: () => void;
}

export function TaskCard({ task, project, onEdit }: TaskCardProps) {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Toggle task completion status mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, { 
        completed: !task.completed 
      });
      return response.json();
    },
    onMutate: () => {
      setIsCompleting(true);
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (task.projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${task.projectId}/tasks`] });
      }
      
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task marked as complete",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error toggling task completion:", error);
      toast({
        title: "Failed to update task",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCompleting(false);
    }
  });

  // Map status to a color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-500";
      case "in_progress": return "bg-blue-500";
      case "review": return "bg-amber-500";
      case "done": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  // Map priority to a color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-slate-400";
      case "medium": return "bg-blue-400";
      case "high": return "bg-amber-400";
      case "urgent": return "bg-red-500";
      default: return "bg-slate-400";
    }
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card className={`w-full ${task.completed ? 'bg-gray-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(task.status)}>
              {formatStatus(task.status)}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {formatPriority(task.priority)}
            </Badge>
          </div>
        </div>
        {project && (
          <Badge variant="outline" className="mt-1">
            {project.name}
          </Badge>
        )}
      </CardHeader>
      
      {task.description && (
        <CardContent className="pb-2">
          <p className={`text-sm text-gray-600 ${task.completed ? 'text-gray-400' : ''}`}>
            {task.description}
          </p>
        </CardContent>
      )}
      
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          {task.timeEstimate && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{task.timeEstimate} min</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleCompleteMutation.mutate()}
            disabled={isCompleting}
          >
            <CheckCircle2 className={`mr-1 h-4 w-4 ${task.completed ? 'text-green-500' : 'text-gray-400'}`} />
            {task.completed ? 'Completed' : 'Complete'}
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}