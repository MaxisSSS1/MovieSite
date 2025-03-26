import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [, navigate] = useLocation();
  const { login } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoggingIn(true);
    try {
      await login(values.username, values.password);
      toast({
        title: "Login successful",
        description: "Welcome back to MovieMood!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[#3071FF] font-poppins font-bold text-3xl mb-2">
            Movie<span className="text-[#FFC107]">Mood</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-[#B3B3B3] mt-2">
            Login to continue your movie journey
          </p>
        </div>

        <div className="bg-[#1E1E1E] rounded-xl p-6 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your username" 
                        {...field} 
                        className="bg-[#282828] border-[#3071FF]/20 focus:border-[#3071FF]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Your password" 
                        {...field} 
                        className="bg-[#282828] border-[#3071FF]/20 focus:border-[#3071FF]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-[#3071FF] hover:bg-[#3071FF]/90"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-[#B3B3B3]">
                  Don't have an account?{" "}
                  <Link href="/register">
                    <a className="text-[#3071FF] hover:underline">Register</a>
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-[#B3B3B3] text-sm">
            <Link href="/forgot-password">
              <a className="text-[#3071FF] hover:underline">Forgot password?</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}