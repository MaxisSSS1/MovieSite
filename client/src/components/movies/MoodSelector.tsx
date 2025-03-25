import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data, isLoading: moodsLoading, isError } = useQuery({
    queryKey: ['/api/moods'],
  });
  
  const handleMoodSelect = (moodId: number) => {
    setSelectedMood(moodId);
  };
  
  const getRecommendations = async () => {
    if (!selectedMood) return;
    
    setIsLoading(true);
    try {
      const res = await apiRequest('GET', `/api/moods/${selectedMood}/recommendations`, undefined);
      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (moodsLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-60" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-xl" />
      </section>
    );
  }
  
  if (isError || !data?.moods) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">How are you feeling today?</h2>
        </div>
        <div className="p-4 bg-[#282828] rounded-xl">
          <p className="text-[#B3B3B3]">Unable to load moods. Please try again later.</p>
        </div>
      </section>
    );
  }
  
  const { moods } = data;
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">How are you feeling today?</h2>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {moods.map((mood) => (
          <div key={mood.id}>
            <input 
              type="radio" 
              id={`mood-${mood.id}`} 
              name="mood" 
              className="hidden mood-selector"
              checked={selectedMood === mood.id}
              onChange={() => handleMoodSelect(mood.id)}
            />
            <label 
              htmlFor={`mood-${mood.id}`} 
              className={`block text-center p-4 border-2 rounded-xl cursor-pointer hover:bg-[#282828]/50 transition ${
                selectedMood === mood.id 
                  ? 'border-[#3071FF] bg-[#3071FF]/10' 
                  : 'border-[#282828]'
              }`}
            >
              <i className={`${mood.icon} text-3xl text-[#FFC107] mb-2`}></i>
              <span className="block text-sm">{mood.name}</span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-[#282828] rounded-xl flex items-center justify-between">
        <div>
          <p className="text-[#3071FF] font-medium">
            {selectedMood 
              ? `Recommended for ${moods.find(m => m.id === selectedMood)?.name}` 
              : 'Recommended for your current mood'
            }
          </p>
          <p className="text-[#B3B3B3] text-sm">
            {selectedMood 
              ? 'Click get suggestions to see movies that match your mood' 
              : 'Select a mood to get personalized movie recommendations'}
          </p>
        </div>
        <button 
          className={`bg-[#3071FF] text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
            !selectedMood || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3071FF]/90'
          }`}
          onClick={getRecommendations}
          disabled={!selectedMood || isLoading}
        >
          {isLoading ? 'Loading...' : 'Get Suggestions'}
        </button>
      </div>
      
      {recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Your Personalized Recommendations</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recommendations.map((movie) => (
              <div key={movie.id} className="movie-card rounded-lg overflow-hidden bg-[#1E1E1E]">
                <div className="relative">
                  <img 
                    src={movie.posterImage}
                    alt={movie.title}
                    className="w-full h-56 md:h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-[#FFC107] text-[#121212] text-xs font-bold px-2 py-1 rounded">
                    {movie.score / 10}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm">{movie.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#B3B3B3] text-xs">{movie.genres.slice(0, 2).join(', ')}</span>
                    <button className="text-[#3071FF] hover:text-[#3071FF]/80">
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
