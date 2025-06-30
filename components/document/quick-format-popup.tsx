"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useHistory } from "@/hooks/use-history";

interface QuickFormatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  selectionData?: any;
  documentName?: string;
  currentPageNumber?: number;
  cachedResult?: any;
}

export function QuickFormatPopup({ isOpen, onClose, selectedText, selectionData, documentName, currentPageNumber, cachedResult }: QuickFormatPopupProps) {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addHistoryEntry } = useHistory();

  // Start analysis when popup opens or use cached result
  useEffect(() => {
    if (isOpen && selectedText) {
      if (cachedResult) {
        setAnalysisResult(cachedResult);
      } else {
        performQuickFormat();
      }
    }
  }, [isOpen, selectedText, cachedResult]);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setAnalysisResult(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  const performQuickFormat = async () => {
    if (!selectedText) return;
    
    try {
      setIsAnalyzing(true);
      
      // Check if this is a box selection
      const isBoxSelection = selectedText === '[Box Selection]';
      
      let imageData: string;
      let mimeType: string;
      
      if (isBoxSelection) {
        if (!selectionData?.base64Image) {
          toast({ 
            title: 'Box Selection Error', 
            description: 'Unable to extract image from selection area.', 
            variant: 'destructive' 
          });
          setIsAnalyzing(false);
          onClose();
          return;
        }
        
        // Use the base64 image data directly
        imageData = selectionData.base64Image.split(',')[1] || selectionData.base64Image;
        mimeType = 'image/png';
      } else {
        // Create a base64 encoded text for the API
        const base64 = btoa(unescape(encodeURIComponent(selectedText)));
        imageData = base64;
        mimeType = 'text/plain';
      }

      // Define a dynamic table structure for Quick Format
      const outputFormat = {
        documentType: "Quick Format Table",
        tables: [
          {
            name: "formatted_data",
            description: "Automatically formatted table from selected text",
            type: "table" as const,
            fields: [
              {
                name: "category",
                type: "string",
                description: "Main category or header for this data point",
                required: true
              },
              {
                name: "value",
                type: "string", 
                description: "The actual value or description",
                required: true
              },
              {
                name: "details",
                type: "string",
                description: "Additional details or sub-information",
                required: false
              }
            ]
          }
        ]
      };

      const customPrompt = isBoxSelection ? 
        `Analyze the image content and extract information into a structured table format.

Instructions:
1. Examine all text, graphics, tables, charts, and visual elements in the image
2. Understand the context and meaning of the content, not just individual words  
3. Identify key information and organize it into logical categories and values
4. Extract meaningful data points, relationships, and insights from the content
5. Create well-structured table entries with clear categories
6. If the image contains tables or lists, extract and organize the data appropriately
7. If the image contains charts or graphs, extract the key data points and insights
8. If the image contains narrative text, extract the main points and organize them logically
9. Focus on extracting actionable information and meaningful relationships
10. Preserve important context and details that add value

The goal is to transform visual content into a structured, searchable, and useful table format while maintaining the original meaning and context.` :
        `Analyze the selected text and convert it into a structured table format. 

Instructions:
1. Identify the key information in the text
2. Organize it into logical categories and values
3. Extract any additional details that provide context
4. Create a well-structured table with clear headers
5. If the text contains lists, convert each item to a table row
6. If the text contains key-value pairs, organize them appropriately
7. If the text is narrative, extract the main points and organize them

The goal is to make the information more readable and structured while preserving all important details.`;

      const res = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          mimeType,
          customPrompt,
          outputFormat
        })
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: 'Quick Format Failed', description: error.error || 'Unknown error', variant: 'destructive' });
        setIsAnalyzing(false);
        onClose();
        return;
      }

      const data = await res.json();
      setAnalysisResult(data);
      
      // Add to history
      addHistoryEntry({
        type: 'quick-format',
        title: selectedText.length > 50 ? `${selectedText.substring(0, 47)}...` : selectedText,
        content: data,
        selectedText,
        selectionData,
        documentName,
        pageNumber: currentPageNumber,
      });
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'Quick Format Error', description: 'Something went wrong', variant: 'destructive' });
      setIsAnalyzing(false);
      onClose();
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
          className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="space-y-4 pt-6">
              
          {isAnalyzing && !analysisResult ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <Table className="h-8 w-8 text-primary animate-pulse relative z-10" />
              </div>
              <p className="text-sm text-muted-foreground mt-4 animate-pulse">
                Converting text to structured table format...
              </p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          ) : analysisResult ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Special handling for Quick Format Table results */}
              {analysisResult?.analysis?.documentType === "Quick Format Table" && analysisResult?.analysis?.content?.formatted_data ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg overflow-hidden">
                    {/* Fixed Header with Title and Copy Buttons */}
                    <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-primary">Formatted Table Data</h4>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {analysisResult.analysis.content.formatted_data.length} rows
                          </span>
                        </div>
                        
                        {/* Copy Options */}
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={() => {
                              const tableData = analysisResult.analysis.content.formatted_data;
                              const csvContent = "Category,Value,Details\n" + 
                                tableData.map((row: any) => `"${row.category || ''}","${row.value || ''}","${row.details || ''}"`).join('\n');
                              navigator.clipboard.writeText(csvContent);
                              toast({
                                title: "Copied to clipboard",
                                description: "Table data copied as CSV format.",
                              });
                            }}
                          >
                            Copy CSV
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={() => {
                              const tableData = analysisResult.analysis.content.formatted_data;
                              const jsonContent = JSON.stringify(tableData, null, 2);
                              navigator.clipboard.writeText(jsonContent);
                              toast({
                                title: "Copied to clipboard",
                                description: "Table data copied as JSON format.",
                              });
                            }}
                          >
                            Copy JSON
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={() => {
                              const tableData = analysisResult.analysis.content.formatted_data;
                              let markdownContent = "| Category | Value | Details |\n|----------|-------|----------|\n";
                              markdownContent += tableData.map((row: any) => 
                                `| ${(row.category || '').replace(/\|/g, '\\|')} | ${(row.value || '').replace(/\|/g, '\\|')} | ${(row.details || '').replace(/\|/g, '\\|')} |`
                              ).join('\n');
                              navigator.clipboard.writeText(markdownContent);
                              toast({
                                title: "Copied to clipboard",
                                description: "Table data copied as Markdown format.",
                              });
                            }}
                          >
                            Copy Markdown
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs"
                            onClick={async () => {
                              const tableData = analysisResult.analysis.content.formatted_data;
                              
                              // Create HTML table for rich text copying
                              let htmlTable = '<table border="1" style="border-collapse: collapse; width: 100%;">';
                              htmlTable += '<thead><tr style="background-color: #f5f5f5;">';
                              htmlTable += '<th style="padding: 8px; text-align: left; font-weight: bold;">Category</th>';
                              htmlTable += '<th style="padding: 8px; text-align: left; font-weight: bold;">Value</th>';
                              htmlTable += '<th style="padding: 8px; text-align: left; font-weight: bold;">Details</th>';
                              htmlTable += '</tr></thead><tbody>';
                              
                              tableData.forEach((row: any) => {
                                htmlTable += '<tr>';
                                htmlTable += `<td style="padding: 8px; border: 1px solid #ddd;">${row.category || ''}</td>`;
                                htmlTable += `<td style="padding: 8px; border: 1px solid #ddd;">${row.value || ''}</td>`;
                                htmlTable += `<td style="padding: 8px; border: 1px solid #ddd;">${row.details || ''}</td>`;
                                htmlTable += '</tr>';
                              });
                              
                              htmlTable += '</tbody></table>';
                              
                              // Create plain text fallback
                              const textTable = `Category\tValue\tDetails\n${tableData.map((row: any) => 
                                `${row.category || ''}\t${row.value || ''}\t${row.details || ''}`
                              ).join('\n')}`;
                              
                              try {
                                // Try to write both HTML and text to clipboard
                                await navigator.clipboard.write([
                                  new ClipboardItem({
                                    'text/html': new Blob([htmlTable], { type: 'text/html' }),
                                    'text/plain': new Blob([textTable], { type: 'text/plain' })
                                  })
                                ]);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "Table copied as formatted table (paste into Word, Google Docs, etc.)",
                                });
                              } catch (error) {
                                // Fallback to plain text if rich clipboard fails
                                await navigator.clipboard.writeText(textTable);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "Table copied as tab-separated text.",
                                });
                              }
                            }}
                          >
                            Copy Table
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Scrollable Table Container */}
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                          <tr>
                            <th className="border-b border-border px-4 py-3 text-left font-medium text-sm">Category</th>
                            <th className="border-b border-border px-4 py-3 text-left font-medium text-sm">Value</th>
                            <th className="border-b border-border px-4 py-3 text-left font-medium text-sm">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.analysis.content.formatted_data.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/20 transition-colors">
                              <td className="border-b border-border/50 px-4 py-3 text-sm font-medium">{row.category || '-'}</td>
                              <td className="border-b border-border/50 px-4 py-3 text-sm">{row.value || '-'}</td>
                              <td className="border-b border-border/50 px-4 py-3 text-sm text-muted-foreground">{row.details || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Analysis insights if available */}
                  {analysisResult?.analysis?.analysis?.insights && analysisResult.analysis.analysis.insights.length > 0 && (
                    <div className="bg-blue-50/50 dark:bg-blue-950/30 rounded-lg p-4">
                      <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                        {analysisResult.analysis.analysis.insights.map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : typeof analysisResult === 'string' ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-md">{analysisResult}</pre>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(analysisResult).map(([key, value]) => (
                    <div key={key} className="border rounded-md p-3">
                      <h4 className="font-medium text-sm text-primary mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                      <div className="text-sm">
                        {typeof value === 'string' ? (
                          <p className="whitespace-pre-wrap">{value}</p>
                        ) : Array.isArray(value) ? (
                          <ul className="list-disc list-inside space-y-1">
                            {value.map((item, idx) => (
                              <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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