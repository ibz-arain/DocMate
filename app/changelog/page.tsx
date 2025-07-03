"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Wand2, Sparkles, Star, Zap, ArrowRight, Clock, CheckCircle, ChevronRight, ArrowUpRight, Code, Save } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// Subtle background noise
const BackgroundNoise = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-15"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px',
      }}
    />
  );
};

// Mac window style component
const MacWindow = ({ 
  children, 
  title = "DocMate", 
  variant = "default",
  className = ""
}: { 
  children: React.ReactNode; 
  title?: string;
  variant?: "default" | "future";
  className?: string;
}) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-gray-800 to-black backdrop-blur-md shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)] ${className}`}>
      {/* Window header */}
      <div className="flex items-center px-4 py-2 border-b border-white/20 bg-gradient-to-r from-gray-800 via-black to-gray-800">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs font-medium text-white flex-1 text-center">{title}</div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>
      
      {/* Window content */}
      <div className="p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

// Version badge component
const VersionBadge = ({ version }: { version: string }) => {
  return (
    <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary/20 text-primary text-xs font-bold border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
      <Star className="h-3.5 w-3.5 mr-1.5" />
      <span>v{version}</span>
    </div>
  );
};

// Timeline item component with terminal style
const TimelineItem = ({ 
  version, 
  date, 
  title, 
  features,
  icon: Icon,
  index,
  imageUrl
}: { 
  version: string;
  date: string;
  title: string;
  features: string[];
  icon: any;
  index: number;
  imageUrl: string;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 0.3], [20, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);
  
  return (
    <motion.div
      ref={itemRef}
      style={{ y, opacity }}
      className="relative pl-8 pb-16 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/60 via-primary/40 to-primary/20" />
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary/50 border-2 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] flex items-center justify-center z-10" />
      
      {/* Terminal-style window */}
      <div className="overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)]">
        {/* Terminal header */}
        <div className="flex items-center px-4 py-2 border-b border-white/20 bg-black">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-xs font-medium text-white/90 flex-1 flex items-center">
            <span className="text-primary font-bold">docmate</span>
            <span className="mx-1 text-white/60">:</span>
            <span className="text-blue-400">~/releases</span>
            <span className="ml-1 text-white/60">$</span>
          </div>
        </div>
        
        {/* Terminal content */}
        <div className="p-5 font-mono text-sm bg-gradient-to-b from-black to-gray-900/80 flex gap-4">
          {/* Left Half (Text Content) */}
          <div className="w-1/2 flex flex-col gap-3">
            {/* Simple command */}
            <div className="flex items-center text-white/90">
              <span className="text-green-400 mr-2">$</span>
              <span className="text-white/90">v{version}</span>
            </div>
            
            {/* Release info - simplified */}
          <div className="bg-black/30 rounded-md border border-white/10 p-4 mb-3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">{title}</h3>
                  <div className="px-2 py-0.5 rounded bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                    v{version}
                  </div>
                </div>
                
                <div className="text-primary font-medium text-sm mt-1">
                  Released: {date}
                </div>
              </div>
            </div>
          </div>

            {/* Features - compact */}
            <div className="flex-grow">
              <div className="text-sm text-primary mb-2">Features:</div>
              <div className="grid grid-cols-1 gap-1 pl-2 border-l border-primary/30">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="flex items-start gap-1.5 text-sm"
                  >
                    <span className="text-green-400 font-bold mt-0.5">✓</span>
                    <span className="text-white/80">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Half (Image) */}
          <div className="w-1/2 flex-shrink-0">
            <Image 
              src={imageUrl} 
              alt={`${title} feature illustration`} 
              className="w-full h-full rounded-md object-cover border border-white/10 shadow-md" 
              width={1080}
              height={540}
            />
          </div>
        </div>
      </div>
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

  // Theme is automatically handled by ThemeProvider
  const { theme } = useTheme();

  const releases = [
    {
      version: "1.3",
      date: "April 5, 2025",
      title: "Store templates",
      icon: Save,
      imageUrl: "/versions/v1.3.png",
      features: [
        "Store templates for your documents",
        "Use templates to quickly create new documents",
      ]
    },
    {
      version: "1.2",
      date: "March 8, 2024",
      title: "Custom Document Types",
      icon: Wand2,
      imageUrl: "/versions/v1.2.png",
      features: [
        "Make your own document types",
        "Customize the output with your own variables",
        "Updated User Interface (Sooo clean)",
      ]
    },
    {
      version: "1.1",
      date: "February 22, 2024",
      title: "User Accounts & Document History",
      icon: Users,
      imageUrl: "/versions/v1.1.png",
      features: [
        "User accounts and session management",
        "Store processed documents in your account",
        "A clean history page to manage your documents",
        "Security features to protect your account and data"
      ]
    },
    {
      version: "1.0",
      date: "February 16, 2024",
      title: "Initial Release",
      icon: FileText,
      imageUrl: "/versions/v1.0.png",
      features: [
        "Limited to 5 document types",
        "Limited to only PDF files",
        "Basic user interface"
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-black">
      <BackgroundNoise />
      
      <Header />
      <ScrollArea className="h-screen">
        <div className="relative">
          {/* Main Content Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-purple-500/15 opacity-20" />
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at 50% 30%, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)",
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
            
            <div className="container max-w-6xl mx-auto relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Development & History</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <GradientText>Changelog</GradientText>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Our journey as we go from better to best
                </p>
              </motion.div>

              {/* Release history section */}
              <div className="mb-16">
                <div className="flex items-center mb-10">
                  <div className="h-px bg-white/10 flex-grow"></div>
                  <h2 className="text-white/80 text-sm font-medium px-4 uppercase tracking-wider">Version History</h2>
                  <div className="h-px bg-white/10 flex-grow"></div>
                </div>
                
                <div className="relative">
                  {releases.map((release, index) => (
                    <TimelineItem key={index} {...release} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </ScrollArea>
    </div>
  );
} 
 