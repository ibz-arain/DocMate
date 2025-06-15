"use client";

import { useState, useEffect, useRef } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  MinusIcon,
  RotateCw,
  ChevronLeftIcon,
  ChevronRightIcon,
  PenLine as PenLineIcon,
  FileSignature as SignatureIcon,
  Highlighter as HighlighterIcon,
  Eye as EyeIcon,
  Scissors as ScissorsIcon,
  FileText as FileTextIcon,
} from "lucide-react";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DocumentPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const lastPageChangeRef = useRef<number>(0);

  // Clean up URL object when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFileDrop = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    setPdfFile(file);
    const newUrl = URL.createObjectURL(file);
    setPdfUrl(newUrl);
    setPageNumber(1);
    setIsLoading(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileDrop(e.target.files[0]);
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const handlePageChange = (newPage: number) => {
    // Debounce page changes to prevent flickering
    const now = Date.now();
    if (now - lastPageChangeRef.current > 300) {
      setPageNumber(newPage);
      lastPageChangeRef.current = now;
    }
  };

  const nextPage = () => {
    if (pageNumber < (numPages || 1)) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const tools = [
    { id: 'view', label: 'View', icon: <EyeIcon className="h-5 w-5" /> },
    { id: 'annotate', label: 'Annotate', icon: <PenLineIcon className="h-5 w-5" /> },
    { id: 'sign', label: 'Sign', icon: <SignatureIcon className="h-5 w-5" /> },
    { id: 'highlight', label: 'Highlight', icon: <HighlighterIcon className="h-5 w-5" /> },
    { id: 'redact', label: 'Redact', icon: <ScissorsIcon className="h-5 w-5" /> },
    { id: 'extract', label: 'Extract', icon: <FileTextIcon className="h-5 w-5" /> }
  ];

  return (
    <>
      <Head>
        <title>Document Editor | DocMate</title>
        <meta name="description" content="Edit and manage your PDF documents" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="document" />
        
        <main className="flex-1 flex flex-col overflow-hidden p-2 md:p-4">
            <div className="grid gap-2 h-full lg:grid-cols-[1fr_auto] grid-cols-1">
            {/* PDF Viewer Card with Floating Controls */}
            <Card className="shadow-sm overflow-hidden relative">
                <CardContent className="p-0 h-full">
                  {!pdfUrl ? (
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center p-8"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileDrop(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <div className="w-full max-w-md p-6 border-2 border-dashed border-border rounded-lg text-center">
                        <p className="text-muted-foreground mb-4">Drop PDF here or select a file</p>
                        <Input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={handleFileChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                    {/* Floating Document Info */}
                    {pdfFile && (
                      <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                        <p className="text-sm font-medium truncate max-w-[180px]">{pdfFile.name}</p>
                      </div>
                    )}
                    
                    {/* Floating Page Navigation Controls */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-md">
                      <Button variant="ghost" size="icon" onClick={prevPage} disabled={pageNumber <= 1} className="h-8 w-8">
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <span className="text-sm min-w-[4.5rem] text-center">
                        {pageNumber} / {numPages || '?'}
                      </span>
                      <Button variant="ghost" size="icon" onClick={nextPage} disabled={pageNumber >= (numPages || 1)} className="h-8 w-8">
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Floating Zoom Controls */}
                    <div className="absolute top-2 right-2 z-10 flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-md">
                      <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom out" className="h-8 w-8">
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
                      <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom in" className="h-8 w-8">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={rotate} title="Rotate" className="h-8 w-8">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>

                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      <div className="absolute inset-0">
                        <PdfViewer
                          file={pdfUrl}
                          pageNumber={pageNumber}
                          scale={scale}
                          rotation={rotation}
                          onDocumentLoadSuccess={handleDocumentLoadSuccess}
                          onLoadError={(error) => {
                            console.error("Error loading PDF:", error);
                            setIsLoading(false);
                          }}
                        onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tools Sidebar Card */}
              <Card className="shadow-sm flex flex-col h-full w-[60px]">
                <CardContent className="p-2 flex flex-col h-full items-center gap-1">
                  <TooltipProvider delayDuration={0}>
                    {tools.map(tool => (
                      <Tooltip key={tool.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={selectedTool === tool.id ? "default" : "ghost"}
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleToolSelect(tool.id)}
                          >
                            {tool.icon}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" align="center">
                          <p>{tool.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}

                    {pdfFile && (
                      <div className="mt-auto pt-2 border-t border-border w-full flex justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                            >
                              <FileTextIcon className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" align="center">
                            <p className="font-medium">{pdfFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </TooltipProvider>
                </CardContent>
              </Card>
          </div>
        </main>
      </div>
    </>
  );
} 