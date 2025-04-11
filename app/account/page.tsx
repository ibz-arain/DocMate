"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";

// Create a client component that uses useSearchParams
function AccountContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { login, register } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the redirect path from URL params or sessionStorage on component mount
  useEffect(() => {
    // First check URL parameters (from middleware redirects)
    const urlRedirect = searchParams.get('redirect');
    if (urlRedirect) {
      setRedirectPath(urlRedirect);
      
      // Also save to sessionStorage in case the page refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', urlRedirect);
      }
      return;
    }
    
    // Then check sessionStorage (from client-side redirects)
    if (typeof window !== 'undefined') {
      const storedPath = sessionStorage.getItem('redirectAfterLogin');
      if (storedPath) {
        setRedirectPath(storedPath);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        await login(username, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Redirect to the stored path or back if none exists
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.back();
        }
      } else {
        await register(username, password);
        await login(username, password); // Auto login after registration
        toast({
          title: "Account created!",
          description: "Your account has been created and you are now signed in.",
        });
        
        // Redirect to the stored path or back if none exists
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.back();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Enter your credentials to sign in"
              : "Enter your details to create an account"}
          </p>
          {redirectPath && (
            <p className="text-xs text-muted-foreground">
              You'll be redirected back after signing in
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "signin" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              mode === "signin" ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            disabled={loading}
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>

        <Button
          variant="ghost"
          className="absolute top-4 left-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}

// Simple loading component
function AccountLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Loading account page...</p>
    </div>
  );
}

// Main component with Suspense boundary
export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
} 