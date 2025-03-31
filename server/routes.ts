import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertProjectSchema, 
  insertPomodoroSessionSchema,
  insertGoalSchema,
  insertTimeBlockSchema,
  insertUserSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertCollaborativeProjectSchema,
  insertTaskAssignmentSchema,
  insertActivityLogSchema
} from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from 'bcrypt';

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
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
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
  
  // User Management API
  router.get("/users", asyncHandler(async (req, res) => {
    const users = await storage.getUsers();
    // Remove sensitive data
    const safeUsers = users.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  }));
  
  router.get("/users/:id", asyncHandler(async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Remove sensitive data
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));
  
  router.post("/users/register", asyncHandler(async (req, res) => {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Create user (exclude confirmPassword)
    const { confirmPassword, password, ...userInfo } = userData;
    const user = await storage.createUser({ ...userInfo, password });
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  }));
  
  router.post("/users/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await storage.verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));
  
  router.put("/users/:id", asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const userData = req.body;
    
    // Don't allow password update through this endpoint
    delete userData.passwordHash;
    
    const user = await storage.updateUser(userId, userData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));
  
  // Team Management API
  router.get("/teams", asyncHandler(async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  }));
  
  router.get("/teams/:id", asyncHandler(async (req, res) => {
    const team = await storage.getTeam(Number(req.params.id));
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  }));
  
  router.post("/teams", asyncHandler(async (req, res) => {
    const teamData = insertTeamSchema.parse(req.body);
    const { userId } = req.body; // Assuming userId is passed to identify team creator
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required to create a team" });
    }
    
    const user = await storage.getUser(Number(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const team = await storage.createTeam(teamData, Number(userId));
    res.status(201).json(team);
  }));
  
  router.put("/teams/:id", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.id);
    const teamData = req.body;
    const team = await storage.updateTeam(teamId, teamData);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json(team);
  }));
  
  router.delete("/teams/:id", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.id);
    const success = await storage.deleteTeam(teamId);
    if (!success) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(204).send();
  }));
  
  router.get("/users/:userId/teams", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const teams = await storage.getTeamsByUser(userId);
    res.json(teams);
  }));
  
  // Team Member API
  router.get("/teams/:teamId/members", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const members = await storage.getTeamMembers(teamId);
    res.json(members);
  }));
  
  router.post("/teams/:teamId/members", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const user = await storage.getUser(Number(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const memberData = {
      teamId,
      userId: Number(userId),
      role: role || "member"
    };
    
    const teamMember = await storage.addTeamMember(memberData);
    res.status(201).json(teamMember);
  }));
  
  router.put("/team-members/:id/role", asyncHandler(async (req, res) => {
    const memberId = Number(req.params.id);
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    
    const teamMember = await storage.updateTeamMemberRole(memberId, role);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    
    res.json(teamMember);
  }));
  
  router.delete("/team-members/:id", asyncHandler(async (req, res) => {
    const memberId = Number(req.params.id);
    const success = await storage.removeTeamMember(memberId);
    if (!success) {
      return res.status(404).json({ message: "Team member not found" });
    }
    res.status(204).send();
  }));
  
  // Collaborative Projects API
  router.get("/teams/:teamId/projects", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const projects = await storage.getProjectsByTeam(teamId);
    res.json(projects);
  }));
  
  router.post("/teams/:teamId/projects/:projectId", asyncHandler(async (req, res) => {
    const teamId = Number(req.params.teamId);
    const projectId = Number(req.params.projectId);
    
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const collaborativeProject = await storage.shareProject({
      teamId,
      projectId
    });
    
    res.status(201).json(collaborativeProject);
  }));
  
  router.delete("/collaborative-projects/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const success = await storage.unshareProject(id);
    if (!success) {
      return res.status(404).json({ message: "Collaborative project not found" });
    }
    res.status(204).send();
  }));
  
  // Task Assignment API
  router.get("/tasks/:taskId/assignments", asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const assignments = await storage.getTaskAssignments(taskId);
    res.json(assignments);
  }));
  
  router.post("/tasks/:taskId/assign", asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const { userId, assignedById } = req.body;
    
    if (!userId || !assignedById) {
      return res.status(400).json({ message: "User ID and assigner ID are required" });
    }
    
    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const user = await storage.getUser(Number(userId));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const assigner = await storage.getUser(Number(assignedById));
    if (!assigner) {
      return res.status(404).json({ message: "Assigner not found" });
    }
    
    const assignment = await storage.assignTask({
      taskId,
      userId: Number(userId),
      assignedById: Number(assignedById)
    });
    
    res.status(201).json(assignment);
  }));
  
  router.put("/task-assignments/:id/status", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const assignment = await storage.updateTaskAssignmentStatus(id, status);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    res.json(assignment);
  }));
  
  router.delete("/task-assignments/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const success = await storage.unassignTask(id);
    if (!success) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(204).send();
  }));
  
  router.get("/users/:userId/tasks", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const tasks = await storage.getTasksByAssignee(userId);
    res.json(tasks);
  }));
  
  // Activity Logs API
  router.get("/activity-logs", asyncHandler(async (req, res) => {
    const teamId = req.query.teamId ? Number(req.query.teamId) : undefined;
    const logs = await storage.getActivityLogs(teamId);
    res.json(logs);
  }));
  
  router.post("/activity-logs", asyncHandler(async (req, res) => {
    const logData = insertActivityLogSchema.parse(req.body);
    const log = await storage.createActivityLog(logData);
    res.status(201).json(log);
  }));
  
  router.get("/users/:userId/activity", asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    const logs = await storage.getActivityLogsByUser(userId);
    res.json(logs);
  }));
  
  router.get("/projects/:projectId/activity", asyncHandler(async (req, res) => {
    const projectId = Number(req.params.projectId);
    const logs = await storage.getActivityLogsByProject(projectId);
    res.json(logs);
  }));
  
  router.get("/tasks/:taskId/activity", asyncHandler(async (req, res) => {
    const taskId = Number(req.params.taskId);
    const logs = await storage.getActivityLogsByTask(taskId);
    res.json(logs);
  }));

  // Auth endpoints
  router.post("/auth/login", asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await storage.verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Set user ID in session
    req.session.userId = user.id;
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));
  
  router.post("/auth/register", asyncHandler(async (req: Request, res: Response) => {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Create user (exclude confirmPassword)
    const { confirmPassword, password, ...userInfo } = userData;
    const user = await storage.createUser({ ...userInfo, password });
    
    // Set user ID in session
    req.session.userId = user.id;
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  }));
  
  router.get("/auth/current-user", asyncHandler(async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.json(null);
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.userId = undefined;
      return res.json(null);
    }
    
    // Return user without password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));
  
  router.post("/auth/logout", (req: Request, res: Response) => {
    req.session.userId = undefined;
    res.json({ success: true });
  });

  // Register all routes with /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
