import { Achievement } from "@shared/schema";

interface AchievementBadgeProps {
  achievement: Achievement;
  xpEarned?: number;
  size?: "small" | "medium" | "large";
}

export default function AchievementBadge({ 
  achievement, 
  xpEarned, 
  size = "medium" 
}: AchievementBadgeProps) {
  const sizeClasses = {
    small: "w-10 h-10",
    medium: "w-12 h-12",
    large: "w-16 h-16"
  };
  
  const iconSize = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  };
  
  return (
    <div className="achievement-badge flex flex-col items-center">
      <div className={`${sizeClasses[size]} ${achievement.isLocked ? 'bg-[#282828]/50' : 'bg-[#282828]'} rounded-full flex items-center justify-center mb-2`}>
        <i className={`${achievement.icon} ${iconSize[size]} ${achievement.isLocked ? 'text-[#B3B3B3]' : 'text-[#FFC107]'}`}></i>
      </div>
      <span className={`text-xs text-center ${achievement.isLocked ? 'text-[#B3B3B3]' : 'text-white'}`}>
        {achievement.name}
      </span>
      {xpEarned !== undefined ? (
        <span className="text-[#B3B3B3] text-xs">+{xpEarned} XP</span>
      ) : achievement.isLocked ? (
        <span className="text-[#B3B3B3] text-xs">Locked</span>
      ) : (
        <span className="text-[#B3B3B3] text-xs">+{achievement.xpReward} XP</span>
      )}
    </div>
  );
}
