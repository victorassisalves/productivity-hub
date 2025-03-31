import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id),
  status: text("status").notNull().default("todo"), // "todo", "in_progress", "completed"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0), // 0-100
  timeEstimate: integer("time_estimate"),  // in minutes
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Pomodoro session schema
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull(), // in minutes
  completed: boolean("completed").default(false),
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  endTime: true,
  completed: true,
});

// Goal schema (for SMART goals)
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  specific: text("specific"),
  measurable: text("measurable"),
  achievable: text("achievable"),
  relevant: text("relevant"),
  timeBound: text("time_bound"),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0), // 0-100
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
});

// Time block schema
export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  color: text("color"),
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar"),
  role: text("role").default("user"), // "user", "admin"
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
}, (table) => {
  return {
    emailIdx: uniqueIndex("email_idx").on(table.email),
    usernameIdx: uniqueIndex("username_idx").on(table.username),
  };
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Team schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdById: true,
  createdAt: true,
});

// Team Member schema (users in teams)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("member"), // "owner", "admin", "member"
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

// Update Project schema to include team ownership
export const collaborativeProjects = pgTable("collaborative_projects", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
});

export const insertCollaborativeProjectSchema = createInsertSchema(collaborativeProjects).omit({
  id: true,
  sharedAt: true,
});

// Task Assignment schema
export const taskAssignments = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  assignedById: integer("assigned_by_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  status: text("status").default("pending"), // "pending", "accepted", "declined", "completed"
});

export const insertTaskAssignmentSchema = createInsertSchema(taskAssignments).omit({
  id: true,
  assignedAt: true,
});

// Collaboration activity feed
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teamId: integer("team_id").references(() => teams.id),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  action: text("action").notNull(), // "created", "updated", "deleted", "completed", "assigned", etc.
  details: json("details"), // Additional details about the action
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type CollaborativeProject = typeof collaborativeProjects.$inferSelect;
export type InsertCollaborativeProject = z.infer<typeof insertCollaborativeProjectSchema>;

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = z.infer<typeof insertTaskAssignmentSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
