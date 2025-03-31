import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import EisenhowerPage from "@/pages/eisenhower";
import PomodoroPage from "@/pages/pomodoro";
import TimeBlockingPage from "@/pages/time-blocking";
import SmartGoalsPage from "@/pages/smart-goals";
import FocusModePage from "@/pages/focus-mode";
import AnalyticsPage from "@/pages/analytics";
import GtdPage from "@/pages/gtd";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import AllTasksPage from "@/pages/all-tasks";
import AuthPage from "@/pages/auth";
import FrameworksPage from "@/pages/frameworks";
import ProblemSolvingPage from "@/pages/problem-solving";

// Context providers
import { ProjectProvider } from "@/context/project-context";
import { TaskProvider } from "@/context/task-context";
import { TimerProvider } from "@/context/timer-context";
import { AuthProvider } from "@/context/auth-context";
import { TeamProvider } from "@/context/team-context";

// Import ProtectedRoute
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetailPage} />
      <ProtectedRoute path="/tasks" component={AllTasksPage} />
      
      {/* Frameworks and Problem Solving */}
      <ProtectedRoute path="/frameworks" component={FrameworksPage} />
      <ProtectedRoute path="/problem-solving" component={ProblemSolvingPage} />
      
      {/* Individual Framework Pages */}
      <ProtectedRoute path="/eisenhower" component={EisenhowerPage} />
      <ProtectedRoute path="/pomodoro" component={PomodoroPage} />
      <ProtectedRoute path="/time-blocking" component={TimeBlockingPage} />
      <ProtectedRoute path="/smart-goals" component={SmartGoalsPage} />
      <ProtectedRoute path="/focus-mode" component={FocusModePage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/gtd" component={GtdPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <ProjectProvider>
          <TaskProvider>
            <TimerProvider>
              <Router />
              <Toaster />
            </TimerProvider>
          </TaskProvider>
        </ProjectProvider>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;
