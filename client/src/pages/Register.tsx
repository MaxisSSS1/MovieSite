import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
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
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsRegistering(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        username: values.username,
        displayName: values.displayName,
        password: values.password,
      });

      if (res.ok) {
        toast({
          title: "Registration successful",
          description: "You have been registered successfully. Please log in.",
        });
        navigate("/login");
      } else {
        const data = await res.json();
        toast({
          title: "Registration failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[#3071FF] font-poppins font-bold text-3xl mb-2">
            Movie<span className="text-[#FFC107]">Mood</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Create an account</h1>
          <p className="text-[#B3B3B3] mt-2">
            Join MovieMood to track your movie progress, get personalized recommendations, and participate in shared viewings.
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
                        placeholder="your_username" 
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
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="How others will see you" 
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
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
                disabled={isRegistering}
              >
                {isRegistering ? "Creating your account..." : "Create Account"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-[#B3B3B3]">
                  Already have an account?{" "}
                  <Link href="/login">
                    <a className="text-[#3071FF] hover:underline">Log in</a>
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-[#B3B3B3] text-sm">
            By registering, you agree to our{" "}
            <Link href="/terms">
              <a className="text-[#3071FF] hover:underline">Terms of Service</a>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <a className="text-[#3071FF] hover:underline">Privacy Policy</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}