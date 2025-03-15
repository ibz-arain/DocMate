"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight, Receipt, FileCheck, LightbulbIcon, Cable, FileSpreadsheet, ArrowUpRight, Sparkles, Building2, ReceiptText, Stethoscope, BatteryCharging, Code, Plus, Users, History, Upload, Menu } from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import { useRef, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AppMockup from "@/components/app-mockup";
import { useTheme } from "next-themes";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// 3D Card component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = (y - centerY) / 30;
    const rotateYVal = (centerX - x) / 30;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    setScale(1.03);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Enhanced Particle background component with more varied particles
const ParticleBackground = () => {
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

  // Force dark theme on this page
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Set the theme to dark when the component mounts
    setTheme("dark");
    
    // Store the original theme implementation for later cleanup
    return () => {
      // We don't reset the theme on cleanup to avoid flashing
      // If specific reset behavior is needed, it can be handled in navigation events
    };
  }, [setTheme]);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      backgroundX.set(e.clientX);
      backgroundY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [backgroundX, backgroundY]);

  // Add noise texture effect for more Vercel-like appearance
  const [noiseTexture, setNoiseTexture] = useState<string>("");
  
  useEffect(() => {
    // Create a subtle noise texture for background
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 100, 100);
      
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          const value = Math.floor(Math.random() * 50);
          ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.015)`;
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      setNoiseTexture(`url(${canvas.toDataURL()})`);
    }
  }, []);

  return (
    <div className="relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 z-50"
        style={{ scaleX }}
      />

      {/* Turso-style floating header card */}
      <div className="fixed top-6 left-0 right-0 z-40 px-4 pointer-events-none">
        <motion.div 
          className="mx-auto max-w-7xl pointer-events-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
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
              <div className="flex items-center justify-between py-3 px-6 bg-background/60 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center shadow-lg shadow-primary/20">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">DocMate</span>
                </div>
                
                {/* Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  {[
                    { label: 'Features', href: '#features' },
                    { label: 'Use Cases', href: '#use-cases' },
                    { label: 'API', href: '#api' },
                    { label: 'Pricing', href: '#' },
                    { label: 'Blog', href: '#' },
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
                      Try Demo <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button size="sm" className="text-sm bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                    Get Started
                  </Button>
                  <Button size="icon" variant="ghost" className="md:hidden text-muted-foreground hover:text-white hover:bg-white/5">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ScrollArea className="h-screen w-full">
        <div 
          className="min-h-screen bg-background relative"
          style={{ backgroundImage: noiseTexture }}
        >
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
                    <span>AI-Powered Document Analysis</span>
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-tight flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span>Document Analysis Made</span>
                    <GradientText className="h-[1.2em] mt-2 block">
                      <TypeAnimation
                        sequence={[
                          'Automatic',
                          2000,
                          'Efficient',
                          2000,
                          'Powerful',
                          2000,
                          'Faster',
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
                    Automate your workflow by utilizing AI to extract data from documents. 
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                        <span className="relative z-10 flex items-center">
                          Try Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                      Learn More <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
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
                                  <div key={j} className="h-8 bg-primary/5 rounded"></div>
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
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
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

          {/* Features Section with 3D cards */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider - enhanced with gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
            
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
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Core Features</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  <GradientText>Powerful</GradientText> Document Analysis
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Extract, analyze, and organize document data in seconds.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <FileText className="h-10 w-10" />,
                    title: "Smart Extraction",
                    description: "Extract key data points from any document. Dates, amounts, tables, and structured data with high accuracy."
                  },
                  {
                    icon: <Brain className="h-10 w-10" />,
                    title: "AI Analysis",
                    description: "Context-aware AI understands document relationships and extracts meaningful insights automatically."
                  },
                  {
                    icon: <Zap className="h-10 w-10" />,
                    title: "Flexible Formats",
                    description: "Export results as JSON, CSV, Markdown or custom formats. Integrate with your existing workflows."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card3D className="h-full">
                      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-8">
                          <div className="text-primary mb-6">
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                          <p className="text-muted-foreground">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Card3D>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Demo Section */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider - enhanced with gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
            
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
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Live Demo</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  <GradientText>Try It</GradientText> Yourself
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Drop any invoice, receipt, or contract. Get structured data in seconds.
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
              
              <motion.div 
                className="flex justify-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/demo">
                  <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                    <span className="relative z-10 flex items-center">
                      Launch Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider - enhanced with gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
            
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
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>Industry Solutions</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  <GradientText>Use Cases</GradientText> Across Industries
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  How DocMate solves document challenges in key industries.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: <ReceiptText className="h-10 w-10" />,
                    title: "Finance & Accounting",
                    description: "Extract data from invoices and financial statements in seconds. Cut manual entry by 90% and close books faster.",
                    features: ["Invoice Processing", "Receipt Management", "Financial Statement Analysis"]
                  },
                  {
                    icon: <Stethoscope className="h-10 w-10" />,
                    title: "Healthcare",
                    description: "Process medical records and insurance claims instantly. Maintain HIPAA compliance while reducing paperwork.",
                    features: ["Medical Records Processing", "Insurance Claim Analysis", "Patient Data Management"]
                  },
                  {
                    icon: <BatteryCharging className="h-10 w-10" />,
                    title: "Energy & Utilities",
                    description: "Analyze utility bills and regulatory documents automatically. Track consumption patterns and simplify reporting.",
                    features: ["Utility Bill Analysis", "Consumption Tracking", "Regulatory Compliance"]
                  },
                  {
                    icon: <Users className="h-10 w-10" />,
                    title: "Human Resources",
                    description: "Parse resumes and employee documents instantly. Speed up onboarding and maintain accurate records effortlessly.",
                    features: ["Resume Parsing", "Employee Document Management", "Payroll Processing"]
                  }
                ].map((useCase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card3D className="h-full">
                      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-8">
                          <div className="text-primary mb-6">
                            {useCase.icon}
                          </div>
                          <h3 className="text-2xl font-semibold mb-4">{useCase.title}</h3>
                          <p className="text-muted-foreground mb-6">
                            {useCase.description}
                          </p>
                          <div className="space-y-2">
                            {useCase.features.map((feature, i) => (
                              <div key={i} className="flex items-center">
                                <ChevronRight className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Card3D>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="flex justify-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                  Explore More Use Cases <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* API & Integration Section */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider - enhanced with gradient */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
            
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
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Code className="h-4 w-4 mr-2" />
                  <span>Coming Soon</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  <GradientText>API</GradientText> & Integration
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Add document analysis to your apps with a few lines of code.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    {[
                      {
                        icon: <Cable className="h-6 w-6" />,
                        title: "Simple REST API",
                        description: "One API call to analyze any document. Get structured data back in milliseconds."
                      },
                      {
                        icon: <FileSpreadsheet className="h-6 w-6" />,
                        title: "Multiple Formats",
                        description: "Export as JSON, CSV, or custom formats. Fits into any data pipeline."
                      },
                      {
                        icon: <LightbulbIcon className="h-6 w-6" />,
                        title: "Custom Schemas",
                        description: "Define extraction rules for industry-specific documents. Train on your own data."
                      },
                      {
                        icon: <Plus className="h-6 w-6" />,
                        title: "Batch Processing",
                        description: "Process thousands of documents in parallel. Scale without limits."
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <Card3D className="w-full">
                    <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="ml-4 text-sm text-muted-foreground">API Request Example</div>
                        </div>
                        <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-primary font-mono">
{`// Analyze a document
import { DocMate } from '@docmate/sdk';

