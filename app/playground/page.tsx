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
import { CustomAPISection } from "@/components/document/custom-api-section";
import { createInitialState, validateFileType, downloadJson, downloadMarkdown, downloadCsv } from "@/components/document/document-utils";
import { processDocument } from "@/components/document/document-processor";

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
            <div className="rounded-md border h-full overflow-x-auto bg-background">
              <Table className="rounded-md overflow-hidden">
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

export default function PlaygroundPage() {
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

  const handleTemplateSelect = (templateType: string) => {
    if (templateType === 'history') {
      setShowHistory(true);
      setSelectedType('history');
      return;
    }
    setShowHistory(false);
    setSelectedType(templateType as DocumentType);
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

  const handleProcessDocument = (customPrompt: string, outputFormat: any) => {
    processDocument(
      documentState,
      updateDocumentState,
      setIsProcessing,
      setProgress,
      { customPrompt, outputFormat }
    );
  };

  const handleDownloadJson = () => {
    downloadJson(documentState.selectedDoc, documentState.file?.name || 'document');
  };

  const handleDownloadMarkdown = () => {
    downloadMarkdown(documentState.selectedDoc, documentState.file?.name || 'document', generateMarkdown);
  };

  const handleDownloadCsv = () => {
    downloadCsv(documentState.selectedDoc, documentState.file?.name || 'document');
  };

  if (showHistory) {
      return (
        <div className="flex h-full overflow-hidden bg-background">
          <CustomSidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onSelectDemo={handleTemplateSelect}
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
          onSelectDemo={handleTemplateSelect}
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
            onProcess={handleProcessDocument}
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
        onSelectDemo={handleTemplateSelect}
        selectedType={selectedType}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto md:pt-6 md:pr-6 md:px-0 pt-14 px-4">
          <div className="grid pl-6 gap-6 pb-6 h-full lg:grid-cols-[minmax(0,_2fr)_minmax(250px,_300px)] grid-cols-1">
            <DocumentViewer
              currentState={documentState}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <DocumentInfo
              currentState={documentState}
              isProcessing={isProcessing}
              user={user}
              onDownloadJson={handleDownloadJson}
              onDownloadMarkdown={handleDownloadMarkdown}
              onDownloadCsv={handleDownloadCsv}
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
                  <table className="w-full rounded-md overflow-hidden">
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
                    <table className="w-full rounded-md overflow-hidden">
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