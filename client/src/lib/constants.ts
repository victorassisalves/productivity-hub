export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
};

export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: "bg-green-100 text-green-800",
  [TASK_PRIORITIES.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TASK_PRIORITIES.HIGH]: "bg-orange-100 text-orange-800",
  [TASK_PRIORITIES.URGENT]: "bg-red-100 text-red-800",
};

export const STATUS_COLORS = {
  [TASK_STATUSES.TODO]: "bg-gray-200 text-gray-700",
  [TASK_STATUSES.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [TASK_STATUSES.COMPLETED]: "bg-green-100 text-green-800",
};

export const DEFAULT_POMODORO_DURATIONS = {
  SHORT: 5, // 5 minutes
  MEDIUM: 25, // 25 minutes
  LONG: 45, // 45 minutes
};

export const FRAMEWORKS = [
  {
    id: "eisenhower",
    name: "Eisenhower Matrix",
    icon: "grid_view",
    color: "bg-primary-100 text-primary-600",
    description: "Prioritize tasks based on urgency and importance to focus on what matters most.",
    path: "/eisenhower"
  },
  {
    id: "pomodoro",
    name: "Pomodoro Technique",
    icon: "timer",
    color: "bg-green-100 text-green-600",
    description: "Work in focused sprints with timed breaks to maintain productivity and prevent burnout.",
    path: "/pomodoro"
  },
  {
    id: "gtd",
    name: "GTD Workflow",
    icon: "done_all",
    color: "bg-purple-100 text-purple-600",
    description: "Get Things Done by capturing, clarifying, organizing, and reviewing your tasks systematically.",
    path: "/gtd"
  },
  {
    id: "timeBlocking",
    name: "Time Blocking",
    icon: "calendar_month",
    color: "bg-blue-100 text-blue-600",
    description: "Schedule specific time blocks for different tasks to ensure dedicated focus and progress.",
    path: "/time-blocking"
  },
  {
    id: "smartGoals",
    name: "SMART Goals",
    icon: "track_changes",
    color: "bg-yellow-100 text-yellow-600",
    description: "Set Specific, Measurable, Achievable, Relevant, and Time-bound goals for better results.",
    path: "/smart-goals"
  },
  {
    id: "focusMode",
    name: "Focus Mode",
    icon: "do_not_disturb",
    color: "bg-indigo-100 text-indigo-600",
    description: "Eliminate distractions and focus deeply on your most important tasks with timed sessions.",
    path: "/focus-mode"
  }
];
