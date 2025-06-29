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
}: PdfViewerProps) {
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isExternalNavigationRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selection state
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number; y: number; page: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number; y: number; page: number} | null>(null);
  const [selectionBox, setSelectionBox] = useState<{left: number; top: number; width: number; height: number; page: number} | null>(null);
  const [textSelection, setTextSelection] = useState<{text: string; rect: DOMRect; page: number} | null>(null);

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
  }, [currentPage, onPageChange]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(Math.min(externalPageNumber, numPages));
    pageRefs.current = new Array(numPages).fill(null);
    onDocumentLoadSuccess({ numPages });
  };

  // Box selection logic
  useEffect(() => {
    if (selectionMode !== 'box') return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      // Only left click
      if (e.button !== 0) return;
      // Find which page
      const pageIdx = pageRefs.current.findIndex(ref => {
        if (!ref) return false;
        const rect = ref.getBoundingClientRect();
        return e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right;
      });
      if (pageIdx === -1) return;
      setSelecting(true);
      setSelectionStart({ x: e.clientX, y: e.clientY, page: pageIdx });
      setSelectionEnd(null);
      setSelectionBox(null);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!selecting || !selectionStart) return;
      setSelectionEnd({ x: e.clientX, y: e.clientY, page: selectionStart.page });
      // Calculate box
      const sx = selectionStart.x;
      const sy = selectionStart.y;
      const ex = e.clientX;
      const ey = e.clientY;
      const left = Math.min(sx, ex);
      const top = Math.min(sy, ey);
      const width = Math.abs(ex - sx);
      const height = Math.abs(ey - sy);
      setSelectionBox({ left, top, width, height, page: selectionStart.page });
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (!selecting || !selectionStart || !selectionEnd) return;
      setSelecting(false);
      // Only trigger if box is big enough
      if (selectionBox && selectionBox.width > 10 && selectionBox.height > 10) {
        // Convert to percent of page
        const pageRef = pageRefs.current[selectionBox.page];
        if (pageRef) {
          const rect = pageRef.getBoundingClientRect();
          const percentRect = {
            top: (selectionBox.top - rect.top) / rect.height,
            left: (selectionBox.left - rect.left) / rect.width,
            width: selectionBox.width / rect.width,
            height: selectionBox.height / rect.height,
          };
          onSelection('[Box Selection]', { boundingRect: percentRect, page: selectionBox.page + 1 }, () => setSelectionBox(null));
        }
      } else {
        setSelectionBox(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionMode, selecting, selectionStart, selectionEnd, selectionBox, onSelection]);

  // Text selection logic
  useEffect(() => {
    if (selectionMode !== 'text') return;
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      // Find which page
      let anchorNode = sel.anchorNode as HTMLElement | null;
      while (anchorNode && anchorNode.nodeType !== 1) anchorNode = anchorNode.parentElement;
      if (!anchorNode) return;
      const pageIdx = pageRefs.current.findIndex(ref => ref && ref.contains(anchorNode));
      if (pageIdx === -1) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = sel.toString();
      if (text.trim().length > 0) {
        setTextSelection({ text, rect, page: pageIdx });
        onSelection(text, { boundingRect: {
          top: (rect.top - pageRefs.current[pageIdx]!.getBoundingClientRect().top) / pageRefs.current[pageIdx]!.getBoundingClientRect().height,
          left: (rect.left - pageRefs.current[pageIdx]!.getBoundingClientRect().left) / pageRefs.current[pageIdx]!.getBoundingClientRect().width,
          width: rect.width / pageRefs.current[pageIdx]!.getBoundingClientRect().width,
          height: rect.height / pageRefs.current[pageIdx]!.getBoundingClientRect().height,
        }, page: pageIdx + 1 }, () => setTextSelection(null));
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [selectionMode, onSelection]);

  // Hide selection on tool change
  useEffect(() => {
    if (!selectionMode) {
      setSelectionBox(null);
      setTextSelection(null);
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
        className="relative w-full h-full overflow-auto"
        onScroll={handleScroll}
        style={{
          scrollBehavior: 'smooth'
        }}
      >
        <style jsx>{`
          :global(.react-pdf__Page__textContent) {
            opacity: 0 !important;
            pointer-events: auto !important;
          }
          :global(.react-pdf__Page__textContent span) {
            color: transparent !important;
            background: transparent !important;
            user-select: text !important;
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
                {/* Box selection overlay */}
                {selectionMode === 'box' && selectionBox && selectionBox.page === index && (
                  <div
                    className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                    style={{
                      left: selectionBox.left - pageRefs.current[index]!.getBoundingClientRect().left,
                      top: selectionBox.top - pageRefs.current[index]!.getBoundingClientRect().top,
                      width: selectionBox.width,
                      height: selectionBox.height,
                      zIndex: 20,
                    }}
                  />
                )}
                {/* Text selection highlight (optional, for feedback) */}
                {selectionMode === 'text' && textSelection && textSelection.page === index && (
                  <div
                    className="absolute bg-primary/20 pointer-events-none rounded"
                    style={{
                      left: textSelection.rect.left - pageRefs.current[index]!.getBoundingClientRect().left,
                      top: textSelection.rect.top - pageRefs.current[index]!.getBoundingClientRect().top,
                      width: textSelection.rect.width,
                      height: textSelection.rect.height,
                      zIndex: 20,
                    }}
                  />
                )}
              </div>
            ))}
          </Document>
        </div>
      </div>
    </PdfErrorBoundary>
  );
} 