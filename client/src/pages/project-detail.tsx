import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { Project, Task } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { TASK_STATUSES } from "@/lib/constants";

export default function ProjectDetailPage() {
  const [, params] = useRoute<{ id: string }>("/projects/:id");
  const projectId = params ? parseInt(params.id) : 0;
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  // Fetch project details
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const project = projects.find(p => p.id === projectId);

  // Fetch tasks for this project
  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const projectTasks = allTasks.filter(task => task.projectId === projectId);
  
  // Group tasks by status
  const todoTasks = projectTasks.filter(task => task.status === TASK_STATUSES.TODO);
  const inProgressTasks = projectTasks.filter(task => task.status === TASK_STATUSES.IN_PROGRESS);
  const completedTasks = projectTasks.filter(task => task.status === TASK_STATUSES.COMPLETED);
  
  if (!project) {
    return (
      <AppLayout title="Project Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl text-gray-300 mb-4">
            <span className="material-icons" style={{ fontSize: '4rem' }}>error_outline</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-gray-500 mb-4">The project you are looking for does not exist.</p>
          <Link href="/projects">
            <Button>Go Back to Projects</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={project.name}
      description={project.description || ""}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link href="/projects">
              <Button variant="ghost" className="p-0 h-auto mr-2 hover:bg-transparent">
                <span className="material-icons text-gray-500">arrow_back</span>
              </Button>
            </Link>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <div 
              className="w-3 h-3 rounded-full ml-3" 
              style={{ backgroundColor: project.color || '#6366f1' }}
            ></div>
          </div>
          <p className="text-gray-500">{project.description || "No description"}</p>
        </div>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <span className="material-icons mr-2 text-sm">add</span>
          Add Task
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Project Tasks</h3>
              <div className="text-sm text-gray-500">
                {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'} in total
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="todo">To Do ({todoTasks.length})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {projectTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">No tasks in this project yet.</p>
                    <Button onClick={() => setIsAddTaskOpen(true)}>
                      <span className="material-icons mr-2 text-sm">add</span>
                      Add First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="todo">
                {todoTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No tasks to do.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todoTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="in-progress">
                {inProgressTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No tasks in progress.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inProgressTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {completedTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No completed tasks.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        defaultStatus={TASK_STATUSES.TODO}
      />
    </AppLayout>
  );
}