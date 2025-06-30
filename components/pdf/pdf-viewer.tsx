"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfErrorBoundary } from './pdf-error-boundary';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js CDN worker
const configurePdfJs = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
};

interface PdfViewerProps {
  file: string | null;
  pageNumber: number;
  scale: number;
  rotation: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  onPageChange: (pageNumber: number) => void;
  selectionMode?: 'text' | 'box' | null;
  onSelection?: (text: string, rects: any, hide: () => void) => void;
  onScroll?: (scrollDistance: number) => void;
}

export function PdfViewer({
  file,
  pageNumber: externalPageNumber,
  scale,
  rotation,
  onDocumentLoadSuccess,
  onLoadError,
  onPageChange,
  selectionMode = null,
  onSelection = () => {},
  onScroll = () => {},
}: PdfViewerProps) {
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isExternalNavigationRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollStartPositionRef = useRef<{x: number; y: number} | null>(null);

  // Simplified selection state
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxStart, setBoxStart] = useState<{x: number; y: number; page: number} | null>(null);
  const [currentBoxSelection, setCurrentBoxSelection] = useState<{left: number; top: number; width: number; height: number; page: number} | null>(null);
  
  // Live text selection tracking
  const [liveTextSelection, setLiveTextSelection] = useState<{rects: DOMRect[]; page: number} | null>(null);
  const [isTextSelecting, setIsTextSelecting] = useState(false);
  
  // Persistent selections (stored as percentages for proper scaling/scrolling)
  const [persistentSelection, setPersistentSelection] = useState<{
    type: 'text' | 'box';
    top: number; 
    left: number; 
    width: number; 
    height: number; 
    page: number;
    text?: string;
    rects?: Array<{top: number; left: number; width: number; height: number}>;
  } | null>(null);

  useEffect(() => {
    try {
      configurePdfJs();
      setIsWorkerInitialized(true);
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
    }
  }, []);

  // Handle external page navigation (from buttons)
  useEffect(() => {
    if (externalPageNumber !== currentPage && externalPageNumber >= 1 && externalPageNumber <= numPages) {
      isExternalNavigationRef.current = true;
      setCurrentPage(externalPageNumber);
      
      // Scroll to the page
      const targetPage = pageRefs.current[externalPageNumber - 1];
      if (targetPage && containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const pageRect = targetPage.getBoundingClientRect();
        
        // Calculate scroll position to center the page
        const scrollTop = container.scrollTop + pageRect.top - containerRect.top - (containerRect.height - pageRect.height) / 2;
        
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
      
      // Reset flag after scroll animation
      setTimeout(() => {
        isExternalNavigationRef.current = false;
      }, 500);
    }
  }, [externalPageNumber, currentPage, numPages]);

  // Scroll-based page detection
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Calculate scroll distance for context menu dismissal
    let scrollDistance = 0;
    if (scrollStartPositionRef.current) {
      // Calculate scroll distance from initial position (only if we have a stored position)
      const deltaX = Math.abs(container.scrollLeft - scrollStartPositionRef.current.x);
      const deltaY = Math.abs(container.scrollTop - scrollStartPositionRef.current.y);
      scrollDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    // Notify parent component about scroll event with distance
    onScroll(scrollDistance);
    
    if (isExternalNavigationRef.current || !containerRef.current || pageRefs.current.length === 0) {
      return;
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Immediate update for responsive feel, then debounced update for final state
    const updateVisiblePage = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const containerCenter = containerTop + containerRect.height / 2;

      let visiblePage = 1;
      let maxVisibleArea = 0;
      let closestToCenter = 1;
      let closestDistance = Infinity;

      // Find the page with the most visible area AND closest to center
      pageRefs.current.forEach((pageRef, index) => {
        if (!pageRef) return;

        const pageRect = pageRef.getBoundingClientRect();
        const pageTop = pageRect.top;
        const pageBottom = pageRect.bottom;
        const pageCenter = pageTop + pageRect.height / 2;

        // Calculate visible area of this page
        const visibleTop = Math.max(pageTop, containerTop);
        const visibleBottom = Math.min(pageBottom, containerBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleArea = visibleHeight * pageRect.width;

        // Distance from page center to viewport center
        const distanceToCenter = Math.abs(containerCenter - pageCenter);

        // Update page with most visible area
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          visiblePage = index + 1;
        }

        // Track closest to center as backup
        if (distanceToCenter < closestDistance) {
          closestDistance = distanceToCenter;
          closestToCenter = index + 1;
        }
      });

      // Use the page with most visible area, fallback to closest to center
      const newPage = maxVisibleArea > 0 ? visiblePage : closestToCenter;

      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        onPageChange(newPage);
      }
    };

    // Immediate update
    updateVisiblePage();

    // Debounced update for final state
    scrollTimeoutRef.current = setTimeout(() => {
      updateVisiblePage();
    }, 50);
  }, [currentPage, onPageChange, onScroll]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(Math.min(externalPageNumber, numPages));
    pageRefs.current = new Array(numPages).fill(null);
    onDocumentLoadSuccess({ numPages });

    // Ensure we scroll to the correct page after the pages have actually rendered
    // We use a small timeout to wait for refs to be attached.
    setTimeout(() => {
      const targetPage = pageRefs.current[externalPageNumber - 1];
      const container = containerRef.current;
      if (targetPage && container) {
        const containerRect = container.getBoundingClientRect();
        const pageRect = targetPage.getBoundingClientRect();
        const scrollTop = container.scrollTop + pageRect.top - containerRect.top - (containerRect.height - pageRect.height) / 2;
        container.scrollTo({ top: Math.max(0, scrollTop) });
      }
    }, 100);
  };

  // Box selection logic
  useEffect(() => {
    if (selectionMode !== 'box') return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (e.button !== 0) return; // Only left click
      e.preventDefault(); // Prevent text selection
      
      // Find which page
      const pageIdx = pageRefs.current.findIndex(ref => {
        if (!ref) return false;
        const rect = ref.getBoundingClientRect();
        return e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right;
      });
      
      if (pageIdx === -1) return;
      
      setIsBoxSelecting(true);
      setBoxStart({ x: e.clientX, y: e.clientY, page: pageIdx });
      setCurrentBoxSelection(null);
      setPersistentSelection(null); // Clear any existing selection
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isBoxSelecting || !boxStart) return;
      
      const sx = boxStart.x;
      const sy = boxStart.y;
      const ex = e.clientX;
      const ey = e.clientY;
      const left = Math.min(sx, ex);
      const top = Math.min(sy, ey);
      const width = Math.abs(ex - sx);
      const height = Math.abs(ey - sy);
      
      setCurrentBoxSelection({ left, top, width, height, page: boxStart.page });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isBoxSelecting || !boxStart) return;
      
      setIsBoxSelecting(false);
      
      if (currentBoxSelection && currentBoxSelection.width > 10 && currentBoxSelection.height > 10) {
        const pageRef = pageRefs.current[currentBoxSelection.page];
        if (pageRef) {
          const pageRect = pageRef.getBoundingClientRect();
          const percentRect = {
            top: (currentBoxSelection.top - pageRect.top) / pageRect.height,
            left: (currentBoxSelection.left - pageRect.left) / pageRect.width,
            width: currentBoxSelection.width / pageRect.width,
            height: currentBoxSelection.height / pageRect.height,
          };
          
          // Store persistent selection
          setPersistentSelection({
            type: 'box',
            top: percentRect.top,
            left: percentRect.left,
            width: percentRect.width,
            height: percentRect.height,
            page: currentBoxSelection.page
          });
          
          // Store initial scroll position for distance tracking
          const container = containerRef.current;
          if (container) {
            scrollStartPositionRef.current = {
              x: container.scrollLeft,
              y: container.scrollTop
            };
          }
          
          onSelection('[Box Selection]', { 
            boundingRect: percentRect, 
            page: currentBoxSelection.page + 1,
            pageRelativePosition: {
              top: percentRect.top,
              left: percentRect.left + percentRect.width / 2, // Center of selection
              page: currentBoxSelection.page
            }
          }, () => {
            setPersistentSelection(null);
            scrollStartPositionRef.current = null; // Reset scroll tracking
          });
        }
      }
      
      setCurrentBoxSelection(null);
      setBoxStart(null);
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionMode, isBoxSelecting, boxStart, currentBoxSelection, onSelection]);

  // Text selection logic
  useEffect(() => {
    if (selectionMode !== 'text') return;
    
    const updateLiveSelection = () => {
      if (!isTextSelecting) return;
      
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setLiveTextSelection(null);
        return;
      }
      
      // Find which page contains the selection
      let anchorNode = sel.anchorNode;
      let element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement;
      
      while (element && element !== document.body) {
        const pageIdx = pageRefs.current.findIndex(ref => ref && ref.contains(element));
        if (pageIdx !== -1) {
          const range = sel.getRangeAt(0);
          
          // Get all rects for multi-line selections
          const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
          
          if (rects.length > 0) {
            setLiveTextSelection({ rects, page: pageIdx });
            return;
          }
        }
        element = element.parentElement;
      }
    };
    
    const processTextSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      
      const text = sel.toString().trim();
      if (text.length === 0) return;
      
      // Find which page contains the selection
      let anchorNode = sel.anchorNode;
      let element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement;
      
      while (element && element !== document.body) {
        const pageIdx = pageRefs.current.findIndex(ref => ref && ref.contains(element));
        if (pageIdx !== -1) {
          const range = sel.getRangeAt(0);
          const pageRef = pageRefs.current[pageIdx];
          
          if (pageRef) {
            const pageRect = pageRef.getBoundingClientRect();
            
            // Get all rects for precise multi-line selection
            const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
            
            if (rects.length > 0) {
              // Calculate bounding box of all rects for the callback
              const minLeft = Math.min(...rects.map(r => r.left));
              const maxRight = Math.max(...rects.map(r => r.right));
              const minTop = Math.min(...rects.map(r => r.top));
              const maxBottom = Math.max(...rects.map(r => r.bottom));
              
              const boundingRect = {
                top: (minTop - pageRect.top) / pageRect.height,
                left: (minLeft - pageRect.left) / pageRect.width,
                width: (maxRight - minLeft) / pageRect.width,
                height: (maxBottom - minTop) / pageRect.height,
              };
              
              // Store persistent selection with multiple rects for precise highlighting
              const persistentRects = rects.map(rect => ({
                top: (rect.top - pageRect.top) / pageRect.height,
                left: (rect.left - pageRect.left) / pageRect.width,
                width: rect.width / pageRect.width,
                height: rect.height / pageRect.height,
              }));
              
              // Clear live selection and store persistent selection
              setLiveTextSelection(null);
              setPersistentSelection({
                type: 'text',
                top: boundingRect.top,
                left: boundingRect.left,
                width: boundingRect.width,
                height: boundingRect.height,
                page: pageIdx,
                text: text,
                rects: persistentRects // Store precise rectangles
              });
              
              // Store initial scroll position for distance tracking
              const container = containerRef.current;
              if (container) {
                scrollStartPositionRef.current = {
                  x: container.scrollLeft,
                  y: container.scrollTop
                };
              }
              
              onSelection(text, { 
                boundingRect, 
                page: pageIdx + 1,
                pageRelativePosition: {
                  top: boundingRect.top,
                  left: boundingRect.left + boundingRect.width / 2, // Center of selection
                  page: pageIdx
                }
              }, () => {
                setPersistentSelection(null);
                sel.removeAllRanges();
                scrollStartPositionRef.current = null; // Reset scroll tracking
              });
              return;
            }
          }
        }
        element = element.parentElement;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const textLayer = target.closest('.react-pdf__Page__textContent');
      if (textLayer && selectionMode === 'text') {
        setIsTextSelecting(true);
        setLiveTextSelection(null);
        setPersistentSelection(null); // Clear any existing selection
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isTextSelecting && selectionMode === 'text') {
        setIsTextSelecting(false);
        setTimeout(() => {
          processTextSelection();
        }, 50); // Slightly longer delay for text selection to finalize
      }
    };

    const handleSelectionChange = () => {
      if (selectionMode === 'text') {
        updateLiveSelection();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [selectionMode, isTextSelecting, onSelection]);

  // Hide selection on tool change
  useEffect(() => {
    if (!selectionMode) {
      setCurrentBoxSelection(null);
      setIsBoxSelecting(false);
      setBoxStart(null);
      setLiveTextSelection(null);
      setIsTextSelecting(false);
      setPersistentSelection(null);
      scrollStartPositionRef.current = null; // Reset scroll tracking
    }
  }, [selectionMode]);

  if (!isWorkerInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-2"></div>
        <p>Initializing PDF viewer...</p>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <PdfErrorBoundary>
      <div 
        ref={containerRef}
        className={`relative w-full h-full overflow-auto ${
          selectionMode === 'text' ? 'select-text' : 
          selectionMode === 'box' ? 'select-none cursor-crosshair' : 
          'select-none'
        }`}
        onScroll={handleScroll}
        style={{
          scrollBehavior: 'smooth',
          userSelect: selectionMode === 'text' ? 'text' : 'none'
        }}
      >
        <style jsx>{`
          :global(.react-pdf__Page__textContent) {
            opacity: 0 !important;
            pointer-events: ${selectionMode === 'text' ? 'auto' : 'none'} !important;
            user-select: ${selectionMode === 'text' ? 'text' : 'none'} !important;
            cursor: ${selectionMode === 'text' ? 'text' : 'default'} !important;
          }
          :global(.react-pdf__Page__textContent span) {
            color: transparent !important;
            background: transparent !important;
            user-select: ${selectionMode === 'text' ? 'text' : 'none'} !important;
            pointer-events: ${selectionMode === 'text' ? 'auto' : 'none'} !important;
            cursor: ${selectionMode === 'text' ? 'text' : 'default'} !important;
          }
          :global(.react-pdf__Page__canvas) {
            cursor: ${selectionMode === 'box' ? 'crosshair' : selectionMode === 'text' ? 'text' : 'default'} !important;
          }
          /* Hide native selection highlighting to avoid double highlight */
          :global(.react-pdf__Page__textContent::selection) {
            background: transparent !important;
          }
          :global(.react-pdf__Page__textContent span::selection) {
            background: transparent !important;
            color: transparent !important;
          }
        `}</style>
        <div className="flex flex-col items-center py-4 space-y-4">
          <Document
            file={file}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                ref={el => { pageRefs.current[index] = el; }}
                className={`relative mb-4 transition-all duration-200 ${
                  index + 1 === currentPage 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'shadow-md hover:shadow-lg'
                }`}
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  className="rounded-lg overflow-hidden"
                  loading={
                    <div 
                      className="bg-muted animate-pulse rounded-lg flex items-center justify-center"
                      style={{
                        width: Math.round(595 * scale),
                        height: Math.round(842 * scale)
                      }}
                    >
                      <div className="text-muted-foreground">Loading page {index + 1}...</div>
                    </div>
                  }
                />
                {/* Temporary box selection (during dragging) */}
                {selectionMode === 'box' && currentBoxSelection && currentBoxSelection.page === index && (
                  <div
                    className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                    style={{
                      left: currentBoxSelection.left - pageRefs.current[index]!.getBoundingClientRect().left,
                      top: currentBoxSelection.top - pageRefs.current[index]!.getBoundingClientRect().top,
                      width: currentBoxSelection.width,
                      height: currentBoxSelection.height,
                      zIndex: 20,
                    }}
                  />
                )}
                
                {/* Live text selection highlight (during text selection) */}
                {selectionMode === 'text' && liveTextSelection && liveTextSelection.page === index && (
                  <>
                    {liveTextSelection.rects.map((rect, rectIndex) => (
                      <div
                        key={rectIndex}
                        className="absolute bg-primary/30 pointer-events-none"
                        style={{
                          left: rect.left - pageRefs.current[index]!.getBoundingClientRect().left,
                          top: rect.top - pageRefs.current[index]!.getBoundingClientRect().top,
                          width: rect.width,
                          height: rect.height,
                          zIndex: 15,
                        }}
                      />
                    ))}
                  </>
                )}
                
                {/* Persistent selection (stays with page content) */}
                {persistentSelection && persistentSelection.page === index && pageRefs.current[index] && (
                  <>
                    {persistentSelection.type === 'text' && persistentSelection.rects ? (
                      // Precise text selection with multiple rectangles
                      persistentSelection.rects.map((rect, rectIndex) => (
                        <div
                          key={rectIndex}
                          className="absolute bg-primary/20 pointer-events-none"
                          style={{
                            left: `${rect.left * 100}%`,
                            top: `${rect.top * 100}%`,
                            width: `${rect.width * 100}%`,
                            height: `${rect.height * 100}%`,
                            zIndex: 20,
                          }}
                        />
                      ))
                    ) : (
                      // Box selection or fallback single rectangle
                      <div
                        className={`absolute pointer-events-none ${
                          persistentSelection.type === 'box' 
                            ? 'border-2 border-primary bg-primary/10' 
                            : 'bg-primary/20 rounded'
                        }`}
                        style={{
                          left: `${persistentSelection.left * 100}%`,
                          top: `${persistentSelection.top * 100}%`,
                          width: `${persistentSelection.width * 100}%`,
                          height: `${persistentSelection.height * 100}%`,
                          zIndex: 20,
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </Document>
        </div>
      </div>
    </PdfErrorBoundary>
  );
} 