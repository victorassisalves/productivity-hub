import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TASK_STATUSES } from "@/lib/constants";

export function KanbanBoard() {
  const [addTaskStatus, setAddTaskStatus] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Fetch tasks and organize by status
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const todoTasks = tasks.filter(task => task.status === TASK_STATUSES.TODO);
  const inProgressTasks = tasks.filter(task => task.status === TASK_STATUSES.IN_PROGRESS);
  const completedTasks = tasks.filter(task => task.status === TASK_STATUSES.COMPLETED);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Return if dropped outside a droppable area or in the same position
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    // Get the new status based on the destination droppableId
    const taskId = Number(draggableId);
    updateTaskMutation.mutate({ id: taskId, status: destination.droppableId });
  };

  const handleAddTask = (status: string) => {
    setAddTaskStatus(status);
    setIsAddTaskOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Current Tasks</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 flex items-center mb-4">
              <span className="material-icons text-gray-400 mr-2">checklist</span>
              To Do
              <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{todoTasks.length}</span>
            </h3>

            <Droppable droppableId={TASK_STATUSES.TODO}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px]"
                >
                  {todoTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Button
              variant="outline"
              className="w-full mt-2 flex items-center justify-center"
              onClick={() => handleAddTask(TASK_STATUSES.TODO)}
            >
              <span className="material-icons text-gray-500 mr-2 text-sm">add</span>
              Add Task
            </Button>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 flex items-center mb-4">
              <span className="material-icons text-blue-500 mr-2">pending_actions</span>
              In Progress
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{inProgressTasks.length}</span>
            </h3>

            <Droppable droppableId={TASK_STATUSES.IN_PROGRESS}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px]"
                >
                  {inProgressTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Button
              variant="outline"
              className="w-full mt-2 flex items-center justify-center"
              onClick={() => handleAddTask(TASK_STATUSES.IN_PROGRESS)}
            >
              <span className="material-icons text-gray-500 mr-2 text-sm">add</span>
              Add Task
            </Button>
          </div>

          {/* Completed Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 flex items-center mb-4">
              <span className="material-icons text-green-500 mr-2">task_alt</span>
              Completed
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{completedTasks.length}</span>
            </h3>

            <Droppable droppableId={TASK_STATUSES.COMPLETED}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px]"
                >
                  {completedTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Button
              variant="outline"
              className="w-full mt-2 flex items-center justify-center"
              onClick={() => handleAddTask(TASK_STATUSES.COMPLETED)}
            >
              <span className="material-icons text-gray-500 mr-2 text-sm">add</span>
              Add Task
            </Button>
          </div>
        </div>
      </DragDropContext>

      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        defaultStatus={addTaskStatus || TASK_STATUSES.TODO} 
      />
    </div>
  );
}
