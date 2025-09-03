"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight, Receipt, FileCheck, LightbulbIcon, Cable, FileSpreadsheet, ArrowUpRight, Sparkles, Building2, ReceiptText, Stethoscope, BatteryCharging, Code, Plus, Users, History, Upload, Menu, TableIcon, MessageCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import { useRef, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AppMockup from "@/components/app-mockup";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GradientText } from "@/components/use-cases/shared/GradientText";


// Card component with hover expansion effect
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [scale, setScale] = useState(1);

  const handleMouseEnter = () => {
    setScale(1.03);
  };

  const handleMouseLeave = () => {
    setScale(1);
  };

  return (
    <div
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `scale(${scale})`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Enhanced Particle background component with more varied particles
const ParticleBackground = () => {
  // Use state to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  
  // Only run on client-side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't render anything during SSR
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 150 }).map((_, i) => {
        const size = Math.random() * 6 + (i % 5 === 0 ? 4 : 1);
        const opacity = Math.random() * 0.3 + 0.1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: `rgba(var(--primary-rgb), ${opacity})`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: i % 8 === 0 ? 'blur(1px)' : 'none',
            }}
            animate={{
              y: [0, Math.random() * -150 - 50],
              opacity: [0, opacity, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Theme is automatically handled by ThemeProvider
  const { theme } = useTheme();

  // Gradient background animation only - removed cursor tracking
  const backgroundX = useMotionValue(0);
  const backgroundY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(
    circle at ${backgroundX}px ${backgroundY}px,
    rgba(var(--primary-rgb), 0.15) 0%,
    rgba(var(--primary-rgb), 0.05) 40%,
    rgba(0, 0, 0, 0) 60%
  )`;

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

  const borderOpacity = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 0.1]
  );

  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, 0.1],
    [0, 0.5]
  );

  // Remove noise texture effect
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
  }, []);

  return (
    <div className="relative">
      <Header />
      <ScrollArea className="h-screen w-full">
        <div 
          className="min-h-screen bg-black relative"
        >
          {/* Cool animated background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Circuit board pattern */}
            <div className="absolute inset-0 bg-circuit-pattern opacity-[0.07]"></div>
            
            {/* Enhanced grid patterns with multiple layers */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--primary-rgb),0.15)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)] opacity-30"></div>
            <div className="absolute inset-0 bg-grid-pattern-primary opacity-20"></div>
            
            {/* Additional grid layers with different sizes and rotations */}
            <div className="absolute inset-0 bg-grid-small-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-grid-large-pattern opacity-[0.05]"></div>
            <div className="absolute inset-0 bg-grid-diagonal-pattern opacity-[0.04]"></div>
            
            {/* Glowing orbs */}
            <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] animate-pulse-slower"></div>
            <div className="absolute top-[40%] right-[30%] w-72 h-72 rounded-full bg-purple-500/20 blur-[100px] animate-pulse-slow animation-delay-2000"></div>
            
            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-primary/50 rounded-full animate-float"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
            
            {/* Geometric shapes (existing and additional ones) */}
            <div className="absolute top-[15%] left-[80%] w-40 h-40 border-2 border-primary/20 rounded-lg [transform:rotate(15deg)] animate-spin-very-slow"></div>
            <div className="absolute top-[75%] left-[20%] w-40 h-40 border-2 border-blue-500/20 rounded-xl [transform:rotate(45deg)] animate-spin-slow"></div>
            <div className="absolute top-[50%] left-[40%] w-24 h-24 border-2 border-purple-500/20 rounded-md [transform:rotate(30deg)] animate-spin-slow animation-delay-3000"></div>
            
            {/* Additional spinning shapes */}
            <div className="absolute top-[25%] left-[10%] w-32 h-32 border border-primary/15 rounded-lg [transform:rotate(20deg)] animate-spin-medium"></div>
            <div className="absolute top-[85%] left-[75%] w-36 h-36 border border-blue-500/15 rounded-xl [transform:rotate(-15deg)] animate-spin-slow-reverse"></div>
            <div className="absolute top-[35%] left-[65%] w-20 h-20 border border-purple-500/15 rounded-md [transform:rotate(12deg)] animate-spin-medium-reverse animation-delay-2000"></div>
            <div className="absolute top-[60%] left-[85%] w-28 h-28 border-2 border-primary/10 rounded-lg [transform:rotate(-25deg)] animate-spin-slow"></div>
            <div className="absolute top-[10%] left-[40%] w-16 h-16 border border-blue-500/15 rounded [transform:rotate(45deg)] animate-spin-medium animation-delay-1000"></div>
            <div className="absolute top-[45%] left-[15%] w-24 h-24 border border-primary/15 rounded-md [transform:rotate(-10deg)] animate-spin-medium-reverse animation-delay-4000"></div>
            <div className="absolute top-[70%] left-[50%] w-32 h-32 border border-purple-500/10 rounded-lg [transform:rotate(35deg)] animate-spin-slow-reverse animation-delay-2500"></div>
            
            {/* Rectangle shapes for variety */}
            <div className="absolute top-[30%] left-[30%] w-40 h-24 border border-primary/10 rounded-lg [transform:rotate(-5deg)] animate-spin-very-slow animation-delay-1500"></div>
            <div className="absolute top-[55%] left-[70%] w-24 h-36 border border-blue-500/15 rounded-md [transform:rotate(8deg)] animate-spin-medium animation-delay-3500"></div>
            
            {/* Code-like lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`line-${i}`}
                className="absolute h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 animate-scan-x"
                style={{
                  width: '100%',
                  top: `${15 + i * 20}%`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
            
            {/* Vertical scan lines */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={`vline-${i}`}
                className="absolute w-0.5 h-full bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-scan-y"
                style={{
                  left: `${25 + i * 25}%`,
                  animationDelay: `${i * 3}s`
                }}
              />
            ))}
            
            {/* Additional subtle grid lines */}
            <div className="absolute inset-0 bg-grid-dots opacity-10"></div>
            
            {/* Binary code-like pattern */}
            <div className="absolute inset-0 binary-pattern opacity-[0.03]"></div>
          </div>

          {/* Animated background */}
          <motion.div
            className="fixed inset-0 z-0"
            style={{ background }}
          />

          {/* Grid background - improved with more subtle grid */}
          <div className="fixed inset-0 z-0 opacity-10">
            <div 
              className="h-full w-full"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(var(--primary-rgb), 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--primary-rgb), 0.07) 1px, transparent 1px)",
                backgroundSize: "70px 70px",
              }}
            />
          </div>

          {/* Floating particles */}
          <ParticleBackground />

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm border border-primary/20"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AI-Powered</span>
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-tight flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span>Workflows Made</span>
                    <GradientText className="h-[1.2em] mt-2 block">
                      <TypeAnimation
                        sequence={[
                          'Automatic',
                          2000,
                          'Efficient',
                          2000,
                          'Powerful',
                          2000,
                          'Easy',
                          2000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                        cursor={true}
                      />
                    </GradientText>
                  </motion.h1>

                  <motion.p
                    className="text-xl text-muted-foreground max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    Extract data, chat with AI, process spreadsheets, and automate your entire document workflow using AI.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Link href="/playground" target="_blank">
                      <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                        <span className="relative z-10 flex items-center">
                          Try the Platform <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="/demo">
                      <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                        Watch Demo <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0 }}
                  className="relative"
                >
                  {/* 3D Document Visualization - improved positioning and animation */}
                  <div className="relative h-[500px] w-full perspective-[1200px]">
                    {/* Floating documents with improved positioning and animation */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      // Calculate better positions for the documents
                      const topPos = 15 + i * 12;
                      const leftPos = i % 2 === 0 ? 10 + i * 8 : 30 + i * 6;
                      const zIndex = 10 - i;
                      const rotateStart = i % 2 === 0 ? -5 : 5;
                      
                      return (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            top: `${topPos}%`,
                            left: `${leftPos}%`,
                            zIndex,
                            transformStyle: "preserve-3d",
                            transform: `translateZ(${i * -10}px) rotate(${rotateStart}deg)`,
                          }}
                          animate={{
                            y: [0, -8, 0],
                            rotate: [rotateStart, rotateStart + (i % 2 === 0 ? 2 : -2), rotateStart],
                          }}
                          transition={{
                            duration: 5 + i * 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          <Card3D className="w-[200px] h-[280px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl">
                            <CardContent className="p-4 h-full flex flex-col">
                              <div className="w-full h-4 bg-primary/20 rounded mb-3"></div>
                              <div className="w-3/4 h-3 bg-primary/10 rounded mb-2"></div>
                              <div className="w-5/6 h-3 bg-primary/10 rounded mb-2"></div>
                              <div className="w-2/3 h-3 bg-primary/10 rounded mb-6"></div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                {Array.from({ length: 6 }).map((_, j) => (
                                  <div key={`${i}-${j}`} className="h-8 bg-primary/5 rounded"></div>
                                ))}
                              </div>
                            </CardContent>
                          </Card3D>
                        </motion.div>
                      );
                    })}

                    {/* Enhanced glowing orb with pulsing effect */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 0%, rgba(var(--primary-rgb), 0.1) 70%, transparent 100%)",
                        filter: "blur(20px)",
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scroll indicator - enhanced with better animation */}
            <motion.div
              className="absolute bottom-10 transform -translate-x-1/2 flex flex-col items-center"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="text-muted-foreground text-sm mb-2 opacity-80">Scroll to explore</div>
              <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center">
                <motion.div
                  className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
                  animate={{
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </section>

          {/* Features Section - completely redesigned */}
          <section className="py-20 px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Core Capabilities</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  <GradientText>One</GradientText> Unified Platform
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  No running back and forth between different softwares and tools.
                </motion.p>
              </motion.div>

              {/* Document processing capabilities - animated interactive cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1: AI-Powered Document Processing */}
                  <motion.div
                  initial={{ opacity: 1, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative h-full bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
                    {/* Animated background lines */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute h-0.5 bg-primary/40 rounded-full"
                          style={{
                            width: `${20 + Math.random() * 60}%`,
                            top: `${10 + i * 12}%`,
                            left: `${Math.random() * 10}%`,
                            opacity: 0.1 + (Math.random() * 0.4)
                          }}
                        ></div>
                      ))}
                          </div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center mb-6">
                        <Brain className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">AI-Powered Processing</h3>
                      <p className="text-muted-foreground mb-6">Leverage AI to carefully analyze and understand any document or spreadsheet with accuracy.</p>
                      
                      {/* AI processing visualization */}
                      <div className="mt-6 bg-black/50 border border-white/5 rounded-lg p-3">
                        <div className="space-y-2 text-xs">
                          <div className="font-mono text-primary">AI Analysis</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary/30 rounded-full animate-pulse"></div>
                            <span className="text-primary/80">Processing document...</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500/30 rounded-full"></div>
                            <span className="text-green-400">Text extracted</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary/30 rounded-full"></div>
                            <span className="text-primary/80">Data structured</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500/30 rounded-full"></div>
                            <span className="text-purple-400">Displayed to user</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Corner accent */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                  </div>
                  </motion.div>
                
                {/* Feature 2: AI Chat & Analysis */}
                <motion.div
                  initial={{ opacity: 1, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative h-full bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
                    {/* Animated chat indicators */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute right-0 h-full w-0.5 bg-primary/40"
                          style={{ right: `${15 + i * 30}%` }}
                          animate={{
                            opacity: [0, 0.8, 0],
                            height: ["0%", "100%", "0%"],
                            top: ["100%", "0%", "0%"],
                          }}
                          transition={{
                            duration: 4,
                            delay: i * 1.5,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        ></motion.div>
                      ))}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center mb-6">
                        <MessageCircle className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Extract Key Information</h3>
                      <p className="text-muted-foreground mb-6">Have conversations with your documents and spreadsheets. Ask questions, and get answers.</p>
                      
                      {/* Chat visualization */}
                      <div className="mt-6 bg-black/50 border border-white/5 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground bg-black/30 p-2 rounded">
                            "What's the total revenue for Q3?"
                          </div>
                          <div className="text-xs text-primary bg-primary/10 p-2 rounded ml-4">
                            "Based on the data, Q3 revenue is $45,200..."
                          </div>
                          <div className="text-xs text-muted-foreground bg-black/30 p-2 rounded">
                            "Show me trends from last year"
                          </div>
                          {/* <div className="text-xs text-primary bg-primary/10 p-2 rounded ml-4">
                            "The trend is increasing by 10% from last year..."
                          </div> */}
                        </div>
                      </div>
                    </div>
                    
                    {/* Corner accent */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                  </div>
                </motion.div>
                
                {/* Feature 3: Structured Output */}
                <motion.div
                  initial={{ opacity: 1, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative h-full bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
                    {/* Data structure indicators */}
                    <div className="absolute inset-0 opacity-10">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute bg-white/20 rounded-full"
                          style={{
                            width: `${1 + Math.random() * 3}px`,
                            height: `${1 + Math.random() * 3}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: 0.1 + (Math.random() * 0.3)
                          }}
                        ></div>
                      ))}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                          key={`line-${i}`}
                          className="absolute bg-gradient-to-r from-transparent via-purple-500/20 to-transparent h-px w-1/2"
                          style={{
                            top: `${10 + i * 16}%`,
                            left: `${Math.random() * 25}%`,
                            opacity: 0.1 + (Math.random() * 0.3)
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center mb-6">
                        <Zap className="h-7 w-7 text-purple-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Spreadsheet & Tables</h3>
                      <p className="text-muted-foreground mb-6">Extract data from cells, columns, rows and more, without the need to modify your workspace.</p>
                      
                      {/* Spreadsheet visualization */}
                      <div className="mt-6 bg-black/50 border border-white/5 rounded-lg p-3 font-mono text-xs">
                        <div className="text-muted-foreground">
                          <div className="grid grid-cols-4 gap-1 text-center mb-2">
                            <div className="bg-primary/20 p-1 rounded">A1</div>
                            <div className="bg-primary/20 p-1 rounded">B1</div>
                            <div className="bg-primary/20 p-1 rounded">C1</div>
                            <div className="bg-primary/20 p-1 rounded">D1</div>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center mb-2">
                            <div className="bg-blue-500/20 p-1 rounded">24</div>
                            <div className="bg-green-500/20 p-1 rounded">=SUM(A:B)</div>
                            <div className="bg-purple-500/20 p-1 rounded">Monday</div>
                            <div className="bg-orange-500/20 p-1 rounded">=MAX(A:A)</div>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center mb-2">
                            <div className="bg-blue-500/20 p-1 rounded">48</div>
                            <div className="bg-green-500/20 p-1 rounded">=SUM(C:D)</div>
                            <div className="bg-purple-500/20 p-1 rounded">Tuesday</div>
                            <div className="bg-orange-500/20 p-1 rounded">XX</div>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center">
                            <div className="bg-blue-500/20 p-1 rounded">72</div>
                            <div className="bg-green-500/20 p-1 rounded">=SUM(E:F)</div>
                            <div className="bg-purple-500/20 p-1 rounded">Wednesday</div>
                            <div className="bg-orange-500/20 p-1 rounded">12345</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Corner accent */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-10 px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  <span>How It Works</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Behind the <GradientText>Scenes</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Raw documents → Structured JSON → User-friendly output (tables, charts, etc.)
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="theme-component-isolation"
              >
                <AppMockup />
              </motion.div>
              
            </div>
          </section>

          {/* Platform Showcase Section */}
          <section className="py-20 px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Features</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Dive <GradientText>Deeper</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Explore what we can do for you.
                </motion.p>
              </motion.div>

              {/* Dynamic Feature Showcase - Less Grid, More Organic Layout */}
              <div className="relative">
                {/* AI Chat Feature - Curved Layout */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative mb-16 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-10 overflow-hidden">
                    {/* Background chat bubbles */}
                    <div className="absolute top-10 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse-slower"></div>
                    
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      {/* Interactive Chat Demo */}
                      <div className="relative order-2 lg:order-1">
                        <div className="relative bg-black/60 border border-white/20 rounded-2xl p-6 h-80 overflow-hidden">
                          {/* Animated chat interface */}
                          <div className="space-y-4 h-full flex flex-col">
                            {/* AI Message */}
                            <motion.div
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center">
                                <Brain className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3 max-w-xs">
                                <p className="text-primary text-sm">Hello! What would you like to know?</p>
                              </div>
                            </motion.div>
                            
                            {/* User Message */}
                            <motion.div
                              className="flex items-start space-x-3 ml-auto"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1 }}
                            >
                              <div className="bg-white/20 border border-white/30 rounded-2xl px-4 py-3 max-w-xs">
                                <p className="text-white text-sm">What's the total revenue for Q3?</p>
                              </div>
                              <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                            </motion.div>
                            
                            {/* AI Response */}
                            <motion.div
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.5 }}
                            >
                              <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center">
                                <Brain className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3 max-w-xs">
                                <p className="text-primary text-sm">Based on the data, Q3 revenue is $45,200, which represents a 23% increase from Q2.</p>
                              </div>
                            </motion.div>
                            
                            {/* Typing indicator */}
                            <motion.div
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.5 }}
                            >
                              <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center">
                                <Brain className="h-4 w-4 text-primary" />
                              </div>
                              <div className="bg-primary/20 border border-primary/30 rounded-2xl px-4 py-3">
                                <div className="flex space-x-1">
                                  <motion.div
                                    className="w-2 h-2 bg-primary rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                  />
                                  <motion.div
                                    className="w-2 h-2 bg-primary rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                  />
                                  <motion.div
                                    className="w-2 h-2 bg-primary rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-1 lg:order-2">
                        <div className="flex items-center mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 border border-primary/30 flex items-center justify-center mr-6">
                            <MessageCircle className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold mb-2">Chat with Your Documents</h3>
                            <p className="text-primary/80 text-lg">Conversational Intelligence with Contextual Inputs</p>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                          Have full conversations with your documents. Speed up your workflow by asking questions and getting answers instantly 
                          instead of manually reading through long documents and spreadsheets.
                        </p>
                        
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center text-base">
                            <div className="w-3 h-3 bg-primary rounded-full mr-4"></div>
                            <span>Select shorter context for AI focus</span>
                          </div>
                          <div className="flex items-center text-base">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                            <span>Conversational history for deeper understanding</span>
                          </div>
                          <div className="flex items-center text-base">
                            <div className="w-3 h-3 bg-pink-500 rounded-full mr-4"></div>
                            <span>Stored history for future reference</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Spreadsheet & Advanced Features - Asymmetric Layout */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Spreadsheet Processing */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="relative group lg:col-span-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 h-full">
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center mr-4">
                          <FileSpreadsheet className="h-7 w-7 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Spreadsheet Processing</h3>
                          <p className="text-purple-500/80">Build for Tables and Charts. Supports CSVs and Excel</p>
                        </div>
                      </div>
                      
                      {/* Interactive spreadsheet demo */}
                      <div className="bg-black/60 border border-white/10 rounded-xl p-6 mb-6">
                        <div className="grid grid-cols-5 gap-1 text-center font-mono text-sm">
                          <div className="bg-primary/20 p-2 rounded">A1</div>
                          <div className="bg-primary/20 p-2 rounded">B1</div>
                          <div className="bg-primary/20 p-2 rounded">C1</div>
                          <div className="bg-primary/20 p-2 rounded">D1</div>
                          <div className="bg-primary/20 p-2 rounded">E1</div>
                          <div className="bg-blue-500/20 p-2 rounded">24</div>
                          <div className="bg-green-500/20 p-2 rounded">=SUM(A:B)</div>
                          <div className="bg-purple-500/20 p-2 rounded">Monday</div>
                          <div className="bg-orange-500/20 p-2 rounded">=MAX(A:A)</div>
                          <div className="bg-pink-500/20 p-2 rounded">Active</div>
                          <div className="bg-blue-500/20 p-2 rounded">48</div>
                          <div className="bg-green-500/20 p-2 rounded">=SUM(C:D)</div>
                          <div className="bg-purple-500/20 p-2 rounded">Tuesday</div>
                          <div className="bg-orange-500/20 p-2 rounded">=AVG(A:A)</div>
                          <div className="bg-pink-500/20 p-2 rounded">Pending</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <span>Formulas and functions support</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <span>Chart and graph generation and analysis</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Template System - Compact */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 h-full">
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/30 to-orange-500/30 border border-pink-500/30 flex items-center justify-center mr-4">
                          <Code className="h-7 w-7 text-pink-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Template System</h3>
                          <p className="text-pink-500/80">Set Custom Extraction Rules</p>
                        </div>
                      </div>
                      
                      {/* Template visualization */}
                      <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6 h-32 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Code className="h-6 w-6 text-pink-500" />
                          </div>
                          <p className="text-muted-foreground text-sm">Template Builder</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                          <span>Design your own templates</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                          <span>Custom field and row/column type definitions</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                          <span>Only your template is used to extract specific data</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Links Section */}
                <motion.div 
                  className="text-center mt-20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/playground">
                      <Button size="lg" className="gap-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 group">
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                      </Button>
                    </Link>
                    <Link href="/use-cases">
                      <Button variant="outline" size="lg" className="gap-3 backdrop-blur-sm border-white/20 hover:bg-white/5">
                        <span>Learn Use Cases</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="outline" size="lg" className="gap-3 backdrop-blur-sm border-white/20 hover:bg-white/5">
                        <span>About Us</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>


          <Footer />
        </div>
      </ScrollArea>

      {/* Add the CSS animations */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Circuit board pattern */
        .bg-circuit-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 1px, transparent 1px),
            linear-gradient(to right, rgba(var(--primary-rgb), 0.2) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.2) 2px, transparent 2px);
          background-size: 
            40px 40px,
            40px 40px,
            40px 40px,
            200px 200px,
            200px 200px;
          background-position: 
            -1px -1px,
            -1px -1px,
            -1px -1px,
            -1px -1px,
            -1px -1px;
        }

        .bg-dots-primary\/15 {
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--primary) / 0.15) 2px, transparent 0);
          background-size: 40px 40px;
          background-position: center;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 25s infinite alternate;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        /* New cool background animations */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-very-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes scan-x {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes scan-y {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
        
        .animate-scan-x {
          animation: scan-x 15s linear infinite;
        }
        
        .animate-scan-y {
          animation: scan-y 20s linear infinite;
        }

        /* Enhanced grid patterns */
        .bg-grid-pattern-primary {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Additional animation for the section dividers */
        @keyframes pulse-divider {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-divider {
          animation: pulse-divider 4s ease-in-out infinite;
        }

        /* Additional spin animations for more variety */
        @keyframes spin-medium {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-slow-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        
        @keyframes spin-medium-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        
        .animate-spin-medium {
          animation: spin-medium 15s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }
        
        .animate-spin-medium-reverse {
          animation: spin-medium-reverse 18s linear infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2500 {
          animation-delay: 2.5s;
        }
        
        .animation-delay-3500 {
          animation-delay: 3.5s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Enhanced grid patterns */
        .bg-grid-pattern-primary {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .bg-grid-small-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px);
          background-size: 10px 10px;
        }
        
        .bg-grid-large-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.07) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.07) 1.5px, transparent 1.5px);
          background-size: 50px 50px;
        }
        
        .bg-grid-diagonal-pattern {
          background-image: 
            linear-gradient(45deg, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          background-position: 0 0, 15px 15px;
        }
        
        .bg-grid-dots {
          background-image: radial-gradient(circle, rgba(var(--primary-rgb), 0.2) 1px, transparent 1px);
          background-size: 15px 15px;
        }
        
        .binary-pattern {
          position: relative;
        }
        
        .binary-pattern::before {
          content: "10101010101010101010101";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          font-family: monospace;
          font-size: 12px;
          line-height: 1;
          opacity: 0.1;
          color: rgba(var(--primary-rgb), 1);
          overflow: hidden;
          pointer-events: none;
          white-space: pre;
          background-size: 60px 60px;
          letter-spacing: 3px;
          transform: rotate(45deg);
        }
      `}</style>
    </div>
  );
}