import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format minutes to hours and minutes (e.g. 125 -> 2h 5m)
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

// Format seconds to MM:SS or HH:MM:SS
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Calculate percentage of completion
export function calculateCompletion(progress: number, duration: number): number {
  // duration is in minutes, progress is in seconds
  const totalSeconds = duration * 60;
  return Math.round((progress / totalSeconds) * 100);
}

// Get upcoming days for schedule display
export function getUpcomingDays(days: number = 7): { dayName: string, date: number, dateObj: Date }[] {
  const result = [];
  const today = new Date();
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    result.push({
      dayName: dayNames[date.getDay()],
      date: date.getDate(),
      dateObj: date
    });
  }
  
  return result;
}

// Format date to a readable string (e.g. Wednesday, Oct 14)
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Format time to AM/PM format (e.g. 8:00 PM)
export function formatTimeAmPm(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

// Calculate XP needed for next level (simplified formula)
export function xpForNextLevel(level: number): number {
  return Math.pow((level + 1) * 10, 2);
}

// Calculate total XP needed for a level
export function totalXpForLevel(level: number): number {
  return Math.pow(level * 10, 2);
}

// Calculate XP progress percentage between current and next level
export function calculateXpProgress(xp: number, level: number): number {
  const currentLevelXp = totalXpForLevel(level);
  const nextLevelXp = totalXpForLevel(level + 1);
  const xpDifference = nextLevelXp - currentLevelXp;
  const currentXpProgress = xp - currentLevelXp;
  
  return Math.round((currentXpProgress / xpDifference) * 100);
}

// Calculate remaining XP needed for next level
export function remainingXpForNextLevel(xp: number, level: number): number {
  const nextLevelXp = totalXpForLevel(level + 1);
  return nextLevelXp - xp;
}
