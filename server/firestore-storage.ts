import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { compareDesc } from 'date-fns';
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
import bcrypt from 'bcrypt';

export class FirestoreStorage implements IStorage {
  // Helper functions for Firestore
  private async getCollectionData<T>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as unknown as T;
    });
  }

  private async getDocumentData<T>(collectionName: string, id: number): Promise<T | undefined> {
    const docRef = doc(db, collectionName, id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return undefined;
    
    const data = docSnap.data();
    
    // Convert Firestore timestamps to Date objects
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Timestamp) {
        data[key] = value.toDate();
      }
    });

    return {
      id,
      ...data
    } as unknown as T;
  }

  private convertDatesToTimestamp(data: any): any {
    const result = { ...data };
    
    Object.entries(result).forEach(([key, value]) => {
      if (value instanceof Date) {
        result[key] = Timestamp.fromDate(value);
      }
    });
    
    return result;
  }

  private async getNextId(collectionName: string): Promise<number> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const ids = querySnapshot.docs.map(doc => parseInt(doc.id, 10) || 0);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return this.getCollectionData<Task>('tasks');
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.getDocumentData<Task>('tasks', id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = await this.getNextId('tasks');
    const newTask: Task = { 
      ...task, 
      id,
      createdAt: new Date(),
      completed: task.completed !== undefined ? task.completed : false,
      progress: task.progress !== undefined ? task.progress : 0,
      status: task.status || 'to-do',
      priority: task.priority || 'medium',
      tags: task.tags || []
    };
    
    await setDoc(
      doc(db, 'tasks', id.toString()), 
      this.convertDatesToTimestamp(newTask)
    );
    
    return newTask;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    await updateDoc(
      doc(db, 'tasks', id.toString()), 
      this.convertDatesToTimestamp(taskUpdate)
    );
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'tasks', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return false;
    }
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const q = query(collection(db, 'tasks'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as Task;
    });
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    const q = query(collection(db, 'tasks'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as Task;
    });
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const q = query(collection(db, 'tasks'), where('priority', '==', priority));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as Task;
    });
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return this.getCollectionData<Project>('projects');
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.getDocumentData<Project>('projects', id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = await this.getNextId('projects');
    const newProject: Project = {
      ...project,
      id,
      description: project.description || null,
      color: project.color || '#6366f1'
    };
    
    await setDoc(
      doc(db, 'projects', id.toString()), 
      this.convertDatesToTimestamp(newProject)
    );
    
    return newProject;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project | undefined> {
    const project = await this.getProject(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdate };
    await updateDoc(
      doc(db, 'projects', id.toString()), 
      this.convertDatesToTimestamp(projectUpdate)
    );
    
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'projects', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }
  
  // Pomodoro operations
  async getPomodoroSessions(): Promise<PomodoroSession[]> {
    return this.getCollectionData<PomodoroSession>('pomodoro_sessions');
  }

  async getPomodoroSession(id: number): Promise<PomodoroSession | undefined> {
    return this.getDocumentData<PomodoroSession>('pomodoro_sessions', id);
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const id = await this.getNextId('pomodoro_sessions');
    const newSession: PomodoroSession = { 
      ...session, 
      id,
      completed: session.completed !== undefined ? session.completed : false,
      endTime: session.completed ? new Date() : null 
    };
    
    await setDoc(
      doc(db, 'pomodoro_sessions', id.toString()), 
      this.convertDatesToTimestamp(newSession)
    );
    
    return newSession;
  }

  async updatePomodoroSession(id: number, sessionUpdate: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const session = await this.getPomodoroSession(id);
    if (!session) return undefined;
    
    // If we're marking as completed, set the end time
    if (sessionUpdate.completed && !session.completed) {
      sessionUpdate.endTime = new Date();
    }
    
    const updatedSession = { ...session, ...sessionUpdate };
    await updateDoc(
      doc(db, 'pomodoro_sessions', id.toString()), 
      this.convertDatesToTimestamp(sessionUpdate)
    );
    
    return updatedSession;
  }

  async getSessionsByTask(taskId: number): Promise<PomodoroSession[]> {
    const q = query(collection(db, 'pomodoro_sessions'), where('taskId', '==', taskId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as PomodoroSession;
    });
  }
  
  // Goal operations
  async getGoals(): Promise<Goal[]> {
    return this.getCollectionData<Goal>('goals');
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.getDocumentData<Goal>('goals', id);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = await this.getNextId('goals');
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
    
    await setDoc(
      doc(db, 'goals', id.toString()), 
      this.convertDatesToTimestamp(newGoal)
    );
    
    return newGoal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const goal = await this.getGoal(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    await updateDoc(
      doc(db, 'goals', id.toString()), 
      this.convertDatesToTimestamp(goalUpdate)
    );
    
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'goals', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting goal ${id}:`, error);
      return false;
    }
  }
  
  // Time block operations
  async getTimeBlocks(): Promise<TimeBlock[]> {
    return this.getCollectionData<TimeBlock>('time_blocks');
  }

  async getTimeBlock(id: number): Promise<TimeBlock | undefined> {
    return this.getDocumentData<TimeBlock>('time_blocks', id);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const id = await this.getNextId('time_blocks');
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id,
      color: timeBlock.color || '#6366f1'
    };
    
    await setDoc(
      doc(db, 'time_blocks', id.toString()), 
      this.convertDatesToTimestamp(newTimeBlock)
    );
    
    return newTimeBlock;
  }

  async updateTimeBlock(id: number, timeBlockUpdate: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const timeBlock = await this.getTimeBlock(id);
    if (!timeBlock) return undefined;
    
    const updatedTimeBlock = { ...timeBlock, ...timeBlockUpdate };
    await updateDoc(
      doc(db, 'time_blocks', id.toString()), 
      this.convertDatesToTimestamp(timeBlockUpdate)
    );
    
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'time_blocks', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting time block ${id}:`, error);
      return false;
    }
  }

  async getTimeBlocksByDay(date: Date): Promise<TimeBlock[]> {
    // Get all time blocks first (for simplicity; in a production app, we'd need a more efficient query)
    const timeBlocks = await this.getTimeBlocks();
    
    // Check if the block is on the specified date
    return timeBlocks.filter(block => {
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
    return this.getCollectionData<User>('users');
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.getDocumentData<User>('users', id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return undefined;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Convert Firestore timestamps to Date objects
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Timestamp) {
        data[key] = value.toDate();
      }
    });
    
    return {
      id: parseInt(doc.id, 10),
      ...data
    } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return undefined;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Convert Firestore timestamps to Date objects
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof Timestamp) {
        data[key] = value.toDate();
      }
    });
    
    return {
      id: parseInt(doc.id, 10),
      ...data
    } as User;
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
    
    const id = await this.getNextId('users');
    
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
      lastLogin: null
    };
    
    // Store user in Firestore
    await setDoc(
      doc(db, 'users', id.toString()),
      this.convertDatesToTimestamp(newUser)
    );
    
    return newUser;
  }

  async updateUser(id: number, userUpdate: Partial<User> & { password?: string }): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Handle password update if provided
    if (userUpdate.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userUpdate.password, saltRounds);
      
      // Replace password with passwordHash in the update
      const { password, ...restUpdate } = userUpdate;
      userUpdate = { ...restUpdate, passwordHash };
    }
    
    const updatedUser = { ...user, ...userUpdate };
    await updateDoc(
      doc(db, 'users', id.toString()), 
      this.convertDatesToTimestamp(userUpdate)
    );
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'users', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
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
    return this.getCollectionData<Team>('teams');
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.getDocumentData<Team>('teams', id);
  }

  async createTeam(team: InsertTeam, createdById: number): Promise<Team> {
    const id = await this.getNextId('teams');
    const newTeam: Team = {
      id,
      name: team.name,
      createdById,
      createdAt: new Date(),
      description: team.description || null,
      avatar: team.avatar || null
    };
    
    await setDoc(
      doc(db, 'teams', id.toString()),
      this.convertDatesToTimestamp(newTeam)
    );
    
    // Automatically add the creator as team admin
    await this.addTeamMember({
      teamId: id,
      userId: createdById,
      role: 'admin',
      joinedAt: new Date()
    });
    
    return newTeam;
  }

  async updateTeam(id: number, teamUpdate: Partial<Team>): Promise<Team | undefined> {
    const team = await this.getTeam(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...teamUpdate };
    await updateDoc(
      doc(db, 'teams', id.toString()), 
      this.convertDatesToTimestamp(teamUpdate)
    );
    
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    try {
      // First delete all team members
      const members = await this.getTeamMembers(id);
      for (const member of members) {
        await this.removeTeamMember(member.id);
      }
      
      // Then delete the team
      await deleteDoc(doc(db, 'teams', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      return false;
    }
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    // Get team membership for the user
    const memberships = await this.getTeamMembershipByUser(userId);
    
    // Get team details for each membership
    const teams: Team[] = [];
    for (const membership of memberships) {
      const team = await this.getTeam(membership.teamId);
      if (team) {
        teams.push(team);
      }
    }
    
    return teams;
  }
  
  // Team member operations
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const q = query(collection(db, 'team_members'), where('teamId', '==', teamId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as TeamMember;
    });
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.getDocumentData<TeamMember>('team_members', id);
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = await this.getNextId('team_members');
    const newTeamMember: TeamMember = {
      id,
      teamId: teamMember.teamId,
      userId: teamMember.userId,
      joinedAt: teamMember.joinedAt || new Date(),
      role: teamMember.role || 'member'
    };
    
    await setDoc(
      doc(db, 'team_members', id.toString()),
      this.convertDatesToTimestamp(newTeamMember)
    );
    
    return newTeamMember;
  }

  async removeTeamMember(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'team_members', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error removing team member ${id}:`, error);
      return false;
    }
  }

  async updateTeamMemberRole(id: number, role: string): Promise<TeamMember | undefined> {
    const teamMember = await this.getTeamMember(id);
    if (!teamMember) return undefined;
    
    const updatedTeamMember = { ...teamMember, role };
    await updateDoc(
      doc(db, 'team_members', id.toString()),
      { role }
    );
    
    return updatedTeamMember;
  }

  async getTeamMembershipByUser(userId: number): Promise<TeamMember[]> {
    const q = query(collection(db, 'team_members'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as TeamMember;
    });
  }
  
  // Collaborative project operations
  async getCollaborativeProjects(teamId: number): Promise<CollaborativeProject[]> {
    const q = query(collection(db, 'collaborative_projects'), where('teamId', '==', teamId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as CollaborativeProject;
    });
  }

  async getCollaborativeProject(id: number): Promise<CollaborativeProject | undefined> {
    return this.getDocumentData<CollaborativeProject>('collaborative_projects', id);
  }

  async shareProject(collaborativeProject: InsertCollaborativeProject): Promise<CollaborativeProject> {
    const id = await this.getNextId('collaborative_projects');
    const newCollaborativeProject: CollaborativeProject = {
      id,
      projectId: collaborativeProject.projectId,
      teamId: collaborativeProject.teamId,
      sharedById: collaborativeProject.sharedById,
      sharedAt: new Date(),
      permissions: collaborativeProject.permissions || 'read'
    };
    
    await setDoc(
      doc(db, 'collaborative_projects', id.toString()),
      this.convertDatesToTimestamp(newCollaborativeProject)
    );
    
    return newCollaborativeProject;
  }

  async unshareProject(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'collaborative_projects', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error unsharing project ${id}:`, error);
      return false;
    }
  }

  async getProjectsByTeam(teamId: number): Promise<Project[]> {
    const collaborativeProjects = await this.getCollaborativeProjects(teamId);
    
    // Get project details for each collaborative project
    const projects: Project[] = [];
    for (const collab of collaborativeProjects) {
      const project = await this.getProject(collab.projectId);
      if (project) {
        projects.push(project);
      }
    }
    
    return projects;
  }
  
  // Task assignment operations
  async getTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    const q = query(collection(db, 'task_assignments'), where('taskId', '==', taskId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as TaskAssignment;
    });
  }

  async getTaskAssignment(id: number): Promise<TaskAssignment | undefined> {
    return this.getDocumentData<TaskAssignment>('task_assignments', id);
  }

  async assignTask(taskAssignment: InsertTaskAssignment): Promise<TaskAssignment> {
    const id = await this.getNextId('task_assignments');
    const newTaskAssignment: TaskAssignment = {
      id,
      taskId: taskAssignment.taskId,
      userId: taskAssignment.userId,
      assignedById: taskAssignment.assignedById,
      assignedAt: new Date(),
      status: taskAssignment.status || 'pending'
    };
    
    await setDoc(
      doc(db, 'task_assignments', id.toString()),
      this.convertDatesToTimestamp(newTaskAssignment)
    );
    
    return newTaskAssignment;
  }

  async unassignTask(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'task_assignments', id.toString()));
      return true;
    } catch (error) {
      console.error(`Error unassigning task ${id}:`, error);
      return false;
    }
  }

  async updateTaskAssignmentStatus(id: number, status: string): Promise<TaskAssignment | undefined> {
    const taskAssignment = await this.getTaskAssignment(id);
    if (!taskAssignment) return undefined;
    
    const updatedTaskAssignment = { ...taskAssignment, status };
    await updateDoc(
      doc(db, 'task_assignments', id.toString()),
      { status }
    );
    
    return updatedTaskAssignment;
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    const q = query(collection(db, 'task_assignments'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const taskIds = querySnapshot.docs.map(doc => doc.data().taskId);
    const tasks: Task[] = [];
    
    for (const taskId of taskIds) {
      const task = await this.getTask(taskId);
      if (task) {
        tasks.push(task);
      }
    }
    
    return tasks;
  }
  
  // Activity log operations
  async getActivityLogs(teamId?: number): Promise<ActivityLog[]> {
    if (teamId) {
      const q = query(collection(db, 'activity_logs'), where('teamId', '==', teamId));
      const querySnapshot = await getDocs(q);
      
      const logs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamps to Date objects
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof Timestamp) {
            data[key] = value.toDate();
          }
        });
        
        return {
          id: parseInt(doc.id, 10),
          ...data
        } as ActivityLog;
      });
      
      // Sort logs by creation date, newest first
      return logs.sort((a, b) => 
        compareDesc(a.createdAt, b.createdAt)
      );
    } else {
      const logs = await this.getCollectionData<ActivityLog>('activity_logs');
      
      // Sort logs by creation date, newest first
      return logs.sort((a, b) => 
        compareDesc(a.createdAt, b.createdAt)
      );
    }
  }

  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    return this.getDocumentData<ActivityLog>('activity_logs', id);
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = await this.getNextId('activity_logs');
    const newActivityLog: ActivityLog = {
      id,
      action: activityLog.action,
      userId: activityLog.userId,
      createdAt: new Date(),
      details: activityLog.details || {},
      projectId: activityLog.projectId || null,
      taskId: activityLog.taskId || null,
      teamId: activityLog.teamId || null
    };
    
    await setDoc(
      doc(db, 'activity_logs', id.toString()),
      this.convertDatesToTimestamp(newActivityLog)
    );
    
    return newActivityLog;
  }

  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    const q = query(collection(db, 'activity_logs'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const logs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as ActivityLog;
    });
    
    // Sort logs by creation date, newest first
    return logs.sort((a, b) => 
      compareDesc(a.createdAt, b.createdAt)
    );
  }

  async getActivityLogsByProject(projectId: number): Promise<ActivityLog[]> {
    const q = query(collection(db, 'activity_logs'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    
    const logs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as ActivityLog;
    });
    
    // Sort logs by creation date, newest first
    return logs.sort((a, b) => 
      compareDesc(a.createdAt, b.createdAt)
    );
  }

  async getActivityLogsByTask(taskId: number): Promise<ActivityLog[]> {
    const q = query(collection(db, 'activity_logs'), where('taskId', '==', taskId));
    const querySnapshot = await getDocs(q);
    
    const logs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Timestamp) {
          data[key] = value.toDate();
        }
      });
      
      return {
        id: parseInt(doc.id, 10),
        ...data
      } as ActivityLog;
    });
    
    // Sort logs by creation date, newest first
    return logs.sort((a, b) => 
      compareDesc(a.createdAt, b.createdAt)
    );
  }
}