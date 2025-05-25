'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfErrorBoundary } from './pdf-error-boundary';
import { useDraggable } from '@/hooks/use-draggable';

// Configure PDF.js CDN worker
const configurePdfJs = () => {
  // Use CDN worker to avoid issues with local worker files
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
};

interface PdfViewerProps {
  file: string | null; // URL to PDF
  pageNumber: number;
  scale: number;
  rotation: number;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  onPageChange: (pageNumber: number) => void; // Called when visible page changes
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visiblePageNumber, setVisiblePageNumber] = useState(externalPageNumber);
  const isScrollingRef = useRef(false);
  const lastMouseUpdateTimeRef = useRef(0);
  const previousExternalPageRef = useRef(externalPageNumber);

  // Initialize draggable functionality
  const { onMouseDown } = useDraggable({
    onDragStart: () => setIsDragging(true),
    onDragMove: (delta) => {
      setPosition(prev => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y
      }));
    },
    onDragEnd: () => setIsDragging(false)
  });

  useEffect(() => {
    try {
      configurePdfJs();
      setIsWorkerInitialized(true);
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
    }
  }, []);

  // Reset position when file changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [file]);

  // Handle changes to the external pageNumber (button navigation)
  useEffect(() => {
    // Only respond to external page changes, not when we update the parent
    if (externalPageNumber !== visiblePageNumber && externalPageNumber !== previousExternalPageRef.current) {
      previousExternalPageRef.current = externalPageNumber;
      
      // Scroll to the requested page
      const targetPage = pageRefs.current[externalPageNumber - 1];
      if (targetPage) {
        isScrollingRef.current = true;
        targetPage.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Update the visible page immediately for better UI feedback
        setVisiblePageNumber(externalPageNumber);
        
        // Reset scrolling flag after animation
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    }
  }, [externalPageNumber, visiblePageNumber]);

  // Setup mouse movement tracking for pages
  useEffect(() => {
    if (!pageRefs.current.length || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging || isScrollingRef.current) return;

      // Find which page div contains the mouse
      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageRef = pageRefs.current[i];
        if (!pageRef) continue;

        const rect = pageRef.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const newPageNumber = i + 1;
          if (newPageNumber !== visiblePageNumber) {
            // Debounce updates to prevent flickering
            const now = Date.now();
            if (now - lastMouseUpdateTimeRef.current > 200) {
              setVisiblePageNumber(newPageNumber);
              onPageChange(newPageNumber);
              lastMouseUpdateTimeRef.current = now;
              // Store this as the previous external page to avoid scrolling on hover
              previousExternalPageRef.current = newPageNumber;
            }
          }
          return;
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, onPageChange, visiblePageNumber]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
        className="relative w-full h-full overflow-auto scroll-smooth"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onScroll={() => {
          if (!isScrollingRef.current) {
            isScrollingRef.current = true;
            // Reset scrolling flag after scroll ends
            clearTimeout((containerRef.current as any).scrollTimeout);
            (containerRef.current as any).scrollTimeout = setTimeout(() => {
              isScrollingRef.current = false;
            }, 150);
          }
        }}
      >
        <div
          className="min-h-full flex flex-col items-center py-8 gap-8"
          onMouseDown={onMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <Document
            file={file}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                ref={el => pageRefs.current[index] = el}
                className={`relative ${index + 1 === visiblePageNumber ? 'ring-2 ring-primary ring-offset-4' : ''}`}
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                  loading={
                    <div className="w-[595px] h-[842px] bg-muted animate-pulse rounded-lg"></div>
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