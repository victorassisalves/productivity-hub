import { useState } from "react";
import { useTaskContext } from "@/context/task-context";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/tasks/task-card";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TASK_PRIORITIES } from "@/lib/constants";

export function EisenhowerMatrix() {
  const { tasks, updateTask } = useTaskContext();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [addTaskPriority, setAddTaskPriority] = useState<string>(TASK_PRIORITIES.MEDIUM);

  // Group tasks by priority for the matrix
  const urgentImportantTasks = tasks.filter(task => 
    task.priority === TASK_PRIORITIES.URGENT && !task.completed);
  
  const importantTasks = tasks.filter(task => 
    task.priority === TASK_PRIORITIES.HIGH && !task.completed);
  
  const urgentTasks = tasks.filter(task => 
    task.priority === TASK_PRIORITIES.MEDIUM && !task.completed);
  
  const nonUrgentTasks = tasks.filter(task => 
    task.priority === TASK_PRIORITIES.LOW && !task.completed);

  // Handle drag end
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Return if dropped outside a droppable area or in the same position
    if (!destination || source.droppableId === destination.droppableId) {
      return;
    }
    
    // Get the new priority based on the destination droppableId
    const taskId = Number(draggableId);
    updateTask(taskId, { priority: destination.droppableId });
  };

  const handleAddTask = (priority: string) => {
    setAddTaskPriority(priority);
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Eisenhower Matrix</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Organize tasks based on urgency and importance to better prioritize your work
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Urgent & Important (Do First) */}
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Badge variant="danger" className="mr-2">1</Badge>
                        Urgent & Important
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Do First</p>
                    </div>
                    <Badge variant="danger">{urgentImportantTasks.length}</Badge>
                  </div>
                </div>

                <Droppable droppableId={TASK_PRIORITIES.URGENT}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 min-h-[200px]"
                    >
                      {urgentImportantTasks.map((task, index) => (
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

                <div className="p-4 border-t border-red-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddTask(TASK_PRIORITIES.URGENT)}
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add Urgent & Important Task
                  </Button>
                </div>
              </div>

              {/* Important but Not Urgent (Schedule) */}
              <div className="border border-orange-200 rounded-lg overflow-hidden">
                <div className="bg-orange-50 p-4 border-b border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Badge variant="warning" className="mr-2">2</Badge>
                        Important, Not Urgent
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Schedule</p>
                    </div>
                    <Badge variant="warning">{importantTasks.length}</Badge>
                  </div>
                </div>

                <Droppable droppableId={TASK_PRIORITIES.HIGH}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 min-h-[200px]"
                    >
                      {importantTasks.map((task, index) => (
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

                <div className="p-4 border-t border-orange-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddTask(TASK_PRIORITIES.HIGH)}
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add Important Task
                  </Button>
                </div>
              </div>

              {/* Urgent but Not Important (Delegate) */}
              <div className="border border-yellow-200 rounded-lg overflow-hidden">
                <div className="bg-yellow-50 p-4 border-b border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Badge variant="warning" className="mr-2">3</Badge>
                        Urgent, Not Important
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Delegate</p>
                    </div>
                    <Badge variant="warning">{urgentTasks.length}</Badge>
                  </div>
                </div>

                <Droppable droppableId={TASK_PRIORITIES.MEDIUM}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 min-h-[200px]"
                    >
                      {urgentTasks.map((task, index) => (
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

                <div className="p-4 border-t border-yellow-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddTask(TASK_PRIORITIES.MEDIUM)}
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add Urgent Task
                  </Button>
                </div>
              </div>

              {/* Not Urgent & Not Important (Eliminate) */}
              <div className="border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Badge variant="success" className="mr-2">4</Badge>
                        Not Urgent, Not Important
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Eliminate or Do Later</p>
                    </div>
                    <Badge variant="success">{nonUrgentTasks.length}</Badge>
                  </div>
                </div>

                <Droppable droppableId={TASK_PRIORITIES.LOW}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-4 min-h-[200px]"
                    >
                      {nonUrgentTasks.map((task, index) => (
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

                <div className="p-4 border-t border-green-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddTask(TASK_PRIORITIES.LOW)}
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add Non-Urgent Task
                  </Button>
                </div>
              </div>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        defaultStatus="todo"
        defaultPriority={addTaskPriority} 
      />
    </div>
  );
}
