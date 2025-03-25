import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a className={cn(
        "flex flex-col items-center p-3",
        isActive ? "text-[#E50914]" : "text-[#B3B3B3]"
      )}>
        <i className={`${icon} text-xl`}></i>
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
};

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-[#282828] z-50">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon="ri-home-5-line" 
          label="Home" 
          isActive={location === "/"} 
        />
        <NavItem 
          href="/discover" 
          icon="ri-compass-3-line" 
          label="Discover" 
          isActive={location === "/discover"} 
        />
        <NavItem 
          href="/mymood" 
          icon="ri-emotion-happy-line" 
          label="Mood" 
          isActive={location === "/mymood"} 
        />
        <NavItem 
          href="/schedule" 
          icon="ri-calendar-line" 
          label="Schedule" 
          isActive={location === "/schedule"} 
        />
        <NavItem 
          href="/profile" 
          icon="ri-user-line" 
          label="Profile" 
          isActive={location === "/profile"} 
        />
      </div>
    </div>
  );
}
