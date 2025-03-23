export type DocumentType = 't4' | 'bank' | 'receipt' | 'dental' | 'electricity' | 'custom' | 'history' | null;

export type ProcessingDocType = Exclude<DocumentType, 'history' | null>;

export interface DocumentState {
  file: File | null;
  isProcessed: boolean;
  selectedDoc: any;
  extractedText: string;
  error: string | null;
  isSaved: boolean;
}

export type DocumentStateMap = {
  [K in ProcessingDocType]: DocumentState;
};

export interface SavedDocument {
  id: string;
  title: string;
  type: DocumentType;
  date: string;
  confidence: number;
  contentJson: any;
  createdAt: string;
  updatedAt: string;
}

export const documentTypeLabels: Record<string, { title: string, description: string }> = {
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