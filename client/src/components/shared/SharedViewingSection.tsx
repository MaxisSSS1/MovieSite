import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTimeAmPm } from "@/lib/utils";

export default function SharedViewingSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/shared-viewings'],
  });
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (isError) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">Shared Viewings</h2>
          <Link href="/shared">
            <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
          </Link>
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="p-6 text-center">
            <p className="text-[#B3B3B3]">Unable to load shared viewings. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }
  
  const { sharedViewings } = data;
  
  if (!sharedViewings || sharedViewings.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-poppins">Shared Viewings</h2>
          <Link href="/shared">
            <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
          </Link>
        </div>
        
        <div className="bg-[#1E1E1E] rounded-xl p-4">
          <div className="p-6 text-center">
            <i className="ri-group-line text-4xl text-[#3CAEFF] mb-3"></i>
            <h3 className="font-medium mb-2">No shared viewings available</h3>
            <p className="text-[#B3B3B3] text-sm mb-4">Join or create a shared viewing to watch movies with friends</p>
            <Link href="/shared/create">
              <a className="inline-block bg-[#3CAEFF] hover:bg-[#3CAEFF]/90 text-white font-medium py-2 px-4 rounded-md transition">
                Create Shared Viewing
              </a>
            </Link>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold font-poppins">Shared Viewings</h2>
        <Link href="/shared">
          <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium">View All</a>
        </Link>
      </div>
      
      <div className="bg-[#1E1E1E] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Upcoming Watch Parties</h3>
          <Link href="/shared/create">
            <a className="text-[#3CAEFF] hover:text-[#3CAEFF]/80 text-sm font-medium flex items-center">
              <i className="ri-add-line mr-1"></i> Create New
            </a>
          </Link>
        </div>
        
        <div className="space-y-4">
          {sharedViewings.map((viewing) => (
            <div key={viewing.id} className="p-4 bg-[#282828] rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{viewing.title || "Movie Night"}</h4>
                  <p className="text-[#B3B3B3] text-xs mt-1">
                    {formatDate(new Date(viewing.scheduledFor))} • {formatTimeAmPm(new Date(viewing.scheduledFor))}
                  </p>
                </div>
                <span className="bg-[#FFC107]/20 text-[#FFC107] text-xs px-2 py-1 rounded">
                  {viewing.participants?.length || 0} participants
                </span>
              </div>
              
              <div className="flex mt-4 -space-x-2">
                {/* Since we don't have actual user images for participants, show placeholders */}
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
                <Link href={`/shared/${viewing.id}`}>
                  <a className="text-[#B3B3B3] hover:text-white text-sm font-medium">
                    View Details
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
