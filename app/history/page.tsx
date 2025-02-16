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

// Sample history data
const sampleHistory = [
  {
    id: "doc-001",
    title: "January T4 Statement",
    type: "t4",
    date: "2024-01-15",
    status: "processed",
    confidence: 98.5,
    amount: "$45,000",
  },
  {
    id: "doc-002",
    title: "Walmart Receipt",
    type: "receipt",
    date: "2024-02-01",
    status: "processed",
    confidence: 95.2,
    amount: "$156.78",
  },
  {
    id: "doc-003",
    title: "Dental Claim Form",
    type: "dental",
    date: "2024-02-10",
    status: "processed",
    confidence: 97.8,
    amount: "$250.00",
  },
  {
    id: "doc-004",
    title: "Hydro Bill February",
    type: "electricity",
    date: "2024-02-15",
    status: "processed",
    confidence: 99.1,
    amount: "$142.50",
  },
  {
    id: "doc-005",
    title: "RBC Bank Statement",
    type: "bank",
    date: "2024-02-20",
    status: "processed",
    confidence: 96.4,
    amount: "$3,567.89",
  },
];

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Filter and sort the documents
  const filteredDocuments = sampleHistory
    .filter((doc) => {
      if (filterType !== "all" && doc.type !== filterType) return false;
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "amount") return parseFloat(b.amount.replace(/[$,]/g, "")) - parseFloat(a.amount.replace(/[$,]/g, ""));
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
                <SelectItem value="amount">Amount</SelectItem>
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Confidence</TableHead>
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
                        <TableCell>{doc.amount}</TableCell>
                        <TableCell>{doc.confidence}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
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
                      {(filteredDocuments.reduce((acc, doc) => acc + doc.confidence, 0) / filteredDocuments.length).toFixed(1)}%
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
    </div>
  );
}