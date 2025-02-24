import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, FileText, TableIcon, Brain, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMarkdown, generateFormattedView } from "@/lib/document-utils";
import { DocumentState } from "@/types/document";
import { cn } from "@/lib/utils";

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
            onClick={() => onTabChange('markdown')}
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
            onClick={() => onTabChange('formatted')}
            className={cn(
              "flex items-center gap-1 sm:gap-2 whitespace-nowrap",
              activeTab === 'formatted' ? (
                "bg-primary/10 text-primary hover:bg-primary/20"
              ) : (
                "hover:bg-primary/10 hover:text-primary"
              )
            )}
          >
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Formatted</span>
            <span className="sm:hidden">FMT</span>
          </Button>
          <Button
            variant={activeTab === 'analysis' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('analysis')}
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
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar]:absolute [&::-webkit-scrollbar]:right-0">
                    <div className="relative bg-muted min-w-[600px] w-full">
                      <div className="sticky top-2 flex justify-end pr-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "bg-primary/10 text-primary",
                            "hover:bg-primary/20"
                          )}
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(currentState.selectedDoc?.contentJson, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="p-6 text-sm whitespace-pre-wrap break-words select-text w-full bg-muted">
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
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar]:absolute [&::-webkit-scrollbar]:right-0">
                    <div className="relative bg-muted min-w-[600px] w-full">
                      <div className="sticky top-2 flex justify-end pr-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "bg-primary/10 text-primary",
                            "hover:bg-primary/20"
                          )}
                          onClick={() => navigator.clipboard.writeText(generateMarkdown(currentState.selectedDoc?.contentJson))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="p-6 text-sm whitespace-pre select-text w-full bg-muted overflow-x-auto">
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
                  <div className="h-full overflow-auto scrollbar-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-track]:bg-muted">
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
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
                >
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
                            {currentState.selectedDoc?.summary}
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
                            {currentState.selectedDoc?.keywords?.map((keyword: string, index: number) => (
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
                                  width: `${(currentState.selectedDoc?.rawJson?.analysis?.confidenceScore || 0) * 100}%` 
                                }}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {((currentState.selectedDoc?.rawJson?.analysis?.confidenceScore || 0) * 100).toFixed(1)}% confidence in analysis
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
                          <TableIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium mb-3">Key Insights</h3>
                          <div className="grid gap-3">
                            {currentState.selectedDoc?.rawJson?.analysis?.insights?.map((insight: string, index: number) => (
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 