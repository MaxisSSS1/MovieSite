import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute, useLocation } from "wouter";
import DateSelector from "@/components/schedule/DateSelector";
import { formatDate, formatTimeAmPm, formatDuration } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";

export default function Schedule() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [isShared, setIsShared] = useState(false);
  const [title, setTitle] = useState("");
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/schedule', selectedDate.toISOString()],
  });
  
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['/api/movies'],
  });
  
  const scheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const res = await apiRequest('POST', '/api/schedule', scheduleData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Movie scheduled successfully",
        description: "Your movie has been added to your schedule.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to schedule movie",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldOpenDialog = url.searchParams.get("add") === "true";
    if (shouldOpenDialog) {
      setIsAddDialogOpen(true);
      // Optionally clear it from the URL
      setLocation("/schedule", { replace: true });
    }
  }, []);
  
  // Refetch when selected date changes
  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);
  
  useEffect(() => {
    document.title = "Schedule Movies - MovieMood";
  }, []);
  
  const handleScheduleMovie = () => {
    if (!selectedMovie || !selectedTime || !user) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledFor = new Date(selectedDate);
    scheduledFor.setHours(hours, minutes);
    
    const scheduleData = {
      userId: user.id,
      movieId: selectedMovie,
      scheduledFor,
      isShared,
      title: isShared ? title || null : null,
      participants: []
    };
    
    scheduleMutation.mutate(scheduleData);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="Schedule" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Movie Schedule" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-poppins">Your Movie Schedule</h2>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white px-4 py-1.5 rounded-lg flex items-center"
              >
                <i className="ri-add-line mr-1.5"></i> Schedule Movie
              </button>
            </div>
            
            <div className="bg-[#1E1E1E] rounded-xl p-4">
              {/* Date Selector */}
              <DateSelector 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
              />
              
              {/* Schedule Content */}
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center p-4">
                  <p className="text-[#B3B3B3]">Unable to load scheduled viewings</p>
                </div>
              ) : data?.scheduledViewings && data.scheduledViewings.length > 0 ? (
                <div className="space-y-3">
                  {data.scheduledViewings.map((viewing) => (
                    <div key={viewing.id} className="flex items-center p-3 bg-[#282828] rounded-lg">
                      <span className="text-[#3071FF] font-medium w-16 text-center">
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
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-[#B3B3B3]">
                  <p>No movies scheduled for {formatDate(selectedDate)}</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Calendar Section (Simplified) */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold font-poppins mb-4">Monthly Calendar</h2>
            <div className="bg-[#1E1E1E] rounded-xl p-4 text-center py-8">
              <i className="ri-calendar-line text-5xl text-[#3071FF] mb-4"></i>
              <h3 className="text-lg font-medium mb-2">Monthly Calendar View</h3>
              <p className="text-[#B3B3B3] max-w-md mx-auto mb-4">
                A full calendar view is coming soon! For now, use the date selector above to see your scheduled movies.
              </p>
            </div>
          </section>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
      
      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] text-white border-[#282828]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Schedule a Movie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Movie</label>
              {moviesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select 
                  className="w-full p-2 rounded-md bg-[#282828] border border-[#3A3A3A] text-white"
                  value={selectedMovie || ""}
                  onChange={(e) => setSelectedMovie(Number(e.target.value))}
                >
                  <option value="">Select a movie</option>
                  {moviesData?.movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>{movie.title}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <input 
                type="date" 
                className="w-full p-2 rounded-md bg-[#282828] border border-[#3A3A3A] text-white"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <input 
                type="time" 
                className="w-full p-2 rounded-md bg-[#282828] border border-[#3A3A3A] text-white"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="isShared" 
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded bg-[#282828] border-[#3A3A3A] text-[#3071FF]"
              />
              <label htmlFor="isShared" className="text-sm font-medium">Make this a shared viewing</label>
            </div>
            
            {isShared && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Viewing Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Movie Night, Sci-Fi Marathon" 
                  className="w-full p-2 rounded-md bg-[#282828] border border-[#3A3A3A] text-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                className="px-4 py-2 rounded-md bg-[#282828] text-[#B3B3B3] hover:bg-[#282828]/80"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md bg-[#3071FF] text-white hover:bg-[#3071FF]/90 disabled:opacity-50"
                onClick={handleScheduleMovie}
                disabled={!selectedMovie || scheduleMutation.isPending}
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Movie'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
