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
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

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

  // Force dark theme on this page
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Only set theme on the client side to avoid hydration mismatches
    if (typeof window !== 'undefined') {
      setTheme("dark");
    }
    
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
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
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
      <Header />
      <ScrollArea className="h-screen w-full">
        <div 
          className="min-h-screen bg-background relative"
          style={isHydrated ? { backgroundImage: noiseTexture } : {}}
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
                    <span>AI-Powered</span>
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-tight flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span>Document Processing Made</span>
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
                    <Link href="/playground">
                      <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                        <span className="relative z-10 flex items-center">
                          Try It Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </span>
                      </Button>
                    </Link>
                    <Link href="/use-cases">
                      <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                        Learn More <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
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
                  <span>Demo</span>
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
                  Any invoice, receipt, or contract. Get structured data in seconds.
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
                <Link href="/playground">
                  <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                    <span className="relative z-10 flex items-center">
                      Launch Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
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
                <Link href="/use-cases">
                  <Button variant="outline" size="lg" className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                    Explore More Use Cases <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Button>
                </Link>
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
                <Button variant="outline" size="lg"className="gap-2 group backdrop-blur-sm border-white/10 hover:bg-white/5">
                  Learn More <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
}