// Initialize client
const client = new DocMate('api_key');

// Process document
const doc = await client.analyze({
  file: './invoice.pdf',
  type: 'invoice'
});

// Access extracted data
console.log(doc.data);
// {
//   date: '2023-05-15',
//   total: 1250.00,
//   vendor: 'Acme Corp',
//   items: [...]
// }`}
                        </pre>
                      </CardContent>
                    </Card>
                  </Card3D>

                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.3) 0%, rgba(var(--primary-rgb), 0.1) 50%, transparent 70%)",
                      filter: "blur(40px)",
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
                </motion.div>
              </div>

              <motion.div 
                className="flex justify-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                  Learn More <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Footer Section */}
          <footer className="relative pt-24 pb-16 px-6 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-xl z-0"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full" style={{
              background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.05) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full" style={{
              background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.05) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}></div>
            
            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Logo and newsletter section */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-16">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">DocMate</h3>
                  </div>
                  
                  <p className="text-muted-foreground">
                    AI-powered document analysis for modern businesses. Extract, analyze, and organize information from your documents with precision.
                  </p>
                  
                  <div className="flex space-x-3">
                    {['twitter', 'github', 'linkedin'].map((social) => (
                      <a 
                        key={social} 
                        href="#" 
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
                      >
                        <span className="sr-only">{social}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                        >
                          {social === 'twitter' && (
                            <>
                              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                            </>
                          )}
                          {social === 'github' && (
                            <>
                              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                              <path d="M9 18c-4.51 2-5-2-7-2" />
                            </>
                          )}
                          {social === 'linkedin' && (
                            <>
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect width="4" height="12" x="2" y="9" />
                              <circle cx="4" cy="4" r="2" />
                            </>
                          )}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
                
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Product
                      </h4>
                      <ul className="space-y-3">
                        {['Features', 'Demo', 'API', 'Pricing'].map((item) => (
                          <li key={item}>
                            <a 
                              href="#" 
                              className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                            >
                              <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Resources
                      </h4>
                      <ul className="space-y-3">
                        {['Documentation', 'Guides', 'Blog', 'Support'].map((item) => (
                          <li key={item}>
                            <a 
                              href="#" 
                              className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                            >
                              <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        Company
                      </h4>
                      <ul className="space-y-3">
                        {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                          <li key={item}>
                            <a 
                              href="#" 
                              className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                            >
                              <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom section with copyright and links */}
              <div className="pt-8 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>© {new Date().getFullYear()} DocMate</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                    <span>All rights reserved</span>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-4">
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                      Terms of Service
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                      Cookies
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ScrollArea>
    </div>
  );
}