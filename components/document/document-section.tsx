"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Zap, RefreshCcw, Plus, FileJson, Save } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { DocumentState } from "@/types/document";
import { toast } from "@/components/ui/use-toast";
import { validateFileType } from "./document-utils";
import { documentTemplates } from "./document-templates";
import { useTemplates } from "@/hooks/use-templates";
import { useAuthContext } from "@/components/auth-provider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentSectionProps {
  currentState: DocumentState;
  onFileChange: (file: File | null) => void;
  onProcess: (customPrompt: string, outputFormat: any) => void;
  isProcessing: boolean;
  progress: number;
}

export function DocumentSection({
  currentState,
  onFileChange,
  onProcess,
  isProcessing,
  progress
}: DocumentSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { user } = useAuthContext();
  
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

    let template;
    if (user) {
      // Find custom template
      template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const parsedTables = typeof template.tables === 'string' 
          ? JSON.parse(template.tables) 
          : template.tables;
        
        const outputFormat = {
          documentType: template.name,
          tables: parsedTables
        };
        
        const prompt = `Analyze this document using the following template structure:\n\n${
          parsedTables.map((table: any) => 
            `${table.type === 'table' ? 'Table' : 'Data Section'}: ${table.name}\n${
              table.fields.map((field: any) => 
                `- ${field.name}: ${field.description || ''} (${field.type}${field.isRequired ? ', required' : ''})`
              ).join('\n')
            }`
          ).join('\n\n')
        }`;
        
        onProcess(prompt, outputFormat);
      }
    } else {
      // Use hardcoded template
      template = documentTemplates[selectedTemplate];
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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] p-6">
      <div className="w-full max-w-5xl space-y-6">
        {/* Template Selection */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Select Template</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Choose a template to process your document
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {user ? (
                  // Show user's custom templates
                  templatesLoading ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading templates...
                    </div>
                  ) : templates.length > 0 ? (
                    templates.map(template => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-10 text-sm",
                          selectedTemplate === template.id && "bg-primary/10 text-primary border-primary"
                        )}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {template.name}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No templates available. Create one in the Template Editor.
                    </div>
                  )
                ) : (
                  // Show hardcoded templates
                  Object.entries(documentTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className={cn(
                        "w-full justify-start h-10 text-sm",
                        selectedTemplate === key && "bg-primary/10 text-primary border-primary"
                      )}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {template.documentName}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Upload Document</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Upload your document to begin analysis
            </p>
          </CardHeader>
          <CardContent>
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center px-6 py-12 mt-4 rounded-lg border-2 border-dashed",
                "transition-all duration-200",
                isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted hover:border-primary/50 hover:bg-muted/50",
                currentState.file ? "bg-muted/50" : "",
                "group cursor-pointer"
              )}
            >
              <input {...getInputProps()} />
              {currentState.file ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{currentState.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(currentState.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileChange(null);
                    }}
                  >
                    Change File
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4 text-center"
                  animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop your file here" : "Upload Document"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag & drop or click to browse
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">PNG</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">JPG</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">PDF</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Process Button */}
            <div className="mt-6">
              <Button
                className="w-full h-11 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                variant="outline"
                disabled={!currentState.file || !selectedTemplate || isProcessing}
                onClick={handleProcessDocument}
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Process Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {isProcessing && (
          <Card className="border-2 border-primary/10">
            <CardContent className="p-6 space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-primary">
                  {progress < 35 && "Preparing document..."}
                  {progress >= 35 && progress < 73 && "Analyzing content..."}
                  {progress >= 73 && progress < 89 && "Processing results..."}
                  {progress >= 89 && progress < 99 && "Finalizing..."}
                  {progress >= 99 && progress < 100 && "Almost ready..."}
                  {progress === 100 && "Opening document..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {progress.toFixed(1)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 