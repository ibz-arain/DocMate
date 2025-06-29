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
  Upload,
} from "lucide-react";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";

export default function DocumentPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropText, setDropText] = useState("Drag & drop your PDF here");
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  
  // Zoom feedback states
  const [showZoomFeedback, setShowZoomFeedback] = useState(false);
  const zoomFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Smooth zoom states
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingScaleRef = useRef<number>(scale);

  const dropTexts = [
    "Drag & drop your PDF here",
    "Let's edit your document",
    "Drop it like it's hot",
    "Your PDF's new home",
    "Ready when you are"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDropText(prev => {
        const currentIndex = dropTexts.indexOf(prev);
        return dropTexts[(currentIndex + 1) % dropTexts.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Clean up URL object when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      if (zoomFeedbackTimeoutRef.current) {
        clearTimeout(zoomFeedbackTimeoutRef.current);
      }
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, [pdfUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfUrl) return;

      // Page navigation
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        nextPage();
      }
      // Home/End for first/last page
      else if (e.key === 'Home') {
        e.preventDefault();
        setPageNumber(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        setPageNumber(numPages || 1);
      }
             // Zoom shortcuts
       else if (e.key === '=' || e.key === '+') {
         if (e.ctrlKey || e.metaKey) {
           e.preventDefault();
           const currentScale = isZooming ? pendingScaleRef.current : scale;
           const newScale = Math.min(currentScale * 1.2, 3.0);
           updateZoomSmooth(newScale);
           showZoomFeedbackBriefly();
         }
       } else if (e.key === '-') {
         if (e.ctrlKey || e.metaKey) {
           e.preventDefault();
           const currentScale = isZooming ? pendingScaleRef.current : scale;
           const newScale = Math.max(currentScale * 0.8, 0.5);
           updateZoomSmooth(newScale);
           showZoomFeedbackBriefly();
         }
       } else if (e.key === '0') {
         if (e.ctrlKey || e.metaKey) {
           e.preventDefault();
           updateZoomSmooth(1.0);
           showZoomFeedbackBriefly();
         }
       }
      // Rotation
      else if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          rotate();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pdfUrl, numPages, pageNumber, scale]);

  // Smooth zoom update function
  const updateZoomSmooth = (newScale: number) => {
    pendingScaleRef.current = newScale;
    setIsZooming(true);
    
    // Clear existing timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    
    // Debounce the actual scale update to reduce re-renders
    zoomTimeoutRef.current = setTimeout(() => {
      setScale(pendingScaleRef.current);
      setIsZooming(false);
    }, 16); // ~60fps update rate
  };

  // Native zoom functionality
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    // Mouse wheel zoom with Ctrl key
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05; // Smaller increments for smoother zoom
        const currentScale = pendingScaleRef.current;
        const newScale = Math.max(0.5, Math.min(3.0, currentScale * zoomFactor));
        
        updateZoomSmooth(newScale);
        showZoomFeedbackBriefly();
      }
    };

    // Touch events for pinch-to-zoom
    let initialDistance = 0;
    let initialScale = scale;
    let isGesturing = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = pendingScaleRef.current;
        isGesturing = true;
        setShowZoomFeedback(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isGesturing) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (initialDistance > 0) {
          const scaleMultiplier = currentDistance / initialDistance;
          const newScale = Math.max(0.5, Math.min(3.0, initialScale * scaleMultiplier));
          updateZoomSmooth(newScale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isGesturing = false;
        setShowZoomFeedback(false);
        initialDistance = 0;
        
        // Ensure final scale is committed
        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current);
          setScale(pendingScaleRef.current);
          setIsZooming(false);
        }
      }
    };

    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileDrop(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleFileDrop = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }
    
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    setPdfFile(file);
    const newUrl = URL.createObjectURL(file);
    setPdfUrl(newUrl);
    setPageNumber(1);
    setScale(1.0); // Reset zoom when loading new document
    setRotation(0); // Reset rotation
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
    
    // Show helpful toast for first-time users
    toast({
      title: "PDF Loaded Successfully",
      description: "Use Ctrl+Scroll to zoom, arrow keys to navigate, or scroll naturally",
      duration: 5000,
    });
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const showZoomFeedbackBriefly = () => {
    setShowZoomFeedback(true);
    if (zoomFeedbackTimeoutRef.current) {
      clearTimeout(zoomFeedbackTimeoutRef.current);
    }
    zoomFeedbackTimeoutRef.current = setTimeout(() => {
      setShowZoomFeedback(false);
    }, 1000);
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
    const currentScale = isZooming ? pendingScaleRef.current : scale;
    const newScale = Math.min(currentScale * 1.2, 3.0);
    updateZoomSmooth(newScale);
    showZoomFeedbackBriefly();
  };

  const zoomOut = () => {
    const currentScale = isZooming ? pendingScaleRef.current : scale;
    const newScale = Math.max(currentScale * 0.8, 0.5);
    updateZoomSmooth(newScale);
    showZoomFeedbackBriefly();
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetZoom = () => {
    updateZoomSmooth(1.0);
    showZoomFeedbackBriefly();
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
        
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="grid gap-6 h-full lg:grid-cols-[1fr_auto] grid-cols-1">
            {/* PDF Viewer Card with Floating Controls */}
            <Card className="shadow-sm overflow-hidden relative" ref={pdfContainerRef}>
              <CardContent className="p-0 h-full overflow-auto">
                {!pdfUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-dots-primary/15">
                    {/* Dynamic Text Above Upload */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={dropText}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center mb-8"
                      >
                        <p className="text-2xl font-medium text-primary">
                          {isDragActive ? "Drop it right here!" : dropText}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Document Upload */}
                    <div
                      {...getRootProps()}
                      className={cn(
                        "flex flex-col items-center justify-center py-12 px-8",
                        "transition-all duration-300 w-full max-w-md",
                        "border-2 border-dashed rounded-lg",
                        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50",
                        "group cursor-pointer relative overflow-hidden"
                      )}
                    >
                      <input {...getInputProps()} />
                      <motion.div 
                        className="space-y-6 text-center relative z-10"
                        animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                      >
                        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            Select or drop your PDF
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            PDF files up to 10MB
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">PDF</span>
                        </div>
                      </motion.div>
                      
                      {/* Animated background gradient */}
                      <div 
                        className={cn(
                          "absolute inset-0 transition-opacity duration-300",
                          isDragActive ? "opacity-100" : "opacity-0",
                          "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
                        )}
                        style={{
                          backgroundSize: '400% 400%',
                          animation: 'gradient 15s ease infinite',
                        }}
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
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={prevPage} disabled={pageNumber <= 1} className="h-8 w-8">
                              <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Previous page (← or Page Up)</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <span className="text-sm min-w-[4.5rem] text-center font-medium">
                          {pageNumber} / {numPages || '?'}
                        </span>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={nextPage} disabled={pageNumber >= (numPages || 1)} className="h-8 w-8">
                              <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Next page (→ or Page Down)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Floating Zoom Controls */}
                    <div className="absolute top-2 right-2 z-10 flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-md">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5} className="h-8 w-8">
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Zoom out (Ctrl + Scroll)</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={resetZoom}
                              className="h-8 px-2 min-w-[3rem]"
                            >
                              <span className={cn(
                                "text-xs font-medium transition-colors",
                                showZoomFeedback && "text-primary"
                              )}>
                                {Math.round((isZooming ? pendingScaleRef.current : scale) * 100)}%
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Reset zoom to 100%</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3.0} className="h-8 w-8">
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Zoom in (Ctrl + Scroll)</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="w-px h-6 bg-border mx-1" />
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={rotate} className="h-8 w-8">
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Rotate page</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}

                    {/* Zoom Feedback Overlay */}
                    <AnimatePresence>
                      {showZoomFeedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                        >
                          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                              </div>
                              <span className="text-lg font-medium text-primary">
                                {Math.round((isZooming ? pendingScaleRef.current : scale) * 100)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
              <CardContent className=" flex flex-col h-full items-center gap-1">
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

      {/* CSS for animated gradient background */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .bg-dots-primary\/15 {
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--primary) / 0.15) 2px, transparent 0);
          background-size: 40px 40px;
          background-position: center;
        }
      `}</style>
    </>
  );
} 