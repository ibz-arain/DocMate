"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme is automatically handled by ThemeProvider
  const { theme } = useTheme();

  const handleAuthAction = () => {
    // Navigate to playground in current tab
    router.push('/playground');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
          <div
            className="rounded-2xl overflow-hidden border border-white/10"
          >
            <div className="relative">
              {/* Subtle gradient overlay */}
              
              {/* Header content */}
              <div className="flex items-center justify-between py-3 pr-4 pl-4 bg-background/60 backdrop-blur-sm">
                <Link href="/" className="flex items-center">
                  <Image src="/logo-bird.png" alt="Docimate" width={32} height={32} />
                  <Image src="/logo-text.png" alt="Docimate" width={100} height={20} />
                </Link>
                
                {/* Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  {[
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Use Cases', href: '/use-cases' },
                    { label: 'Read Docs', href: '/docs' },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'About Us', href: '/about' }
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-sm font-medium border-muted hover:bg-muted/30 transition-all duration-300 min-w-[100px] justify-center gap-1 group"
                    onClick={handleAuthAction}
                  >
                    Get to Work
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                  
                  {/* Mobile Menu Button with Animated Burger to X */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="md:hidden text-muted-foreground hover:text-white hover:bg-white/5 relative"
                    onClick={toggleMobileMenu}
                  >
                    <div className="w-5 h-5 relative">
                      {/* Top line */}
                      <motion.div
                        className="absolute top-1 left-0 w-5 h-0.5 bg-current"
                        animate={{
                          rotate: isMobileMenuOpen ? 45 : 0,
                          y: isMobileMenuOpen ? 6 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                      {/* Middle line */}
                      <motion.div
                        className="absolute top-2.5 left-0 w-5 h-0.5 bg-current"
                        animate={{
                          opacity: isMobileMenuOpen ? 0 : 1,
                          scaleX: isMobileMenuOpen ? 0 : 1,
                        }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      />
                      {/* Bottom line */}
                      <motion.div
                        className="absolute top-4 left-0 w-5 h-0.5 bg-current"
                        animate={{
                          rotate: isMobileMenuOpen ? -45 : 0,
                          y: isMobileMenuOpen ? -6 : 0,
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Card */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileMenu}
            />
            
            {/* Menu Card */}
            <motion.div
              className="fixed top-20 right-4 z-40 md:hidden"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="bg-background/80 mt-4 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[200px]">
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Use Cases', href: '/use-cases' },
                    { label: 'Read Docs', href: '/docs' },
                    { label: 'Changelog', href: '/changelog' },
                    { label: 'About Us', href: '/about' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 