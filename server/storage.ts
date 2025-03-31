import {
  tasks, projects, pomodoroSessions, goals, timeBlocks,
  users, teams, teamMembers, collaborativeProjects, taskAssignments, activityLogs,
  type Task, type InsertTask, 
  type Project, type InsertProject,
  type PomodoroSession, type InsertPomodoroSession,
  type Goal, type InsertGoal,
  type TimeBlock, type InsertTimeBlock,
  type User, type InsertUser,
  type Team, type InsertTeam,
  type TeamMember, type InsertTeamMember,
  type CollaborativeProject, type InsertCollaborativeProject,
  type TaskAssignment, type InsertTaskAssignment,
  type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import * as crypto from 'crypto';

// Re-export types for use in FirestoreStorage
export type {
  Task, InsertTask,
  Project, InsertProject,
  PomodoroSession, InsertPomodoroSession,
  Goal, InsertGoal,
  TimeBlock, InsertTimeBlock,
  User, InsertUser,
  Team, InsertTeam,
  TeamMember, InsertTeamMember,
  CollaborativeProject, InsertCollaborativeProject,
  TaskAssignment, InsertTaskAssignment,
  ActivityLog, InsertActivityLog
};

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
  
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'confirmPassword'> & { password: string }): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  verifyUserCredentials(email: string, password: string): Promise<User | null>;
  
  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam, createdById: number): Promise<Team>;
  updateTeam(id: number, team: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  getTeamsByUser(userId: number): Promise<Team[]>;
  
  // Team member operations
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(id: number): Promise<boolean>;
  updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined>;
  getTeamMembershipByUser(userId: number): Promise<TeamMember[]>;
  
  // Collaborative project operations
  getCollaborativeProjects(teamId: number): Promise<CollaborativeProject[]>;
  getCollaborativeProject(id: number): Promise<CollaborativeProject | undefined>;
  shareProject(collaborativeProject: InsertCollaborativeProject): Promise<CollaborativeProject>;
  unshareProject(id: number): Promise<boolean>;
  getProjectsByTeam(teamId: number): Promise<Project[]>;
  
  // Task assignment operations
  getTaskAssignments(taskId: number): Promise<TaskAssignment[]>;
  getTaskAssignment(id: number): Promise<TaskAssignment | undefined>;
  assignTask(taskAssignment: InsertTaskAssignment): Promise<TaskAssignment>;
  unassignTask(id: number): Promise<boolean>;
  updateTaskAssignmentStatus(id: number, status: string): Promise<TaskAssignment | undefined>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  
  // Activity log operations
  getActivityLogs(teamId?: number): Promise<ActivityLog[]>;
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUser(userId: number): Promise<ActivityLog[]>;
  getActivityLogsByProject(projectId: number): Promise<ActivityLog[]>;
  getActivityLogsByTask(taskId: number): Promise<ActivityLog[]>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private projects: Map<number, Project>;
  private pomodoroSessions: Map<number, PomodoroSession>;
  private goals: Map<number, Goal>;
  private timeBlocks: Map<number, TimeBlock>;
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private collaborativeProjects: Map<number, CollaborativeProject>;
  private taskAssignments: Map<number, TaskAssignment>;
  private activityLogs: Map<number, ActivityLog>;
  
  private taskId: number;
  private projectId: number;
  private pomodoroSessionId: number;
  private goalId: number;
  private timeBlockId: number;
  private userId: number;
  private teamId: number;
  private teamMemberId: number;
  private collaborativeProjectId: number;
  private taskAssignmentId: number;
  private activityLogId: number;

  constructor() {
    this.tasks = new Map();
    this.projects = new Map();
    this.pomodoroSessions = new Map();
    this.goals = new Map();
    this.timeBlocks = new Map();
    this.users = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.collaborativeProjects = new Map();
    this.taskAssignments = new Map();
    this.activityLogs = new Map();
    
    this.taskId = 1;
    this.projectId = 1;
    this.pomodoroSessionId = 1;
    this.goalId = 1;
    this.timeBlockId = 1;
    this.userId = 1;
    this.teamId = 1;
    this.teamMemberId = 1;
    this.collaborativeProjectId = 1;
    this.taskAssignmentId = 1;
    this.activityLogId = 1;
    
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
  
  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: Omit<InsertUser, 'confirmPassword'> & { password: string }): Promise<User> {
    // Hash the password using crypto
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const id = this.userId++;
    const newUser: User = {
      id,
      email: user.email,
      name: user.name,
      username: user.username,
      passwordHash,
      avatar: user.avatar || null,
      role: user.role || 'user',
      createdAt: new Date(),
      lastLogin: null
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async verifyUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const [salt, storedHash] = user.passwordHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    if (hash === storedHash) {
      // Update last login time
      user.lastLogin = new Date();
      this.users.set(user.id, user);
      return user;
    }
    
    return null;
  }
  
  // Team operations
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam, createdById: number): Promise<Team> {
    const id = this.teamId++;
    const newTeam: Team = {
      ...team,
      id,
      createdById,
      createdAt: new Date()
    };
    
    this.teams.set(id, newTeam);
    
    // Add the creator as a team member with owner role
    await this.addTeamMember({
      teamId: id,
      userId: createdById,
      role: 'owner'
    });
    
    return newTeam;
  }

  async updateTeam(id: number, teamUpdate: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...teamUpdate };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    // Delete all team members
    const teamMembers = await this.getTeamMembers(id);
    for (const member of teamMembers) {
      await this.removeTeamMember(member.id);
    }
    
    // Delete all collaborative projects
    const collaborativeProjects = await this.getCollaborativeProjects(id);
    for (const cp of collaborativeProjects) {
      await this.unshareProject(cp.id);
    }
    
    return this.teams.delete(id);
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    const memberships = await this.getTeamMembershipByUser(userId);
    const teamIds = memberships.map(m => m.teamId);
    return Array.from(this.teams.values()).filter(team => teamIds.includes(team.id));
  }
  
  // Team member operations
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(tm => tm.teamId === teamId);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const newTeamMember: TeamMember = {
      ...teamMember,
      id,
      joinedAt: new Date()
    };
    
    this.teamMembers.set(id, newTeamMember);
    return newTeamMember;
  }

  async removeTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  async updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined> {
    const teamMember = this.teamMembers.get(id);
    if (!teamMember) return undefined;
    
    const updatedTeamMember = { ...teamMember, role };
    this.teamMembers.set(id, updatedTeamMember);
    return updatedTeamMember;
  }

  async getTeamMembershipByUser(userId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).filter(tm => tm.userId === userId);
  }
  
  // Collaborative project operations
  async getCollaborativeProjects(teamId: number): Promise<CollaborativeProject[]> {
    return Array.from(this.collaborativeProjects.values()).filter(cp => cp.teamId === teamId);
  }

  async getCollaborativeProject(id: number): Promise<CollaborativeProject | undefined> {
    return this.collaborativeProjects.get(id);
  }

  async shareProject(collaborativeProject: InsertCollaborativeProject): Promise<CollaborativeProject> {
    const id = this.collaborativeProjectId++;
    const newCollaborativeProject: CollaborativeProject = {
      ...collaborativeProject,
      id,
      sharedAt: new Date()
    };
    
    this.collaborativeProjects.set(id, newCollaborativeProject);
    return newCollaborativeProject;
  }

  async unshareProject(id: number): Promise<boolean> {
    return this.collaborativeProjects.delete(id);
  }

  async getProjectsByTeam(teamId: number): Promise<Project[]> {
    const collaborativeProjects = await this.getCollaborativeProjects(teamId);
    const projectIds = collaborativeProjects.map(cp => cp.projectId);
    return Array.from(this.projects.values()).filter(project => projectIds.includes(project.id));
  }
  
  // Task assignment operations
  async getTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    return Array.from(this.taskAssignments.values()).filter(ta => ta.taskId === taskId);
  }

  async getTaskAssignment(id: number): Promise<TaskAssignment | undefined> {
    return this.taskAssignments.get(id);
  }

  async assignTask(taskAssignment: InsertTaskAssignment): Promise<TaskAssignment> {
    const id = this.taskAssignmentId++;
    const newTaskAssignment: TaskAssignment = {
      ...taskAssignment,
      id,
      assignedAt: new Date()
    };
    
    this.taskAssignments.set(id, newTaskAssignment);
    return newTaskAssignment;
  }

  async unassignTask(id: number): Promise<boolean> {
    return this.taskAssignments.delete(id);
  }

  async updateTaskAssignmentStatus(id: number, status: string): Promise<TaskAssignment | undefined> {
    const taskAssignment = this.taskAssignments.get(id);
    if (!taskAssignment) return undefined;
    
    const updatedTaskAssignment = { ...taskAssignment, status };
    this.taskAssignments.set(id, updatedTaskAssignment);
    return updatedTaskAssignment;
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    const assignments = Array.from(this.taskAssignments.values()).filter(ta => ta.userId === userId);
    const taskIds = assignments.map(a => a.taskId);
    return Array.from(this.tasks.values()).filter(task => taskIds.includes(task.id));
  }
  
  // Activity log operations
  async getActivityLogs(teamId?: number): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values());
    if (teamId) {
      return logs.filter(log => log.teamId === teamId);
    }
    return logs;
  }

  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    return this.activityLogs.get(id);
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogId++;
    const newActivityLog: ActivityLog = {
      ...activityLog,
      id,
      createdAt: new Date()
    };
    
    this.activityLogs.set(id, newActivityLog);
    return newActivityLog;
  }

  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(log => log.userId === userId);
  }

  async getActivityLogsByProject(projectId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(log => log.projectId === projectId);
  }

  async getActivityLogsByTask(taskId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(log => log.taskId === taskId);
  }
}

import { FirestoreStorage } from './firestore-storage';

// Export FirestoreStorage instance for persistent storage
export const storage = new FirestoreStorage();
