"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Code, FileText, Receipt, FileSpreadsheet, TableIcon, ChevronLeft, Zap, BatteryCharging, Stethoscope, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

// Sample document data for interactive demo
const sampleDocuments = {
  't4': {
    title: 'T4 Tax Form',
    type: 't4',
    icon: <Receipt className="h-5 w-5" />,
    description: 'Employee tax information form',
    contentJson: {
      documentType: "T4 Tax Form",
      metadata: {
        employer: {
          name: "Acme Corporation",
          address: "123 Business Ave, Toronto, ON M5V 2N4",
          accountNumber: "RP0001234567"
        },
        employee: {
          name: "John Smith",
          address: "456 Residential St, Toronto, ON M4B 1B3",
          sin: "123-456-789"
        },
        taxYear: "2023"
      },
      content: {
        boxes: [
          { boxNumber: "14", description: "Employment income", amount: "$72,000.00" },
          { boxNumber: "22", description: "Income tax deducted", amount: "$14,750.00" },
          { boxNumber: "16", description: "CPP contributions", amount: "$3,754.45" },
          { boxNumber: "18", description: "EI premiums", amount: "$1,198.80" },
          { boxNumber: "44", description: "Union dues", amount: "$1,200.00" }
        ]
      }
    }
  },
  'bank': {
    title: 'Bank Statement',
    type: 'bank',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'Monthly bank account statement',
    contentJson: {
      documentType: "Bank Statement",
      metadata: {
        bank: {
          name: "FIRST BANK OF WIKI",
          branchInfo: "1425 JAMES ST, PO BOX 4000\nVICTORIA BC V8X 3X4\n1-800-555-5555"
        },
        account: {
          type: "CHEQUING ACCOUNT",
          number: "00005-123-456-7",
          holder: "JOHN JONES"
        },
        period: {
          startDate: "2003-10-09",
          endDate: "2003-11-08"
        }
      },
      content: {
        balances: {
          opening: "0.55",
          closing: "-72.47",
          totalDeposits: "1,442.61",
          totalWithdrawals: "1,515.63"
        },
        transactions: [
          {
            date: "2003-10-08",
            description: "Previous balance",
            amount: "0.55",
            type: "credit"
          },
          {
            date: "2003-10-09",
            description: "DEPOSIT",
            amount: "1,000.00",
            type: "credit"
          },
          {
            date: "2003-10-09",
            description: "INTERNET BILL PAYMENT - ROGERS",
            amount: "65.00",
            type: "debit"
          },
          {
            date: "2003-10-10",
            description: "INTERAC PURCHASE - SUPERMARKET",
            amount: "42.38",
            type: "debit"
          }
        ]
      }
    }
  },
  'receipt': {
    title: 'Store Receipt',
    type: 'receipt',
    icon: <FileText className="h-5 w-5" />,
    description: 'Retail purchase receipt',
    contentJson: {
      documentType: "Store Receipt",
      metadata: {
        store: {
          name: "TechGadgets",
          address: "789 Shopping Center, Vancouver, BC V6B 5Z6",
          phone: "(604) 555-1234"
        },
        transaction: {
          date: "2023-11-15",
          time: "14:23:45",
          receiptNumber: "T-45678",
          paymentMethod: "Credit Card"
        }
      },
      content: {
        items: [
          { description: "Wireless Earbuds Pro", quantity: "1", unitPrice: "$129.99", total: "$129.99" },
          { description: "Phone Case (Black)", quantity: "1", unitPrice: "$24.99", total: "$24.99" },
          { description: "Screen Protector", quantity: "2", unitPrice: "$19.99", total: "$39.98" }
        ],
        summary: {
          subtotal: "$194.96",
          tax: "$25.35",
          total: "$220.31"
        }
      }
    }
  },
  'dental': {
    title: 'Dental Claim Form',
    type: 'dental',
    icon: <Stethoscope className="h-5 w-5" />,
    description: 'Dental insurance claim form',
    contentJson: {
      documentType: "Dental Claim Form",
      metadata: {
        patient: {
          name: "Sarah Johnson",
          dob: "1985-04-12",
          addressLine1: "567 Main Street",
          addressLine2: "Apt 4B",
          city: "Toronto",
          province: "ON",
          postalCode: "M5V 2N4"
        },
        provider: {
          name: "Dr. Emily Chen",
          addressLine1: "123 Dental Drive",
          city: "Toronto",
          province: "ON",
          postalCode: "M4S 2Y6",
          phoneNumber: "416-555-1234",
          licenseNumber: "DDS-1234567"
        }
      },
      content: {
        services: [
          { serviceDate: "2023-09-15", procedureCode: "01204", description: "Complete examination", fee: "$125.00" },
          { serviceDate: "2023-09-15", procedureCode: "02111", description: "X-rays - two films", fee: "$78.50" },
          { serviceDate: "2023-09-15", procedureCode: "21223", description: "Amalgam restoration - 2 surfaces", fee: "$185.75" }
        ],
        totals: {
          totalFee: "$389.25",
          amountPaid: "$0.00",
          balanceDue: "$389.25"
        }
      }
    }
  },
  'electricity': {
    title: 'Electricity Bill',
    type: 'electricity',
    icon: <BatteryCharging className="h-5 w-5" />,
    description: 'Monthly electricity utility bill',
    contentJson: {
      documentType: "Electricity Bill",
      metadata: {
        utility: {
          name: "Ontario Power",
          accountNumber: "12345-67890",
          addressLine1: "1 Energy Plaza",
          city: "Toronto",
          province: "ON",
          postalCode: "M1M 1M1",
          phoneNumber: "1-800-555-7890"
        },
        customer: {
          name: "Michael Brown",
          serviceAddress: "789 Residential Ave, Toronto, ON M6K 3P2"
        },
        billingPeriod: {
          from: "2023-10-01",
          to: "2023-10-31"
        }
      },
      content: {
        usage: {
          currentReading: "5634 kWh",
          previousReading: "5234 kWh",
          totalUsage: "400 kWh"
        },
        charges: [
          { description: "Electricity (400 kWh @ $0.132/kWh)", amount: "$52.80" },
          { description: "Delivery", amount: "$36.45" },
          { description: "Regulatory charges", amount: "$4.23" },
          { description: "HST (13%)", amount: "$12.15" }
        ],
        totals: {
          currentCharges: "$105.63",
          outstandingBalance: "$0.00",
          totalAmountDue: "$105.63"
        }
      }
    }
  }
};

