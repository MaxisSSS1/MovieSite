import { useState, useEffect } from "react";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { 
  calculateXpProgress, 
  remainingXpForNextLevel 
} from "@/lib/utils";
import { Link } from "wouter";

export default function Profile() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const { user, isLoading: userLoading, logout } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  
  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements/user'],
  });
  
  const { data: continueWatchingData, isLoading: continueWatchingLoading } = useQuery({
    queryKey: ['/api/progress/continue-watching'],
  });
  
  useEffect(() => {
    document.title = "Your Profile - MovieMood";
  }, []);
  
  const isLoading = userLoading || achievementsLoading || continueWatchingLoading;
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="Profile" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Your Profile" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          {/* Profile Header */}
          <section className="mb-6">
            {isLoading ? (
              <div className="bg-[#1E1E1E] rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 text-center md:text-left">
                  <Skeleton className="h-8 w-48 mx-auto md:mx-0 mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto md:mx-0 mb-4" />
                  <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
                </div>
              </div>
            ) : user ? (
              <div className="bg-[#1E1E1E] rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                <img 
                  src={user.profileImage} 
                  alt={user.displayName} 
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <p className="text-[#B3B3B3] mb-2">{user.title}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <div className="bg-[#282828] px-3 py-1 rounded-full text-sm">
                      <span className="text-[#64EEBC] font-medium">Level {user.level}</span>
                    </div>
                    <div className="bg-[#282828] px-3 py-1 rounded-full text-sm">
                      <span className="text-[#B3B3B3]">{user.xp} XP</span>
                    </div>
                    <div className="bg-[#282828] px-3 py-1 rounded-full text-sm">
                      <span className="text-[#B3B3B3]">
                        {achievementsData?.userAchievements.length || 0} Achievements
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <button 
                    onClick={logout}
                    className="bg-[#282828] hover:bg-[#282828]/80 text-[#B3B3B3] px-4 py-2 rounded-md"
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1E1E1E] rounded-xl p-8 text-center">
                <i className="ri-user-line text-5xl text-[#3CAEFF] mb-4"></i>
                <h2 className="text-xl font-semibold mb-2">You're not logged in</h2>
                <p className="text-[#B3B3B3] mb-4">Sign in to access your profile, track your achievements, and more.</p>
                <button className="bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white px-6 py-2 rounded-md">
                  Login
                </button>
              </div>
            )}
          </section>
          
          {/* Tabs Navigation */}
          {user && (
            <>
              <div className="mb-6 border-b border-[#282828]">
                <nav className="flex space-x-6">
                  <button 
                    className={`pb-3 px-1 ${activeTab === 'overview' 
                      ? 'text-white border-b-2 border-[#3CAEFF] font-medium' 
                      : 'text-[#B3B3B3]'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={`pb-3 px-1 ${activeTab === 'history' 
                      ? 'text-white border-b-2 border-[#3CAEFF] font-medium' 
                      : 'text-[#B3B3B3]'}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Watch History
                  </button>
                  <button 
                    className={`pb-3 px-1 ${activeTab === 'settings' 
                      ? 'text-white border-b-2 border-[#3CAEFF] font-medium' 
                      : 'text-[#B3B3B3]'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div>
                  {/* Level Progress */}
                  <section className="mb-8">
                    <h2 className="text-xl font-semibold font-poppins mb-4">Your Progress</h2>
                    <div className="bg-[#1E1E1E] rounded-xl p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white">Level {user.level}</span>
                        <span className="text-white">Level {user.level + 1}</span>
                      </div>
                      <div className="w-full h-3 bg-[#282828] rounded-full">
                        <div 
                          className="h-full bg-[#64EEBC] rounded-full" 
                          style={{ width: `${calculateXpProgress(user.xp, user.level)}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-[#B3B3B3]">
                          {remainingXpForNextLevel(user.xp, user.level)} XP needed to reach Level {user.level + 1}
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  {/* Recent Achievements */}
                  <section className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold font-poppins">Recent Achievements</h2>
                      <Link href="/achievements">
                        <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
                      </Link>
                    </div>
                    
                    {achievementsLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                      </div>
                    ) : achievementsData?.userAchievements && achievementsData.userAchievements.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {achievementsData.userAchievements.slice(0, 4).map((achievement) => (
                          <div key={achievement.id} className="bg-[#1E1E1E] p-4 rounded-xl flex flex-col items-center">
                            <div className="w-12 h-12 bg-[#282828] rounded-full flex items-center justify-center mb-2">
                              <i className={`${achievement.achievement.icon} text-xl text-[#64EEBC]`}></i>
                            </div>
                            <span className="text-sm font-medium text-center">{achievement.achievement.name}</span>
                            <span className="text-xs text-[#B3B3B3] mt-1">+{achievement.achievement.xpReward} XP</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                        <p className="text-[#B3B3B3]">No achievements unlocked yet. Start watching movies to earn achievements!</p>
                      </div>
                    )}
                  </section>
                  
                  {/* Continue Watching */}
                  <section className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold font-poppins">Continue Watching</h2>
                      <Link href="/">
                        <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
                      </Link>
                    </div>
                    
                    {continueWatchingLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                          <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                      </div>
                    ) : continueWatchingData?.continueWatching && continueWatchingData.continueWatching.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {continueWatchingData.continueWatching.slice(0, 2).map((item) => (
                          <div key={item.id} className="bg-[#1E1E1E] p-4 rounded-lg flex items-center">
                            <img 
                              src={item.movie.posterImage} 
                              alt={item.movie.title} 
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{item.movie.title}</h3>
                              <div className="flex items-center text-sm text-[#B3B3B3]">
                                <span className="mr-2">{Math.round((item.progress / (item.movie.duration * 60)) * 100)}% complete</span>
                                <span>•</span>
                                <span className="ml-2">{item.movie.genres.slice(0, 2).join(', ')}</span>
                              </div>
                              <div className="w-full h-1 bg-[#282828] mt-2">
                                <div 
                                  className="h-full bg-[#FFC107]" 
                                  style={{ width: `${Math.round((item.progress / (item.movie.duration * 60)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <Link href={`/movie/${item.movie.id}?autoplay=true`}>
                              <a className="ml-4 w-8 h-8 bg-[#3071FF] rounded-full flex items-center justify-center">
                                <i className="ri-play-fill text-white"></i>
                              </a>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                        <p className="text-[#B3B3B3]">You don't have any movies in progress. Start watching now!</p>
                      </div>
                    )}
                  </section>
                </div>
              )}
              
              {activeTab === 'history' && (
                <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
                  <i className="ri-history-line text-5xl text-[#3071FF] mb-4"></i>
                  <h3 className="text-xl font-medium mb-2">Watch History Coming Soon</h3>
                  <p className="text-[#B3B3B3] max-w-md mx-auto">
                    We're working on a feature to track your complete watch history. Check back soon!
                  </p>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
                  <i className="ri-settings-3-line text-5xl text-[#3071FF] mb-4"></i>
                  <h3 className="text-xl font-medium mb-2">Settings Coming Soon</h3>
                  <p className="text-[#B3B3B3] max-w-md mx-auto">
                    Profile settings and customization options will be available in a future update.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
    </div>
  );
}
