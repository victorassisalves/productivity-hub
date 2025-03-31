import React from "react";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define priorities and statuses directly since there's an issue with the constants
const TASK_PRIORITIES_MAP = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
};

const TASK_STATUSES_MAP = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done"
};

interface TaskFilterProps {
  tasks: Task[];
  onChange: (filteredTasks: Task[]) => void;
}

export function TaskFilter({ tasks, onChange }: TaskFilterProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("dueDate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Get all unique tags from tasks
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Apply filters and sorting
  React.useEffect(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "priority") {
        const priorityOrder: {[key: string]: number} = {
          "high": 3,
          "medium": 2,
          "low": 1,
          "urgent": 4
        };
        const aPriority = priorityOrder[a.priority] || 0;
        const bPriority = priorityOrder[b.priority] || 0;
        return sortOrder === "asc" ? aPriority - bPriority : bPriority - aPriority;
      } else if (sortBy === "dueDate") {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      } else if (sortBy === "status") {
        const statusOrder: {[key: string]: number} = {
          "todo": 1,
          "in_progress": 2,
          "review": 3,
          "done": 4
        };
        const aStatus = statusOrder[a.status] || 0;
        const bStatus = statusOrder[b.status] || 0;
        return sortOrder === "asc" ? aStatus - bStatus : bStatus - aStatus;
      }
      return 0;
    });

    onChange(filtered);
  }, [tasks, searchTerm, priorityFilter, sortBy, sortOrder, onChange]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("all");
    setSortBy("dueDate");
    setSortOrder("asc");
    onChange(tasks);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 material-icons text-sm">
            search
          </span>
        </div>
        
        <div className="flex flex-row gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(TASK_PRIORITIES_MAP).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <span className="material-icons">
              {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
            </span>
          </Button>
          
          <Button variant="ghost" onClick={resetFilters} size="sm">
            <span className="material-icons text-sm mr-1">refresh</span>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}