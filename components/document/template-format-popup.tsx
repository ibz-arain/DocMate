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
import { motion, AnimatePresence } from "framer-motion";

interface TemplateFormatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

interface Template {
  id: string;
  name: string;
  tables: any[];
  created_at: string;
  updated_at: string;
}

export function TemplateFormatPopup({ isOpen, onClose, selectedText }: TemplateFormatPopupProps) {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const { templates, isLoading: templatesLoading } = useTemplates();

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
    if (!selectedText || !template) return;
    
    try {
      setIsAnalyzing(true);
      setSelectedTemplate(template);
      
      // Check if this is a box selection
      const isBoxSelection = selectedText === '[Box Selection]';
      
      if (isBoxSelection) {
        toast({ 
          title: 'Box Selection', 
          description: 'Box selection formatting will be processed as image. Feature coming soon!', 
          variant: 'default' 
        });
        setIsAnalyzing(false);
        return;
      }
      
      // Create a base64 encoded text for the API
      const base64 = btoa(unescape(encodeURIComponent(selectedText)));
      const imageData = `data:text/plain;base64,${base64}`;

      // Parse template tables
      const templateTables = typeof template.tables === 'string' 
        ? JSON.parse(template.tables) 
        : template.tables;

      // Create output format using the selected template
      const outputFormat = {
        documentType: template.name,
        tables: templateTables
      };

      const customPrompt = `Analyze the selected text and extract data according to the "${template.name}" template structure.

Instructions:
1. Extract information that matches the defined template fields
2. Follow the exact field names and types specified in the template
3. For table-type sections, extract all matching instances found in the text
4. For data-type sections, extract single values
5. If a field is not found in the text, use an empty string
6. Maintain data accuracy and follow any specified formats

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
          imageData,
          mimeType: 'text/plain',
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
      console.log('Template Format API Response:', data);
      setAnalysisResult(data);
      setIsAnalyzing(false);
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
      toast({ title: 'No data to copy', description: 'Please format the text first', variant: 'destructive' });
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
        let markdownContent = `# ${selectedTemplate?.name} Data\n\n`;
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
          className="w-full max-w-5xl max-h-[85vh] overflow-hidden"
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="space-y-4 pt-6">

          {!selectedTemplate && !isAnalyzing ? (
            // Template Selection Phase
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a template to format your selected text according to its structure:
              </p>
              
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-9 h-9"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                />
              </div>

              {/* Templates List */}
              <div className="border rounded-lg">
                <ScrollArea className="h-64">
                  <div className="p-3 space-y-2">
                    {templatesLoading ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Loading templates...
                      </div>
                    ) : filteredTemplates.length > 0 ? (
                      filteredTemplates.map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => performTemplateFormat(template)}
                        >
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">{template.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {typeof template.tables === 'string' 
                                ? JSON.parse(template.tables).length 
                                : template.tables.length} sections
                            </span>
                          </div>
                        </Button>
                      ))
                    ) : templates.length > 0 && templateSearchQuery ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No templates match your search
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No templates available. Create templates in the Templates section.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : isAnalyzing ? (
            // Loading Phase
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <FileText className="h-8 w-8 text-primary animate-pulse relative z-10" />
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium animate-pulse">
                  Formatting with "{selectedTemplate?.name}" template...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extracting data according to template structure
                </p>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          ) : analysisResult ? (
            // Results Phase
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >


              {(() => {
                // Check for different response structures
                const content = analysisResult?.content || analysisResult?.analysis?.content;
                
                if (!content) {
                  return (
                    <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
                      <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Debug Info</h4>
                      <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto">
                        {JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  );
                }
                
                // Count total data points
                const totalDataPoints = Object.values(content).reduce((total: number, tableData: any) => {
                  if (Array.isArray(tableData)) return total + tableData.length;
                  if (typeof tableData === 'object' && tableData !== null) return total + Object.keys(tableData).length;
                  return total;
                }, 0);
                
                return (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg overflow-hidden">
                      {/* Fixed Header with Title and Copy Buttons */}
                      <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <h4 className="font-medium text-primary">{selectedTemplate?.name} Data</h4>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              {totalDataPoints} data points
                            </span>
                          </div>
                          
                          {/* Copy Options */}
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-xs"
                              onClick={() => copyAsFormat('csv')}
                            >
                              Copy CSV
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-xs"
                              onClick={() => copyAsFormat('json')}
                            >
                              Copy JSON
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 text-xs"
                              onClick={() => copyAsFormat('markdown')}
                            >
                              Copy Markdown
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Scrollable Content Container */}
                      <div className="max-h-96 overflow-auto">
                        <div className="space-y-6 p-4">
                          {Object.entries(content).map(([tableName, tableData]: [string, any]) => (
                            <div key={tableName}>
                              <h5 className="font-medium text-sm text-primary mb-3 flex items-center gap-2">
                                <Table className="h-3 w-3" />
                                {tableName}
                                {Array.isArray(tableData) && (
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    {tableData.length} rows
                                  </span>
                                )}
                              </h5>
                              
                              {Array.isArray(tableData) ? (
                                // Table data
                                tableData.length > 0 ? (
                                  <div className="border border-border rounded-lg overflow-hidden">
                                    <table className="w-full border-collapse">
                                      <thead className="bg-muted/50">
                                        <tr>
                                          {Object.keys(tableData[0]).map(header => (
                                            <th key={header} className="border-b border-border px-3 py-2 text-left font-medium text-xs">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {tableData.map((row: any, idx: number) => (
                                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                            {Object.keys(tableData[0]).map(key => (
                                              <td key={key} className="border-b border-border/50 px-3 py-2 text-sm">
                                                {row[key] || '-'}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                                    No data found for this section
                                  </div>
                                )
                              ) : typeof tableData === 'object' && tableData !== null ? (
                                // Single data object
                                <div className="border border-border rounded-lg p-4 bg-background/50">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(tableData).map(([key, value]) => (
                                      <div key={key} className="space-y-1">
                                        <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          {key}
                                        </dt>
                                        <dd className="text-sm font-medium">
                                          {String(value || '-')}
                                        </dd>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-lg">
                                  No data available
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Back to Template Selection */}
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setAnalysisResult(null);
                  }}
                >
                  Use Different Template
                </Button>
              </div>
            </motion.div>
          ) : null}

          {/* Cancel button during loading */}
          {isAnalyzing && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
            </div>
          )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 