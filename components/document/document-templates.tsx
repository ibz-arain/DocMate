import { FileText, User, ReceiptText, FileStack } from "lucide-react";

export interface FieldConfig {
  name: string;
  type: 'string' | 'number' | 'date' | 'array' | 'boolean' | 'object' | 'currency' | 'percentage' | 'email' | 'phone';
  description?: string;
  isRequired?: boolean;
  format?: string;
}

export interface TableTemplate {
  name: string;
  description?: string;
  type: 'table' | 'data';
  fields: FieldConfig[];
}

export interface DocumentTemplate {
  documentName: string;
  tables: TableTemplate[];
}

export const documentTemplates: Record<string, DocumentTemplate> = {
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

export const documentTypeLabels: Record<string, { title: string, description: string }> = {
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