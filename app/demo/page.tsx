"use client";

import { useState, useEffect } from "react";
import { DocumentState } from "@/types/document";
import { DemoDocumentSection } from "@/components/document/demo-document-section";
import { DocumentViewer } from "@/components/document/document-viewer";
import { createInitialState } from "@/components/document/document-utils";
import { processDocument } from "@/components/document/document-processor";
import { downloadJson, downloadMarkdown, downloadCsv } from "@/components/document/document-utils";
import { generateMarkdown, generateFormattedView } from "@/lib/document-utils";
import { toast } from "@/components/ui/use-toast";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, Code, FileText, TableIcon, Brain, Copy, Sparkles, ArrowRight, 
  ChevronRight, Zap, FileJson, Table, Eye, Download, BarChart, 
  Building2, Receipt, FileStack, Coins, Clock, CheckCircle2, 
  Shield, Settings2, Lightbulb, Workflow, Upload, Users, File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

// Document templates for each document type
interface TableTemplate {
  name: string;
  description?: string;
  type: 'table' | 'data';
  fields: FieldConfig[];
}

interface DocumentTemplate {
  documentName: string;
  tables: TableTemplate[];
}

interface FieldConfig {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  format?: string;
}

const documentTemplates: Record<string, DocumentTemplate> = {
  't4': {
    documentName: 'T4 Tax Form',
    tables: [
      {
        name: 'Employee Information',
        type: 'data',
        fields: [
          { name: 'employeeName', type: 'string', description: 'Full name of employee', isRequired: true },
          { name: 'socialInsuranceNumber', type: 'string', description: 'Social Insurance Number (SIN)', isRequired: true, format: '999-999-999' },
          { name: 'employerName', type: 'string', description: 'Name of employer', isRequired: true },
          { name: 'taxYear', type: 'string', description: 'Tax year', isRequired: true }
        ]
      },
      {
        name: 'Income Details',
        type: 'data',
        fields: [
          { name: 'employmentIncome', type: 'currency', description: 'Employment income (Box 14)', isRequired: true },
          { name: 'incomeTaxDeducted', type: 'currency', description: 'Income tax deducted (Box 22)', isRequired: true },
          { name: 'cppContributions', type: 'currency', description: 'CPP contributions (Box 16)', isRequired: true },
          { name: 'eiPremiums', type: 'currency', description: 'EI premiums (Box 18)', isRequired: true },
          { name: 'pensionAdjustment', type: 'currency', description: 'Pension adjustment (Box 52)', isRequired: false }
        ]
      }
    ]
  },
  'bank': {
    documentName: 'Bank Statement',
    tables: [
      {
        name: 'Account Information',
        type: 'data',
        fields: [
          { name: 'accountHolder', type: 'string', description: 'Name of account holder', isRequired: true },
          { name: 'accountNumber', type: 'string', description: 'Account number', isRequired: true, format: 'XXXX-XXXX-XXXX-XXXX' },
          { name: 'statementPeriod', type: 'string', description: 'Statement period', isRequired: true },
          { name: 'bankName', type: 'string', description: 'Bank name', isRequired: true }
        ]
      },
      {
        name: 'Transactions',
        type: 'table',
        fields: [
          { name: 'date', type: 'date', description: 'Transaction date', isRequired: true },
          { name: 'description', type: 'string', description: 'Transaction description', isRequired: true },
          { name: 'amount', type: 'currency', description: 'Transaction amount', isRequired: true },
          { name: 'type', type: 'string', description: 'Transaction type (debit/credit)', isRequired: true }
        ]
      }
    ]
  },
  'receipt': {
    documentName: 'Store Receipt',
    tables: [
      {
        name: 'Merchant Information',
        type: 'data',
        fields: [
          { name: 'merchantName', type: 'string', description: 'Name of merchant/store', isRequired: true },
          { name: 'receiptNumber', type: 'string', description: 'Receipt/transaction number', isRequired: true }
        ]
      },
      {
        name: 'Items',
        type: 'table',
        fields: [
          { name: 'itemName', type: 'string', description: 'Item name/description', isRequired: true },
          { name: 'quantity', type: 'number', description: 'Quantity', isRequired: true },
          { name: 'unitPrice', type: 'currency', description: 'Unit price', isRequired: true },
          { name: 'amount', type: 'currency', description: 'Total amount for item', isRequired: true }
        ]
      }
    ]
  },
  'dental': {
    documentName: 'Dental Claim Form',
    tables: [
      {
        name: 'Patient Information',
        type: 'data',
        fields: [
          { name: 'patientName', type: 'string', description: 'Full name of patient', isRequired: true },
          { name: 'dateOfBirth', type: 'date', description: 'Patient date of birth', isRequired: true },
          { name: 'insuranceProvider', type: 'string', description: 'Insurance provider name', isRequired: true },
          { name: 'policyNumber', type: 'string', description: 'Insurance policy number', isRequired: true }
        ]
      },
      {
        name: 'Procedures',
        type: 'table',
        fields: [
          { name: 'serviceDate', type: 'date', description: 'Date of service', isRequired: true },
          { name: 'procedureCode', type: 'string', description: 'Procedure code', isRequired: true },
          { name: 'procedureDescription', type: 'string', description: 'Description of service', isRequired: true },
          { name: 'fee', type: 'currency', description: 'Professional fee', isRequired: true }
        ]
      }
    ]
  },
  'electricity': {
    documentName: 'Electricity Bill',
    tables: [
      {
        name: 'Customer Information',
        type: 'data',
        fields: [
          { name: 'customerName', type: 'string', description: 'Name of customer', isRequired: true },
          { name: 'accountNumber', type: 'string', description: 'Account number', isRequired: true },
          { name: 'serviceAddress', type: 'string', description: 'Service address', isRequired: true },
          { name: 'billingPeriod', type: 'string', description: 'Billing period', isRequired: true }
        ]
      },
      {
        name: 'Usage Details',
        type: 'data',
        fields: [
          { name: 'currentReading', type: 'number', description: 'Current meter reading', isRequired: true },
          { name: 'previousReading', type: 'number', description: 'Previous meter reading', isRequired: true },
          { name: 'totalUsage', type: 'number', description: 'Total usage (kWh)', isRequired: true },
          { name: 'ratePerKwh', type: 'currency', description: 'Rate per kWh', isRequired: true }
        ]
      }
    ]
  }
};

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// Terminal window component for code examples
const TerminalWindow = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)]">
      <div className="flex items-center px-4 py-2 border-b border-white/20 bg-black">
        <div className="flex space-x-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-xs font-medium text-white/90">{title}</div>
      </div>
      <div className="p-4 font-mono text-sm">
        {children}
      </div>
    </div>
  );
};

