import {
  Timer,
  Boxes,
  CalendarClock,
  Target,
  Focus,
  List,
  BarChart,
  GridIcon,
  Lightbulb
} from "lucide-react";

// Task Status Options
export const TASK_STATUSES = [
  { id: "todo", name: "To Do", color: "bg-slate-500" },
  { id: "in_progress", name: "In Progress", color: "bg-blue-500" },
  { id: "completed", name: "Completed", color: "bg-green-500" }
];

// Status colors for UI components
export const STATUS_COLORS = {
  todo: "text-slate-700 border-slate-200 bg-slate-50",
  in_progress: "text-blue-500 border-blue-200 bg-blue-50",
  completed: "text-green-500 border-green-200 bg-green-50"
};

// Task Priority Options
export const TASK_PRIORITIES = [
  { id: "low", name: "Low", color: "text-green-500", icon: "ArrowDown" },
  { id: "medium", name: "Medium", color: "text-yellow-500", icon: "Minus" },
  { id: "high", name: "High", color: "text-orange-500", icon: "ArrowUp" },
  { id: "urgent", name: "Urgent", color: "text-red-500", icon: "AlertTriangle" }
];

// Priority colors for UI components
export const PRIORITY_COLORS = {
  low: "text-green-500 border-green-200 bg-green-50",
  medium: "text-yellow-500 border-yellow-200 bg-yellow-50",
  high: "text-orange-500 border-orange-200 bg-orange-50",
  urgent: "text-red-500 border-red-200 bg-red-50"
};

// User Roles
export const USER_ROLES = [
  { id: "USER", name: "User" },
  { id: "ADMIN", name: "Administrator" },
  { id: "TEAM_LEAD", name: "Team Leader" },
  { id: "MEMBER", name: "Team Member" }
];

// Team Member Roles
export const TEAM_ROLES = [
  { id: "OWNER", name: "Owner" },
  { id: "ADMIN", name: "Admin" },
  { id: "MEMBER", name: "Member" },
  { id: "GUEST", name: "Guest" }
];

// Productivity Frameworks
export const FRAMEWORKS = [
  { 
    id: "pomodoro", 
    name: "Pomodoro Timer", 
    icon: Timer, 
    path: "/pomodoro",
    color: "bg-red-600",
    description: "Work in focused intervals with short breaks to maximize productivity and prevent burnout."
  },
  { 
    id: "eisenhower", 
    name: "Eisenhower Matrix", 
    icon: GridIcon, 
    path: "/eisenhower",
    color: "bg-blue-600",
    description: "Prioritize tasks by urgency and importance to focus on what truly matters."
  },
  { 
    id: "timeBlocking", 
    name: "Time Blocking", 
    icon: CalendarClock, 
    path: "/time-blocking",
    color: "bg-purple-600",
    description: "Schedule specific time blocks for tasks to manage your day effectively."
  },
  { 
    id: "smartGoals", 
    name: "SMART Goals", 
    icon: Target, 
    path: "/smart-goals",
    color: "bg-green-600",
    description: "Create Specific, Measurable, Achievable, Relevant, and Time-bound goals."
  },
  { 
    id: "focusMode", 
    name: "Focus Mode", 
    icon: Focus, 
    path: "/focus-mode",
    color: "bg-gray-800",
    description: "Eliminate distractions and enter a deep state of concentration for maximum output."
  },
  { 
    id: "gtd", 
    name: "GTD Workflow", 
    icon: List, 
    path: "/gtd",
    color: "bg-teal-600",
    description: "Getting Things Done methodology for capturing, processing, and organizing tasks."
  },
  { 
    id: "analytics", 
    name: "Activity Analytics", 
    icon: BarChart, 
    path: "/analytics",
    color: "bg-indigo-600",
    description: "Track and visualize your productivity patterns to identify improvement opportunities."
  },
  { 
    id: "problemSolving", 
    name: "Problem Solving", 
    icon: Lightbulb, 
    path: "/problem-solving",
    color: "bg-amber-600",
    description: "Use structured techniques to identify root causes and generate effective solutions."
  }
];

// Routes that should appear in the sidebar
export const SIDEBAR_ROUTES = [
  { path: "/", name: "Dashboard", icon: "Home" },
  { path: "/projects", name: "Projects", icon: "FolderKanban" },
  { path: "/tasks", name: "All Tasks", icon: "CheckSquare" },
  { path: "/frameworks", name: "Frameworks", icon: "LayoutGrid" }
];

// Pomodoro timer settings
export const POMODORO_SETTINGS = {
  DEFAULT_WORK_MINUTES: 25,
  DEFAULT_SHORT_BREAK_MINUTES: 5,
  DEFAULT_LONG_BREAK_MINUTES: 15,
  DEFAULT_ROUNDS_BEFORE_LONG_BREAK: 4
};

// Default Pomodoro durations (in minutes)
export const DEFAULT_POMODORO_DURATIONS = {
  WORK: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
  ROUNDS_BEFORE_LONG_BREAK: 4
};

// Problem-solving techniques
export const PROBLEM_TECHNIQUES = [
  { 
    id: "fiveWhys", 
    name: "5 Whys Analysis", 
    description: "A technique to identify the root cause of a problem by asking 'why' multiple times.",
    steps: 5 
  },
  { 
    id: "fishbone", 
    name: "Fishbone Diagram", 
    description: "A visualization technique to identify possible causes for an effect or problem.",
    steps: 4 
  },
  { 
    id: "pareto", 
    name: "Pareto Analysis (80/20 Rule)", 
    description: "Identify the 20% of causes that create 80% of problems.",
    steps: 3 
  },
  { 
    id: "sixHats", 
    name: "Six Thinking Hats", 
    description: "A technique for looking at decisions from different perspectives.",
    steps: 6 
  }
];