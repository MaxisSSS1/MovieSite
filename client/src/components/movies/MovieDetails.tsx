import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { formatDuration } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovieDetailsModal() {
  const [isVisible, setIsVisible] = useState(true);
  const [, params] = useRoute("/movie/:id");
  const movieId = params?.id ? parseInt(params.id) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/movies/${movieId}`],
    enabled: !!movieId,
  });

  const handleClose = () => {
    setIsVisible(false);
    window.history.back();
  };

  if (!isVisible || !movieId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto mt-20 bg-[#1E1E1E] rounded-xl overflow-hidden">
          <Skeleton className="w-full h-60" />
          <div className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-24 w-full mb-6" />
            <div className="flex gap-3 mb-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.movie) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto mt-20 bg-[#1E1E1E] rounded-xl overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Movie</h2>
          <p className="text-[#B3B3B3] mb-6">Unable to load movie details. Please try again later.</p>
          <button
            onClick={handleClose}
            className="bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-2 px-6 rounded-full transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { movie, cast } = data;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto mt-20 bg-[#1E1E1E] rounded-xl overflow-hidden mb-20">
        {/* Modal Header with close button */}
        <div className="relative">
          <img
            src={movie.bannerImage}
            alt={`${movie.title} banner`}
            className="w-full h-48 md:h-60 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-[#1E1E1E]/80 to-transparent"></div>
          <button
            className="absolute top-4 right-4 bg-[#121212]/50 text-white p-2 rounded-full"
            onClick={handleClose}
          >
            <i className="ri-close-line"></i>
          </button>
          <div className="absolute bottom-0 left-0 p-4 md:p-6">
            <div className="flex items-end">
              <img
                src={movie.posterImage}
                alt={`${movie.title} poster`}
                className="w-24 md:w-32 rounded-lg shadow-lg mr-4 hidden md:block"
              />
              <div>
                <h2 className="text-2xl font-bold text-white font-poppins">{movie.title}</h2>
                <div className="flex items-center mt-1 flex-wrap">
                  <span className="text-[#B3B3B3] mr-2">{movie.releaseYear}</span>
                  <span className="text-[#B3B3B3] mr-2">•</span>
                  <span className="text-[#B3B3B3] mr-2">{movie.rating}</span>
                  <span className="text-[#B3B3B3] mr-2">•</span>
                  <span className="text-[#B3B3B3]">{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex items-center mt-2">
                  <div className="bg-[#3CAEFF] text-[#121212] text-sm font-bold px-2 py-0.5 rounded mr-3">
                    {(movie.score / 10).toFixed(1)}
                  </div>
                  <div className="flex items-center">
                    <i className="ri-user-line text-[#B3B3B3] mr-1"></i>
                    <span className="text-[#B3B3B3] text-sm">
                      {movie.reviewCount.toLocaleString()} reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="bg-[#282828] text-[#B3B3B3] text-xs px-3 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-[#B3B3B3] mb-6">{movie.description}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button className="bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-2 px-6 rounded-full flex items-center transition duration-200">
              <i className="ri-play-fill mr-2"></i> Watch Now
            </button>
            <button className="bg-[#282828] hover:bg-[#282828]/90 text-white font-semibold py-2 px-6 rounded-full flex items-center transition duration-200">
              <i className="ri-add-line mr-2"></i> Add to Watchlist
            </button>
            <Link href={`/schedule?movieId=${movie.id}`}>
              <a className="bg-[#282828] hover:bg-[#282828]/90 text-white font-semibold py-2 px-6 rounded-full flex items-center transition duration-200">
                <i className="ri-calendar-line mr-2"></i> Schedule
              </a>
            </Link>
          </div>

          {cast && cast.length > 0 && (
            <div className="border-t border-[#282828] pt-4 mb-6">
              <h3 className="font-medium mb-3">Cast & Crew</h3>
              <div className="flex space-x-4 overflow-x-auto custom-scrollbar pb-2">
                {cast.map((member) => (
                  <div key={member.id} className="flex flex-col items-center min-w-[80px]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover mb-2"
                    />
                    <span className="text-xs text-center">{member.name}</span>
                    <span className="text-[#B3B3B3] text-xs text-center">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#282828] pt-4">
            <h3 className="font-medium mb-3">Share with friends</h3>
            <div className="flex items-center space-x-4">
              <button className="bg-[#282828] hover:bg-[#282828]/80 text-white p-2 rounded-full">
                <i className="ri-facebook-fill"></i>
              </button>
              <button className="bg-[#282828] hover:bg-[#282828]/80 text-white p-2 rounded-full">
                <i className="ri-twitter-fill"></i>
              </button>
              <button className="bg-[#282828] hover:bg-[#282828]/80 text-white p-2 rounded-full">
                <i className="ri-instagram-line"></i>
              </button>
              <button className="bg-[#282828] hover:bg-[#282828]/80 text-white p-2 rounded-full">
                <i className="ri-link"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
