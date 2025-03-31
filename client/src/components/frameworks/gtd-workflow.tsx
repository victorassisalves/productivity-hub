import { useState } from "react";
import { useTaskContext } from "@/context/task-context";
import { useProjectContext } from "@/context/project-context";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TaskCard } from "@/components/tasks/task-card";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/lib/constants";

// Form schema for quick capture
const captureSchema = z.object({
  input: z.string().min(1, "Input is required"),
});

type CaptureFormValues = z.infer<typeof captureSchema>;

export function GtdWorkflow() {
  const { tasks, createTask, updateTask } = useTaskContext();
  const { projects } = useProjectContext();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  
  // Form for quick capture
  const form = useForm<CaptureFormValues>({
    resolver: zodResolver(captureSchema),
    defaultValues: {
      input: "",
    },
  });
  
  // Filter tasks for different GTD stages
  const inboxTasks = tasks.filter(task => 
    !task.projectId && task.status === TASK_STATUSES.TODO);
  
  const nextActionTasks = tasks.filter(task => 
    task.projectId && task.status === TASK_STATUSES.TODO && 
    (task.priority === TASK_PRIORITIES.HIGH || task.priority === TASK_PRIORITIES.URGENT));
  
  const waitingForTasks = tasks.filter(task => 
    task.status === TASK_STATUSES.TODO && 
    task.priority === TASK_PRIORITIES.LOW);
  
  const projectsTasks = tasks.filter(task => 
    task.projectId && task.status === TASK_STATUSES.TODO && 
    task.priority === TASK_PRIORITIES.MEDIUM);
  
  const completedTasks = tasks.filter(task => 
    task.status === TASK_STATUSES.COMPLETED);

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Return if dropped outside a droppable area or in the same position
    if (!destination) {
      return;
    }
    
    // Don't do anything if dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    const taskId = Number(draggableId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Handle based on destination
    switch (destination.droppableId) {
      case 'inbox':
        updateTask(taskId, { 
          projectId: null, 
          status: TASK_STATUSES.TODO,
          priority: TASK_PRIORITIES.MEDIUM
        });
        break;
      case 'next-actions':
        updateTask(taskId, { 
          status: TASK_STATUSES.TODO,
          priority: TASK_PRIORITIES.HIGH
        });
        break;
      case 'waiting-for':
        updateTask(taskId, { 
          status: TASK_STATUSES.TODO,
          priority: TASK_PRIORITIES.LOW
        });
        break;
      case 'projects':
        // If it doesn't have a project, assign to first project
        if (!task.projectId && projects.length > 0) {
          updateTask(taskId, { 
            projectId: projects[0].id,
            status: TASK_STATUSES.TODO,
            priority: TASK_PRIORITIES.MEDIUM
          });
        } else {
          updateTask(taskId, { 
            status: TASK_STATUSES.TODO,
            priority: TASK_PRIORITIES.MEDIUM
          });
        }
        break;
      case 'completed':
        updateTask(taskId, { 
          status: TASK_STATUSES.COMPLETED,
          completed: true
        });
        break;
    }
  };

  // Handle quick capture submission
  const onCaptureSubmit = (data: CaptureFormValues) => {
    createTask({
      title: data.input,
      description: "",
      status: TASK_STATUSES.TODO,
      priority: TASK_PRIORITIES.MEDIUM,
    });
    
    form.reset();
    setIsCaptureOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>GTD Workflow</CardTitle>
            <Button onClick={() => setIsCaptureOpen(true)}>
              <span className="material-icons mr-2">add</span>
              Quick Capture
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Get Things Done by capturing, clarifying, organizing, and reviewing your tasks
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Inbox Column */}
              <div>
                <h3 className="font-medium text-gray-800 flex items-center mb-3">
                  <span className="material-icons text-gray-500 mr-2">inbox</span>
                  Inbox (Capture)
                  <Badge variant="outline" className="ml-2">{inboxTasks.length}</Badge>
                </h3>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <Droppable droppableId="inbox">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-[400px]"
                        >
                          {inboxTasks.map((task, index) => (
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
                          {inboxTasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <span className="material-icons text-2xl mb-2">inbox</span>
                              <p>Your inbox is empty</p>
                              <Button 
                                variant="ghost" 
                                onClick={() => setIsCaptureOpen(true)}
                                className="mt-2"
                              >
                                Capture something
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Collect everything that has your attention</p>
                </div>
              </div>

              {/* Next Actions Column */}
              <div>
                <h3 className="font-medium text-gray-800 flex items-center mb-3">
                  <span className="material-icons text-blue-500 mr-2">play_arrow</span>
                  Next Actions (Do)
                  <Badge variant="outline" className="ml-2">{nextActionTasks.length}</Badge>
                </h3>
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <Droppable droppableId="next-actions">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-[400px]"
                        >
                          {nextActionTasks.map((task, index) => (
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
                          {nextActionTasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <span className="material-icons text-2xl mb-2">play_arrow</span>
                              <p>Drag tasks here that need immediate action</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Immediate actions that can be completed</p>
                </div>
              </div>

              {/* Waiting For Column */}
              <div>
                <h3 className="font-medium text-gray-800 flex items-center mb-3">
                  <span className="material-icons text-yellow-500 mr-2">hourglass_empty</span>
                  Waiting For (Delegate)
                  <Badge variant="outline" className="ml-2">{waitingForTasks.length}</Badge>
                </h3>
                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <Droppable droppableId="waiting-for">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-[400px]"
                        >
                          {waitingForTasks.map((task, index) => (
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
                          {waitingForTasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <span className="material-icons text-2xl mb-2">hourglass_empty</span>
                              <p>Drag tasks here that you're waiting on others for</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Tasks delegated to others or awaiting external input</p>
                </div>
              </div>

              {/* Projects Column */}
              <div>
                <h3 className="font-medium text-gray-800 flex items-center mb-3">
                  <span className="material-icons text-purple-500 mr-2">folder</span>
                  Projects (Organize)
                  <Badge variant="outline" className="ml-2">{projectsTasks.length}</Badge>
                </h3>
                <Card className="bg-purple-50">
                  <CardContent className="p-4">
                    <Droppable droppableId="projects">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-[400px]"
                        >
                          {projectsTasks.map((task, index) => (
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
                          {projectsTasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <span className="material-icons text-2xl mb-2">folder</span>
                              <p>Drag tasks here that belong to larger projects</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Tasks that are part of larger, multi-step projects</p>
                </div>
              </div>

              {/* Completed Column */}
              <div>
                <h3 className="font-medium text-gray-800 flex items-center mb-3">
                  <span className="material-icons text-green-500 mr-2">check_circle</span>
                  Completed (Done)
                  <Badge variant="outline" className="ml-2">{completedTasks.length}</Badge>
                </h3>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <Droppable droppableId="completed">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="min-h-[400px] max-h-[400px] overflow-y-auto"
                        >
                          {completedTasks.slice(0, 5).map((task, index) => (
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
                          {completedTasks.length === 0 && (
                            <div className="text-center py-6 text-gray-500">
                              <span className="material-icons text-2xl mb-2">check_circle</span>
                              <p>Completed tasks will appear here</p>
                            </div>
                          )}
                          {completedTasks.length > 5 && (
                            <div className="text-center mt-2 text-sm text-gray-500">
                              <p>+ {completedTasks.length - 5} more completed tasks</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Tasks you've completed (showing most recent)</p>
                </div>
              </div>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Quick Capture Dialog */}
      <Dialog open={isCaptureOpen} onOpenChange={setIsCaptureOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Quick Capture</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCaptureSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's on your mind?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter anything you want to capture..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Don't worry about organizing it now, just capture the thought
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCaptureOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Capture
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
