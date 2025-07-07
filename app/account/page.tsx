"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuthContext } from "@/components/auth-provider";

// Create a client component that uses useSearchParams
function AccountContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuthContext();

  // Get the redirect path from URL params
  useEffect(() => {
    const urlRedirect = searchParams.get('redirect');
    if (urlRedirect) {
      setRedirectPath(urlRedirect);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectPath || "/playground");
    }
  }, [isAuthenticated, loading, router, redirectPath]);

  const handleAuthSuccess = () => {
    router.push(redirectPath || "/playground");
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  // Show loading while checking authentication
  if (loading) {
    return <AccountLoading />;
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return <AccountLoading />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          <div className="space-y-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="justify-center items-center"
              >
                <Link href="/">
                  <Image src="/logo-text.png" alt="Docmate" width={195} height={36} className="mx-auto mb-6" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "60px" }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="h-px bg-primary mx-auto shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              />
            </div>

            <AuthForm
              mode={mode}
              onSuccess={handleAuthSuccess}
              onToggleMode={toggleMode}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AccountLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
} 