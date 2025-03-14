"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Zap, FileSearch, RefreshCcw, Table as TableIcon, ListIcon, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentState } from "@/types/document";
import { documentTemplates } from "./document-templates";

interface TableConfig {
  name: string;
  description?: string;
  type: 'table' | 'data';
  fields: {
    name: string;
    type: string;
    description?: string;
    isRequired?: boolean;
    format?: string;
  }[];
}

interface CustomAPISectionProps {
  currentState: DocumentState;
  onFileChange: (file: File | null) => void;
  onProcess: (customPrompt: string, outputFormat: any) => void;
  isProcessing: boolean;
  progress: number;
  templateType?: string | null;
}

export function CustomAPISection({ 
  currentState, 
  onFileChange, 
  onProcess, 
  isProcessing, 
  progress,
  templateType
}: CustomAPISectionProps) {
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

  // Load template when templateType changes
  useEffect(() => {
    if (templateType && documentTemplates[templateType]) {
      const template = documentTemplates[templateType];
      setDocumentName(template.documentName);
      
      // Convert template tables to TableConfig format
      const newTables: TableConfig[] = template.tables.map(table => ({
        name: table.name,
        description: table.description || '',
        type: table.type,
        fields: table.fields
      }));
      
      setTables(newTables);
      
      // Show toast notification
      toast({
        title: `${template.documentName} Template Loaded`,
        description: "The template has been loaded. You can now upload a document to analyze.",
      });
    }
  }, [templateType]);

  const hasRequiredField = tables.some(table => 
    table.fields.some(field => field.isRequired)
  );

  const addTable = (type: 'table' | 'data') => {
    setTables([...tables, {
      name: '',
      description: '',
      type,
      fields: type === 'table' ? [
        { name: '', type: 'string', isRequired: true }
      ] : [
        { name: '', type: 'string', isRequired: true }
      ]
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

  const updateField = (tableIndex: number, fieldIndex: number, updates: Partial<TableConfig['fields'][0]>) => {
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
        title: "No sections defined",
        description: "Please add at least one table or data section",
        variant: "destructive"
      });
      return;
    }

    for (const table of tables) {
      if (!table.name.trim()) {
        toast({
          title: "Invalid name",
          description: `All ${table.type === 'table' ? 'tables' : 'data sections'} must have a name`,
          variant: "destructive"
        });
        return;
      }

      if (table.fields.length === 0) {
        toast({
          title: "Empty section",
          description: `${table.type === 'table' ? 'Table' : 'Data section'} "${table.name}" has no fields`,
          variant: "destructive"
        });
        return;
      }

      if (!table.fields.some(f => f.isRequired)) {
        toast({
          title: "Missing required field",
          description: `${table.type === 'table' ? 'Table' : 'Data section'} "${table.name}" must have at least one required field`,
          variant: "destructive"
        });
        return;
      }

      for (const field of table.fields) {
        if (!field.name.trim()) {
          toast({
            title: "Invalid field name",
            description: `All fields in "${table.name}" must have a name`,
            variant: "destructive"
          });
          return;
        }
      }
    }

    const outputFormat = {
      documentType: documentName || "Document",
      tables: tables.map(table => ({
        name: table.name,
        type: table.type,
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

    const prompt = `Analyze this document and extract information in a structured format:\n\n${
      tables.map((table, i) => `${table.type === 'table' ? 'Table' : 'Data Section'} ${i + 1}: ${table.name}
${table.description ? `Description: ${table.description}\n` : ''}Fields:
${table.fields.map(field => 
  `- ${field.name}: ${field.description || ''} (${field.type}${field.isRequired ? ', required' : ''}${field.format ? `, format: ${field.format}` : ''})`
).join('\n')}`).join('\n\n')}`;

    onProcess(prompt, outputFormat);
  };

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-[1fr_300px] gap-6">
      {/* Main Configuration Area */}
      <div className="flex flex-col gap-6">
        {/* Document Setup Card */}
        <Card>
          <CardHeader className="p-3">
            <div className="">
              <div className="flex items-center gap-4">
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document type (Invoice, Receipt)"
                  className="w-full h-10"
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => addTable('table')}
                    className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary h-10"
                  >
                    <TableIcon className="h-4 w-4 mr-2" /> Add Line Items
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addTable('data')}
                    className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary h-10"
                  >
                    <ListIcon className="h-4 w-4 mr-2" /> Add Document Info
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tables Configuration */}
        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="p-6">
              <div className="space-y-6">
                {tables.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center gap-8 mb-6">
                      <motion.div 
                        className="text-center max-w-[200px] p-6 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addTable('table')}
                      >
                        <TableIcon className="h-12 w-12 mx-auto mb-3 text-primary" />
                        <h4 className="text-base font-medium mb-2">Line Items</h4>
                        <p className="text-sm text-muted-foreground">For repeating data like products, transactions, or line items</p>
                      </motion.div>
                      <motion.div 
                        className="text-center max-w-[200px] p-6 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addTable('data')}
                      >
                        <ListIcon className="h-12 w-12 mx-auto mb-3 text-primary" />
                        <h4 className="text-base font-medium mb-2">Document Info</h4>
                        <p className="text-sm text-muted-foreground">For single-value data like document ID, date, or totals</p>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  tables.map((table, tableIndex) => (
                    <motion.div
                      key={tableIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Table Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {table.type === 'table' ? (
                            <TableIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <ListIcon className="h-5 w-5 text-primary" />
                          )}
                          <Input
                            value={table.name}
                            onChange={(e) => updateTable(tableIndex, { name: e.target.value })}
                            placeholder={table.type === 'table' ? "Enter table name..." : "Enter section name..."}
                            className="w-[200px] h-9 text-sm bg-background border focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addField(tableIndex)}
                            className="h-9 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Field
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTable(tableIndex)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Fields Section */}
                      <div className="space-y-3">
                        {table.fields.map((field, fieldIndex) => (
                          <motion.div
                            key={fieldIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 py-1"
                          >
                            <Input
                              value={field.name}
                              onChange={(e) => updateField(tableIndex, fieldIndex, { name: e.target.value })}
                              placeholder={table.type === 'table' ? "Item name, quantity, price..." : "ID, date, total..."}
                              className="flex-1 h-9 text-sm"
                            />
                            <Select
                              value={field.type}
                              onValueChange={(value: any) => updateField(tableIndex, fieldIndex, { type: value })}
                            >
                              <SelectTrigger className="w-[130px] h-9 text-sm">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeField(tableIndex, fieldIndex)}
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                      {tableIndex < tables.length - 1 && <div className="h-6 border-b" />}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Right Side Panel */}
      <div className="flex flex-col gap-4">
        {/* Document Upload */}
        <Card className="overflow-hidden border-2 border-primary/10">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" /> Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center px-6 py-10 text-center transition-all duration-200",
                isDragActive ? "bg-primary/10 border-primary scale-[0.99]" : "hover:bg-muted/50",
                currentState.file ? "bg-muted/50" : "",
                "group cursor-pointer"
              )}
            >
              <input {...getInputProps()} />
              {currentState.file ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-medium text-base">{currentState.file.name}</p>
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
                  className="space-y-4"
                  animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-base font-medium">
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
            <div className="p-4 border-t">
              <Button
                className="w-full h-10"
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
          <Card className="border-2 border-primary/10">
            <CardContent className="p-4 space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {progress}% - Analyzing document...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Guide */}
        <Card className="border-2 border-primary/10">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Quick Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none">1</div>
                <div>
                  <p className="font-medium">Name Your Document</p>
                  <p className="text-sm text-muted-foreground">Give your document a descriptive name</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none">2</div>
                <div>
                  <p className="font-medium">Add Document Info</p>
                  <p className="text-sm text-muted-foreground">Add fields for single-value data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none">3</div>
                <div>
                  <p className="font-medium">Add Line Items</p>
                  <p className="text-sm text-muted-foreground">Add fields for repeating data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-none">4</div>
                <div>
                  <p className="font-medium">Upload & Process</p>
                  <p className="text-sm text-muted-foreground">Upload your document and analyze it</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 