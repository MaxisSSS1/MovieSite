import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ href, icon, children, isActive }: NavItemProps) => {
  return (
    <li>
      <Link href={href} className={cn(
        "flex items-center py-2 px-4 rounded transition duration-200",
        isActive 
          ? "bg-[#282828] text-white" 
          : "text-[#B3B3B3] hover:text-white"
      )}>
        <i className={`${icon} mr-3`}></i>
        <span>{children}</span>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#1E1E1E] p-4">
      <div className="flex items-center mb-8">
        <div className="text-[#3071FF] font-poppins font-bold text-2xl">Movie<span className="text-[#FFC107]">Mood</span></div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <NavItem href="/" icon="ri-home-5-line" isActive={location === "/"}>
            Home
          </NavItem>
          <NavItem href="/discover" icon="ri-compass-3-line" isActive={location === "/discover"}>
            Discover
          </NavItem>
          <NavItem href="/mymood" icon="ri-emotion-happy-line" isActive={location === "/mymood"}>
            My Mood
          </NavItem>
          <NavItem href="/schedule" icon="ri-calendar-line" isActive={location === "/schedule"}>
            Schedule
          </NavItem>
          <NavItem href="/shared" icon="ri-group-line" isActive={location === "/shared"}>
            Shared Viewings
          </NavItem>
          <NavItem href="/achievements" icon="ri-trophy-line" isActive={location === "/achievements"}>
            Achievements
          </NavItem>
        </ul>
      </nav>
      
      <div className="mt-auto">
        <div className="border-t border-[#282828] pt-4">
          {isLoading ? (
            <div className="flex items-center p-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="ml-2 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : user ? (
            <Link href="/profile">
              <a className="flex items-center p-2 rounded hover:bg-[#282828] transition duration-200">
                <img 
                  src={user.profileImage} 
                  className="w-8 h-8 rounded-full object-cover" 
                  alt={user.displayName} 
                />
                <div className="ml-2">
                  <div className="text-sm font-medium text-white">{user.displayName}</div>
                  <div className="text-xs text-[#B3B3B3]">{user.title}</div>
                </div>
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a className="flex items-center p-2 rounded hover:bg-[#282828] transition duration-200">
                <i className="ri-login-box-line w-8 h-8 flex items-center justify-center text-[#B3B3B3]"></i>
                <div className="ml-2">
                  <div className="text-sm font-medium text-white">Login</div>
                  <div className="text-xs text-[#B3B3B3]">Sign in to your account</div>
                </div>
              </a>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
