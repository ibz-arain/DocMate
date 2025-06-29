'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfErrorBoundary } from './pdf-error-boundary';

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
}

export function PdfViewer({
  file,
  pageNumber: externalPageNumber,
  scale,
  rotation,
  onDocumentLoadSuccess,
  onLoadError,
  onPageChange
}: PdfViewerProps) {
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isExternalNavigationRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                  renderTextLayer={false}
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
              </div>
            ))}
          </Document>
        </div>
      </div>
    </PdfErrorBoundary>
  );
} 