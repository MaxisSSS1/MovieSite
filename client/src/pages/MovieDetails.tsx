import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import MovieDetailsModal from "@/components/movies/MovieDetails";

export default function MovieDetails() {
  const [, params] = useRoute("/movie/:id");
  const [, setLocation] = useLocation();
  const movieId = params?.id ? parseInt(params.id) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
    enabled: !!movieId,
  });
  
  useEffect(() => {
    if (data?.movie) {
      document.title = `${data.movie.title} - MovieMood`;
    } else {
      document.title = "Movie Details - MovieMood";
    }
  }, [data]);

  // This component acts as a wrapper for the MovieDetailsModal component
  // The actual UI is implemented in MovieDetailsModal
  return <MovieDetailsModal />;
}
