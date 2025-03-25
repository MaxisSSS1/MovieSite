import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";

// Pages
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import MyMood from "@/pages/MyMood";
import Schedule from "@/pages/Schedule";
import SharedViewings from "@/pages/SharedViewings";
import Achievements from "@/pages/Achievements";
import Profile from "@/pages/Profile";
import MovieDetails from "@/pages/MovieDetails";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/mymood" component={MyMood} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/shared" component={SharedViewings} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/profile" component={Profile} />
      <Route path="/movie/:id" component={MovieDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router />
        <Toaster />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
