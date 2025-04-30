import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  profileImage: text("profile_image"),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  title: text("title").default("Movie Enthusiast").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  level: true, 
  xp: true, 
  createdAt: true 
});

// Movies table
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  releaseYear: integer("release_year").notNull(),
  duration: integer("duration").notNull(), // in minutes
  genres: text("genres").array().notNull(),
  rating: text("rating").notNull(), // PG, PG-13, R, etc.
  posterImage: text("poster_image").notNull(),
  bannerImage: text("banner_image").notNull(),
  score: integer("score").default(0).notNull(), // 0-100 score
  reviewCount: integer("review_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMovieSchema = createInsertSchema(movies).omit({ 
  id: true, 
  createdAt: true 
});

// Cast members table
export const castMembers = pgTable("cast_members", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  image: text("image").notNull(),
});

export const insertCastMemberSchema = createInsertSchema(castMembers).omit({ 
  id: true 
});

// User progress table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  progress: integer("progress").default(0).notNull(), // in seconds
  completed: boolean("completed").default(false).notNull(),
  lastWatched: timestamp("last_watched").defaultNow().notNull(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ 
  id: true, 
  lastWatched: true 
});

// Scheduled viewings table
export const scheduledViewings = pgTable("scheduled_viewings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  isShared: boolean("is_shared").default(false).notNull(),
  title: text("title"),
  participants: integer("participants").array(),
});

export const insertScheduledViewingSchema = createInsertSchema(scheduledViewings, {
  scheduledFor: z.preprocess(
    (val) => (typeof val === "string" || val instanceof Date) ? new Date(val) : val,
    z.date()
  )
}).omit({ 
  id: true 
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  isLocked: boolean("is_locked").default(true).notNull(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true 
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  earnedAt: true 
});

// Moods for recommendations
export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  genrePreferences: text("genre_preferences").array().notNull(),
});

export const insertMoodSchema = createInsertSchema(moods).omit({ 
  id: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type CastMember = typeof castMembers.$inferSelect;
export type InsertCastMember = z.infer<typeof insertCastMemberSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type ScheduledViewing = typeof scheduledViewings.$inferSelect;
export type InsertScheduledViewing = z.infer<typeof insertScheduledViewingSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Mood = typeof moods.$inferSelect;
export type InsertMood = z.infer<typeof insertMoodSchema>;
