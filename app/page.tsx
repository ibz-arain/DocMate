"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate, MotionValue } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight, Receipt, FileCheck, LightbulbIcon, Cable, FileSpreadsheet, ArrowUpRight, Sparkles, Download, Copy, Save, RefreshCcw, Stethoscope, BatteryCharging } from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import { useRef, useState, useEffect } from "react";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// 3D Card component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = (y - centerY) / 20;
    const rotateYVal = (centerX - x) / 20;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-200 ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Particle background component
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * -100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Interactive Demo Component
const InteractiveDemo = () => {
  const [activeDoc, setActiveDoc] = useState("receipt");
  const [activeTab, setActiveTab] = useState<'formatted' | 'analysis' | 'json' | 'markdown'>('formatted');
  
  // Define document type interfaces
  interface ReceiptDocument {
    title: string;
    date: string;
    items: { name: string; price: string; }[];
    total: string;
    tax: string;
    grandTotal: string;
    insights: string[];
  }

  interface TaxFormDocument {
    title: string;
    year: string;
    employer: string;
    income: string;
    taxWithheld: string;
    cppContributions: string;
    eiPremiums: string;
    insights: string[];
  }

  interface BankStatementDocument {
    title: string;
    period: string;
    accountNumber: string;
    openingBalance: string;
    closingBalance: string;
    transactions: { date: string; description: string; amount: string; }[];
    insights: string[];
  }

  interface DentalClaimDocument {
    title: string;
    date: string;
    provider: string;
    patientName: string;
    procedures: { code: string; description: string; fee: string; }[];
    totalFee: string;
    insurancePaid: string;
    patientResponsibility: string;
    insights: string[];
  }

  interface UtilityBillDocument {
    title: string;
    date: string;
    accountNumber: string;
    serviceAddress: string;
    currentCharges: string;
    dueDate: string;
    usageData: { month: string; usage: string; }[];
    insights: string[];
  }

  type DocumentData = {
    receipt: ReceiptDocument;
    taxForm: TaxFormDocument;
    bankStatement: BankStatementDocument;
    dentalClaim: DentalClaimDocument;
    utilityBill: UtilityBillDocument;
  };
  
  // Sample document data
  const documents: DocumentData = {
    receipt: {
      title: "Grocery Receipt",
      date: "May 15, 2023",
      items: [
        { name: "Organic Apples", price: "$4.99" },
        { name: "Whole Grain Bread", price: "$3.49" },
        { name: "Free Range Eggs", price: "$5.99" },
        { name: "Almond Milk", price: "$3.79" },
      ],
      total: "$18.26",
      tax: "$0.91",
      grandTotal: "$19.17",
      insights: [
        "Monthly grocery spending is 12% below average",
        "Organic items make up 60% of purchases",
        "Potential tax deduction: $0.91"
      ]
    },
    taxForm: {
      title: "T4 Tax Form",
      year: "2022",
      employer: "Acme Corporation",
      income: "$78,500.00",
      taxWithheld: "$15,700.00",
      cppContributions: "$3,754.45",
      eiPremiums: "$952.74",
      insights: [
        "Tax withholding is appropriate for income level",
        "CPP contributions are at maximum for tax year",
        "Potential additional deductions available"
      ]
    },
    bankStatement: {
      title: "Monthly Bank Statement",
      period: "April 1-30, 2023",
      accountNumber: "****4567",
      openingBalance: "$3,245.67",
      closingBalance: "$3,879.12",
      transactions: [
        { date: "Apr 3", description: "Payroll Deposit", amount: "+$2,354.65" },
        { date: "Apr 5", description: "Rent Payment", amount: "-$1,200.00" },
        { date: "Apr 12", description: "Grocery Store", amount: "-$87.32" },
        { date: "Apr 15", description: "Utility Bill", amount: "-$134.56" },
      ],
      insights: [
        "Monthly savings rate: 15%",
        "Spending in restaurants decreased by 22%",
        "Recurring subscriptions total: $42.97"
      ]
    },
    dentalClaim: {
      title: "Dental Insurance Claim",
      date: "March 10, 2023",
      provider: "Bright Smile Dental",
      patientName: "John Smith",
      procedures: [
        { code: "D0120", description: "Periodic Oral Evaluation", fee: "$65.00" },
        { code: "D0274", description: "Bitewings - Four Films", fee: "$85.00" },
        { code: "D1110", description: "Prophylaxis - Adult", fee: "$110.00" },
      ],
      totalFee: "$260.00",
      insurancePaid: "$208.00",
      patientResponsibility: "$52.00",
      insights: [
        "Claim processed within expected timeframe",
        "Insurance coverage: 80% as expected",
        "Next preventive care eligible: September 2023"
      ]
    },
    utilityBill: {
      title: "Electric Utility Bill",
      date: "June 5, 2023",
      accountNumber: "987654321",
      serviceAddress: "123 Main St",
      currentCharges: "$142.78",
      dueDate: "June 25, 2023",
      usageData: [
        { month: "Jan", usage: "580 kWh" },
        { month: "Feb", usage: "520 kWh" },
        { month: "Mar", usage: "490 kWh" },
        { month: "Apr", usage: "510 kWh" },
        { month: "May", usage: "610 kWh" },
        { month: "Jun", usage: "720 kWh" },
      ],
      insights: [
        "Usage increased 18% compared to last month",
        "Current bill is 7% higher than same period last year",
        "Estimated annual cost: $1,720"
      ]
    }
  };

  // Document icons mapping
  const docIcons = {
    receipt: <Receipt className="h-5 w-5" />,
    taxForm: <FileText className="h-5 w-5" />,
    bankStatement: <FileSpreadsheet className="h-5 w-5" />,
    dentalClaim: <FileCheck className="h-5 w-5" />,
    utilityBill: <Cable className="h-5 w-5" />
  };

  // Document titles mapping
  const docTitles = {
    receipt: "Receipt",
    taxForm: "T4 Tax Form",
    bankStatement: "Bank Statement",
    dentalClaim: "Dental Claim",
    utilityBill: "Utility Bill"
  };

  const activeDocument = documents[activeDoc as keyof typeof documents];

  // Render the formatted view of the document
  const renderFormattedView = () => {
    switch(activeDoc) {
      case "receipt":
        const receipt = activeDocument as ReceiptDocument;
        return (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Metadata</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Date</td>
                      <td className="py-2">{receipt.date}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Receipt Number</td>
                      <td className="py-2">R-29384756</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Store</td>
                      <td className="py-2">Whole Foods Market</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Items</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Item</th>
                      <th className="py-2 text-left font-medium">Quantity</th>
                      <th className="py-2 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">1</td>
                        <td className="py-2 text-right">{item.price}</td>
                      </tr>
                    ))}
                    <tr className="border-b bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Subtotal</td>
                      <td className="py-2 text-right">{receipt.total}</td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Tax</td>
                      <td className="py-2 text-right">{receipt.tax}</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Total</td>
                      <td className="py-2 text-right font-bold">{receipt.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case "taxForm":
        const taxForm = activeDocument as TaxFormDocument;
        return (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Metadata</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Tax Year</td>
                      <td className="py-2">{taxForm.year}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Form Type</td>
                      <td className="py-2">T4 Tax Slip</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Employer</td>
                      <td className="py-2">{taxForm.employer}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Income & Deductions</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Employment Income</td>
                      <td className="py-2">{taxForm.income}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Income Tax Deducted</td>
                      <td className="py-2">{taxForm.taxWithheld}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">CPP Contributions</td>
                      <td className="py-2">{taxForm.cppContributions}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">EI Premiums</td>
                      <td className="py-2">{taxForm.eiPremiums}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case "bankStatement":
        const bankStatement = activeDocument as BankStatementDocument;
        return (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Account Information</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Statement Period</td>
                      <td className="py-2">{bankStatement.period}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Account Number</td>
                      <td className="py-2">{bankStatement.accountNumber}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Opening Balance</td>
                      <td className="py-2">{bankStatement.openingBalance}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Closing Balance</td>
                      <td className="py-2">{bankStatement.closingBalance}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Transactions</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Date</th>
                      <th className="py-2 text-left font-medium">Description</th>
                      <th className="py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankStatement.transactions.map((tx, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{tx.date}</td>
                        <td className="py-2">{tx.description}</td>
                        <td className={`py-2 text-right ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case "dentalClaim":
        const dentalClaim = activeDocument as DentalClaimDocument;
        return (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Claim Information</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Date of Service</td>
                      <td className="py-2">{dentalClaim.date}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Provider</td>
                      <td className="py-2">{dentalClaim.provider}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Patient Name</td>
                      <td className="py-2">{dentalClaim.patientName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Procedures</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Code</th>
                      <th className="py-2 text-left font-medium">Description</th>
                      <th className="py-2 text-right font-medium">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dentalClaim.procedures.map((proc, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2 font-mono">{proc.code}</td>
                        <td className="py-2">{proc.description}</td>
                        <td className="py-2 text-right">{proc.fee}</td>
                      </tr>
                    ))}
                    <tr className="border-b bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Total Fee</td>
                      <td className="py-2 text-right">{dentalClaim.totalFee}</td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Insurance Paid</td>
                      <td className="py-2 text-right">{dentalClaim.insurancePaid}</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td colSpan={2} className="py-2 font-medium">Patient Responsibility</td>
                      <td className="py-2 text-right font-bold">{dentalClaim.patientResponsibility}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case "utilityBill":
        const utilityBill = activeDocument as UtilityBillDocument;
        return (
          <div className="space-y-6">
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Bill Information</h4>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Bill Date</td>
                      <td className="py-2">{utilityBill.date}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Account Number</td>
                      <td className="py-2">{utilityBill.accountNumber}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Service Address</td>
                      <td className="py-2">{utilityBill.serviceAddress}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Current Charges</td>
                      <td className="py-2">{utilityBill.currentCharges}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium w-1/3">Due Date</td>
                      <td className="py-2">{utilityBill.dueDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h4 className="font-medium">Usage History</h4>
              </div>
              <div className="p-4">
                <div className="h-40 relative mb-4">
                  <div className="absolute inset-0 flex items-end">
                    {utilityBill.usageData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full max-w-[30px] bg-primary/40 rounded-t-sm" 
                          style={{ 
                            height: `${parseInt(data.usage) / 8}px`,
                            transition: "height 0.3s ease-out" 
                          }}
                        ></div>
                        <div className="text-xs mt-2">{data.month}</div>
                        <div className="text-xs text-muted-foreground">{data.usage}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Month</th>
                      <th className="py-2 text-right font-medium">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilityBill.usageData.map((data, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{data.month}</td>
                        <td className="py-2 text-right">{data.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render the analysis view
  const renderAnalysisView = () => {
    const getDocumentSummary = () => {
      switch(activeDoc) {
        case 'receipt':
          const receipt = activeDocument as ReceiptDocument;
          return `This is a grocery receipt from Whole Foods Market dated ${receipt.date}. The total purchase amount is ${receipt.grandTotal} including tax of ${receipt.tax}.`;
        case 'taxForm':
          const taxForm = activeDocument as TaxFormDocument;
          return `This is a T4 tax form from ${taxForm.employer} for the year ${taxForm.year}. The total employment income is ${taxForm.income} with tax withholding of ${taxForm.taxWithheld}.`;
        case 'bankStatement':
          const bankStatement = activeDocument as BankStatementDocument;
          return `This is a bank statement for the period ${bankStatement.period}. Opening balance was ${bankStatement.openingBalance} and closing balance is ${bankStatement.closingBalance}. There were ${bankStatement.transactions.length} transactions during this period.`;
        case 'dentalClaim':
          const dentalClaim = activeDocument as DentalClaimDocument;
          return `This is a dental insurance claim for ${dentalClaim.patientName} at ${dentalClaim.provider} on ${dentalClaim.date}. The total fee was ${dentalClaim.totalFee} with insurance covering ${dentalClaim.insurancePaid}.`;
        case 'utilityBill':
          const utilityBill = activeDocument as UtilityBillDocument;
          return `This is a utility bill dated ${utilityBill.date} with a total charge of ${utilityBill.currentCharges}. Usage has ${parseFloat(utilityBill.usageData[5].usage) > parseFloat(utilityBill.usageData[4].usage) ? 'increased' : 'decreased'} compared to last month.`;
        default:
          return '';
      }
    };

    const getKeywords = () => {
      switch(activeDoc) {
        case 'receipt':
          return ['Grocery', 'Organic', 'Food', 'Receipt'];
        case 'taxForm':
          return ['Tax', 'T4', 'Income', 'Employment'];
        case 'bankStatement':
          return ['Bank', 'Statement', 'Account', 'Transaction'];
        case 'dentalClaim':
          return ['Dental', 'Insurance', 'Claim', 'Healthcare'];
        case 'utilityBill':
          return ['Utility', 'Electricity', 'Bill', 'Usage'];
        default:
          return [];
      }
    };

    return (
      <div className="space-y-6">
        <div className="rounded-lg border">
          <div className="px-4 py-3 border-b bg-muted/50">
            <h4 className="font-medium">AI Analysis</h4>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Summary</h5>
                <p className="text-sm text-muted-foreground">
                  {getDocumentSummary()}
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Keywords</h5>
                <div className="flex flex-wrap gap-2">
                  {getKeywords().map((keyword, i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{keyword}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Insights</h5>
                <ul className="space-y-2">
                  {activeDocument.insights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <div className="text-muted-foreground">{insight}</div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Confidence Score</h5>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-xs font-medium">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the JSON view
  const renderJsonView = () => {
    let jsonData = {};
    
    switch(activeDoc) {
      case "receipt":
        const receipt = activeDocument as ReceiptDocument;
        jsonData = {
          metadata: {
            date: receipt.date,
            receiptNumber: "R-29384756",
            store: "Whole Foods Market"
          },
          content: {
            items: receipt.items,
            subtotal: receipt.total,
            tax: receipt.tax,
            total: receipt.grandTotal
          },
          analysis: {
            insights: receipt.insights,
            confidenceScore: 0.95,
            documentType: "Store Receipt"
          }
        };
        break;
      case "taxForm":
        const taxForm = activeDocument as TaxFormDocument;
        jsonData = {
          metadata: {
            year: taxForm.year,
            formType: "T4",
            employer: taxForm.employer
          },
          content: {
            income: taxForm.income,
            taxWithheld: taxForm.taxWithheld,
            cppContributions: taxForm.cppContributions,
            eiPremiums: taxForm.eiPremiums
          },
          analysis: {
            insights: taxForm.insights,
            confidenceScore: 0.98,
            documentType: "Tax Form"
          }
        };
        break;
      case "bankStatement":
        const bankStatement = activeDocument as BankStatementDocument;
        jsonData = {
          metadata: {
            period: bankStatement.period,
            accountNumber: bankStatement.accountNumber
          },
          content: {
            openingBalance: bankStatement.openingBalance,
            closingBalance: bankStatement.closingBalance,
            transactions: bankStatement.transactions
          },
          analysis: {
            insights: bankStatement.insights,
            confidenceScore: 0.93,
            documentType: "Bank Statement"
          }
        };
        break;
      case "dentalClaim":
        const dentalClaim = activeDocument as DentalClaimDocument;
        jsonData = {
          metadata: {
            date: dentalClaim.date,
            provider: dentalClaim.provider,
            patientName: dentalClaim.patientName
          },
          content: {
            procedures: dentalClaim.procedures,
            totalFee: dentalClaim.totalFee,
            insurancePaid: dentalClaim.insurancePaid,
            patientResponsibility: dentalClaim.patientResponsibility
          },
          analysis: {
            insights: dentalClaim.insights,
            confidenceScore: 0.96,
            documentType: "Dental Claim"
          }
        };
        break;
      case "utilityBill":
        const utilityBill = activeDocument as UtilityBillDocument;
        jsonData = {
          metadata: {
            date: utilityBill.date,
            accountNumber: utilityBill.accountNumber,
            serviceAddress: utilityBill.serviceAddress,
            dueDate: utilityBill.dueDate
          },
          content: {
            currentCharges: utilityBill.currentCharges,
            usageData: utilityBill.usageData
          },
          analysis: {
            insights: utilityBill.insights,
            confidenceScore: 0.94,
            documentType: "Utility Bill"
          }
        };
        break;
      default:
        jsonData = {
          metadata: {
            title: activeDocument.title
          },
          analysis: {
            insights: activeDocument.insights,
            confidenceScore: 0.95
          }
        };
    }
    
    return (
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h4 className="font-medium">JSON Data</h4>
        </div>
        <div className="p-4">
          <pre className="text-xs overflow-auto p-4 bg-black/5 rounded-md max-h-[400px]">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  // Render the markdown view
  const renderMarkdownView = () => {
    const getMarkdownContent = () => {
      switch(activeDoc) {
        case "receipt":
          const receipt = activeDocument as ReceiptDocument;
          return `# ${receipt.title}
Date: ${receipt.date}
Receipt Number: R-29384756
Store: Whole Foods Market

## Items
${receipt.items.map(item => `- ${item.name}: ${item.price}`).join('\n')}

## Summary
- Subtotal: ${receipt.total}
- Tax: ${receipt.tax}
- Total: ${receipt.grandTotal}

## Insights
${receipt.insights.map(insight => `- ${insight}`).join('\n')}
`;
        case "taxForm":
          const taxForm = activeDocument as TaxFormDocument;
          return `# ${taxForm.title}
Year: ${taxForm.year}
Employer: ${taxForm.employer}

## Income & Deductions
- Employment Income: ${taxForm.income}
- Income Tax Deducted: ${taxForm.taxWithheld}
- CPP Contributions: ${taxForm.cppContributions}
- EI Premiums: ${taxForm.eiPremiums}

## Insights
${taxForm.insights.map(insight => `- ${insight}`).join('\n')}
`;
        case "bankStatement":
          const bankStatement = activeDocument as BankStatementDocument;
          return `# ${bankStatement.title}
Period: ${bankStatement.period}
Account Number: ${bankStatement.accountNumber}
Opening Balance: ${bankStatement.openingBalance}
Closing Balance: ${bankStatement.closingBalance}

## Transactions
${bankStatement.transactions.map(tx => `- ${tx.date} | ${tx.description} | ${tx.amount}`).join('\n')}

## Insights
${bankStatement.insights.map(insight => `- ${insight}`).join('\n')}
`;
        case "dentalClaim":
          const dentalClaim = activeDocument as DentalClaimDocument;
          return `# ${dentalClaim.title}
Date: ${dentalClaim.date}
Provider: ${dentalClaim.provider}
Patient: ${dentalClaim.patientName}

## Procedures
${dentalClaim.procedures.map(proc => `- ${proc.code} | ${proc.description} | ${proc.fee}`).join('\n')}

## Summary
- Total Fee: ${dentalClaim.totalFee}
- Insurance Paid: ${dentalClaim.insurancePaid}
- Patient Responsibility: ${dentalClaim.patientResponsibility}

## Insights
${dentalClaim.insights.map(insight => `- ${insight}`).join('\n')}
`;
        case "utilityBill":
          const utilityBill = activeDocument as UtilityBillDocument;
          return `# ${utilityBill.title}
Date: ${utilityBill.date}
Account Number: ${utilityBill.accountNumber}
Service Address: ${utilityBill.serviceAddress}
Current Charges: ${utilityBill.currentCharges}
Due Date: ${utilityBill.dueDate}

## Usage History
${utilityBill.usageData.map(data => `- ${data.month}: ${data.usage}`).join('\n')}

## Insights
${utilityBill.insights.map(insight => `- ${insight}`).join('\n')}
`;
        default:
          return '';
      }
    };
    
    return (
      <div className="rounded-lg border">
        <div className="px-4 py-3 border-b bg-muted/50">
          <h4 className="font-medium">Markdown</h4>
        </div>
        <div className="p-4">
          <pre className="text-xs font-mono overflow-auto p-4 bg-black/5 rounded-md max-h-[400px] whitespace-pre-wrap">
            {getMarkdownContent()}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto overflow-hidden border border-white/10 rounded-xl shadow-lg">
      <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-black/20 dark:bg-white/5 p-4 border-r border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            
            <div className="text-sm font-medium text-muted-foreground mb-4">Document Types</div>
            <div className="space-y-1">
              {Object.entries(docTitles).map(([key, title]) => (
                <button
                  key={key}
                  onClick={() => setActiveDoc(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeDoc === key 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-primary/10 text-foreground"
                  }`}
                >
                  <span className="flex-shrink-0">{docIcons[key as keyof typeof docIcons]}</span>
                  <span>{title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Document Header */}
            <div className="p-4 border-b border-white/10 bg-black/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/20">
                    {docIcons[activeDoc as keyof typeof docIcons]}
                  </div>
                  <h3 className="font-semibold">{activeDocument.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">AI Processed</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('formatted')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'formatted' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent hover:text-primary/80 hover:border-primary/30'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'analysis' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent hover:text-primary/80 hover:border-primary/30'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'json' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent hover:text-primary/80 hover:border-primary/30'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setActiveTab('markdown')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'markdown' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent hover:text-primary/80 hover:border-primary/30'
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'formatted' && renderFormattedView()}
              {activeTab === 'analysis' && renderAnalysisView()}
              {activeTab === 'json' && renderJsonView()}
              {activeTab === 'markdown' && renderMarkdownView()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/10 dark:bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <div className="text-sm font-medium">AI Processed</div>
              </div>
              <div className="text-xs text-muted-foreground">
                DocMate AI Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Gradient background animation
  const backgroundX = useMotionValue(0);
  const backgroundY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(
    circle at ${backgroundX}px ${backgroundY}px,
    rgba(var(--primary-rgb), 0.15) 0%,
    rgba(var(--primary-rgb), 0.05) 40%,
    rgba(0, 0, 0, 0) 60%
  )`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      backgroundX.set(e.clientX);
      backgroundY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [backgroundX, backgroundY]);

  return (
    <div className="relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 z-50"
        style={{ scaleX }}
      />

      <ScrollArea className="h-screen w-full">
        <div className="min-h-screen bg-background relative">
          {/* Animated background */}
          <motion.div
            className="fixed inset-0 z-0"
            style={{ background }}
          />

          {/* Grid background */}
          <div className="fixed inset-0 z-0 opacity-20">
            <div 
              className="h-full w-full"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          {/* Floating particles */}
          <ParticleBackground />

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>AI-Powered Document Analysis</span>
                  </motion.div>

                  <motion.h1
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Document Analysis Made{" "}
                    <GradientText>
                      <TypeAnimation
                        sequence={[
                          'Simple',
                          2000,
                          'Efficient',
                          2000,
                          'Powerful',
                          2000,
                          'Smart',
                          2000,
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                        cursor={true}
                      />
                    </GradientText>
                  </motion.h1>

                  <motion.p
                    className="text-xl text-muted-foreground max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    Transform your documents into actionable insights with our advanced AI-powered analysis platform.
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group">
                        <span className="relative z-10 flex items-center">
                          Try Demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="gap-2 group">
                      Learn More <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative"
                >
                  {/* 3D Document Visualization */}
                  <div className="relative h-[500px] w-full">
                    {/* Floating documents */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{
                          top: `${20 + i * 10}%`,
                          left: `${10 + i * 10}%`,
                          zIndex: 10 - i,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                        }}
                        transition={{
                          duration: 4 + i,
                          repeat: Infinity,
                          repeatType: "reverse",
                          delay: i * 0.5,
                        }}
                      >
                        <Card3D className="w-[200px] h-[280px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl">
                          <CardContent className="p-4 h-full flex flex-col">
                            <div className="w-full h-4 bg-primary/20 rounded mb-3"></div>
                            <div className="w-3/4 h-3 bg-primary/10 rounded mb-2"></div>
                            <div className="w-5/6 h-3 bg-primary/10 rounded mb-2"></div>
                            <div className="w-2/3 h-3 bg-primary/10 rounded mb-6"></div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} className="h-8 bg-primary/5 rounded"></div>
                              ))}
                            </div>
                          </CardContent>
                        </Card3D>
                      </motion.div>
                    ))}

                    {/* Glowing orb */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="text-muted-foreground text-sm mb-2">Scroll to explore</div>
              <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
                <motion.div
                  className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
                  animate={{
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
          </section>

          {/* Features Section with 3D cards */}
          <section className="py-32 px-6 relative">
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform -skew-y-2" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Powerful Features</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Everything You Need for <GradientText>Document Analysis</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Our platform combines cutting-edge AI with intuitive design to make document analysis simple and powerful.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <FileText className="h-10 w-10" />,
                    title: "Smart Extraction",
                    description: "Automatically extract and organize key information from your documents with precision and accuracy."
                  },
                  {
                    icon: <Brain className="h-10 w-10" />,
                    title: "AI Analysis",
                    description: "Get deep insights and understanding with our advanced AI analysis that learns from your documents."
                  },
                  {
                    icon: <Zap className="h-10 w-10" />,
                    title: "Fast Processing",
                    description: "Process documents quickly and efficiently with real-time results and minimal waiting time."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card3D className="h-full">
                      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10">
                        <CardContent className="p-8">
                          <div className="text-primary mb-6">
                            {feature.icon}
                          </div>
                          <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                          <p className="text-muted-foreground">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Card3D>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Demo Section */}
          <section className="py-32 px-6 relative overflow-hidden">
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform -skew-y-2" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Interactive Demo</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  See <GradientText>DocMate</GradientText> in Action
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Explore how our AI processes different types of documents. Click through the samples below to see the extracted data and insights.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <InteractiveDemo />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center mt-12"
              >
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="gap-2 group">
                    Try with Your Documents <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Document Types Section with interactive cards */}
          <section className="py-32 px-6 relative bg-gradient-to-b from-background via-primary/5 to-background">
            {/* Diagonal divider */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-background via-primary/5 to-background transform skew-y-2" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Versatile Support</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Document Types We <GradientText>Support</GradientText>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                  Specialized analysis for different types of documents to meet your specific needs.
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Receipt className="h-10 w-10" />,
                    title: "Receipts",
                    description: "Extract date, items, totals, and tax information from retail and service receipts."
                  },
                  {
                    icon: <Receipt className="h-10 w-10" />,
                    title: "T4 Tax Forms",
                    description: "Automatically process employment income, tax deductions, and CPP/EI contributions."
                  },
                  {
                    icon: <FileSpreadsheet className="h-10 w-10" />,
                    title: "Bank Statements",
                    description: "Analyze transactions, calculate totals, and categorize spending patterns."
                  },
                  {
                    icon: <FileCheck className="h-10 w-10" />,
                    title: "Dental Claims",
                    description: "Process procedure codes, dates of service, and insurance claim details."
                  },
                  {
                    icon: <Cable className="h-10 w-10" />,
                    title: "Utility Bills",
                    description: "Extract usage data, billing periods, and payment information."
                  },
                  {
                    icon: <LightbulbIcon className="h-10 w-10" />,
                    title: "More Coming Soon",
                    description: "Stay tuned for more document types and features!"
                  }
                ].map((docType, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group">
                      <CardContent className="p-8 h-full flex flex-col relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="text-primary mb-6 relative z-10">
                          {docType.icon}
                        </div>
                        <h3 className="text-2xl font-semibold mb-4 relative z-10">{docType.title}</h3>
                        <p className="text-muted-foreground relative z-10">
                          {docType.description}
                        </p>
                        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                          <Button variant="ghost" size="sm" className="gap-2">
                            Learn more <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section with attention-grabbing animation */}
          <section className="py-32 px-6 relative">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm" />
                
                {/* Animated background elements */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                  }}
                />
                
                <div className="relative p-16 md:p-20 text-center">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-6xl font-bold mb-6"
                  >
                    Ready to <GradientText>Transform</GradientText> Your Documents?
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
                  >
                    Experience the power of AI-driven document analysis. Try our demo today and see how we can help you extract valuable insights from your documents.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Link href="/demo">
                      <Button size="lg" className="gap-2 relative overflow-hidden group px-8 py-6 text-lg">
                        <span className="relative z-10 flex items-center">
                          Try Demo Now <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}