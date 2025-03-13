"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging, Table as TableIcon, History, Eye, Filter, Search, Trash2, Save, X, Plus, Minus, Check, Circle, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSidebar } from "@/components/custom-sidebar";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { DocumentType, DocumentState, ProcessingDocType, DocumentStateMap } from "@/types/document";
import { DocumentUploader } from "@/components/document/document-uploader";
import { DocumentViewer } from "@/components/document/document-viewer";
import { DocumentInfo } from "@/components/document/document-info";
import { HistorySection } from "@/components/document/history-section";
import { generateMarkdown } from "@/lib/document-utils";
import { Textarea } from "@/components/ui/textarea";

interface FieldConfig {
  name: string;
  type: 'string' | 'number' | 'date' | 'array' | 'boolean' | 'object' | 'currency' | 'percentage' | 'email' | 'phone';
  description?: string;
  isRequired?: boolean;
  format?: string;
}

interface DataTypeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultFields: FieldConfig[];
}

const dataTypeTemplates: DataTypeTemplate[] = [
  {
    id: 'financial',
    name: 'Financial Document',
    description: 'Extract financial data like transactions, amounts, and account details',
    icon: <FileText className="h-5 w-5" />,
    defaultFields: [
      { name: 'amount', type: 'currency', description: 'Transaction amount', isRequired: true },
      { name: 'date', type: 'date', description: 'Transaction date', isRequired: true },
      { name: 'description', type: 'string', description: 'Transaction description' },
      { name: 'category', type: 'string', description: 'Transaction category' },
      { name: 'accountNumber', type: 'string', description: 'Account number', format: 'XXXX-XXXX-XXXX' }
    ]
  },
  {
    id: 'identity',
    name: 'Identity Document',
    description: 'Extract personal information from ID cards, passports, etc.',
    icon: <User className="h-5 w-5" />,
    defaultFields: [
      { name: 'fullName', type: 'string', description: 'Full legal name', isRequired: true },
      { name: 'dateOfBirth', type: 'date', description: 'Date of birth', isRequired: true },
      { name: 'documentNumber', type: 'string', description: 'ID/Passport number', isRequired: true },
      { name: 'nationality', type: 'string', description: 'Nationality' },
      { name: 'expiryDate', type: 'date', description: 'Document expiry date' }
    ]
  },
  {
    id: 'invoice',
    name: 'Invoice/Receipt',
    description: 'Extract line items, totals, and payment details from invoices',
    icon: <ReceiptText className="h-5 w-5" />,
    defaultFields: [
      { name: 'invoiceNumber', type: 'string', description: 'Invoice number', isRequired: true },
      { name: 'issueDate', type: 'date', description: 'Invoice date', isRequired: true },
      { name: 'totalAmount', type: 'currency', description: 'Total amount', isRequired: true },
      { name: 'items', type: 'array', description: 'Line items' },
      { name: 'tax', type: 'percentage', description: 'Tax rate' }
    ]
  },
  {
    id: 'contract',
    name: 'Contract/Agreement',
    description: 'Extract key terms, dates, and parties from legal documents',
    icon: <FileStack className="h-5 w-5" />,
    defaultFields: [
      { name: 'parties', type: 'array', description: 'Contract parties', isRequired: true },
      { name: 'startDate', type: 'date', description: 'Contract start date', isRequired: true },
      { name: 'endDate', type: 'date', description: 'Contract end date' },
      { name: 'value', type: 'currency', description: 'Contract value' },
      { name: 'terms', type: 'array', description: 'Key terms and conditions' }
    ]
  }
];

