"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  isFormula, 
  calculateFormula, 
  getAutocompleteSuggestions, 
  formatFormula, 
  validateFormula,
  FORMULA_FUNCTIONS,
  type FormulaFunction,
  extractFormulaReferences,
  insertCellReferenceIntoFormula,
  getCellReference
} from '@/lib/formula-utils';

interface CellData {
  value: string;
  formula?: string;
  calculatedValue?: string | number;
  row: number;
  col: number;
}

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface FormulaReference {
  type: 'cell' | 'range';
  text: string;
  position: { start: number; end: number };
  cellRange: SelectionRange;
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
  onUndo?: () => void;
  onRedo?: () => void;
}

export function EnhancedSpreadsheet({
  data,
  onChange,
  onCellSelection,
  onRightClick,
  onContextMenu,
  className,
  scale = 1.0,
  editable = true,
  onUndo,
  onRedo
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
  
  // Track previous editable state to handle mode switching
  const [prevEditable, setPrevEditable] = useState(editable);
  
  // Formula autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<FormulaFunction[]>([]);
  const [autocompletePosition, setAutocompletePosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  // Enhanced formula building state
  const [isFormulaMode, setIsFormulaMode] = useState(false);
  const [formulaReferences, setFormulaReferences] = useState<FormulaReference[]>([]);
  const [formulaValidation, setFormulaValidation] = useState<{ isValid: boolean; error?: string } | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [highlightedReferences, setHighlightedReferences] = useState<Set<string>>(new Set());
  const [isFormulaSelecting, setIsFormulaSelecting] = useState(false);
  const [selectedFormulaText, setSelectedFormulaText] = useState<{ start: number; end: number; text: string } | null>(null);
  
  // Drag fill state
  const [isDraggingFill, setIsDraggingFill] = useState(false);
  const [dragFillStart, setDragFillStart] = useState<{ row: number; col: number; value: string } | null>(null);
  const [dragFillDirection, setDragFillDirection] = useState<'horizontal' | 'vertical' | null>(null);
  const [dragFillPreview, setDragFillPreview] = useState<{ row: number; col: number } | null>(null);
  const [dragFillMode, setDragFillMode] = useState<'copy' | 'series' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

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
  const getCellReferenceLocal = (row: number, col: number): string => {
    return `${getColumnLetter(col)}${row + 1}`;
  };

  // Get range reference (A1:B3, etc.)
  const getRangeReference = (range: SelectionRange): string => {
    const startRef = getCellReferenceLocal(range.startRow, range.startCol);
    const endRef = getCellReferenceLocal(range.endRow, range.endCol);
    return startRef === endRef ? startRef : `${startRef}:${endRef}`;
  };

  // Get selected cells data as text
  const getSelectedCellsText = (range: SelectionRange): string => {
    const cells: string[] = [];
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellData = getCellDisplayValue(row, col);
        if (cellData.value) {
          cells.push(`${getCellReferenceLocal(row, col)}: ${cellData.value}`);
        }
      }
    }
    return cells.join('\n');
  };

  // Get cell display value (formula result or plain value)
  const getCellDisplayValue = (row: number, col: number): { value: string; isError: boolean } => {
    const cell = data[row]?.[col];
    if (!cell) return { value: '', isError: false };
    
    if (cell.formula) {
      const calculatedValue = cell.calculatedValue;
      if (typeof calculatedValue === 'string' && 
          (calculatedValue.startsWith('#') || calculatedValue === 'ERROR' || 
           calculatedValue === 'NAME?' || calculatedValue === 'DIV/0!' || 
           calculatedValue === 'REF!' || calculatedValue === 'CIRCULAR!')) {
        return { value: String(calculatedValue), isError: true };
      }
      return { value: String(calculatedValue || cell.value || ''), isError: false };
    }
    
    return { value: cell.value || '', isError: false };
  };

  // Enhanced formula validation and reference extraction
  const validateAndExtractFormula = useCallback((formula: string) => {
    if (!isFormula(formula)) {
      setFormulaReferences([]);
      setFormulaValidation(null);
      setHighlightedReferences(new Set());
      return;
    }

    // Validate formula
    const validation = validateFormula(formula);
    setFormulaValidation(validation);

    // Extract references for highlighting
    try {
      const references = extractFormulaReferences(formula);
      const formattedReferences: FormulaReference[] = references.map(ref => {
        let cellRange: SelectionRange;
        
        if (ref.type === 'cell') {
          const cellRef = ref.reference as any;
          cellRange = {
            startRow: cellRef.row,
            startCol: cellRef.col,
            endRow: cellRef.row,
            endCol: cellRef.col
          };
        } else {
          const rangeRef = ref.reference as any;
          cellRange = {
            startRow: rangeRef.startRow,
            startCol: rangeRef.startCol,
            endRow: rangeRef.endRow,
            endCol: rangeRef.endCol
          };
        }
        
        return {
          type: ref.type,
          text: ref.text,
          position: ref.position,
          cellRange
        };
      });
      
      setFormulaReferences(formattedReferences);
      
      // Set highlighted cell references
      const highlightedCells = new Set<string>();
      formattedReferences.forEach(ref => {
        for (let row = ref.cellRange.startRow; row <= ref.cellRange.endRow; row++) {
          for (let col = ref.cellRange.startCol; col <= ref.cellRange.endCol; col++) {
            highlightedCells.add(`${row},${col}`);
          }
        }
      });
      setHighlightedReferences(highlightedCells);
    } catch (error) {
      setFormulaReferences([]);
      setHighlightedReferences(new Set());
    }
  }, []);

  // Calculate all formulas in the spreadsheet
  const calculateAllFormulas = useCallback(() => {
    const newData = [...data];
    let hasChanges = false;

    for (let row = 0; row < newData.length; row++) {
      for (let col = 0; col < (newData[row]?.length || 0); col++) {
        const cell = newData[row]?.[col];
        if (cell?.formula) {
          try {
            const calculatedValue = calculateFormula(cell.formula, newData, row, col);
            if (cell.calculatedValue !== calculatedValue) {
              newData[row][col] = { ...cell, calculatedValue };
              hasChanges = true;
            }
          } catch (error) {
            newData[row][col] = { ...cell, calculatedValue: '#ERROR!' };
            hasChanges = true;
          }
        }
      }
    }

    if (hasChanges) {
      onChange(newData);
    }
  }, [data, onChange]);

  // Recalculate formulas when data changes
  useEffect(() => {
    calculateAllFormulas();
  }, [calculateAllFormulas]);

  // Handle formula mode activation
  useEffect(() => {
    const isInFormulaMode = isFormula(editValue);
    if (isInFormulaMode !== isFormulaMode) {
      setIsFormulaMode(isInFormulaMode);
      
      if (isInFormulaMode) {
        validateAndExtractFormula(editValue);
      } else {
        setFormulaReferences([]);
        setFormulaValidation(null);
        setHighlightedReferences(new Set());
        // Reset formula selection state when exiting formula mode
        setIsFormulaSelecting(false);
        setSelectedFormulaText(null);
      }
    }
  }, [editValue, isFormulaMode, validateAndExtractFormula]);

  // Handle mode switching (cell select vs edit)
  useEffect(() => {
    // If switching from cell select to edit mode
    if (!prevEditable && editable) {
      // Keep existing selection but clear menu
      setMenuPosition(null);
      setLastCursorPosition(null);
      
      // If there was a single cell selected, start editing it
      if (selectedRange && 
          selectedRange.startRow === selectedRange.endRow && 
          selectedRange.startCol === selectedRange.endCol) {
        const cell = data[selectedRange.startRow]?.[selectedRange.startCol];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell({ row: selectedRange.startRow, col: selectedRange.startCol });
        setEditValue(cellValue);
        
        // Focus the input after state update
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
      }
    }
    
    // Update previous editable state
    setPrevEditable(editable);
  }, [editable, prevEditable, selectedRange, data]);

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

  // Handle cell value change
  const handleCellChange = useCallback((row: number, col: number, value: string) => {
    const newData = [...data];
    
    // If we have a multi-cell selection and we're in edit mode, apply to all selected cells
    if (editable && selectedRange && 
        (selectedRange.startRow !== selectedRange.endRow || selectedRange.startCol !== selectedRange.endCol)) {
      
      // Apply the same value to all selected cells
      for (let r = selectedRange.startRow; r <= selectedRange.endRow; r++) {
        for (let c = selectedRange.startCol; c <= selectedRange.endCol; c++) {
          // Ensure the row exists
          while (newData.length <= r) {
            newData.push([]);
          }
          
          // Ensure the column exists in this row
          while (newData[r].length <= c) {
            newData[r].push({ value: '' });
          }
          
          // Handle formula input
          if (isFormula(value)) {
            newData[r][c] = { 
              value: value.substring(1), // Store without '='
              formula: value,
              calculatedValue: undefined
            };
          } else {
            newData[r][c] = { value };
          }
        }
      }
    } else {
      // Single cell editing
      // Ensure the row exists
      while (newData.length <= row) {
        newData.push([]);
      }
      
      // Ensure the column exists in this row
      while (newData[row].length <= col) {
        newData[row].push({ value: '' });
      }
      
      // Handle formula input
      if (isFormula(value)) {
        newData[row][col] = { 
          value: value.substring(1), // Store without '='
          formula: value,
          calculatedValue: undefined
        };
      } else {
        newData[row][col] = { value };
      }
    }
    
    onChange(newData);
  }, [data, onChange, editable, selectedRange]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // If we're in formula mode and editing, handle cell reference insertion or replacement
    if (isFormulaMode && editingCell && editInputRef.current) {
      // If clicking on the same cell that's being edited, allow normal editing
      if (editingCell.row === row && editingCell.col === col) {
        // Let the normal editing flow continue - don't prevent anything
        return;
      }
      
      // If user has selected text in the formula input and it's a valid cell reference, allow replacement
      if (selectedFormulaText && isValidCellReference(selectedFormulaText.text)) {
        // Replace the selected text with the new cell reference
        const newCellRef = getCellReferenceLocal(row, col);
        const newFormula = editValue.substring(0, selectedFormulaText.start) + 
                          newCellRef + 
                          editValue.substring(selectedFormulaText.end);
        setEditValue(newFormula);
        setSelectedFormulaText(null);
        // Set cursor position after the replaced text
        const newCursorPos = selectedFormulaText.start + newCellRef.length;
        setTimeout(() => {
          if (editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Only block new insertions if formula ends with ')' AND no text is selected for replacement
      if (editValue.trim().endsWith(")") && !selectedFormulaText) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Prevent any further processing of the click event
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    // If we're editing a cell and NOT in formula mode, save the value first
    if (editingCell && !isFormulaMode) {
      handleCellChange(editingCell.row, editingCell.col, editValue);
      setEditingCell(null);
      setEditValue("");
      setIsFormulaSelecting(false);
    }
    
    // Don't do normal cell selection when in formula mode
    if (isFormulaMode) {
      return;
    }
    
    // Handle cell selection first (works in both modes)
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
      
      // Show context menu immediately for extended selection (only in select mode)
      if (!editable) {
        showContextMenu(range, event);
      }
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
      
      // Show context menu immediately for single cell selection (only in select mode)
      if (!editable) {
        showContextMenu(range, event);
      }
    }
    
    // In edit mode, also start editing the clicked cell
    if (editable) {
      const cell = data[row]?.[col];
      const cellValue = cell?.formula || cell?.value || '';
      setEditingCell({ row, col });
      setEditValue(cellValue);
      
      // Save current state to history before starting to edit
      onChange([...data]);
      
      // Focus the input after state update
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 0);
    }
  }, [activeCell, editingCell, isResizing, onCellSelection, getSelectedCellsText, showContextMenu, editable, data, onChange, isFormulaMode, editValue, handleCellChange]);



  // Handle mouse down for selection
  const handleMouseDown = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (event.button !== 0 || isResizing) return; // Only handle left clicks
    
        // If we're in formula mode and editing, start formula selection
    if (isFormulaMode && editingCell) {
      // If clicking on the same cell that's being edited, allow normal mouse interaction
      if (editingCell.row === row && editingCell.col === col) {
        // Let normal mouse down behavior continue - don't prevent anything
        return;
      }
      // If user has selected text in the formula input and it's a valid cell reference, always allow replacement
      if (editInputRef.current && selectedFormulaText && isValidCellReference(selectedFormulaText.text)) {
        // Allow replacement (handled in click handler)
        return;
      }
      // Only block new insertions if formula ends with ')' AND no text is selected for replacement
      if (editValue.trim().endsWith(")") && !selectedFormulaText) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setIsFormulaSelecting(true);
      setIsSelecting(true);
      setSelectionStart({ row, col });
      const range: SelectionRange = {
        startRow: row,
        startCol: col,
        endRow: row,
        endCol: col
      };
      setSelectedRange(range);
      return;
    }
    
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
  }, [isResizing, isFormulaMode, editingCell, editValue]);

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
    
    // Handle formula selection completion
    if (isFormulaSelecting && editingCell && editInputRef.current) {
      const startRef = getCellReferenceLocal(selectedRange.startRow, selectedRange.startCol);
      const endRef = getCellReferenceLocal(selectedRange.endRow, selectedRange.endCol);
      const rangeRef = startRef === endRef ? startRef : `${startRef}:${endRef}`;
      

      
      const input = editInputRef.current;
      const cursorPos = input.selectionStart || 0;
      
      // Insert range reference at cursor position
      let result = insertCellReferenceIntoFormula(editValue, rangeRef, cursorPos);

      // If it's a function call and doesn't end with ')', auto-close
      if (needsClosingParen(result.newFormula)) {
        result.newFormula += ")";
        result.newCursorPosition = result.newFormula.length;
      }
      setEditValue(result.newFormula);
      setCursorPosition(result.newCursorPosition);
      
      // Set cursor position after state update
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.setSelectionRange(result.newCursorPosition, result.newCursorPosition);
        }
      }, 0);
      
      // Reset formula selection state
      setIsFormulaSelecting(false);
      setIsSelecting(false);
      setSelectedRange(null);
      return;
    }
    
    setIsSelecting(false);
    
    const selectedText = getSelectedCellsText(selectedRange);
    onCellSelection?.(selectedText, selectedRange, event);
    
    // Show context menu when drag selection ends (only in select mode)
    if (!editable) {
      showContextMenu(selectedRange, event);
    }
  }, [isSelecting, selectedRange, isResizing, onCellSelection, getSelectedCellsText, showContextMenu, editable, isFormulaMode, editingCell, isFormulaSelecting, editValue]);

  // Handle right click
  const handleRightClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (isResizing) return;
    
    event.preventDefault();
    
    // In edit mode, don't allow right-click context menu
    if (editable) return;
    
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
  }, [selectedRange, isResizing, onRightClick, getSelectedCellsText, showContextMenu, editable]);

  // Handle autocomplete for formulas
  const handleFormulaAutocomplete = useCallback((input: string) => {
    if (!input.startsWith('=')) {
      setShowAutocomplete(false);
      return;
    }

    const query = input.substring(1).toUpperCase();
    const suggestions = getAutocompleteSuggestions(query);
    
    if (suggestions.length > 0) {
      setAutocompleteSuggestions(suggestions);
      setSelectedSuggestionIndex(0);
      setShowAutocomplete(true);
      
      // Position autocomplete dropdown
      if (editInputRef.current) {
        const rect = editInputRef.current.getBoundingClientRect();
        setAutocompletePosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
    } else {
      setShowAutocomplete(false);
    }
  }, []);

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((suggestion: FormulaFunction) => {
    if (!editingCell) return;
    
    const currentValue = editValue.startsWith('=') ? editValue.substring(1) : editValue;
    const newValue = `=${suggestion.name}(`;
    setEditValue(newValue);
    setShowAutocomplete(false);
    
    // Focus back to input
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  }, [editingCell, editValue]);

  // Handle cell editing save
  const handleCellSave = useCallback(() => {
    if (editingCell) {
      handleCellChange(editingCell.row, editingCell.col, editValue);
      setEditingCell(null);
      setEditValue("");
      // Reset formula selection state when saving
      setIsFormulaSelecting(false);
      setSelectedFormulaText(null);
    }
  }, [editingCell, editValue, handleCellChange]);

  // Handle edit input key press
  const handleEditKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCellSave();
      
      // If no active cell, start with the first cell
      if (!activeCell) {
        const firstCell = { row: 0, col: 0 };
        setActiveCell(firstCell);
        setSelectedRange({
          startRow: firstCell.row,
          startCol: firstCell.col,
          endRow: firstCell.row,
          endCol: firstCell.col
        });
        
        const cell = data[firstCell.row]?.[firstCell.col];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell(firstCell);
        setEditValue(cellValue);
        
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
        return;
      }
      
      // Move to next row (or previous row with Shift)
      const direction = event.shiftKey ? -1 : 1;
      const nextRow = activeCell.row + direction;
      
      // Check bounds
      if (nextRow >= 0 && nextRow < rows) {
        const nextCol = activeCell.col;
        setActiveCell({ row: nextRow, col: nextCol });
        setSelectedRange({
          startRow: nextRow,
          startCol: nextCol,
          endRow: nextRow,
          endCol: nextCol
        });
        
        // Start editing the next cell
        const cell = data[nextRow]?.[nextCol];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell({ row: nextRow, col: nextCol });
        setEditValue(cellValue);
        
        // Save current state to history before starting to edit next cell
        onChange([...data]);
        
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingCell(null);
      setEditValue("");
      setIsFormulaSelecting(false);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      handleCellSave();
      
      // If no active cell, start with the first cell
      if (!activeCell) {
        const firstCell = { row: 0, col: 0 };
        setActiveCell(firstCell);
        setSelectedRange({
          startRow: firstCell.row,
          startCol: firstCell.col,
          endRow: firstCell.row,
          endCol: firstCell.col
        });
        
        const cell = data[firstCell.row]?.[firstCell.col];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell(firstCell);
        setEditValue(cellValue);
        
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
        return;
      }
      
      // Move to next column (or previous column with Shift)
      const direction = event.shiftKey ? -1 : 1;
      const nextCol = activeCell.col + direction;
      
      // Check bounds
      if (nextCol >= 0 && nextCol < cols) {
        const nextRow = activeCell.row;
        setActiveCell({ row: nextRow, col: nextCol });
        setSelectedRange({
          startRow: nextRow,
          startCol: nextCol,
          endRow: nextRow,
          endCol: nextCol
        });
        
        // Start editing the next cell
        const cell = data[nextRow]?.[nextCol];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell({ row: nextRow, col: nextCol });
        setEditValue(cellValue);
        
        // Save current state to history before starting to edit next cell
        onChange([...data]);
        
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
      }
    }
  }, [handleCellSave, activeCell, rows, cols, data, onChange]);

  // Handle arrow key navigation when not editing
  const handleArrowKeyNavigation = useCallback((event: React.KeyboardEvent) => {
    if (editingCell || !activeCell) return;
    
    let newRow = activeCell.row;
    let newCol = activeCell.col;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newRow = Math.max(0, activeCell.row - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newRow = Math.min(rows - 1, activeCell.row + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = Math.max(0, activeCell.col - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = Math.min(cols - 1, activeCell.col + 1);
        break;
      default:
        return;
    }
    
    // Update selection
    setActiveCell({ row: newRow, col: newCol });
    setSelectedRange({
      startRow: newRow,
      startCol: newCol,
      endRow: newRow,
      endCol: newCol
    });
    
    // If in edit mode, start editing the new cell
    if (editable) {
      const cell = data[newRow]?.[newCol];
      const cellValue = cell?.formula || cell?.value || '';
      setEditingCell({ row: newRow, col: newCol });
      setEditValue(cellValue);
      
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 0);
    }
  }, [editingCell, activeCell, rows, cols, editable, data]);

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
    
    // Show context menu immediately for column selection (only in select mode)
    if (!editable) {
      showContextMenu(range, event);
    }
  }, [isResizing, rows, onCellSelection, getSelectedCellsText, showContextMenu, editable]);

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
    
    // Show context menu immediately for row selection (only in select mode)
    if (!editable) {
      showContextMenu(range, event);
    }
  }, [isResizing, cols, onCellSelection, getSelectedCellsText, showContextMenu, editable]);

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

  // Check if cell is selected
  const isCellSelected = (row: number, col: number): boolean => {
    if (!selectedRange) return false;
    return row >= selectedRange.startRow && row <= selectedRange.endRow &&
           col >= selectedRange.startCol && col <= selectedRange.endCol;
  };

  // Check if cell is in drag fill preview
  const isCellInDragPreview = (row: number, col: number): boolean => {
    if (!isDraggingFill || !dragFillStart || !dragFillPreview) return false;
    
    const startRow = dragFillStart.row;
    const startCol = dragFillStart.col;
    const endRow = dragFillPreview.row;
    const endCol = dragFillPreview.col;
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  // Check if cell is active
  const isCellActive = (row: number, col: number): boolean => {
    return activeCell?.row === row && activeCell?.col === col;
  };

  // Drag fill helper functions
  const isDragHandle = (event: React.MouseEvent, row: number, col: number): boolean => {
    if (!editable) return false;
    
    const cell = event.currentTarget as HTMLElement;
    const rect = cell.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is near the bottom-right corner (drag handle area)
    const handleSize = 8;
    const isNearBottom = y >= rect.height - handleSize;
    const isNearRight = x >= rect.width - handleSize;
    
    return isNearBottom && isNearRight;
  };

  const detectSeriesPattern = (value: string): { isSeries: boolean; pattern: string; increment: number } => {
    // Check for common patterns
    const patterns = [
      // Numbers
      { regex: /^(\d+)$/, increment: 1 },
      // Text with numbers
      { regex: /^([A-Za-z]+)(\d+)$/, increment: 1 },
      // Dates (simple format)
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, increment: 1 },
      // Months
      { regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/, increment: 1 },
      // Days
      { regex: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/, increment: 1 }
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern.regex);
      if (match) {
        return { isSeries: true, pattern: pattern.regex.source, increment: pattern.increment };
      }
    }

    return { isSeries: false, pattern: '', increment: 0 };
  };

  const generateSeriesValue = (baseValue: string, index: number, pattern: string): string => {
    // Handle numbers
    if (/^\d+$/.test(baseValue)) {
      return String(parseInt(baseValue) + index);
    }
    
    // Handle text with numbers (e.g., "Item1", "Item2")
    const textNumberMatch = baseValue.match(/^([A-Za-z]+)(\d+)$/);
    if (textNumberMatch) {
      const [, text, number] = textNumberMatch;
      return `${text}${parseInt(number) + index}`;
    }
    
    // Handle months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(baseValue);
    if (monthIndex !== -1) {
      return months[(monthIndex + index) % 12];
    }
    
    // Handle days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = days.indexOf(baseValue);
    if (dayIndex !== -1) {
      return days[(dayIndex + index) % 7];
    }
    
    // Default: just copy the value
    return baseValue;
  };

  const handleDragFillStart = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (!editable || !isDragHandle(event, row, col)) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const cell = data[row]?.[col];
    const cellValue = cell?.formula || cell?.value || '';
    
    if (!cellValue.trim()) return;
    
    setIsDraggingFill(true);
    setDragFillStart({ row, col, value: cellValue });
    setDragFillPreview({ row, col });
    
    // Detect if this could be a series
    const { isSeries } = detectSeriesPattern(cellValue);
    setDragFillMode(isSeries ? 'series' : 'copy');
  }, [editable, data]);

  const handleDragFillMove = useCallback((event: MouseEvent) => {
    if (!isDraggingFill || !dragFillStart) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert screen coordinates to grid coordinates
    const cellWidth = columnWidths[dragFillStart.col] || DEFAULT_COLUMN_WIDTH;
    const cellHeight = rowHeights[dragFillStart.row] || DEFAULT_ROW_HEIGHT;
    
    // Calculate grid position
    let col = Math.floor((x - HEADER_WIDTH * scale) / (cellWidth * scale));
    let row = Math.floor((y - HEADER_HEIGHT * scale) / (cellHeight * scale));
    
    // Clamp to valid range
    col = Math.max(0, Math.min(cols - 1, col));
    row = Math.max(0, Math.min(rows - 1, row));
    
    // Determine direction
    const deltaRow = row - dragFillStart.row;
    const deltaCol = col - dragFillStart.col;
    
    if (Math.abs(deltaRow) > Math.abs(deltaCol)) {
      setDragFillDirection('vertical');
    } else {
      setDragFillDirection('horizontal');
    }
    
    setDragFillPreview({ row, col });
  }, [isDraggingFill, dragFillStart, columnWidths, rowHeights, scale, cols, rows]);

  const handleDragFillEnd = useCallback((event: MouseEvent) => {
    if (!isDraggingFill || !dragFillStart || !dragFillPreview) return;
    
    const newData = [...data];
    const startRow = dragFillStart.row;
    const startCol = dragFillStart.col;
    const endRow = dragFillPreview.row;
    const endCol = dragFillPreview.col;
    
    // Calculate the range to fill
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    // Fill the range
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        // Skip the original cell
        if (row === startRow && col === startCol) continue;
        
        // Ensure the row exists
        while (newData.length <= row) {
          newData.push([]);
        }
        
        // Ensure the column exists in this row
        while (newData[row].length <= col) {
          newData[row].push({ value: '' });
        }
        
        let newValue: string;
        
        if (dragFillMode === 'series') {
          // Calculate index for series
          const index = Math.abs(row - startRow) + Math.abs(col - startCol);
          newValue = generateSeriesValue(dragFillStart.value, index, '');
        } else {
          // Copy mode
          newValue = dragFillStart.value;
        }
        
        // Handle formula input
        if (isFormula(newValue)) {
          newData[row][col] = { 
            value: newValue.substring(1), // Store without '='
            formula: newValue,
            calculatedValue: undefined
          };
        } else {
          newData[row][col] = { value: newValue };
        }
      }
    }
    
    onChange(newData);
    
    // Update selection to the filled range
    const filledRange: SelectionRange = {
      startRow: minRow,
      startCol: minCol,
      endRow: maxRow,
      endCol: maxCol
    };
    setSelectedRange(filledRange);
    setActiveCell({ row: minRow, col: minCol });
    
    // Reset drag state
    setIsDraggingFill(false);
    setDragFillStart(null);
    setDragFillDirection(null);
    setDragFillPreview(null);
    setDragFillMode(null);
  }, [isDraggingFill, dragFillStart, dragFillPreview, dragFillMode, data, onChange]);

  // Global mouse event handlers
  useEffect(() => {
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (isSelecting) {
        setIsSelecting(false);
      }
      if (isResizing) {
        handleResizeEnd();
      }
      if (isDraggingFill) {
        handleDragFillEnd(event);
      }
    };

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isResizing) {
        handleResizeMove(event);
      }
      if (isDraggingFill) {
        handleDragFillMove(event);
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
  }, [isSelecting, isResizing, isDraggingFill, handleResizeMove, handleResizeEnd, handleDragFillMove, handleDragFillEnd, menuPosition, clearContextMenu]);

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

  // Keyboard shortcut handling for undo/redo when spreadsheet is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (onRedo) {
            e.preventDefault();
            onRedo();
          }
        } else {
          if (onUndo) {
            e.preventDefault();
            onUndo();
          }
        }
      }
      
      // Handle Enter and Tab to start editing when not currently editing
      if (editable && !editingCell && (e.key === 'Enter' || e.key === 'Tab') && activeCell) {
        e.preventDefault();
        const cell = data[activeCell.row]?.[activeCell.col];
        const cellValue = cell?.formula || cell?.value || '';
        setEditingCell(activeCell);
        setEditValue(cellValue);
        
        setTimeout(() => {
          editInputRef.current?.focus();
          editInputRef.current?.select();
        }, 0);
        return;
      }
      
      // Handle arrow key navigation when not editing
      if (!editingCell && activeCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newRow = activeCell.row;
        let newCol = activeCell.col;
        
        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, activeCell.row - 1);
            break;
          case 'ArrowDown':
            newRow = Math.min(rows - 1, activeCell.row + 1);
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, activeCell.col - 1);
            break;
          case 'ArrowRight':
            newCol = Math.min(cols - 1, activeCell.col + 1);
            break;
        }
        
        // Update selection
        setActiveCell({ row: newRow, col: newCol });
        setSelectedRange({
          startRow: newRow,
          startCol: newCol,
          endRow: newRow,
          endCol: newCol
        });
        
        // If in edit mode, start editing the new cell
        if (editable) {
          const cell = data[newRow]?.[newCol];
          const cellValue = cell?.formula || cell?.value || '';
          setEditingCell({ row: newRow, col: newCol });
          setEditValue(cellValue);
          
          setTimeout(() => {
            editInputRef.current?.focus();
            editInputRef.current?.select();
          }, 0);
        }
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [onUndo, onRedo, editingCell, activeCell, rows, cols, editable, data]);

  // Handle undo while editing a cell
  const handleUndoWhileEditing = useCallback(() => {
    if (editingCell) {
      const originalCell = data[editingCell.row]?.[editingCell.col];
      const originalValue = originalCell?.formula || originalCell?.value || '';
      setEditValue(originalValue);
    }
  }, [editingCell, data]);

  // Add keyboard handler for undo while editing
  useEffect(() => {
    const handleEditKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (editingCell) {
          e.preventDefault();
          e.stopPropagation();
          
          // Check if the current edit value is different from the original
          const originalCell = data[editingCell.row]?.[editingCell.col];
          const originalValue = originalCell?.formula || originalCell?.value || '';
          
          if (editValue !== originalValue) {
            // First undo: restore the original value of the current cell
            setEditValue(originalValue);
          } else {
            // Second undo: call the parent's undo function to undo previous changes
            if (onUndo) {
              onUndo();
            }
          }
        }
      }
    };
    
    const input = editInputRef.current;
    if (input) {
      input.addEventListener('keydown', handleEditKeyDown);
    }
    return () => {
      if (input) {
        input.removeEventListener('keydown', handleEditKeyDown);
      }
    };
  }, [editingCell, editValue, data, onUndo]);

  // Utility: Check if formula is a function call and needs closing parenthesis
  const needsClosingParen = (formula: string) => {
    // e.g. =SUM(A1:B2
    const match = formula.match(/^=\s*([A-Z]+)\([^)]*$/i);
    return !!match && !formula.trim().endsWith(")");
  };

  // Utility: Check if selected text is a valid cell reference
  const isValidCellReference = (text: string) => {
    // Match single cell (A1, B2, etc.) or range (A1:B2, etc.)
    return /^[A-Z]+\d+(:[A-Z]+\d+)?$/i.test(text.trim());
  };

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
                  const isInDragPreview = isCellInDragPreview(row, col);
                  const isFormulaHighlighted = isFormulaMode && highlightedReferences.has(`${row},${col}`);
                  const isInFormulaSelection = isFormulaSelecting && isSelected;
                  const isCurrentlyEditingCell = editingCell?.row === row && editingCell?.col === col;
                  return (
                    <div
                      key={col}
                      className={cn(
                        "border-b border-r border-border relative transition-colors flex-shrink-0",
                        "bg-background text-foreground",
                        selectedFormulaText && isValidCellReference(selectedFormulaText.text) && !isCurrentlyEditingCell ? "cursor-pointer" :
                        isFormulaSelecting && !isCurrentlyEditingCell ? "cursor-crosshair" : 
                        isCurrentlyEditingCell ? "cursor-text" : "cursor-cell",
                        isSelected && "bg-primary/10 border-primary/30",
                        isInDragPreview && "bg-primary/10 border-primary/30",
                        isActive && !selectedRange && "ring-2 ring-primary ring-inset",
                        isFormulaHighlighted && "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 ring-1 ring-blue-400 dark:ring-blue-500",
                        isInFormulaSelection && "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 ring-1 ring-green-400 dark:ring-green-500",
                        !isSelected && !isActive && !isInDragPreview && !isFormulaHighlighted && !isInFormulaSelection && "hover:bg-muted/30"
                      )}
                      style={{
                        width: columnWidths[col] || DEFAULT_COLUMN_WIDTH,
                        height: rowHeights[row] || DEFAULT_ROW_HEIGHT,
                        minWidth: MIN_COLUMN_WIDTH,
                      }}
                      onClick={(e) => handleCellClick(row, col, e)}
                      onMouseDown={(e) => handleMouseDown(row, col, e)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onContextMenu={(e) => handleRightClick(row, col, e)}
                    >
                      {isEditing ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditValue(newValue);
                              handleFormulaAutocomplete(newValue);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onSelect={(e) => {
                              const target = e.target as HTMLInputElement;
                              const start = target.selectionStart || 0;
                              const end = target.selectionEnd || 0;
                              
                              if (start !== end) {
                                const selectedText = editValue.substring(start, end);
                                setSelectedFormulaText({ start, end, text: selectedText });
                              } else {
                                setSelectedFormulaText(null);
                              }
                            }}
                            onKeyUp={(e) => {
                              const target = e.target as HTMLInputElement;
                              const start = target.selectionStart || 0;
                              const end = target.selectionEnd || 0;
                              
                              if (start !== end) {
                                const selectedText = editValue.substring(start, end);
                                setSelectedFormulaText({ start, end, text: selectedText });
                              } else {
                                setSelectedFormulaText(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (showAutocomplete) {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setSelectedSuggestionIndex(prev => 
                                    Math.min(prev + 1, autocompleteSuggestions.length - 1)
                                  );
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter' || e.key === 'Tab') {
                                  e.preventDefault();
                                  if (autocompleteSuggestions[selectedSuggestionIndex]) {
                                    handleAutocompleteSelect(autocompleteSuggestions[selectedSuggestionIndex]);
                                  } else {
                                    handleEditKeyPress(e);
                                  }
                                } else if (e.key === 'Escape') {
                                  setShowAutocomplete(false);
                                } else {
                                  handleEditKeyPress(e);
                                }
                              } else {
                                handleEditKeyPress(e);
                              }
                            }}
                            onBlur={(e) => {
                              // Don't save if we're in formula mode and just selecting cells
                              if (isFormulaMode && isFormulaSelecting) {
                                // Refocus the input to maintain formula editing
                                setTimeout(() => {
                                  if (editInputRef.current) {
                                    editInputRef.current.focus();
                                  }
                                }, 0);
                                return;
                              }
                              
                              setTimeout(() => {
                                setShowAutocomplete(false);
                              }, 200);
                              handleCellSave();
                            }}
                            className={cn(
                              "w-full h-full border-none outline-none px-3 py-2 text-sm",
                              "bg-background text-foreground",
                              "focus:bg-background focus:ring-0",
                              // Add visual indicator for multi-cell editing
                              selectedRange && 
                              (selectedRange.startRow !== selectedRange.endRow || selectedRange.startCol !== selectedRange.endCol) &&
                              "ring-2 ring-blue-500 ring-inset",
                              // Add visual indicator for formula selection mode
                              isFormulaSelecting && "ring-2 ring-green-500 ring-inset",
                              // Add visual indicator for text replacement mode
                              selectedFormulaText && isValidCellReference(selectedFormulaText.text) && "ring-2 ring-yellow-500 ring-inset"
                            )}
                            placeholder={
                              selectedFormulaText && isValidCellReference(selectedFormulaText.text)
                                ? `Click a cell to replace "${selectedFormulaText.text}"`
                                : isFormulaSelecting
                                  ? "Drag to select cell range for formula..."
                                  : selectedRange && 
                                    (selectedRange.startRow !== selectedRange.endRow || selectedRange.startCol !== selectedRange.endCol)
                                    ? `Editing ${(selectedRange.endRow - selectedRange.startRow + 1) * (selectedRange.endCol - selectedRange.startCol + 1)} cells`
                                    : undefined
                            }
                          />
                                                     {/* Drag handle for fill/copy */}
                           {editable && !isDraggingFill && (
                             <div
                               onMouseDown={(e) => handleDragFillStart(row, col, e)}
                               style={{
                                 position: 'absolute',
                                 right: 3,
                                 bottom: 3,
                                 width: 0,
                                 height: 0,
                                 borderStyle: 'solid',
                                 borderWidth: '0 0 8px 8px',
                                 borderColor: 'transparent transparent #2cbfa7 transparent',
                                 cursor: 'crosshair',
                                 zIndex: 20,
                               }}
                               title="Drag to fill/copy"
                             />
                           )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full px-3 py-2 text-sm overflow-hidden whitespace-nowrap text-ellipsis flex items-center",
                            "text-foreground",
                            isSelected && "select-none"
                          )}
                        >
                          {(() => {
                            const cellData = getCellDisplayValue(row, col);
                            return (
                              <span className={cn(cellData.isError && "text-red-500 font-medium")}>
                                {cellData.value}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                      {/* Selection border - show around entire range */}
                      {selectedRange && !isDraggingFill && (
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

                      {/* Drag fill border - show around entire drag range */}
                      {isDraggingFill && dragFillStart && dragFillPreview && (
                        <>
                          {/* Top border for first row */}
                          {row === Math.min(dragFillStart.row, dragFillPreview.row) && (
                            <div 
                              className="absolute top-0 left-0 right-0 border-t-2 border-primary pointer-events-none z-10"
                              style={{
                                left: col >= Math.min(dragFillStart.col, dragFillPreview.col) && col <= Math.max(dragFillStart.col, dragFillPreview.col) ? 0 : 'auto',
                                right: col >= Math.min(dragFillStart.col, dragFillPreview.col) && col <= Math.max(dragFillStart.col, dragFillPreview.col) ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Bottom border for last row */}
                          {row === Math.max(dragFillStart.row, dragFillPreview.row) && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 border-b-2 border-primary pointer-events-none z-10"
                              style={{
                                left: col >= Math.min(dragFillStart.col, dragFillPreview.col) && col <= Math.max(dragFillStart.col, dragFillPreview.col) ? 0 : 'auto',
                                right: col >= Math.min(dragFillStart.col, dragFillPreview.col) && col <= Math.max(dragFillStart.col, dragFillPreview.col) ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Left border for first column */}
                          {col === Math.min(dragFillStart.col, dragFillPreview.col) && (
                            <div 
                              className="absolute top-0 bottom-0 left-0 border-l-2 border-primary pointer-events-none z-10"
                              style={{
                                top: row >= Math.min(dragFillStart.row, dragFillPreview.row) && row <= Math.max(dragFillStart.row, dragFillPreview.row) ? 0 : 'auto',
                                bottom: row >= Math.min(dragFillStart.row, dragFillPreview.row) && row <= Math.max(dragFillStart.row, dragFillPreview.row) ? 0 : 'auto'
                              }}
                            />
                          )}
                          {/* Right border for last column */}
                          {col === Math.max(dragFillStart.col, dragFillPreview.col) && (
                            <div 
                              className="absolute top-0 bottom-0 right-0 border-r-2 border-primary pointer-events-none z-10"
                              style={{
                                top: row >= Math.min(dragFillStart.row, dragFillPreview.row) && row <= Math.max(dragFillStart.row, dragFillPreview.row) ? 0 : 'auto',
                                bottom: row >= Math.min(dragFillStart.row, dragFillPreview.row) && row <= Math.max(dragFillStart.row, dragFillPreview.row) ? 0 : 'auto'
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

      {/* Drag fill info - bottom middle when dragging */}
      {isDraggingFill && dragFillPreview && dragFillStart && (
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg px-4 py-1.5 pointer-events-none"
          )}
        >
          <span className="p-1 text-sm min-w-[4.5rem] text-center font-medium text-foreground">
            <span className="text-sm text-muted-foreground">
              {dragFillMode === 'series' ? 'Fill Series' : 'Copy'} - 
            </span>
            {getRangeReference({
              startRow: Math.min(dragFillStart.row, dragFillPreview.row),
              startCol: Math.min(dragFillStart.col, dragFillPreview.col),
              endRow: Math.max(dragFillStart.row, dragFillPreview.row),
              endCol: Math.max(dragFillStart.col, dragFillPreview.col)
            })}
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

      {/* Formula Autocomplete Dropdown */}
      {showAutocomplete && autocompletePosition && (
        <div
          ref={autocompleteRef}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: autocompletePosition.top,
            left: autocompletePosition.left,
            minWidth: '200px'
          }}
        >
          {autocompleteSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.name}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-muted transition-colors",
                index === selectedSuggestionIndex && "bg-primary/10 text-primary"
              )}
              onClick={() => handleAutocompleteSelect(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{suggestion.name}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                </div>
                <div className="text-xs text-muted-foreground">{suggestion.category}</div>
              </div>
              {suggestion.examples.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Example: {suggestion.examples[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 