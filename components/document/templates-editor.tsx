"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Zap, FileSearch, RefreshCcw, Table as TableIcon, ListIcon, Plus, X, Save, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentState } from "@/types/document";
import { documentTemplates } from "./document-templates";
import { useTemplates, Template } from "@/hooks/use-templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/components/auth-provider";

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
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const { templates, createTemplate, deleteTemplate, isLoading: templatesLoading } = useTemplates();
  const { user } = useAuthContext();
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
      
      // Store the template name as a data attribute to use when saving
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.currentTemplateName = template.documentName;
      }
      
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

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  // Function to save current configuration as a template
  const saveAsTemplate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save templates",
        variant: "destructive"
      });
      return;
    }

    if (!templateNameInput.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format template name for consistency
      const formattedName = templateNameInput.trim();
      
      // Save template
      await createTemplate(formattedName, tables);
      
      // Store template name for document type
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.currentTemplateName = formattedName;
      }
      
      setShowSaveTemplateDialog(false);
      setTemplateNameInput("");
      
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully"
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  // Function to load a custom template
  const loadTemplate = (template: Template) => {
    try {
      const parsedTables = typeof template.tables === 'string' 
        ? JSON.parse(template.tables) 
        : template.tables;
      
      setDocumentName(template.name);
      setTables(parsedTables);
      
      // Store both template ID and template name as data attributes
      document.documentElement.dataset.currentTemplateId = template.id;
      document.documentElement.dataset.currentTemplateName = template.name;
      
      toast({
        title: "Template loaded",
        description: `${template.name} template has been loaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error loading template",
        description: "Failed to load template. The format may be invalid.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTemplate(templateId);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
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
          <ScrollArea className="h-[calc(100vh-10rem)]">
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
        

        {/* Templates Section - replacing Quick Guide */}
        <Card className="border-2 border-primary/10 flex-1 overflow-hidden">
          <CardHeader className="border-b py-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Templates
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Search Box - Only shown when signed in */}
            {user && (
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    className="pl-9 h-9 text-sm"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Templates List */}
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 text-sm"
                  onClick={() => {
                    setTables([]);
                    setDocumentName("");
                    toast({
                      title: user ? "Started from scratch" : "Try your own",
                      description: "You can now build your document schema"
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {user ? "Start from scratch" : "Try your own"}
                </Button>
                
                {/* Show different templates based on login status */}
                {user ? (
                  // User is signed in - show their custom templates
                  <>
                    {templatesLoading ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        Loading your templates...
                      </div>
                    ) : filteredTemplates.length > 0 ? (
                      filteredTemplates.map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="w-full justify-start h-10 text-sm group"
                          onClick={() => loadTemplate(template)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="flex-1 text-left truncate">{template.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id, e);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Button>
                      ))
                    ) : templates.length > 0 && templateSearchQuery ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No templates match your search
                      </div>
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        You haven't created any templates yet
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSaveTemplateDialog(true)}
                      className="w-full justify-center mt-2 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save current template
                    </Button>
                  </>
                ) : (
                  // User is not signed in - show hardcoded templates
                  <>
                    {Object.entries(documentTemplates).map(([key, template]) => (
                      <Button
                        key={key}
                        variant="outline"
                        className="w-full justify-start h-10 text-sm"
                        onClick={() => {
                          setDocumentName(template.documentName);
                          const newTables: TableConfig[] = template.tables.map(table => ({
                            name: table.name,
                            description: table.description || '',
                            type: table.type,
                            fields: table.fields
                          }));
                          setTables(newTables);
                          toast({
                            title: `${template.documentName} Template Loaded`,
                            description: "Template has been loaded successfully"
                          });
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {template.documentName}
                      </Button>
                    ))}
                    
                    <div className="h-px bg-border my-3" />
                    <div className="text-center text-sm text-muted-foreground py-2">
                      Sign in to save and manage your own templates
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-sm font-medium">
                  Template Name
                </label>
                <Input
                  id="template-name"
                  placeholder="Enter a name for your template"
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              variant="outline" 
              className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
              onClick={saveAsTemplate}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 