import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import HeroSection from "@/components/movies/HeroSection";
import MoodSelector from "@/components/movies/MoodSelector";
import ContinueWatching from "@/components/movies/ContinueWatching";
import ScheduleSection from "@/components/schedule/ScheduleSection";
import MovieGrid from "@/components/movies/MovieGrid";
import SharedViewingSection from "@/components/shared/SharedViewingSection";
import AchievementsSection from "@/components/achievements/AchievementsSection";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";

export default function Home() {
  const { user, isLoading } = useUser();
  const [isMovieRoute] = useRoute("/movie/:id");
  
  useEffect(() => {
    // Set document title
    document.title = "MovieMood - Watch, Schedule & Share";
  }, []);
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Home" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          <HeroSection />
          <MoodSelector />
          <ContinueWatching />
          <ScheduleSection />
          <MovieGrid title="Trending Now" queryKey="/api/movies/trending" viewAllLink="/discover" limit={5} />
          <SharedViewingSection />
          <AchievementsSection />
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
    </div>
  );
}
