import { compareDesc } from 'date-fns';
import bcrypt from 'bcrypt';
import type { 
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
} from '@shared/schema';
import { IStorage } from './storage';

export class MemoryStorage implements IStorage {
  private tasks: Task[] = [];
  private projects: Project[] = [];
  private pomodoroSessions: PomodoroSession[] = [];
  private goals: Goal[] = [];
  private timeBlocks: TimeBlock[] = [];
  private users: User[] = [];
  private teams: Team[] = [];
  private teamMembers: TeamMember[] = [];
  private collaborativeProjects: CollaborativeProject[] = [];
  private taskAssignments: TaskAssignment[] = [];
  private activityLogs: ActivityLog[] = [];

  // Task operations
  async getTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.find(task => task.id === id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
    const newTask: Task = { 
      ...task, 
      id,
      createdAt: new Date(),
      completed: task.completed !== undefined ? task.completed : false,
      progress: task.progress !== undefined ? task.progress : 0,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      tags: task.tags || []
    };
    
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return undefined;
    
    const updatedTask = { ...this.tasks[taskIndex], ...taskUpdate };
    this.tasks[taskIndex] = updatedTask;
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return false;
    
    this.tasks.splice(taskIndex, 1);
    return true;
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return this.tasks.filter(task => task.status === status);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return this.tasks.filter(task => task.projectId === projectId);
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    return this.tasks.filter(task => task.priority === priority);
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.find(project => project.id === id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projects.length > 0 ? Math.max(...this.projects.map(p => p.id)) + 1 : 1;
    const newProject: Project = {
      ...project,
      id,
      description: project.description || null,
      color: project.color || '#6366f1'
    };
    
    this.projects.push(newProject);
    console.log("Created project in memory:", newProject);
    return newProject;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return undefined;
    
    const updatedProject = { ...this.projects[projectIndex], ...projectUpdate };
    this.projects[projectIndex] = updatedProject;
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) return false;
    
    this.projects.splice(projectIndex, 1);
    return true;
  }
  
