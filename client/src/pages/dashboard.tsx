import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ListTodo, Target } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good day");
  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    upcomingDeadlines: 0
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Placeholder for when we fetch data
  useEffect(() => {
    // This would be replaced with actual API calls
    setStats({
      totalTasks: 12,
      completedTasks: 5,
      inProgressTasks: 3,
      upcomingDeadlines: 2
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header and welcome message */}
        <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, {user?.displayName || user?.email?.split('@')[0] || "there"}!
          </h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/tasks/new">
                <ListTodo className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects and personal tasks
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTasks > 0 
                  ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate` 
                  : "No tasks yet"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                Tasks currently being worked on
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">
                Due in the next 48 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick access to frameworks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Productivity Frameworks</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/frameworks">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-red-50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pomodoro Timer</CardTitle>
                <CardDescription>Focus sessions with timed breaks</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/pomodoro">Start Timer</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Eisenhower Matrix</CardTitle>
                <CardDescription>Prioritize by urgency and importance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/eisenhower">Open Matrix</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SMART Goals</CardTitle>
                <CardDescription>Structured goal setting</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/smart-goals">Set Goals</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Problem Solving</CardTitle>
                <CardDescription>Analyze issues with 5 Whys and more</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/problem-solving">Analyze</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent activity and upcoming tasks would go here */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest tasks and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Start adding tasks to see your recent activity here.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/tasks/new">Add Task</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Your Team Activity</CardTitle>
              <CardDescription>Updates from your team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Create or join a team to start collaborating.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Manage Teams
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}