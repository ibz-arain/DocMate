"use client";

import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Wand2, Sparkles, Star, Zap } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
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

// Enhanced floating particles component
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 80 }).map((_, i) => {
        const size = Math.random() * 3 + (i % 5 === 0 ? 2 : 1);
        const opacity = Math.random() * 0.3 + 0.1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: i % 8 === 0 ? `rgba(var(--primary-rgb), ${opacity})` : 
                              i % 5 === 0 ? `rgba(147, 51, 234, ${opacity})` : 
                              `rgba(255, 255, 255, ${opacity})`,
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

// Animated badge component
const AnimatedBadge = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {children}
    </div>
  );
};

// Timeline item component with enhanced animations
const TimelineItem = ({ 
  version, 
  date, 
  title, 
  description, 
  features,
  icon: Icon,
  index
}: { 
  version: string;
  date: string;
  title: string;
  description: string;
  features: string[];
  icon: any;
  index: number;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });
  
  // Adjusted to ensure older versions aren't dimmed
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.98, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [40, 0]);
  
  // Parallax effect for the icon
  const iconY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  
  // Removed rotation effect for the icon on hover
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <motion.div
      ref={itemRef}
      style={{ 
        scale,
        y
      }}
      className="relative pl-12 pb-24 last:pb-0"
    >
      {/* Timeline line with enhanced glow effect */}
      <div className="absolute left-[11px] top-2 bottom-0 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent">
        <motion.div 
          className="absolute inset-0 bg-primary/50"
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.5
          }}
        />
      </div>
      
      {/* Animated timeline dot with pulse effect */}
      <motion.div 
        className="absolute left-0 top-2 w-6 h-6 rounded-full bg-black border-2 border-primary flex items-center justify-center z-10"
        animate={{ 
          boxShadow: ['0 0 0px rgba(var(--primary-rgb), 0.3)', '0 0 12px rgba(var(--primary-rgb), 0.8)', '0 0 0px rgba(var(--primary-rgb), 0.3)']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: index * 0.5
        }}
      >
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.5
          }}
        />
      </motion.div>
      
      {/* Enhanced card with hover effect */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <Card className="bg-black/80 backdrop-blur-sm border border-white/10 overflow-hidden shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>
          
          <CardContent className="p-8 relative">
            {/* Version badge */}
            <div className="absolute top-4 right-4">
              <AnimatedBadge>
                <Star className="h-3.5 w-3.5 mr-1.5" />
                <span>v{version}</span>
              </AnimatedBadge>
            </div>
            
            <div className="flex items-center gap-5 mb-6">
              <motion.div 
                className="w-14 h-14 rounded-xl bg-black border border-primary/30 flex items-center justify-center relative overflow-hidden"
                style={{ y: iconY }}
                // Removed spinning animation
              >
                {/* Icon background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <Icon className="w-7 h-7 text-primary relative z-10" />
              </motion.div>
              
              <div>
                <div className="text-sm text-white mb-1 flex items-center font-medium">
                  <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  {date}
                </div>
                <h3 className="text-2xl font-bold">
                  <GradientText>{title}</GradientText>
                </h3>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6 text-lg">{description}</p>
            
            <div className="space-y-3.5">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default function ChangelogPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Force dark theme
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  // Noise texture effect
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
          ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.02)`;
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      setNoiseTexture(`url(${canvas.toDataURL()})`);
    }
  }, []);

  const releases = [
    {
      version: "1.2",
      date: "March 8, 2024",
      title: "Dynamic Document Analysis",
      description: "Complete remake with customizable output formats and analysis parameters.",
      icon: Wand2,
      features: [
        "Customizable output formats",
        "Dynamic field extraction",
        "Enhanced analysis accuracy",
        "Improved UI/UX",
        "Real-time extraction preview"
      ]
    },
    {
      version: "1.1",
      date: "February 22, 2024",
      title: "User Accounts & History",
      description: "Added user accounts and document history tracking.",
      icon: Users,
      features: [
        "User account system",
        "Document history storage",
        "Quick access to past documents",
        "Document organization",
        "Enhanced privacy controls"
      ]
    },
    {
      version: "1.0",
      date: "February 16, 2024",
      title: "Initial Release",
      description: "Limited demo with five document types support.",
      icon: FileText,
      features: [
        "Bank statement analysis",
        "Tax form processing",
        "Electric bill extraction",
        "Store receipt scanning",
        "Dental claim processing"
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-black">
      <Header />
      <ScrollArea className="h-screen">
        <div className="container max-w-4xl mx-auto px-6 py-24">
          {/* Header with enhanced animations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-28"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Release History</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <GradientText>Changelog</GradientText>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              Our journey of continuous improvement
            </motion.p>
          </motion.div>

          {/* Timeline with enhanced scroll effects */}
          <div className="relative">
            {releases.map((release, index) => (
              <TimelineItem key={index} {...release} index={index} />
            ))}
          </div>
          
          {/* Future updates teaser with enhanced animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
          </motion.div>
        </div>
        <Footer />
      </ScrollArea>
    </div>
  );
} 