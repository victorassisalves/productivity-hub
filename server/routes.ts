import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertProjectSchema, 
  insertPomodoroSessionSchema,
  insertGoalSchema,
  insertTimeBlockSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Error handling middleware for routes
  const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.errors
        });
      }
      next(err);
    });
  };

  // Tasks API
  router.get("/tasks", asyncHandler(async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  }));

  router.get("/tasks/:id", asyncHandler(async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  }));

  router.post("/tasks", asyncHandler(async (req, res) => {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  }));

  router.put("/tasks/:id", asyncHandler(async (req, res) => {
    const taskId = Number(req.params.id);
    const taskData = req.body;
    const task = await storage.updateTask(taskId, taskData);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  }));

  router.delete("/tasks/:id", asyncHandler(async (req, res) => {
    const taskId = Number(req.params.id);
    const success = await storage.deleteTask(taskId);
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).send();
  }));

  router.get("/tasks/status/:status", asyncHandler(async (req, res) => {
    const tasks = await storage.getTasksByStatus(req.params.status);
    res.json(tasks);
  }));

  router.get("/tasks/project/:projectId", asyncHandler(async (req, res) => {
    const tasks = await storage.getTasksByProject(Number(req.params.projectId));
    res.json(tasks);
  }));

  router.get("/tasks/priority/:priority", asyncHandler(async (req, res) => {
    const tasks = await storage.getTasksByPriority(req.params.priority);
    res.json(tasks);
  }));

  // Projects API
  router.get("/projects", asyncHandler(async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  }));

  router.get("/projects/:id", asyncHandler(async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  }));

  router.post("/projects", asyncHandler(async (req, res) => {
    const projectData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject(projectData);
    res.status(201).json(project);
  }));

  router.put("/projects/:id", asyncHandler(async (req, res) => {
    const projectId = Number(req.params.id);
    const projectData = req.body;
    const project = await storage.updateProject(projectId, projectData);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  }));

  router.delete("/projects/:id", asyncHandler(async (req, res) => {
    const projectId = Number(req.params.id);
    const success = await storage.deleteProject(projectId);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send();
  }));

  // Pomodoro Sessions API
  router.get("/pomodoro", asyncHandler(async (req, res) => {
    const sessions = await storage.getPomodoroSessions();
    res.json(sessions);
  }));

  router.get("/pomodoro/:id", asyncHandler(async (req, res) => {
    const session = await storage.getPomodoroSession(Number(req.params.id));
    if (!session) {
      return res.status(404).json({ message: "Pomodoro session not found" });
    }
    res.json(session);
  }));

  router.post("/pomodoro", asyncHandler(async (req, res) => {
    const sessionData = insertPomodoroSessionSchema.parse(req.body);
    const session = await storage.createPomodoroSession(sessionData);
    res.status(201).json(session);
  }));

  router.put("/pomodoro/:id", asyncHandler(async (req, res) => {
    const sessionId = Number(req.params.id);
    const sessionData = req.body;
    const session = await storage.updatePomodoroSession(sessionId, sessionData);
    if (!session) {
      return res.status(404).json({ message: "Pomodoro session not found" });
    }
    res.json(session);
  }));

  router.get("/pomodoro/task/:taskId", asyncHandler(async (req, res) => {
    const sessions = await storage.getSessionsByTask(Number(req.params.taskId));
    res.json(sessions);
  }));

  // Goals API
  router.get("/goals", asyncHandler(async (req, res) => {
    const goals = await storage.getGoals();
    res.json(goals);
  }));

  router.get("/goals/:id", asyncHandler(async (req, res) => {
    const goal = await storage.getGoal(Number(req.params.id));
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(goal);
  }));

  router.post("/goals", asyncHandler(async (req, res) => {
    const goalData = insertGoalSchema.parse(req.body);
    const goal = await storage.createGoal(goalData);
    res.status(201).json(goal);
  }));

  router.put("/goals/:id", asyncHandler(async (req, res) => {
    const goalId = Number(req.params.id);
    const goalData = req.body;
    const goal = await storage.updateGoal(goalId, goalData);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(goal);
  }));

  router.delete("/goals/:id", asyncHandler(async (req, res) => {
    const goalId = Number(req.params.id);
    const success = await storage.deleteGoal(goalId);
    if (!success) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.status(204).send();
  }));

  // Time Blocks API
  router.get("/timeblocks", asyncHandler(async (req, res) => {
    const timeBlocks = await storage.getTimeBlocks();
    res.json(timeBlocks);
  }));

  router.get("/timeblocks/:id", asyncHandler(async (req, res) => {
    const timeBlock = await storage.getTimeBlock(Number(req.params.id));
    if (!timeBlock) {
      return res.status(404).json({ message: "Time block not found" });
    }
    res.json(timeBlock);
  }));

  router.post("/timeblocks", asyncHandler(async (req, res) => {
    const timeBlockData = insertTimeBlockSchema.parse(req.body);
    const timeBlock = await storage.createTimeBlock(timeBlockData);
    res.status(201).json(timeBlock);
  }));

  router.put("/timeblocks/:id", asyncHandler(async (req, res) => {
    const timeBlockId = Number(req.params.id);
    const timeBlockData = req.body;
    const timeBlock = await storage.updateTimeBlock(timeBlockId, timeBlockData);
    if (!timeBlock) {
      return res.status(404).json({ message: "Time block not found" });
    }
    res.json(timeBlock);
  }));

  router.delete("/timeblocks/:id", asyncHandler(async (req, res) => {
    const timeBlockId = Number(req.params.id);
    const success = await storage.deleteTimeBlock(timeBlockId);
    if (!success) {
      return res.status(404).json({ message: "Time block not found" });
    }
    res.status(204).send();
  }));

  router.get("/timeblocks/day/:date", asyncHandler(async (req, res) => {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const timeBlocks = await storage.getTimeBlocksByDay(date);
    res.json(timeBlocks);
  }));

  // Register all routes with /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
