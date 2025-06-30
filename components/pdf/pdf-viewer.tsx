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
  const [liveTextSelection, setLiveTextSelection] = useState<{rects: DOMRect[]; pages: Set<number>} | null>(null);
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
    rects?: Array<{top: number; left: number; width: number; height: number; page: number}>;
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
      // Only handle left clicks for new selections
      if (e.button !== 0) return;
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
          
          // Extract base64 image from the selected area
          const base64Image = extractBoxSelectionImage(percentRect, currentBoxSelection.page);
          
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
          
          // Calculate smart menu position
          const smartPosition = calculateSmartMenuPosition(percentRect, currentBoxSelection.page);
          
          onSelection('[Box Selection]', { 
            boundingRect: percentRect, 
            page: currentBoxSelection.page + 1,
            pageRelativePosition: smartPosition || {
              top: percentRect.top + percentRect.height, // Fallback to bottom of selection
              left: percentRect.left + percentRect.width, // Fallback to right of selection  
              page: currentBoxSelection.page
            },
            base64Image: base64Image // Include the extracted image
          }, () => {
            setPersistentSelection(null);
            scrollStartPositionRef.current = null; // Reset scroll tracking
          });
        }
      }
      
      setCurrentBoxSelection(null);
      setBoxStart(null);
    };

    const handleRightClick = (e: MouseEvent) => {
      // Only handle right clicks on PDF content
      const container = containerRef.current;
      if (!container) return;
      
      const target = e.target as Element;
      if (!container.contains(target)) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Check if there's an existing box selection and if the click is within it
      if (persistentSelection && persistentSelection.type === 'box') {
        const pageRef = pageRefs.current[persistentSelection.page];
        if (pageRef) {
          const pageRect = pageRef.getBoundingClientRect();
          
          // Convert persistent selection back to screen coordinates
          const selectionLeft = pageRect.left + (persistentSelection.left * pageRect.width);
          const selectionTop = pageRect.top + (persistentSelection.top * pageRect.height);
          const selectionRight = selectionLeft + (persistentSelection.width * pageRect.width);
          const selectionBottom = selectionTop + (persistentSelection.height * pageRect.height);
          
          // Check if click is within the box selection
          if (e.clientX >= selectionLeft && e.clientX <= selectionRight &&
              e.clientY >= selectionTop && e.clientY <= selectionBottom) {
            
            // Extract base64 image from the persistent selection
            const base64Image = extractBoxSelectionImage({
              top: persistentSelection.top,
              left: persistentSelection.left,
              width: persistentSelection.width,
              height: persistentSelection.height,
            }, persistentSelection.page);
            
            // Store initial scroll position for distance tracking
            scrollStartPositionRef.current = {
              x: container.scrollLeft,
              y: container.scrollTop
            };
            
            // Calculate smart menu position using cursor location as preference
            const smartPosition = calculateSmartMenuPosition(
              {
                top: persistentSelection.top,
                left: persistentSelection.left,
                width: persistentSelection.width,
                height: persistentSelection.height,
              },
              persistentSelection.page,
              'cursor',
              e.clientX,
              e.clientY
            );
            
            onSelection('[Box Selection]', {
              boundingRect: {
                top: persistentSelection.top,
                left: persistentSelection.left,
                width: persistentSelection.width,
                height: persistentSelection.height,
              },
              page: persistentSelection.page + 1,
              pageRelativePosition: smartPosition || {
                top: Math.max(0, Math.min(1, (e.clientY - pageRect.top) / pageRect.height)),
                left: Math.max(0, Math.min(1, (e.clientX - pageRect.left) / pageRect.width)),
                page: persistentSelection.page
              },
              base64Image: base64Image // Include the extracted image
            }, () => {
              setPersistentSelection(null);
              scrollStartPositionRef.current = null;
            });
          } else {
            // Right-click outside the box selection - clear it
            setPersistentSelection(null);
            scrollStartPositionRef.current = null;
          }
        }
      }
      // If no box selection exists, do nothing (no menu)
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleRightClick);
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [selectionMode, isBoxSelecting, boxStart, currentBoxSelection, persistentSelection, onSelection]);

  // Text selection logic
  useEffect(() => {
    if (selectionMode !== 'text') return;
    
    const handleMouseUp = (e: MouseEvent) => {
      // Only handle left clicks for new selections
      if (e.button !== 0) return;
      
      // Simple delay to let browser selection settle
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        
        const text = sel.toString().trim();
        if (text.length === 0) return;
        
        // Get the selection's bounding rectangle for precise positioning
        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        
        if (rects.length === 0) return;
        
        // Use the last rect (end of selection) for menu positioning
        const lastRect = rects[rects.length - 1];
        const firstRect = rects[0];
        
        // Find which page contains the selection start (for page reference)
        let pageIdx = 0;
        const startContainer = range.startContainer;
        let element = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer as HTMLElement;
        
        while (element && element !== document.body) {
          const foundPageIdx = pageRefs.current.findIndex(ref => ref && ref.contains(element));
          if (foundPageIdx !== -1) {
            pageIdx = foundPageIdx;
            break;
          }
          element = element.parentElement;
        }
        
        // Store initial scroll position for distance tracking
        const container = containerRef.current;
        if (container) {
          scrollStartPositionRef.current = {
            x: container.scrollLeft,
            y: container.scrollTop
          };
        }
        
        // Calculate menu position based on selection bounds
        const pageRef = pageRefs.current[pageIdx];
        if (pageRef && container) {
          const pageRect = pageRef.getBoundingClientRect();
          
          // Create bounding rect for the selection
          const selectionBoundingRect = {
            top: (firstRect.top - pageRect.top) / pageRect.height,
            left: (firstRect.left - pageRect.left) / pageRect.width,
            width: (lastRect.right - firstRect.left) / pageRect.width,
            height: (lastRect.bottom - firstRect.top) / pageRect.height,
          };
          
          // Calculate smart menu position
          const smartPosition = calculateSmartMenuPosition(selectionBoundingRect, pageIdx);
          
          onSelection(text, {
            page: pageIdx + 1,
            pageRelativePosition: smartPosition || {
              top: Math.max(0, Math.min(1, (lastRect.bottom + 5 - pageRect.top) / pageRect.height)),
              left: Math.max(0, Math.min(1, (lastRect.right - pageRect.left) / pageRect.width)),
              page: pageIdx
            },
            boundingRect: selectionBoundingRect
          }, () => {
            // Clear selection when context menu closes
            sel.removeAllRanges();
            scrollStartPositionRef.current = null;
          });
        }
      }, 50);
    };

    const handleRightClick = (e: MouseEvent) => {
      // Only handle right clicks on PDF content
      const container = containerRef.current;
      if (!container) return;
      
      const target = e.target as Element;
      if (!container.contains(target)) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const sel = window.getSelection();
      const selectedText = sel?.toString().trim();
      
      if (selectedText && selectedText.length > 0) {
        // There's already selected text, position menu at cursor
        
        // Find which page contains the click
        let pageIdx = 0;
        const clickedElement = target as HTMLElement;
        let element: HTMLElement | null = clickedElement;
        
        while (element && element !== document.body) {
          const foundPageIdx = pageRefs.current.findIndex(ref => ref && ref.contains(element));
          if (foundPageIdx !== -1) {
            pageIdx = foundPageIdx;
            break;
          }
          element = element.parentElement;
        }
        
        const pageRef = pageRefs.current[pageIdx];
        if (pageRef && container) {
          const pageRect = pageRef.getBoundingClientRect();
          
          // Store initial scroll position for distance tracking
          scrollStartPositionRef.current = {
            x: container.scrollLeft,
            y: container.scrollTop
          };
          
          // Get selection bounds for smart positioning
          const range = sel?.getRangeAt(0);
          let selectionRect = { top: 0, left: 0, width: 0, height: 0 };
          
          if (range) {
            const rects = range.getClientRects();
            if (rects.length > 0) {
              const firstRect = rects[0];
              const lastRect = rects[rects.length - 1];
              selectionRect = {
                top: (firstRect.top - pageRect.top) / pageRect.height,
                left: (firstRect.left - pageRect.left) / pageRect.width,
                width: (lastRect.right - firstRect.left) / pageRect.width,
                height: (lastRect.bottom - firstRect.top) / pageRect.height,
              };
            }
          }
          
          // Calculate smart menu position using cursor location as preference
          const smartPosition = calculateSmartMenuPosition(
            selectionRect,
            pageIdx,
            'cursor',
            e.clientX,
            e.clientY
          );
          
          onSelection(selectedText, {
            page: pageIdx + 1,
            pageRelativePosition: smartPosition || {
              top: Math.max(0, Math.min(1, (e.clientY - pageRect.top) / pageRect.height)),
              left: Math.max(0, Math.min(1, (e.clientX - pageRect.left) / pageRect.width)),
              page: pageIdx
            }
          }, () => {
            // Clear selection when context menu closes
            sel?.removeAllRanges();
            scrollStartPositionRef.current = null;
          });
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleRightClick);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [selectionMode, onSelection]);

  // Hide selection on tool change
  useEffect(() => {
    // Clear all selection states when changing modes or disabling selection
    setCurrentBoxSelection(null);
    setIsBoxSelecting(false);
    setBoxStart(null);
    setLiveTextSelection(null);
    setIsTextSelecting(false);
    setPersistentSelection(null);
    scrollStartPositionRef.current = null;
    
    // Clear any browser text selection to prevent residual highlighting
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }, [selectionMode]);

  // Clear selections when changing pages
  useEffect(() => {
    // Clear browser selection when changing pages to prevent confusion
    if (selectionMode !== 'text') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        selection.removeAllRanges();
      }
    }
  }, [currentPage, selectionMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all selections and timeouts on unmount
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    };
  }, []);

  // Function to calculate smart menu positioning that keeps it visible
  const calculateSmartMenuPosition = useCallback((
    selectionRect: { top: number; left: number; width: number; height: number },
    pageIndex: number,
    preferredCorner: 'bottom-right' | 'cursor' = 'bottom-right',
    cursorX?: number,
    cursorY?: number
  ) => {
    const container = containerRef.current;
    const pageRef = pageRefs.current[pageIndex];
    if (!container || !pageRef) return null;

    const pageRect = pageRef.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Convert selection from percentage to absolute coordinates
    const selectionLeft = pageRect.left + (selectionRect.left * pageRect.width);
    const selectionTop = pageRect.top + (selectionRect.top * pageRect.height);
    const selectionRight = selectionLeft + (selectionRect.width * pageRect.width);
    const selectionBottom = selectionTop + (selectionRect.height * pageRect.height);
    
    // Menu dimensions (approximate)
    const menuWidth = 200;
    const menuHeight = 150;
    const padding = 10;
    
    let menuX: number, menuY: number;
    
    if (preferredCorner === 'cursor' && cursorX !== undefined && cursorY !== undefined) {
      // Start with cursor position
      menuX = cursorX;
      menuY = cursorY;
    } else {
      // Start with bottom-right corner of selection
      menuX = selectionRight;
      menuY = selectionBottom + 5;
    }
    
    // Adjust horizontal position if menu would be cut off
    if (menuX + menuWidth > containerRect.right - padding) {
      // Try placing to the left of the selection
      const leftPosition = selectionLeft - menuWidth;
      if (leftPosition >= containerRect.left + padding) {
        menuX = leftPosition;
      } else {
        // Place at the rightmost visible position
        menuX = containerRect.right - menuWidth - padding;
      }
    }
    
    // Adjust vertical position if menu would be cut off
    if (menuY + menuHeight > containerRect.bottom - padding) {
      // Try placing above the selection
      const topPosition = selectionTop - menuHeight - 5;
      if (topPosition >= containerRect.top + padding) {
        menuY = topPosition;
      } else {
        // Place at the bottommost visible position
        menuY = containerRect.bottom - menuHeight - padding;
      }
    }
    
    // Ensure menu doesn't go beyond the left edge
    if (menuX < containerRect.left + padding) {
      menuX = containerRect.left + padding;
    }
    
    // Ensure menu doesn't go beyond the top edge
    if (menuY < containerRect.top + padding) {
      menuY = containerRect.top + padding;
    }
    
    // Convert back to page-relative coordinates
    const pageRelativeTop = (menuY - pageRect.top) / pageRect.height;
    const pageRelativeLeft = (menuX - pageRect.left) / pageRect.width;
    
    return {
      top: Math.max(0, Math.min(1, pageRelativeTop)),
      left: Math.max(0, Math.min(1, pageRelativeLeft)),
      page: pageIndex
    };
  }, []);

  // Function to extract base64 image from box selection
  const extractBoxSelectionImage = useCallback((boundingRect: any, pageIndex: number): string | null => {
    try {
      const pageRef = pageRefs.current[pageIndex];
      if (!pageRef) return null;

      // Find the canvas element within the page
      const canvas = pageRef.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return null;

      // Calculate the selection area relative to the canvas
      const canvasRelativeRect = {
        left: boundingRect.left * canvas.width,
        top: boundingRect.top * canvas.height,
        width: boundingRect.width * canvas.width,
        height: boundingRect.height * canvas.height
      };

      // Validate the selection area
      if (canvasRelativeRect.width <= 0 || canvasRelativeRect.height <= 0) {
        return null;
      }

      // Create a temporary canvas to extract the selected area
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      // Set the temporary canvas size to match the selection
      tempCanvas.width = Math.max(1, Math.round(canvasRelativeRect.width));
      tempCanvas.height = Math.max(1, Math.round(canvasRelativeRect.height));

      // Draw the selected area from the original canvas to the temporary canvas
      tempCtx.drawImage(
        canvas,
        canvasRelativeRect.left,
        canvasRelativeRect.top,
        canvasRelativeRect.width,
        canvasRelativeRect.height,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      // Convert to base64
      return tempCanvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error extracting box selection image:', error);
      return null;
    }
  }, []);

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
        <style jsx global>{`
          /* Make text layer visible but text transparent so selection shows */
          .react-pdf__Page__textContent {
            opacity: 1 !important;
            pointer-events: ${selectionMode === 'text' ? 'auto' : 'none'} !important;
            user-select: ${selectionMode === 'text' ? 'text' : 'none'} !important;
            cursor: ${selectionMode === 'text' ? 'text' : 'default'} !important;
            background: transparent !important;
          }
          
          .react-pdf__Page__textContent span {
            color: transparent !important;
            background: transparent !important;
            user-select: ${selectionMode === 'text' ? 'text' : 'none'} !important;
            pointer-events: ${selectionMode === 'text' ? 'auto' : 'none'} !important;
            cursor: ${selectionMode === 'text' ? 'text' : 'default'} !important;
          }
          
          .react-pdf__Page__canvas {
            cursor: ${selectionMode === 'box' ? 'crosshair' : selectionMode === 'text' ? 'text' : 'default'} !important;
          }
          
          /* Bright visible selection highlighting */
          .react-pdf__Page__textContent::selection {
            background: hsl(var(--primary) / 0.3) !important;
            color: transparent !important;
          }
          
          .react-pdf__Page__textContent span::selection {
            background: hsl(var(--primary) / 0.3) !important;
            color: transparent !important;
          }
          
          /* Cross-browser selection styles */
          .react-pdf__Page__textContent::-webkit-selection {
            background: hsl(var(--primary) / 0.3) !important;
            color: transparent !important;
          }
          
          .react-pdf__Page__textContent span::-webkit-selection {
            background: hsl(var(--primary) / 0.3) !important;
            color: transparent !important;
          }
          
          .react-pdf__Page__textContent::-moz-selection {
            background: hsl(var(--primary) / 0.3) !important;
            color: transparent !important;
          }
          
          .react-pdf__Page__textContent span::-moz-selection {
            background: hsl(var(--primary) / 0.3) !important;
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
                data-page-number={index + 1}
                data-page-index={index}
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
                {/* Browser handles highlighting naturally - no custom overlay needed */}
                
                {/* Persistent selection (stays with page content) */}
                {/* Only show persistent selections from context menu actions if needed */}
                {persistentSelection && pageRefs.current[index] && (
                  <>
                    {persistentSelection.type === 'text' && persistentSelection.rects ? (
                      // Precise text selection with multiple rectangles - filter by page
                      persistentSelection.rects
                        .filter(rect => rect.page === index)
                        .map((rect, rectIndex) => (
                          <div
                            key={`${index}-${rectIndex}`}
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
                    ) : persistentSelection.page === index ? (
                      // Box selection or fallback single rectangle - only show on primary page
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
                    ) : null}
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