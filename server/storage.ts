import { 
  tasks, projects, pomodoroSessions, goals, timeBlocks,
  type Task, type InsertTask, 
  type Project, type InsertProject,
  type PomodoroSession, type InsertPomodoroSession,
  type Goal, type InsertGoal,
  type TimeBlock, type InsertTimeBlock
} from "@shared/schema";

export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByPriority(priority: string): Promise<Task[]>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Pomodoro operations
  getPomodoroSessions(): Promise<PomodoroSession[]>;
  getPomodoroSession(id: number): Promise<PomodoroSession | undefined>;
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updatePomodoroSession(id: number, session: Partial<PomodoroSession>): Promise<PomodoroSession | undefined>;
  getSessionsByTask(taskId: number): Promise<PomodoroSession[]>;
  
  // Goal operations
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Time block operations
  getTimeBlocks(): Promise<TimeBlock[]>;
  getTimeBlock(id: number): Promise<TimeBlock | undefined>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: number): Promise<boolean>;
  getTimeBlocksByDay(date: Date): Promise<TimeBlock[]>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private projects: Map<number, Project>;
  private pomodoroSessions: Map<number, PomodoroSession>;
  private goals: Map<number, Goal>;
  private timeBlocks: Map<number, TimeBlock>;
  
  private taskId: number;
  private projectId: number;
  private pomodoroSessionId: number;
  private goalId: number;
  private timeBlockId: number;

  constructor() {
    this.tasks = new Map();
    this.projects = new Map();
    this.pomodoroSessions = new Map();
    this.goals = new Map();
    this.timeBlocks = new Map();
    
    this.taskId = 1;
    this.projectId = 1;
    this.pomodoroSessionId = 1;
    this.goalId = 1;
    this.timeBlockId = 1;
    
    // Initialize with sample projects
    this.seedProjects();
  }

  private seedProjects() {
    const defaultProjects = [
      { name: "Work", description: "Work-related tasks", color: "#3182ce" },
      { name: "Personal", description: "Personal tasks", color: "#38b2ac" },
      { name: "Learning", description: "Education and learning tasks", color: "#805ad5" }
    ];
    
    defaultProjects.forEach(project => {
      this.createProject(project);
    });
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const newTask: Task = { 
      ...task, 
      id, 
      createdAt: new Date(),
      completed: task.completed || false,
      progress: task.progress || 0
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.priority === priority);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Pomodoro operations
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values());
  }

  async getPomodoroSession(id: number): Promise<PomodoroSession | undefined> {
    return this.pomodoroSessions.get(id);
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = this.pomodoroSessionId++;
    const newSession: PomodoroSession = { 
      ...session, 
      id, 
      completed: false
    };
    this.pomodoroSessions.set(id, newSession);
    return newSession;
  }

  async updatePomodoroSession(id: number, sessionUpdate: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const session = this.pomodoroSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.pomodoroSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getSessionsByTask(taskId: number): Promise<PomodoroSession[]> {
    return Array.from(this.pomodoroSessions.values()).filter(session => session.taskId === taskId);
  }

  // Goal operations
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalId++;
    const newGoal: Goal = { 
      ...goal, 
      id, 
      completed: false,
      progress: 0
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Time block operations
  async getTimeBlocks(): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values());
  }

  async getTimeBlock(id: number): Promise<TimeBlock | undefined> {
    return this.timeBlocks.get(id);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const id = this.timeBlockId++;
    const newTimeBlock: TimeBlock = { ...timeBlock, id };
    this.timeBlocks.set(id, newTimeBlock);
    return newTimeBlock;
  }

  async updateTimeBlock(id: number, timeBlockUpdate: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const timeBlock = this.timeBlocks.get(id);
    if (!timeBlock) return undefined;
    
    const updatedTimeBlock = { ...timeBlock, ...timeBlockUpdate };
    this.timeBlocks.set(id, updatedTimeBlock);
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<boolean> {
    return this.timeBlocks.delete(id);
  }

  async getTimeBlocksByDay(date: Date): Promise<TimeBlock[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return Array.from(this.timeBlocks.values()).filter(timeBlock => {
      const blockDate = new Date(timeBlock.startTime);
      return blockDate >= targetDate && blockDate < nextDay;
    });
  }
}

export const storage = new MemStorage();
