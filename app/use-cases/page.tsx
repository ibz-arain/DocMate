"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  Building2,
  TrendingUp,
  Stethoscope,
  FileCheck,
  ReceiptText,
  BatteryCharging,
  FileSpreadsheet,
  X,
  Check,
  MessageCircle,
  Code,
  Brain,
  Heart
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GradientText } from "@/components/use-cases/shared/GradientText";

import { SectionDivider } from "@/components/use-cases/shared/SectionDivider";
import { Particle } from "@/components/use-cases/shared/Particle";


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
      <div className="container mx-auto max-w-7xl relative z-10">
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">


          {/* Hero Section - Updated to reflect full platform capabilities */}

          <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm border border-primary/20 mb-6"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Use Cases</span>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-6xl font-bold mb-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="text-white">Traditional vs </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                    AI-Powered
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  See the difference between traditional document processing vs our automated approach
                </motion.p>
              </motion.div>

          {/* Comparison Section - Platform vs Traditional Methods */}
          <section className="pt-16 px-4 sm:px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">


              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Traditional Methods */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-red-500/20 rounded-2xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mr-4">
                        <X className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-red-400">Traditional Methods</h3>
                        <p className="text-red-400/80">Manual, Time-Consuming, Error-Prone</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">Manual Data Entry</h4>
                          <p className="text-muted-foreground text-sm">Hours spent copying data from documents to spreadsheets</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">Multiple Tools Required</h4>
                          <p className="text-muted-foreground text-sm">Switch between PDF readers, Excel, chat tools, and databases</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">Human Error Risk</h4>
                          <p className="text-muted-foreground text-sm">Typos, missed data, and inconsistent formatting</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">No Context Understanding</h4>
                          <p className="text-muted-foreground text-sm">Can't ask questions or get insights from documents</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">Limited Scalability</h4>
                          <p className="text-muted-foreground text-sm">Processing time increases linearly with document volume</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Docimate Platform */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-primary/20 rounded-2xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mr-4">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">Our Platform</h3>
                        <p className="text-primary/80">AI-Powered, Intelligent, Efficient</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Instant Data Extraction</h4>
                          <p className="text-muted-foreground text-sm">AI automatically extracts and structures data from any document</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Unified Platform</h4>
                          <p className="text-muted-foreground text-sm">Chat, extract, process, and analyze all in one place</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">AI Accuracy</h4>
                          <p className="text-muted-foreground text-sm">99%+ accuracy with intelligent error detection and correction</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Conversational Intelligence</h4>
                          <p className="text-muted-foreground text-sm">Ask questions and get instant answers from your documents</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-primary mb-1">Massive Scalability</h4>
                          <p className="text-muted-foreground text-sm">Process thousands of documents in minutes, not hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Industries Section - Real Use Cases */}
          <section className="pt-16 pb-8 px-4 sm:px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>Industry Applications</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                >
                  How Professionals <GradientText>Use Our Platform</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Real examples of how different industries leverage our platform's capabilities
                </motion.p>
              </motion.div>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {/* Finance & Banking */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mr-4">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-400">Finance & Banking</h3>
                        <p className="text-green-400/80 text-sm">Financial Analysis & Reporting</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-green-300 text-sm">Chat with Financial Reports</h4>
                          <p className="text-muted-foreground text-xs">"What was our Q3 revenue growth compared to last year?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-green-300 text-sm">Extract Transaction Data</h4>
                          <p className="text-muted-foreground text-xs">Automatically pull data from bank statements and invoices</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-green-300 text-sm">Process Spreadsheets</h4>
                          <p className="text-muted-foreground text-xs">Analyze Excel files with formulas and generate insights</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-300 text-xs font-mono">"What took our accounting lady 3 days to do the $30,000 monthly phone bill is now processed and ready to be paid in 30 seconds"</p>
                      <p className="text-green-400/60 text-xs mt-1">- Accountant</p>
                    </div>
                  </div>
                </motion.div>

                {/* Healthcare */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-4">
                        <Stethoscope className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-400">Healthcare</h3>
                        <p className="text-blue-400/80 text-sm">Medical Records & Research</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-blue-300 text-sm">Query Patient Records</h4>
                          <p className="text-muted-foreground text-xs">"Show me all patients with diabetes in the last 6 months"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-blue-300 text-sm">Extract Lab Results</h4>
                          <p className="text-muted-foreground text-xs">Automatically parse lab reports and test results</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-blue-300 text-sm">Research Data Analysis</h4>
                          <p className="text-muted-foreground text-xs">Process clinical trial data and research papers</p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </motion.div>

                {/* Legal */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-4">
                        <FileCheck className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-400">Legal</h3>
                        <p className="text-purple-400/80 text-sm">Contract Analysis & Research</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-purple-300 text-sm">Contract Review</h4>
                          <p className="text-muted-foreground text-xs">"What are the key terms in this contract?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-purple-300 text-sm">Extract Legal Clauses</h4>
                          <p className="text-muted-foreground text-xs">Automatically identify and extract specific legal terms</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-purple-300 text-sm">Case Research</h4>
                          <p className="text-muted-foreground text-xs">Search through case files and legal documents</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-purple-300 text-xs font-mono">"Instead of spending 2 hours reading through 50-page contracts, I just ask Docimate what I need and it tells me in 10 seconds"</p>
                      <p className="text-purple-400/60 text-xs mt-1">- Lawyer Assistant</p>
                    </div>
                  </div>
                </motion.div>

                {/* Real Estate */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mr-4">
                        <Building2 className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-400">Real Estate</h3>
                        <p className="text-orange-400/80 text-sm">Property Analysis & Documentation</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Property Data Extraction</h4>
                          <p className="text-muted-foreground text-xs">"What's the square footage and lot size?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Market Analysis</h4>
                          <p className="text-muted-foreground text-xs">Process MLS data and property spreadsheets</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Document Processing</h4>
                          <p className="text-muted-foreground text-xs">Extract data from deeds, contracts, and appraisals</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-orange-300 text-xs font-mono">"I hated having to go through multiple government ID's to find buyers information. Now I just upload 20 docs and ask Docimate to give me the information I need in like 10 seconds"</p>
                      <p className="text-orange-400/60 text-xs mt-1">- Real Estate Agent</p>
                    </div>
                  </div>
                </motion.div>

                {/* Manufacturing */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mr-4">
                        <BatteryCharging className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-cyan-400">Manufacturing</h3>
                        <p className="text-cyan-400/80 text-sm">Quality Control & Compliance</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-cyan-300 text-sm">Quality Reports</h4>
                          <p className="text-muted-foreground text-xs">"What's our defect rate for Product A?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-cyan-300 text-sm">Compliance Documents</h4>
                          <p className="text-muted-foreground text-xs">Extract data from safety reports and certifications</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-cyan-300 text-sm">Production Data</h4>
                          <p className="text-muted-foreground text-xs">Process manufacturing logs and efficiency reports</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <p className="text-cyan-300 text-xs font-mono">"Our procurement team used to manually cross-reference 200+ part numbers from supplier catalogs. Now Docimate does it automatically and finds the best prices"</p>
                      <p className="text-cyan-400/60 text-xs mt-1">- Robotics Company</p>
                    </div>
                  </div>
                </motion.div>

                {/* Insurance */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mr-4">
                        <FileCheck className="h-6 w-6 text-indigo-400" />
              </div>
                      <div>
                        <h3 className="text-xl font-bold text-indigo-400">Insurance</h3>
                        <p className="text-indigo-400/80 text-sm">Claims Processing & Risk Assessment</p>
            </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-indigo-300 text-sm">Claims Analysis</h4>
                          <p className="text-muted-foreground text-xs">"What's the total damage estimate from this accident report?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-indigo-300 text-sm">Policy Review</h4>
                          <p className="text-muted-foreground text-xs">Extract coverage details and exclusions from policy documents</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-indigo-300 text-sm">Risk Assessment</h4>
                          <p className="text-muted-foreground text-xs">Process medical records and property assessments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Education */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-4">
                        <FileText className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-400">Education</h3>
                        <p className="text-emerald-400/80 text-sm">Student Records & Research</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-emerald-300 text-sm">Transcript Analysis</h4>
                          <p className="text-muted-foreground text-xs">"What's the average GPA for students in this program?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-emerald-300 text-sm">Research Papers</h4>
                          <p className="text-muted-foreground text-xs">Process academic papers and extract key findings</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-emerald-300 text-sm">Application Processing</h4>
                          <p className="text-muted-foreground text-xs">Extract data from student applications and essays</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Consulting */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mr-4">
                        <Brain className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-amber-400">Consulting</h3>
                        <p className="text-amber-400/80 text-sm">Client Reports & Analysis</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-amber-300 text-sm">Client Data Analysis</h4>
                          <p className="text-muted-foreground text-xs">"What are the key insights from this market research report?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-amber-300 text-sm">Proposal Generation</h4>
                          <p className="text-muted-foreground text-xs">Extract data from client documents to build proposals</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-amber-300 text-sm">Competitive Analysis</h4>
                          <p className="text-muted-foreground text-xs">Process competitor reports and industry data</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-amber-300 text-xs font-mono">"We used to spend 2 days analyzing client financials. Now Docimate gives us the key metrics in 10 minutes"</p>
                      <p className="text-amber-400/60 text-xs mt-1">- Private Equity Consultant</p>
                    </div>
                  </div>
                </motion.div>

                {/* Non-Profit */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-teal-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mr-4">
                        <Heart className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-teal-400">Non-Profit</h3>
                        <p className="text-teal-400/80 text-sm">Grant Applications & Reports</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-teal-300 text-sm">Grant Processing</h4>
                          <p className="text-muted-foreground text-xs">"What are the requirements for this foundation grant?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-teal-300 text-sm">Impact Reports</h4>
                          <p className="text-muted-foreground text-xs">Extract data from program reports and evaluations</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-teal-300 text-sm">Donor Data</h4>
                          <p className="text-muted-foreground text-xs">Process donation records and donor communications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Media & Marketing */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mr-4">
                        <MessageCircle className="h-6 w-6 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-rose-400">Media & Marketing</h3>
                        <p className="text-rose-400/80 text-sm">Campaign Analysis & Content</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-rose-300 text-sm">Campaign Reports</h4>
                          <p className="text-muted-foreground text-xs">"What's the ROI on our Q4 social media campaign?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-rose-300 text-sm">Content Analysis</h4>
                          <p className="text-muted-foreground text-xs">Extract insights from competitor content and reports</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-rose-300 text-sm">Client Data</h4>
                          <p className="text-muted-foreground text-xs">Process client briefs and performance metrics</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                      <p className="text-rose-300 text-xs font-mono">"We used to manually analyze 50+ campaign reports monthly. Docimate now does it in 30 minutes and finds patterns we missed"</p>
                      <p className="text-rose-400/60 text-xs mt-1">- Private Marketing Agency</p>
                    </div>
                  </div>
                </motion.div>

                {/* Technology */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-violet-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mr-4">
                        <Code className="h-6 w-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-violet-400">Technology</h3>
                        <p className="text-violet-400/80 text-sm">Technical Documentation & APIs</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-violet-300 text-sm">API Documentation</h4>
                          <p className="text-muted-foreground text-xs">"What are the parameters for this endpoint?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-violet-300 text-sm">Code Reviews</h4>
                          <p className="text-muted-foreground text-xs">Extract insights from technical specifications and logs</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-violet-300 text-sm">Bug Reports</h4>
                          <p className="text-muted-foreground text-xs">Process error logs and technical documentation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Hospitality */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mr-4">
                        <Building2 className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-400">Hospitality</h3>
                        <p className="text-orange-400/80 text-sm">Guest Services & Operations</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Guest Feedback</h4>
                          <p className="text-muted-foreground text-xs">"What are the main complaints from last month's reviews?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Booking Analysis</h4>
                          <p className="text-muted-foreground text-xs">Extract data from reservation systems and reports</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-orange-300 text-sm">Vendor Contracts</h4>
                          <p className="text-muted-foreground text-xs">Process supplier agreements and service contracts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-orange-300 text-xs font-mono">"We used to manually read through hundreds of guest reviews. Now Docimate tells us exactly what to improve in seconds"</p>
                      <p className="text-orange-400/60 text-xs mt-1">- Hotel Staff</p>
                    </div>
                  </div>
                </motion.div>

                {/* Agriculture */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-lime-500/20 to-green-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-lime-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center mr-4">
                        <TrendingUp className="h-6 w-6 text-lime-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-lime-400">Agriculture</h3>
                        <p className="text-lime-400/80 text-sm">Farm Data & Compliance</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-lime-300 text-sm">Crop Reports</h4>
                          <p className="text-muted-foreground text-xs">"What's the yield per acre for this season?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-lime-300 text-sm">Compliance Records</h4>
                          <p className="text-muted-foreground text-xs">Extract data from regulatory filings and inspections</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-lime-300 text-sm">Weather Data</h4>
                          <p className="text-muted-foreground text-xs">Process meteorological reports and crop data</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Transportation */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-sky-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mr-4">
                        <Building2 className="h-6 w-6 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-sky-400">Transportation</h3>
                        <p className="text-sky-400/80 text-sm">Logistics & Fleet Management</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-sky-300 text-sm">Route Optimization</h4>
                          <p className="text-muted-foreground text-xs">"What's the most efficient route for today's deliveries?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-sky-300 text-sm">Maintenance Records</h4>
                          <p className="text-muted-foreground text-xs">Extract data from vehicle inspection reports</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-sky-300 text-sm">Driver Performance</h4>
                          <p className="text-muted-foreground text-xs">Process safety reports and performance metrics</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3">
                      <p className="text-sky-300 text-xs font-mono">"Our fleet maintenance used to take 2 days to process. Now Docimate analyzes all our reports and flags issues instantly"</p>
                      <p className="text-sky-400/60 text-xs mt-1">- Fleet Manager</p>
                    </div>
                  </div>
                </motion.div>

                {/* Energy */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mr-4">
                        <BatteryCharging className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-yellow-400">Energy</h3>
                        <p className="text-yellow-400/80 text-sm">Power Generation & Distribution</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-yellow-300 text-sm">Grid Analysis</h4>
                          <p className="text-muted-foreground text-xs">"What's the power output for this substation?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-yellow-300 text-sm">Safety Reports</h4>
                          <p className="text-muted-foreground text-xs">Extract data from inspection and incident reports</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-yellow-300 text-sm">Regulatory Compliance</h4>
                          <p className="text-muted-foreground text-xs">Process environmental and safety documentation</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-300 text-xs font-mono">"Our compliance reports used to take weeks. Now Docimate processes everything and we're always audit-ready"</p>
                      <p className="text-yellow-400/60 text-xs mt-1">- Power Plant Employee</p>
                    </div>
                  </div>
                </motion.div>

                {/* Retail */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="relative group break-inside-avoid mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative bg-black/30 backdrop-blur-md border border-fuchsia-500/20 rounded-2xl p-6 h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mr-4">
                        <ReceiptText className="h-6 w-6 text-fuchsia-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-fuchsia-400">Retail</h3>
                        <p className="text-fuchsia-400/80 text-sm">Inventory & Sales Analysis</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-fuchsia-300 text-sm">Sales Reports</h4>
                          <p className="text-muted-foreground text-xs">"What are our top-selling products this quarter?"</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-fuchsia-300 text-sm">Supplier Contracts</h4>
                          <p className="text-muted-foreground text-xs">Extract terms from vendor agreements and invoices</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-fuchsia-300 text-sm">Customer Feedback</h4>
                          <p className="text-muted-foreground text-xs">Process reviews and feedback forms</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg p-3">
                      <p className="text-fuchsia-300 text-xs font-mono">"We used to manually analyze 500+ daily sales reports. Docimate now gives us insights in real-time"</p>
                      <p className="text-fuchsia-400/60 text-xs mt-1">- Retail Staff</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Fade to abyss effect */}
              <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"></div>
            </div>
          </section>

          <Footer />
          </section>
        </div>
      </ScrollArea>
    </div>
  );
} 