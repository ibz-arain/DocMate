"use client";

import { useState } from "react";
import { DocumentState } from "@/types/document";
import { CustomSidebar } from "@/components/custom-sidebar";
import { DocumentSection } from "@/components/document/document-section";
import { DocumentViewer } from "@/components/document/document-viewer";
import { DocumentInfo } from "@/components/document/document-info";
import { useAuthContext } from "@/components/auth-provider";
import { createInitialState } from "@/components/document/document-utils";
import { processDocument } from "@/components/document/document-processor";
import { downloadJson, downloadMarkdown, downloadCsv } from "@/components/document/document-utils";
import { generateMarkdown } from "@/lib/document-utils";
import { toast } from "@/components/ui/use-toast";
import Head from "next/head";

export default function ProcessPage() {
  const [documentState, setDocumentState] = useState<DocumentState>(createInitialState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'json' | 'markdown' | 'formatted' | 'analysis'>('json');
  const { user } = useAuthContext();

  const updateDocumentState = (updates: Partial<DocumentState>) => {
    setDocumentState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleProcessDocument = (customPrompt: string = "", outputFormat: any = {}) => {
    processDocument(
      documentState,
      updateDocumentState,
      setIsProcessing,
      setProgress,
      { customPrompt, outputFormat }
    );
  };

  const handleDownloadJson = () => {
    downloadJson(documentState.selectedDoc, documentState.file?.name || 'document');
  };

  const handleDownloadMarkdown = () => {
    downloadMarkdown(documentState.selectedDoc, documentState.file?.name || 'document', generateMarkdown);
  };

  const handleDownloadCsv = () => {
    downloadCsv(documentState.selectedDoc, documentState.file?.name || 'document');
  };

  const handleSaveDocument = async (documentName?: string) => {
    if (!user || !documentState.selectedDoc?.contentJson || documentState.isSaved) return;

    try {
      setIsProcessing(true);
      const contentWithAnalysis = {
        ...documentState.selectedDoc.contentJson,
        analysis: {
          summary: documentState.selectedDoc.summary,
          keywords: documentState.selectedDoc.keywords,
          insights: documentState.selectedDoc.rawJson?.analysis?.insights || [],
          confidenceScore: documentState.selectedDoc.rawJson?.analysis?.confidenceScore || 0,
          documentType: documentState.selectedDoc.contentJson.documentType
        }
      };

      const documentType = documentState.selectedDoc.contentJson.documentType;
      const defaultTitle = documentState.file?.name || `${documentType} Document`;
      const title = documentName || defaultTitle;

      const documentData = {
        title: title,
        type: documentType,
        date: new Date().toISOString(),
        confidence: documentState.selectedDoc.rawJson?.analysis?.confidenceScore ? 
          Math.round(documentState.selectedDoc.rawJson.analysis.confidenceScore * 100) : 95,
        contentJson: contentWithAnalysis
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save document');
      }

      updateDocumentState({ isSaved: true });
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewDocument = () => {
    setDocumentState(createInitialState());
  };

  // Document processing section
  if (!documentState.isProcessed) {
    return (
      <>
        <Head>
          <title>Process Document | DocuMate</title>
          <meta name="description" content="Upload and process your documents" />
        </Head>
        <div className="flex h-full overflow-hidden bg-background">
          <CustomSidebar
            selectedType="document"
          />
          <div className="flex-1 overflow-auto">
            <DocumentSection
              currentState={documentState}
              onFileChange={(file) => {
                updateDocumentState({
                  file,
                  isProcessed: false,
                  error: null
                });
              }}
              onProcess={handleProcessDocument}
              isProcessing={isProcessing}
              progress={progress}
            />
          </div>
        </div>
      </>
    );
  }

  // Document results view
  return (
    <>
      <Head>
        <title>Document Results | DocuMate</title>
        <meta name="description" content="View your processed document results" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          selectedType="document"
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto md:pt-6 md:pr-6 md:px-0 pt-14 px-4">
            <div className="grid pl-6 gap-6 pb-6 h-full lg:grid-cols-[minmax(0,_2fr)_minmax(250px,_300px)] grid-cols-1">
              <DocumentViewer
                currentState={documentState}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              <DocumentInfo
                currentState={documentState}
                isProcessing={isProcessing}
                user={user}
                onDownloadJson={handleDownloadJson}
                onDownloadMarkdown={handleDownloadMarkdown}
                onDownloadCsv={handleDownloadCsv}
                onSaveDocument={handleSaveDocument}
                onNewDocument={handleNewDocument}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 