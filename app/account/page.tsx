"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Dynamic Code Background component
function CodeBackground() {
  useEffect(() => {
    const canvas = document.getElementById('code-canvas') as HTMLCanvasElement;
    const loginForm = document.querySelector('.login-form-container') as HTMLElement;
    if (!canvas || !loginForm) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // Sample document processing data structures
    const documentSnippets = [
      // Document templates
      `{
  "documentType": "T4",
  "fields": {
    "employeeName": "...",
    "socialInsuranceNumber": "XXX-XXX-XXX",
    "employmentIncome": "$XX,XXX.XX"
  }
}`,
      // API Response
      `{
  "status": "success",
  "confidence": 0.98,
  "extracted_data": {
    "tables": [...],
    "fields": {...}
  }
}`,
      // Processing Config
      `{
  "extraction_mode": "intelligent",
  "output_format": "structured",
  "ai_model": "docmate-v2"
}`,
      // Document Analysis
      `{
  "analysis": {
    "type": "financial",
    "accuracy": 99.8,
    "fields_detected": 24
  }
}`
    ];

    // Processing status messages
    const statusMessages = [
      "Initializing document loading...",
      "Analyzing document structure...",
      "Extracting data fields...",
      "Applying AI processing...",
      "Generating structured output...",
      "Validating extracted data...",
      "Optimizing results...",
      "Processing complete!"
    ];

    interface AnimatedText {
      x: number;
      y: number;
      text: string;
      progress: number;
      speed: number;
      mode: 'typing' | 'erasing' | 'complete';
      color: string;
      delay: number;
    }

    function calculateGridPositions(count: number): { x: number; y: number }[] {
      const positions: { x: number; y: number }[] = [];
      
      // Get login form position and dimensions
      const formRect = loginForm.getBoundingClientRect();
      const formCenterX = formRect.left + (formRect.width / 2);
      const formCenterY = formRect.top + (formRect.height / 2);
      
      // Define the area where text should appear
      const textAreaWidth = Math.max(canvas.width, formRect.width * 2.5);
      const textAreaHeight = Math.max(canvas.height, formRect.height * 2.5);
      
      // Calculate grid dimensions centered on the form
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      
      const cellWidth = textAreaWidth / cols;
      const cellHeight = textAreaHeight / rows;
      
      // Calculate starting position to center grid on form
      const startX = formCenterX - (textAreaWidth / 2);
      const startY = formCenterY - (textAreaHeight / 2);

      // Generate positions in a grid pattern around the form
      let index = 0;
      for (let row = 0; row < rows && index < count; row++) {
        for (let col = 0; col < cols && index < count; col++) {
          // Add controlled randomness within each cell
          const randomX = (Math.random() - 0.5) * (cellWidth * 0.6);
          const randomY = (Math.random() - 0.5) * (cellHeight * 0.6);
          
          const x = startX + (col * cellWidth) + (cellWidth / 2) + randomX;
          const y = startY + (row * cellHeight) + (cellHeight / 2) + randomY;
          
          // Ensure position is within canvas bounds with padding
          const padding = 50;
          const boundedX = Math.min(Math.max(x, padding), canvas.width - padding);
          const boundedY = Math.min(Math.max(y, padding), canvas.height - padding);
          
          positions.push({ x: boundedX, y: boundedY });
          index++;
        }
      }

      // Shuffle positions for more natural appearance
      return positions.sort(() => Math.random() - 0.5);
    }

    // Create initial animated texts with grid positioning
    function createAnimatedText(position: { x: number; y: number }) {
      const isStatus = Math.random() > 0.7;
      const text = isStatus 
        ? statusMessages[Math.floor(Math.random() * statusMessages.length)]
        : documentSnippets[Math.floor(Math.random() * documentSnippets.length)];
      
      return {
        x: position.x,
        y: position.y,
        text,
        progress: 0,
        speed: 0.3 + Math.random() * 0.5,
        mode: 'typing' as const,
        color: isStatus ? 'hsl(var(--primary))' : 'cyan',
        delay: Math.random() * 2000
      };
    }

    // Adjust text count based on screen size but ensure good coverage
    const baseCount = 12;
    const screenRatio = (canvas.width * canvas.height) / (1920 * 1080); // Reference resolution
    const textCount = Math.min(Math.max(Math.floor(baseCount * screenRatio), 8), 16);

    const positions = calculateGridPositions(textCount);
    const animatedTexts: AnimatedText[] = positions.map(pos => createAnimatedText(pos));

    let lastTime = 0;
    function draw(currentTime: number) {
      if (!ctx) return;
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animatedTexts.forEach((item, index) => {
        if (item.delay > 0) {
          item.delay -= deltaTime;
          return;
        }

        ctx.font = '14px monospace';
        ctx.fillStyle = item.color;

        // Center align text
        const textWidth = ctx.measureText(item.text).width;
        const x = item.x - (textWidth / 2);

        if (item.mode === 'typing') {
          const displayText = item.text.substring(0, Math.floor(item.progress));
          const partialWidth = ctx.measureText(displayText).width;
          ctx.fillText(displayText, x, item.y);
          item.progress += item.speed;

          if (item.progress >= item.text.length) {
            item.mode = 'complete';
            item.progress = item.text.length;
            setTimeout(() => {
              item.mode = 'erasing';
            }, 2000);
          }
        } else if (item.mode === 'complete') {
          ctx.fillText(item.text, x, item.y);
        } else if (item.mode === 'erasing') {
          const displayText = item.text.substring(0, Math.floor(item.progress));
          ctx.fillText(displayText, x, item.y);
          item.progress -= item.speed;

          if (item.progress <= 0) {
            // Replace with new text but keep the same position
            const newText = createAnimatedText({ x: item.x, y: item.y });
            animatedTexts[index] = {
              ...newText,
              delay: 0 // Start immediately
            };
          }
        }
      });

      requestAnimationFrame(draw);
    }

    const animation = requestAnimationFrame(draw);

    // Update positions on resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Recalculate positions relative to form
      const newPositions = calculateGridPositions(textCount);
      animatedTexts.forEach((text, index) => {
        text.x = newPositions[index].x;
        text.y = newPositions[index].y;
      });
    });

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas id="code-canvas" className="fixed inset-0 z-0 opacity-30" />;
}

