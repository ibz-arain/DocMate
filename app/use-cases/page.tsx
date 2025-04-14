"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  FileText, 
  Briefcase,
  Stethoscope,
  Scale,
  GraduationCap,
  Building,
  Truck,
  ShieldCheck,
  Users,
  Factory,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Clock,
  AlertCircle,
  DollarSign,
  CheckCircle,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Section Divider component
const SectionDivider = ({ icon = <Sparkles className="h-6 w-6 text-primary" /> }) => {
  return (
    <div className="relative py-10 bg-black">
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Add dynamic elements to the divider */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Radiating pulse */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full border border-primary/20"
          animate={{ 
            width: ["0%", "150%"],
            height: ["0%", "150%"],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            repeatDelay: 1
          }}
        />
        
        {/* Moving particles */}
        <motion.div
          className="absolute top-1/2 left-0 right-0 h-px"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="absolute top-0 left-[10%] w-1.5 h-1.5 rounded-full bg-primary/50"
            animate={{ 
              left: ["10%", "90%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
          
          <motion.div
            className="absolute top-0 left-[90%] w-1.5 h-1.5 rounded-full bg-purple-500/50"
            animate={{ 
              left: ["90%", "10%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: 1.5,
              times: [0, 0.5, 1]
            }}
          />
        </motion.div>
      </motion.div>
      
      <div className="absolute inset-0 flex justify-center items-center opacity-20">
        <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 flex justify-center"
      >
        <div className="w-12 h-12 rounded-full bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
          {icon}
        </div>
      </motion.div>
    </div>
  );
};

// Particle component
const Particle = ({ className = "" }: { className?: string }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomY = useMemo(() => Math.random() * 100, []);
  const randomScale = useMemo(() => Math.random() * 0.6 + 0.4, []);
  const randomDuration = useMemo(() => Math.random() * 20 + 10, []);
  const randomDelay = useMemo(() => Math.random() * 10, []);
  
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        top: `${randomY}%`,
        left: `${randomX}%`, 
        scale: randomScale,
      }}
      animate={{
        y: ["-20%", "20%", "-20%"],
        x: ["10%", "-10%", "10%"],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        y: {
          repeat: Infinity,
          duration: randomDuration,
          ease: "easeInOut",
          delay: randomDelay,
        },
        x: {
          repeat: Infinity,
          duration: randomDuration * 1.3,
          ease: "easeInOut",
          delay: randomDelay,
        },
        opacity: {
          repeat: Infinity,
          duration: randomDuration * 0.7,
          ease: "easeInOut",
          delay: randomDelay,
        },
      }}
    />
  );
};

// Floating Element
const FloatingElement = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        y: [0, -15, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: {
          delay,
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
        rotate: {
          delay,
          duration: 9,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// Use Case Card Component
const UseCaseCard = ({ 
  icon, 
  title, 
  description, 
  benefits,
  examples,
  color = "primary"
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  examples: string[];
  color?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'benefits' | 'examples'>('benefits');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full relative bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        {/* Glow effect on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-${color}-500/20 via-transparent to-transparent opacity-0 transition-opacity duration-500`}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
        />
        
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-${color}-500/50 to-transparent`} />
        </motion.div>

        <CardContent className="p-6 relative z-10">
          <div className="relative z-10 space-y-4">
            {/* Header with icon */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center justify-center"
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? 5 : 0
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {icon}
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h3 
                  className={`text-xl font-semibold text-${color}-400`}
                  animate={{ 
                    x: isHovered ? 5 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {title}
                </motion.h3>
              </div>
            </div>
            
            {/* Description */}
            <motion.p 
              className="text-muted-foreground"
              animate={{ 
                opacity: isHovered ? 1 : 0.8,
                y: isHovered ? 0 : 5
              }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-3">
              <button 
                className={`pb-2 px-4 text-sm font-medium relative ${activeTab === 'benefits' ? `text-${color}-400` : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('benefits')}
              >
                Benefits
                {activeTab === 'benefits' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      color === "primary" ? "bg-primary" :
                      color === "blue" ? "bg-blue-500" :
                      color === "purple" ? "bg-purple-500" :
                      color === "amber" ? "bg-amber-500" :
                      color === "green" ? "bg-green-500" :
                      color === "rose" ? "bg-rose-500" :
                      "bg-primary"
                    }`}
                    layoutId={`activeTabIndicator-${title}`}
                  />
                )}
              </button>
              <button 
                className={`pb-2 px-4 text-sm font-medium relative ${activeTab === 'examples' ? `text-${color}-400` : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('examples')}
              >
                Examples
                {activeTab === 'examples' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      color === "primary" ? "bg-primary" :
                      color === "blue" ? "bg-blue-500" :
                      color === "purple" ? "bg-purple-500" :
                      color === "amber" ? "bg-amber-500" :
                      color === "green" ? "bg-green-500" :
                      color === "rose" ? "bg-rose-500" :
                      "bg-primary"
                    }`}
                    layoutId={`activeTabIndicator-${title}`}
                  />
                )}
              </button>
            </div>
            
            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'benefits' ? (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className={`w-5 h-5 rounded-full bg-${color}-500/10 flex flex-shrink-0 items-center justify-center mt-0.5`}>
                          <CheckCircle className={`h-3 w-3 ${
                            color === "primary" ? "text-primary" :
                            color === "blue" ? "text-blue-400" :
                            color === "purple" ? "text-purple-400" :
                            color === "amber" ? "text-amber-400" :
                            color === "green" ? "text-green-400" :
                            color === "rose" ? "text-rose-400" :
                            "text-primary"
                          }`} />
                        </div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="examples"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="space-y-2">
                    {examples.map((example, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className={`w-5 h-5 rounded-full bg-${color}-500/10 flex flex-shrink-0 items-center justify-center mt-0.5`}>
                          <FileText className={`h-3 w-3 ${
                            color === "primary" ? "text-primary" :
                            color === "blue" ? "text-blue-400" :
                            color === "purple" ? "text-purple-400" :
                            color === "amber" ? "text-amber-400" :
                            color === "green" ? "text-green-400" :
                            color === "rose" ? "text-rose-400" :
                            "text-primary"
                          }`} />
                        </div>
                        <span className="text-muted-foreground">{example}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function UseCasesPage() {
  // Force dark theme
  const { setTheme } = useTheme();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.85]);
  const [mounted, setMounted] = useState(false);
  
  // Generate particles
  const particleCount = 15;
  const particles = useMemo(() => Array(particleCount).fill(null), []);
  const particles2 = useMemo(() => Array(particleCount).fill(null), []);
  const particles3 = useMemo(() => Array(particleCount).fill(null), []);
  
  useEffect(() => {
    setTheme("dark");
    setMounted(true);
  }, [setTheme]);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Global background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Abstract gradient meshes */}
        <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
          {/* Primary gradient */}
          <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-gradient-radial from-primary/20 to-transparent blur-3xl opacity-20 rounded-full transform -translate-x-1/4 -translate-y-1/4" />
          
          {/* Secondary gradients */}
          <div className="absolute bottom-0 left-0 w-[70vw] h-[70vh] bg-gradient-radial from-purple-500/20 to-transparent blur-3xl opacity-20 rounded-full transform translate-x-1/4 translate-y-1/4" />
          
          {/* Tertiary gradients */}
          <div className="absolute top-1/2 left-1/2 w-[90vw] h-[90vh] bg-gradient-radial from-blue-500/10 to-transparent blur-3xl opacity-15 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
          
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-60" />
        </div>
        
        {/* Floating particles */}
        <div className="fixed inset-0 overflow-hidden">
          {particles.map((_, i) => (
            <Particle 
              key={`p1-${i}`} 
              className="w-1 h-1 bg-primary opacity-40 blur-sm"
            />
          ))}
          {particles2.map((_, i) => (
            <Particle 
              key={`p2-${i}`}
              className="w-2 h-2 bg-purple-500 opacity-40 blur-sm" 
            />
          ))}
          {particles3.map((_, i) => (
            <Particle 
              key={`p3-${i}`}
              className="w-1.5 h-1.5 bg-blue-400 opacity-40 blur-sm" 
            />
          ))}
        </div>
      </div>
      
      <Header />
      
      <ScrollArea className="h-screen relative z-10">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative pt-32 pb-10 px-6 overflow-hidden bg-black">
            {/* Hero interactive background elements */}
            {mounted && (
              <motion.div style={{ opacity, scale }} className="absolute inset-0">
                <div className="absolute inset-0 bg-black"></div>
                <FloatingElement 
                  className="absolute top-[15%] right-[15%] w-24 h-24 opacity-20"
                  delay={0.5}
                >
                  <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-purple-500 blur-xl animate-spin-slow" />
                </FloatingElement>
                
                <FloatingElement 
                  className="absolute bottom-[25%] left-[10%] w-32 h-32 opacity-20"
                  delay={1}
                >
                  <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
                </FloatingElement>
                
                <FloatingElement 
                  className="absolute top-[40%] left-[20%] w-16 h-16 opacity-30"
                  delay={1.5}
                >
                  <div className="w-full h-full rounded-full bg-primary blur-xl animate-pulse-slow" />
                </FloatingElement>

                {/* Add more dynamic elements */}
                <motion.div
                  className="absolute top-[10%] left-[30%] w-96 h-96 opacity-5"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/10 rotate-[30deg]" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary/5 rotate-[60deg]" />
                </motion.div>

                {/* Floating dots */}
                <motion.div 
                  className="absolute top-[20%] right-[25%] opacity-30"
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                </motion.div>

                <motion.div 
                  className="absolute bottom-[30%] right-[35%] opacity-20"
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 5,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                </motion.div>

                <motion.div 
                  className="absolute top-[50%] left-[40%] opacity-20"
                  animate={{ 
                    y: [0, -12, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 6,
                    delay: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                </motion.div>

                {/* Light beam effect */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-10 rotate-45"
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-10 -rotate-45"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto"
              >
                <motion.div 
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>In the Real World</span>
                </motion.div>
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <GradientText>Use Cases</GradientText>
                </motion.h1>
                <motion.p 
                  className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  See how a claims processing department can be transformed by automated document processing
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Decorative elements for cards */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="bg-black/80 dark:bg-black/80 backdrop-blur-md border border-white/10 shadow-lg shadow-red-500/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent opacity-80" />
                    
                    {/* Add animated indicator */}
                    <motion.div
                      className="absolute -top-1 left-0 w-full h-[1px]"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-32 h-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    </motion.div>
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3 border border-red-500/20">
                          <motion.div
                            animate={{ 
                              rotate: 360 
                            }}
                            transition={{ 
                              duration: 20, 
                              repeat: Infinity,
                              ease: "linear" 
                            }}
                            className="absolute inset-0 rounded-full border border-red-500/20"
                          />
                          <Users className="h-5 w-5 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-red-400">Manual Process</h3>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">30-person claims processing department</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">2-3 weeks to process 10,000 insurance claims</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">12% error rate requiring manual review</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">$2,000,000 annual in processing costs</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="relative"
                >
                  {/* Decorative elements for cards */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="bg-black/80 dark:bg-black/80 backdrop-blur-md border border-white/10 shadow-lg shadow-green-500/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-80" />
                    
                    {/* Add animated indicator */}
                    <motion.div
                      className="absolute -top-1 left-0 w-full h-[1px]"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-32 h-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                    </motion.div>
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3 border border-green-500/20">
                          <motion.div
                            animate={{ 
                              rotate: 360 
                            }}
                            transition={{ 
                              duration: 20, 
                              repeat: Infinity,
                              ease: "linear" 
                            }}
                            className="absolute inset-0 rounded-full border border-green-500/20"
                          />
                          <Zap className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-green-400">Automated Process</h3>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">Self sufficient, barely any human intervention</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">Process claims in seconds as they come in</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">99.9% accuracy with AI validation</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">Less than $20,000 in annual processing costs</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                  className="lg:col-span-2 relative"
                >
                  {/* Decorative elements for cards */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 rounded-xl blur-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
                    
                    {/* Add animated indicator */}
                    <motion.div
                      className="absolute -top-1 left-0 w-full h-[1px]"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-40 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    </motion.div>
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                          <motion.div
                            animate={{ 
                              rotate: 360 
                            }}
                            transition={{ 
                              duration: 20, 
                              repeat: Infinity,
                              ease: "linear" 
                            }}
                            className="absolute inset-0 rounded-full border border-primary/20"
                          />
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-primary/90">How It Works</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                        >
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">1</div>
                            <span>Real-Time Ingestion</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Claims are instantly digitized and processed as they arrive, handling thousands per hour</p>
                        </motion.div>
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        >
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">2</div>
                            <span>Intelligent Processing</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Parallel AI processing with 99.9% accuracy, replacing entire departments of manual work</p>
                        </motion.div>
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 1 }}
                        >
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">3</div>
                            <span>Automated Decisions</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Instant claim decisions with smart routing, fraud detection, and compliance checks</p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Section divider - replaced with SectionDivider component */}
          <SectionDivider icon={<FileText className="h-6 w-6 text-primary" />} />

          {/* Industries Section */}
          <section className="py-10 px-6 relative bg-black">
            {/* Background enhancements for Real World Applications */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <div className="absolute inset-0 bg-black opacity-100" />
              
              {/* Hexagon grid background effect */}
              <div className="absolute inset-0 opacity-5">
                {Array(5).fill(null).map((_, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex justify-around" style={{ marginTop: `${rowIndex * 20}vh` }}>
                    {Array(6).fill(null).map((_, colIndex) => (
                      <motion.div
                        key={`hex-${rowIndex}-${colIndex}`}
                        className="w-24 h-24 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: [0.2, 0.5, 0.2],
                          scale: [0.8, 1, 0.8],
                          rotate: [0, 60, 0]
                        }}
                        transition={{
                          duration: 10 + (rowIndex + colIndex),
                          delay: (rowIndex + colIndex) * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border border-primary/10" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Animated connection lines specific to industries */}
              <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="50%" stopColor="rgba(117, 81, 251, 0.5)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                </defs>
                {Array(10).fill(null).map((_, i) => {
                  const x1 = Math.random() * 100;
                  const y1 = Math.random() * 100;
                  const x2 = Math.random() * 100;
                  const y2 = Math.random() * 100;
                  return (
                    <motion.line
                      key={i}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="url(#lineGradient)"
                      strokeWidth="1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 0.5, 0.5, 0]
                      }}
                      transition={{
                        duration: 8,
                        delay: i * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Floating industry icons */}
              <div className="absolute inset-0 overflow-hidden">
                {[
                  { icon: "💰", top: "15%", left: "10%", delay: 0.5 },
                  { icon: "🏥", top: "75%", left: "80%", delay: 1.2 },
                  { icon: "⚖️", top: "30%", left: "85%", delay: 2.1 },
                  { icon: "🏢", top: "65%", left: "25%", delay: 0.8 },
                  { icon: "🎓", top: "20%", left: "60%", delay: 1.5 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-lg opacity-30"
                    style={{ top: item.top, left: item.left }}
                    animate={{ 
                      y: [0, -15, 0],
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                      duration: 5,
                      delay: item.delay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {item.icon}
                  </motion.div>
                ))}
              </div>
              
              {/* Glowing orbs */}
              <FloatingElement 
                className="absolute top-[40%] right-[20%] w-32 h-32 opacity-5"
                delay={0.8}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-purple-500 blur-xl animate-spin-slow" />
              </FloatingElement>
              
              <FloatingElement 
                className="absolute bottom-[30%] left-[15%] w-24 h-24 opacity-5"
                delay={1.4}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
              </FloatingElement>
            </div>
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>Real World Applications</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Applicable to all <GradientText>Industries</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  See how any field of work can benefit from automated workflows
                </p>
              </motion.div>

              {/* Redesigned industry cards section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Briefcase className={`h-6 w-6 text-blue-400`} />,
                    title: "Finance & Banking",
                    description: "Cut processing time by 95% for invoices, statements, and tax documents.",
                    benefits: [
                      "Process 10,000+ invoices daily",
                      "Automate payment matching",
                      "Real-time fraud detection",
                      "Instant compliance checks"
                    ],
                    examples: [
                      "Invoice processing",
                      "Bank statements",
                      "Tax documents",
                      "Financial reports"
                    ],
                    color: "blue"
                  },
                  {
                    icon: <Stethoscope className={`h-6 w-6 text-purple-400`} />,
                    title: "Healthcare",
                    description: "Process patient records and claims in seconds instead of hours.",
                    benefits: [
                      "Instant patient record updates",
                      "Real-time insurance verification",
                      "HIPAA compliant processing",
                      "Automated billing cycles"
                    ],
                    examples: [
                      "Medical records",
                      "Insurance claims",
                      "Lab reports",
                      "Patient forms"
                    ],
                    color: "purple"
                  },
                  {
                    icon: <Scale className={`h-6 w-6 text-amber-400`} />,
                    title: "Legal",
                    description: "Review contracts and legal documents 50x faster with AI.",
                    benefits: [
                      "Instant contract analysis",
                      "Automated compliance checks",
                      "Quick case research",
                      "Real-time risk assessment"
                    ],
                    examples: [
                      "Contracts",
                      "Court documents",
                      "Legal briefs",
                      "Compliance reports"
                    ],
                    color: "amber"
                  },
                  {
                    icon: <ShieldCheck className={`h-6 w-6 text-green-400`} />,
                    title: "Insurance",
                    description: "Process 10,000 claims daily with 99.9% accuracy.",
                    benefits: [
                      "Instant claim processing",
                      "Automated underwriting",
                      "Real-time fraud detection",
                      "Smart policy management"
                    ],
                    examples: [
                      "Claims forms",
                      "Policy documents",
                      "Assessment reports",
                      "Coverage verification"
                    ],
                    color: "green"
                  },
                  {
                    icon: <Users className={`h-6 w-6 text-rose-400`} />,
                    title: "HR & Recruiting",
                    description: "Screen 1000s of applications daily, automate employee docs.",
                    benefits: [
                      "Instant resume screening",
                      "Automated onboarding",
                      "Quick background checks",
                      "Smart document routing"
                    ],
                    examples: [
                      "Resumes",
                      "Employee records",
                      "Contracts",
                      "Performance reviews"
                    ],
                    color: "rose"
                  },
                  {
                    icon: <Factory className={`h-6 w-6 text-cyan-400`} />,
                    title: "Manufacturing",
                    description: "Automate quality control and compliance documentation.",
                    benefits: [
                      "Real-time QC verification",
                      "Instant compliance checks",
                      "Automated inventory docs",
                      "Smart maintenance logs"
                    ],
                    examples: [
                      "Quality reports",
                      "Safety documents",
                      "Inventory records",
                      "Maintenance logs"
                    ],
                    color: "cyan"
                  }
                ].map((industry, index) => (
                  <UseCaseCard
                    key={index}
                    icon={industry.icon}
                    title={industry.title}
                    description={industry.description}
                    benefits={industry.benefits}
                    examples={industry.examples}
                    color={industry.color}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section divider - replaced with SectionDivider component */}
          <SectionDivider />

          {/* Document Types Section */}
          <section className="py-10 px-6 relative bg-black">
            {/* Section background */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <div className="absolute inset-0 bg-black opacity-100" />
              
              {/* Animated orbital elements */}
              <motion.div 
                className="absolute h-[500px] w-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 100,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="h-full w-full rounded-full border border-primary/10 absolute" />
                <div className="h-full w-full rounded-full border border-purple-500/10 absolute rotate-45" />
                <div className="h-full w-full rounded-full border border-blue-500/10 absolute rotate-90" />
              </motion.div>
              
              {/* Floating 3D elements */}
              <FloatingElement 
                className="absolute top-[10%] right-[5%] w-36 h-36 opacity-10"
                delay={0.7}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-blue-500 blur-xl animate-spin-slow" />
              </FloatingElement>
              
              <FloatingElement 
                className="absolute bottom-[15%] left-[10%] w-24 h-24 opacity-10"
                delay={0.3}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
              </FloatingElement>
              
              {/* Subtle grid lines */}
              <div className="absolute inset-0 grid grid-cols-6 opacity-5">
                {Array(6).fill(null).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="h-full w-[1px] bg-primary/10 justify-self-center"
                    initial={{ height: "0%" }}
                    animate={{ height: "100%" }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Moving dots */}
              <motion.div 
                className="absolute left-[30%] opacity-30"
                animate={{ 
                  y: ["-100%", "200%"],
                  opacity: [0, 0.3, 0]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </motion.div>
              
              <motion.div 
                className="absolute left-[70%] opacity-30"
                animate={{ 
                  y: ["200%", "-100%"],
                  opacity: [0, 0.3, 0]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
            </motion.div>
          </div>
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Supported Document Types</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  One Platform, <GradientText>All Documents</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Process any document type with unlimited flexibility
                </p>
              </motion.div>

              {/* Redesigned Interactive Document Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Financial Documents",
                    icon: <DollarSign className="h-5 w-5 text-green-400" />,
                    color: "green",
                    description: "Process financial documents with high accuracy and security",
                    items: [
                      "Invoices & Bills",
                      "Bank Statements",
                      "Tax Forms (T4, W-2, 1099)",
                      "Purchase Orders",
                      "Expense Reports",
                      "Financial Statements",
                      "Credit Card Statements",
                      "Payroll Documents"
                    ]
                  },
                  {
                    title: "Legal Documents",
                    icon: <Scale className="h-5 w-5 text-blue-400" />,
                    color: "blue",
                    description: "Handle legal documentation with precision and compliance",
                    items: [
                      "Contracts & Agreements",
                      "Legal Briefs",
                      "Court Documents",
                      "Patents & Trademarks",
                      "Compliance Reports",
                      "NDAs",
                      "Terms of Service",
                      "Legal Notices"
                    ]
                  },
                  {
                    title: "Healthcare Documents",
                    icon: <Stethoscope className="h-5 w-5 text-purple-400" />,
                    color: "purple",
                    description: "Manage medical records with HIPAA compliance and accuracy",
                    items: [
                      "Medical Records",
                      "Insurance Claims",
                      "Lab Reports",
                      "Prescriptions",
                      "Patient Forms",
                      "Discharge Summaries",
                      "Medical Bills",
                      "Health Insurance Forms"
                    ]
                  },
                  {
                    title: "Business Documents",
                    icon: <Briefcase className="h-5 w-5 text-cyan-400" />,
                    color: "cyan",
                    description: "Streamline business operations with automated document processing",
                    items: [
                      "Business Licenses",
                      "Corporate Filings",
                      "Annual Reports",
                      "Board Minutes",
                      "Project Proposals",
                      "Business Plans",
                      "Partnership Agreements",
                      "Vendor Contracts"
                    ]
                  },
                  {
                    title: "Personal Documents",
                    icon: <Users className="h-5 w-5 text-amber-400" />,
                    color: "amber",
                    description: "Secure handling of sensitive personal documentation",
                    items: [
                      "ID Documents",
                      "Passports",
                      "Driver's Licenses",
                      "Birth Certificates",
                      "Marriage Certificates",
                      "Academic Transcripts",
                      "Diplomas",
                      "Property Deeds"
                    ]
                  },
                  {
                    title: "Administrative Documents",
                    icon: <FileText className="h-5 w-5 text-rose-400" />,
                    color: "rose",
                    description: "Efficiently process administrative and HR documentation",
                    items: [
                      "Employment Contracts",
                      "HR Forms",
                      "Performance Reviews",
                      "Training Certificates",
                      "Incident Reports",
                      "Maintenance Logs",
                      "Inventory Records",
                      "Quality Control Reports"
                    ]
                  }
                ].map((category, index) => (
                  <UseCaseCard
                    key={index}
                    icon={category.icon}
                    title={category.title}
                    description={category.description}
                    benefits={category.items.slice(0, 4)}
                    examples={category.items.slice(4)}
                    color={category.color}
                  />
                ))}
              </div>
          </div>
          </section>

          {/* Section divider */}
          <SectionDivider />

          {/* Industry Impact Projections */}
          <section className="py-10 px-6 relative bg-black">
            {/* Section background */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <div className="absolute inset-0 bg-black opacity-100" />
              
              {/* Data visualization elements */}
              <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden opacity-15">
                <motion.div 
                  className="absolute inset-0 flex space-x-1"
                  animate={{ x: [0, -1000] }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  {Array(50).fill(null).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="h-40 w-1 bg-primary/30"
                      initial={{ height: 40 }}
                      animate={{ 
                        height: [40, 120, 80, 160, 40],
                      }}
                      transition={{ 
                        duration: 4,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  ))}
                </motion.div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-15">
                <motion.div 
                  className="absolute inset-0 flex space-x-1"
                  animate={{ x: [-1000, 0] }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  {Array(50).fill(null).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="h-40 w-1 bg-purple-500/30"
                      initial={{ height: 40 }}
                      animate={{ 
                        height: [40, 100, 60, 140, 40],
                      }}
                      transition={{ 
                        duration: 5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  ))}
                </motion.div>
              </div>
              
              {/* Digital network effect */}
              <div className="absolute inset-0 opacity-10">
                {Array(20).fill(null).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Radiating circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {Array(3).fill(null).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
                    animate={{
                      width: ["0vh", "100vh"],
                      height: ["0vh", "100vh"],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Floating elements */}
              <FloatingElement 
                className="absolute top-[20%] right-[15%] w-16 h-16 opacity-10"
                delay={1.5}
              >
                <div className="w-full h-full rounded-full bg-primary/20 blur-xl" />
              </FloatingElement>
              
              <FloatingElement 
                className="absolute bottom-[25%] left-[20%] w-24 h-24 opacity-10"
                delay={0.8}
              >
                <div className="w-full h-full rounded-full bg-blue-500/20 blur-xl" />
              </FloatingElement>
            </div>
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Projections</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  <GradientText>Estimated Impact</GradientText> by Industry
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Example estimates of document automation impact based on industry benchmarks
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-xl shadow-primary/5 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-10" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
                
                <div className="overflow-x-auto relative z-10">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-5 text-left font-medium text-sm text-primary">Industry</th>
                        <th className="p-5 text-left font-medium text-sm text-primary">Processing Time</th>
                        <th className="p-5 text-left font-medium text-sm text-primary">FTE Impact</th>
                        <th className="p-5 text-left font-medium text-sm text-primary">Annual Savings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        {
                          industry: "Banking & Finance",
                          icon: <Building2 className="h-5 w-5" />,
                          processing: "3-5 days → 2-5 minutes",
                          processingReduction: "99.8%",
                          processingBar: 99,
                          workforce: "60-70% reduction",
                          workforceBar: 65,
                          workforceDetail: "26 FTEs → 8 FTEs (oversight)",
                          cost: "$1.3M → $26K",
                          costReduction: "$1.27M",
                          costBar: 98,
                        },
                        {
                          industry: "Healthcare",
                          icon: <Stethoscope className="h-5 w-5" />,
                          processing: "36 hours → 45 seconds",
                          processingReduction: "99.7%",
                          processingBar: 99.7,
                          workforce: "55-65% reduction",
                          workforceBar: 60,
                          workforceDetail: "22 FTEs → 9 FTEs (clinical validation)",
                          cost: "$980K → $29K",
                          costReduction: "$951K",
                          costBar: 97,
                        },
                        {
                          industry: "Legal Services",
                          icon: <Scale className="h-5 w-5" />,
                          processing: "2 days → 3-8 minutes",
                          processingReduction: "99.5%",
                          processingBar: 99.5,
                          workforce: "50-60% reduction",
                          workforceBar: 55,
                          workforceDetail: "18 FTEs → 8 FTEs (legal review)",
                          cost: "$720K → $32K",
                          costReduction: "$688K",
                          costBar: 95,
                        },
                        {
                          industry: "Insurance",
                          icon: <ShieldCheck className="h-5 w-5" />,
                          processing: "4-6 days → 30-60 seconds",
                          processingReduction: "99.9%",
                          processingBar: 99.9,
                          workforce: "65-75% reduction",
                          workforceBar: 70,
                          workforceDetail: "32 FTEs → 10 FTEs (complex claims)",
                          cost: "$1.6M → $24K",
                          costReduction: "$1.58M",
                          costBar: 98.5,
                        },
                        {
                          industry: "Real Estate",
                          icon: <Building className="h-5 w-5" />,
                          processing: "1.5 days → 1-4 minutes",
                          processingReduction: "99.8%",
                          processingBar: 99.8,
                          workforce: "45-55% reduction",
                          workforceBar: 50,
                          workforceDetail: "14 FTEs → 7 FTEs (transaction oversight)",
                          cost: "$540K → $18K",
                          costReduction: "$522K",
                          costBar: 97
                        }
                      ].map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="group hover:bg-white/5 transition-colors duration-300"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center text-primary group-hover:from-primary/30 group-hover:via-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                                {item.icon}
                              </div>
                              <span className="font-medium text-base">{item.industry}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="space-y-2">
                              <div className="text-sm">{item.processing}</div>
                              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-primary/90 via-primary to-purple-500/90 h-full rounded-full" 
                                  style={{ width: `${item.processingBar}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-primary font-medium">{item.processingReduction} reduction</div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="space-y-2">
                              <div className="text-sm">{item.workforce}</div>
                              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500/90 via-blue-500 to-purple-500/90 h-full rounded-full" 
                                  style={{ width: `${item.workforceBar}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-muted-foreground">{item.workforceDetail}</div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="space-y-2">
                              <div className="text-sm">{item.cost}</div>
                              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-green-500/90 via-green-400 to-emerald-500/90 h-full rounded-full" 
                                  style={{ width: `${item.costBar}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-green-400 font-medium">{item.costReduction} annually</div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Based on medium-sized enterprises (100-500 employees)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>12-month ROI projections</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section divider - replaced with SectionDivider component */}
          <SectionDivider icon={<ArrowRight className="h-6 w-6 text-primary" />} />

          {/* Try Demo Section */}
          <section className="py-10 px-6 relative overflow-hidden bg-black">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden bg-black">
              <div className="absolute inset-0 bg-black opacity-100" />
              
              {/* Animated circular elements */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] opacity-5"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 120,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="absolute inset-0 rounded-full border border-primary/20" />
                <div className="absolute inset-0 rounded-full border border-primary/20 rotate-45" />
                <div className="absolute inset-0 rounded-full border border-primary/20 rotate-90" />
              </motion.div>
              
              {/* Floating elements */}
              <FloatingElement 
                className="absolute bottom-[20%] right-[15%] w-40 h-40 opacity-5"
                delay={0.5}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-blue-500 blur-xl animate-spin-slow" />
              </FloatingElement>
              
              <FloatingElement 
                className="absolute top-[15%] left-[10%] w-48 h-48 opacity-5"
                delay={1}
              >
                <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
              </FloatingElement>
              
              {/* Code panels in background */}
              <div className="absolute top-10 left-10 opacity-10 text-2xl font-mono">
                {['{', '"document":', '{', '"type":', '"invoice",', '"amount":', '"$2,450.00",', '"date":', '"2025-03-20"', '}', '}'].map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 10
                    }}
                    className="text-primary/40 ml-4"
                    style={{ marginLeft: `${Math.min(index, 2) * 1}rem` }}
                  >
                    {text}
                  </motion.div>
                ))}
              </div>
              
              <div className="absolute bottom-10 right-10 opacity-10 text-2xl font-mono">
                {['{', '"accuracy":', '0.999,', '"time":', '7.2,', '"success":', 'true', '}'].map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1 + 1, 
                      duration: 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 10
                    }}
                    className="text-primary/40 ml-4"
                    style={{ marginLeft: `${Math.min(index, 2) * 1}rem` }}
                  >
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1"
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Demo</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-6">
                    <GradientText>Try It Yourself</GradientText>
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8">
                    Upload your documents and see how fast we can extract the data. No credit card required.
                  </p>
                  <div className="flex flex-wrap gap-4">
                  <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                        <span className="relative z-10 flex items-center">
                          Try It Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                    </Button>
                  </Link>
                </div>
              </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1 relative"
                >
                  <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-10" />
                    <CardContent className="p-0 relative z-10">
                      <div className="bg-black/90 backdrop-blur-md">
                        <div className="bg-black/90 backdrop-blur-md p-4 flex items-center gap-2 border-b border-white/10">
                          <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                          <div className="text-xs text-white/70 ml-2">Document Processing Demo</div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">invoice-0042.pdf</div>
                                  <div className="text-xs text-muted-foreground">Uploaded 2 minutes ago</div>
                                </div>
                              </div>
                              <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium border border-green-500/20">Processed</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <div className="text-xs text-white/50 mb-2">Processing Status</div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full"
                                    initial={{ width: "0%" }}
                                    whileInView={{ width: "100%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                                  <div className="text-xs text-white/50 mb-1">Invoice Amount</div>
                                  <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">$2,450.00</div>
                                </div>
                                
                                <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                                  <div className="text-xs text-white/50 mb-1">Vendor</div>
                                  <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">Acme Supplies Inc.</div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                                  <div className="text-xs text-white/50 mb-1">Due Date</div>
                                  <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">March 20, 2025</div>
                                </div>
                                
                                <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                                  <div className="text-xs text-white/50 mb-1">Processing Time</div>
                                  <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">7.2 seconds</div>
                                </div>
                              </div>
                            </div>
                          
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.05) 50%, transparent 70%)",
                      filter: "blur(40px)",
                      zIndex: -1,
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
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 