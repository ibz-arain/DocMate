"use client";

import { useRef, useEffect } from "react";
// @ts-ignore - react-pdf-highlighter lacks type declarations
import { PdfHighlighter, PdfLoader } from "react-pdf-highlighter";
import { pdfjs } from "react-pdf";
import "react-pdf-highlighter/dist/style.css";

// Setup pdfjs worker (same as other viewer)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Props {
  file: string | null;
  scale: number;
  rotation: number;
  onSelection: (text: string, rects: any, hideTip: () => void) => void;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
  selectionMode: 'text' | 'box';
}

export default function PdfHighlighterViewer({
  file,
  scale: _scale,
  rotation: _rotation,
  onSelection,
  onDocumentLoadSuccess,
  onLoadError,
  selectionMode,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const documentLoadedRef = useRef(false);

  // Reset document loaded state when file changes
  useEffect(() => {
    documentLoadedRef.current = false;
  }, [file]);

  if (!file) return null;

  return (
    <div ref={scrollRef} className="w-full h-full overflow-auto relative">
      <PdfLoader 
        url={file} 
        beforeLoad={<div className="flex items-center justify-center h-full">Loading…</div>}
        onError={onLoadError}
      > 
        {/* @ts-ignore */}
        {(pdfDocument: any) => {
          // Ensure we only call onDocumentLoadSuccess once per document
          if (pdfDocument && !documentLoadedRef.current) {
            documentLoadedRef.current = true;
            // Call the success callback with the number of pages
            setTimeout(() => {
              onDocumentLoadSuccess({ numPages: pdfDocument.numPages });
            }, 0);
          }

          return (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event: any) => selectionMode === 'box'}
              scrollRef={(scrollRef as any)}
              highlights={[]}
              // @ts-ignore
              onSelectionFinished={(position: any, content: any, hideTipAndSelection: any) => {
                if (selectionMode === 'box') {
                  // For box selections, always trigger callback - it will be processed as image
                  onSelection('[Box Selection]', position, hideTipAndSelection);
                } else {
                  // For text selections, extract text content
                  let textStr = "";
                  if (typeof content === 'string') {
                    textStr = content;
                  } else if (content && typeof content.text === 'string') {
                    textStr = content.text;
                  }
                  
                  const text = textStr;
                  if (text.trim().length > 0) {
                    onSelection(text, position, hideTipAndSelection);
                  }
                }
              }}
              onLoadError={onLoadError}
              transformSelection={(rect: any) => rect}
            />
          );
        }}
      </PdfLoader>
    </div>
  );
} 