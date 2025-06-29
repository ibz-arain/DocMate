"use client";

import { useState, useEffect, useRef } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  MinusIcon,
  RotateCw,
  ChevronLeftIcon,
  ChevronRightIcon,
  PenLine as PenLineIcon,
  FileSignature as SignatureIcon,
  Highlighter as HighlighterIcon,
  Scissors as ScissorsIcon,
  FileText as FileTextIcon,
  BoxSelect as BoxSelectIcon,
  Upload,
  MousePointer as MousePointerIcon,
} from "lucide-react";
import PdfHighlighterViewer from "@/components/pdf/pdf-highlighter-viewer";
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
  const [selectedTool, setSelectedTool] = useState<string | null>('highlight');
  const [selectedText, setSelectedText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const [menuPos, setMenuPos] = useState<{top:number;left:number} | null>(null);
  const lastCursorRef = useRef<{x:number;y:number}|null>(null);

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
    { id: 'highlight', label: 'Text Select', icon: <MousePointerIcon className="h-5 w-5" /> },
    { id: 'box', label: 'Box Select', icon: <BoxSelectIcon className="h-5 w-5" /> }
  ];

  const getViewportRect = (percentRect: any): {top:number;left:number;width:number;height:number} | null => {
    const container = pdfContainerRef.current;
    if(!container) return null;
    const box = container.getBoundingClientRect();
    const {top,left,width,height} = percentRect;
    if([top,left,width,height].some(v=>typeof v!=='number')) return null;
    return {
      top: box.top + top * box.height,
      left: box.left + left * box.width,
      width: width * box.width,
      height: height * box.height
    };
  };

  const handleSelection = (text: string, rects: any, hide: () => void) => {
    setSelectedText(text);
    const pos = lastCursorRef.current;
    if(pos){
      // Ensure menu stays within viewport bounds
      const menuWidth = 200; // Approximate menu width
      const menuHeight = 50; // Approximate menu height
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = pos.x + 8; // Small offset from cursor
      let top = pos.y;
      
      // Adjust horizontal position if menu would go off-screen
      if (left + menuWidth > viewportWidth) {
        left = pos.x - menuWidth - 8; // Position to the left of cursor
      }
      
      // Adjust vertical position if menu would go off-screen
      if (top + menuHeight > viewportHeight) {
        top = pos.y - menuHeight - 8; // Position above cursor
      }
      
      // Ensure minimum distance from edges
      left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8));
      top = Math.max(8, Math.min(top, viewportHeight - menuHeight - 8));
      
      setMenuPos({top, left});
    } else {
      // fallback to bounding rect centre
      if(rects?.boundingRect){
        const r = getViewportRect(rects.boundingRect);
        if(r) setMenuPos({top:r.top,left:r.left+r.width});
      }
    }
  };

  const clearSelection = () => {
    setSelectedText("");
    setAnalysisResult(null);
    setMenuPos(null);
  };

  const analyzeWithPrompt = async (prompt: string) => {
    if (!selectedText) return;
    try {
      setIsAnalyzing(true);
      
      // Check if this is a box selection
      const isBoxSelection = selectedText === '[Box Selection]';
      
      if (isBoxSelection) {
        // Box selections will be processed as images (base64)
        // TODO: Implement image capture and base64 conversion
        toast({ 
          title: 'Box Selection', 
          description: 'Box selection will be processed as image. Feature coming soon!', 
          variant: 'default' 
        });
        setIsAnalyzing(false);
        return;
      }
      
      const base64 = btoa(unescape(encodeURIComponent(selectedText)));
      const imageData = `data:text/plain;base64,${base64}`;

      const res = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          mimeType: 'text/plain',
          customPrompt: prompt
        })
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: 'AI Analysis Failed', description: error.error || 'Unknown error', variant: 'destructive' });
        setIsAnalyzing(false);
        return;
      }

      const data = await res.json();
      setAnalysisResult(data);
      setIsAnalyzing(false);
    } catch (error) {
      console.error(error);
      toast({ title: 'AI Analysis Error', description: 'Something went wrong', variant: 'destructive' });
      setIsAnalyzing(false);
    }
  };

  const handleSummarize = () => analyzeWithPrompt('Summarize the following text in concise bullet points.');
  const handleStructured = () => analyzeWithPrompt('Please convert the following text into clean JSON capturing all facts.');
  const handleAnalyzeDefault = () => analyzeWithPrompt('Analyze this selection and provide insights.');

  // Capture last mouse position (works for both text select and box draw end)
  useEffect(()=>{
    const handleUp = (e: MouseEvent)=>{
      // Store global coordinates for context menu positioning
      lastCursorRef.current = {x:e.clientX,y:e.clientY};
    };
    
    const handleMove = (e: MouseEvent)=>{
      // Update cursor position during selection
      if(e.buttons > 0) { // Only during drag
        lastCursorRef.current = {x:e.clientX,y:e.clientY};
      }
    };
    
    window.addEventListener('mouseup',handleUp);
    window.addEventListener('mousemove',handleMove);
    return ()=>{
      window.removeEventListener('mouseup',handleUp);
      window.removeEventListener('mousemove',handleMove);
    };
  },[]);

  // Click outside to dismiss context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedText && menuPos) {
        const target = e.target as Element;
        // Check if click is outside context menu
        const contextMenu = document.querySelector('.fixed.z-40');
        if (contextMenu && !contextMenu.contains(target)) {
          clearSelection();
        }
      }
    };

    if (selectedText && menuPos) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedText, menuPos]);

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
                      {!selectedText && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md z-20 text-sm">
                          {selectedTool === 'box' ? 'Drag a box to capture content' : 'Select text to capture content'}
                        </div>
                      )}

                      <PdfHighlighterViewer
                        file={pdfUrl}
                        scale={scale}
                        rotation={rotation}
                        onSelection={handleSelection}
                        selectionMode={selectedTool === 'box' ? 'box':'text'}
                        onDocumentLoadSuccess={handleDocumentLoadSuccess}
                        onLoadError={(error: any) => {
                          console.error("Error loading PDF:", error);
                          setIsLoading(false);
                        }}
                      />

                      {/* Selection Overlay */}
                      {selectedText && menuPos && (
                        <>
                          {/* context menu near selection rect */}
                          <div
                            className="fixed z-40 bg-background border shadow-md rounded-lg p-2 flex gap-1"
                            style={{
                              top: menuPos.top,
                              left: menuPos.left,
                            }}
                          >
                            {/* Unified context menu for both text and box selections */}
                            <Button title="Analyze" size="icon" variant="ghost" onClick={handleAnalyzeDefault} disabled={isAnalyzing}>
                              <BoxSelectIcon className="h-4 w-4" />
                            </Button>
                            <Button title="Extract Text" size="icon" variant="ghost" onClick={handleStructured} disabled={isAnalyzing}>
                              <FileTextIcon className="h-4 w-4" />
                            </Button>
                            <Button title="Clear" size="icon" variant="ghost" onClick={clearSelection}>
                              ✕
                            </Button>
                          </div>

                          {/* bottom panel preview */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md border shadow-lg rounded-lg p-4 z-30 w-[min(90%,500px)]">
                            {selectedText === '[Box Selection]' ? (
                              <div className="text-sm mb-2">
                                <div className="flex items-center gap-2 text-primary">
                                  <BoxSelectIcon className="h-4 w-4" />
                                  <span>Selection made</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm mb-2 max-h-28 overflow-y-auto whitespace-pre-wrap break-words">{selectedText}</p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Analysis Result Modal */}
                      {analysisResult && (
                        <div className="absolute inset-0 flex items-center justify-center z-40 bg-background/80 backdrop-blur-sm">
                          <div className="bg-background border rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">AI Structured Output</h3>
                              <Button size="icon" variant="ghost" onClick={() => setAnalysisResult(null)}>
                                ✕
                              </Button>
                            </div>
                            <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(analysisResult, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tools Sidebar Card */}
            <Card className="shadow-sm flex flex-col h-full w-[60px] pt-2">
              <CardContent className=" flex flex-col h-full items-center gap-2">
                <TooltipProvider delayDuration={0}>
                  {tools.map(tool => (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedTool === tool.id ? "secondary" : "ghost"}
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