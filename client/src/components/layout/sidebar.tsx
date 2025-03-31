import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FRAMEWORKS, SIDEBAR_ROUTES } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import {
  Home,
  CheckSquare,
  FolderKanban,
  LayoutGrid,
  Star,
  X
} from "lucide-react";

// Map icon strings to Lucide React components
const IconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-5 w-5" />,
  CheckSquare: <CheckSquare className="h-5 w-5" />,
  FolderKanban: <FolderKanban className="h-5 w-5" />,
  LayoutGrid: <LayoutGrid className="h-5 w-5" />
};

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [favoriteFrameworks, setFavoriteFrameworks] = useState<string[]>([]);
  
  // Simulate loading favorite frameworks from user settings
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll hardcode some favorites
    setFavoriteFrameworks(["pomodoro", "eisenhower", "problemSolving"]);
  }, [user]);
  
  // Get favorite frameworks data
  const favorites = FRAMEWORKS.filter(
    framework => favoriteFrameworks.includes(framework.id)
  );

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1">
            <Star className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Productivity Hub</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 lg:hidden"
          onClick={onMobileClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="grid gap-1">
          {SIDEBAR_ROUTES.map((route) => (
            <Link key={route.path} href={route.path}>
              <Button
                variant={location === route.path ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", 
                  location === route.path ? "font-medium" : "font-normal"
                )}
              >
                {IconMap[route.icon]}
                {route.name}
              </Button>
            </Link>
          ))}
          
          {favorites.length > 0 && (
            <>
              <div className="my-2 px-2 py-1.5">
                <div className="text-xs font-semibold text-muted-foreground">
                  FAVORITE FRAMEWORKS
                </div>
              </div>
              
              {favorites.map((framework) => (
                <Link key={framework.id} href={framework.path}>
                  <Button
                    variant={location === framework.path ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-3", 
                      location === framework.path ? "font-medium" : "font-normal"
                    )}
                  >
                    <framework.icon className="h-5 w-5" />
                    {framework.name}
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r lg:block">
        <div className="flex h-full flex-col">{sidebarContent}</div>
      </aside>
      
      <Sheet open={isMobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="w-64 p-0" overlayProps={{ className: "lg:hidden" }}>
          <div className="flex h-full flex-col">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}