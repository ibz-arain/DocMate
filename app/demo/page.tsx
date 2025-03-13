"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Menu, Upload, FileText, PanelRightOpen, Zap, FileSearch, Brain, ChevronRight, Code, RefreshCcw, Download, Copy, FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging, Table as TableIcon, History, Eye, Filter, Search, Trash2, Save, X, Plus, Minus, Check, Circle, User, ListIcon } from "lucide-react";
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
      },
      {
        name: 'Additional Boxes',
        type: 'table',
        fields: [
          { name: 'boxNumber', type: 'string', description: 'Box number', isRequired: true },
          { name: 'boxCode', type: 'string', description: 'Box code', isRequired: false },
          { name: 'amount', type: 'currency', description: 'Amount', isRequired: true }
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
        name: 'Balance Summary',
        type: 'data',
        fields: [
          { name: 'openingBalance', type: 'currency', description: 'Opening balance', isRequired: true },
          { name: 'closingBalance', type: 'currency', description: 'Closing balance', isRequired: true },
          { name: 'totalDeposits', type: 'currency', description: 'Total deposits', isRequired: true },
          { name: 'totalWithdrawals', type: 'currency', description: 'Total withdrawals', isRequired: true }
        ]
      },
      {
        name: 'Transactions',
        type: 'table',
        fields: [
          { name: 'date', type: 'date', description: 'Transaction date', isRequired: true },
          { name: 'description', type: 'string', description: 'Transaction description', isRequired: true },
          { name: 'amount', type: 'currency', description: 'Transaction amount', isRequired: true },
          { name: 'type', type: 'string', description: 'Transaction type (debit/credit)', isRequired: true },
          { name: 'balance', type: 'currency', description: 'Balance after transaction', isRequired: false }
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
          { name: 'address', type: 'string', description: 'Store address', isRequired: false },
          { name: 'phoneNumber', type: 'phone', description: 'Store phone number', isRequired: false },
          { name: 'receiptNumber', type: 'string', description: 'Receipt/transaction number', isRequired: true }
        ]
      },
      {
        name: 'Transaction Details',
        type: 'data',
        fields: [
          { name: 'date', type: 'date', description: 'Purchase date', isRequired: true },
          { name: 'time', type: 'string', description: 'Purchase time', isRequired: false },
          { name: 'subtotal', type: 'currency', description: 'Subtotal amount', isRequired: true },
          { name: 'taxAmount', type: 'currency', description: 'Tax amount', isRequired: true },
          { name: 'totalAmount', type: 'currency', description: 'Total amount', isRequired: true },
          { name: 'paymentMethod', type: 'string', description: 'Payment method', isRequired: false }
        ]
      },
      {
        name: 'Items',
        type: 'table',
        fields: [
          { name: 'itemName', type: 'string', description: 'Item name/description', isRequired: true },
          { name: 'quantity', type: 'number', description: 'Quantity', isRequired: true },
          { name: 'unitPrice', type: 'currency', description: 'Unit price', isRequired: true },
          { name: 'amount', type: 'currency', description: 'Total amount for item', isRequired: true },
          { name: 'sku', type: 'string', description: 'SKU/Item code', isRequired: false }
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
          { name: 'policyNumber', type: 'string', description: 'Insurance policy number', isRequired: true },
          { name: 'certificateNumber', type: 'string', description: 'Certificate number', isRequired: false }
        ]
      },
      {
        name: 'Dentist Information',
        type: 'data',
        fields: [
          { name: 'dentistName', type: 'string', description: 'Name of dentist', isRequired: true },
          { name: 'dentistAddress', type: 'string', description: 'Dentist address', isRequired: false },
          { name: 'dentistPhone', type: 'phone', description: 'Dentist phone number', isRequired: false },
          { name: 'licenseNumber', type: 'string', description: 'Dentist license number', isRequired: true }
        ]
      },
      {
        name: 'Procedures',
        type: 'table',
        fields: [
          { name: 'serviceDate', type: 'date', description: 'Date of service', isRequired: true },
          { name: 'procedureCode', type: 'string', description: 'Procedure code', isRequired: true },
          { name: 'toothCode', type: 'string', description: 'Tooth code/number', isRequired: false },
          { name: 'procedureDescription', type: 'string', description: 'Description of service', isRequired: true },
          { name: 'fee', type: 'currency', description: 'Professional fee', isRequired: true }
        ]
      },
      {
        name: 'Claim Summary',
        type: 'data',
        fields: [
          { name: 'totalFee', type: 'currency', description: 'Total fee charged', isRequired: true },
          { name: 'amountPaid', type: 'currency', description: 'Amount paid by patient', isRequired: false },
          { name: 'amountClaimed', type: 'currency', description: 'Amount claimed', isRequired: true }
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
        name: 'Billing Summary',
        type: 'data',
        fields: [
          { name: 'previousBalance', type: 'currency', description: 'Previous balance', isRequired: false },
          { name: 'currentCharges', type: 'currency', description: 'Current charges', isRequired: true },
          { name: 'totalAmountDue', type: 'currency', description: 'Total amount due', isRequired: true },
          { name: 'dueDate', type: 'date', description: 'Payment due date', isRequired: true }
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
      },
      {
        name: 'Charges',
        type: 'table',
        fields: [
          { name: 'description', type: 'string', description: 'Charge description', isRequired: true },
          { name: 'amount', type: 'currency', description: 'Amount', isRequired: true }
        ]
      }
    ]
  }
};