export default function DemoPage() {
  const [documentState, setDocumentState] = useState<DocumentState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('formatted');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Effects to manage dialog state
  useEffect(() => {
    if (documentState.isProcessed && !documentState.error) {
      setIsPreviewOpen(true);
    }
  }, [documentState.isProcessed, documentState.error]);

  const updateDocumentState = (updates: Partial<DocumentState>) => {
    setDocumentState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleProcessDocument = (customPrompt: string, outputFormat: any) => {
    processDocument(
      documentState,
      updateDocumentState,
      setIsProcessing,
      setProgress,
      { 
        customPrompt,
        outputFormat
      }
    ).catch(error => {
      console.error("Processing error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during processing",
        variant: "destructive"
      });
    });
  };

  const handleNewDocument = () => {
    setDocumentState(createInitialState());
    setIsPreviewOpen(false);
  };

  return (
    <div className="relative">
      <Header />
      <ScrollArea className="h-screen">
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Cool animated background elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Circuit board pattern */}
            <div className="absolute inset-0 bg-circuit-pattern opacity-[0.07]"></div>
            
            {/* Floating grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(var(--primary-rgb),0.15)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(1000px)_rotateX(60deg)] opacity-30"></div>
            
            {/* Glowing orbs */}
            <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] animate-pulse-slower"></div>
            <div className="absolute top-[40%] right-[30%] w-72 h-72 rounded-full bg-purple-500/20 blur-[100px] animate-pulse-slow animation-delay-2000"></div>
            
            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-primary/50 rounded-full animate-float"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
            
            {/* Geometric shapes */}
            <div className="absolute top-[15%] left-[80%] w-40 h-40 border-2 border-primary/20 rounded-lg [transform:rotate(15deg)] animate-spin-very-slow"></div>
            <div className="absolute top-[75%] left-[20%] w-40 h-40 border-2 border-blue-500/20 rounded-xl [transform:rotate(45deg)] animate-spin-slow"></div>
            <div className="absolute top-[50%] left-[40%] w-24 h-24 border-2 border-purple-500/20 rounded-md [transform:rotate(30deg)] animate-spin-slow animation-delay-3000"></div>
            
            {/* Code-like lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`line-${i}`}
                className="absolute h-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 animate-scan-x"
                style={{
                  width: '100%',
                  top: `${15 + i * 20}%`,
                  animationDelay: `${i * 2}s`
                }}
              />
            ))}
            
            {/* Vertical scan lines */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={`vline-${i}`}
                className="absolute w-0.5 h-full bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-scan-y"
                style={{
                  left: `${25 + i * 25}%`,
                  animationDelay: `${i * 3}s`
                }}
              />
            ))}
          </div>

          {/* Hero Section */}
          <section className="pt-32 pb-20 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Why DocMate?</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  Learn More About <GradientText>DocMate</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  From filling out forms to sitting back, Docmate will do it all for you.
                </p>
              </motion.div>

              {/* Core Capabilities */}
              <div className="mb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12">
                  {[
                    {
                      title: "Your Documents, Your Way",
                      description: "Use our template editor to create custom templates for your documents.",
                      icon: <FileStack className="h-6 w-6" />,
                      details: [
                        "No coding or technical skills required",
                        "You design the template, we do the rest",
                        "Suited for all document types"
                      ],
                      demo: (
                        <TerminalWindow title="JSON Template for Receipt">
                          <pre className="text-primary/90">
{`[   // Backend looks like this...
  {
    "name": "Receipt Details",
    "type": "table",
    "fields": [
      {"name": "Item", "type": "string"},
      {"name": "Quantity", "type": "number"},
      {"name": "Price", "type": "number"}
    ]
  }
]`}
                          </pre>
                        </TerminalWindow>
                      )
                    },
                    {
                      title: "Smarter than You and Me",
                      description: "Returns structured data using templates you provide, just how you like it.",
                      icon: <Brain className="h-6 w-6" />,
                      details: [
                        "Pick and choose the fields you want",
                        "Never worry about missing information",
                        "When a field is detected, it's automatically extracted"
                      ],
                      demo: (
                        <div className="bg-primary/5 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-sm text-green-500">Detected Fields</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div className="font-medium">Item</div>
                              <div className="font-medium">Qty</div>
                              <div className="font-medium">Price</div>
                              <div className="font-medium">Total</div>
                              <div>Office Chair</div>
                              <div>2</div>
                              <div>$199.99</div>
                              <div>$213.98</div>
                              <div>Desk</div>
                              <div>1</div>
                              <div>$299.99</div>
                              <div>$327.96</div>
                              <div>TV Mount</div>
                              <div>1</div>
                              <div>$59.99</div>
                              <div>$65.98</div>
                              <div>Cup Holder</div>
                              <div>1</div>
                              <div>$19.99</div>
                              <div>$21.98</div>
                              <div>Coat Rack</div>
                              <div>1</div>
                              <div>$29.99</div>
                              <div>$34.98</div>
                            </div>
                          </div>
                        </div>
                      )
                    },
                    {
                      title: "Export Your Data How You Like It",
                      description: "Or integrate our API services with your existing systems.",
                      icon: <FileJson className="h-6 w-6" />,
                      details: [
                        "JSON, CSV, and Excel for non-tech users",
                        "API integration for tech users",
                        "More available at your request"
                      ],
                      demo: (
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              <FileJson className="h-4 w-4 mr-1" /> JSON
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Table className="h-4 w-4 mr-1" /> Excel
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              <FileText className="h-4 w-4 mr-1" /> MD
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            More coming soon!
                          </div>
                        </div>
                      )
                    },
                    {
                      title: "We Respect Your Privacy",
                      description: "Constant updates to our security protocols to ensure your data is safe.",
                      icon: <Shield className="h-6 w-6" />,
                      details: [
                        "We only store data at your request",
                        "Data extracted through our API is not stored",
                        "Your accounts, documents, templates, and APIs are all secure"
                      ],
                      demo: (
                        <div className="space-y-2">
                          <div className="flex items-center text-yellow-500">
                            <Shield className="h-4 w-4 mr-2" />
                            <span className="text-sm">Passwords are encrypted</span>
                          </div>
                          <div className="flex items-center text-blue-500">
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="text-sm">Only you can access your data</span>
                          </div>
                        </div>
                      )
                    },
//                     {
//                       title: "",
//                       description: "Create custom rules for document processing and data extraction.",
//                       icon: <Settings2 className="h-6 w-6" />,
//                       details: [
//                         "Custom extraction patterns",
//                         "Field transformations",
//                         "Conditional processing"
//                       ],
//                       demo: (
//                         <TerminalWindow title="Processing Rule">
//                           <pre className="text-primary/90">
// {`{
//   "field": "total",
//   "rules": [
//     {
//       "type": "currency",
//       "format": "USD",
//       "validate": ">=0"
//     },
//     {
//       "type": "match",
//       "pattern": "Total: *(.*)"
//     }
//   ]
// }`}
//                           </pre>
//                         </TerminalWindow>
//                       )
//                     },
//                     {
//                       title: "Processing Analytics",
//                       description: "Track and analyze your document processing performance and accuracy.",
//                       icon: <BarChart className="h-6 w-6" />,
//                       details: [
//                         "Accuracy metrics",
//                         "Processing speed",
//                         "Error tracking"
//                       ],
//                       demo: (
//                         <div className="space-y-3">
//                           <div className="space-y-2">
//                             <div className="flex justify-between text-xs">
//                               <span>Extraction Accuracy</span>
//                               <span>98%</span>
//                             </div>
//                             <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
//                               <div className="h-full w-[98%] bg-primary rounded-full" />
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <div className="flex justify-between text-xs">
//                               <span>Processing Speed</span>
//                               <span>2.3s</span>
//                             </div>
//                             <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
//                               <div className="h-full w-[85%] bg-primary rounded-full" />
//                             </div>
//                           </div>
//                         </div>
//                       )
//                     }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative"
                      onMouseEnter={() => setSelectedFeature(feature.title)}
                      onMouseLeave={() => setSelectedFeature(null)}
                    >
                      <div className="flex flex-col h-full p-6 bg-background/20 backdrop-blur-xl rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:translate-y-[-2px]">
                        <div className="mb-4 p-3 rounded-lg bg-primary/15 w-fit">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground mb-6">{feature.description}</p>
                        <div className="mt-auto">
                          <ul className="space-y-2">
                            {feature.details.map((detail, i) => (
                              <li key={i} className="flex items-center text-sm text-muted-foreground">
                                <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                          <AnimatePresence>
                            {selectedFeature === feature.title && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-6 overflow-hidden"
                              >
                                {feature.demo}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="mb-24 relative z-10">


                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary/10" />
                  
                  {[
                    {
                      title: "Select a Template",
                      description: "Choose a template from the list you want to try, or create an account and design your own in our playground.",
                      icon: <File className="h-6 w-6" />
                    },
                    {
                      title: "Upload Your Document",
                      description: "Simply drag and drop your document or select it from your computer.",
                      icon: <Upload className="h-6 w-6" />
                    },
                    {
                      title: "Sit Back & Relax",
                      description: "Just wait for the magic to happen. It'll only take a few seconds.",
                      icon: <Clock className="h-6 w-6" />
                    },
                    {
                      title: "View Your Results",
                      description: "View your results in various formats. Create an account to do more with your results.",
                      icon: <Eye className="h-6 w-6" />
                    }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className={`relative flex items-center gap-8 mb-16 ${
                        index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="relative z-10 w-12 h-12 rounded-full bg-background border-4 border-primary flex items-center justify-center">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Try It Out Section */}
              <div className="mb-24 relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    Try <GradientText>DocMate</GradientText> Now
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Experience the power of intelligent document processing
                  </p>
                </div>

                <div className="relative">
                  <DemoDocumentSection
                    currentState={documentState}
                    onFileChange={(file) => {
                      updateDocumentState({
                        file,
                        isProcessed: false,
                        error: null
                      });
                    }}
                    onProcess={handleProcessDocument}
                    isProcessing={isProcessing}
                    progress={progress}
                  />
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>

      {/* Results Dialog */}
      <Dialog open={isPreviewOpen && documentState.isProcessed} onOpenChange={(open) => {
        setIsPreviewOpen(open);
        if (!open) {
          handleNewDocument();
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 overflow-hidden [&>button]:hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none p-6 border-b bg-background">
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="text-2xl font-bold truncate">
                  {documentState.file?.name || "Document Results"}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {(activeTab === 'json' || activeTab === 'markdown') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "bg-primary/10 text-primary",
                          "hover:bg-primary/20"
                        )}
                        onClick={() => navigator.clipboard.writeText(
                          activeTab === 'json' 
                            ? JSON.stringify(documentState.selectedDoc?.contentJson, null, 2)
                            : generateMarkdown(documentState.selectedDoc?.contentJson)
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant={activeTab === 'json' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('json')}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'json' ? (
                          "bg-primary/10 text-primary hover:bg-primary/20"
                        ) : (
                          "hover:bg-primary/10 hover:text-primary"
                        )
                      )}
                    >
                      <Code className="h-4 w-4" />
                      <span className="hidden sm:inline">JSON</span>
                    </Button>
                    <Button
                      variant={activeTab === 'markdown' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('markdown')}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'markdown' ? (
                          "bg-primary/10 text-primary hover:bg-primary/20"
                        ) : (
                          "hover:bg-primary/10 hover:text-primary"
                        )
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Markdown</span>
                    </Button>
                    <Button
                      variant={activeTab === 'formatted' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('formatted')}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'formatted' ? (
                          "bg-primary/10 text-primary hover:bg-primary/20"
                        ) : (
                          "hover:bg-primary/10 hover:text-primary"
                        )
                      )}
                    >
                      <TableIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Formatted</span>
                    </Button>
                    <Button
                      variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('analysis')}
                      className={cn(
                        "flex items-center gap-1 whitespace-nowrap",
                        activeTab === 'analysis' ? (
                          "bg-primary/10 text-primary hover:bg-primary/20"
                        ) : (
                          "hover:bg-primary/10 hover:text-primary"
                        )
                      )}
                    >
                      <Brain className="h-4 w-4" />
                      <span className="hidden sm:inline">Analysis</span>
                    </Button>
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <Card className="h-full rounded-none border-0">
                <CardContent className="p-0 h-full">
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-auto">
                      <AnimatePresence mode="wait">
                        {activeTab === 'json' && (
                          <motion.div
                            key="json"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full"
                          >
                            <div className="relative bg-muted w-full overflow-auto">
                              <div className="min-w-[600px] w-full">
                                <pre className="p-6 text-sm whitespace-pre-wrap break-words select-text w-full">
                                  {JSON.stringify(documentState.selectedDoc?.contentJson, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'markdown' && (
                          <motion.div
                            key="markdown"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full"
                          >
                            <div className="relative bg-muted w-full overflow-auto">
                              <div className="min-w-[600px] w-full">
                                <pre className="p-6 text-sm whitespace-pre select-text w-full">
                                  {generateMarkdown(documentState.selectedDoc?.contentJson)}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'formatted' && (
                          <motion.div
                            key="formatted"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full p-6"
                          >
                            <div className="bg-background rounded-lg">
                              {generateFormattedView(documentState.selectedDoc?.contentJson)}
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'analysis' && (
                          <motion.div
                            key="analysis"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
                          >
                            {/* Summary Card */}
                            <Card className="col-span-full bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {documentState.selectedDoc?.summary}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Keywords Card */}
                            <Card className="bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Code className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-3">Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                      {documentState.selectedDoc?.keywords?.map((keyword: string, index: number) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors cursor-default"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            

                            {/* Insights Card */}
                            <Card className="col-span-full bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <TableIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-3">Key Insights</h3>
                                    <div className="grid gap-3">
                                      {documentState.selectedDoc?.rawJson?.analysis?.insights?.map((insight: string, index: number) => (
                                        <div 
                                          key={index}
                                          className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                          <div className="flex-shrink-0 h-1.5 w-1.5 mt-2 rounded-full bg-primary" />
                                          <p className="text-sm text-muted-foreground flex-1">
                                            {insight}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS for animated gradient background */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Circuit board pattern */
        .bg-circuit-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
            radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 1px, transparent 1px),
            linear-gradient(to right, rgba(var(--primary-rgb), 0.2) 2px, transparent 2px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.2) 2px, transparent 2px);
          background-size: 
            40px 40px,
            40px 40px,
            40px 40px,
            200px 200px,
            200px 200px;
          background-position: 
            -1px -1px,
            -1px -1px,
            -1px -1px,
            -1px -1px,
            -1px -1px;
        }

        .bg-dots-primary\/15 {
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--primary) / 0.15) 2px, transparent 0);
          background-size: 40px 40px;
          background-position: center;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 25s infinite alternate;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        /* New cool background animations */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-very-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes scan-x {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes scan-y {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
        
        .animate-scan-x {
          animation: scan-x 15s linear infinite;
        }
        
        .animate-scan-y {
          animation: scan-y 20s linear infinite;
        }
      `}</style>
    </div>
  );
} 