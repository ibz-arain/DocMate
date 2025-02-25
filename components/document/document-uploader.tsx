import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, RefreshCcw, Zap, FileText, ReceiptText, Building2, Stethoscope, BatteryCharging } from "lucide-react";
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
  onSelectType?: (type: DocumentType) => void;
}

const documentTypeIcons = {
  't4': <FileText className="h-8 w-8" />,
  'bank': <Building2 className="h-8 w-8" />,
  'receipt': <ReceiptText className="h-8 w-8" />,
  'dental': <Stethoscope className="h-8 w-8" />,
  'electricity': <BatteryCharging className="h-8 w-8" />,
};

export function DocumentUploader({
  selectedType,
  currentState,
  isProcessing,
  progress,
  onProcessDocument,
  onFileChange,
  onSelectType,
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
    open();
  };

  const handleProcessDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProcessDocument();
  };

  if (!selectedType) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Select a Document Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(documentTypeLabels).map(([type, info]) => {
            if (type === 'history') return null;
            return (
              <Card
                key={type}
                className="p-6 hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => onSelectType?.(type as DocumentType)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {documentTypeIcons[type as keyof typeof documentTypeIcons]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                    <p className="text-muted-foreground text-sm">{info.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
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
              className={cn(
                "bg-primary/10 text-primary",
                "hover:bg-primary/20"
              )}
            >
              {isProcessing ? "Processing..." : "Process Document"}
            </Button>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-3">
            <Progress 
              value={progress} 
              className={cn(
                "h-2 transition-all",
                progress === 100 ? "duration-150" : "duration-[800ms]"
              )}
            />
            <div className="text-center space-y-1">
              <p className={cn(
                "text-sm font-medium transition-colors duration-200",
                progress === 100 ? "text-primary" : "text-primary/80"
              )}>
                {progress < 35 && "Preparing document..."}
                {progress >= 35 && progress < 73 && "Analyzing content..."}
                {progress >= 73 && progress < 89 && "Processing results..."}
                {progress >= 89 && progress < 99 && "Finalizing..."}
                {progress >= 99 && progress < 100 && "Almost ready..."}
                {progress === 100 && "Opening document..."}
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% complete
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 