import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { FRAMEWORKS } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";

export default function FrameworksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Load user favorites on mount
  useEffect(() => {
    // Load from localStorage for now, later will be from user profile in Firestore
    const savedFavorites = localStorage.getItem('favoriteFrameworks');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = (frameworkId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(frameworkId) 
        ? prev.filter(id => id !== frameworkId) 
        : [...prev, frameworkId];
      
      // Save to localStorage for now
      localStorage.setItem('favoriteFrameworks', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    // Simulating API call - will be replaced with Firestore update
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Preferences saved",
        description: "Your favorite frameworks have been updated.",
      });
    }, 800);
  };

  // Helper function to get framework description
  function getFrameworkDescription(frameworkId: string): string {
    const framework = FRAMEWORKS.find(f => f.id === frameworkId);
    return framework?.description || "";
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Productivity Frameworks</h2>
            <p className="text-muted-foreground">
              Select the frameworks you'd like to use in your productivity journey.
              Favorites will appear in your sidebar for easy access.
            </p>
          </div>
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FRAMEWORKS.map((framework) => (
            <Card key={framework.id} className={`overflow-hidden ${framework.color} bg-opacity-5 dark:bg-opacity-10 transition-all hover:shadow-md`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">{framework.name}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-foreground/70">
                    {getFrameworkDescription(framework.id)}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => toggleFavorite(framework.id)}
                  aria-label={favorites.includes(framework.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {favorites.includes(framework.id) ? (
                    <StarFilledIcon className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <StarIcon className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="pb-4">
                {favorites.includes(framework.id) && (
                  <Badge variant="outline" className="mb-2 bg-background/50">Favorite</Badge>
                )}
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  asChild
                >
                  <a href={framework.path}>Open Framework</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}