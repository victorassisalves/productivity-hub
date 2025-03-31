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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/tasks" component={AllTasksPage} />
      <Route path="/eisenhower" component={EisenhowerPage} />
      <Route path="/pomodoro" component={PomodoroPage} />
      <Route path="/time-blocking" component={TimeBlockingPage} />
      <Route path="/smart-goals" component={SmartGoalsPage} />
      <Route path="/focus-mode" component={FocusModePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/gtd" component={GtdPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
