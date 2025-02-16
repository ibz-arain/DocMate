"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Code, Brain, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Updated generateFormattedView function
const generateFormattedView = (content: any) => {
  if (!content) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="space-y-4">
      {Object.entries(content).map(([section, data]) => (
        <div key={section} className="border rounded-lg p-4">
          <h3 className="text-lg font-medium capitalize mb-2">
            {section.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="space-y-2">
            {Object.entries(data as any).map(([key, value]) => (
              <div key={key}>
                {Array.isArray(value) ? (
                  <div>
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {Object.keys(value[0] || {}).map((header) => (
                              <th key={header} className="px-4 py-2 text-left font-medium">
                                {header.replace(/([A-Z])/g, ' $1').trim()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {value.map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              {Object.values(item).map((cellValue: any, cellIndex: number) => (
                                <td key={cellIndex} className="px-4 py-2">
                                  {formatValue(cellValue)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : typeof value === 'object' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(value as any).map(([subKey, subValue]) => (
                      <div key={subKey}>
                        <span className="text-sm font-medium capitalize">
                          {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>{' '}
                        <span className="text-sm text-muted-foreground">
                          {formatValue(subValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span className="text-muted-foreground">{formatValue(value)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced sample history data with preview content
const sampleHistory = [
  {
    id: "doc-001",
    title: "January T4 Statement",
    type: "t4",
    date: "2024-01-15",
    status: "processed",
    confidence: 95,
    preview: {
      content: {
        employerInfo: {
          name: "Tech Corp Inc.",
          address: "123 Business Ave",
          employerId: "12345-6789"
        },
        employeeInfo: {
          name: "John Smith",
          sin: "***-***-123",
          address: "456 Home Street"
        },
        taxInfo: {
          year: "2023",
          employmentIncome: "Box 14",
          cpp: "Box 16",
          ei: "Box 18"
        }
      },
      analysis: {
        summary: "Standard T4 tax form for 2023 fiscal year",
        keywords: ["T4", "Employment", "Tax Form", "2023"],
        insights: [
          "All required tax fields are present",
          "Document follows CRA format",
          "Digital signature verified"
        ]
      }
    }
  },
  {
    id: "doc-002",
    title: "Walmart Receipt",
    type: "receipt",
    date: "2024-02-01",
    status: "processed",
    confidence: 88,
    preview: {
      content: {
        merchantInfo: {
          name: "Walmart Superstore",
          address: "789 Retail Road",
          phone: "(555) 123-4567"
        },
        items: [
          { description: "Groceries", quantity: 3, category: "Food" },
          { description: "Household Items", quantity: 2, category: "Home" }
        ],
        transactionInfo: {
          date: "2024-02-01",
          time: "14:30",
          storeId: "ST123"
        }
      },
      analysis: {
        summary: "Retail purchase receipt from Walmart",
        keywords: ["Receipt", "Retail", "Purchase", "Groceries"],
        insights: [
          "Standard retail receipt format",
          "Contains itemized list",
          "Transaction details complete"
        ]
      }
    }
  },
  {
    id: "doc-003",
    title: "Dental Claim Form",
    type: "dental",
    date: "2024-02-10",
    status: "processed",
    confidence: 92,
    preview: {
      content: {
        patientInfo: {
          name: "Jane Smith",
          dob: "1990-05-15",
          policyNumber: "DEN-123456"
        },
        procedureInfo: [
          { code: "D0120", description: "Periodic Exam", date: "2024-02-10" },
          { code: "D0274", description: "X-Rays", date: "2024-02-10" }
        ],
        providerInfo: {
          name: "Dr. Johnson",
          license: "12345",
          clinic: "Smile Dental"
        }
      },
      analysis: {
        summary: "Standard dental insurance claim form",
        keywords: ["Dental", "Insurance", "Claim", "Medical"],
        insights: [
          "All required insurance fields present",
          "Valid procedure codes used",
          "Provider information verified"
        ]
      }
    }
  }
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'formatted' | 'analysis'>('formatted');

  const handleViewDocument = (doc: any) => {
    setSelectedDoc(doc.preview);
    setIsPreviewOpen(true);
  };

  // Filter and sort the documents
  const filteredDocuments = sampleHistory
    .filter((doc) => {
      if (filterType !== "all" && doc.type !== filterType) return false;
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Fixed Header */}
      <div className="flex-none p-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Document History</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="t4">T4 Forms</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
                <SelectItem value="dental">Dental Claims</SelectItem>
                <SelectItem value="electricity">Utility Bills</SelectItem>
                <SelectItem value="bank">Bank Statements</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-grow px-6 pb-6">
        <div className="space-y-6">
          {/* Documents Table Card */}
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{doc.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{doc.type}</TableCell>
                        <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">{doc.status}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Documents</span>
                    <span className="font-medium">{filteredDocuments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Confidence</span>
                    <span className="font-medium">
                      {filteredDocuments.length > 0 ? "100.0" : "0.0"}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    filteredDocuments.reduce((acc: Record<string, number>, doc) => {
                      acc[doc.type] = (acc[doc.type] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredDocuments.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{doc.title}</span>
                      <span className="text-sm">{new Date(doc.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <div className="flex-none p-6 border-b bg-background">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  Document Preview
                </DialogTitle>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'json' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('json')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant={activeTab === 'formatted' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('formatted')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Formatted
                  </Button>
                  <Button
                    variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('analysis')}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Analysis
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'json' && (
                      <motion.div
                        key="json"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 z-10"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedDoc?.content, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <div className="max-h-[calc(90vh-10rem)] overflow-auto">
                          <pre className="bg-muted p-4 rounded-lg">
                            <code className="text-sm">
                              {JSON.stringify(selectedDoc?.content, null, 2)}
                            </code>
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
                        className="max-h-[calc(90vh-10rem)] overflow-auto pr-4"
                      >
                        {generateFormattedView(selectedDoc?.content)}
                      </motion.div>
                    )}
                    {activeTab === 'analysis' && (
                      <motion.div
                        key="analysis"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 max-h-[calc(90vh-10rem)] overflow-auto pr-4"
                      >
                        <div>
                          <h3 className="text-lg font-medium mb-2">Summary</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoc?.analysis.summary}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedDoc?.analysis.keywords.map((keyword: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Insights</h3>
                          <div className="space-y-2">
                            {selectedDoc?.analysis.insights.map((insight: string, index: number) => (
                              <p key={index} className="text-sm text-muted-foreground">
                                • {insight}
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}