const documentTypeLabels: Record<string, { title: string, description: string }> = {
  't4': {
    title: 'T4 Tax Form',
    description: 'Load T4 tax form template for document analysis'
  },
  'bank': {
    title: 'Bank Statement',
    description: 'Load bank statement template for document analysis'
  },
  'receipt': {
    title: 'Store Receipt',
    description: 'Load store receipt template for document analysis'
  },
  'dental': {
    title: 'Dental Claim Form',
    description: 'Load dental claim form template for document analysis'
  },
  'electricity': {
    title: 'Electricity Bill',
    description: 'Load electricity bill template for document analysis'
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
  type: 'table' | 'data';
  fields: FieldConfig[];
}

function CustomAPISection({ 
  currentState, 
  onFileChange, 
  onProcess, 
  isProcessing, 
  progress,
  templateType
}: { 
  currentState: DocumentState; 
  onFileChange: (file: File | null) => void; 
  onProcess: (customPrompt: string, outputFormat: any) => void; 
  isProcessing: boolean; 
  progress: number;
  templateType?: string | null;
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
          <CardHeader className="py-3">
            <div className="">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Document Analysis API</h1>
                {templateType && documentTemplates[templateType] && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Template:</span>
                    <span className="font-medium text-foreground">{documentTemplates[templateType].documentName}</span>
                  </div>
                )}
              </div>
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

export default function DemoPage() {
  const [documentState, setDocumentState] = useState<DocumentState>(createInitialState());
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

  const updateDocumentState = (updates: Partial<DocumentState>) => {
    setDocumentState(prev => ({
      ...prev,
      ...updates
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
      updateDocumentState({ error: 'No file selected.' });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      updateDocumentState({ error: 'File size exceeds 10MB limit.' });
      return false;
    }
    
    if (!(file.type in supportedTypes)) {
      updateDocumentState({ 
        error: `Unsupported file type: ${file.type}. Please upload a PDF or image file (JPG, PNG, GIF, WebP).` 
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
    setDocumentState(createInitialState());
  };

  const handleSaveDocument = async () => {
    if (!user || !documentState.selectedDoc?.contentJson || documentState.isSaved) return;

    try {
      setIsProcessing(true);
      const contentWithAnalysis = {
        ...documentState.selectedDoc.contentJson,
        analysis: {
          summary: documentState.selectedDoc.summary,
          keywords: documentState.selectedDoc.keywords,
          insights: documentState.selectedDoc.rawJson?.analysis?.insights || [],
          confidenceScore: documentState.selectedDoc.rawJson?.analysis?.confidenceScore || 0,
          documentType: documentState.selectedDoc.rawJson?.analysis?.documentType || selectedType
        }
      };

      const documentData = {
        title: documentState.file?.name || `${selectedType || 'Custom'} Document`,
        type: selectedType || 'custom',
        date: new Date().toISOString(),
        confidence: documentState.selectedDoc.rawJson?.analysis?.confidenceScore ? 
          Math.round(documentState.selectedDoc.rawJson.analysis.confidenceScore * 100) : 95,
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

      updateDocumentState({ isSaved: true });
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
    const jsonString = JSON.stringify(documentState.selectedDoc?.contentJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentState.file?.name || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown(documentState.selectedDoc?.contentJson);
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentState.file?.name || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const content = documentState.selectedDoc?.contentJson;
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
    a.download = `${documentState.file?.name || 'document'}.csv`;
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
    if (!documentState.file || isProcessing) return;
    
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
        if (documentState.file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        let base64Data = await convertFileToBase64(documentState.file);
        if (!base64Data || typeof base64Data !== 'string') {
          throw new Error('Failed to convert file to base64');
        }
        base64Data = base64Data.split(',')[1] || base64Data;

        const requestData = {
          imageData: base64Data,
          mimeType: documentState.file.type || 'application/octet-stream',
          customPrompt, 
          outputFormat
        };

        if (!requestData.imageData) {
          throw new Error('Invalid file data');
        }

        const response = await fetch('/api/analyze/custom', {
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
      updateDocumentState(updates);
      
      console.log("Document processed successfully!");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      updateDocumentState({ error: errorMessage });
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

  if (!documentState.isProcessed) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onSelectDemo={handleDemoSelect}
          selectedType={selectedType}
        />
        <div className="flex-1 overflow-auto p-6">
          <CustomAPISection
            currentState={documentState}
            onFileChange={(file) => {
              updateDocumentState({
                file,
                isProcessed: false,
                error: null
              });
            }}
            onProcess={(customPrompt, outputFormat) => processDocument(customPrompt, outputFormat)}
            isProcessing={isProcessing}
            progress={progress}
            templateType={selectedType}
          />
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
              currentState={documentState}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <DocumentInfo
              currentState={documentState}
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