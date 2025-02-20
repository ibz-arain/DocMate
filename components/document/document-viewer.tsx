import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, FileText, TableIcon, Brain, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMarkdown, generateFormattedView } from "@/lib/document-utils";
import { DocumentState } from "@/types/document";

interface DocumentViewerProps {
  currentState: DocumentState;
  activeTab: 'json' | 'markdown' | 'formatted' | 'analysis';
  onTabChange: (tab: 'json' | 'markdown' | 'formatted' | 'analysis') => void;
}

export function DocumentViewer({
  currentState,
  activeTab,
  onTabChange,
}: DocumentViewerProps) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 pl-6 pr-6 flex flex-col h-full">
        <div className="flex items-center justify-end gap-1 sm:gap-2 mb-6 flex-none overflow-x-auto pb-2 -mx-6 px-6">
          <Button
            variant={activeTab === 'json' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('json')}
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
            <span className="sm:hidden">JS</span>
          </Button>
          <Button
            variant={activeTab === 'markdown' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('markdown')}
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Markdown</span>
            <span className="sm:hidden">MD</span>
          </Button>
          <Button
            variant={activeTab === 'formatted' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('formatted')}
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"
          >
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Formatted</span>
            <span className="sm:hidden">FMT</span>
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('analysis')}
            className="flex items-center gap-1 sm:gap-2 whitespace-nowrap"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis</span>
            <span className="sm:hidden">AI</span>
          </Button>
        </div>
        <div className="flex-1 min-h-0 relative">
          <div className="h-[calc(100vh-10rem)]">
            <AnimatePresence mode="wait">
              {activeTab === 'json' && (
                <motion.div
                  key="json"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative h-full"
                >
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar]:absolute [&::-webkit-scrollbar]:right-0">
                    <div className="relative bg-muted min-w-[600px]">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 z-10 opacity-70 hover:opacity-100"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(currentState.selectedDoc?.contentJson, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="p-6 text-sm break-all whitespace-pre-wrap select-text">
                        {JSON.stringify(currentState.selectedDoc?.contentJson, null, 2)}
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
                  className="relative h-full"
                >
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar]:absolute [&::-webkit-scrollbar]:right-0">
                    <div className="relative bg-muted">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2 z-10 opacity-70 hover:opacity-100"
                        onClick={() => navigator.clipboard.writeText(generateMarkdown(currentState.selectedDoc?.contentJson))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="p-6 text-sm whitespace-pre select-text">
                        {generateMarkdown(currentState.selectedDoc?.contentJson)}
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
                  className="relative h-full"
                >
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-track]:bg-muted">
                    <div className="bg-background rounded-lg p-2">
                      {generateFormattedView(currentState.selectedDoc?.contentJson)}
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-background rounded-lg p-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentState.selectedDoc?.summary}
                      </p>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentState.selectedDoc?.keywords?.map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Insights</h3>
                      <div className="space-y-2">
                        {currentState.selectedDoc?.rawJson?.analysis?.insights?.map((insight: string, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            • {insight}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 