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
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/projects">
        {() => (
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/projects/:id">
        {(params) => (
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/tasks">
        {() => (
          <ProtectedRoute>
            <AllTasksPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/eisenhower">
        {() => (
          <ProtectedRoute>
            <EisenhowerPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/pomodoro">
        {() => (
          <ProtectedRoute>
            <PomodoroPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/time-blocking">
        {() => (
          <ProtectedRoute>
            <TimeBlockingPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/smart-goals">
        {() => (
          <ProtectedRoute>
            <SmartGoalsPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/focus-mode">
        {() => (
          <ProtectedRoute>
            <FocusModePage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/analytics">
        {() => (
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/gtd">
        {() => (
          <ProtectedRoute>
            <GtdPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route>
        {() => (
          <ProtectedRoute>
            <NotFound />
          </ProtectedRoute>
        )}
      </Route>
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
