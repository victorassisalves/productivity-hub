import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { Project } from "@shared/schema";
import { Link } from "wouter";

export default function ProjectsPage() {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  
  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <AppLayout
      title="Projects"
      description="Manage your projects and organize your tasks effectively."
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Button onClick={() => setIsAddProjectOpen(true)}>
          <span className="material-icons mr-2 text-sm">add</span>
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10">
          <div className="text-6xl text-gray-300 mb-4">
            <span className="material-icons" style={{ fontSize: '4rem' }}>folder</span>
          </div>
          <CardTitle className="text-xl mb-2">No Projects Yet</CardTitle>
          <CardDescription className="text-center mb-4">
            Create your first project to start organizing your tasks.
          </CardDescription>
          <Button onClick={() => setIsAddProjectOpen(true)}>
            <span className="material-icons mr-2 text-sm">add</span>
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <AddProjectDialog 
        open={isAddProjectOpen} 
        onOpenChange={setIsAddProjectOpen} 
      />
    </AppLayout>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  // Get task count for this project
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });
  
  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const taskCount = projectTasks.length;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: project.color || '#6366f1' }}
      ></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{project.name}</CardTitle>
        <CardDescription className="line-clamp-1">
          {project.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <span className="material-icons text-gray-400 mr-2 text-sm">task</span>
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}