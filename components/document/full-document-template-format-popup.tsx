"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  FileText,
  Loader2,
  X,
  Search,
  CheckCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useTemplates } from "@/hooks/use-templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { convertFileToBase64 } from "./document-utils";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHistory } from '@/components/history-provider';

interface Template {
  id: string;
  name: string;
  tables: any[];
  created_at: string;
  updated_at: string;
}

interface FullDocumentTemplateFormatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pdfFile: File | null;
  documentName?: string;
}

export function FullDocumentTemplateFormatPopup({ 
  isOpen, 
  onClose, 
  pdfFile, 
  documentName = "Document" 
}: FullDocumentTemplateFormatPopupProps) {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const { templates, isLoading: templatesLoading } = useTemplates();
  const { addHistoryEntry } = useHistory();

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setAnalysisResult(null);
      setIsAnalyzing(false);
      setSelectedTemplate(null);
      setTemplateSearchQuery("");
    }
  }, [isOpen]);

  const performTemplateFormat = async (template: Template) => {
    if (!pdfFile || !template) return;
    
    try {
      setIsAnalyzing(true);
      setSelectedTemplate(template);
      
      // Convert file to base64
      let base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      // Parse template tables
      const templateTables = typeof template.tables === 'string' 
        ? JSON.parse(template.tables) 
        : template.tables;

      // Create output format using the selected template
      const outputFormat = {
        documentType: template.name,
        tables: templateTables
      };

      const customPrompt = `Analyze this entire document and extract data according to the "${template.name}" template structure.

Instructions:
1. Extract information from the entire document that matches the defined template fields
2. Follow the exact field names and types specified in the template
3. For table-type sections, extract all matching instances found throughout the document
4. For data-type sections, extract single values
5. If a field is not found in the document, use an empty string
6. Maintain data accuracy and follow any specified formats
7. Process all pages and sections of the document comprehensively

Template: ${template.name}
The template defines the following structure:
${templateTables.map((table: any) => {
  return `\n${table.name} (${table.type}):
${table.fields.map((field: any) => `  - ${field.name} (${field.type}): ${field.description || 'No description'}`).join('\n')}`;
}).join('\n')}`;

      const res = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: pdfFile.type || 'application/pdf',
          customPrompt,
          outputFormat
        })
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: 'Template Format Failed', description: error.error || 'Unknown error', variant: 'destructive' });
        setIsAnalyzing(false);
        return;
      }

      const data = await res.json();
      setAnalysisResult(data);
      setIsAnalyzing(false);
      
      // Add to history
      addHistoryEntry({
        type: 'template-format',
        title: `Full Document Template: ${template.name} - ${documentName}`,
        content: data,
        selectedText: '[Full Document]',
        selectionData: null,
        documentName,
        templateName: template.name,
        pageNumber: undefined,
      });
      
      toast({
        title: "Document processed successfully",
        description: `Template "${template.name}" applied to entire document.`,
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Template Format Error', description: 'Something went wrong', variant: 'destructive' });
      setIsAnalyzing(false);
    }
  };

  const copyAsFormat = (format: string) => {
    // Check for different response structures
    const content = analysisResult?.content || analysisResult?.analysis?.content;
    
    if (!content) {
      toast({ title: 'No data to copy', description: 'Please format the document first', variant: 'destructive' });
      return;
    }
    
    switch (format) {
      case 'json':
        navigator.clipboard.writeText(JSON.stringify(content, null, 2));
        toast({ title: "Copied to clipboard", description: "Data copied as JSON format." });
        break;
      case 'csv':
        // Generate CSV for all tables
        let csvContent = '';
        Object.entries(content).forEach(([tableName, tableData]: [string, any]) => {
          if (Array.isArray(tableData) && tableData.length > 0) {
            csvContent += `${tableName}\n`;
            const headers = Object.keys(tableData[0]);
            csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
            tableData.forEach((row: any) => {
              csvContent += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
            });
            csvContent += '\n';
          } else if (typeof tableData === 'object' && tableData !== null) {
            csvContent += `${tableName}\n`;
            csvContent += 'Field,Value\n';
            Object.entries(tableData).forEach(([key, value]) => {
              csvContent += `"${key}","${value}"\n`;
            });
            csvContent += '\n';
          }
        });
        navigator.clipboard.writeText(csvContent);
        toast({ title: "Copied to clipboard", description: "Data copied as CSV format." });
        break;
      case 'markdown':
        // Generate Markdown for all tables
        let markdownContent = `# ${selectedTemplate?.name} - ${documentName}\n\n`;
        Object.entries(content).forEach(([tableName, tableData]: [string, any]) => {
          markdownContent += `## ${tableName}\n\n`;
          if (Array.isArray(tableData) && tableData.length > 0) {
            const headers = Object.keys(tableData[0]);
            markdownContent += `| ${headers.join(' | ')} |\n`;
            markdownContent += `|${headers.map(() => '---').join('|')}|\n`;
            tableData.forEach((row: any) => {
              markdownContent += `| ${headers.map(h => (row[h] || '').toString().replace(/\|/g, '\\|')).join(' | ')} |\n`;
            });
          } else if (typeof tableData === 'object' && tableData !== null) {
            markdownContent += '| Field | Value |\n|---|---|\n';
            Object.entries(tableData).forEach(([key, value]) => {
              markdownContent += `| ${key} | ${(value || '').toString().replace(/\|/g, '\\|')} |\n`;
            });
          }
          markdownContent += '\n';
        });
        navigator.clipboard.writeText(markdownContent);
        toast({ title: "Copied to clipboard", description: "Data copied as Markdown format." });
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-6xl max-h-[85vh] overflow-hidden"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="relative bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Template Format - Full Document</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {documentName} • Apply custom template to entire document
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <FileText className="h-3 w-3 mr-1" />
                    Full Document
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="flex h-[70vh]">
                {/* Template Selection */}
                <div className="w-80 border-r border-border flex flex-col">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-medium mb-3">Select Template</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        className="pl-9"
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    {templatesLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p>Loading templates...</p>
                      </div>
                    ) : filteredTemplates.length > 0 ? (
                      <div className="space-y-2">
                        {filteredTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className={`w-full p-4 h-auto justify-start text-left ${
                              selectedTemplate?.id === template.id ? 'bg-primary/5 border-primary' : ''
                            }`}
                            onClick={() => performTemplateFormat(template)}
                            disabled={isAnalyzing || !pdfFile}
                          >
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {typeof template.tables === 'string' 
                                  ? JSON.parse(template.tables).length 
                                  : template.tables.length} sections
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No templates found</p>
                        <p className="text-xs mt-2">Try adjusting your search</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                {/* Results */}
                <div className="flex-1 flex flex-col">
                  {isAnalyzing ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                          <FileText className="h-12 w-12 text-primary animate-pulse relative z-10" />
                        </div>
                        <p className="text-lg font-medium mt-4">Processing Document</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Applying template "{selectedTemplate?.name}" to entire document...
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-4">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div className="flex-1 flex flex-col">
                      <div className="p-4 border-b border-border bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Results: {selectedTemplate?.name}</h4>
                            <p className="text-sm text-muted-foreground">Template applied to entire document</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyAsFormat('json')}>
                              JSON
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => copyAsFormat('csv')}>
                              CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => copyAsFormat('markdown')}>
                              Markdown
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">
                          {Object.entries(analysisResult?.content || analysisResult?.analysis?.content || {}).map(([tableName, tableData]: [string, any]) => (
                            <div key={tableName} className="bg-muted/30 rounded-lg overflow-hidden">
                              <div className="p-3 bg-background/50 border-b border-border">
                                <h5 className="font-medium capitalize">{tableName.replace(/_/g, ' ')}</h5>
                              </div>
                              <div className="p-4">
                                {Array.isArray(tableData) && tableData.length > 0 ? (
                                  <UITable>
                                    <TableHeader>
                                      <TableRow>
                                        {Object.keys(tableData[0]).map((header) => (
                                          <TableHead key={header} className="capitalize">
                                            {header.replace(/_/g, ' ')}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {tableData.map((row: any, index: number) => (
                                        <TableRow key={index}>
                                          {Object.values(row).map((cell: any, cellIndex: number) => (
                                            <TableCell key={cellIndex}>
                                              {cell || '-'}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </UITable>
                                ) : typeof tableData === 'object' && tableData !== null ? (
                                  <UITable>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Field</TableHead>
                                        <TableHead>Value</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.entries(tableData).map(([key, value]: [string, any]) => (
                                        <TableRow key={key}>
                                          <TableCell className="font-medium capitalize">
                                            {key.replace(/_/g, ' ')}
                                          </TableCell>
                                          <TableCell>{value || '-'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </UITable>
                                ) : (
                                  <p className="text-center text-muted-foreground py-4">
                                    No data available
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a Template</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Choose a template from the left to format your entire document
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 