  // Pomodoro operations
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return this.pomodoroSessions;
  }

  async getPomodoroSession(id: number): Promise<PomodoroSession | undefined> {
    return this.pomodoroSessions.find(session => session.id === id);
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = this.pomodoroSessions.length > 0 ? Math.max(...this.pomodoroSessions.map(s => s.id)) + 1 : 1;
    const newSession: PomodoroSession = { 
      ...session, 
      id,
      completed: false,
      endTime: null 
    };
    
    this.pomodoroSessions.push(newSession);
    return newSession;
  }

  async updatePomodoroSession(id: number, sessionUpdate: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const sessionIndex = this.pomodoroSessions.findIndex(session => session.id === id);
    if (sessionIndex === -1) return undefined;
    
    // If we're marking as completed, set the end time
    if (sessionUpdate.completed && !this.pomodoroSessions[sessionIndex].completed) {
      sessionUpdate.endTime = new Date();
    }
    
    const updatedSession = { ...this.pomodoroSessions[sessionIndex], ...sessionUpdate };
    this.pomodoroSessions[sessionIndex] = updatedSession;
    
    return updatedSession;
  }

  async getSessionsByTask(taskId: number): Promise<PomodoroSession[]> {
    return this.pomodoroSessions.filter(session => session.taskId === taskId);
  }
  
  // Goal operations
  async getGoals(): Promise<Goal[]> {
    return this.goals;
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.find(goal => goal.id === id);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goals.length > 0 ? Math.max(...this.goals.map(g => g.id)) + 1 : 1;
    const newGoal: Goal = { 
      ...goal, 
      id,
      completed: goal.completed !== undefined ? goal.completed : false,
      progress: goal.progress !== undefined ? goal.progress : 0,
      description: goal.description || null,
      specific: goal.specific || null,
      measurable: goal.measurable || null,
      achievable: goal.achievable || null,
      relevant: goal.relevant || null,
      timeBound: goal.timeBound || null
    };
    
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const goalIndex = this.goals.findIndex(goal => goal.id === id);
    if (goalIndex === -1) return undefined;
    
    const updatedGoal = { ...this.goals[goalIndex], ...goalUpdate };
    this.goals[goalIndex] = updatedGoal;
    
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const goalIndex = this.goals.findIndex(goal => goal.id === id);
    if (goalIndex === -1) return false;
    
    this.goals.splice(goalIndex, 1);
    return true;
  }
  
  // Time block operations
  async getTimeBlocks(): Promise<TimeBlock[]> {
    return this.timeBlocks;
  }

  async getTimeBlock(id: number): Promise<TimeBlock | undefined> {
    return this.timeBlocks.find(timeBlock => timeBlock.id === id);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const id = this.timeBlocks.length > 0 ? Math.max(...this.timeBlocks.map(t => t.id)) + 1 : 1;
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id,
      taskId: timeBlock.taskId || null,
      color: timeBlock.color || '#6366f1'
    };
    
    this.timeBlocks.push(newTimeBlock);
    return newTimeBlock;
  }

  async updateTimeBlock(id: number, timeBlockUpdate: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const timeBlockIndex = this.timeBlocks.findIndex(timeBlock => timeBlock.id === id);
    if (timeBlockIndex === -1) return undefined;
    
    const updatedTimeBlock = { ...this.timeBlocks[timeBlockIndex], ...timeBlockUpdate };
    this.timeBlocks[timeBlockIndex] = updatedTimeBlock;
    
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<boolean> {
    const timeBlockIndex = this.timeBlocks.findIndex(timeBlock => timeBlock.id === id);
    if (timeBlockIndex === -1) return false;
    
    this.timeBlocks.splice(timeBlockIndex, 1);
    return true;
  }

  async getTimeBlocksByDay(date: Date): Promise<TimeBlock[]> {
    return this.timeBlocks.filter(block => {
      const blockDate = block.startTime;
      return (
        blockDate.getFullYear() === date.getFullYear() &&
        blockDate.getMonth() === date.getMonth() &&
        blockDate.getDate() === date.getDate()
      );
    });
  }
  
  // User operations
  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: Omit<InsertUser, 'confirmPassword'> & { password: string }): Promise<User> {
    // Check if user already exists
    const existingEmail = await this.getUserByEmail(user.email);
    if (existingEmail) {
      throw new Error('User with this email already exists');
    }
    
    const existingUsername = await this.getUserByUsername(user.username);
    if (existingUsername) {
      throw new Error('User with this username already exists');
    }
    
    const id = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    const newUser: User = {
      id,
      name: user.name,
      email: user.email,
      username: user.username,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      avatar: user.avatar || null,
      role: user.role || "user",
      lastLogin: null,
      firebaseUid: user.firebaseUid || null
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, userUpdate: Partial<User> & { password?: string }): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    // Handle password update if provided
    if (userUpdate.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userUpdate.password, saltRounds);
      
      // Replace password with passwordHash in the update
      const { password, ...restUpdate } = userUpdate;
      userUpdate = { ...restUpdate, passwordHash };
    }
    
    const updatedUser = { ...this.users[userIndex], ...userUpdate };
    this.users[userIndex] = updatedUser;
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  async verifyUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.passwordHash) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;
    
    return user;
  }
  
  // Team operations
  async getTeams(): Promise<Team[]> {
    return this.teams;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.find(team => team.id === id);
  }

  async createTeam(team: InsertTeam, createdById: number): Promise<Team> {
    const id = this.teams.length > 0 ? Math.max(...this.teams.map(t => t.id)) + 1 : 1;
    const newTeam: Team = {
      ...team,
      id,
      createdById,
      createdAt: new Date(),
      description: team.description || null,
      avatar: team.avatar || null
    };
    
    this.teams.push(newTeam);
    return newTeam;
  }

  async updateTeam(id: number, teamUpdate: Partial<Team>): Promise<Team | undefined> {
    const teamIndex = this.teams.findIndex(team => team.id === id);
    if (teamIndex === -1) return undefined;
    
    const updatedTeam = { ...this.teams[teamIndex], ...teamUpdate };
    this.teams[teamIndex] = updatedTeam;
    
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    const teamIndex = this.teams.findIndex(team => team.id === id);
    if (teamIndex === -1) return false;
    
    this.teams.splice(teamIndex, 1);
    return true;
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    const teamMemberships = this.teamMembers.filter(member => member.userId === userId);
    const teamIds = teamMemberships.map(membership => membership.teamId);
    return this.teams.filter(team => teamIds.includes(team.id));
  }
  
  // Team Member operations
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return this.teamMembers.filter(member => member.teamId === teamId);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.find(member => member.id === id);
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMembers.length > 0 ? Math.max(...this.teamMembers.map(t => t.id)) + 1 : 1;
    const newTeamMember: TeamMember = {
      ...teamMember,
      id,
      role: teamMember.role || 'member',
      joinedAt: new Date()
    };
    
    this.teamMembers.push(newTeamMember);
    return newTeamMember;
  }

  async removeTeamMember(id: number): Promise<boolean> {
    const memberIndex = this.teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return false;
    
    this.teamMembers.splice(memberIndex, 1);
    return true;
  }

  async updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined> {
    const memberIndex = this.teamMembers.findIndex(member => member.id === id);
    if (memberIndex === -1) return undefined;
    
    const updatedMember = { ...this.teamMembers[memberIndex], role };
    this.teamMembers[memberIndex] = updatedMember;
    
    return updatedMember;
  }

  async getTeamMembershipByUser(userId: number): Promise<TeamMember[]> {
    return this.teamMembers.filter(member => member.userId === userId);
  }
  
  // Collaborative Project operations
  async getCollaborativeProjects(teamId: number): Promise<CollaborativeProject[]> {
    return this.collaborativeProjects.filter(project => project.teamId === teamId);
  }

  async getCollaborativeProject(id: number): Promise<CollaborativeProject | undefined> {
    return this.collaborativeProjects.find(project => project.id === id);
  }

  async shareProject(collaborativeProject: InsertCollaborativeProject): Promise<CollaborativeProject> {
    const id = this.collaborativeProjects.length > 0 ? Math.max(...this.collaborativeProjects.map(c => c.id)) + 1 : 1;
    const newCollaborativeProject: CollaborativeProject = {
      id,
      projectId: collaborativeProject.projectId,
      teamId: collaborativeProject.teamId,
      sharedAt: new Date()
    };
    
    this.collaborativeProjects.push(newCollaborativeProject);
    return newCollaborativeProject;
  }

  async unshareProject(id: number): Promise<boolean> {
    const projectIndex = this.collaborativeProjects.findIndex(project => project.id === id);
    if (projectIndex === -1) return false;
    
    this.collaborativeProjects.splice(projectIndex, 1);
    return true;
  }

  async getProjectsByTeam(teamId: number): Promise<Project[]> {
    const collaborativeProjects = this.collaborativeProjects.filter(cp => cp.teamId === teamId);
    const projectIds = collaborativeProjects.map(cp => cp.projectId);
    return this.projects.filter(project => projectIds.includes(project.id));
  }
  
  // Task Assignment operations
  async getTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    return this.taskAssignments.filter(assignment => assignment.taskId === taskId);
  }

  async getTaskAssignment(id: number): Promise<TaskAssignment | undefined> {
    return this.taskAssignments.find(assignment => assignment.id === id);
  }

  async assignTask(taskAssignment: InsertTaskAssignment): Promise<TaskAssignment> {
    const id = this.taskAssignments.length > 0 ? Math.max(...this.taskAssignments.map(a => a.id)) + 1 : 1;
    const newTaskAssignment: TaskAssignment = {
      ...taskAssignment,
      id,
      status: 'pending',
      assignedAt: new Date()
    };
    
    this.taskAssignments.push(newTaskAssignment);
    return newTaskAssignment;
  }

  async unassignTask(id: number): Promise<boolean> {
    const assignmentIndex = this.taskAssignments.findIndex(assignment => assignment.id === id);
    if (assignmentIndex === -1) return false;
    
    this.taskAssignments.splice(assignmentIndex, 1);
    return true;
  }

  async updateTaskAssignmentStatus(id: number, status: string): Promise<TaskAssignment | undefined> {
    const assignmentIndex = this.taskAssignments.findIndex(assignment => assignment.id === id);
    if (assignmentIndex === -1) return undefined;
    
    const updatedAssignment = { ...this.taskAssignments[assignmentIndex], status };
    this.taskAssignments[assignmentIndex] = updatedAssignment;
    
    return updatedAssignment;
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    const assignments = this.taskAssignments.filter(assignment => assignment.userId === userId);
    const taskIds = assignments.map(assignment => assignment.taskId);
    return this.tasks.filter(task => taskIds.includes(task.id));
  }
  
  // Activity Log operations
  async getActivityLogs(teamId?: number): Promise<ActivityLog[]> {
    if (teamId) {
      return this.activityLogs.filter(log => log.teamId === teamId);
    }
    return this.activityLogs;
  }

  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    return this.activityLogs.find(log => log.id === id);
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogs.length > 0 ? Math.max(...this.activityLogs.map(a => a.id)) + 1 : 1;
    const newActivityLog: ActivityLog = {
      ...activityLog,
      id,
      createdAt: new Date(),
      teamId: activityLog.teamId || null,
      projectId: activityLog.projectId || null,
      taskId: activityLog.taskId || null,
      details: activityLog.details || null
    };
    
    this.activityLogs.push(newActivityLog);
    return newActivityLog;
  }

  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return this.activityLogs.filter(log => log.userId === userId);
  }

  async getActivityLogsByProject(projectId: number): Promise<ActivityLog[]> {
    return this.activityLogs.filter(log => log.projectId === projectId);
  }

  async getActivityLogsByTask(taskId: number): Promise<ActivityLog[]> {
    return this.activityLogs.filter(log => log.taskId === taskId);
  }
}