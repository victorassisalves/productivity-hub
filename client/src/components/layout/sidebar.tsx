import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FRAMEWORKS } from "@/lib/constants";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Project } from "@shared/schema";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const sidebarContent = (
    <div className="flex flex-col w-64 h-full bg-white border-r border-gray-200">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center mr-3">
            <span className="material-icons text-white text-xl">view_timeline</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">TaskFlow</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pt-2">
        <nav className="flex-1 px-4 pb-4 space-y-1">
          <Link href="/">
            <div 
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                location === "/" 
                  ? "border-l-4 border-primary-600 bg-primary-50 text-primary-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className={cn(
                "material-icons mr-3",
                location === "/" ? "text-primary-600" : "text-gray-500"
              )}>dashboard</span>
              Dashboard
            </div>
          </Link>

          <div>
            <div className="flex items-center justify-between px-3 mt-4 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Projects
              </h3>
              <Link href="/projects">
                <div className="text-xs text-primary-600 hover:underline cursor-pointer">
                  View All
                </div>
              </Link>
            </div>
            <div className="space-y-1">
              <Link href="/projects">
                <div className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                  location === "/projects" 
                    ? "border-l-4 border-primary-600 bg-primary-50 text-primary-600" 
                    : "text-gray-700 hover:bg-gray-50"
                )}>
                  <span className={cn(
                    "material-icons mr-3",
                    location === "/projects" ? "text-primary-600" : "text-gray-500"
                  )}>folder_special</span>
                  All Projects
                </div>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
              Frameworks
            </h3>
            <div className="space-y-1">
              {FRAMEWORKS.map((framework) => (
                <Link key={framework.id} href={framework.path}>
                  <div 
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                      location === framework.path 
                        ? "border-l-4 border-primary-600 bg-primary-50 text-primary-600" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "material-icons mr-3",
                      location === framework.path ? "text-primary-600" : "text-gray-500"
                    )}>{framework.icon}</span>
                    {framework.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button className="w-full" onClick={() => setIsAddProjectOpen(true)}>
            <span className="material-icons mr-2 text-sm">add</span>
            New Project
          </Button>
        </div>
      </div>
    </div>
  );

  // Return the appropriate sidebar based on screen size
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        {sidebarContent}
      </div>
      
      {/* Mobile sidebar */}
      {isMounted && (
        <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
          <SheetContent side="left" className="p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Project Dialog */}
      <AddProjectDialog 
        open={isAddProjectOpen} 
        onOpenChange={setIsAddProjectOpen} 
      />
    </>
  );
}
