import { useState } from "react";
import { Link, useLocation } from "wouter";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title = "MovieMood" }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-[#1E1E1E] sticky top-0 z-40 p-4 flex items-center justify-between">
      <div className="text-[#3071FF] font-poppins font-bold text-xl">
        {title === "MovieMood" ? (
          <>Movie<span className="text-[#FFC107]">Mood</span></>
        ) : (
          title
        )}
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-2 text-white">
          <i className="ri-search-line text-xl"></i>
        </button>
        <button className="p-2 text-white relative">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFC107] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}

interface DesktopHeaderProps {
  title: string;
}

export function DesktopHeader({ title }: DesktopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Search for:", searchQuery);
  };
  
  return (
    <div className="hidden md:flex items-center justify-between p-6 bg-[#121212] sticky top-0 z-40">
      <h1 className="text-2xl font-poppins font-semibold">{title}</h1>
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="search" 
            placeholder="Search for movies..." 
            className="bg-[#282828] text-[#B3B3B3] py-2 pl-10 pr-4 rounded-full w-64 focus:outline-none focus:ring-1 focus:ring-[#3071FF]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-[#B3B3B3]"></i>
        </form>
        <button className="p-2 text-white relative">
          <i className="ri-notification-3-line text-xl"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFC107] rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
