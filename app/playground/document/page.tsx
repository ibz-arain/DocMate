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
  FileText,
  BoxSelect as BoxSelectIcon,
  Upload,
  MousePointer as MousePointerIcon,
  X,
  Table,
  Sparkles,
  Loader2,
  History,
  MessageCircle,
  Edit as EditIcon,
} from "lucide-react";
import { PdfViewer } from "@/components/pdf/pdf-viewer";
import { PdfContextMenu } from "@/components/pdf/pdf-context-menu";
import { SummarizePopup } from "@/components/document/summarize-popup";
import { QuickFormatPopup } from "@/components/document/quick-format-popup";
import { TemplateFormatPopup } from "@/components/document/template-format-popup";
import { DocumentToolbar } from "@/components/document/document-toolbar";
import { FullDocumentSummarizePopup } from "@/components/document/full-document-summarize-popup";
import { FullDocumentQuickFormatPopup } from "@/components/document/full-document-quick-format-popup";
import { FullDocumentTemplateFormatPopup } from "@/components/document/full-document-template-format-popup";
import { HistoryMiniPopup } from "@/components/document/history-mini-popup";
import { ChatSidebar } from "@/components/document/chat-sidebar";
import { SideToolbar, Tool } from "@/components/document/side-toolbar";
import { useHistory } from "@/hooks/use-history";
import { convertFileToBase64 } from "@/components/document/document-utils";
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
import { EditToolbar } from "@/components/document/edit-toolbar";

