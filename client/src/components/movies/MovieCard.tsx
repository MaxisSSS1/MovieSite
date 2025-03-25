import { Link } from "wouter";
import { Movie } from "@shared/schema";

interface TrendingMovieCardProps {
  movie: Movie;
}

export function TrendingMovieCard({ movie }: TrendingMovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <a className="movie-card rounded-lg overflow-hidden bg-[#1E1E1E] transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div className="relative">
          <img 
            src={movie.posterImage}
            alt={movie.title}
            className="w-full h-56 md:h-64 object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#3CAEFF] text-[#121212] text-xs font-bold px-2 py-1 rounded">
            {(movie.score / 10).toFixed(1)}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm">{movie.title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[#B3B3B3] text-xs">{movie.genres.slice(0, 2).join(', ')}</span>
            <button className="text-[#3CAEFF] hover:text-[#3CAEFF]/80">
              <i className="ri-add-line"></i>
            </button>
          </div>
        </div>
      </a>
    </Link>
  );
}

interface ContinueWatchingCardProps {
  movie: Movie;
  progress: number;
  timeRemaining: string;
  percentComplete: number;
  onPlay: () => void;
}

export function ContinueWatchingCard({ 
  movie, 
  progress, 
  timeRemaining, 
  percentComplete, 
  onPlay 
}: ContinueWatchingCardProps) {
  return (
    <div className="movie-card rounded-lg overflow-hidden bg-[#1E1E1E] transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className="relative">
        <Link href={`/movie/${movie.id}`}>
          <a>
            <img 
              src={movie.posterImage}
              alt={movie.title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#282828]">
              <div 
                className="h-full bg-[#FFC107]" 
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <div className="absolute bottom-2 right-2 bg-[#121212]/80 text-white text-xs px-2 py-1 rounded">
              {timeRemaining}
            </div>
          </a>
        </Link>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm">{movie.title}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[#B3B3B3] text-xs">{percentComplete}% complete</span>
          <button 
            className="text-[#3071FF] hover:text-[#3071FF]/80"
            onClick={onPlay}
          >
            <i className="ri-play-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
