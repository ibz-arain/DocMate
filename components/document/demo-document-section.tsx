"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Zap, RefreshCcw, FileJson, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { DocumentState } from "@/types/document";
import { toast } from "@/components/ui/use-toast";
import { validateFileType } from "./document-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface DocumentTemplate {
  documentName: string;
  tables: {
    name: string;
    description?: string;
    type: 'table' | 'data';
    fields: {
      name: string;
      type: string;
      description: string;
      isRequired: boolean;
      format?: string;
    }[];
  }[];
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

interface DemoDocumentSectionProps {
  currentState: DocumentState;
  onFileChange: (file: File | null) => void;
  onProcess: (customPrompt: string, outputFormat: any) => void;
  isProcessing: boolean;
  progress: number;
}

export function DemoDocumentSection({
  currentState,
  onFileChange,
  onProcess,
  isProcessing,
  progress
}: DemoDocumentSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropText, setDropText] = useState("Drag & drop your document here");
  const dropTexts = [
    "Drag & drop your document here",
    "Let's analyze your document",
    "Drop it like it's hot",
    "Your document's new home",
    "Ready when you are"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDropText(prev => {
        const currentIndex = dropTexts.indexOf(prev);
        return dropTexts[(currentIndex + 1) % dropTexts.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (validateFileType(file, (updates) => {
          if (updates.error) {
            toast({
              title: "Error",
              description: updates.error,
              variant: "destructive"
            });
          }
        })) {
          onFileChange(file);
        }
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleProcessDocument = () => {
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template before processing the document",
        variant: "destructive"
      });
      return;
    }

    const template = documentTemplates[selectedTemplate];
    if (template) {
      const outputFormat = {
        documentType: template.documentName,
        tables: template.tables
      };
      
      const prompt = `Analyze this document using the following template structure:\n\n${
        template.tables.map(table => 
          `${table.type === 'table' ? 'Table' : 'Data Section'}: ${table.name}\n${
            table.fields.map(field => 
              `- ${field.name}: ${field.description || ''} (${field.type}${field.isRequired ? ', required' : ''})`
            ).join('\n')
          }`
        ).join('\n\n')
      }`;
      
      onProcess(prompt, outputFormat);
    }
  };

  const hardcodedTemplates = Object.entries(documentTemplates).filter(([_, t]) => 
    t.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="backdrop-blur-sm">
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-[1200px] grid grid-cols-[400px,1fr] gap-8">
          {/* Template Selection */}
          <Card className="border-2 border-primary/10 backdrop-blur-xl bg-background/20 h-[600px] overflow-hidden shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Templates
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-9 h-10 w-full border-primary/20 focus:border-primary transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[480px] w-full">
                <div className="space-y-2">
                  {hardcodedTemplates.map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className={cn(
                        "w-full px-4 py-3 h-auto relative group transition-all",
                        "border border-border/50 hover:border-primary/50",
                        selectedTemplate === key && 
                        "bg-primary/5 hover:bg-primary/10 text-primary border-primary shadow-sm"
                      )}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          "bg-primary/10 text-primary",
                          selectedTemplate === key && "bg-primary/20"
                        )}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium mb-0.5 truncate text-left">
                            {template.documentName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <FileJson className="h-3.5 w-3.5" />
                              {template.tables.length} sections
                            </div>
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Side Content */}
          <div className="flex items-center h-[600px]">
            <div className="w-full space-y-6">
              {/* Dynamic Text Above Upload */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={dropText}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <p className="text-2xl font-medium text-primary">
                    {isDragActive ? "Drop it right here!" : dropText}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Document Upload */}
              <Card className="border-2 border-primary/10 backdrop-blur-xl bg-background/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-0">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex flex-col items-center justify-center py-8 px-4",
                      "transition-all duration-300",
                      isDragActive ? "bg-primary/10" : "hover:bg-muted/50",
                      currentState.file ? "bg-muted/50" : "",
                      "group cursor-pointer relative overflow-hidden h-[350px]"
                    )}
                  >
                    <input {...getInputProps()} />
                    {currentState.file ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-6 text-center relative z-10"
                      >
                        <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                          <FileText className="h-12 w-12" />
                        </div>
                        <div>
                          <p className="font-medium text-2xl truncate max-w-2xl mx-auto">{currentState.file.name}</p>
                          <p className="text-base text-muted-foreground mt-2">
                            {(currentState.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          className="text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileChange(null);
                          }}
                        >
                          Change File
                        </Button>
                      </motion.div>
                    ) :
                      <motion.div 
                        className="space-y-8 text-center relative z-10"
                        animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                      >
                        <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-12 w-12" />
                        </div>
                        <div>
                          <p className="text-2xl font-medium">
                            Select or drop your document
                          </p>
                          <p className="text-base text-muted-foreground mt-3">
                            PNG, JPG, or PDF up to 10MB
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-base">PNG</span>
                          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-base">JPG</span>
                          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-base">PDF</span>
                        </div>
                      </motion.div>
                    }

                    {/* Animated background gradient */}
                    <div 
                      className={cn(
                        "absolute inset-0 transition-opacity duration-300",
                        isDragActive ? "opacity-100" : "opacity-0",
                        "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
                      )}
                      style={{
                        backgroundSize: '400% 400%',
                        animation: 'gradient 15s ease infinite',
                      }}
                    />
                  </div>

                  {/* Process Button */}
                  <div className="p-4 border-t">
                    <Button
                      className={cn(
                        "w-full h-12 text-md transition-all duration-300",
                        !currentState.file || !selectedTemplate
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                      )}
                      variant="outline"
                      disabled={!currentState.file || !selectedTemplate || isProcessing}
                      onClick={handleProcessDocument}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCcw className="mr-3 h-6 w-6 animate-spin" />
                          Processing Document...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-3 h-6 w-6" />
                          Process Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Card */}
              {isProcessing && (
                <Card className="mt-6 border-2 border-primary/10 backdrop-blur-xl bg-background/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <Progress value={progress} className="h-2" />
                    <div className="text-center space-y-1">
                      <p className="text-base font-medium text-primary">
                        {progress < 35 && "Preparing document..."}
                        {progress >= 35 && progress < 73 && "Analyzing content..."}
                        {progress >= 73 && progress < 89 && "Processing results..."}
                        {progress >= 89 && progress < 99 && "Finalizing..."}
                        {progress >= 99 && progress < 100 && "Almost ready..."}
                        {progress === 100 && "Opening document..."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {progress.toFixed(1)}% complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animated gradient background */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
} 