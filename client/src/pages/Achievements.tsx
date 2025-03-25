import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";
import AchievementBadge from "@/components/achievements/AchievementBadge";
import { useUser } from "@/contexts/UserContext";
import { 
  calculateXpProgress, 
  remainingXpForNextLevel,
  totalXpForLevel 
} from "@/lib/utils";

export default function Achievements() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  
  const { 
    data: achievementsData, 
    isLoading: achievementsLoading, 
    isError: achievementsError 
  } = useQuery({
    queryKey: ['/api/achievements/user'],
  });
  
  const { 
    data: allAchievementsData, 
    isLoading: allAchievementsLoading, 
    isError: allAchievementsError 
  } = useQuery({
    queryKey: ['/api/achievements'],
  });
  
  useEffect(() => {
    document.title = "Achievements - MovieMood";
  }, []);
  
  useEffect(() => {
    if (user) {
      const progressPercentage = calculateXpProgress(user.xp, user.level);
      setProgress(progressPercentage);
    }
  }, [user]);
  
  // Combine all achievements with user achievements
  // Mark achievements as locked or unlocked
  const prepareAchievements = () => {
    if (!allAchievementsData?.achievements || !achievementsData?.userAchievements) {
      return [];
    }
    
    const unlockedIds = achievementsData.userAchievements.map(
      (ua) => ua.achievement.id
    );
    
    return allAchievementsData.achievements.map(achievement => {
      const isUnlocked = unlockedIds.includes(achievement.id);
      return {
        ...achievement,
        isLocked: !isUnlocked,
        unlockedAt: isUnlocked 
          ? achievementsData.userAchievements.find(ua => ua.achievement.id === achievement.id)?.earnedAt 
          : null
      };
    });
  };
  
  const achievements = prepareAchievements();
  const isLoading = achievementsLoading || allAchievementsLoading;
  const isError = achievementsError || allAchievementsError;
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="Achievements" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Your Achievements" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          {/* User Level Progress */}
          <section className="mb-8">
            <div className="bg-[#1E1E1E] rounded-xl p-6">
              {isLoading || !user ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
                      <p className="text-[#B3B3B3]">{user.title}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[#64EEBC] text-xl font-semibold">Level {user.level}</div>
                      <div className="text-[#B3B3B3]">{user.xp} XP</div>
                    </div>
                  </div>
                  
                  <div className="mb-1">
                    <div className="flex justify-between text-sm text-[#B3B3B3] mb-1">
                      <span>{totalXpForLevel(user.level)} XP</span>
                      <span>{totalXpForLevel(user.level + 1)} XP</span>
                    </div>
                    <div className="w-full h-3 bg-[#282828] rounded-full">
                      <div 
                        className="h-full bg-[#64EEBC] rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-4">
                    <p className="text-[#B3B3B3]">
                      {remainingXpForNextLevel(user.xp, user.level)} XP needed to reach Level {user.level + 1}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
          
          {/* Achievements Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-poppins mb-4">All Achievements</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#1E1E1E] p-4 rounded-xl">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-16 h-16 rounded-full mb-3" />
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                <p className="text-[#B3B3B3]">Unable to load achievements. Please try again later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-[#1E1E1E] p-4 rounded-xl">
                    <div className="flex flex-col items-center">
                      <AchievementBadge 
                        achievement={achievement} 
                        size="large"
                      />
                      <p className="text-center text-[#B3B3B3] mt-3 text-sm">
                        {achievement.description}
                      </p>
                      {achievement.isLocked ? (
                        <div className="mt-3 px-3 py-1 bg-[#282828] rounded-full text-xs text-[#B3B3B3]">
                          Locked
                        </div>
                      ) : achievement.unlockedAt ? (
                        <div className="mt-3 px-3 py-1 bg-[#64EEBC]/20 rounded-full text-xs text-[#64EEBC]">
                          Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Gamification Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-poppins mb-4">How to Earn Achievements</h2>
            
            <div className="bg-[#1E1E1E] rounded-xl p-6">
              <p className="text-[#B3B3B3] mb-4">
                Unlock achievements by watching movies, participating in shared viewings, and engaging with the platform. Each achievement earns you XP that helps you level up!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-film-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Watch Movies</h4>
                  <p className="text-sm text-[#B3B3B3]">Complete movies and explore different genres</p>
                </div>
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-group-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Join Shared Viewings</h4>
                  <p className="text-sm text-[#B3B3B3]">Watch movies with friends to earn social achievements</p>
                </div>
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-calendar-check-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Schedule Regularly</h4>
                  <p className="text-sm text-[#B3B3B3]">Plan your movie watching and stick to your schedule</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
    </div>
  );
}
