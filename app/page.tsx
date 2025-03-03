"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight, Receipt, FileCheck, LightbulbIcon, Cable, FileSpreadsheet, ArrowUpRight, Sparkles } from "lucide-react";
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
    const rotateXVal = (y - centerY) / 20;
    const rotateYVal = (centerX - x) / 20;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-200 ${className}`}
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

// Particle background component
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * -100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      backgroundX.set(e.clientX);
      backgroundY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [backgroundX, backgroundY]);

  return (
    <div className="relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 z-50"
        style={{ scaleX }}
      />

      <ScrollArea className="h-screen w-full">
        <div className="min-h-screen bg-background relative">
          {/* Animated background */}
          <motion.div
            className="fixed inset-0 z-0"
            style={{ background }}
          />

          {/* Grid background */}
          <div className="fixed inset-0 z-0 opacity-20">
            <div 
              className="h-full w-full"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
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
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AI-Powered Document Analysis</span>
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Document Analysis Made{" "}
                    <GradientText>
                      <TypeAnimation
                        sequence={[
                          'Simple',
                          2000,
                          'Efficient',
                          2000,
                          'Powerful',
                          2000,
                          'Smart',
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
                    Transform your documents into actionable insights with our advanced AI-powered analysis platform.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group">
                        <span className="relative z-10 flex items-center">
                          Try Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="gap-2 group">
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
                  {/* 3D Document Visualization */}
                  <div className="relative h-[500px] w-full">
                    {/* Floating documents */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${20 + i * 10}%`,
                          left: `${10 + i * 10}%`,
                          zIndex: 10 - i,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                        }}
                        transition={{
                          duration: 4 + i,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.5,
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
                    ))}

                    {/* Glowing orb */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="text-muted-foreground text-sm mb-2">Scroll to explore</div>
              <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
                <motion.div
                  className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
                  animate={{
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
          </section>

          {/* Features Section with 3D cards */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform -skew-y-2" />
            
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
                  <span>Powerful Features</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Everything You Need for <GradientText>Document Analysis</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Our platform combines cutting-edge AI with intuitive design to make document analysis simple and powerful.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <FileText className="h-10 w-10" />,
                    title: "Smart Extraction",
                    description: "Automatically extract and organize key information from your documents with precision and accuracy."
                  },
                  {
                    icon: <Brain className="h-10 w-10" />,
                    title: "AI Analysis",
                    description: "Get deep insights and understanding with our advanced AI analysis that learns from your documents."
                  },
                  {
                    icon: <Zap className="h-10 w-10" />,
                    title: "Fast Processing",
                    description: "Process documents quickly and efficiently with real-time results and minimal waiting time."
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
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform -skew-y-2" />
            
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
                  <span>Interactive</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  See <GradientText>DocMate</GradientText> in Action
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Explore different document types and see how our AI extracts and structures information
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
                  <Button size="lg" className="gap-2 relative overflow-hidden group">
                    <span className="relative z-10 flex items-center">
                      Try Full Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Document Types Section with interactive cards */}
          <section className="py-32 px-6 relative bg-gradient-to-b from-background via-primary/5 to-background">
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform skew-y-2" />
            
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
                  <span>Versatile Support</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Document Types We <GradientText>Support</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Specialized analysis for different types of documents to meet your specific needs.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Receipt className="h-10 w-10" />,
                    title: "Receipts",
                    description: "Extract date, items, totals, and tax information from retail and service receipts."
                  },
                  {
                    icon: <Receipt className="h-10 w-10" />,
                    title: "T4 Tax Forms",
                    description: "Automatically process employment income, tax deductions, and CPP/EI contributions."
                  },
                  {
                    icon: <FileSpreadsheet className="h-10 w-10" />,
                    title: "Bank Statements",
                    description: "Analyze transactions, calculate totals, and categorize spending patterns."
                  },
                  {
                    icon: <FileCheck className="h-10 w-10" />,
                    title: "Dental Claims",
                    description: "Process procedure codes, dates of service, and insurance claim details."
                  },
                  {
                    icon: <Cable className="h-10 w-10" />,
                    title: "Utility Bills",
                    description: "Extract usage data, billing periods, and payment information."
                  },
                  {
                    icon: <LightbulbIcon className="h-10 w-10" />,
                    title: "More Coming Soon",
                    description: "Stay tuned for more document types and features!"
                  }
                ].map((docType, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group">
                      <CardContent className="p-8 h-full flex flex-col relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="text-primary mb-6 relative z-10">
                          {docType.icon}
                        </div>
                        <h3 className="text-2xl font-semibold mb-4 relative z-10">{docType.title}</h3>
                        <p className="text-muted-foreground relative z-10">
                          {docType.description}
                        </p>
                        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                          <Button variant="ghost" size="sm" className="gap-2">
                            Learn more <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section with attention-grabbing animation */}
          <section className="py-32 px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm" />
                
                {/* Animated background elements */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                  }}
                />
                
                <div className="relative p-16 md:p-20 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                  >
                    Ready to <GradientText>Transform</GradientText> Your Documents?
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
                  >
                    Experience the power of AI-driven document analysis. Try our demo today and see how we can help you extract valuable insights from your documents.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group px-8 py-6 text-lg">
                        <span className="relative z-10 flex items-center">
                          Try Demo Now <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}