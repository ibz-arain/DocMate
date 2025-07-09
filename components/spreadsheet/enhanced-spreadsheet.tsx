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
  onContextMenu?: (
    selectedCells: string,
    range: SelectionRange,
    position: { top: number; left: number }
  ) => void;
  className?: string;
  scale?: number;
  editable?: boolean;
}

export function EnhancedSpreadsheet({
  data,
  onChange,
  onCellSelection,
  onRightClick,
  onContextMenu,
  className,
  scale = 1.0,
  editable = true
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
  const [headerHover, setHeaderHover] = useState<{ type: 'column' | 'row'; index: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [lastCursorPosition, setLastCursorPosition] = useState<{ x: number; y: number } | null>(null);
  
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

  // Initialize dimensions - dynamic based on data size with proportional buffer
  const MIN_ROWS = 10;
  const MIN_COLS = 5;
  
  // Calculate actual data dimensions
  const actualRows = data.length;
  const actualCols = data.length > 0 ? Math.max(...data.map(row => row?.length || 0)) : 0;
  
  // Proportional buffer: 20% of data size, but at least 5 rows/2 columns
  const bufferRows = Math.max(Math.ceil(actualRows * 0.2), 5);
  const bufferCols = Math.max(Math.ceil(actualCols * 0.2), 2);
  
  // Set dimensions with proportional buffer, but ensure minimum usable size
  const rows = Math.max(actualRows + bufferRows, MIN_ROWS);
  const cols = Math.max(actualCols + bufferCols, MIN_COLS);

  // Initialize column widths and row heights
  useEffect(() => {
    // Update column widths when cols changes
    if (columnWidths.length !== cols) {
      const newColumnWidths = new Array(cols).fill(DEFAULT_COLUMN_WIDTH);
      // Preserve existing widths for columns that still exist
      for (let i = 0; i < Math.min(columnWidths.length, cols); i++) {
        newColumnWidths[i] = columnWidths[i] || DEFAULT_COLUMN_WIDTH;
      }
      setColumnWidths(newColumnWidths);
    }
    
    // Update row heights when rows changes
    if (rowHeights.length !== rows) {
      const newRowHeights = new Array(rows).fill(DEFAULT_ROW_HEIGHT);
      // Preserve existing heights for rows that still exist
      for (let i = 0; i < Math.min(rowHeights.length, rows); i++) {
        newRowHeights[i] = rowHeights[i] || DEFAULT_ROW_HEIGHT;
      }
      setRowHeights(newRowHeights);
    }
  }, [cols, rows, columnWidths, rowHeights]);

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

  // Calculate menu position based on cursor or selection
  const calculateMenuPosition = (event: React.MouseEvent): { top: number; left: number } => {
    const menuWidth = 200;
    const menuHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = event.clientX + 8;
    let top = event.clientY;
    
    // Adjust horizontal position if menu would go off-screen
    if (left + menuWidth > viewportWidth) {
      left = event.clientX - menuWidth - 8;
    }
    
    // Adjust vertical position if menu would go off-screen
    if (top + menuHeight > viewportHeight) {
      top = event.clientY - menuHeight - 8;
    }
    
    // Ensure minimum distance from edges
    left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8));
    top = Math.max(8, Math.min(top, viewportHeight - menuHeight - 8));
    
    return { top, left };
  };

  // Show context menu for selection
  const showContextMenu = (range: SelectionRange, event: React.MouseEvent) => {
    const selectedText = getSelectedCellsText(range);
    const position = calculateMenuPosition(event);
    
    setMenuPosition(position);
    setLastCursorPosition({ x: event.clientX, y: event.clientY });
    
    // Call the context menu callback
    onContextMenu?.(selectedText, range, position);
  };

  // Clear context menu
  const clearContextMenu = useCallback(() => {
    setMenuPosition(null);
    setLastCursorPosition(null);
  }, []);

  // Calculate content width for a column
  const getColumnContentWidth = (colIndex: number): number => {
    let maxWidth = DEFAULT_COLUMN_WIDTH;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return maxWidth;
    
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Check header text
    const headerText = getColumnLetter(colIndex);
    const headerWidth = ctx.measureText(headerText).width + 20;
    maxWidth = Math.max(maxWidth, headerWidth);
    
    // Check all cell values in this column
    for (let row = 0; row < data.length; row++) {
      const cellValue = data[row]?.[colIndex]?.value || '';
      if (cellValue) {
        const cellWidth = ctx.measureText(cellValue).width + 20;
        maxWidth = Math.max(maxWidth, cellWidth);
      }
    }
    
    return Math.max(maxWidth, MIN_COLUMN_WIDTH);
  };

  // Calculate content height for a row
  const getRowContentHeight = (rowIndex: number): number => {
    let maxHeight = DEFAULT_ROW_HEIGHT;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return maxHeight;
    
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Check row header text
    const headerText = (rowIndex + 1).toString();
    const headerHeight = 20;
    maxHeight = Math.max(maxHeight, headerHeight);
    
    // Check all cell values in this row
    for (let col = 0; col < (data[rowIndex]?.length || 0); col++) {
      const cellValue = data[rowIndex]?.[col]?.value || '';
      if (cellValue) {
        // Simple height calculation - could be improved for multi-line text
        const lines = cellValue.split('\n').length;
        const cellHeight = Math.max(lines * 16, 20);
        maxHeight = Math.max(maxHeight, cellHeight);
      }
    }
    
    return Math.max(maxHeight, MIN_ROW_HEIGHT);
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
      
      // Show context menu immediately for extended selection
      showContextMenu(range, event);
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
      
      // Show context menu immediately for single cell selection
      showContextMenu(range, event);
    }
  }, [activeCell, editingCell, isResizing, onCellSelection, getSelectedCellsText, showContextMenu]);

  // Handle cell double click (start editing)
  const handleCellDoubleClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing || !editable) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Clear context menu when starting to edit
    clearContextMenu();
    
    const cellValue = data[row]?.[col]?.value || '';
    setEditingCell({ row, col });
    setEditValue(cellValue);
    
    // Focus the input after state update
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  }, [data, isResizing, clearContextMenu, editable]);

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
    
    // Show context menu when drag selection ends
    showContextMenu(selectedRange, event);
  }, [isSelecting, selectedRange, isResizing, onCellSelection, getSelectedCellsText, showContextMenu]);

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
    
    // Show context menu for right-click
    showContextMenu(range, event);
  }, [selectedRange, isResizing, onRightClick, getSelectedCellsText, showContextMenu]);

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

  // Handle column header click (select entire column)
  const handleColumnHeaderClick = useCallback((colIndex: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const range: SelectionRange = {
      startRow: 0,
      startCol: colIndex,
      endRow: rows - 1,
      endCol: colIndex
    };
    
    setSelectedRange(range);
    setActiveCell(null);
    
    const selectedText = getSelectedCellsText(range);
    onCellSelection?.(selectedText, range, event);
    
    // Show context menu immediately for column selection
    showContextMenu(range, event);
  }, [isResizing, rows, onCellSelection, getSelectedCellsText, showContextMenu]);

  // Handle row header click (select entire row)
  const handleRowHeaderClick = useCallback((rowIndex: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const range: SelectionRange = {
      startRow: rowIndex,
      startCol: 0,
      endRow: rowIndex,
      endCol: cols - 1
    };
    
    setSelectedRange(range);
    setActiveCell(null);
    
    const selectedText = getSelectedCellsText(range);
    onCellSelection?.(selectedText, range, event);
    
    // Show context menu immediately for row selection
    showContextMenu(range, event);
  }, [isResizing, cols, onCellSelection, getSelectedCellsText, showContextMenu]);

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

  // Handle column header double click (auto-fit)
  const handleColumnHeaderDoubleClick = useCallback((colIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const currentWidth = columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH;
    const contentWidth = getColumnContentWidth(colIndex);
    
    // If current width is close to content width, reset to default
    if (Math.abs(currentWidth - contentWidth) < 10) {
      const newWidths = [...columnWidths];
      newWidths[colIndex] = DEFAULT_COLUMN_WIDTH;
      setColumnWidths(newWidths);
    } else {
      // Auto-fit to content
      const newWidths = [...columnWidths];
      newWidths[colIndex] = contentWidth;
      setColumnWidths(newWidths);
    }
  }, [columnWidths, getColumnContentWidth]);

  // Handle row header double click (auto-fit)
  const handleRowHeaderDoubleClick = useCallback((rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const currentHeight = rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    const contentHeight = getRowContentHeight(rowIndex);
    
    // If current height is close to content height, reset to default
    if (Math.abs(currentHeight - contentHeight) < 10) {
      const newHeights = [...rowHeights];
      newHeights[rowIndex] = DEFAULT_ROW_HEIGHT;
      setRowHeights(newHeights);
    } else {
      // Auto-fit to content
      const newHeights = [...rowHeights];
      newHeights[rowIndex] = contentHeight;
      setRowHeights(newHeights);
    }
  }, [rowHeights, getRowContentHeight]);

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

    const handleClickOutside = (event: MouseEvent) => {
      if (menuPosition) {
        const target = event.target as Element;
        // Check if click is outside the spreadsheet container
        const container = containerRef.current;
        if (container && !container.contains(target)) {
          clearContextMenu();
        }
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelecting, isResizing, handleResizeMove, handleResizeEnd, menuPosition, clearContextMenu]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore key events if focus is inside an input/textarea or content-editable (e.g. chat sidebar)
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable)) {
        return;
      }

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
          // Start editing current cell only if editable
          if (editable) {
            handleCellDoubleClick(activeCell.row, activeCell.col, new MouseEvent('dblclick') as any);
          }
          return;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          // Clear selected cells only if editable
          if (editable && selectedRange) {
            for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
              for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
                handleCellChange(row, col, '');
              }
            }
          }
          return;
        case 'Escape':
          event.preventDefault();
          // Clear context menu if open
          if (menuPosition) {
            clearContextMenu();
            return;
          }
          break;
        default:
          // If it's a printable character, start editing only if editable
          if (editable && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
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
  }, [activeCell, editingCell, selectedRange, rows, cols, handleCellChange, handleCellDoubleClick, menuPosition, clearContextMenu, editable]);

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

  // Add refs for scroll sync
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const colHeaderRef = useRef<HTMLDivElement>(null);
  const rowHeaderRef = useRef<HTMLDivElement>(null);

  // Scroll sync effect
  useEffect(() => {
    const grid = gridScrollRef.current;
    const colHeader = colHeaderRef.current;
    const rowHeader = rowHeaderRef.current;
    if (!grid || !colHeader || !rowHeader) return;
    const handleScroll = () => {
      colHeader.scrollLeft = grid.scrollLeft;
      rowHeader.scrollTop = grid.scrollTop;
    };
    grid.addEventListener('scroll', handleScroll);
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [scale, cols, rows]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full border rounded-lg bg-background overflow-hidden relative",
        className
      )}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative' }}
    >
      {/* Column Headers */}
      <div
        ref={colHeaderRef}
        className="absolute z-30 bg-background"
        style={{
          left: HEADER_WIDTH * scale,
          right: 0,
          top: 0,
          height: HEADER_HEIGHT * scale,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div
          className="relative"
          style={{
            width: cols * DEFAULT_COLUMN_WIDTH,
            height: HEADER_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'left top',
            pointerEvents: 'auto',
          }}
        >
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, max-content)` }}>
            {Array.from({ length: cols }, (_, col) => (
              <div
                key={col}
                className={cn(
                  "border-b border-r border-border bg-zinc-100 dark:bg-zinc-900 text-xs font-medium text-muted-foreground select-none flex items-center justify-center relative",
                  "hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-crosshair"
                )}
                style={{
                  width: columnWidths[col] || DEFAULT_COLUMN_WIDTH,
                  height: HEADER_HEIGHT,
                  minWidth: MIN_COLUMN_WIDTH,
                }}
                onClick={(e) => handleColumnHeaderClick(col, e)}
                onDoubleClick={(e) => handleColumnHeaderDoubleClick(col, e)}
                onMouseEnter={() => setHeaderHover({ type: 'column', index: col })}
                onMouseLeave={() => setHeaderHover(null)}
              >
                {getColumnLetter(col)}
                {/* Column resize handle */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-1 h-full cursor-col-resize z-10",
                    "hover:bg-primary/50 transition-colors"
                  )}
                  onMouseDown={(e) => handleColumnResizeStart(col, e)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Row Headers */}
      <div
        ref={rowHeaderRef}
        className="absolute z-30 bg-background"
        style={{
          top: HEADER_HEIGHT * scale,
          bottom: 0,
          left: 0,
          width: HEADER_WIDTH * scale,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div
          className="relative"
          style={{
            height: rows * DEFAULT_ROW_HEIGHT,
            width: HEADER_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'left top',
            pointerEvents: 'auto',
          }}
        >
          <div className="flex flex-col">
            {Array.from({ length: rows }, (_, row) => (
              <div
                key={row}
                className={cn(
                  "border-b border-r border-border bg-zinc-100 dark:bg-zinc-900 text-xs font-medium text-muted-foreground select-none flex items-center justify-center relative",
                  "hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-crosshair"
                )}
                style={{
                  width: HEADER_WIDTH,
                  height: rowHeights[row] || DEFAULT_ROW_HEIGHT,
                  minHeight: MIN_ROW_HEIGHT,
                }}
                onClick={(e) => handleRowHeaderClick(row, e)}
                onDoubleClick={(e) => handleRowHeaderDoubleClick(row, e)}
                onMouseEnter={() => setHeaderHover({ type: 'row', index: row })}
                onMouseLeave={() => setHeaderHover(null)}
              >
                {row + 1}
                {/* Row resize handle */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-1 cursor-row-resize z-10",
                    "hover:bg-primary/50 transition-colors"
                  )}
                  onMouseDown={(e) => handleRowResizeStart(row, e)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Top-left sticky corner */}
      <div
        className="absolute z-40 bg-zinc-100 dark:bg-zinc-900 border-r border-b border-border flex items-center justify-center text-xs font-medium text-muted-foreground"
        style={{
          left: 0,
          top: 0,
          width: HEADER_WIDTH * scale,
          height: HEADER_HEIGHT * scale
        }}
      />
      {/* Scrollable grid */}
      <div
        ref={gridScrollRef}
        className="absolute overflow-auto"
        style={{
          top: HEADER_HEIGHT * scale,
          left: HEADER_WIDTH * scale,
          right: 0,
          bottom: 0,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          className="relative"
          style={{
            width: cols * DEFAULT_COLUMN_WIDTH * scale,
            height: rows * DEFAULT_ROW_HEIGHT * scale,
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, max-content)`,
              transform: `scale(${scale})`,
              transformOrigin: 'left top',
            }}
          >
            {Array.from({ length: rows }, (_, row) => (
              <React.Fragment key={row}>
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
                        isActive && !selectedRange && "ring-2 ring-primary ring-inset",
                        !isSelected && !isActive && "hover:bg-muted/30"
                      )}
                      style={{
                        width: columnWidths[col] || DEFAULT_COLUMN_WIDTH,
                        height: rowHeights[row] || DEFAULT_ROW_HEIGHT,
                        minWidth: MIN_COLUMN_WIDTH,
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
                        "text-foreground",
                        isSelected && "select-none"
                      )}
                        >
                          {cellData?.value || ''}
                        </div>
                      )}
                      {/* Selection border - show around entire range */}
                      {selectedRange && !isEditing && (
                        <>
                          {/* Top border for first row */}
                          {row === selectedRange.startRow && (
                            <div 
                              className="absolute top-0 left-0 right-0 border-t-2 border-primary pointer-events-none z-10"
                              style={{
                                left: col >= selectedRange.startCol && col <= selectedRange.endCol ? 0 : 'auto',
                                right: col >= selectedRange.startCol && col <= selectedRange.endCol ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Bottom border for last row */}
                          {row === selectedRange.endRow && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 border-b-2 border-primary pointer-events-none z-10"
                              style={{
                                left: col >= selectedRange.startCol && col <= selectedRange.endCol ? 0 : 'auto',
                                right: col >= selectedRange.startCol && col <= selectedRange.endCol ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Left border for first column */}
                          {col === selectedRange.startCol && (
                            <div 
                              className="absolute top-0 bottom-0 left-0 border-l-2 border-primary pointer-events-none z-10"
                              style={{
                                top: row >= selectedRange.startRow && row <= selectedRange.endRow ? 0 : 'auto',
                                bottom: row >= selectedRange.startRow && row <= selectedRange.endRow ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Right border for last column */}
                          {col === selectedRange.endCol && (
                            <div 
                              className="absolute top-0 bottom-0 right-0 border-r-2 border-primary pointer-events-none z-10"
                              style={{
                                top: row >= selectedRange.startRow && row <= selectedRange.endRow ? 0 : 'auto',
                                bottom: row >= selectedRange.startRow && row <= selectedRange.endRow ? 0 : 'auto'
                              }}
                            />
                          )}
                        </>
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
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg px-4 py-1.5 pointer-events-none"
          )}
        >
          <span className="p-1 text-sm min-w-[4.5rem] text-center font-medium text-foreground">
            <span className="text-sm text-muted-foreground">Selected: </span>
            {getRangeReference(selectedRange)}
          </span>
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
      {/* Header hover cursor overlay */}
      {headerHover && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            cursor: headerHover.type === 'column' ? 'col-resize' : 'row-resize'
          }}
        />
      )}
    </div>
  );
} 