const AppMockup = () => {
  const [selectedDoc, setSelectedDoc] = useState<(typeof sampleDocuments)[keyof typeof sampleDocuments]>(sampleDocuments['bank']);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted'>('json');
  
  // Get theme from parent, but don't be forced by it
  const { theme, setTheme } = useTheme();
  
  // Local theme state to ensure component has its own theme control
  const [localTheme, setLocalTheme] = useState<string | undefined>(undefined);

  // Initialize local theme when component mounts
  useEffect(() => {
    if (localTheme === undefined) {
      setLocalTheme(theme);
    }
  }, [theme, localTheme]);

  // Use local theme to toggle, which prevents the page's forced theme from affecting this component
  const toggleTheme = () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(newTheme);
    setTheme(newTheme);
  };

  // Render component only after localTheme is initialized
  if (localTheme === undefined) {
    return null;
  }

  // Function to generate markdown from JSON
  const generateMarkdown = (data: any): string => {
    if (!data) return '';

    const padValue = (str: string, length: number) => {
      // Ensure the string is padded to exact length for perfect alignment
      return str.padEnd(length, ' ');
    };

    const formatTableValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value)
        .replace(/\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\|/g, '\\|')
        .trim();
    };

    const createTable = (data: Record<string, any>, headers: string[] = ['Property', 'Value']) => {
      if (Object.keys(data).length === 0) return '';

      // Calculate column widths for perfect alignment
      const keyColumnWidth = Math.max(
        headers[0].length,
        ...Object.keys(data).map(key => key.length)
      ) + 2; // Add padding
      
      // Calculate value column width - limit to reasonable width
      const valueColumnWidth = Math.min(
        50, // Max width to prevent overly wide columns
        Math.max(
          headers[1].length,
          ...Object.values(data).map(value => {
            const formatted = formatTableValue(value);
            return Math.min(formatted.length, 50); // Cap individual values too
          })
        ) + 2 // Add padding
      );

      const rows = Object.entries(data).map(([key, value]) => {
        const formattedValue = formatTableValue(value);
        // Truncate very long values
        const truncatedValue = formattedValue.length > valueColumnWidth - 2 
          ? formattedValue.substring(0, valueColumnWidth - 5) + '...' 
          : formattedValue;
        return [key, truncatedValue];
      });

      // Create table header with exact column widths
      let table = `| ${padValue(headers[0], keyColumnWidth)} | ${padValue(headers[1], valueColumnWidth)} |\n`;
      // Create separator line with exact column widths
      table += `| ${'-'.repeat(keyColumnWidth)} | ${'-'.repeat(valueColumnWidth)} |\n`;

      // Create rows with exact column widths
      rows.forEach(([key, value]) => {
        table += `| ${padValue(key, keyColumnWidth)} | ${padValue(value, valueColumnWidth)} |\n`;
      });

      return table;
    };

    const createArrayTable = (array: any[]) => {
      if (array.length === 0) return '';
      
      const headers = Object.keys(array[0]);
      
      // Calculate optimal column widths for each column based on content
      const columnWidths = headers.map(header => {
        const headerLength = header.length;
        const maxValueLength = Math.max(
          ...array.map(item => {
            const value = formatTableValue(item[header]);
            return value ? Math.min(value.length, 30) : 0; // Cap at 30 chars per cell
          })
        );
        return Math.min(30, Math.max(headerLength, maxValueLength) + 2); // Add padding, but cap at 30
      });

      // Create header row with calculated widths
      let table = '| ' + headers.map((header, index) => 
        padValue(header, columnWidths[index])
      ).join(' | ') + ' |\n';
      
      // Create separator line with exact column widths
      table += '| ' + columnWidths.map(width => '-'.repeat(width)).join(' | ') + ' |\n';

      // Create data rows with calculated widths
      array.forEach(item => {
        table += '| ' + headers.map((header, index) => {
          const value = formatTableValue(item[header]);
          // Truncate very long values
          const truncatedValue = value.length > columnWidths[index] - 2 
            ? value.substring(0, columnWidths[index] - 5) + '...' 
            : value;
          return padValue(truncatedValue, columnWidths[index]);
        }).join(' | ') + ' |\n';
      });

      return table;
    };

    let markdown = `# ${data.documentType}\n\n`;

    if (data.metadata) {
      markdown += '## Metadata\n\n';
      Object.entries(data.metadata).forEach(([key, value]: [string, any]) => {
        markdown += `### ${key}\n\n`;
        if (typeof value === 'object' && !Array.isArray(value)) {
          markdown += createTable(value);
        } else {
          markdown += createTable({ [key]: value });
        }
        markdown += '\n';
      });
    }

    if (data.content) {
      markdown += '## Content\n\n';
      Object.entries(data.content).forEach(([key, value]: [string, any]) => {
        markdown += `### ${key}\n\n`;
        if (Array.isArray(value) && value.length > 0) {
          markdown += createArrayTable(value);
        } else if (typeof value === 'object') {
          markdown += createTable(value);
        }
        markdown += '\n';
      });
    }

    return markdown;
  };

  return (
    <div className="w-full mx-auto max-w-5xl">
      {/* Mac Window Mockup */}
      <div className={`rounded-xl overflow-hidden shadow-2xl border ${localTheme === 'dark' ? 'border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-black' : 'border-zinc-200/70 bg-gradient-to-b from-zinc-100 to-white'} backdrop-blur-sm`}>
        {/* Window control buttons */}
        <div className={`px-4 py-3 flex items-center ${localTheme === 'dark' ? 'bg-black/80' : 'bg-zinc-100'} border-b ${localTheme === 'dark' ? 'border-zinc-800/80' : 'border-zinc-200/80'}`}>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Main application container */}
        <div className="flex overflow-hidden h-[550px]">
          {/* Left sidebar */}
          <div className={`w-56 flex flex-col border-r ${localTheme === 'dark' ? 'border-zinc-800/80 bg-black' : 'border-zinc-200/80 bg-white'}`}>
            <div className="p-4">
              <h2 className={`text-sm font-medium ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} mb-3`}>Document Types</h2>
              <div className="space-y-1">
                {Object.entries(sampleDocuments).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDoc(doc)}
                    className={`flex items-center px-3 py-1.5 w-full rounded text-sm ${
                      selectedDoc.type === doc.type
                        ? localTheme === 'dark' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-emerald-50 text-emerald-600'
                        : localTheme === 'dark'
                          ? 'text-zinc-400 hover:bg-zinc-800/30'
                          : 'text-zinc-600 hover:bg-zinc-100'
                    } transition-colors`}
                  >
                    <span className="mr-2">{doc.icon}</span>
                    <span>{doc.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1"></div>
            
            {/* Bottom actions */}
            <div className={`border-t ${localTheme === 'dark' ? 'border-zinc-800/80' : 'border-zinc-200/80'}`}>
              <button 
                onClick={toggleTheme}
                className={`flex items-center w-full px-4 py-3 text-left text-sm ${localTheme === 'dark' ? 'text-zinc-400 hover:bg-zinc-800/30' : 'text-zinc-600 hover:bg-zinc-100'} transition-colors`}
              >
                <SunMoon className="h-5 w-5 mr-3" />
                <span>Toggle theme</span>
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className={`flex-1 flex flex-col ${localTheme === 'dark' ? 'bg-[#121214]' : 'bg-zinc-50'}`}>
            {/* Tabs */}
            <div className={`flex items-center px-4 py-2 border-b ${localTheme === 'dark' ? 'border-zinc-800/80 bg-black' : 'border-zinc-200/80 bg-white'}`}>
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 rounded px-3 ${
                    activeTab === 'json' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : localTheme === 'dark' 
                        ? 'text-zinc-400 hover:text-zinc-100' 
                        : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                  onClick={() => setActiveTab('json')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 rounded px-3 ${
                    activeTab === 'markdown' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : localTheme === 'dark' 
                        ? 'text-zinc-400 hover:text-zinc-100' 
                        : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                  onClick={() => setActiveTab('markdown')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 rounded px-3 ${
                    activeTab === 'formatted' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : localTheme === 'dark' 
                        ? 'text-zinc-400 hover:text-zinc-100' 
                        : 'text-zinc-600 hover:text-zinc-800'
                  }`}
                  onClick={() => setActiveTab('formatted')}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Formatted
                </Button>
              </div>
            </div>
            
            {/* Document content */}
            <div className={`flex-1 overflow-auto ${localTheme === 'dark' ? 'bg-[#181818]' : 'bg-white'}`}>
              <AnimatePresence mode="wait">
                {activeTab === 'json' && (
                  <motion.div
                    key="json"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <pre className={`p-6 text-sm font-mono ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} whitespace-pre h-full overflow-auto`}>
                      {JSON.stringify(selectedDoc.contentJson, null, 2)}
                    </pre>
                  </motion.div>
                )}
                
                {activeTab === 'markdown' && (
                  <motion.div
                    key="markdown"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <div className="p-6 h-full overflow-auto">
                      <pre className={`text-sm font-mono ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} whitespace-pre select-text w-full tabular-nums leading-relaxed overflow-x-auto`}>
                        {generateMarkdown(selectedDoc.contentJson)}
                      </pre>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'formatted' && (
                  <motion.div
                    key="formatted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`h-full overflow-auto p-6 ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}
                  >
                    <h2 className="text-2xl font-bold mb-6">{selectedDoc.contentJson.documentType}</h2>
                    
                    {selectedDoc.contentJson.metadata && (
                      <div className="space-y-6 mb-8">
                        <h3 className="text-lg font-semibold text-emerald-500 mb-4">Metadata</h3>
                        {Object.entries(selectedDoc.contentJson.metadata).map(([key, value]: [string, any]) => (
                          <div key={key} className={`rounded-lg border ${localTheme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} overflow-hidden`}>
                            <div className={`px-4 py-2 ${localTheme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100'}`}>
                              <h4 className={`font-medium capitalize ${localTheme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>{key}</h4>
                            </div>
                            <div className={`p-4 ${localTheme === 'dark' ? 'bg-zinc-800/20' : 'bg-zinc-50'}`}>
                              <table className="w-full rounded-md overflow-hidden">
                                <tbody>
                                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                    <tr key={subKey} className={`border-b ${localTheme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200'} last:border-0`}>
                                      <td className={`py-2 font-medium ${localTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} capitalize w-1/3`}>{subKey}</td>
                                      <td className={`py-2 ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
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

                    {selectedDoc.contentJson.content && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-emerald-500 mb-4">Content</h3>
                        {Object.entries(selectedDoc.contentJson.content).map(([key, value]: [string, any]) => (
                          <div key={key} className={`rounded-lg border ${localTheme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} overflow-hidden`}>
                            <div className={`px-4 py-2 ${localTheme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100'}`}>
                              <h4 className={`font-medium capitalize ${localTheme === 'dark' ? 'text-zinc-100' : 'text-zinc-800'}`}>{key}</h4>
                            </div>
                            <div className={`p-4 ${localTheme === 'dark' ? 'bg-zinc-800/20' : 'bg-zinc-50'}`}>
                              {Array.isArray(value) ? (
                                <table className="w-full rounded-md overflow-hidden">
                                  <thead>
                                    <tr className={`border-b ${localTheme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
                                      {Object.keys(value[0] || {}).map((header) => (
                                        <th key={header} className={`py-2 text-left font-medium capitalize ${localTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {value.map((item, i) => (
                                      <tr key={i} className={`border-b ${localTheme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200'} last:border-0`}>
                                        {Object.values(item).map((val: any, j) => (
                                          <td key={j} className={`py-2 ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
                                            {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <table className="w-full rounded-md overflow-hidden">
                                  <tbody>
                                    {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                      <tr key={subKey} className={`border-b ${localTheme === 'dark' ? 'border-zinc-800/50' : 'border-zinc-200'} last:border-0`}>
                                        <td className={`py-2 font-medium ${localTheme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} capitalize w-1/3`}>{subKey}</td>
                                        <td className={`py-2 ${localTheme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
                                          {typeof subValue === 'object' 
                                            ? JSON.stringify(subValue, null, 2)
                                            : String(subValue)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection/shadow effect */}
      <div className="mt-1 mx-auto w-[98%] h-4 bg-gradient-to-b from-zinc-900/40 to-transparent rounded-b-full blur-sm"></div>
    </div>
  );
};

export default AppMockup; 