import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/movies/featured'],
  });
  
  if (isLoading) {
    return (
      <section className="mb-8 relative rounded-xl overflow-hidden">
        <Skeleton className="w-full h-48 md:h-80" />
      </section>
    );
  }
  
  if (isError || !data?.movie) {
    return (
      <section className="mb-8 bg-[#282828] rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-white">Unable to load featured movie</h2>
        <p className="text-[#B3B3B3] mt-2">Please try again later</p>
      </section>
    );
  }
  
  const { movie } = data;
  
  return (
    <section className="mb-8 relative rounded-xl overflow-hidden">
      <div className="relative">
        <img 
          src={movie.bannerImage} 
          className="w-full h-48 md:h-80 object-cover" 
          alt={movie.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 md:p-8">
          <span className="bg-[#E50914] text-white text-xs font-semibold px-2 py-1 rounded">NEW RELEASE</span>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 text-white font-poppins">{movie.title}</h2>
          <p className="text-[#B3B3B3] mt-1 md:mt-2 text-sm md:text-base max-w-xl">
            {movie.description}
          </p>
          <div className="flex mt-4 space-x-3">
            <Link href={`/movie/${movie.id}`}>
              <a className="bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-2 px-6 rounded-full flex items-center transition duration-200">
                <i className="ri-play-fill mr-2"></i> Watch Now
              </a>
            </Link>
            <Link href={`/schedule?movieId=${movie.id}`}>
              <a className="bg-[#282828] hover:bg-[#282828]/90 text-white font-semibold py-2 px-6 rounded-full flex items-center transition duration-200">
                <i className="ri-calendar-line mr-2"></i> Schedule
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
