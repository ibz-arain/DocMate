"use client";

import { useState } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import { CustomAPISection } from "@/components/document/templates-editor";
import { DocumentState } from "@/types/document";
import { createInitialState } from "@/components/document/document-utils";
import { processDocument } from "@/components/document/document-processor";
import Head from "next/head";

export default function TemplatesPage() {
  const [documentState, setDocumentState] = useState<DocumentState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcessDocument = (customPrompt: string = "", outputFormat: any = {}) => {
    processDocument(
      documentState,
      (updates) => setDocumentState(prev => ({ ...prev, ...updates })),
      setIsProcessing,
      setProgress,
      { customPrompt, outputFormat }
    );
  };

  return (
    <>
      <Head>
        <title>Template Editor | DocuMate</title>
        <meta name="description" content="Create and manage document processing templates" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          selectedType="template"
        />
        <div className="flex-1 overflow-auto p-6">
          <CustomAPISection
            currentState={documentState}
            onFileChange={(file) => {
              setDocumentState(prev => ({
                ...prev,
                file,
                isProcessed: false,
                error: null
              }));
            }}
            onProcess={handleProcessDocument}
            isProcessing={isProcessing}
            progress={progress}
            templateType="template"
          />
        </div>
      </div>
    </>
  );
} 