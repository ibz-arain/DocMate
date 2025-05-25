"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

interface ToolbarProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
}

export function Toolbar({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onZoomChange,
}: ToolbarProps) {
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      onPageChange(pageNumber + 1);
    }
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(scale + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(scale - 0.1, 0.5));
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            value={pageNumber}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= numPages) {
                onPageChange(value);
              }
            }}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">
            of {numPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= 2.0}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 