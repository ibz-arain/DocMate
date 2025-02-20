import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, RefreshCcw, Zap, FileText } from "lucide-react";
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
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB max size
    multiple: false,
    noClick: currentState.file !== null // Disable click when file is selected
  });

  const handleChangeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open file selector dialog
    open();
  };

  const handleProcessDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProcessDocument();
  };

  if (!selectedType) {
    return (
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Select a Document Type</h2>
          <p className="text-muted-foreground">
            Please select a document type from the sidebar to begin.
          </p>
        </div>
      </Card>
    );
  }

  const documentLabel = documentTypeLabels[selectedType];

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <h2 className="text-2xl font-bold">{documentLabel.title}</h2>
          <p className="text-muted-foreground">{documentLabel.description}</p>
        </div>

        {/* Dropzone area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${currentState.file ? 'bg-muted/50' : ''}
            transition-colors duration-200 cursor-pointer
            hover:border-primary hover:bg-primary/5
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className={`h-12 w-12 ${currentState.file ? 'text-primary' : 'text-muted-foreground'}`} />
            {currentState.file ? (
              <div>
                <p className="font-medium text-primary">{currentState.file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(currentState.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">
                  {isDragActive ? "Drop the file here" : "Drag & drop your file here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select a file
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground mt-4">
                  <span className="px-2 py-1 rounded-full bg-muted">PNG</span>
                  <span className="px-2 py-1 rounded-full bg-muted">JPG</span>
                  <span className="px-2 py-1 rounded-full bg-muted">PDF</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {currentState.error && (
          <div className="text-destructive text-center text-sm">
            {currentState.error}
          </div>
        )}

        {/* Action buttons */}
        {currentState.file && (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleChangeFile}
              disabled={isProcessing}
            >
              Change File
            </Button>
            <Button
              onClick={handleProcessDocument}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Process Document"}
            </Button>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Processing document... {progress}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 