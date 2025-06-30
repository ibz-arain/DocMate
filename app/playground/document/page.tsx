"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  X,
  Table,
  Sparkles,
  Loader2,
} from "lucide-react";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { PdfContextMenu } from "@/components/pdf/pdf-context-menu";
import { SummarizePopup } from "@/components/document/summarize-popup";
import { QuickFormatPopup } from "@/components/document/quick-format-popup";
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
  const [pdfWorkerReady, setPdfWorkerReady] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string | null>('text');
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

  // Tool tooltip states
  const [showToolTooltip, setShowToolTooltip] = useState(false);
  const toolTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [menuPos, setMenuPos] = useState<{top:number;left:number;isPageRelative?:boolean} | null>(null);
  const lastCursorRef = useRef<{x:number;y:number}|null>(null);
  const scrollStartPositionRef = useRef<{x: number; y: number} | null>(null);
  
  // Summarize popup state
  const [showSummarizePopup, setShowSummarizePopup] = useState(false);
  const [popupSelectedText, setPopupSelectedText] = useState("");
  
  // Quick format popup state
  const [showQuickFormatPopup, setShowQuickFormatPopup] = useState(false);
  const [quickFormatSelectedText, setQuickFormatSelectedText] = useState("");

  const dropTexts = [
    "Drag & drop your PDF here",
    "Let's edit your document",
    "Drop it like it's hot",
    "Your PDF's new home",
    "Ready when you are"
  ];

  // Load PDF from localStorage on component mount
  useEffect(() => {
    const loadStoredPdf = async () => {
      try {
        const storedPdfData = localStorage.getItem('docmate-pdf-data');
        const storedPdfName = localStorage.getItem('docmate-pdf-name');
        
        if (storedPdfData && storedPdfName) {
          // Convert base64 back to File
          const response = await fetch(storedPdfData);
          const blob = await response.blob();
          const file = new File([blob], storedPdfName, { type: 'application/pdf' });
          
          setPdfFile(file);
          const newUrl = URL.createObjectURL(file);
          setPdfUrl(newUrl);
          setIsLoading(true);
          
          // Restore other state if available
          const storedPageNumber = localStorage.getItem('docmate-pdf-page');
          const storedScale = localStorage.getItem('docmate-pdf-scale');
          const storedRotation = localStorage.getItem('docmate-pdf-rotation');
          
          if (storedPageNumber) setPageNumber(parseInt(storedPageNumber));
          if (storedScale) setScale(parseFloat(storedScale));
          if (storedRotation) setRotation(parseInt(storedRotation));
        }
      } catch (error) {
        console.error('Failed to load stored PDF:', error);
        // Clear corrupted data
        localStorage.removeItem('docmate-pdf-data');
        localStorage.removeItem('docmate-pdf-name');
        localStorage.removeItem('docmate-pdf-page');
        localStorage.removeItem('docmate-pdf-scale');
        localStorage.removeItem('docmate-pdf-rotation');
      }
    };

    loadStoredPdf();
  }, []);

  // Save PDF state to localStorage whenever it changes
  useEffect(() => {
    if (pdfFile && pdfUrl) {
      const savePdfToStorage = async () => {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;
            localStorage.setItem('docmate-pdf-data', base64Data);
            localStorage.setItem('docmate-pdf-name', pdfFile.name);
          };
          reader.readAsDataURL(pdfFile);
        } catch (error) {
          console.error('Failed to save PDF to storage:', error);
        }
      };
      
      savePdfToStorage();
    }
  }, [pdfFile, pdfUrl]);

  // Save state changes to localStorage
  useEffect(() => {
    if (pdfFile) {
      localStorage.setItem('docmate-pdf-page', pageNumber.toString());
    }
  }, [pageNumber, pdfFile]);

  useEffect(() => {
    if (pdfFile) {
      localStorage.setItem('docmate-pdf-scale', scale.toString());
    }
  }, [scale, pdfFile]);

  useEffect(() => {
    if (pdfFile) {
      localStorage.setItem('docmate-pdf-rotation', rotation.toString());
    }
  }, [rotation, pdfFile]);

  // Clear PDF and localStorage
  const clearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    setPdfFile(null);
    setPdfUrl(null);
    setPageNumber(1);
    setScale(1.0);
    setRotation(0);
    setNumPages(null);
    setSelectedText("");
    setAnalysisResult(null);
    setMenuPos(null);
    setIsLoading(false);
    
    // Clear localStorage
    localStorage.removeItem('docmate-pdf-data');
    localStorage.removeItem('docmate-pdf-name');
    localStorage.removeItem('docmate-pdf-page');
    localStorage.removeItem('docmate-pdf-scale');
    localStorage.removeItem('docmate-pdf-rotation');
    
    toast({
      title: "Document cleared",
      description: "PDF has been removed from the editor.",
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDropText(prev => {
        const currentIndex = dropTexts.indexOf(prev);
        return dropTexts[(currentIndex + 1) % dropTexts.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Initialize PDF worker
  useEffect(() => {
    const initializePdfWorker = async () => {
      try {
        // Dynamically import pdfjs to ensure it's loaded
        const { pdfjs } = await import('react-pdf');
        
        // Set up worker
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        }
        
        setPdfWorkerReady(true);
      } catch (error) {
        console.error('Failed to initialize PDF worker:', error);
        toast({
          title: "PDF Initialization Error",
          description: "Failed to initialize PDF viewer. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    initializePdfWorker();
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
      if (toolTooltipTimeoutRef.current) {
        clearTimeout(toolTooltipTimeoutRef.current);
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
    
    // Show tooltip briefly when tool is selected
    setShowToolTooltip(true);
    if (toolTooltipTimeoutRef.current) {
      clearTimeout(toolTooltipTimeoutRef.current);
    }
    toolTooltipTimeoutRef.current = setTimeout(() => {
      setShowToolTooltip(false);
    }, 2000); // Show for 2 seconds
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
    { id: 'text', label: 'Text Select', icon: <MousePointerIcon className="h-5 w-5" /> },
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
    
    // Store initial scroll position when context menu opens
    const container = pdfContainerRef.current;
    if (container) {
      scrollStartPositionRef.current = {
        x: container.scrollLeft,
        y: container.scrollTop
      };
    }
    
    // Use page-relative positioning if available
    if (rects?.pageRelativePosition && pdfContainerRef.current) {
      const container = pdfContainerRef.current;
      const pageIdx = rects.pageRelativePosition.page;
      
      // Find the page element using the data-page-index attribute we added
      let pageElement: HTMLElement | null = null;
      
      // Primary strategy: Use data-page-index attribute (most reliable)
      pageElement = container.querySelector(`[data-page-index="${pageIdx}"]`) as HTMLElement;
      
      if (!pageElement) {
        // Fallback 1: Look for page wrapper divs with specific classes
        const pageWrappers = Array.from(container.querySelectorAll('div.relative.mb-4'));
        if (pageWrappers.length > pageIdx) {
          pageElement = pageWrappers[pageIdx] as HTMLElement;
        }
      }
      
      if (!pageElement) {
        // Fallback 2: Look for react-pdf__Page elements
        const reactPdfPages = Array.from(container.querySelectorAll('.react-pdf__Page'));
        if (reactPdfPages.length > pageIdx) {
          pageElement = reactPdfPages[pageIdx] as HTMLElement;
        }
      }
      
      if (pageElement) {
        const containerRect = container.getBoundingClientRect();
        const pageRect = pageElement.getBoundingClientRect();
        
        // Calculate position relative to the container
        const relativeTop = (pageRect.top - containerRect.top) + container.scrollTop;
        const relativeLeft = (pageRect.left - containerRect.left) + container.scrollLeft;
        
        // Position menu relative to the selection on the page
        const menuTop = relativeTop + (rects.pageRelativePosition.top * pageRect.height) + 10;
        const menuLeft = relativeLeft + (rects.pageRelativePosition.left * pageRect.width);
        
        setMenuPos({
          top: menuTop,
          left: menuLeft,
          isPageRelative: true
        });
        return;
      }
    }
    
    // Fallback to cursor position (legacy behavior)
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
      
      setMenuPos({top, left, isPageRelative: false});
    }
  };

  const clearSelection = () => {
    setSelectedText("");
    setAnalysisResult(null);
    setMenuPos(null);
    scrollStartPositionRef.current = null; // Reset scroll tracking
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

  // Context menu action handlers
  const handleQuickSummarize = () => {
    // Start analysis in background
    analyzeWithPrompt('Summarize the following text in concise bullet points.');
  };
  
  const handleQuickFormat = () => {
    setQuickFormatSelectedText(selectedText); // Preserve the selected text
    clearSelection(); // Close context menu
    setShowQuickFormatPopup(true);
  };
  
  const handleTemplateFormat = () => {
    // Start analysis in background
    analyzeWithPrompt('Apply template formatting to structure this text with appropriate headings, sections, and formatting.');
  };
  
  // Summarize popup handlers
  const handleSummarizePopup = () => {
    setPopupSelectedText(selectedText); // Preserve the selected text
    clearSelection(); // Close context menu
    setShowSummarizePopup(true);
  };

  const handleSummarizeRequest = async (text: string) => {
    try {
      const response = await fetch('/api/analyze/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to summarize text');
      }

      return await response.json();
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: 'Summarization failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      toast({
        title: "Copied to clipboard",
        description: "Selected text has been copied to your clipboard.",
      });
      clearSelection();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Legacy handlers (keeping for backward compatibility if needed)
  const handleSummarize = () => analyzeWithPrompt('Summarize the following text in concise bullet points.');
  const handleStructured = () => analyzeWithPrompt('Please convert the following text into clean JSON capturing all facts.');
  const handleAnalyzeDefault = () => analyzeWithPrompt('Analyze this selection and provide insights.');
  const handleExtractKeyPoints = () => analyzeWithPrompt('Extract the key points and important information from this text in bullet format.');
  const handleTranslate = () => analyzeWithPrompt('Translate this text to English and provide the original language detected.');
  const handleExplain = () => analyzeWithPrompt('Explain this text in simple terms, breaking down complex concepts.');
  const handleQuestions = () => analyzeWithPrompt('Generate relevant questions that could be answered by this text content.');

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
      if (selectedText && menuPos && !showQuickFormatPopup) {
        const target = e.target as Element;
        // Check if click is outside context menu and popups
        const contextMenu = target.closest('.z-50');
        if (!contextMenu) {
          clearSelection();
        }
      }
    };

    if (selectedText && menuPos && !showQuickFormatPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedText, menuPos, showQuickFormatPopup]);

  const updateCurrentPageFromScroll = useCallback(() => {
    const container = pdfContainerRef.current;
    if (!container || !pdfUrl) return;

    const pageElems: NodeListOf<HTMLElement> = container.querySelectorAll('[data-page-number], .page');
    if (!pageElems.length) return;

    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const containerCenter = containerTop + containerRect.height / 2;

    let visiblePage = 1;
    let maxVisibleArea = 0;
    let closestToCenter = 1;
    let closestDistance = Infinity;

    pageElems.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const pageTop = rect.top;
      const pageBottom = rect.bottom;
      const pageCenter = pageTop + rect.height / 2;

      const visibleTop = Math.max(pageTop, containerTop);
      const visibleBottom = Math.min(pageBottom, containerBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibleArea = visibleHeight * rect.width;

      const distanceToCenter = Math.abs(containerCenter - pageCenter);

      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        visiblePage = idx + 1;
      }

      if (distanceToCenter < closestDistance) {
        closestDistance = distanceToCenter;
        closestToCenter = idx + 1;
      }
    });

    const newPage = maxVisibleArea > 0 ? visiblePage : closestToCenter;
    if (newPage !== pageNumber) {
      setPageNumber(newPage);
    }
  }, [pageNumber, pdfUrl]);

  // Attach scroll listener for page detection and context menu dismissal
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateCurrentPageFromScroll();
      
      // Handle context menu dismissal based on scroll distance
      if (selectedText && menuPos) {
        if (!scrollStartPositionRef.current) {
          // Store initial scroll position when context menu is open
          scrollStartPositionRef.current = {
            x: container.scrollLeft,
            y: container.scrollTop
          };
        } else {
          // Calculate scroll distance from initial position
          const deltaX = Math.abs(container.scrollLeft - scrollStartPositionRef.current.x);
          const deltaY = Math.abs(container.scrollTop - scrollStartPositionRef.current.y);
          const scrollDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Close context menu if scrolled more than 20 pixels
          if (scrollDistance > 20) {
            clearSelection();
          }
        }
      } else {
        // Reset scroll tracking when no context menu is open
        scrollStartPositionRef.current = null;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateCurrentPageFromScroll, selectedText, menuPos]);

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
                      <AnimatePresence>
                        {!selectedText && pdfWorkerReady && showToolTooltip && (
                          <div className="absolute top-12 left-0 right-0 flex justify-center z-20 pointer-events-none">
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md text-sm whitespace-nowrap"
                            >
                              {selectedTool === 'box' ? 'Drag a box to capture content' : 
                               selectedTool === 'text' ? 'Select text to capture content' :
                               'Select a tool from the sidebar to capture content'}
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      {!pdfWorkerReady ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-2"></div>
                          <p>Initializing PDF viewer...</p>
                        </div>
                      ) :  (

                        // Use regular PDF viewer for better zoom and page tracking
                        <PdfViewer
                          file={pdfUrl}
                          pageNumber={pageNumber}
                          scale={scale}
                          rotation={rotation}
                          onDocumentLoadSuccess={handleDocumentLoadSuccess}
                          onPageChange={handlePageChange}
                          onLoadError={(error: any) => {
                            console.error("Error loading PDF:", error);
                            setIsLoading(false);
                            toast({
                              title: "PDF Loading Error",
                              description: "Failed to load PDF. Please try a different file or refresh the page.",
                              variant: "destructive"
                            });
                          }}
                          selectionMode={selectedTool as 'text' | 'box' | null}
                          onSelection={handleSelection}
                          onScroll={(scrollDistance: number) => {
                            // Close context menu when PDF viewer scrolls more than 20 pixels
                            if (selectedText && menuPos && scrollDistance > 20) {
                              clearSelection();
                            }
                          }}
                        />
                      )}

                      {/* Selection Overlay */}
                      {selectedText && menuPos && (
                        <>
                          {/* Context menu */}
                          <PdfContextMenu
                            position={menuPos}
                            selectedText={selectedText}
                            onQuickSummarize={handleQuickSummarize}
                            onSummarizePopup={handleSummarizePopup}
                            onQuickFormat={handleQuickFormat}
                            onTemplateFormat={handleTemplateFormat}
                            onCopy={handleCopy}
                            onClose={clearSelection}
                          />
                        </>
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

                  <div className="flex-1" />

                  {pdfFile && (
                    <div className="mt-auto pt-2 border-t border-border w-full flex flex-col items-center gap-2">
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
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={clearPdf}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" align="center">
                          <p>Clear document</p>
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

      {/* Summarize Popup */}
      <SummarizePopup
        isOpen={showSummarizePopup}
        onClose={() => {
          setShowSummarizePopup(false);
          setPopupSelectedText(""); // Clear preserved text when closing
        }}
        selectedText={popupSelectedText}
        onSummarize={handleSummarizeRequest}
      />

      {/* Quick Format Popup */}
      <QuickFormatPopup
        isOpen={showQuickFormatPopup}
        onClose={() => {
          setShowQuickFormatPopup(false);
          setQuickFormatSelectedText(""); // Clear preserved text when closing
        }}
        selectedText={quickFormatSelectedText}
      />

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