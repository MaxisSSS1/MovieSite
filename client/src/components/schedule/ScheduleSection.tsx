import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import DateSelector from "./DateSelector";
import { formatDate, formatTimeAmPm, formatDuration } from "@/lib/utils";

export default function ScheduleSection() {
  const [location] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/schedule', selectedDate.toISOString()],
  });
  
  // Refetch when selected date changes
  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-16 rounded-lg" />
            ))}
          </div>
          
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">Your Upcoming Schedule</h2>
        <Link href="/schedule">
          <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">
            Manage Schedule
          </a>
        </Link>
      </div>
      
      <div className="bg-[#1E1E1E] rounded-xl p-4">
        {/* Date Selector */}
        <DateSelector 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
        />
        
        {/* Scheduled Movies */}
        <div className="space-y-3">
          {isError ? (
            <div className="text-center p-4">
              <p className="text-[#B3B3B3]">Unable to load scheduled viewings</p>
            </div>
          ) : data?.scheduledViewings && data.scheduledViewings.length > 0 ? (
            data.scheduledViewings.map((viewing) => (
              <div key={viewing.id} className="flex items-center p-3 bg-[#282828] rounded-lg">
                <span className="text-[#E50914] font-medium w-16 text-center">
                  {formatTimeAmPm(new Date(viewing.scheduledFor))}
                </span>
                <img 
                  src={viewing.movie.posterImage} 
                  alt={viewing.movie.title} 
                  className="w-12 h-12 rounded object-cover mx-3"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{viewing.movie.title}</h4>
                  <p className="text-[#B3B3B3] text-xs">
                    {viewing.movie.genres.slice(0, 2).join(', ')} • {formatDuration(viewing.movie.duration)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`text-xs ${viewing.isShared ? 'text-[#FFC107]' : 'text-[#64EEBC]'} mr-2 font-medium`}>
                    {viewing.isShared ? `Group (${viewing.participants?.length || 0})` : 'Solo'}
                  </span>
                  <button className="text-[#B3B3B3] hover:text-white">
                    <i className="ri-more-2-fill"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-[#B3B3B3]">
              <p>No movies scheduled for {formatDate(selectedDate)}</p>
            </div>
          )}
          
          <Link href="/schedule?add=true">
            <a className="block w-full p-3 border border-dashed border-[#282828] rounded-lg text-center text-[#B3B3B3] hover:text-[#3CAEFF] transition-colors">
              <i className="ri-add-line mr-1"></i> Schedule a Movie
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
