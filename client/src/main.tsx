import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TaskProvider } from "./context/task-context";
import { ProjectProvider } from "./context/project-context";
import { TimerProvider } from "./context/timer-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TaskProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </TaskProvider>
    </ProjectProvider>
  </QueryClientProvider>
);
