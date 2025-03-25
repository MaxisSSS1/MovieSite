import express, { type Express, Request, Response } from "express";
import { Server, createServer } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertUserSchema,
  insertMovieSchema,
  insertUserProgressSchema,
  insertScheduledViewingSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // Authentication placeholder route
  router.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would generate a JWT token here
      return res.json({ 
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          level: user.level,
          xp: user.xp,
          title: user.title
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      return res.status(201).json({ 
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          level: user.level,
          xp: user.xp,
          title: user.title
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User routes
  router.get("/api/users/current", async (req: Request, res: Response) => {
    // For demo purposes, we'll return the first user
    const user = await storage.getUser(1);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ 
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
        level: user.level,
        xp: user.xp,
        title: user.title
      }
    });
  });
  
  // Movie routes
  router.get("/api/movies", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const movies = await storage.getMovies(limit, offset);
    
    return res.json({ movies });
  });
  
  router.get("/api/movies/featured", async (req: Request, res: Response) => {
    const movie = await storage.getFeaturedMovie();
    
    if (!movie) {
      return res.status(404).json({ message: "No featured movie found" });
    }
    
    return res.json({ movie });
  });
  
  router.get("/api/movies/trending", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const movies = await storage.getTrendingMovies(limit);
    
    return res.json({ movies });
  });
  
  router.get("/api/movies/:id", async (req: Request, res: Response) => {
    const movieId = parseInt(req.params.id);
    
    const movie = await storage.getMovie(movieId);
    
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    
    const cast = await storage.getCastForMovie(movieId);
    
    return res.json({ movie, cast });
  });
  
  // User progress routes
  router.get("/api/progress/continue-watching", async (req: Request, res: Response) => {
    // For demo purposes, we'll use the first user
    const userId = 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
    
    const continueWatching = await storage.getUserContinueWatching(userId, limit);
    
    return res.json({ continueWatching });
  });
  
  router.post("/api/progress/update", async (req: Request, res: Response) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      
      const progress = await storage.updateUserProgress(
        progressData.userId,
        progressData.movieId,
        progressData.progress
      );
      
      return res.json({ progress });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Update progress error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Schedule routes
  router.get("/api/schedule", async (req: Request, res: Response) => {
    // For demo purposes, we'll use the first user
    const userId = 1;
    
    let date: Date | undefined;
    if (req.query.date) {
      date = new Date(req.query.date as string);
    }
    
    const scheduledViewings = await storage.getScheduledViewings(userId, date);
    
    return res.json({ scheduledViewings });
  });
  
  router.post("/api/schedule", async (req: Request, res: Response) => {
    try {
      const scheduleData = insertScheduledViewingSchema.parse(req.body);
      
      const scheduledViewing = await storage.createScheduledViewing(scheduleData);
      
      return res.status(201).json({ scheduledViewing });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Schedule viewing error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Shared viewing routes
  router.get("/api/shared-viewings", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const sharedViewings = await storage.getSharedViewings(limit);
    
    return res.json({ sharedViewings });
  });
  
  // Achievement routes
  router.get("/api/achievements", async (req: Request, res: Response) => {
    const achievements = await storage.getAchievements();
    
    return res.json({ achievements });
  });
  
  router.get("/api/achievements/user", async (req: Request, res: Response) => {
    // For demo purposes, we'll use the first user
    const userId = 1;
    
    const userAchievements = await storage.getUserAchievements(userId);
    
    return res.json({ userAchievements });
  });
  
  router.post("/api/achievements/unlock/:id", async (req: Request, res: Response) => {
    try {
      // For demo purposes, we'll use the first user
      const userId = 1;
      const achievementId = parseInt(req.params.id);
      
      const userAchievement = await storage.unlockAchievement(userId, achievementId);
      
      return res.json({ userAchievement });
    } catch (error) {
      console.error("Unlock achievement error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mood routes
  router.get("/api/moods", async (req: Request, res: Response) => {
    const moods = await storage.getMoods();
    
    return res.json({ moods });
  });
  
  router.get("/api/moods/:id/recommendations", async (req: Request, res: Response) => {
    const moodId = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    try {
      const recommendations = await storage.getMoodBasedRecommendations(moodId, limit);
      
      return res.json({ recommendations });
    } catch (error) {
      console.error("Mood recommendations error:", error);
      return res.status(404).json({ message: "Mood not found" });
    }
  });
  
  // Register all routes with prefix
  app.use(router);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
