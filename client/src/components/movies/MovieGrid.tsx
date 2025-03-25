import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingMovieCard } from "./MovieCard";

interface MovieGridProps {
  title: string;
  queryKey: string;
  viewAllLink?: string;
  limit?: number;
}

export default function MovieGrid({ title, queryKey, viewAllLink, limit = 5 }: MovieGridProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKey],
  });
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          {viewAllLink && <Skeleton className="h-5 w-16" />}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }
  
  if (isError || !data?.movies) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">{title}</h2>
        </div>
        <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
          <p className="text-[#B3B3B3]">Unable to load movies. Please try again later.</p>
        </div>
      </section>
    );
  }
  
  const movies = data.movies.slice(0, limit);
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">
            View All
          </a>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <TrendingMovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
