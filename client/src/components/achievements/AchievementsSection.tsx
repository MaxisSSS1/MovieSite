import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementBadge from "./AchievementBadge";
import { useUser } from "@/contexts/UserContext";
import { 
  calculateXpProgress, 
  remainingXpForNextLevel 
} from "@/lib/utils";

export default function AchievementsSection() {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  
  const { 
    data: achievementsData, 
    isLoading: achievementsLoading, 
    isError: achievementsError 
  } = useQuery({
    queryKey: ['/api/achievements/user'],
  });
  
  useEffect(() => {
    if (user) {
      const progressPercentage = calculateXpProgress(user.xp, user.level);
      setProgress(progressPercentage);
    }
  }, [user]);
  
  if (achievementsLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-2 w-full mt-2 rounded-full" />
            <div className="flex justify-between mt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          <Skeleton className="h-5 w-40 mb-3" />
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-12 h-12 rounded-full mb-2" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (achievementsError || !achievementsData?.userAchievements) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">Your Achievements</h2>
          <Link href="/achievements">
            <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
          </Link>
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4 text-center py-6">
          <p className="text-[#B3B3B3]">Unable to load achievements. Please try again later.</p>
        </div>
      </section>
    );
  }
  
  const { userAchievements } = achievementsData;
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">Your Achievements</h2>
        <Link href="/achievements">
          <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
        </Link>
      </div>
      
      <div className="bg-[#1E1E1E] rounded-xl p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-[#64EEBC] font-medium">Level {user?.level || 1}</span>
              <span className="mx-2 text-[#B3B3B3]">•</span>
              <span className="text-[#B3B3B3] text-sm">{user?.title || "Movie Explorer"}</span>
            </div>
            <span className="text-[#B3B3B3] text-sm">{user?.xp || 0} XP</span>
          </div>
          <div className="w-full h-2 bg-[#282828] rounded-full mt-2">
            <div 
              className="h-full bg-[#64EEBC] rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[#B3B3B3] text-xs">Level {user?.level || 1}</span>
            <span className="text-[#B3B3B3] text-xs">
              Level {(user?.level || 1) + 1} ({remainingXpForNextLevel(user?.xp || 0, user?.level || 1)} XP more)
            </span>
          </div>
        </div>
        
        <h3 className="font-medium mb-3">Recent Achievements</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {userAchievements.slice(0, 6).map((achievement) => (
            <AchievementBadge 
              key={achievement.id} 
              achievement={achievement.achievement}
              xpEarned={achievement.achievement.xpReward}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
