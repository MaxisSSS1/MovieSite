import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MobileHeader, DesktopHeader } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailsModal from "@/components/movies/MovieDetails";
import { useRoute } from "wouter";
import { formatDate, formatTimeAmPm } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";

export default function SharedViewings() {
  const [isMovieRoute] = useRoute("/movie/:id");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("20:00");
  const [title, setTitle] = useState("");
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/shared-viewings'],
  });
  
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['/api/movies'],
  });
  
  const createSharedViewingMutation = useMutation({
    mutationFn: async (viewingData: any) => {
      const res = await apiRequest('POST', '/api/schedule', viewingData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shared-viewings'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Shared viewing created",
        description: "Your shared viewing has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create shared viewing",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });
  
  useEffect(() => {
    document.title = "Shared Viewings - MovieMood";
  }, []);
  
  const handleCreateSharedViewing = () => {
    if (!selectedMovie || !title || !user) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledFor = new Date(selectedDate);
    scheduledFor.setHours(hours, minutes);
    
    const viewingData = {
      userId: user.id,
      movieId: selectedMovie,
      scheduledFor,
      isShared: true,
      title,
      participants: [2, 3, 4] // Mock participants for demo
    };
    
    createSharedViewingMutation.mutate(viewingData);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
        {/* Mobile Header */}
        <MobileHeader title="Shared Viewings" />
        
        {/* Desktop Header with Search */}
        <DesktopHeader title="Shared Viewings" />
        
        {/* Content Sections */}
        <div className="p-4 md:p-6">
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-poppins">Watch Movies Together</h2>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white px-4 py-1.5 rounded-lg flex items-center"
              >
                <i className="ri-add-line mr-1.5"></i> Create New
              </button>
            </div>
            
            <div className="bg-[#1E1E1E] rounded-xl p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">What are Shared Viewings?</h3>
              <p className="text-[#B3B3B3] mb-4">
                Shared viewings allow you to watch movies with friends, even when you're apart. 
                Schedule a movie, invite friends, and enjoy a synchronized viewing experience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-calendar-check-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Schedule Together</h4>
                  <p className="text-sm text-[#B3B3B3]">Pick a movie and time that works for everyone</p>
                </div>
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-group-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Invite Friends</h4>
                  <p className="text-sm text-[#B3B3B3]">Share the viewing with friends to join the experience</p>
                </div>
                <div className="bg-[#282828] p-4 rounded-lg">
                  <i className="ri-chat-1-line text-[#3CAEFF] text-2xl mb-2"></i>
                  <h4 className="font-medium mb-1">Watch & Chat</h4>
                  <p className="text-sm text-[#B3B3B3]">Enjoy the movie together with synchronized playback</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold font-poppins mb-4">Upcoming Shared Viewings</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                <p className="text-[#B3B3B3]">Unable to load shared viewings. Please try again later.</p>
              </div>
            ) : data?.sharedViewings && data.sharedViewings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.sharedViewings.map((viewing) => (
                  <div key={viewing.id} className="p-4 bg-[#1E1E1E] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{viewing.title || "Movie Night"}</h4>
                        <p className="text-[#B3B3B3] text-sm mt-1">
                          {formatDate(new Date(viewing.scheduledFor))} • {formatTimeAmPm(new Date(viewing.scheduledFor))}
                        </p>
                      </div>
                      <span className="bg-[#FFC107]/20 text-[#FFC107] text-xs px-2 py-1 rounded">
                        {viewing.participants?.length || 0} participants
                      </span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-[#282828] rounded flex items-center">
                      <div className="w-12 h-12 bg-[#3CAEFF]/20 rounded flex items-center justify-center mr-3">
                        <i className="ri-film-line text-[#3CAEFF]"></i>
                      </div>
                      <div>
                        <h5 className="font-medium">Movie</h5>
                        <p className="text-sm text-[#B3B3B3]">ID: {viewing.movieId}</p>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 -space-x-2">
                      {/* Participant avatars (placeholders) */}
                      {[...Array(Math.min(4, viewing.participants?.length || 0))].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-7 h-7 rounded-full bg-[#3CAEFF] border border-[#121212] flex items-center justify-center text-xs font-medium text-[#121212]"
                        >
                          U{i+1}
                        </div>
                      ))}
                      {(viewing.participants?.length || 0) > 4 && (
                        <span className="w-7 h-7 rounded-full bg-[#3CAEFF] text-[#121212] flex items-center justify-center text-xs font-medium border border-[#121212]">
                          +{viewing.participants!.length - 4}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex mt-4 justify-between">
                      <button className="bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white text-sm font-medium py-1.5 px-4 rounded transition">
                        Join
                      </button>
                      <button className="text-[#B3B3B3] hover:text-white text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
                <i className="ri-group-line text-5xl text-[#3CAEFF] mb-4"></i>
                <h3 className="text-lg font-medium mb-2">No shared viewings available</h3>
                <p className="text-[#B3B3B3] max-w-md mx-auto mb-4">
                  Create a shared viewing to watch movies with friends. It's more fun together!
                </p>
                <button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white px-4 py-2 rounded-md"
                >
                  Create Your First Shared Viewing
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Movie Details Modal (conditionally rendered) */}
      {isMovieRoute && <MovieDetailsModal />}
      
      {/* Create Shared Viewing Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] text-white border-[#282828]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create Shared Viewing</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Friends (Coming Soon)</label>
              <div className="bg-[#282828] border border-[#3A3A3A] p-3 rounded-md">
                <p className="text-[#B3B3B3] text-sm">
                  Friend invitation functionality will be available soon. For now, your shared viewing will be visible to all users.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                className="px-4 py-2 rounded-md bg-[#282828] text-[#B3B3B3] hover:bg-[#282828]/80"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md bg-[#3CAEFF] text-white hover:bg-[#3CAEFF]/90 disabled:opacity-50"
                onClick={handleCreateSharedViewing}
                disabled={!selectedMovie || !title || createSharedViewingMutation.isPending}
              >
                {createSharedViewingMutation.isPending ? 'Creating...' : 'Create Shared Viewing'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
