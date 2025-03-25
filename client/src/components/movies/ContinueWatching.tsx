import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime, calculateCompletion } from "@/lib/utils";
import { ContinueWatchingCard } from "./MovieCard";

export default function ContinueWatching() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/progress/continue-watching'],
  });
  
  const handlePlay = (movieId: number) => {
    // Navigate to movie watch page
    window.location.href = `/movie/${movieId}?autoplay=true`;
  };
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }
  
  if (isError || !data?.continueWatching || data.continueWatching.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">Continue Watching</h2>
        </div>
        <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
          <i className="ri-film-line text-4xl text-[#3CAEFF] mb-3"></i>
          <h3 className="font-medium mb-2">No movies in progress</h3>
          <p className="text-[#B3B3B3] text-sm mb-4">Start watching a movie to see it here</p>
          <Link href="/discover">
            <a className="inline-block bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white font-medium py-2 px-4 rounded-md transition">
              Browse Movies
            </a>
          </Link>
        </div>
      </section>
    );
  }
  
  const { continueWatching } = data;
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">Continue Watching</h2>
        <Link href="/discover">
          <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {continueWatching.map((item) => {
          const percentComplete = calculateCompletion(item.progress, item.movie.duration);
          const timeRemaining = formatTime(
            item.movie.duration * 60 - item.progress
          );
          
          return (
            <ContinueWatchingCard
              key={item.id}
              movie={item.movie}
              progress={item.progress}
              timeRemaining={timeRemaining}
              percentComplete={percentComplete}
              onPlay={() => handlePlay(item.movie.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
