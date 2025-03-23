"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
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

export default function LearnMorePage() {
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

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 z-50"
        style={{ scaleX }}
      />

      <ScrollArea className="h-screen">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-20" />
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)",
              }} />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  About <GradientText>DocMate</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  DocMate is an AI-powered document analysis platform that helps you process and understand documents efficiently.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/demo">
                    <Button size="lg" className="gap-2">
                      Try Demo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg" className="gap-2">
                      Back to Home <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-3xl">
              <div className="prose prose-invert">
                <h2>What is DocMate?</h2>
                <p>
                  DocMate is a document analysis platform that uses artificial intelligence to help you process and understand documents more efficiently. Our platform combines advanced technologies to extract meaningful information from your documents automatically.
                </p>
                
                <h2>Key Features</h2>
                <ul>
                  <li>Automated document processing</li>
                  <li>Intelligent data extraction</li>
                  <li>Secure document handling</li>
                  <li>Easy integration options</li>
                </ul>

                <h2>Getting Started</h2>
                <p>
                  Try our demo to see how DocMate can help streamline your document processing workflow. Our platform is designed to be intuitive and easy to use, while providing powerful features for document analysis.
                </p>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 