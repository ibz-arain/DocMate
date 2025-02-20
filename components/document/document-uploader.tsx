import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, RefreshCcw, Zap } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DocumentState, DocumentType, documentTypeLabels } from "@/types/document";

interface DocumentUploaderProps {
  selectedType: DocumentType;
  currentState: DocumentState;
  isProcessing: boolean;
  progress: number;
  onProcessDocument: () => void;
  onFileChange: (file: File | null) => void;
}

export function DocumentUploader({
  selectedType,
  currentState,
  isProcessing,
  progress,
  onProcessDocument,
  onFileChange,
}: DocumentUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileChange(file);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB max size
    multiple: false
  });

  if (!selectedType) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please select a document type from the sidebar to begin</p>
      </div>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {documentTypeLabels[selectedType].title}
        </CardTitle>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground mt-2"
        >
          {documentTypeLabels[selectedType].description}
        </motion.div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentState.error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {currentState.error}
            </div>
          )}
          <Card className="relative border-2 border-dashed transition-all duration-200 hover:border-primary/50">
            <CardContent className="p-0">
              <div
                {...getRootProps()}
                className={cn(
                  "relative min-h-[300px] flex flex-col items-center justify-center gap-4 p-8 transition-all duration-200",
                  "cursor-pointer rounded-lg",
                  isDragActive ? "bg-primary/10 border-primary" : "hover:bg-primary/5",
                  "group"
                )}
              >
                {currentState.file ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-full max-w-xl bg-muted/50 rounded-lg border-2 border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentState.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(currentState.file.size / 1024 / 1024).toFixed(2)} MB · {currentState.file.type.split('/')[1].toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFileChange(null);
                            }}
                          >
                            Change File
                          </Button>
                          <Button
                            onClick={onProcessDocument}
                            disabled={isProcessing}
                            size="sm"
                            className={cn(
                              "transition-all duration-500",
                              isProcessing ? "bg-primary/10 text-primary" : "bg-primary"
                            )}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin mr-2">
                                  <RefreshCcw className="h-4" />
                                </div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-4 w-4" />
                                Process Document
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4"
                        >
                          <Progress value={progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Analyzing document...
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Upload className={cn(
                        "h-12 w-12 transition-all duration-200",
                        isDragActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                      )} />
                    </div>
                    <div className="space-y-2 text-center relative">
                      <p className={cn(
                        "text-lg font-medium transition-colors duration-200",
                        isDragActive ? "text-primary" : "text-foreground"
                      )}>
                        Drop your {documentTypeLabels[selectedType].title.toLowerCase()} here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                      <div className={cn(
                        "flex flex-wrap gap-2 justify-center text-xs text-muted-foreground mt-4",
                        isDragActive && "text-primary/70"
                      )}>
                        <span className="px-2 py-1 rounded-full bg-muted">PNG</span>
                        <span className="px-2 py-1 rounded-full bg-muted">JPG</span>
                        <span className="px-2 py-1 rounded-full bg-muted">JPEG</span>
                        <span className="px-2 py-1 rounded-full bg-muted">GIF</span>
                        <span className="px-2 py-1 rounded-full bg-muted">WebP</span>
                        <span className="px-2 py-1 rounded-full bg-muted">PDF</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Maximum file size: 10MB
                      </p>
                    </div>
                  </>
                )}
                <input {...getInputProps()} />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 