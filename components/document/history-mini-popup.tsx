"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Clock,
  Brain,
  Table,
  FileText,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useHistory, HistoryEntry } from '@/components/history-provider';
import { useToast } from '@/hooks/use-toast';

interface HistoryMiniPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  onOpenEntry: (entry: HistoryEntry) => void;
}

export function HistoryMiniPopup({ isOpen, onClose, position, onOpenEntry }: HistoryMiniPopupProps) {
  const { history, removeHistoryEntry } = useHistory();
  const { toast } = useToast();

  // Show latest 5 entries
  const recentHistory = history.slice(0, 5);

  const getTypeIcon = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'summary': return <Brain className="h-3 w-3" />;
      case 'quick-format': return <Table className="h-3 w-3" />;
      case 'template-format': return <FileText className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'summary': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'quick-format': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'template-format': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
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



  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.2 }}
          className="fixed z-50 w-72"
          style={{
            bottom: `${window.innerHeight - position.top - 50}px`, // Position at the same level as the button (40px is button height)
            left: position.left - 305, // Position to the left of the button with small gap
          }}
        >
            <Card className="shadow-lg border-2">
              <CardContent className="p-0">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <History className="h-6 w-6 mb-2 opacity-50" />
                    <p className="text-xs font-medium">No results yet</p>
                    <p className="text-xs opacity-75">Use analysis tools to see results here</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-2 space-y-1">
                    {recentHistory.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 bg-muted/20 hover:bg-muted/40 transition-colors rounded-md cursor-pointer"
                        onClick={() => onOpenEntry(entry)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {getTypeIcon(entry.type)}
                                <span className="text-xs font-medium truncate" title={entry.title}>
                                  {entry.title.length > 25 ? `${entry.title.substring(0, 25)}...` : entry.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-1 py-0 ${getTypeColor(entry.type)}`}
                              >
                                {entry.type}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeHistoryEntry(entry.id);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                                          ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        </motion.div>
      </AnimatePresence>


    </>
  );
} 