import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { Project } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProjectsPage() {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Fetch projects
  const { 
    data: projects = [], 
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Force refetch when component mounts or dialog closes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await refetch();
        console.log("Projects fetched:", projects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        toast({
          title: "Failed to load projects",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    };
    
    fetchProjects();
  }, [isAddProjectOpen, editProjectId]);
  
  // Handle project edit from URL
  useEffect(() => {
    // Check if URL contains edit path
    const match = location.match(/\/projects\/(\d+)\/edit/);
    if (match && match[1]) {
      const projectId = parseInt(match[1], 10);
      setEditProjectId(projectId);
    } else {
      setEditProjectId(null);
    }
  }, [location]);

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
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={() => setEditProjectId(project.id)}
            />
          ))}
        </div>
      )}

      {/* Add Project Dialog */}
      <AddProjectDialog 
        open={isAddProjectOpen} 
        onOpenChange={setIsAddProjectOpen} 
      />
      
      {/* Edit Project Dialog */}
      {editProjectId && (
        <EditProjectDialog
          open={editProjectId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditProjectId(null);
              // Navigate back to projects page if on edit URL
              if (location.includes('/edit')) {
                window.history.pushState({}, '', '/projects');
              }
            }
          }}
          projectId={editProjectId}
        />
      )}
    </AppLayout>
  );
}

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
}

function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { toast } = useToast();
  
  // Get task count for this project
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
  });
  
  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const taskCount = projectTasks.length;
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/projects/${project.id}`);
      return response;
    },
    onSuccess: () => {
      // Force invalidate the projects query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.refetchQueries({ queryKey: ["/api/projects"] });
      
      // Show success toast
      toast({
        title: "Project deleted",
        description: `${project.name} has been deleted successfully`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        title: "Failed to delete project",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      deleteProjectMutation.mutate();
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: project.color || '#6366f1' }}
      ></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{project.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {project.description || "No description"}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-red-500 h-8 w-8"
            onClick={handleDelete}
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
            )}
          </Button>
        </div>
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
        <Button 
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            if (onEdit) {
              onEdit();
            }
          }}
        >
          <span className="material-icons mr-1 text-sm">edit</span>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}