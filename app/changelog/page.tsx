"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Users, Wand2, Sparkles, Star, Zap, ArrowRight, Clock, CheckCircle, ChevronRight, ArrowUpRight, Code, Save, GitBranch, Calendar, Tag, MessageCircle, TrendingUp, BarChart3, FileSpreadsheet, History } from "lucide-react";
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
  title = "Docimate", 
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

// Changelog entry component with terminal style
const ChangelogEntry = ({ 
  version, 
  date, 
  title, 
  features,
  icon: Icon,
  index,
  imageUrl,
  isLatest = false
}: { 
  version: string;
  date: string;
  title: string;
  features: string[];
  icon: any;
  index: number;
  imageUrl: string;
  isLatest?: boolean;
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
      className="relative mb-8"
      id={`version-${version}`}
    >
      {/* Terminal-style window */}
      <div className="overflow-hidden rounded-lg border border-white/20 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]">
        {/* Terminal header */}
        <div className="flex items-center px-4 py-3 border-b border-white/20 bg-gradient-to-r from-gray-800/90 to-black/90">
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="text-xs font-medium text-white/90 flex-1 flex items-center">
            <span className="text-primary font-bold">docimate</span>
            <span className="mx-1 text-white/60">:</span>
            <span className="text-blue-400">~/changelog</span>
            <span className="ml-1 text-white/60">$</span>
            <span className="ml-2 text-green-400">git log --oneline v{version}</span>
          </div>
        </div>
        
        {/* Terminal content */}
        <div className="p-6 font-mono text-sm bg-gradient-to-b from-black/95 to-gray-900/95">
          {/* Version header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-bold text-xl">{title}</h3>
                  {isLatest && (
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                      LATEST
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>v{version}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{date}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm">✓ Released</div>
            </div>
          </div>

          {/* Features section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Features list */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
                <GitBranch className="w-4 h-4" />
                <span>What's New</span>
              </div>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">+</span>
                    <span className="text-white/80 leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Image preview */}
            <div className="flex-shrink-0">
              <div className="relative rounded-lg overflow-hidden border border-white/10">
                <Image 
                  src={imageUrl} 
                  alt={`${title} feature illustration`} 
                  className="w-full object-cover" 
                  width={1400}
                  height={700}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* Command line footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center text-white/60 text-xs">
              <span className="text-green-400 mr-2">$</span>
              <span>git checkout v{version}</span>
              <span className="ml-4 text-white/40"># Switch to this version</span>
            </div>
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

  const [selectedVersion, setSelectedVersion] = useState<string>("");

  // Theme is automatically handled by ThemeProvider
  const { theme } = useTheme();

  const releases = [
    {
      version: "1.7",
      date: "August 3, 2025",
      title: "AI Chat",
      icon: MessageCircle,
      imageUrl: "/versions/v1.7.png",
      features: [
        "Interactive AI chat for document and spreadsheet",
        "Context-aware responses based on selected content",
        "Real-time document Q&A capabilities",
        "Chat history and conversation management"
      ]
    },
    {
      version: "1.6",
      date: "July 7, 2025",
      title: "Smart Summarization and Analysis",
      icon: Sparkles,
      imageUrl: "/versions/v1.6.png",
      features: [
        "AI-powered document and spreadsheet summarization",
        "Multiple summary formats and styles",
        "Key insights and keyword extraction",
        "Confidence scoring for extracted data",
        "Export summaries in various formats"
      ]
    },
    {
      version: "1.5",
      date: "June 12, 2025",
      title: "Spreadsheet Support",
      icon: FileSpreadsheet,
      imageUrl: "/versions/v1.5.png",
      features: [
        "Full spreadsheet processing and analysis",
        "Excel and CSV file support",
        "Data extraction and formatting",
        "Formula calculation and validation",
        "Cell-level data manipulation",
        "Smart chart generation from spreadsheet data"
      ]
    },
    {
      version: "1.4",
      date: "May 28, 2025",
      title: "PDF Viewer and Editor",
      icon: FileText,
      imageUrl: "/versions/v1.4.png",
      features: [
        "Advanced PDF viewer with native controls",
        "Text selection and annotation tools",
        "Drawing and markup capabilities",
        "Multi-page document navigation",
        "PDF context menus with quick actions",
        "Improved OCR accuracy and processing speed"
      ]
    },
    {
      version: "1.3",
      date: "April 5, 2025",
      title: "Template Editor",
      icon: Save,
      imageUrl: "/versions/v1.3.png",
      features: [
        "Create and manage templates for your documents",
        "Choose the data you want to extract from your documents",
        "Store templates for your documents",
        "Use templates to quickly create new documents",
      ]
    },
    {
      version: "1.2",
      date: "March 8, 2025",
      title: "Usage and History",
      icon: History,
      imageUrl: "/versions/v1.2.png",
      features: [
        "Track every prompt and response",
        "Manage usage limits and status",
        "Cache documents, prompts, and replies",
      ]
    },
    {
      version: "1.1",
      date: "February 22, 2025",
      title: "User Accounts & Security",
      icon: Users,
      imageUrl: "/versions/v1.1.png",
      features: [
        "User accounts and session management",
        "Security features to protect your account and data"
      ]
    },
    {
      version: "1.0",
      date: "February 16, 2025",
      title: "Initial Release",
      icon: FileText,
      imageUrl: "/versions/v1.0.png",
      features: [
        "Demo to show the capabilities of the app",
        "Limited to 5 document types",
        "Limited to only PDF files",
        "Basic user interface"
      ]
    }
  ];

  const handleVersionSelect = (version: string) => {
    setSelectedVersion(version);
    if (version) {
      const element = document.getElementById(`version-${version}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

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
            
            <div className="container max-w-5xl mx-auto relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto mb-12"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Development & History</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <GradientText>Changelog</GradientText>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                  Track our progress and see what's new in each release
                </p>
                
                {/* Quick Jump Selector */}
                <div className="flex justify-center">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 w-full">
                      <GitBranch className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-white/80 text-sm font-medium w-full">Jump to version:</span>
                      <Select value={selectedVersion} onValueChange={handleVersionSelect}>
                        <SelectTrigger className="min-w-100 bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          {releases.map((release) => (
                            <SelectItem 
                              key={release.version} 
                              value={release.version}
                              className="text-white hover:bg-white/10"
                            >
                              v{release.version} - {release.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Changelog entries */}
              <div className="space-y-8">
                {releases.map((release, index) => (
                  <ChangelogEntry 
                    key={index} 
                    {...release} 
                    index={index} 
                    isLatest={index === 0}
                  />
                ))}
              </div>

              
            </div>
          </section>
        </div>
        <Footer />
      </ScrollArea>
    </div>
  );
} 
 