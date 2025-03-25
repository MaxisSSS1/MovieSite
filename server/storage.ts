import {
  User, InsertUser,
  Movie, InsertMovie,
  CastMember, InsertCastMember,
  UserProgress, InsertUserProgress,
  ScheduledViewing, InsertScheduledViewing, 
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  Mood, InsertMood
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: number, xpAmount: number): Promise<User>;
  
  // Movie operations
  getMovie(id: number): Promise<Movie | undefined>;
  getMovies(limit?: number, offset?: number): Promise<Movie[]>;
  getFeaturedMovie(): Promise<Movie | undefined>;
  getTrendingMovies(limit?: number): Promise<Movie[]>;
  getMoviesByGenres(genres: string[], limit?: number): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Cast operations
  getCastForMovie(movieId: number): Promise<CastMember[]>;
  createCastMember(castMember: InsertCastMember): Promise<CastMember>;
  
  // User progress operations
  getUserProgress(userId: number, movieId: number): Promise<UserProgress | undefined>;
  getUserContinueWatching(userId: number, limit?: number): Promise<(UserProgress & { movie: Movie })[]>;
  updateUserProgress(userId: number, movieId: number, progress: number): Promise<UserProgress>;
  createUserProgress(userProgress: InsertUserProgress): Promise<UserProgress>;
  
  // Scheduled viewing operations
  getScheduledViewings(userId: number, date?: Date): Promise<(ScheduledViewing & { movie: Movie })[]>;
  createScheduledViewing(scheduledViewing: InsertScheduledViewing): Promise<ScheduledViewing>;
  getSharedViewings(limit?: number): Promise<ScheduledViewing[]>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  
  // Mood operations
  getMoods(): Promise<Mood[]>;
  getMoodBasedRecommendations(moodId: number, limit?: number): Promise<Movie[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private castMembers: Map<number, CastMember>;
  private userProgress: Map<string, UserProgress>; // key: userId-movieId
  private scheduledViewings: Map<number, ScheduledViewing>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<string, UserAchievement>; // key: userId-achievementId
  private moods: Map<number, Mood>;
  
  private currentUserId: number;
  private currentMovieId: number;
  private currentCastMemberId: number;
  private currentUserProgressId: number;
  private currentScheduledViewingId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentMoodId: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.castMembers = new Map();
    this.userProgress = new Map();
    this.scheduledViewings = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.moods = new Map();
    
    this.currentUserId = 1;
    this.currentMovieId = 1;
    this.currentCastMemberId = 1;
    this.currentUserProgressId = 1;
    this.currentScheduledViewingId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentMoodId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed moods
    const moodData: InsertMood[] = [
      { name: "Happy", icon: "ri-emotion-happy-line", genrePreferences: ["Comedy", "Family", "Adventure"] },
      { name: "Sad", icon: "ri-emotion-sad-line", genrePreferences: ["Drama", "Romance"] },
      { name: "Excited", icon: "ri-emotion-laugh-line", genrePreferences: ["Action", "Adventure", "Sci-Fi"] },
      { name: "Relaxed", icon: "ri-emotion-normal-line", genrePreferences: ["Documentary", "Fantasy"] },
      { name: "Scared", icon: "ri-emotion-unhappy-line", genrePreferences: ["Horror", "Thriller"] },
      { name: "Romantic", icon: "ri-heart-line", genrePreferences: ["Romance", "Drama"] }
    ];
    moodData.forEach(mood => this.createMood(mood));
    
    // Seed achievements
    const achievementData: InsertAchievement[] = [
      { name: "Movie Buff", description: "Watch 10 different movies", icon: "ri-film-line", xpReward: 100, isLocked: false },
      { name: "Social Viewer", description: "Join 3 shared viewing sessions", icon: "ri-group-line", xpReward: 150, isLocked: false },
      { name: "Scheduler", description: "Schedule 5 movie viewings", icon: "ri-calendar-check-line", xpReward: 75, isLocked: false },
      { name: "Binge Master", description: "Watch 3 movies in a single day", icon: "ri-time-line", xpReward: 200, isLocked: false },
      { name: "Critic", description: "Rate 10 movies", icon: "ri-star-line", xpReward: 125, isLocked: false },
      { name: "Explorer", description: "Watch movies from 5 different genres", icon: "ri-trophy-line", xpReward: 175, isLocked: true }
    ];
    achievementData.forEach(achievement => this.createAchievement(achievement));
    
    // Seed mock demo user
    this.createUser({
      username: "demo",
      password: "password",
      displayName: "Alex Johnson",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      title: "Movie Enthusiast"
    });
    
    // Update user XP and unlock some achievements
    this.updateUserXP(1, 1250);
    this.unlockAchievement(1, 1);
    this.unlockAchievement(1, 2);
    this.unlockAchievement(1, 3);
    this.unlockAchievement(1, 4);
    this.unlockAchievement(1, 5);
    
    // Seed movies
    const movieData: InsertMovie[] = [
      {
        title: "The Quantum Effect",
        description: "When a physicist discovers a way to manipulate time, she faces the ultimate question: change the past or preserve the future?",
        releaseYear: 2023,
        duration: 142,
        genres: ["Sci-Fi", "Thriller", "Drama"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 87,
        reviewCount: 15423,
        isFeatured: true
      },
      {
        title: "Echoes of Tomorrow",
        description: "A group of friends discover a mysterious device that allows them to communicate with their future selves, with unforeseen consequences.",
        releaseYear: 2022,
        duration: 128,
        genres: ["Sci-Fi", "Drama", "Mystery"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 92,
        reviewCount: 8762,
        isFeatured: false
      },
      {
        title: "Lost in the Cosmos",
        description: "An astronaut stranded on a distant planet must find a way to signal Earth before his oxygen runs out.",
        releaseYear: 2021,
        duration: 115,
        genres: ["Sci-Fi", "Adventure", "Thriller"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 85,
        reviewCount: 12567,
        isFeatured: false
      },
      {
        title: "The Silver Lining",
        description: "After losing everything, a woman discovers that her late grandmother left her a mysterious inheritance that could change her life.",
        releaseYear: 2023,
        duration: 132,
        genres: ["Drama", "Mystery", "Romance"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 89,
        reviewCount: 9632,
        isFeatured: false
      },
      {
        title: "Whispers in the Dark",
        description: "A detective with the ability to hear the last thoughts of murder victims must solve a series of killings while keeping his secret hidden.",
        releaseYear: 2022,
        duration: 118,
        genres: ["Crime", "Thriller", "Mystery"],
        rating: "R",
        posterImage: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 78,
        reviewCount: 7854,
        isFeatured: false
      },
      {
        title: "Eternal Odyssey",
        description: "A journey through different dimensions as a man searches for his lost love across parallel universes.",
        releaseYear: 2022,
        duration: 145,
        genres: ["Action", "Adventure", "Fantasy"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1512070679279-8988d32161be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1512070679279-8988d32161be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 89,
        reviewCount: 11423,
        isFeatured: false
      },
      {
        title: "Midnight Chronicles",
        description: "In a world where shadows have a life of their own, detective Sarah Mitchell must solve a series of mysterious disappearances connected to an ancient curse.",
        releaseYear: 2023,
        duration: 112,
        genres: ["Thriller", "Mystery", "Supernatural"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 92,
        reviewCount: 49800,
        isFeatured: false
      },
      {
        title: "Azure Skies",
        description: "A love story set against the backdrop of a coastal town, where two strangers with complicated pasts find healing in each other.",
        releaseYear: 2023,
        duration: 108,
        genres: ["Drama", "Romance"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 78,
        reviewCount: 8945,
        isFeatured: false
      },
      {
        title: "Crimson Peak",
        description: "A gothic horror tale following a woman who discovers that the mansion she inherited is haunted by the vengeful spirits of its former residents.",
        releaseYear: 2021,
        duration: 124,
        genres: ["Horror", "Fantasy", "Thriller"],
        rating: "R",
        posterImage: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 85,
        reviewCount: 10238,
        isFeatured: false
      },
      {
        title: "Neon Nights",
        description: "In a futuristic city run by artificial intelligence, a hacker uncovers a conspiracy that could bring down the entire system.",
        releaseYear: 2022,
        duration: 138,
        genres: ["Sci-Fi", "Action", "Thriller"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 90,
        reviewCount: 14567,
        isFeatured: false
      },
      {
        title: "The Last Guardian",
        description: "An ancient protector of a sacred forest must face a new threat when modern developers plan to destroy the land for profit.",
        releaseYear: 2023,
        duration: 135,
        genres: ["Action", "Adventure", "Fantasy"],
        rating: "PG-13",
        posterImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 88,
        reviewCount: 9876,
        isFeatured: false
      },
      {
        title: "Starlight Symphony",
        description: "A musician with the ability to hear cosmic frequencies creates music that may be the key to communicating with an alien civilization.",
        releaseYear: 2023,
        duration: 108,
        genres: ["Sci-Fi", "Drama", "Music"],
        rating: "PG",
        posterImage: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=450&h=650&q=80",
        bannerImage: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=500&q=80",
        score: 86,
        reviewCount: 8543,
        isFeatured: false
      }
    ];
    movieData.forEach(movie => this.createMovie(movie));
    
    // Seed cast members for Midnight Chronicles
    const midnightChroniclesCast: InsertCastMember[] = [
      {
        movieId: 7,
        name: "Emma Watson",
        role: "Sarah Mitchell",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
      },
      {
        movieId: 7,
        name: "Tom Hardy",
        role: "Jack Rivers",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
      },
      {
        movieId: 7,
        name: "Michael B. Jordan",
        role: "David Cooper",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
      },
      {
        movieId: 7,
        name: "Zoe Saldana",
        role: "Elena Cruz",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
      },
      {
        movieId: 7,
        name: "Ian McKellen",
        role: "Dr. Harrison",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=80&h=80&q=80"
      }
    ];
    midnightChroniclesCast.forEach(castMember => this.createCastMember(castMember));
    
    // Seed continue watching progress for demo user
    this.createUserProgress({ userId: 1, movieId: 2, progress: 4532, completed: false });
    this.createUserProgress({ userId: 1, movieId: 3, progress: 2538, completed: false });
    this.createUserProgress({ userId: 1, movieId: 4, progress: 6309, completed: false });
    this.createUserProgress({ userId: 1, movieId: 5, progress: 3522, completed: false });
    
    // Seed scheduled viewings
    const now = new Date();
    const today8pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    const today930pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 30, 0);
    
    this.createScheduledViewing({
      userId: 1,
      movieId: 11,
      scheduledFor: today8pm,
      isShared: false,
      title: null,
      participants: []
    });
    
    this.createScheduledViewing({
      userId: 1,
      movieId: 12,
      scheduledFor: today930pm,
      isShared: true,
      title: "Sci-Fi Marathon",
      participants: [2, 3, 4, 5, 6]
    });
    
    this.createScheduledViewing({
      userId: 2,
      movieId: 5,
      scheduledFor: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 21, 30, 0),
      isShared: true,
      title: "Horror Night",
      participants: [1, 3, 4, 5]
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      level: 1, 
      xp: 0, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserXP(userId: number, xpAmount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    user.xp = xpAmount;
    
    // Calculate level based on XP (simplified formula)
    user.level = Math.floor(Math.sqrt(user.xp) / 10) + 1;
    
    this.users.set(userId, user);
    return user;
  }

  // Movie operations
  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMovies(limit: number = 10, offset: number = 0): Promise<Movie[]> {
    return Array.from(this.movies.values())
      .sort((a, b) => b.id - a.id)
      .slice(offset, offset + limit);
  }

  async getFeaturedMovie(): Promise<Movie | undefined> {
    return Array.from(this.movies.values()).find(movie => movie.isFeatured);
  }

  async getTrendingMovies(limit: number = 5): Promise<Movie[]> {
    return Array.from(this.movies.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getMoviesByGenres(genres: string[], limit: number = 5): Promise<Movie[]> {
    return Array.from(this.movies.values())
      .filter(movie => movie.genres.some(genre => genres.includes(genre)))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.currentMovieId++;
    const now = new Date();
    const movie: Movie = { 
      ...insertMovie, 
      id, 
      createdAt: now
    };
    this.movies.set(id, movie);
    return movie;
  }

  // Cast operations
  async getCastForMovie(movieId: number): Promise<CastMember[]> {
    return Array.from(this.castMembers.values())
      .filter(cast => cast.movieId === movieId);
  }

  async createCastMember(insertCastMember: InsertCastMember): Promise<CastMember> {
    const id = this.currentCastMemberId++;
    const castMember: CastMember = { 
      ...insertCastMember, 
      id 
    };
    this.castMembers.set(id, castMember);
    return castMember;
  }

  // User progress operations
  async getUserProgress(userId: number, movieId: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(`${userId}-${movieId}`);
  }

  async getUserContinueWatching(userId: number, limit: number = 4): Promise<(UserProgress & { movie: Movie })[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && !progress.completed)
      .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
      .slice(0, limit)
      .map(progress => {
        const movie = this.movies.get(progress.movieId);
        if (!movie) throw new Error("Movie not found");
        return { ...progress, movie };
      });
  }

  async updateUserProgress(userId: number, movieId: number, progress: number): Promise<UserProgress> {
    const key = `${userId}-${movieId}`;
    const userProgress = this.userProgress.get(key);
    
    if (userProgress) {
      userProgress.progress = progress;
      userProgress.lastWatched = new Date();
      
      // Check if movie is completed (progress > 90% of movie duration)
      const movie = await this.getMovie(movieId);
      if (movie && progress > movie.duration * 60 * 0.9) {
        userProgress.completed = true;
      }
      
      this.userProgress.set(key, userProgress);
      return userProgress;
    } else {
      return this.createUserProgress({ userId, movieId, progress, completed: false });
    }
  }

  async createUserProgress(insertUserProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const now = new Date();
    const userProgress: UserProgress = { 
      ...insertUserProgress, 
      id, 
      lastWatched: now 
    };
    
    const key = `${userProgress.userId}-${userProgress.movieId}`;
    this.userProgress.set(key, userProgress);
    return userProgress;
  }

  // Scheduled viewing operations
  async getScheduledViewings(userId: number, date?: Date): Promise<(ScheduledViewing & { movie: Movie })[]> {
    let viewings = Array.from(this.scheduledViewings.values())
      .filter(viewing => viewing.userId === userId || viewing.participants?.includes(userId));
    
    if (date) {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      viewings = viewings.filter(viewing => 
        viewing.scheduledFor >= startOfDay && viewing.scheduledFor <= endOfDay
      );
    }
    
    return viewings
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .map(viewing => {
        const movie = this.movies.get(viewing.movieId);
        if (!movie) throw new Error("Movie not found");
        return { ...viewing, movie };
      });
  }

  async createScheduledViewing(insertScheduledViewing: InsertScheduledViewing): Promise<ScheduledViewing> {
    const id = this.currentScheduledViewingId++;
    const scheduledViewing: ScheduledViewing = { 
      ...insertScheduledViewing, 
      id 
    };
    this.scheduledViewings.set(id, scheduledViewing);
    return scheduledViewing;
  }

  async getSharedViewings(limit: number = 5): Promise<ScheduledViewing[]> {
    const now = new Date();
    return Array.from(this.scheduledViewings.values())
      .filter(viewing => viewing.isShared && viewing.scheduledFor > now)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .slice(0, limit);
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return userAchievements.map(ua => {
      const achievement = this.achievements.get(ua.achievementId);
      if (!achievement) throw new Error("Achievement not found");
      return { ...ua, achievement };
    });
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const key = `${userId}-${achievementId}`;
    const existing = this.userAchievements.get(key);
    
    if (existing) {
      return existing;
    }
    
    const achievement = await this.achievements.get(achievementId);
    if (!achievement) throw new Error("Achievement not found");
    
    const id = this.currentUserAchievementId++;
    const now = new Date();
    
    const userAchievement: UserAchievement = {
      id,
      userId,
      achievementId,
      earnedAt: now
    };
    
    this.userAchievements.set(key, userAchievement);
    
    // Update user XP
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUserXP(userId, user.xp + achievement.xpReward);
    }
    
    return userAchievement;
  }

  // Mood operations
  async getMoods(): Promise<Mood[]> {
    return Array.from(this.moods.values());
  }

  async getMoodBasedRecommendations(moodId: number, limit: number = 5): Promise<Movie[]> {
    const mood = await this.moods.get(moodId);
    if (!mood) throw new Error("Mood not found");
    
    return this.getMoviesByGenres(mood.genrePreferences, limit);
  }

  // Private methods for seeding data
  private createAchievement(achievement: InsertAchievement): Achievement {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  private createMood(mood: InsertMood): Mood {
    const id = this.currentMoodId++;
    const newMood: Mood = { ...mood, id };
    this.moods.set(id, newMood);
    return newMood;
  }
}

export const storage = new MemStorage();
