"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table as TableIcon,
  X,
  Copy,
  Download,
  CheckCircle,
  FileText
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FullDocumentQuickFormatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
  documentName?: string;
}

export function FullDocumentQuickFormatPopup({ 
  isOpen, 
  onClose, 
  result, 
  documentName = "Document" 
}: FullDocumentQuickFormatPopupProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const formatResult = result?.analysis || result;
  const content = formatResult?.content || {};

  const copyAsFormat = (format: string, tableName?: string) => {
    if (!content) {
      toast({ title: 'No data to copy', description: 'Please format the document first', variant: 'destructive' });
      return;
    }
    
    switch (format) {
      case 'json':
        const jsonData = tableName ? { [tableName]: content[tableName] } : content;
        navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
        toast({ title: "Copied to clipboard", description: "Data copied as JSON format." });
        break;
      case 'csv':
        let csvContent = '';
        if (tableName && content[tableName]) {
          const tableData = content[tableName];
          if (Array.isArray(tableData) && tableData.length > 0) {
            const headers = Object.keys(tableData[0]);
            csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
            tableData.forEach((row: any) => {
              csvContent += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
            });
          }
        } else {
          // Generate CSV for all tables
          Object.entries(content).forEach(([tableKey, tableData]: [string, any]) => {
            if (Array.isArray(tableData) && tableData.length > 0) {
              csvContent += `${tableKey}\n`;
              const headers = Object.keys(tableData[0]);
              csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
              tableData.forEach((row: any) => {
                csvContent += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
              });
              csvContent += '\n';
            } else if (typeof tableData === 'object' && tableData !== null) {
              csvContent += `${tableKey}\n`;
              csvContent += 'Field,Value\n';
              Object.entries(tableData).forEach(([key, value]) => {
                csvContent += `"${key}","${value}"\n`;
              });
              csvContent += '\n';
            }
          });
        }
        navigator.clipboard.writeText(csvContent);
        toast({ title: "Copied to clipboard", description: "Data copied as CSV format." });
        break;
      case 'markdown':
        let markdownContent = tableName ? `# ${tableName}\n\n` : `# ${documentName} - Formatted Data\n\n`;
        if (tableName && content[tableName]) {
          const tableData = content[tableName];
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
        } else {
          Object.entries(content).forEach(([tableKey, tableData]: [string, any]) => {
            markdownContent += `## ${tableKey}\n\n`;
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
        }
        navigator.clipboard.writeText(markdownContent);
        toast({ title: "Copied to clipboard", description: "Data copied as Markdown format." });
        break;
    }
    
    setCopied(format + (tableName || ''));
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadData = (format: string) => {
    if (!content) return;
    
    let fileContent = '';
    let fileName = '';
    let mimeType = '';
    
    switch (format) {
      case 'json':
        fileContent = JSON.stringify(content, null, 2);
        fileName = `${documentName.replace(/[^a-z0-9]/gi, '_')}_formatted.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        let csvContent = '';
        Object.entries(content).forEach(([tableKey, tableData]: [string, any]) => {
          if (Array.isArray(tableData) && tableData.length > 0) {
            csvContent += `${tableKey}\n`;
            const headers = Object.keys(tableData[0]);
            csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
            tableData.forEach((row: any) => {
              csvContent += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
            });
            csvContent += '\n';
          }
        });
        fileContent = csvContent;
        fileName = `${documentName.replace(/[^a-z0-9]/gi, '_')}_formatted.csv`;
        mimeType = 'text/csv';
        break;
    }
    
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${fileName} has been downloaded.`,
    });
  };

  if (!isOpen) return null;

  const tableCount = Object.keys(content).length;

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
                    <TableIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Document Quick Format</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {documentName} • {tableCount} data section{tableCount !== 1 ? 's' : ''}
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
              <div className="flex flex-col h-[70vh]">
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    {Object.entries(content).map(([tableName, tableData]: [string, any]) => (
                      <div key={tableName} className="space-y-4">
                        <div className="bg-muted/30 rounded-lg overflow-hidden">
                          <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <TableIcon className="h-4 w-4 text-primary" />
                                <h4 className="font-medium text-primary capitalize">
                                  {tableName.replace(/_/g, ' ')}
                                </h4>
                                {Array.isArray(tableData) && (
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    {tableData.length} rows
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyAsFormat('json', tableName)}
                                  className="h-7 px-2 text-xs"
                                >
                                  {copied === `json${tableName}` ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      JSON
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      JSON
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyAsFormat('csv', tableName)}
                                  className="h-7 px-2 text-xs"
                                >
                                  {copied === `csv${tableName}` ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      CSV
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      CSV
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyAsFormat('markdown', tableName)}
                                  className="h-7 px-2 text-xs"
                                >
                                  {copied === `markdown${tableName}` ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      MD
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      MD
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            {Array.isArray(tableData) && tableData.length > 0 ? (
                              <div className="rounded-md border overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      {Object.keys(tableData[0]).map((header) => (
                                        <TableHead key={header} className="font-medium capitalize">
                                          {header.replace(/_/g, ' ')}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tableData.map((row: any, index: number) => (
                                      <TableRow key={index} className="hover:bg-muted/30">
                                        {Object.values(row).map((cell: any, cellIndex: number) => (
                                          <TableCell key={cellIndex} className="text-sm">
                                            {cell || '-'}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : typeof tableData === 'object' && tableData !== null ? (
                              <div className="rounded-md border overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="font-medium">Field</TableHead>
                                      <TableHead className="font-medium">Value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Object.entries(tableData).map(([key, value]: [string, any]) => (
                                      <TableRow key={key} className="hover:bg-muted/30">
                                        <TableCell className="font-medium capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {value || '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-4">
                                No data available for this section
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="border-t bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Formatted data from entire document
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyAsFormat('json')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copied === 'json' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Copied JSON
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy All JSON
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => downloadData('json')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download JSON
                      </Button>
                      <Button
                        onClick={() => downloadData('csv')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 