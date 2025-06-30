"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  Eye, 
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Table,
  Brain,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHistory, HistoryEntry } from '@/hooks/use-history';
import { useToast } from '@/hooks/use-toast';

interface HistorySidebarProps {
  documentName?: string;
  currentPageNumber?: number;
}

export function HistorySidebar({ documentName, currentPageNumber }: HistorySidebarProps) {
  const { history, removeHistoryEntry, clearHistory, searchHistory, getHistoryByType } = useHistory();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'summary' | 'quick-format' | 'template-format'>('all');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    summary: true,
    'quick-format': true,
    'template-format': true
  });
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter history based on search and type
  const filteredHistory = React.useMemo(() => {
    let filtered = searchQuery ? searchHistory(searchQuery) : history;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Group by type for display
    const grouped = filtered.reduce((acc, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = [];
      }
      acc[entry.type].push(entry);
      return acc;
    }, {} as Record<string, HistoryEntry[]>);

    return grouped;
  }, [history, searchQuery, filterType, searchHistory]);

  const getTypeIcon = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'summary': return <Brain className="h-4 w-4" />;
      case 'quick-format': return <Table className="h-4 w-4" />;
      case 'template-format': return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'summary': return 'Summaries';
      case 'quick-format': return 'Quick Formats';
      case 'template-format': return 'Template Formats';
    }
  };

  const getTypeColor = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'summary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'quick-format': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'template-format': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const handleCopyContent = async (entry: HistoryEntry) => {
    try {
      let textToCopy = '';
      
      if (entry.type === 'summary') {
        textToCopy = typeof entry.content === 'string' ? entry.content : entry.content?.summary || JSON.stringify(entry.content);
      } else if (entry.type === 'quick-format' || entry.type === 'template-format') {
        // For formatted content, try to extract meaningful text
        const content = entry.content?.analysis?.content || entry.content?.content || entry.content;
        if (typeof content === 'string') {
          textToCopy = content;
        } else {
          textToCopy = JSON.stringify(content, null, 2);
        }
      }
      
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: "Content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy content to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleViewEntry = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setIsPreviewOpen(true);
  };

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getPreviewContent = (entry: HistoryEntry) => {
    if (entry.type === 'summary') {
      return typeof entry.content === 'string' ? entry.content : entry.content?.summary || 'No summary available';
    } else if (entry.type === 'quick-format' || entry.type === 'template-format') {
      const content = entry.content?.analysis?.content || entry.content?.content || entry.content;
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
      return content || 'No content available';
    }
    return 'No content available';
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Results History
          </CardTitle>
          
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="summary">Summaries</SelectItem>
                  <SelectItem value="quick-format">Quick Format</SelectItem>
                  <SelectItem value="template-format">Templates</SelectItem>
                </SelectContent>
              </Select>
              
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4 pt-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">No results yet</p>
              <p className="text-xs">Use summary, quick format, or template format to see results here</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {Object.entries(filteredHistory).map(([type, entries]) => (
                  <div key={type}>
                    <Collapsible
                      open={expandedSections[type]}
                      onOpenChange={() => toggleSection(type)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto font-medium text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type as HistoryEntry['type'])}
                            {getTypeLabel(type as HistoryEntry['type'])}
                            <Badge variant="secondary" className="text-xs">
                              {entries.length}
                            </Badge>
                          </div>
                          {expandedSections[type] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-2 mt-2">
                        {entries.map((entry) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <Card className="p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium truncate" title={entry.title}>
                                      {entry.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant="secondary" 
                                        className={`text-xs ${getTypeColor(entry.type)}`}
                                      >
                                        {entry.type}
                                      </Badge>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatTimestamp(entry.timestamp)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-muted-foreground overflow-hidden" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}>
                                  {entry.selectedText.length > 100 
                                    ? `${entry.selectedText.substring(0, 100)}...` 
                                    : entry.selectedText}
                                </p>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewEntry(entry)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyContent(entry)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeHistoryEntry(entry.id)}
                                    className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry && getTypeIcon(selectedEntry.type)}
              {selectedEntry?.title}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className={getTypeColor(selectedEntry.type)}>
                  {selectedEntry.type}
                </Badge>
                <span>•</span>
                <span>{formatTimestamp(selectedEntry.timestamp)}</span>
                {selectedEntry.pageNumber && (
                  <>
                    <span>•</span>
                    <span>Page {selectedEntry.pageNumber}</span>
                  </>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Text:</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    {selectedEntry.selectedText}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Result:</h4>
                  <ScrollArea className="max-h-96">
                    <pre className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                      {getPreviewContent(selectedEntry)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 