export default function DocumentPage() {
  const { history, clearHistory } = useHistory(); // Add clearHistory to clear history when PDF is cleared
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<string | null>('text');
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionData, setSelectionData] = useState<any>(null);
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
  const lastScaleUpdateRef = useRef<number>(Date.now());
  const lastWheelEventRef = useRef<number>(0);

  // Tool tooltip states
  const [showToolTooltip, setShowToolTooltip] = useState(false);
  const toolTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [menuPos, setMenuPos] = useState<{top:number;left:number;isPageRelative?:boolean} | null>(null);
  const lastCursorRef = useRef<{x:number;y:number}|null>(null);
  const scrollStartPositionRef = useRef<{x: number; y: number} | null>(null);
  const lastSelectionWasOutsidePdf = useRef<boolean>(false);
  const lastBoxSelectionWasOutsidePdf = useRef<boolean>(false);
  
  // Summarize popup state
  const [showSummarizePopup, setShowSummarizePopup] = useState(false);
  const [popupSelectedText, setPopupSelectedText] = useState("");
  const [popupSelectionData, setPopupSelectionData] = useState<any>(null);
  
  // Quick format popup state
  const [showQuickFormatPopup, setShowQuickFormatPopup] = useState(false);
  const [quickFormatSelectedText, setQuickFormatSelectedText] = useState("");
  const [quickFormatSelectionData, setQuickFormatSelectionData] = useState<any>(null);
  const [showTemplateFormatPopup, setShowTemplateFormatPopup] = useState(false);
  const [templateFormatSelectedText, setTemplateFormatSelectedText] = useState("");
  const [templateFormatSelectionData, setTemplateFormatSelectionData] = useState<any>(null);

  // Full document processing states
  const [showFullDocSummarizePopup, setShowFullDocSummarizePopup] = useState(false);
  const [showFullDocQuickFormatPopup, setShowFullDocQuickFormatPopup] = useState(false);
  const [showFullDocTemplateFormatPopup, setShowFullDocTemplateFormatPopup] = useState(false);
  const [fullDocSummarizeResult, setFullDocSummarizeResult] = useState<any>(null);
  const [fullDocQuickFormatResult, setFullDocQuickFormatResult] = useState<any>(null);
  const [processingAction, setProcessingAction] = useState<'summarize' | 'quickformat' | null>(null);
  
  // History popup state
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [historyPopupPosition, setHistoryPopupPosition] = useState({ top: 0, left: 0 });

  // Chat sidebar state
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatSelectedText, setChatSelectedText] = useState("");
  const [chatSelectionData, setChatSelectionData] = useState<any>(null);
  // Text that should be pre-filled into the chat input (but not sent)
  const [chatPrefillText, setChatPrefillText] = useState<string>("");
  const [chatSidebarWidth, setChatSidebarWidth] = useState(0);

  // Add new state for edit mode
  const [selectedEditTool, setSelectedEditTool] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");

  // Add state for undo/redo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [drawings, setDrawings] = useState<Array<{
    type: string;
    points: Array<{ x: number; y: number }>;
    color: string;
    pageNumber: number;
    text?: string;
    fontSize?: number;
    imageData?: string;
    stampType?: string;
    stickyNote?: string;
  }>>([]);

  // Add handlers for undo/redo state
  const handleUndoStateChange = (canUndo: boolean, canRedo: boolean) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  };

  // Add handler for drawings change
  const handleDrawingsChange = (newDrawings: any[]) => {
    setDrawings(newDrawings);
  };

  // Add handler for saving drawings
  const handleSaveDrawings = () => {
    // Here you would implement the logic to save the drawings
    // For now, we'll just show a toast
    toast({
      title: "Drawings saved",
      description: "Your annotations have been saved successfully.",
    });
  };

  // Add undo handler
  const handleUndo = () => {
    // Call the PdfViewer's undo handler
    if ((window as any).pdfViewerUndo) {
      (window as any).pdfViewerUndo();
    }
  };

  // Add redo handler
  const handleRedo = () => {
    // Call the PdfViewer's redo handler
    if ((window as any).pdfViewerRedo) {
      (window as any).pdfViewerRedo();
    }
  };

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
    // Keep pendingScaleRef in sync when scale changes externally
    pendingScaleRef.current = scale;
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
    setSelectionData(null);
    setAnalysisResult(null);
    setMenuPos(null);
    setIsLoading(false);
    
    // Clear all popup states
    setShowSummarizePopup(false);
    setShowQuickFormatPopup(false);
    setShowTemplateFormatPopup(false);
    setShowFullDocSummarizePopup(false);
    setShowFullDocQuickFormatPopup(false);
    setShowFullDocTemplateFormatPopup(false);
    setShowHistoryPopup(false);
    setShowChatSidebar(false);
    
    // Clear cached results
    setCachedSummaryResult(null);
    setCachedQuickFormatResult(null);
    setCachedTemplateFormatResult(null);
    setFullDocSummarizeResult(null);
    setFullDocQuickFormatResult(null);
    
    // Clear localStorage
    localStorage.removeItem('docmate-pdf-data');
    localStorage.removeItem('docmate-pdf-name');
    localStorage.removeItem('docmate-pdf-page');
    localStorage.removeItem('docmate-pdf-scale');
    localStorage.removeItem('docmate-pdf-rotation');
    
    // Clear history when document is cleared
    clearHistory();
    
    toast({
      title: "Document cleared",
      description: "PDF and history have been cleared from the editor.",
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
        // Only show toast for critical initialization failures
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
      if (lastWheelEventRef.current) {
        lastWheelEventRef.current = 0;
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
           const currentScale = pendingScaleRef.current;
           const newScale = Math.min(currentScale * 1.25, 3.0);
           updateZoomSmooth(newScale);
           showZoomFeedbackBriefly();
         }
       } else if (e.key === '-') {
         if (e.ctrlKey || e.metaKey) {
           e.preventDefault();
           const currentScale = pendingScaleRef.current;
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
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastScaleUpdateRef.current;
    
    // Immediate update if it's been more than 100ms since last update (for responsive feel)
    // Otherwise, debounce to reduce re-renders during continuous zooming
    const delay = timeSinceLastUpdate > 100 ? 0 : 150;
    
    zoomTimeoutRef.current = setTimeout(() => {
      setScale(pendingScaleRef.current);
      setIsZooming(false);
      lastScaleUpdateRef.current = Date.now();
    }, delay);
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
        
        // Throttle wheel events to prevent excessive zoom updates
        const now = Date.now();
        if (now - lastWheelEventRef.current < 16) { // ~60fps throttling
          return;
        }
        lastWheelEventRef.current = now;
        
        // Adjust zoom factor based on wheel delta for more natural feel
        const delta = Math.abs(e.deltaY);
        const baseFactor = 1.08; // Slightly larger increments for smoother feel
        const adjustedFactor = delta > 100 ? baseFactor * 1.1 : baseFactor;
        const zoomFactor = e.deltaY > 0 ? 1 / adjustedFactor : adjustedFactor;
        
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
        
        // Throttle touch move events
        const now = Date.now();
        if (now - lastWheelEventRef.current < 32) { // ~30fps for touch events
          return;
        }
        lastWheelEventRef.current = now;
        
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
    // Document loaded - no toast needed, visual feedback is sufficient
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    
    // Reset edit mode when switching tools
    if (tool !== 'edit') {
      setSelectedEditTool(null);
    }
    
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
    const currentScale = pendingScaleRef.current;
    const newScale = Math.min(currentScale * 1.25, 3.0); // Slightly larger increment
    updateZoomSmooth(newScale);
    showZoomFeedbackBriefly();
  };

  const zoomOut = () => {
    const currentScale = pendingScaleRef.current;
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

  const tools: Tool[] = [
    { id: 'text', label: 'Text Select', icon: <MousePointerIcon className="h-5 w-5" /> },
    { id: 'box', label: 'Box Select', icon: <BoxSelectIcon className="h-5 w-5" /> },
    { id: 'edit', label: 'Edit', icon: <EditIcon className="h-5 w-5" /> }
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
    // Only handle selections that come from the PDF viewer component
    // This function should only be called by the PdfViewer component for legitimate PDF selections
    
    // Check if there's any external selection currently active
    const selection = window.getSelection();
    const pdfContainer = pdfContainerRef.current;
    
    if (selection && selection.toString().trim() && pdfContainer) {
      let hasExternalSelection = false;
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        const container = range.commonAncestorContainer;
        const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
        if (element && !pdfContainer.contains(element)) {
          hasExternalSelection = true;
          break;
        }
      }
      
      // Don't show context menu if there's external text selected
      if (hasExternalSelection) {
        return;
      }
    }
    
    // Don't show context menu if the last text selection was outside PDF
    if (lastSelectionWasOutsidePdf.current) {
      return;
    }
    
    // Don't show context menu if the last box selection attempt was outside PDF
    if (text === '[Box Selection]' && lastBoxSelectionWasOutsidePdf.current) {
      return;
    }
    
    setSelectedText(text);
    setSelectionData(rects);
    
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
    setSelectionData(null);
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
      const isRightClickMenu = selectedText === '[Right-click menu]';
      
      if (isRightClickMenu) {
        // Right-click menu without text selection - no need to show toast
        setIsAnalyzing(false);
        return;
      }
      
      let imageData: string;
      let mimeType: string;
      
      if (isBoxSelection) {
        // Box selections are processed as images
        if (!selectionData?.base64Image) {
          toast({ 
            title: 'Box Selection Error', 
            description: 'Unable to extract image from selection area.', 
            variant: 'destructive' 
          });
          setIsAnalyzing(false);
          return;
        }
        
        // Use the base64 image data directly
        imageData = selectionData.base64Image.split(',')[1] || selectionData.base64Image;
        mimeType = 'image/png';
      } else {
        // Text selections are encoded as base64 text
        const base64 = btoa(unescape(encodeURIComponent(selectedText)));
        imageData = base64;
        mimeType = 'text/plain';
      }

      const res = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          mimeType,
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
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and create a comprehensive summary in concise bullet points. Examine all text, graphics, charts, and visual elements. Focus on understanding the context and meaning, not just listing individual words. Provide meaningful insights and key takeaways.' :
      'Summarize the following text in concise bullet points.';
    analyzeWithPrompt(prompt);
  };
  
  const handleQuickFormat = () => {
    const isRightClickMenu = selectedText === '[Right-click menu]';
    const isBoxSelection = selectedText === '[Box Selection]';
    
    if (isRightClickMenu) {
      // No toast needed - user can see no text is selected
      return;
    }
    
    if (isBoxSelection && !selectionData?.base64Image) {
      toast({
        title: "Box Selection Error",
        description: "Unable to extract image from selection area.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear cached results for new analysis
    setCachedQuickFormatResult(null);
    
    setQuickFormatSelectedText(selectedText); // Preserve the selected text
    setQuickFormatSelectionData(selectionData); // Preserve the selection data
    clearSelection(); // Close context menu
    setShowQuickFormatPopup(true);
  };
  
  const handleTemplateFormat = () => {
    const isRightClickMenu = selectedText === '[Right-click menu]';
    const isBoxSelection = selectedText === '[Box Selection]';
    
    if (isRightClickMenu) {
      // No toast needed - user can see no text is selected
      return;
    }
    
    if (isBoxSelection && !selectionData?.base64Image) {
      toast({
        title: "Box Selection Error",
        description: "Unable to extract image from selection area.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear cached results for new analysis
    setCachedTemplateFormatResult(null);
    
    setTemplateFormatSelectedText(selectedText); // Preserve the selected text
    setTemplateFormatSelectionData(selectionData); // Preserve the selection data
    clearSelection(); // Close context menu
    setShowTemplateFormatPopup(true);
  };

  // Chat handlers
  const handleChatPopup = () => {
    const isRightClickMenu = selectedText === '[Right-click menu]';
    const isBoxSelection = selectedText === '[Box Selection]';
    
    if (isRightClickMenu) {
      // No toast needed - user can see no text is selected
      return;
    }
    
    if (isBoxSelection && !selectionData?.base64Image) {
      toast({
        title: "Box Selection Error",
        description: "Unable to extract image from selection area.",
        variant: "destructive"
      });
      return;
    }
    
    setChatSelectedText(selectedText); // Preserve the selected text
    setChatSelectionData(selectionData); // Preserve the selection data
    setChatPrefillText(selectedText); // Pre-fill the chat input with the selection
    clearSelection(); // Close context menu
    setShowChatSidebar(true);
  };

  const handleFullDocumentChat = () => {
    if (!pdfFile) {
      toast({
        title: "No document loaded",
        description: "Please load a PDF document first.",
        variant: "destructive"
      });
      return;
    }

    if (showChatSidebar) {
      // Simply close the sidebar but keep the current chat context intact
      setShowChatSidebar(false);
    } else {
      // Always set the context to full document when opening via this control
      setChatSelectedText('[Full Document]');
      setChatSelectionData(null);
      setChatPrefillText(''); // No specific selection to pre-fill
      setShowChatSidebar(true);
    }
  };
  
  // Summarize popup handlers
  const handleSummarizePopup = () => {
    const isRightClickMenu = selectedText === '[Right-click menu]';
    const isBoxSelection = selectedText === '[Box Selection]';
    
    if (isRightClickMenu) {
      // No toast needed - user can see no text is selected
      return;
    }
    
    if (isBoxSelection && !selectionData?.base64Image) {
      toast({
        title: "Box Selection Error",
        description: "Unable to extract image from selection area.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear cached results for new analysis
    setCachedSummaryResult(null);
    
    setPopupSelectedText(selectedText); // Preserve the selected text
    setPopupSelectionData(selectionData); // Preserve the selection data
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
    const isRightClickMenu = selectedText === '[Right-click menu]';
    const isBoxSelection = selectedText === '[Box Selection]';
    
    if (isRightClickMenu) {
      // No toast needed - user can see no text is selected
      return;
    }
    
    if (isBoxSelection) {
      if (!selectionData?.base64Image) {
        toast({
          title: "Box Selection Error",
          description: "Unable to extract image from selection area.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // For box selections, copy the image to clipboard
        const response = await fetch(selectionData.base64Image);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        // Image copied successfully - no toast needed for basic copy action
        clearSelection();
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Unable to copy image to clipboard.",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      await navigator.clipboard.writeText(selectedText);
      // Text copied successfully - no toast needed for basic copy action
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
  const handleSummarize = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and create a comprehensive summary in concise bullet points. Examine all text, graphics, charts, and visual elements. Focus on understanding the context and meaning, not just listing individual words. Provide meaningful insights and key takeaways.' :
      'Summarize the following text in concise bullet points.';
    analyzeWithPrompt(prompt);
  };

  const handleStructured = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and convert it into clean, structured JSON format. Examine all text, graphics, tables, charts, and visual elements. Extract meaningful data points, relationships, and facts. Focus on understanding the context and content structure, not just parsing individual words. Create a well-organized JSON that captures the essence and important information from the image.' :
      'Please convert the following text into clean JSON capturing all facts.';
    analyzeWithPrompt(prompt);
  };

  const handleAnalyzeDefault = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and provide comprehensive insights. Examine all text, graphics, charts, tables, and visual elements. Understand the context and meaning of the content. Provide thoughtful analysis about what the content represents, its significance, patterns, trends, or important findings. Focus on meaningful interpretation rather than just describing individual words.' :
      'Analyze this selection and provide insights.';
    analyzeWithPrompt(prompt);
  };

  const handleExtractKeyPoints = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and extract the key points and important information in bullet format. Examine all text, graphics, charts, and visual elements. Focus on understanding the main ideas, critical information, and actionable insights. Present the most important takeaways that would be valuable to someone reviewing this content.' :
      'Extract the key points and important information from this text in bullet format.';
    analyzeWithPrompt(prompt);
  };

  const handleTranslate = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and translate any text to English. First identify the original language(s) detected in the image, then provide accurate translations. If the image contains graphics, charts, or other visual elements, describe them in English as well. Focus on understanding the meaning and context, not just word-by-word translation.' :
      'Translate this text to English and provide the original language detected.';
    analyzeWithPrompt(prompt);
  };

  const handleExplain = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and explain it in simple, clear terms. Examine all text, graphics, charts, and visual elements. Break down complex concepts, technical terms, or specialized information into easy-to-understand language. Focus on helping someone understand what this content means and why it might be important.' :
      'Explain this text in simple terms, breaking down complex concepts.';
    analyzeWithPrompt(prompt);
  };

  const handleQuestions = () => {
    const isBoxSelection = selectedText === '[Box Selection]';
    const prompt = isBoxSelection ? 
      'Analyze this image content and generate relevant, thoughtful questions that could be answered by the content. Examine all text, graphics, charts, and visual elements. Create questions that demonstrate understanding of the material and would help someone explore the topic deeper. Focus on meaningful questions about the content, not just about individual words or elements.' :
      'Generate relevant questions that could be answered by this text content.';
    analyzeWithPrompt(prompt);
  };

  // Full document toolbar handlers
  const handleFullDocSummarizeComplete = (result: any) => {
    setFullDocSummarizeResult(result);
    setShowFullDocSummarizePopup(true);
  };

  const handleFullDocQuickFormatComplete = (result: any) => {
    setFullDocQuickFormatResult(result);
    setShowFullDocQuickFormatPopup(true);
  };

  const handleFullDocTemplateFormatStart = () => {
    setShowFullDocTemplateFormatPopup(true);
  };

  // State for cached results when opening from history
  const [cachedSummaryResult, setCachedSummaryResult] = useState<any>(null);
  const [cachedQuickFormatResult, setCachedQuickFormatResult] = useState<any>(null);
  const [cachedTemplateFormatResult, setCachedTemplateFormatResult] = useState<any>(null);

  // Handle opening history entries in their respective popups
  const handleOpenHistoryEntry = (entry: any) => {
    setShowHistoryPopup(false); // Close history popup first
    
    if (entry.type === 'summary') {
      // Create cached summary result format
      const summaryResult = {
        success: true,
        summary: typeof entry.content === 'string' ? entry.content : entry.content?.summary || 'No summary available',
        originalLength: entry.selectedText.length,
        summaryLength: typeof entry.content === 'string' ? entry.content.length : (entry.content?.summary || '').length,
        compressionRatio: Math.round((1 - (typeof entry.content === 'string' ? entry.content.length : (entry.content?.summary || '').length) / entry.selectedText.length) * 100),
        processedAt: new Date(entry.timestamp).toISOString()
      };
      
      setCachedSummaryResult(summaryResult);
      setPopupSelectedText(entry.selectedText);
      setPopupSelectionData(entry.selectionData);
      setShowSummarizePopup(true);
    } else if (entry.type === 'quick-format') {
      setCachedQuickFormatResult(entry.content);
      setQuickFormatSelectedText(entry.selectedText);
      setQuickFormatSelectionData(entry.selectionData);
      setShowQuickFormatPopup(true);
    } else if (entry.type === 'template-format') {
      setCachedTemplateFormatResult(entry.content);
      setTemplateFormatSelectedText(entry.selectedText);
      setTemplateFormatSelectionData(entry.selectionData);
      setShowTemplateFormatPopup(true);
    } else if (entry.type === 'chat') {
      // For chat entries, open a new chat with the same context
      setChatSelectedText(entry.selectedText);
      setChatSelectionData(entry.selectionData);
      setShowChatSidebar(true);
    }
  };

  // Document processing functions for toolbar
  const handleDocumentSummarize = async () => {
    if (!pdfFile) {
      toast({
        title: "No document loaded",
        description: "Please load a PDF document first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setProcessingAction('summarize');

      // First, extract text from the PDF using the custom endpoint
      let base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      // Extract text from the PDF
      const extractResponse = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: pdfFile.type || 'application/pdf',
          customPrompt: 'Extract all text content from this document. Preserve the structure and formatting as much as possible. Include all readable text from all pages.',
          outputFormat: {
            documentType: "Text Extraction",
            tables: [{
              name: "extracted_text",
              description: "All text content from the document",
              type: "data" as const,
              fields: [{
                name: "content",
                type: "string",
                description: "The complete text content of the document",
                required: true
              }]
            }]
          }
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract text from document');
      }

      const extractResult = await extractResponse.json();
      const extractedText = extractResult?.analysis?.content?.extracted_text?.content || 
                           extractResult?.result?.extracted_text?.content ||
                           'Unable to extract text from document';

      // Now summarize the extracted text using the dedicated summarize endpoint
      const summarizeResponse = await fetch('/api/analyze/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extractedText
        }),
      });

      if (!summarizeResponse.ok) {
        const errorData = await summarizeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize document');
      }

      const summaryResult = await summarizeResponse.json();

      // Format the result to match expected structure
      const result = {
        analysis: {
          content: summaryResult.summary,
          summary: summaryResult.summary
        }
      };

      handleFullDocSummarizeComplete(result);

      // Success handled by popup opening - no toast needed

    } catch (error) {
      console.error('Document summarization error:', error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProcessingAction(null);
    }
  };

  const handleDocumentQuickFormat = async () => {
    if (!pdfFile) {
      toast({
        title: "No document loaded",
        description: "Please load a PDF document first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setProcessingAction('quickformat');

      // Convert file to base64
      let base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      const outputFormat = {
        documentType: "Full Document Quick Format",
        tables: [
          {
            name: "document_structure",
            description: "Main structural elements of the document",
            type: "table" as const,
            fields: [
              {
                name: "section",
                type: "string",
                description: "Section or chapter name",
                required: true
              },
              {
                name: "content_type",
                type: "string", 
                description: "Type of content (text, table, list, etc.)",
                required: true
              },
              {
                name: "key_points",
                type: "string",
                description: "Main points or summary of this section",
                required: false
              }
            ]
          },
          {
            name: "key_data",
            description: "Important data points found in the document",
            type: "table" as const,
            fields: [
              {
                name: "category",
                type: "string",
                description: "Data category or type",
                required: true
              },
              {
                name: "value",
                type: "string",
                description: "The actual data value",
                required: true
              },
              {
                name: "context",
                type: "string",
                description: "Context or additional information",
                required: false
              }
            ]
          }
        ]
      };

      const prompt = `Analyze this entire document and extract its structure and key data points. 

Instructions:
1. Identify the main sections, chapters, or logical divisions
2. Extract key data points, numbers, dates, names, and important information
3. Organize the content into a structured format
4. Preserve important context and relationships
5. Create a comprehensive overview of the document's content

Focus on making the information easily accessible and well-organized.`;

      const requestData = {
        imageData: base64Data,
        mimeType: pdfFile.type || 'application/pdf',
        customPrompt: prompt,
        outputFormat
      };

      const response = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Server processing error';
        } else {
          errorMessage = response.statusText || 'Server processing error';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response data from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      handleFullDocQuickFormatComplete(result);

      // Success handled by popup opening - no toast needed

    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProcessingAction(null);
    }
  };

  // Capture last mouse position (works for both text select and box draw end)
  useEffect(()=>{
    const handleUp = (e: MouseEvent)=>{
      // Store global coordinates for context menu positioning
      lastCursorRef.current = {x:e.clientX,y:e.clientY};
      
      // Reset the external selection flags when clicking in PDF area
      const pdfContainer = pdfContainerRef.current;
      if (pdfContainer && pdfContainer.contains(e.target as Element)) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === '') {
          lastSelectionWasOutsidePdf.current = false;
        }
        // Reset box selection flag when clicking inside PDF
        lastBoxSelectionWasOutsidePdf.current = false;
      }
    };
    
    const handleMove = (e: MouseEvent)=>{
      // Update cursor position during selection
      if(e.buttons > 0) { // Only during drag
        lastCursorRef.current = {x:e.clientX,y:e.clientY};
      }
    };
    
    const handleGlobalMouseDown = (e: MouseEvent) => {
      // Check if box selection mode is active and user clicks outside PDF
      if (selectedTool === 'box' && pdfUrl) {
        const pdfContainer = pdfContainerRef.current;
        if (!pdfContainer) return;
        
        const target = e.target as Element;
        if (!pdfContainer.contains(target)) {
          // User tried to start box selection outside PDF area
          lastBoxSelectionWasOutsidePdf.current = true;
        }
      }
    };
    
    const handleSelectionChange = () => {
      // Close context menu if text is selected outside the PDF container
      const pdfContainer = pdfContainerRef.current;
      if (!pdfContainer) return;
      
      const selection = window.getSelection();
      const selectedTextContent = selection?.toString().trim();
      
      // If there's any selection, check if it's outside our PDF container
      if (selectedTextContent && selectedTextContent.length > 0 && selection) {
        let hasSelectionOutsidePdf = false;
        let hasSelectionInsidePdf = false;
        
        for (let i = 0; i < selection.rangeCount; i++) {
          const range = selection.getRangeAt(i);
          const container = range.commonAncestorContainer;
          const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
          
          if (element) {
            if (pdfContainer.contains(element)) {
              hasSelectionInsidePdf = true;
            } else {
              hasSelectionOutsidePdf = true;
            }
          }
        }
        
                 // If there's any selection outside PDF, close the context menu
         // Also prevent new context menus from appearing for outside selections
         if (hasSelectionOutsidePdf) {
           // Immediately close any open context menu
           if (selectedText && menuPos) {
             clearSelection();
           }
           // Set a flag to prevent context menu on next interaction
           lastSelectionWasOutsidePdf.current = true;
           
           
         } else if (hasSelectionInsidePdf) {
           lastSelectionWasOutsidePdf.current = false;
         }
      } else {
        // No selection, reset the flag
        lastSelectionWasOutsidePdf.current = false;
      }
    };
    
    const handleRightClick = (e: MouseEvent) => {
      // Only handle right clicks on the PDF container
      const pdfContainer = pdfContainerRef.current;
      if (!pdfContainer || !pdfUrl) return;
      
      const target = e.target as Element;
      if (!pdfContainer.contains(target)) return;
      
      // Don't show context menu if the last selection was outside PDF
      if (lastSelectionWasOutsidePdf.current) {
        return;
      }
      
      // Prevent default context menu
      e.preventDefault();
      e.stopPropagation();
      
      // Store cursor position
      lastCursorRef.current = {x: e.clientX, y: e.clientY};
      
      // Check if there's currently selected text, but only within the PDF container
      const selection = window.getSelection();
      const selectedTextContent = selection?.toString().trim();
      
      // Verify that the selection is within the PDF container
      let isSelectionInPdfContainer = false;
      if (selectedTextContent && selectedTextContent.length > 0 && selection) {
        for (let i = 0; i < selection.rangeCount; i++) {
          const range = selection.getRangeAt(i);
          const container = range.commonAncestorContainer;
          const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
          if (element && pdfContainer.contains(element)) {
            isSelectionInPdfContainer = true;
            break;
          }
        }
      }
      
      if (isSelectionInPdfContainer && selectedTextContent) {
        // Use existing selected text from within PDF container
        setSelectedText(selectedTextContent);
      } else {
        // No valid text selected within PDF container, use placeholder for general context menu
        setSelectedText("[Right-click menu]");
      }
      
      // Position menu at cursor location
      const menuWidth = 200;
      const menuHeight = 50;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = e.clientX + 8;
      let top = e.clientY;
      
      // Adjust horizontal position if menu would go off-screen
      if (left + menuWidth > viewportWidth) {
        left = e.clientX - menuWidth - 8;
      }
      
      // Adjust vertical position if menu would go off-screen
      if (top + menuHeight > viewportHeight) {
        top = e.clientY - menuHeight - 8;
      }
      
      // Ensure minimum distance from edges
      left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8));
      top = Math.max(8, Math.min(top, viewportHeight - menuHeight - 8));
      
      setMenuPos({top, left, isPageRelative: false});
    };
    
    window.addEventListener('mouseup',handleUp);
    window.addEventListener('mousemove',handleMove);
    window.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('selectionchange', handleSelectionChange);
    return ()=>{
      window.removeEventListener('mouseup',handleUp);
      window.removeEventListener('mousemove',handleMove);
      window.removeEventListener('mousedown', handleGlobalMouseDown);
      window.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  },[pdfUrl, selectedText, menuPos, selectedTool]);

  // Click outside to dismiss context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedText && menuPos && !showQuickFormatPopup && !showTemplateFormatPopup) {
        const target = e.target as Element;
        // Check if click is outside context menu and popups
        const contextMenu = target.closest('.z-50');
        if (!contextMenu) {
          clearSelection();
        }
      }
    };

    if (selectedText && menuPos && !showQuickFormatPopup && !showTemplateFormatPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedText, menuPos, showQuickFormatPopup, showTemplateFormatPopup]);

  // Click outside to dismiss history popup
  useEffect(() => {
    const handleHistoryClickOutside = (e: MouseEvent) => {
      if (showHistoryPopup) {
        const target = e.target as Element;
        // Check if click is outside history popup
        const historyPopup = target.closest('.z-50');
        
        if (!historyPopup) {
          setShowHistoryPopup(false);
        }
      }
    };

    if (showHistoryPopup) {
      document.addEventListener('mousedown', handleHistoryClickOutside);
      return () => document.removeEventListener('mousedown', handleHistoryClickOutside);
    }
  }, [showHistoryPopup]);

  // Close history popup when PDF is cleared
  useEffect(() => {
    if (!pdfFile && showHistoryPopup) {
      setShowHistoryPopup(false);
    }
  }, [pdfFile, showHistoryPopup]);

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

  // Add handleEditToolSelect function
  const handleEditToolSelect = (tool: string) => {
    setSelectedEditTool(tool);
  };

  // Add handleColorSelect function
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <>
      <Head>
        <title>Document Editor | DocMate</title>
        <meta name="description" content="Edit and manage your PDF documents" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="document" />
        
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <div className={cn(
            "grid gap-6 h-full transition-all duration-300",
            showChatSidebar 
              ? "lg:grid-cols-[1fr_400px_auto] grid-cols-1" 
              : "lg:grid-cols-[1fr_auto] grid-cols-1"
          )}>
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
                    {/* Floating Edit Toolbar (INSIDE PDF VIEWER) */}
                    {selectedTool === 'edit' && pdfUrl && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                        <EditToolbar
                          selectedEditTool={selectedEditTool}
                          onEditToolSelect={handleEditToolSelect}
                          selectedColor={selectedColor}
                          onColorSelect={handleColorSelect}
                          canUndo={canUndo}
                          canRedo={canRedo}
                          onUndo={handleUndo}
                          onRedo={handleRedo}
                          onSave={handleSaveDrawings}
                        />
                      </div>
                    )}
                    {/* Floating Page Navigation Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-background/90 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg p-1 ring-2 ring-primary/10">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={prevPage} disabled={pageNumber <= 1} className="h-8 w-8">
                              <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-background/80">
                            <p>Previous page</p>
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
                          <TooltipContent side="top" className="bg-background/80">
                            <p>Next page</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Floating Zoom Controls */}
                    <div className="absolute bottom-4 right-4 z-20 flex items-center bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg p-1 ring-2 ring-primary/10">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5} className="h-8 w-8">
                              <MinusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-background/80">
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
                                {Math.round(pendingScaleRef.current * 100)}%
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-background/80">
                            <p>Reset zoom to 100%</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3.0} className="h-8 w-8">
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-background/80">
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
                          <TooltipContent side="top" className="bg-background/80">
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
                                {Math.round(pendingScaleRef.current * 100)}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>



                    <div className="absolute inset-0">
                      <AnimatePresence>
                        {/* Only show intro message for text or box select, not for edit mode */}
                        {(!selectedText && pdfWorkerReady && showToolTooltip && (selectedTool === 'text' || selectedTool === 'box')) && (
                          <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md text-sm whitespace-nowrap"
                            >
                              {selectedTool === 'box' ? 'Drag a box within the PDF to capture content' :
                               'Select text within the PDF to capture content'}
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
                          }}
                          selectionMode={selectedTool as 'text' | 'box' | 'edit' | null}
                          selectedEditTool={selectedEditTool}
                          selectedColor={selectedColor}
                          onSelection={handleSelection}
                          onScroll={(scrollDistance: number) => {
                            // Close context menu when PDF viewer scrolls more than 20 pixels
                            if (selectedText && menuPos && scrollDistance > 20) {
                              clearSelection();
                            }
                          }}
                          onDrawingChange={handleDrawingsChange}
                          onUndoStateChange={handleUndoStateChange}
                          onSaveDrawings={handleSaveDrawings}
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
                            onChatPopup={handleChatPopup}
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

            {/* Chat Sidebar - Only show when chat is active */}
            {showChatSidebar && (
              <div className="flex flex-col h-full overflow-hidden flex-shrink-0">
                <ChatSidebar
                  isOpen={showChatSidebar}
                  onClose={() => {
                    setShowChatSidebar(false);
                    // Removed state clearing to preserve current chat context when sidebar is reopened
                  }}
                  selectedText={chatSelectedText}
                  selectionData={chatSelectionData}
                  documentName={pdfFile?.name}
                  currentPageNumber={pageNumber}
                  pdfFile={pdfFile}
                  onWidthChange={setChatSidebarWidth}
                  prefillInput={chatPrefillText}
                />
              </div>
            )}

            {/* Side Toolbar */}
            <SideToolbar
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              tools={tools}
              pdfFile={pdfFile}
              isAnalyzing={isAnalyzing}
              isLoading={isLoading}
              processingAction={processingAction}
              showChatSidebar={showChatSidebar}
              history={history}
              showHistoryPopup={showHistoryPopup}
              historyPopupPosition={historyPopupPosition}
              onDocumentSummarize={handleDocumentSummarize}
              onDocumentQuickFormat={handleDocumentQuickFormat}
              onFullDocTemplateFormatStart={handleFullDocTemplateFormatStart}
              onFullDocumentChat={handleFullDocumentChat}
              onHistoryToggle={() => {}}
              onClearPdf={clearPdf}
              onHistoryPopupToggle={(buttonRef) => {
                if (!showHistoryPopup && buttonRef) {
                  const rect = buttonRef.getBoundingClientRect();
                  setHistoryPopupPosition({
                    top: rect.top,
                    left: rect.left
                  });
                }
                setShowHistoryPopup(!showHistoryPopup);
              }}
            />
          </div>
        </main>
      </div>

      {/* Summarize Popup */}
              <SummarizePopup
          isOpen={showSummarizePopup}
          onClose={() => {
            setShowSummarizePopup(false);
            setPopupSelectedText(""); // Clear preserved text when closing
            setPopupSelectionData(null); // Clear preserved data when closing
            setCachedSummaryResult(null); // Clear cached result
          }}
          selectedText={popupSelectedText}
          selectionData={popupSelectionData}
          documentName={pdfFile?.name}
          currentPageNumber={pageNumber}
          cachedResult={cachedSummaryResult}
          onSummarize={handleSummarizeRequest}
      />

      {/* Quick Format Popup */}
              <QuickFormatPopup
          isOpen={showQuickFormatPopup}
          onClose={() => {
            setShowQuickFormatPopup(false);
            setQuickFormatSelectedText(""); // Clear preserved text when closing
            setQuickFormatSelectionData(null); // Clear preserved data when closing
            setCachedQuickFormatResult(null); // Clear cached result
          }}
          selectedText={quickFormatSelectedText}
          selectionData={quickFormatSelectionData}
          documentName={pdfFile?.name}
          currentPageNumber={pageNumber}
          cachedResult={cachedQuickFormatResult}
      />

      {/* Template Format Popup */}
              <TemplateFormatPopup
          isOpen={showTemplateFormatPopup}
          onClose={() => {
            setShowTemplateFormatPopup(false);
            setTemplateFormatSelectedText(""); // Clear preserved text when closing
            setTemplateFormatSelectionData(null); // Clear preserved data when closing
            setCachedTemplateFormatResult(null); // Clear cached result
          }}
          selectedText={templateFormatSelectedText}
          selectionData={templateFormatSelectionData}
          documentName={pdfFile?.name}
          currentPageNumber={pageNumber}
          cachedResult={cachedTemplateFormatResult}
      />

      {/* Full Document Popups */}
      <FullDocumentSummarizePopup
        isOpen={showFullDocSummarizePopup}
        onClose={() => {
          setShowFullDocSummarizePopup(false);
          setFullDocSummarizeResult(null);
        }}
        result={fullDocSummarizeResult}
        documentName={pdfFile?.name}
      />

      <FullDocumentQuickFormatPopup
        isOpen={showFullDocQuickFormatPopup}
        onClose={() => {
          setShowFullDocQuickFormatPopup(false);
          setFullDocQuickFormatResult(null);
        }}
        result={fullDocQuickFormatResult}
        documentName={pdfFile?.name}
      />

      <FullDocumentTemplateFormatPopup
        isOpen={showFullDocTemplateFormatPopup}
        onClose={() => {
          setShowFullDocTemplateFormatPopup(false);
        }}
        pdfFile={pdfFile}
        documentName={pdfFile?.name}
      />

      {/* History Mini Popup */}
      <HistoryMiniPopup
        isOpen={showHistoryPopup}
        onClose={() => setShowHistoryPopup(false)}
        position={historyPopupPosition}
        onOpenEntry={handleOpenHistoryEntry}
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