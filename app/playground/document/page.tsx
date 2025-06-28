"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [committedScale, setCommittedScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dropText, setDropText] = useState("Drag & drop your PDF here");
  const lastPageChangeRef = useRef<number>(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [isLiveZooming, setIsLiveZooming] = useState(false);
  const [showZoomHint, setShowZoomHint] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetScale = useCallback((newScale: number | ((prev: number) => number)) => {
    setScale(prev => {
      const value = typeof newScale === 'function' ? newScale(prev) : newScale;
      const clampedValue = Math.max(0.5, Math.min(2.0, value));

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
  
      debounceTimeoutRef.current = setTimeout(() => {
        setCommittedScale(clampedValue);
        setIsLiveZooming(false);
      }, 300);

      return clampedValue;
    });
  }, []);

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
    };
  }, [pdfUrl]);

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
    
    // Show zoom hint for a few seconds when document loads
    setShowZoomHint(true);
    setTimeout(() => setShowZoomHint(false), 4000);
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
    handleSetScale(prev => prev + 0.1);
  };

  const zoomOut = () => {
    handleSetScale(prev => prev - 0.1);
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Native zoom functionality
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container || !pdfUrl) return;

    let lastTouchDistance = 0;
    let isZooming = false;

    // Mouse wheel / trackpad zoom
    const handleWheel = (e: WheelEvent) => {
      // Check if Ctrl/Cmd key is pressed (for desktop) or detect pinch gesture
      const isPinchGesture = e.ctrlKey || e.metaKey;
      const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      
      if (isPinchGesture || (isHorizontalScroll && Math.abs(e.deltaY) < 10)) {
        e.preventDefault();
        e.stopPropagation();
        
        setIsLiveZooming(true);
        // Use deltaY for ctrl+scroll, deltaX for trackpad pinch
        const delta = isPinchGesture ? e.deltaY : e.deltaX;
        const zoomDelta = delta > 0 ? -0.05 : 0.05; // Reduced sensitivity for smoother zoom
        handleSetScale(prev => prev + zoomDelta);
        
        // Reset zoom indicator after a delay
        setTimeout(() => setIsLiveZooming(false), 200);
      }
    };

    // Touch zoom for mobile/tablets
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isZooming = true;
        setIsLiveZooming(true);
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isZooming) {
        e.preventDefault();
        e.stopPropagation();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (lastTouchDistance > 0) {
          const zoomRatio = currentDistance / lastTouchDistance;
          const zoomDelta = (zoomRatio - 1) * 0.3; // Reduced sensitivity for smoother zoom
          
          handleSetScale(prev => prev + zoomDelta);
        }
        
        lastTouchDistance = currentDistance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isZooming = false;
        lastTouchDistance = 0;
        setIsLiveZooming(false);
      }
    };

    // Add event listeners with proper options to prevent default browser behavior
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      // Clean up any pending timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [pdfUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
            <Card className="shadow-sm overflow-hidden relative">
              <CardContent 
                className="p-0 h-full" 
                ref={pdfContainerRef}
                style={{
                  touchAction: isLiveZooming ? 'none' : 'auto',
                  overscrollBehavior: 'contain'
                }}
              >
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
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Zoom out (or use Ctrl+scroll/pinch)</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <span className={cn(
                          "text-xs w-12 text-center font-medium transition-all duration-150",
                          isLiveZooming && "text-primary bg-primary/10 px-1 py-0.5 rounded"
                        )}>
                          {Math.round(scale * 100)}%
                        </span>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Zoom in (or use Ctrl+scroll/pinch)</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={rotate} className="h-8 w-8">
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Rotate 90°</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}

                    {/* Zoom Hint Overlay */}
                    <AnimatePresence>
                      {showZoomHint && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg"
                          onClick={() => setShowZoomHint(false)}
                        >
                          <p className="text-sm font-medium text-center cursor-pointer">
                            💡 Use Ctrl+scroll or pinch to zoom naturally!
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="absolute inset-0">
                      <PdfViewer
                        file={pdfUrl}
                        pageNumber={pageNumber}
                        renderScale={committedScale}
                        displayScale={scale}
                        isLiveZooming={isLiveZooming}
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