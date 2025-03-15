"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  Brain, 
  Zap, 
  ChevronRight, 
  Book, 
  Code, 
  FileSearch,
  Table, 
  Cpu, 
  Network, 
  LineChart,
  FileCheck,
  Users,
  Sparkles,
  Lock,
  FileQuestion,
  FileDigit,
  Receipt,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
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

// Interactive Card component with hover effects
const InteractiveCard = ({ icon, title, description, features = [] }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  features?: string[];
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group">
        <CardContent className="p-6">
          <div className="relative">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                {icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
              
              {features.length > 0 && (
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <ChevronRight className="h-4 w-4 text-primary mr-2" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Process Step component
const ProcessStep = ({ number, title, description, icon }: { 
  number: number; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xl font-bold">
          {number}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
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
            {/* Background elements */}
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
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Book className="h-4 w-4 mr-2" />
                  <span>Document Analysis Technology</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  How <GradientText>DocMate</GradientText> Works
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  DocMate uses advanced AI to extract, analyze, and organize information from documents, automating data entry and accelerating document processing workflows.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/demo">
                    <Button size="lg" className="gap-2">
                      Try Demo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline" size="lg" className="gap-2">
                      Learn How It Works <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* What is DocMate Section */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>What is DocMate?</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-6">
                    Document Analysis <GradientText>Simplified</GradientText>
                  </h2>
                  <div className="space-y-6 text-lg">
                    <p>
                      DocMate is an AI-powered document analysis platform that automatically extracts structured data from various document types including invoices, receipts, contracts, and forms.
                    </p>
                    <p className="text-muted-foreground">
                      Our technology combines computer vision, natural language processing, and machine learning to understand document layouts, identify key information, and extract data with high accuracy.
                    </p>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <p>
                          <span className="font-medium">Eliminate manual data entry</span> by automatically extracting information from documents
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <p>
                          <span className="font-medium">Process documents in seconds</span> instead of minutes or hours
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <p>
                          <span className="font-medium">Improve accuracy</span> with AI that learns from corrections and feedback
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="relative h-[400px] w-full perspective-[1200px]">
                    {/* Document visualization */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[300px] h-[400px]">
                        {/* Invoice document */}
                        <motion.div
                          className="absolute top-0 left-0 w-[280px] h-[380px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl"
                          style={{ transform: "rotateY(-5deg) rotateX(5deg) translateZ(20px)" }}
                          animate={{
                            y: [0, -10, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          <div className="p-6 h-full flex flex-col">
                            <div className="w-full h-8 bg-primary/20 rounded mb-4"></div>
                            <div className="w-3/4 h-4 bg-primary/10 rounded mb-2"></div>
                            <div className="w-1/2 h-4 bg-primary/10 rounded mb-6"></div>
                            
                            <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                                <div className="h-4 bg-primary/5 rounded"></div>
                              </div>
                            </div>
                            
                            <div className="mt-6 space-y-2">
                              <div className="w-full h-6 bg-primary/10 rounded"></div>
                              <div className="w-1/2 h-6 bg-primary/20 rounded ml-auto"></div>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Data extraction visualization */}
                        <motion.div
                          className="absolute top-10 right-0 w-[280px] h-[380px] bg-black/40 backdrop-blur-md border border-primary/30 rounded-lg shadow-xl overflow-hidden"
                          style={{ transform: "rotateY(5deg) rotateX(-2deg) translateZ(40px)" }}
                          animate={{
                            y: [0, 10, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                        >
                          <div className="p-6 h-full flex flex-col">
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
                                <FileCheck className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-sm font-medium">Extracted Data</div>
                            </div>
                            
                            <div className="space-y-4 flex-1">
                              <div className="space-y-1">
                                <div className="text-xs text-primary">Invoice Number</div>
                                <div className="h-6 bg-primary/10 rounded w-1/2"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-primary">Date</div>
                                <div className="h-6 bg-primary/10 rounded w-1/3"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-primary">Amount</div>
                                <div className="h-6 bg-primary/10 rounded w-1/4"></div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-primary">Items</div>
                                <div className="space-y-2">
                                  <div className="h-6 bg-primary/10 rounded w-full"></div>
                                  <div className="h-6 bg-primary/10 rounded w-full"></div>
                                  <div className="h-6 bg-primary/10 rounded w-full"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="h-8 bg-primary/20 rounded w-full"></div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Glowing effect */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full" style={{
                      background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.3) 0%, rgba(var(--primary-rgb), 0.1) 50%, transparent 70%)",
                      filter: "blur(30px)",
                    }}></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 px-6 bg-black/20">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Cpu className="h-4 w-4 mr-2" />
                  <span>Technology</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  How <GradientText>DocMate</GradientText> Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our advanced AI pipeline processes documents in multiple stages to deliver accurate results.
                </p>
              </motion.div>

              <div className="space-y-12 max-w-4xl mx-auto">
                <ProcessStep 
                  number={1} 
                  title="Document Upload & Preprocessing" 
                  description="Upload documents via our interface or API. Our system preprocesses the document, enhancing image quality, correcting skew, and optimizing for analysis."
                  icon={<FileText className="h-4 w-4 text-primary" />}
                />
                
                <ProcessStep 
                  number={2} 
                  title="Layout Analysis" 
                  description="Our computer vision algorithms analyze the document structure, identifying headers, tables, paragraphs, and other elements to understand the document's organization."
                  icon={<FileSearch className="h-4 w-4 text-primary" />}
                />
                
                <ProcessStep 
                  number={3} 
                  title="Text Recognition & Extraction" 
                  description="Advanced OCR (Optical Character Recognition) extracts text from the document while maintaining its spatial relationships and context."
                  icon={<FileDigit className="h-4 w-4 text-primary" />}
                />
                
                <ProcessStep 
                  number={4} 
                  title="Semantic Understanding" 
                  description="Our NLP (Natural Language Processing) models interpret the extracted text, identifying key information like dates, amounts, names, and other relevant data points."
                  icon={<Brain className="h-4 w-4 text-primary" />}
                />
                
                <ProcessStep 
                  number={5} 
                  title="Data Structuring" 
                  description="The extracted information is organized into a structured format, mapping fields to their values and creating a machine-readable representation of the document."
                  icon={<Table className="h-4 w-4 text-primary" />}
                />
                
                <ProcessStep 
                  number={6} 
                  title="Validation & Enhancement" 
                  description="Our system validates the extracted data for accuracy and completeness, applying business rules and cross-referencing information to ensure quality."
                  icon={<FileCheck className="h-4 w-4 text-primary" />}
                />
              </div>
            </div>
          </section>

          {/* Document Types Section */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <FileQuestion className="h-4 w-4 mr-2" />
                  <span>Document Types</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Supported <GradientText>Document Types</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  DocMate can process a wide range of document types with specialized extraction capabilities for each.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Receipt className="h-6 w-6 text-primary" />,
                    title: "Invoices & Receipts",
                    description: "Extract vendor information, line items, totals, taxes, dates, and payment terms from invoices and receipts.",
                    features: ["Vendor Detection", "Line Item Extraction", "Tax Calculation", "Payment Terms"]
                  },
                  {
                    icon: <FileText className="h-6 w-6 text-primary" />,
                    title: "Contracts & Agreements",
                    description: "Identify key clauses, parties, dates, terms, and obligations from legal documents and contracts.",
                    features: ["Party Identification", "Clause Extraction", "Term Detection", "Obligation Analysis"]
                  },
                  {
                    icon: <FileSpreadsheet className="h-6 w-6 text-primary" />,
                    title: "Forms & Applications",
                    description: "Process structured forms and applications, extracting field values and form data accurately.",
                    features: ["Field Mapping", "Checkbox Detection", "Signature Verification", "Form Validation"]
                  },
                  {
                    icon: <FileDigit className="h-6 w-6 text-primary" />,
                    title: "Financial Statements",
                    description: "Extract and analyze financial data from balance sheets, income statements, and cash flow reports.",
                    features: ["Financial Metric Extraction", "Period Comparison", "Ratio Calculation", "Trend Analysis"]
                  },
                  {
                    icon: <FileCheck className="h-6 w-6 text-primary" />,
                    title: "ID Documents",
                    description: "Process identity documents like passports, driver's licenses, and ID cards with high security and accuracy.",
                    features: ["Personal Data Extraction", "Document Verification", "Security Feature Detection", "Expiry Validation"]
                  },
                  {
                    icon: <FileQuestion className="h-6 w-6 text-primary" />,
                    title: "Custom Documents",
                    description: "Train our system on your specific document types for specialized extraction needs.",
                    features: ["Custom Field Definition", "Template Creation", "Extraction Rules", "Validation Logic"]
                  }
                ].map((docType, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <InteractiveCard {...docType} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Technical Capabilities Section */}
          <section className="py-20 px-6 bg-black/20">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Technical Capabilities</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  Advanced <GradientText>AI Technology</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  DocMate leverages cutting-edge AI technologies to deliver accurate document analysis.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Brain className="h-6 w-6 text-primary" />,
                    title: "Machine Learning Models",
                    description: "Our proprietary ML models are trained on millions of documents for high-accuracy extraction.",
                    features: ["Deep Neural Networks", "Transfer Learning", "Continuous Improvement"]
                  },
                  {
                    icon: <FileSearch className="h-6 w-6 text-primary" />,
                    title: "Computer Vision",
                    description: "Advanced computer vision algorithms understand document layout and structure.",
                    features: ["Layout Analysis", "Object Detection", "Image Enhancement"]
                  },
                  {
                    icon: <Sparkles className="h-6 w-6 text-primary" />,
                    title: "Natural Language Processing",
                    description: "NLP capabilities extract meaning and context from document text.",
                    features: ["Named Entity Recognition", "Semantic Analysis", "Contextual Understanding"]
                  },
                  {
                    icon: <Lock className="h-6 w-6 text-primary" />,
                    title: "Security & Privacy",
                    description: "Enterprise-grade security protects your sensitive document data.",
                    features: ["End-to-end Encryption", "Data Isolation", "Compliance Controls"]
                  },
                  {
                    icon: <Network className="h-6 w-6 text-primary" />,
                    title: "API & Integration",
                    description: "Flexible API allows seamless integration with your existing systems.",
                    features: ["RESTful API", "Webhooks", "SDK Support"]
                  },
                  {
                    icon: <LineChart className="h-6 w-6 text-primary" />,
                    title: "Analytics & Reporting",
                    description: "Gain insights from your documents with advanced analytics.",
                    features: ["Processing Metrics", "Accuracy Tracking", "Volume Analysis"]
                  }
                ].map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <InteractiveCard {...tech} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold mb-6">
                  Ready to <GradientText>Transform</GradientText> Your Document Workflow?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Try DocMate today and see how our AI-powered document analysis can save you time and improve accuracy.
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

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 