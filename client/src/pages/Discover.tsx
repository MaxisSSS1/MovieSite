import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingMovieCard } from "@/components/movies/MovieCard";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";

export default function Discover() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/movies'],
  });
  
  const genres = [
    "Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", 
    "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller", "Documentary"
  ];
  
  useEffect(() => {
    document.title = "Discover Movies - MovieMood";
  }, []);
  
  const filteredMovies = selectedGenre && data?.movies 
    ? data.movies.filter(movie => movie.genres.includes(selectedGenre))
    : data?.movies;
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="Discover" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Discover Movies" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          {/* Genre Filter */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold font-poppins mb-4">Browse by Genre</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === null 
                    ? 'bg-[#3CAEFF] text-white' 
                    : 'bg-[#282828] text-[#B3B3B3] hover:bg-[#282828]/80'
                }`}
                onClick={() => setSelectedGenre(null)}
              >
                All
              </button>
              
              {genres.map(genre => (
                <button 
                  key={genre}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedGenre === genre 
                      ? 'bg-[#3CAEFF] text-white' 
                      : 'bg-[#282828] text-[#B3B3B3] hover:bg-[#282828]/80'
                  }`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* Movies Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold font-poppins mb-4">
              {selectedGenre ? `${selectedGenre} Movies` : 'All Movies'}
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                <p className="text-[#B3B3B3]">Unable to load movies. Please try again later.</p>
              </div>
            ) : filteredMovies && filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMovies.map(movie => (
                  <TrendingMovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                <p className="text-[#B3B3B3]">
                  {selectedGenre 
                    ? `No movies found in the ${selectedGenre} genre.` 
                    : 'No movies available.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
    </div>
  );
}
