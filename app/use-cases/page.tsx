"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Sparkles 
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { SectionDivider } from "@/components/use-cases/shared/SectionDivider";
import { Particle } from "@/components/use-cases/shared/Particle";
import { HeroSection } from "@/components/use-cases/HeroSection";
import { ComparisonSection } from "@/components/use-cases/ComparisonSection";
import { IndustriesSection } from "@/components/use-cases/IndustriesSection";
import { DocumentTypesSection } from "@/components/use-cases/DocumentTypesSection";
import { ProjectionsSection } from "@/components/use-cases/ProjectionsSection";
import { DemoSection } from "@/components/use-cases/DemoSection";

export default function UseCasesPage() {
  // Theme is automatically handled by ThemeProvider
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Generate particles - Reduced count
  const particleCount = 5; // Reduced from 15
  const particles = useMemo(() => Array(particleCount).fill(null), []);
  const particles2 = useMemo(() => Array(particleCount).fill(null), []);
  const particles3 = useMemo(() => Array(particleCount).fill(null), []);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Optional: Render a loading state or null until mounted to avoid flash of incorrect theme/layout
    return null; 
  }

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
          {/* Hero Section - Replaced with component */}
          <HeroSection mounted={mounted} />

          {/* Comparison Section - Added component */}
          <ComparisonSection />

          {/* Section divider */}
          <SectionDivider icon={<FileText className="h-6 w-6 text-primary" />} />

          {/* Industries Section - Replaced with component */}
          <IndustriesSection />

          {/* Section divider */}
          <SectionDivider />

          {/* Document Types Section - Replaced with component */}
          <DocumentTypesSection />

          {/* Section divider */}
          <SectionDivider />

          {/* Industry Impact Projections - Replaced with component */}
          <ProjectionsSection />

          {/* Section divider */}
          <SectionDivider icon={<ArrowRight className="h-6 w-6 text-primary" />} />

          {/* Try Demo Section - Replaced with component */}
          <DemoSection />

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 