import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingMovieCard } from "@/components/movies/MovieCard";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";
import { Mood } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function MyMood() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/moods'],
  });
  
  useEffect(() => {
    document.title = "My Mood - MovieMood";
  }, []);
  
  const getRecommendations = async (moodId: number) => {
    setIsLoadingRecommendations(true);
    try {
      const res = await apiRequest('GET', `/api/moods/${moodId}/recommendations`, undefined);
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    getRecommendations(mood.id);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="My Mood" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Mood-Based Recommendations" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          <section className="mb-8">
            <div className="bg-[#1E1E1E] rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold font-poppins mb-4">How are you feeling today?</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center p-4">
                  <p className="text-[#B3B3B3]">Unable to load moods. Please try again later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  {data.moods.map((mood: Mood) => (
                    <div 
                      key={mood.id}
                      className={`flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all ${
                        selectedMood?.id === mood.id 
                          ? 'bg-[#3CAEFF]/10 border-2 border-[#3CAEFF]' 
                          : 'bg-[#282828] hover:bg-[#282828]/70 border-2 border-transparent'
                      }`}
                      onClick={() => handleMoodSelect(mood)}
                    >
                      <i className={`${mood.icon} text-4xl ${selectedMood?.id === mood.id ? 'text-[#3CAEFF]' : 'text-[#B3B3B3]'} mb-3`}></i>
                      <span className={`text-base font-medium ${selectedMood?.id === mood.id ? 'text-[#3CAEFF]' : 'text-white'}`}>
                        {mood.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-[#B3B3B3] mb-4">
                  Select a mood above to get personalized movie recommendations that match how you're feeling
                </p>
                
                {selectedMood && (
                  <div className="inline-block bg-[#282828] px-4 py-2 rounded-lg">
                    <span className="text-[#3CAEFF] font-medium">
                      Selected mood: {selectedMood.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recommendations Section */}
            {selectedMood && (
              <section>
                <h2 className="text-xl font-semibold font-poppins mb-4">
                  Recommended for {selectedMood.name} Mood
                </h2>
                
                {isLoadingRecommendations ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-72 rounded-lg" />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {recommendations.map(movie => (
                      <TrendingMovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                    <p className="text-[#B3B3B3]">
                      No recommendations available for this mood. Try another mood.
                    </p>
                  </div>
                )}
              </section>
            )}
            
            {!selectedMood && !isLoading && (
              <div className="bg-[#1E1E1E] text-center rounded-xl p-10">
                <i className="ri-emotion-happy-line text-6xl text-[#3CAEFF] mb-4"></i>
                <h3 className="text-xl font-medium mb-2">Select a mood above</h3>
                <p className="text-[#B3B3B3] max-w-md mx-auto">
                  We'll curate a personalized list of movies that match exactly how you're feeling right now
                </p>
              </div>
            )}
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
