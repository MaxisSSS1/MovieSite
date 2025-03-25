import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  displayName: string;
  profileImage: string;
  level: number;
  xp: number;
  title: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/users/current'],
    retry: false
  });
  
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);
  
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.displayName}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
      });
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ['/api/users/current'] });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  
  return (
    <UserContext.Provider value={{ user, isLoading, isError, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