const documentTypeLabels: Record<string, { title: string, description: string }> = {
  't4': {
    title: 'T4 Tax Form',
    description: 'Upload a picture or scan of your T4 tax slip'
  },
  'bank': {
    title: 'Bank Statement',
    description: 'Upload your bank statement document'
  },
  'receipt': {
    title: 'Store Receipt',
    description: 'Upload a picture of your store receipt'
  },
  'dental': {
    title: 'Dental Claim Form',
    description: 'Upload your dental insurance claim form'
  },
  'electricity': {
    title: 'Electricity Bill',
    description: 'Upload your electricity bill for analysis'
  },
  'custom': {
    title: 'Custom API',
    description: 'Create and test your own custom document analysis API'
  },
  'history': {
    title: 'Document History',
    description: 'View and manage your document history'
  }
};

interface SavedDocument {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  confidence: number;
  contentJson: any;
  createdAt: string;
  updatedAt: string;
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-6 h-full">
      {/* Main Table Loading Skeleton */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardContent className="p-0">
            <div className="rounded-md border h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Stats Loading Skeleton */}
      <div className="w-80 flex-none space-y-6">
        {/* Document Types Card */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function createInitialState(): DocumentState {
  return {
    file: null,
    isProcessed: false,
    selectedDoc: null,
    extractedText: "",
    error: null,
    isSaved: false,
  };
}

interface TableConfig {
  name: string;
  description?: string;
  fields: FieldConfig[];
}

function CustomAPISection({ 
  currentState, 
  onFileChange, 
  onProcess, 
  isProcessing, 
  progress 
}: { 
  currentState: DocumentState; 
  onFileChange: (file: File | null) => void; 
  onProcess: (customPrompt: string, outputFormat: any) => void; 
  isProcessing: boolean; 
  progress: number;
}) {
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [documentName, setDocumentName] = useState<string>("");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const hasRequiredField = tables.some(table => 
    table.fields.some(field => field.isRequired)
  );

  const addTable = () => {
    setTables([...tables, {
      name: '',
      description: '',
      fields: []
    }]);
  };

  const removeTable = (tableIndex: number) => {
    const newTables = [...tables];
    newTables.splice(tableIndex, 1);
    setTables(newTables);
  };

  const updateTable = (tableIndex: number, updates: Partial<TableConfig>) => {
    const newTables = [...tables];
    newTables[tableIndex] = { ...newTables[tableIndex], ...updates };
    setTables(newTables);
  };

  const addField = (tableIndex: number) => {
    const newTables = [...tables];
    const hasRequired = newTables[tableIndex].fields.some(f => f.isRequired);
    newTables[tableIndex].fields.push({
      name: '',
      type: 'string',
      description: '',
      isRequired: !hasRequired
    });
    setTables(newTables);
  };

  const removeField = (tableIndex: number, fieldIndex: number) => {
    const newTables = [...tables];
    const table = newTables[tableIndex];
    const field = table.fields[fieldIndex];
    
    if (field.isRequired && table.fields.filter(f => f.isRequired).length === 1) {
      toast({
        title: "Cannot delete field",
        description: "Each table must have at least one required field",
        variant: "destructive"
      });
      return;
    }
    
    table.fields.splice(fieldIndex, 1);
    setTables(newTables);
  };

  const updateField = (tableIndex: number, fieldIndex: number, updates: Partial<FieldConfig>) => {
    const newTables = [...tables];
    newTables[tableIndex].fields[fieldIndex] = {
      ...newTables[tableIndex].fields[fieldIndex],
      ...updates
    };
    setTables(newTables);
  };

  const handleSubmit = () => {
    if (tables.length === 0) {
      toast({
        title: "No tables defined",
        description: "Please add at least one table with fields",
        variant: "destructive"
      });
      return;
    }

    for (const table of tables) {
      if (!table.name.trim()) {
        toast({
          title: "Invalid table name",
          description: "All tables must have a name",
          variant: "destructive"
        });
        return;
      }

      if (table.fields.length === 0) {
        toast({
          title: "Empty table",
          description: `Table "${table.name}" has no fields`,
          variant: "destructive"
        });
        return;
      }

      if (!table.fields.some(f => f.isRequired)) {
        toast({
          title: "Missing required field",
          description: `Table "${table.name}" must have at least one required field`,
          variant: "destructive"
        });
        return;
      }

      for (const field of table.fields) {
        if (!field.name.trim()) {
          toast({
            title: "Invalid field name",
            description: `All fields in table "${table.name}" must have a name`,
            variant: "destructive"
          });
          return;
        }
      }
    }

    const outputFormat = {
      documentType: documentName || "Custom Document",
      tables: tables.map(table => ({
        name: table.name,
        description: table.description,
        fields: table.fields.map(field => ({
          name: field.name,
          type: field.type,
          description: field.description || '',
          required: field.isRequired || false,
          format: field.format
        }))
      }))
    };

    const prompt = `Analyze this document and extract the following information in a structured format:

${tables.map((table, i) => `Table ${i + 1}: ${table.name}
${table.description ? `Description: ${table.description}\n` : ''}
Fields:
${table.fields.map(field => 
  `- ${field.name}: ${field.description || ''} (${field.type}${field.isRequired ? ', required' : ''}${field.format ? `, format: ${field.format}` : ''})`
).join('\n')}`).join('\n\n')}`;

    onProcess(prompt, outputFormat);
  };

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-[1fr_300px] gap-6">
      {/* Main Configuration Area */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Document Type Name"
                className="max-w-[300px]"
              />
              <Button
                variant="outline"
                onClick={addTable}
                className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Data Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 h-[calc(100%-8rem)]">
          <div className="p-6">
            <div className="space-y-8">
              {tables.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Tables Added Yet</h3>
                  <p className="text-sm max-w-md mx-auto">
                    Start by adding a data table. Each table can contain multiple fields that you want to extract from your document.
                  </p>
                  <Button
                    variant="outline"
                    onClick={addTable}
                    className="mt-4 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Table
                  </Button>
                </div>
              ) : (
                tables.map((table, tableIndex) => (
                  <div key={tableIndex} className="rounded-xl border-2 bg-card">
                    {/* Table Header */}
                    <div className="p-6 border-b bg-muted/30">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Input
                              value={table.name}
                              onChange={(e) => updateTable(tableIndex, { name: e.target.value })}
                              placeholder="Table Name (e.g., Line Items, Customer Details)"
                              className="text-lg font-medium bg-background"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTable(tableIndex)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Table
                          </Button>
                        </div>
                        <Input
                          value={table.description || ''}
                          onChange={(e) => updateTable(tableIndex, { description: e.target.value })}
                          placeholder="Table Description (optional)"
                          className="text-sm bg-background"
                        />
                      </div>
                    </div>

                    {/* Fields Section */}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-muted-foreground">Fields</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addField(tableIndex)}
                            className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Field
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {table.fields.map((field, fieldIndex) => (
                            <Card key={fieldIndex} className={cn(
                              "border transition-colors",
                              field.isRequired ? "border-primary/50 bg-primary/5" : "hover:bg-muted/50"
                            )}>
                              <CardContent className="p-4">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <Input
                                        value={field.name}
                                        onChange={(e) => updateField(tableIndex, fieldIndex, { name: e.target.value })}
                                        placeholder="Field name (e.g., amount, date)"
                                        className={cn(
                                          "bg-background",
                                          field.isRequired && "border-primary/50"
                                        )}
                                      />
                                    </div>
                                    <Select
                                      value={field.type}
                                      onValueChange={(value: any) => updateField(tableIndex, fieldIndex, { type: value })}
                                    >
                                      <SelectTrigger className="w-[140px] bg-background">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="string">Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="date">Date</SelectItem>
                                        <SelectItem value="currency">Currency</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="boolean">Yes/No</SelectItem>
                                        <SelectItem value="array">List</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeField(tableIndex, fieldIndex)}
                                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant={field.isRequired ? "default" : "outline"}
                                      size="sm"
                                      className={cn(
                                        "h-8 px-3 shrink-0",
                                        field.isRequired && 
                                        table.fields.filter(f => f.isRequired).length === 1 && 
                                        "opacity-50 cursor-not-allowed"
                                      )}
                                      onClick={() => {
                                        if (field.isRequired && table.fields.filter(f => f.isRequired).length === 1) {
                                          toast({
                                            title: "Cannot change field",
                                            description: "Each table must have at least one required field",
                                            variant: "destructive"
                                          });
                                          return;
                                        }
                                        updateField(tableIndex, fieldIndex, { isRequired: !field.isRequired });
                                      }}
                                    >
                                      {field.isRequired ? (
                                        <Check className="h-4 w-4 mr-2" />
                                      ) : (
                                        <Circle className="h-4 w-4 mr-2" />
                                      )}
                                      Required
                                    </Button>
                                    <Input
                                      value={field.description || ''}
                                      onChange={(e) => updateField(tableIndex, fieldIndex, { description: e.target.value })}
                                      placeholder="Field description (optional)"
                                      className="flex-1 bg-background"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {table.fields.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                              <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">No fields added yet. Click "Add Field" to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Right Side Panel */}
      <div className="flex flex-col gap-4">
        {/* Document Upload */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium">Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-8 text-center transition-colors",
                isDragActive ? "bg-primary/5 border-primary" : "hover:bg-muted/50",
                currentState.file ? "bg-muted/50" : ""
              )}
            >
              <input {...getInputProps()} />
              {currentState.file ? (
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{currentState.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(currentState.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileChange(null);
                    }}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragActive ? "Drop file here" : "Upload Document"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drag & drop or click to upload
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center text-xs">
                    <span className="px-2 py-1 rounded-full bg-muted">PNG</span>
                    <span className="px-2 py-1 rounded-full bg-muted">JPG</span>
                    <span className="px-2 py-1 rounded-full bg-muted">PDF</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <Button
                className="w-full"
                disabled={!documentName || tables.length === 0 || !hasRequiredField || !currentState.file || isProcessing}
                onClick={handleSubmit}
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isProcessing && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress}% - Analyzing document...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Start Guide */}
        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-medium">Quick Guide</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">1. Name Your Document Type</p>
                <p className="text-xs text-muted-foreground">Give your document analysis a name</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">2. Create Data Tables</p>
                <p className="text-xs text-muted-foreground">Add tables to organize related information (e.g., "Line Items", "Customer Details")</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">3. Add Fields to Tables</p>
                <p className="text-xs text-muted-foreground">Define what data to extract in each table (e.g., "amount", "date")</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">4. Upload Document</p>
                <p className="text-xs text-muted-foreground">Upload the document you want to analyze</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">5. Process</p>
                <p className="text-xs text-muted-foreground">Click Analyze to extract your data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [documentStates, setDocumentStates] = useState<DocumentStateMap>({
    't4': createInitialState(),
    'bank': createInitialState(),
    'receipt': createInitialState(),
    'dental': createInitialState(),
    'electricity': createInitialState(),
    'custom': createInitialState(),
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('json');
  const [selectedType, setSelectedType] = useState<DocumentType>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const currentState = selectedType && selectedType !== 'history' 
    ? documentStates[selectedType as ProcessingDocType] 
    : createInitialState();

  const updateCurrentDocumentState = (updates: Partial<DocumentState>) => {
    if (!selectedType || selectedType === 'history') return;
    
    const docType = selectedType as ProcessingDocType;
    setDocumentStates((prev: DocumentStateMap) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        ...updates
      }
    }));
  };

  const validateFileType = (file: File): boolean => {
    const supportedTypes = {
      'image/jpeg': true,
      'image/png': true,
      'image/gif': true,
      'image/webp': true,
      'application/pdf': true
    } as const;
    
    if (!file) {
      updateCurrentDocumentState({ error: 'No file selected.' });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      updateCurrentDocumentState({ error: 'File size exceeds 10MB limit.' });
      return false;
    }
    
    if (!(file.type in supportedTypes)) {
      updateCurrentDocumentState({ 
        error: `Unsupported file type: ${file.type}. Please upload a PDF or image file (JPG, PNG, GIF, WebP).` 
      });
      return false;
    }
    return true;
  };

  const validateDocumentContent = (result: any): boolean => {
    if (!result.analysis?.documentType) {
      updateCurrentDocumentState({ error: 'Unable to determine document type. Please ensure you uploaded the correct document.' });
      return false;
    }

    // Skip validation for custom document type
    if (selectedType === 'custom') {
      return true;
    }

    const expectedTypes = {
      't4': ['T4', 'Tax', 'T4 Tax Slip', 'Tax Form'],
      'bank': ['Bank Statement', 'Bank Document', 'Account Statement'],
      'receipt': ['Store Receipt', 'Receipt', 'Sales Receipt', 'Purchase Receipt'],
      'dental': ['Dental Claim', 'Dental Form', 'Dental Insurance Claim'],
      'electricity': ['Electricity Bill', 'Utility Bill', 'Electric Bill']
    };

    const detectedType = result.analysis.documentType;
    const expectedTypeArray = expectedTypes[selectedType as keyof typeof expectedTypes] || [];
    
    if (!expectedTypeArray.some(type => detectedType.toLowerCase().includes(type.toLowerCase()))) {
      updateCurrentDocumentState({ 
        error: `This document appears to be a "${detectedType}" which doesn't match the selected document type. Please verify and try again.` 
      });
      return false;
    }

    return true;
  };

  const handleDemoSelect = (demoType: string) => {
    if (demoType === 'history') {
      setShowHistory(true);
      setSelectedType('history');
      return;
    }
    setShowHistory(false);
    setSelectedType(demoType as DocumentType);
  };

  const handleNewDocument = () => {
    if (!selectedType) return;
    setDocumentStates((prev: DocumentStateMap) => ({
      ...prev,
      [selectedType]: createInitialState()
    }));
  };

  const handleSaveDocument = async () => {
    if (!user || !selectedType || !currentState.selectedDoc?.contentJson || currentState.isSaved) return;

    try {
      setIsProcessing(true);
      const contentWithAnalysis = {
        ...currentState.selectedDoc.contentJson,
        analysis: {
          summary: currentState.selectedDoc.summary,
          keywords: currentState.selectedDoc.keywords,
          insights: currentState.selectedDoc.rawJson?.analysis?.insights || [],
          confidenceScore: currentState.selectedDoc.rawJson?.analysis?.confidenceScore || 0,
          documentType: currentState.selectedDoc.rawJson?.analysis?.documentType || selectedType
        }
      };

      const documentData = {
        title: currentState.file?.name || `${selectedType.toUpperCase()} Document`,
        type: selectedType,
        date: new Date().toISOString(),
        confidence: currentState.selectedDoc.rawJson?.analysis?.confidenceScore ? 
          Math.round(currentState.selectedDoc.rawJson.analysis.confidenceScore * 100) : 95,
        contentJson: contentWithAnalysis
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save document');
      }

      updateCurrentDocumentState({ isSaved: true });
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(currentState.selectedDoc?.contentJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown(currentState.selectedDoc?.contentJson);
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const content = currentState.selectedDoc?.contentJson;
    let csvContent = '';
    
    if (content.metadata) {
      csvContent += 'Metadata\n';
      Object.entries(content.metadata).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            csvContent += `${key},${subKey},${subValue}\n`;
          });
        } else {
          csvContent += `${key},,${value}\n`;
        }
      });
      csvContent += '\n';
    }

    if (content.content) {
      csvContent += 'Content\n';
      Object.entries(content.content).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const headers = Object.keys(value[0] || {});
          csvContent += `${key}\n${headers.join(',')}\n`;
          value.forEach(item => {
            csvContent += `${Object.values(item).join(',')}\n`;
          });
        } else if (typeof value === 'object') {
          Object.entries(value as any).forEach(([subKey, subValue]) => {
            csvContent += `${key},${subKey},${subValue}\n`;
          });
        }
        csvContent += '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentState.file?.name || 'document'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processDocument = async (customPrompt?: string, outputFormat?: any) => {
    if (!currentState.file || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      
      let currentProgress = 0;
      
      // Calculate progress with slight positive variation
      const addVariation = (value: number, range: number = 0.5) => {
        return value + (Math.random() * range);
      };
      
      const microMovement = async (baseProgress: number, duration: number = 800) => {
        const startTime = Date.now();
        const endTime = startTime + duration;
        
        while (Date.now() < endTime) {
          await new Promise(resolve => setTimeout(resolve, 100));
          const smallVariation = (Math.random() * 0.3) - 0.15;
          setProgress(Math.min(99, Math.max(baseProgress, baseProgress + smallVariation)));
        }
      };
      
      const incrementProgress = async (start: number, end: number, duration: number) => {
        const steps = 20;
        const stepDuration = duration / steps;
        
        for (let i = 1; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          // Calculate progress with slight positive variation
          const rawProgress = start + ((end - start) * (i / steps));
          const progress = Math.min(end, rawProgress + (Math.random() * 0.3));
          currentProgress = Math.max(currentProgress, progress);
          setProgress(Math.round(currentProgress * 10) / 10);
        }
      };

      // Initial jump to show quick response
      await incrementProgress(0, 8, 300);
      
      // Slower progress through main processing stages with natural pauses
      const stages = [
        { end: 35, duration: 2500 },
        { end: 58, duration: 3000 },
        { end: 73, duration: 2800 },
        { end: 89, duration: 2500 }
      ];

      for (const stage of stages) {
        await incrementProgress(currentProgress, stage.end, stage.duration);
        // Add micro-movements during "processing" pauses
        const pauseDuration = addVariation(1500, 500);
        await microMovement(currentProgress, pauseDuration);
      }

      // Process the document
      let result;
      try {
        // Validate file size before processing
        if (currentState.file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        let base64Data = await convertFileToBase64(currentState.file);
        if (!base64Data || typeof base64Data !== 'string') {
          throw new Error('Failed to convert file to base64');
        }
        base64Data = base64Data.split(',')[1] || base64Data;

        const requestData = {
          imageData: base64Data,
          mimeType: currentState.file.type || 'application/octet-stream'
        };

        // Add custom prompt and output format for custom API
        if (selectedType === 'custom' && customPrompt) {
          Object.assign(requestData, { 
            customPrompt, 
            outputFormat 
          });
        }

        if (!requestData.imageData) {
          throw new Error('Invalid file data');
        }

        const endpoint = `/api/analyze/${selectedType}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          let errorMessage;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || 'Server processing error';
          } else {
            errorMessage = response.statusText || 'Server processing error';
          }
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }
        result = await response.json();

        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response data from server');
        }

        if (!result.success) {
          throw new Error(result.error || 'Processing failed');
        }

        if (!result.analysis) {
          throw new Error('No analysis data received');
        }

        if (!validateDocumentContent(result)) {
          throw new Error('Invalid document content');
        }
      } catch (error) {
        throw error;
      }

      // Quick but smooth jump to completion
      await incrementProgress(currentProgress, 99, 300);
      await microMovement(99, 400); // Small movements at 99%
      
      // Final jump to 100%
      setProgress(100);
      
      // Brief pause at 100%
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Now update the state with results
      const updates = {
        extractedText: result.analysis.content?.text || "No text extracted",
        selectedDoc: {
          summary: result.analysis.analysis?.summary || "",
          keywords: result.analysis.analysis?.keywords || [],
          sentiment: result.analysis.analysis?.sentiment || "",
          rawJson: result.analysis,
          contentJson: result.result
        },
        isProcessed: true,
        error: null
      };

      // Update all states at once after showing 100%
      updateCurrentDocumentState(updates);
      
      console.log("Document processed successfully!");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      updateCurrentDocumentState({ error: errorMessage });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showHistory) {
      return (
        <div className="flex h-full overflow-hidden bg-background">
          <CustomSidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onSelectDemo={handleDemoSelect}
            selectedType="history"
          />
        <HistorySection user={user} />
      </div>
    );
  }

  if (!currentState.isProcessed) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onSelectDemo={handleDemoSelect}
          selectedType={selectedType}
        />
        <div className="flex-1 overflow-auto p-6">
          {selectedType === 'custom' ? (
            <CustomAPISection
              currentState={currentState}
              onFileChange={(file) => {
                updateCurrentDocumentState({
                  file,
                  isProcessed: false,
                  error: null
                });
              }}
              onProcess={(customPrompt, outputFormat) => processDocument(customPrompt, outputFormat)}
              isProcessing={isProcessing}
              progress={progress}
            />
          ) : (
            <div className="flex flex-col gap-6 h-full">
              <DocumentUploader
                selectedType={selectedType}
                currentState={currentState}
                isProcessing={isProcessing}
                progress={progress}
                onProcessDocument={processDocument}
                onFileChange={(file: File | null) => updateCurrentDocumentState({ file, error: null })}
                onSelectType={(type) => {
                  setShowHistory(false);
                  setSelectedType(type);
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <CustomSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onSelectDemo={handleDemoSelect}
        selectedType={selectedType}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto md:pt-6 md:pr-6 md:px-0 pt-14 px-4">
          <div className="grid gap-6 pb-6 h-full lg:grid-cols-[minmax(0,_2fr)_minmax(250px,_300px)] grid-cols-1">
            <DocumentViewer
              currentState={currentState}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <DocumentInfo
              currentState={currentState}
              isProcessing={isProcessing}
              user={user}
              onDownloadJson={downloadJson}
              onDownloadMarkdown={downloadMarkdown}
              onDownloadCsv={downloadCsv}
              onSaveDocument={handleSaveDocument}
              onNewDocument={handleNewDocument}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

const generateFormattedView = (data: any) => {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{data.documentType}</h2>
        
        {/* Metadata Section */}
        {data.metadata && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Metadata</h3>
            {Object.entries(data.metadata).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg border">
                <div className="px-4 py-3 border-b bg-muted">
                  <h4 className="font-medium capitalize">{key}</h4>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <tr key={subKey} className="border-b last:border-0">
                          <td className="py-2 font-medium capitalize w-1/3">{subKey}</td>
                          <td className="py-2">
                            {typeof subValue === 'object' 
                              ? JSON.stringify(subValue, null, 2)
                              : String(subValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Section */}
        {data.content && (
          <div className="space-y-6 mt-8">
            <h3 className="text-xl font-semibold">Content</h3>
            {Object.entries(data.content).map(([tableName, tableData]: [string, any]) => {
              // Ensure tableData is an array
              const entries = Array.isArray(tableData) ? tableData : [tableData];
              // Get field names from the first entry
              const fields = entries[0] ? Object.keys(entries[0]) : [];

              return (
                <div key={tableName} className="rounded-lg border">
                  <div className="px-4 py-3 border-b bg-muted">
                    <h4 className="font-medium capitalize">{tableName}</h4>
                  </div>
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {fields.map((field) => (
                            <th key={field} className="py-2 text-left font-medium capitalize">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, index) => (
                          <tr key={index} className="border-b last:border-0">
                            {fields.map((field) => (
                              <td key={field} className="py-2">
                                {String(entry[field] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 