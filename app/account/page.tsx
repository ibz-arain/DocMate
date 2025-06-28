"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuthContext } from "@/components/auth-provider";

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
    <>
      <CodeBackground />
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 left-8 z-20"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>back to home</span>
          </Link>
        </motion.div>

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

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80px" }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="h-px bg-primary/50 mx-auto"
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
    </>
  );
}

function AccountLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white/60 font-mono">Loading...</p>
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