// Create a client component that uses useSearchParams
function AccountContent() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { login, register, user } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const text = mode === 'signin' ? 'Welcome back!' : 'Create your account';
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setTypedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [mode]);

  // Get the redirect path from URL params or sessionStorage on component mount
  useEffect(() => {
    const urlRedirect = searchParams.get('redirect');
    if (urlRedirect) {
      setRedirectPath(urlRedirect);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', urlRedirect);
      }
      return;
    }
    
    if (typeof window !== 'undefined') {
      const storedPath = sessionStorage.getItem('redirectAfterLogin');
      if (storedPath) {
        setRedirectPath(storedPath);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (user && redirectPath) {
        try {
          await router.push(redirectPath);
          sessionStorage.removeItem('redirectAfterLogin');
        } catch (navError) {
          console.error('Navigation error:', navError);
          router.push('/');
        }
      }
    };

    handleAuthStateChange();
  }, [user, redirectPath, router]);

  const handleOAuthSignIn = async (provider: "google" | "azure-ad") => {
    setLoading(true);
    try {
      const callbackUrl = redirectPath || '/';
      let authParams: { prompt?: string } | undefined = undefined; // Default to undefined

      if (provider === "google" && typeof window !== 'undefined') {
        const forcePrompt = sessionStorage.getItem('forceGooglePrompt');
        if (forcePrompt === 'true') {
          authParams = { prompt: "select_account" };
          sessionStorage.removeItem('forceGooglePrompt'); // Clear the flag after use
        }
      }
      
      // Pass authParams (which is either { prompt: 'select_account' } or undefined)
      await signIn(provider, { callbackUrl }, authParams);
      
    } catch (error: any) {
      toast({
        title: "OAuth Sign-In Error",
        description: error.message || "Something went wrong during OAuth sign-in.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

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
        
        if (!redirectPath) {
          router.back();
        }
      } else {
        await register(username, password);
        await login(username, password);
        toast({
          title: "Account created!",
          description: "Your account has been created and you are now signed in.",
        });
        
        if (!redirectPath) {
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
    <>
      <CodeBackground />
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-lg login-form-container"
        >
          <div className="relative bg-black/95 backdrop-blur-sm rounded-3xl p-8 pt-12 shadow-2xl border border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <div className="space-y-8">
              <div className="text-center">
                
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="justify-center items-center"
                >
                  <Link href="/">
                    <Image src="/logo-text.png" alt="Docmate" width={195} height={36} className="mx-auto mb-4" />
                  </Link>
                </motion.div>

                

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-mono text-2xl mb-2 text-gray-300"
                >
                  {typedText}<span className="animate-blink">_</span>
                </motion.h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="h-px bg-primary/50 mx-auto"
                ></motion.div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="font-mono text-sm font-medium">
                    <span className="text-blue-400">const</span> <span className="text-yellow-400">USERNAME</span> <span className="text-white/60">=</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={mode === 'signup' || !loading}
                    disabled={loading}
                    className="bg-black font-mono text-primary border-white/20 focus:border-primary/50 focus:ring-0 placeholder:text-primary/30"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="font-mono text-sm font-medium">
                    <span className="text-blue-400">const</span> <span className="text-yellow-400">PASSWORD</span> <span className="text-white/60">=</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={mode === 'signup' || !loading}
                    disabled={loading}
                    className="bg-black font-mono text-primary border-white/20 focus:border-primary/50 focus:ring-0 placeholder:text-primary/30"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-mono border border-primary/30 shadow-sm transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-white/90">{mode === "signin" ? "authenticating()" : "createUser()"}</span>
                      </>
                    ) : (
                      <span className="text-white/90">{mode === "signin" ? "authenticate()" : "createUser()"}</span>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center my-6"
              >
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-xs font-mono text-white/60">// OR //</span>
                <div className="flex-grow border-t border-white/20"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <Button
                  type="button"
                  className="w-full bg-black/80 hover:bg-white/10 text-white/90 font-mono border border-white/30 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google()
                </Button>
                <Button
                  type="button"
                  className="w-full bg-black/80 hover:bg-white/10 text-white/90 font-mono border border-white/30 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => handleOAuthSignIn("azure-ad")}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M11.4 21.9H2.9V13.4h8.5v8.5zm0-9.9H2.9V3.5h8.5v8.5zm9.6 9.9h-8.5V13.4h8.5v8.5zm0-9.9h-8.5V3.5h8.5v8.5z"/></svg>
                  Continue with Microsoft()
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="font-mono text-xs text-white/60 hover:text-primary transition-colors duration-300"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  disabled={loading}
                >
                  <span className="text-white/60">
                    {mode === "signin"
                      ? "// Don't have an account? Sign Up"
                      : "// Already registered? Login"}
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// Simple loading component
function AccountLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-sm font-mono text-primary">Initializing system...</p>
      </motion.div>
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