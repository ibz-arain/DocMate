import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { FileStack, Building2, ReceiptText, Stethoscope, BatteryCharging, TableIcon as Table2Icon, History, FileSearch, Brain, Code, FileText, X, Save, Trash2, Filter, Search, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "./loading-skeleton";
import { generateMarkdown, generateFormattedView } from "@/lib/document-utils";
import { SavedDocument, DocumentType } from "@/types/document";
import { cn } from "@/lib/utils";

interface HistorySectionProps {
  user: any;
}

export function HistorySection({ user }: HistorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('formatted');
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDoc, setDeleteDoc] = useState<SavedDocument | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return;

    try {
      const response = await fetch(`/api/documents?id=${deleteDoc.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete document');

      setDocuments(docs => docs.filter(d => d.id !== deleteDoc.id));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteDoc(null);
    }
  };

  const handleViewDocument = (doc: any) => {
    const contentJson = typeof doc.content_json === 'string' 
      ? JSON.parse(doc.content_json) 
      : doc.content_json;

    const mappedDoc = {
      ...doc,
      contentJson,
      summary: contentJson.analysis?.summary || "",
      keywords: contentJson.analysis?.keywords || [],
      rawJson: {
        analysis: {
          insights: contentJson.analysis?.insights || [],
          confidenceScore: contentJson.analysis?.confidenceScore || 0
        }
      }
    };
    setSelectedDoc(mappedDoc);
    setIsPreviewOpen(true);
  };

  const filteredDocuments = documents
    .filter((doc) => {
      if (filterType !== "all" && doc.type !== filterType) return false;
      return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const documentStats = documents.reduce((acc: Record<string, number>, doc) => {
    if (doc.type) {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
    }
    return acc;
  }, {});

  if (!user) {
    return (
      <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <History className="h-6 w-6" />
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Sign in to view and manage your document history
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full max-w-sm"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-background">
      <div className="flex-none p-6">
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 h-full lg:grid-cols-[minmax(0,_2fr)_minmax(250px,_300px)] grid-cols-1 min-h-[calc(100vh-16rem)]">
            <div className="flex-1 min-w-0">
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="rounded-md border h-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead className="hidden md:table-cell">Type</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.length > 0 ? (
                          filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {doc.type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                                  {doc.type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                                  <span className="truncate">{doc.title}</span>
                                  <div className="flex items-center gap-2 md:hidden">
                                    <span className="text-xs text-muted-foreground capitalize">({doc.type})</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(doc.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell capitalize">{doc.type}</TableCell>
                              <TableCell className="hidden md:table-cell">{new Date(doc.date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewDocument(doc)}
                                    className="bg-primary/10 text-primary hover:bg-primary/20"
                                  >
                                    <FileSearch className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteDoc(doc)}
                                    className="bg-primary/10 text-primary hover:bg-primary/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2" />
                                <p>No documents found</p>
                                {searchQuery && <p className="text-sm">Try adjusting your search or filters</p>}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(documentStats).length > 0 ? (
                      Object.entries(documentStats).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                            {type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                            {type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                            {type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                            {type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-muted-foreground capitalize">{type}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <Table2Icon className="h-8 w-8 mx-auto mb-2" />
                        <p>No document types to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      documents.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {doc.type === 't4' && <FileStack className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'bank' && <Building2 className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'receipt' && <ReceiptText className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'dental' && <Stethoscope className="h-4 w-4 text-muted-foreground" />}
                            {doc.type === 'electricity' && <BatteryCharging className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-medium truncate">{doc.title}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="capitalize">{doc.type}</span>
                            <span>{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2" />
                        <p>No recent activity to display</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document
              "{deleteDoc?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 overflow-hidden [&>button]:hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-none p-6 border-b bg-background">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DialogTitle className="text-2xl font-bold truncate">
                  {selectedDoc?.title || "Document Preview"}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                  <Button
                    variant={activeTab === 'json' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('json')}
                    className={cn(
                      "flex items-center gap-1 sm:gap-2 whitespace-nowrap",
                      activeTab === 'json' ? (
                        "bg-primary/10 text-primary hover:bg-primary/20"
                      ) : (
                        "hover:bg-primary/10 hover:text-primary"
                      )
                    )}
                  >
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">JSON</span>
                    <span className="sm:hidden">JS</span>
                  </Button>
                  <Button
                    variant={activeTab === 'markdown' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('markdown')}
                    className={cn(
                      "flex items-center gap-1 sm:gap-2 whitespace-nowrap",
                      activeTab === 'markdown' ? (
                        "bg-primary/10 text-primary hover:bg-primary/20"
                      ) : (
                        "hover:bg-primary/10 hover:text-primary"
                      )
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Markdown</span>
                    <span className="sm:hidden">MD</span>
                  </Button>
                  <Button
                    variant={activeTab === 'formatted' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('formatted')}
                    className={cn(
                      "flex items-center gap-1 sm:gap-2 whitespace-nowrap",
                      activeTab === 'formatted' ? (
                        "bg-primary/10 text-primary hover:bg-primary/20"
                      ) : (
                        "hover:bg-primary/10 hover:text-primary"
                      )
                    )}
                  >
                    <Table2Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">Formatted</span>
                    <span className="sm:hidden">FMT</span>
                  </Button>
                  <Button
                    variant={activeTab === 'analysis' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('analysis')}
                    className={cn(
                      "flex items-center gap-1 sm:gap-2 whitespace-nowrap",
                      activeTab === 'analysis' ? (
                        "bg-primary/10 text-primary hover:bg-primary/20"
                      ) : (
                        "hover:bg-primary/10 hover:text-primary"
                      )
                    )}
                  >
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Analysis</span>
                    <span className="sm:hidden">AI</span>
                  </Button>
                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <Card className="h-full rounded-none border-0">
                <CardContent className="p-0 h-full">
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-auto">
                      <AnimatePresence mode="wait">
                        {activeTab === 'json' && (
                          <motion.div
                            key="json"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full"
                          >
                            <div className="relative bg-muted w-full overflow-auto">
                              <div className="sticky top-0 flex justify-end p-2 bg-muted border-b z-10">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "bg-primary/10 text-primary",
                                    "hover:bg-primary/20"
                                  )}
                                  onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedDoc?.contentJson, null, 2))}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="min-w-[600px] inline-block min-h-full w-full">
                                <pre className="p-6 text-sm whitespace-pre select-text w-full">
                                  {JSON.stringify(selectedDoc?.contentJson, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'markdown' && (
                          <motion.div
                            key="markdown"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full"
                          >
                            <div className="relative bg-muted w-full overflow-auto">
                              <div className="sticky top-0 flex justify-end p-2 bg-muted border-b z-10">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "bg-primary/10 text-primary",
                                    "hover:bg-primary/20"
                                  )}
                                  onClick={() => navigator.clipboard.writeText(generateMarkdown(selectedDoc?.contentJson))}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="min-w-[600px] inline-block min-h-full w-full">
                                <pre className="p-6 text-sm whitespace-pre select-text w-full">
                                  {generateMarkdown(selectedDoc?.contentJson)}
                                </pre>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'formatted' && (
                          <motion.div
                            key="formatted"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full p-6"
                          >
                            <div className="bg-background rounded-lg">
                              {generateFormattedView(selectedDoc?.contentJson)}
                            </div>
                          </motion.div>
                        )}
                        {activeTab === 'analysis' && (
                          <motion.div
                            key="analysis"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-full w-full"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                              {/* Summary Card */}
                              <Card className="col-span-full bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedDoc?.summary}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Keywords Card */}
                              <Card className="bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Code className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium mb-3">Keywords</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedDoc?.keywords?.map((keyword: string, index: number) => (
                                          <span
                                            key={index}
                                            className="px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors cursor-default"
                                          >
                                            {keyword}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Confidence Score Card */}
                              <Card className="bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Brain className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium mb-3">AI Confidence</h3>
                                      <div className="space-y-2">
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                          <div 
                                            className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                            style={{ 
                                              width: `${(selectedDoc?.rawJson?.analysis?.confidenceScore || 0) * 100}%` 
                                            }}
                                          />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {((selectedDoc?.rawJson?.analysis?.confidenceScore || 0) * 100).toFixed(1)}% confidence in analysis
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Insights Card */}
                              <Card className="col-span-full bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-colors">
                                <CardContent className="pt-6">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Table2Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium mb-3">Key Insights</h3>
                                      <div className="grid gap-3">
                                        {selectedDoc?.rawJson?.analysis?.insights?.map((insight: string, index: number) => (
                                          <div 
                                            key={index}
                                            className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                          >
                                            <div className="flex-shrink-0 h-1.5 w-1.5 mt-2 rounded-full bg-primary" />
                                            <p className="text-sm text-muted-foreground flex-1">
                                              {insight}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 