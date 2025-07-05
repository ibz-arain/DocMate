"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CellData {
  value: string;
  row: number;
  col: number;
}

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface EnhancedSpreadsheetProps {
  data: any[][];
  onChange: (data: any[][]) => void;
  onCellSelection?: (
    selectedCells: string,
    range: SelectionRange,
    event: React.MouseEvent
  ) => void;
  onRightClick?: (
    selectedCells: string,
    range: SelectionRange,
    event: React.MouseEvent
  ) => void;
  className?: string;
}

export function EnhancedSpreadsheet({
  data,
  onChange,
  onCellSelection,
  onRightClick,
  className
}: EnhancedSpreadsheetProps) {
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [isResizing, setIsResizing] = useState<{ type: 'column' | 'row'; index: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ pos: number; size: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const DEFAULT_COLUMN_WIDTH = 120;
  const DEFAULT_ROW_HEIGHT = 36;
  const MIN_COLUMN_WIDTH = 60;
  const MIN_ROW_HEIGHT = 28;
  const HEADER_HEIGHT = 36;
  const HEADER_WIDTH = 60;

  // Initialize dimensions
  const rows = Math.max(data.length, 100);
  const cols = Math.max(data[0]?.length || 0, 26);

  // Initialize column widths and row heights
  useEffect(() => {
    if (columnWidths.length === 0) {
      setColumnWidths(new Array(cols).fill(DEFAULT_COLUMN_WIDTH));
    }
    if (rowHeights.length === 0) {
      setRowHeights(new Array(rows).fill(DEFAULT_ROW_HEIGHT));
    }
  }, [cols, rows, columnWidths.length, rowHeights.length]);

  // Get column letter from index (A, B, C, ... Z, AA, AB, etc.)
  const getColumnLetter = (index: number): string => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  // Get cell reference (A1, B2, etc.)
  const getCellReference = (row: number, col: number): string => {
    return `${getColumnLetter(col)}${row + 1}`;
  };

  // Get range reference (A1:B3, etc.)
  const getRangeReference = (range: SelectionRange): string => {
    const startRef = getCellReference(range.startRow, range.startCol);
    const endRef = getCellReference(range.endRow, range.endCol);
    return startRef === endRef ? startRef : `${startRef}:${endRef}`;
  };

  // Get selected cells data as text
  const getSelectedCellsText = (range: SelectionRange): string => {
    const cells: string[] = [];
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellValue = data[row]?.[col]?.value || '';
        if (cellValue) {
          cells.push(`${getCellReference(row, col)}: ${cellValue}`);
        }
      }
    }
    return cells.join('\n');
  };

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // If we're editing a cell, save the value first
    if (editingCell) {
      handleCellSave();
    }
    
    if (event.shiftKey && activeCell) {
      // Extend selection
      const range: SelectionRange = {
        startRow: Math.min(activeCell.row, row),
        startCol: Math.min(activeCell.col, col),
        endRow: Math.max(activeCell.row, row),
        endCol: Math.max(activeCell.col, col)
      };
      setSelectedRange(range);
      const selectedText = getSelectedCellsText(range);
      onCellSelection?.(selectedText, range, event);
    } else {
      // Single cell selection
      const range: SelectionRange = {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      };
      setSelectedRange(range);
      setActiveCell({ row, col });
      
      const selectedText = getSelectedCellsText(range);
      onCellSelection?.(selectedText, range, event);
    }
  }, [activeCell, editingCell, isResizing, onCellSelection, getSelectedCellsText]);

  // Handle cell double click (start editing)
  const handleCellDoubleClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const cellValue = data[row]?.[col]?.value || '';
    setEditingCell({ row, col });
    setEditValue(cellValue);
    
    // Focus the input after state update
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  }, [data, isResizing]);

  // Handle mouse down for selection
  const handleMouseDown = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (event.button !== 0 || isResizing) return; // Only handle left clicks
    
    setIsSelecting(true);
    setSelectionStart({ row, col });
    
    const range: SelectionRange = {
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col
    };
    
    setSelectedRange(range);
    setActiveCell({ row, col });
  }, [isResizing]);

  // Handle mouse enter for drag selection
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting || !selectionStart || isResizing) return;
    
    const range: SelectionRange = {
      startRow: Math.min(selectionStart.row, row),
      startCol: Math.min(selectionStart.col, col),
      endRow: Math.max(selectionStart.row, row),
      endCol: Math.max(selectionStart.col, col)
    };
    
    setSelectedRange(range);
  }, [isSelecting, selectionStart, isResizing]);

  // Handle mouse up
  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isSelecting || !selectedRange || isResizing) return;
    
    setIsSelecting(false);
    
    const selectedText = getSelectedCellsText(selectedRange);
    onCellSelection?.(selectedText, selectedRange, event);
  }, [isSelecting, selectedRange, isResizing, onCellSelection, getSelectedCellsText]);

  // Handle right click
  const handleRightClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    
    // If right-clicking on an existing selection, keep it
    // Otherwise, select the single cell
    let range = selectedRange;
    if (!range || 
        row < range.startRow || row > range.endRow || 
        col < range.startCol || col > range.endCol) {
      range = {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      };
      setSelectedRange(range);
      setActiveCell({ row, col });
    }
    
    const selectedText = getSelectedCellsText(range);
    onRightClick?.(selectedText, range, event);
  }, [selectedRange, isResizing, onRightClick, getSelectedCellsText]);

  // Handle cell value change
  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const newData = [...data];
    
    // Ensure the row exists
    while (newData.length <= row) {
      newData.push([]);
    }
    
    // Ensure the column exists in this row
    while (newData[row].length <= col) {
      newData[row].push({ value: '' });
    }
    
    newData[row][col] = { value };
    onChange(newData);
  }, [data, onChange]);

  // Handle cell editing save
  const handleCellSave = useCallback(() => {
    if (editingCell) {
      handleCellChange(editingCell.row, editingCell.col, editValue);
      setEditingCell(null);
      setEditValue("");
    }
  }, [editingCell, editValue, handleCellChange]);

  // Handle edit input key press
  const handleEditKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCellSave();
      
      // Move to next row
      if (activeCell && activeCell.row < rows - 1) {
        const nextRow = activeCell.row + 1;
        const nextCol = activeCell.col;
        setActiveCell({ row: nextRow, col: nextCol });
        setSelectedRange({
          startRow: nextRow,
          startCol: nextCol,
          endRow: nextRow,
          endCol: nextCol
        });
      }
    } else if (event.key === 'Escape') {
      setEditingCell(null);
      setEditValue("");
    } else if (event.key === 'Tab') {
      event.preventDefault();
      handleCellSave();
      
      // Move to next column
      if (activeCell && activeCell.col < cols - 1) {
        const nextRow = activeCell.row;
        const nextCol = activeCell.col + 1;
        setActiveCell({ row: nextRow, col: nextCol });
        setSelectedRange({
          startRow: nextRow,
          startCol: nextCol,
          endRow: nextRow,
          endCol: nextCol
        });
      }
    }
  }, [handleCellSave, activeCell, rows, cols]);

  // Handle column resize
  const handleColumnResizeStart = useCallback((colIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsResizing({ type: 'column', index: colIndex });
    setResizeStart({ pos: event.clientX, size: columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH });
  }, [columnWidths]);

  // Handle row resize
  const handleRowResizeStart = useCallback((rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsResizing({ type: 'row', index: rowIndex });
    setResizeStart({ pos: event.clientY, size: rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT });
  }, [rowHeights]);

  // Handle resize mouse move
  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!isResizing || !resizeStart) return;
    
    const delta = isResizing.type === 'column' 
      ? event.clientX - resizeStart.pos 
      : event.clientY - resizeStart.pos;
    
    const newSize = Math.max(
      isResizing.type === 'column' ? MIN_COLUMN_WIDTH : MIN_ROW_HEIGHT,
      resizeStart.size + delta
    );
    
    if (isResizing.type === 'column') {
      const newWidths = [...columnWidths];
      newWidths[isResizing.index] = newSize;
      setColumnWidths(newWidths);
    } else {
      const newHeights = [...rowHeights];
      newHeights[isResizing.index] = newSize;
      setRowHeights(newHeights);
    }
  }, [isResizing, resizeStart, columnWidths, rowHeights]);

  // Handle resize mouse up
  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    setResizeStart(null);
  }, []);

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (isSelecting) {
        setIsSelecting(false);
      }
      if (isResizing) {
        handleResizeEnd();
      }
    };

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isResizing) {
        handleResizeMove(event);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isSelecting, isResizing, handleResizeMove, handleResizeEnd]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingCell || !activeCell) return;
      
      let newRow = activeCell.row;
      let newCol = activeCell.col;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          newRow = Math.max(0, newRow - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newRow = Math.min(rows - 1, newRow + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newCol = Math.max(0, newCol - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          newCol = Math.min(cols - 1, newCol + 1);
          break;
        case 'Enter':
          event.preventDefault();
          // Start editing current cell
          handleCellDoubleClick(activeCell.row, activeCell.col, new MouseEvent('dblclick') as any);
          return;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          // Clear selected cells
          if (selectedRange) {
            for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
              for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
                handleCellChange(row, col, '');
              }
            }
          }
          return;
        default:
          // If it's a printable character, start editing
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setEditingCell(activeCell);
            setEditValue(event.key);
            setTimeout(() => {
              editInputRef.current?.focus();
            }, 0);
          }
          return;
      }
      
      setActiveCell({ row: newRow, col: newCol });
      setSelectedRange({
        startRow: newRow,
        startCol: newCol,
        endRow: newRow,
        endCol: newCol
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editingCell, selectedRange, rows, cols, handleCellChange, handleCellDoubleClick]);

  // Check if cell is selected
  const isCellSelected = (row: number, col: number): boolean => {
    if (!selectedRange) return false;
    return row >= selectedRange.startRow && row <= selectedRange.endRow &&
           col >= selectedRange.startCol && col <= selectedRange.endCol;
  };

  // Check if cell is active
  const isCellActive = (row: number, col: number): boolean => {
    return activeCell?.row === row && activeCell?.col === col;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full h-full border rounded-lg bg-background overflow-hidden relative",
        className
      )}
      onMouseUp={handleMouseUp}
    >
      <div className="w-full h-full overflow-auto" ref={gridRef}>
        <div className="min-w-max min-h-max relative">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols + 1}, max-content)` }}>
            {/* Top-left sticky corner */}
            <div
              className="sticky left-0 top-0 z-30 bg-muted/50 border-r border-b border-border flex items-center justify-center text-xs font-medium text-muted-foreground"
              style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT, gridColumn: 1, gridRow: 1 }}
            />
            {/* Column headers */}
            {Array.from({ length: cols }, (_, col) => (
              <div
                key={col}
                className={cn(
                  "sticky top-0 z-20 border-b border-r border-border bg-muted/50 text-xs font-medium text-muted-foreground select-none flex items-center justify-center",
                  "hover:bg-muted/70 transition-colors cursor-pointer"
                )}
                style={{
                  width: columnWidths[col] || DEFAULT_COLUMN_WIDTH,
                  height: HEADER_HEIGHT,
                  minWidth: MIN_COLUMN_WIDTH,
                  gridColumn: col + 2,
                  gridRow: 1
                }}
              >
                {getColumnLetter(col)}
                {/* Column resize handle */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-1 h-full cursor-col-resize z-10",
                    "hover:bg-primary/50 transition-colors"
                  )}
                  onMouseDown={(e) => handleColumnResizeStart(col, e)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newWidths = [...columnWidths];
                    newWidths[col] = DEFAULT_COLUMN_WIDTH;
                    setColumnWidths(newWidths);
                  }}
                />
              </div>
            ))}
            {/* Row headers and data grid */}
            {Array.from({ length: rows }, (_, row) => (
              <React.Fragment key={row}>
                {/* Row header */}
                <div
                  className={cn(
                    "sticky left-0 z-20 border-b border-r border-border bg-muted/50 text-xs font-medium text-muted-foreground select-none flex items-center justify-center",
                    "hover:bg-muted/70 transition-colors cursor-pointer"
                  )}
                  style={{
                    width: HEADER_WIDTH,
                    height: rowHeights[row] || DEFAULT_ROW_HEIGHT,
                    minHeight: MIN_ROW_HEIGHT,
                    gridColumn: 1,
                    gridRow: row + 2
                  }}
                >
                  {row + 1}
                  {/* Row resize handle */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 w-full h-1 cursor-row-resize z-10",
                      "hover:bg-primary/50 transition-colors"
                    )}
                    onMouseDown={(e) => handleRowResizeStart(row, e)}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newHeights = [...rowHeights];
                      newHeights[row] = DEFAULT_ROW_HEIGHT;
                      setRowHeights(newHeights);
                    }}
                  />
                </div>
                {/* Data cells */}
                {Array.from({ length: cols }, (_, col) => {
                  const cellData = data[row]?.[col];
                  const isSelected = isCellSelected(row, col);
                  const isActive = isCellActive(row, col);
                  const isEditing = editingCell?.row === row && editingCell?.col === col;
                  return (
                    <div
                      key={col}
                      className={cn(
                        "border-b border-r border-border relative cursor-cell transition-colors flex-shrink-0",
                        "bg-background text-foreground",
                        isSelected && "bg-primary/10 border-primary/30",
                        isActive && "ring-2 ring-primary ring-inset",
                        !isSelected && !isActive && "hover:bg-muted/30"
                      )}
                      style={{
                        width: columnWidths[col] || DEFAULT_COLUMN_WIDTH,
                        height: rowHeights[row] || DEFAULT_ROW_HEIGHT,
                        minWidth: MIN_COLUMN_WIDTH,
                        gridColumn: col + 2,
                        gridRow: row + 2
                      }}
                      onClick={(e) => handleCellClick(row, col, e)}
                      onDoubleClick={(e) => handleCellDoubleClick(row, col, e)}
                      onMouseDown={(e) => handleMouseDown(row, col, e)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onContextMenu={(e) => handleRightClick(row, col, e)}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyPress}
                          onBlur={handleCellSave}
                          className={cn(
                            "w-full h-full border-none outline-none px-3 py-2 text-sm",
                            "bg-background text-foreground",
                            "focus:bg-background focus:ring-0"
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full px-3 py-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis flex items-center",
                            "text-foreground"
                          )}
                        >
                          {cellData?.value || ''}
                        </div>
                      )}
                      {/* Active cell border */}
                      {isActive && !isEditing && (
                        <div className="absolute inset-0 border-2 border-primary pointer-events-none rounded-sm" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* Selection info - bottom middle */}
      {selectedRange && (
        <div className={cn(
          "absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-md text-sm z-50 pointer-events-none shadow-lg",
          "bg-popover text-popover-foreground border border-border"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Selected:</span>
            <span className="font-mono font-medium">{getRangeReference(selectedRange)}</span>
          </div>
        </div>
      )}
      {/* Resize cursor overlay */}
      {isResizing && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            cursor: isResizing.type === 'column' ? 'col-resize' : 'row-resize'
          }}
        />
      )}
    </div>
  );
} 