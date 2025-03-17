"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Header() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Header blur effect based on scroll
  const headerBlur = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 8]
  );
  
  const headerOpacity = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 1]
  );

  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 0.5]
  );

  // Force dark theme
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Only set theme on the client side to avoid hydration mismatches
    if (typeof window !== 'undefined') {
      setTheme("dark");
    }
  }, [setTheme]);

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 z-50"
        style={{ scaleX }}
      />

      {/* Turso-style floating header card */}
      <div className="fixed top-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <div
          className="mx-auto max-w-7xl pointer-events-auto"
        >
          <motion.div 
            className="rounded-2xl overflow-hidden border border-white/10"
            style={{
              backdropFilter: `blur(${headerBlur}px)`,
              backgroundColor: `rgba(10, 10, 15, ${headerOpacity})`,
              boxShadow: `0 10px 30px -10px rgba(0, 0, 0, ${shadowOpacity})`,
            }}
          >
            <div className="relative">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
              
              {/* Header content */}
              <div className="flex items-center justify-between py-3 pr-4 pl-2 bg-background/60 backdrop-blur-sm">
                <Link href="/">
                  <Image src="/logo-text.png" alt="DocMate" width={130} height={1000} />
                </Link>
                
                {/* Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  {[
                    { label: 'Read Docs', href: '/docs' },
                    { label: 'Use Cases', href: '/use-cases' },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'Learn More', href: '/learn-more' },
                  ].map((item) => (
                    <a 
                      key={item.label}
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-white transition-colors duration-300 relative group"
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                    </a>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <Link href="/demo">
                    <Button size="sm" variant="ghost" className="text-sm gap-1 hover:bg-white/5 text-muted-foreground hover:text-white">
                      Try Demo <ArrowRight className="h-3 w-3 animate-pulse " />
                    </Button>
                  </Link>
                  <Button size="icon" variant="ghost" className="md:hidden text-muted-foreground hover:text-white hover:bg-white/5">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 