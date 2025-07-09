"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Upload,
  MousePointer as MousePointerIcon,
  Table,
  Sparkles,
  Loader2,
  History,
  MessageCircle,
  Calculator,
  TrendingUp,
  PieChart,
  X,
  FileTextIcon,
  MinusIcon,
  PlusIcon,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDropzone } from "react-dropzone";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import { SideToolbar, Tool } from "@/components/document/side-toolbar";
import { ChatSidebar } from "@/components/document/chat-sidebar";
import { SummarizePopup } from "@/components/document/summarize-popup";
import { QuickFormatPopup } from "@/components/document/quick-format-popup";
import { TemplateFormatPopup } from "@/components/document/template-format-popup";
import { FullDocumentSummarizePopup } from "@/components/document/full-document-summarize-popup";
import { FullDocumentQuickFormatPopup } from "@/components/document/full-document-quick-format-popup";
import { FullDocumentTemplateFormatPopup } from "@/components/document/full-document-template-format-popup";
import { HistoryMiniPopup } from "@/components/document/history-mini-popup";
import { SpreadsheetContextMenu } from "@/components/spreadsheet/spreadsheet-context-menu";
import { EnhancedSpreadsheet } from "@/components/spreadsheet/enhanced-spreadsheet";
import { ChartGeneratorPopup } from "@/components/spreadsheet/chart-generator-popup";
import { useHistory } from "@/hooks/use-history";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectionRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export default function SpreadsheetPage() {
  const { history, clearHistory, addHistoryEntry } = useHistory();
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [dropText, setDropText] = useState("Drag & drop your CSV or Excel file here");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingAction, setProcessingAction] = useState<'summarize' | 'quickformat' | null>(null);
  const spreadsheetContainerRef = useRef<HTMLDivElement>(null);
  
  // Selection and context menu state
  const [selectedCells, setSelectedCells] = useState("");
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const [menuPos, setMenuPos] = useState<{top: number; left: number} | null>(null);
  const lastCursorRef = useRef<{x: number; y: number} | null>(null);
  
  // Popup states
  const [showSummarizePopup, setShowSummarizePopup] = useState(false);
  const [popupSelectedText, setPopupSelectedText] = useState("");
  const [popupSelectionData, setPopupSelectionData] = useState<any>(null);
  
  const [showTemplateFormatPopup, setShowTemplateFormatPopup] = useState(false);
  const [templateFormatSelectedText, setTemplateFormatSelectedText] = useState("");
  const [templateFormatSelectionData, setTemplateFormatSelectionData] = useState<any>(null);
  
  // Full document processing states
  const [showFullDocSummarizePopup, setShowFullDocSummarizePopup] = useState(false);
  const [showFullDocQuickFormatPopup, setShowFullDocQuickFormatPopup] = useState(false);
  const [showFullDocTemplateFormatPopup, setShowFullDocTemplateFormatPopup] = useState(false);
  const [fullDocSummarizeResult, setFullDocSummarizeResult] = useState<any>(null);
  const [fullDocQuickFormatResult, setFullDocQuickFormatResult] = useState<any>(null);
  
  // Chat sidebar state
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatSelectedText, setChatSelectedText] = useState("");
  const [chatSelectionData, setChatSelectionData] = useState<any>(null);
  const [chatPrefillText, setChatPrefillText] = useState<string>("");
  const [chatSidebarWidth, setChatSidebarWidth] = useState(0);
  
  // History popup state
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [historyPopupPosition, setHistoryPopupPosition] = useState({ top: 0, left: 0 });
  
  // Chart generator popup state
  const [showChartGeneratorPopup, setShowChartGeneratorPopup] = useState(false);
  const [chartGeneratorSelectedText, setChartGeneratorSelectedText] = useState("");
  const [chartGeneratorSelectionData, setChartGeneratorSelectionData] = useState<any>(null);
  const [cachedChartResult, setCachedChartResult] = useState<any>(null);
  
  // Tool selection (for consistency with document page)
  const [selectedTool, setSelectedTool] = useState<string | null>('cell');

  // Add zoom state and refs
  const [scale, setScale] = useState(1.0);
  const [showZoomFeedback, setShowZoomFeedback] = useState(false);
  const zoomFeedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingScaleRef = useRef<number>(scale);
  const lastScaleUpdateRef = useRef<number>(Date.now());
  const lastWheelEventRef = useRef<number>(0);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  // Clear cached edits for current spreadsheet
  const clearCachedEdits = () => {
    if (spreadsheetFile) {
      localStorage.removeItem(`docmate-spreadsheet-edits-${spreadsheetFile.name}`);
      // Reload the original file data
      processSpreadsheetFile(spreadsheetFile);
      toast({
        title: "Cached edits cleared",
        description: "Spreadsheet has been reset to original state.",
      });
    }
  };

  // Export spreadsheet to Excel
  const handleExportSpreadsheet = async () => {
    if (!spreadsheetFile || !spreadsheetData.length) {
      toast({
        title: "No spreadsheet loaded",
        description: "Please load a spreadsheet first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Show loading toast
      toast({
        title: "Exporting spreadsheet",
        description: "Generating Excel file...",
      });

      // Convert spreadsheet data to format suitable for XLSX
      const worksheetData = spreadsheetData.map(row => 
        row.map(cell => cell?.value || '')
      );

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Generate filename based on original file name
      const originalName = spreadsheetFile.name;
      const nameWithoutExtension = originalName.replace(/\.(csv|xls|xlsx)$/i, '');
      const exportFileName = `${nameWithoutExtension}-exported.xlsx`;

      // Write to file and download
      XLSX.writeFile(workbook, exportFileName);

      toast({
        title: "Export successful",
        description: "Your Excel file has been downloaded.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export spreadsheet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Cached results for history
  const [cachedSummaryResult, setCachedSummaryResult] = useState<any>(null);
  const [cachedTemplateFormatResult, setCachedTemplateFormatResult] = useState<any>(null);

  const dropTexts = [
    "Drag & drop your CSV or Excel file here",
    "Let's analyze your spreadsheet",
    "Drop it like it's hot",
    "Your data's new home",
    "Ready when you are"
  ];

  // Load spreadsheet from localStorage on component mount
  useEffect(() => {
    const loadStoredSpreadsheet = async () => {
      try {
        const storedSpreadsheetData = localStorage.getItem('docmate-spreadsheet-data');
        const storedSpreadsheetName = localStorage.getItem('docmate-spreadsheet-name');
        
        if (storedSpreadsheetData && storedSpreadsheetName) {
          // Convert base64 back to File
          const response = await fetch(storedSpreadsheetData);
          const blob = await response.blob();
          const file = new File([blob], storedSpreadsheetName, { 
            type: storedSpreadsheetName.endsWith('.csv') ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          setSpreadsheetFile(file);
          const newUrl = URL.createObjectURL(file);
          setSpreadsheetUrl(newUrl);
          setIsLoading(true);
          
          // Add a timeout to prevent infinite loading
          const loadingTimeout = setTimeout(() => {
            console.warn('Loading timeout reached, stopping loading state');
            setIsLoading(false);
          }, 10000); // 10 second timeout
          
          try {
            // Load cached spreadsheet data if available
            const cachedSpreadsheetData = localStorage.getItem(`docmate-spreadsheet-edits-${storedSpreadsheetName}`);
            if (cachedSpreadsheetData) {
              try {
                const parsedData = JSON.parse(cachedSpreadsheetData);
                // Validate that the cached data has the correct structure
                if (Array.isArray(parsedData) && parsedData.every(row => 
                  Array.isArray(row) && row.every(cell => 
                    cell === null || typeof cell === 'object' && cell !== null && 'value' in cell
                  )
                )) {
                  setSpreadsheetData(parsedData);
                  setIsLoading(false); // Stop loading when cached data is loaded
                } else {
                  console.warn('Cached data structure is invalid, falling back to original file');
                  await processSpreadsheetFile(file);
                }
              } catch (error) {
                console.error('Failed to parse cached spreadsheet data:', error);
                // Fall back to processing the original file
                await processSpreadsheetFile(file);
              }
            } else {
              // No cached edits, process the original file
              await processSpreadsheetFile(file);
            }
            
            // Restore selected tool if available
            const storedSelectedTool = localStorage.getItem('docmate-spreadsheet-tool');
            if (storedSelectedTool) {
              setSelectedTool(storedSelectedTool);
            }
          } finally {
            clearTimeout(loadingTimeout);
          }
        }
      } catch (error) {
        console.error('Failed to load stored spreadsheet:', error);
        // Clear corrupted data
        localStorage.removeItem('docmate-spreadsheet-data');
        localStorage.removeItem('docmate-spreadsheet-name');
        localStorage.removeItem('docmate-spreadsheet-tool');
        setIsLoading(false); // Ensure loading is stopped even on error
      }
    };

    loadStoredSpreadsheet();
  }, []);

  // Save spreadsheet state to localStorage whenever it changes
  useEffect(() => {
    if (spreadsheetFile && spreadsheetUrl) {
      const saveSpreadsheetToStorage = async () => {
        try {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result as string;
            localStorage.setItem('docmate-spreadsheet-data', base64Data);
            localStorage.setItem('docmate-spreadsheet-name', spreadsheetFile.name);
          };
          reader.readAsDataURL(spreadsheetFile);
        } catch (error) {
          console.error('Failed to save spreadsheet to storage:', error);
        }
      };
      
      saveSpreadsheetToStorage();
    }
  }, [spreadsheetFile, spreadsheetUrl]);

  // Save spreadsheet edits to localStorage whenever data changes
  useEffect(() => {
    if (spreadsheetFile && spreadsheetData.length > 0) {
      try {
        // Ensure data consistency before saving
        const sanitizedData = spreadsheetData.map(row => 
          row.map(cell => {
            if (cell === null || cell === undefined) {
              return { value: '' };
            }
            if (typeof cell === 'object' && cell !== null && 'value' in cell) {
              return cell;
            }
            // Handle case where cell might be a string or other type
            return { value: String(cell || '') };
          })
        );
        localStorage.setItem(`docmate-spreadsheet-edits-${spreadsheetFile.name}`, JSON.stringify(sanitizedData));
      } catch (error) {
        console.error('Failed to save spreadsheet edits to storage:', error);
      }
    }
  }, [spreadsheetData, spreadsheetFile]);

  // Save selected tool to localStorage whenever it changes
  useEffect(() => {
    if (selectedTool) {
      try {
        localStorage.setItem('docmate-spreadsheet-tool', selectedTool);
      } catch (error) {
        console.error('Failed to save selected tool to storage:', error);
      }
    }
  }, [selectedTool]);

  // Clean up URL object when component unmounts
  useEffect(() => {
    return () => {
      if (spreadsheetUrl) {
        URL.revokeObjectURL(spreadsheetUrl);
      }
    };
  }, [spreadsheetUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDropText(prev => {
        const currentIndex = dropTexts.indexOf(prev);
        return dropTexts[(currentIndex + 1) % dropTexts.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!spreadsheetUrl) return;

      // Tool selection shortcuts
      if (e.key === '1') {
        e.preventDefault();
        handleToolSelect('cell');
      }
      else if (e.key === '2') {
        e.preventDefault();
        handleToolSelect('edit');
      }
      // Export shortcut (Ctrl/Cmd + E)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (spreadsheetFile && spreadsheetData.length) {
          handleExportSpreadsheet();
        }
      }
      // Clear cached edits shortcut (Ctrl/Cmd + R)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (spreadsheetFile) {
          clearCachedEdits();
        }
      }
      // Escape to clear selection
      else if (e.key === 'Escape') {
        if (selectedCells && menuPos) {
          clearSelection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spreadsheetUrl, selectedCells, menuPos, handleToolSelect, spreadsheetFile, spreadsheetData, handleExportSpreadsheet, clearCachedEdits]);

  const processSpreadsheetFile = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) return;
        let rows: string[][] = [];
        
        if (file.name.endsWith(".csv")) {
          const text = result as string;
          rows = text
            .split(/\r?\n/)
            .filter((row) => row.trim() !== "")
            .map((row) => row.split(",").map(cell => cell.trim()));
        } else if (file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(result, { type: "binary" });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          rows = json;
        } else {
          toast({ title: "Unsupported file type", description: "Please upload a CSV or Excel file.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        
        // Convert to enhanced spreadsheet format
        const data = rows.map(row => row.map(cell => ({ value: cell || '' })));
        setSpreadsheetData(data);
        setIsLoading(false);
      };
      
      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (error) {
      toast({ title: "Error processing file", description: String(error), variant: "destructive" });
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileDrop(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const handleFileDrop = async (file: File) => {
    if (!file.name.match(/\.(csv|xls|xlsx)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file",
        variant: "destructive"
      });
      return;
    }
    
    if (spreadsheetUrl) {
      URL.revokeObjectURL(spreadsheetUrl);
    }
    
    // Clear cached edits from previous file if different
    if (spreadsheetFile && spreadsheetFile.name !== file.name) {
      localStorage.removeItem(`docmate-spreadsheet-edits-${spreadsheetFile.name}`);
    }
    
    setSpreadsheetFile(file);
    const newUrl = URL.createObjectURL(file);
    setSpreadsheetUrl(newUrl);
    setIsLoading(true);
    
    // Check if we have cached edits for this file
    const cachedSpreadsheetData = localStorage.getItem(`docmate-spreadsheet-edits-${file.name}`);
    if (cachedSpreadsheetData) {
      try {
        const parsedData = JSON.parse(cachedSpreadsheetData);
        // Validate that the cached data has the correct structure
        if (Array.isArray(parsedData) && parsedData.every(row => 
          Array.isArray(row) && row.every(cell => 
            cell === null || typeof cell === 'object' && cell !== null && 'value' in cell
          )
        )) {
          setSpreadsheetData(parsedData);
          setIsLoading(false); // Stop loading when cached data is loaded
          toast({
            title: "Restored edits",
            description: "Your previous edits have been restored.",
          });
        } else {
          console.warn('Cached data structure is invalid, falling back to original file');
          await processSpreadsheetFile(file);
        }
      } catch (error) {
        console.error('Failed to parse cached spreadsheet data:', error);
        await processSpreadsheetFile(file);
      }
    } else {
      await processSpreadsheetFile(file);
    }
  };

  // Clear spreadsheet and localStorage
  const clearSpreadsheet = () => {
    if (spreadsheetUrl) {
      URL.revokeObjectURL(spreadsheetUrl);
    }
    
    setSpreadsheetFile(null);
    setSpreadsheetUrl(null);
    setSpreadsheetData([]);
    setSelectedCells("");
    setSelectedRange(null);
    setMenuPos(null);
    setIsLoading(false);
    
    // Clear all popup states
    setShowSummarizePopup(false);
    setShowTemplateFormatPopup(false);
    setShowFullDocSummarizePopup(false);
    setShowFullDocQuickFormatPopup(false);
    setShowFullDocTemplateFormatPopup(false);
    setShowHistoryPopup(false);
    setShowChatSidebar(false);
    
    // Clear cached results
    setCachedSummaryResult(null);
    setCachedTemplateFormatResult(null);
    setFullDocSummarizeResult(null);
    setFullDocQuickFormatResult(null);
    
    // Clear localStorage
    localStorage.removeItem('docmate-spreadsheet-data');
    localStorage.removeItem('docmate-spreadsheet-name');
    localStorage.removeItem('docmate-spreadsheet-tool');
    
    // Clear cached edits for the current file
    if (spreadsheetFile) {
      localStorage.removeItem(`docmate-spreadsheet-edits-${spreadsheetFile.name}`);
    }
    
    // Reset to cell select mode when clearing
    setSelectedTool('cell');
    
    // Clear history when spreadsheet is cleared
    clearHistory();
    
    toast({
      title: "Spreadsheet cleared",
      description: "File and data have been cleared from the analyzer.",
    });
  };

  // Handle cell selection
  const handleCellSelection = (selectedText: string, range: SelectionRange, event: React.MouseEvent) => {
    setSelectedCells(selectedText);
    setSelectedRange(range);
    lastCursorRef.current = { x: event.clientX, y: event.clientY };
  };

  // Handle right click context menu
  const handleRightClick = (selectedText: string, range: SelectionRange, event: React.MouseEvent) => {
    setSelectedCells(selectedText);
    setSelectedRange(range);
    
    // Position menu at cursor location
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
    
    setMenuPos({ top, left });
  };

  // Handle context menu from cell selection
  const handleContextMenu = (selectedText: string, range: SelectionRange, position: { top: number; left: number }) => {
    setSelectedCells(selectedText);
    setSelectedRange(range);
    setMenuPos(position);
  };

  const clearSelection = () => {
    setSelectedCells("");
    setSelectedRange(null);
    setMenuPos(null);
  };

  // Context menu handlers
  const handleSummarizeData = () => {
    if (!selectedCells) return;
    
    setCachedSummaryResult(null);
    setPopupSelectedText(selectedCells);
    setPopupSelectionData(selectedRange);
    clearSelection();
    setShowSummarizePopup(true);
  };

  const handleTemplateFormat = () => {
    if (!selectedCells) return;
    
    setCachedTemplateFormatResult(null);
    setTemplateFormatSelectedText(selectedCells);
    setTemplateFormatSelectionData(selectedRange);
    clearSelection();
    setShowTemplateFormatPopup(true);
  };

  const handleChatPopup = () => {
    if (!selectedCells) return;
    
    setChatSelectedText(selectedCells);
    setChatSelectionData(selectedRange);
    setChatPrefillText(selectedCells);
    clearSelection();
    setShowChatSidebar(true);
  };

  const handleCopy = async () => {
    if (!selectedCells) return;
    
    try {
      await navigator.clipboard.writeText(selectedCells);
      clearSelection();
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy data to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleCreateChart = () => {
    if (!selectedCells || !selectedRange) return;
    
    setCachedChartResult(null);
    setChartGeneratorSelectedText(selectedCells);
    setChartGeneratorSelectionData(selectedRange);
    setShowChartGeneratorPopup(true);
    // Don't clear selection immediately - let the popup handle it
  };

  const handleSaveChartToHistory = (result: any) => {
    setCachedChartResult(result);
    
    // Save to history
    addHistoryEntry({
      type: 'chart-generator',
      title: `Chart Generation - ${result.charts?.length || 0} charts`,
      selectedText: chartGeneratorSelectedText,
      selectionData: chartGeneratorSelectionData,
      content: result,
      documentName: spreadsheetFile?.name || 'Spreadsheet'
    });
  };

  // Full document handlers
  const handleDocumentSummarize = async () => {
    if (!spreadsheetFile) {
      toast({
        title: "No spreadsheet loaded",
        description: "Please load a spreadsheet first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setProcessingAction('summarize');

      // Convert spreadsheet data to text
      const fullText = spreadsheetData.map((row, rowIndex) => {
        const rowData = row.map((cell, colIndex) => {
          const columnLetter = String.fromCharCode(65 + colIndex);
          return `${columnLetter}${rowIndex + 1}: ${cell.value || ''}`;
        }).filter(cell => cell.split(': ')[1].trim() !== '').join(', ');
        return rowData;
      }).filter(row => row.trim() !== '').join('\n');

      // Summarize the spreadsheet data
      const response = await fetch('/api/analyze/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize spreadsheet');
      }

      const summaryResult = await response.json();

      // Format the result to match expected structure
      const result = {
        analysis: {
          content: summaryResult.summary,
          summary: summaryResult.summary
        }
      };

      setFullDocSummarizeResult(result);
      setShowFullDocSummarizePopup(true);

    } catch (error) {
      console.error('Spreadsheet summarization error:', error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProcessingAction(null);
    }
  };

  const handleDocumentQuickFormat = async () => {
    if (!spreadsheetFile) {
      toast({
        title: "No spreadsheet loaded",
        description: "Please load a spreadsheet first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setProcessingAction('quickformat');

      // Convert spreadsheet data to structured format
      const fullText = spreadsheetData.map((row, rowIndex) => {
        const rowData = row.map((cell, colIndex) => {
          const columnLetter = String.fromCharCode(65 + colIndex);
          return `${columnLetter}${rowIndex + 1}: ${cell.value || ''}`;
        }).filter(cell => cell.split(': ')[1].trim() !== '').join(', ');
        return rowData;
      }).filter(row => row.trim() !== '').join('\n');

      const outputFormat = {
        documentType: "Spreadsheet Quick Format",
        tables: [
          {
            name: "data_structure",
            description: "Structure and organization of the spreadsheet data",
            type: "table" as const,
            fields: [
              {
                name: "section",
                type: "string",
                description: "Data section or category",
                required: true
              },
              {
                name: "data_type",
                type: "string", 
                description: "Type of data (numerical, text, date, etc.)",
                required: true
              },
              {
                name: "key_insights",
                type: "string",
                description: "Key insights or patterns in this section",
                required: false
              }
            ]
          },
          {
            name: "key_metrics",
            description: "Important metrics and values found in the data",
            type: "table" as const,
            fields: [
              {
                name: "metric",
                type: "string",
                description: "Name of the metric or measure",
                required: true
              },
              {
                name: "value",
                type: "string",
                description: "The actual value or range",
                required: true
              },
              {
                name: "significance",
                type: "string",
                description: "Why this metric is important",
                required: false
              }
            ]
          }
        ]
      };

      const prompt = `Analyze this spreadsheet data and extract its structure and key metrics:

${fullText}

Instructions:
1. Identify the main data sections and their types
2. Extract key metrics, numbers, and important values
3. Organize the data into a structured format
4. Identify patterns and relationships in the data
5. Provide insights about the data organization

Focus on making the spreadsheet data easily accessible and well-organized.`;

      const requestData = {
        imageData: btoa(unescape(encodeURIComponent(fullText))),
        mimeType: 'text/plain',
        customPrompt: prompt,
        outputFormat
      };

      const response = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Server processing error';
        } else {
          errorMessage = response.statusText || 'Server processing error';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response data from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      setFullDocQuickFormatResult(result);
      setShowFullDocQuickFormatPopup(true);

    } catch (error) {
      console.error('Spreadsheet processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setProcessingAction(null);
    }
  };

  const handleFullDocTemplateFormatStart = () => {
    setShowFullDocTemplateFormatPopup(true);
  };

  // Plain-text representation of the entire sheet – always up to date
  const fullSpreadsheetText = useMemo(() => {
    return spreadsheetData
      .map((row, rowIndex) => {
        const rowData = row
          .map((cell, colIndex) => {
            const columnLetter = String.fromCharCode(65 + colIndex);
            // Handle null/undefined cells and ensure cell.value exists
            const cellValue = cell?.value || '';
            return `${columnLetter}${rowIndex + 1}: ${cellValue}`;
          })
          .filter(cell => cell.split(': ')[1].trim() !== '')
          .join(', ');
        return rowData;
      })
      .filter(row => row.trim() !== '')
      .join('\n');
  }, [spreadsheetData]);

  const handleFullDocumentChat = () => {
    if (!spreadsheetFile) {
      toast({
        title: "No spreadsheet loaded",
        description: "Please load a spreadsheet first.",
        variant: "destructive"
      });
      return;
    }

    if (showChatSidebar) {
      setShowChatSidebar(false);
    } else {
      setChatSelectedText('[Full Document]'); // sentinel – same as PDF doc flow
      setChatSelectionData(null);
      setChatPrefillText('');
      setShowChatSidebar(true);
    }
  };

  // Handle summarize request
  const handleSummarizeRequest = async (text: string) => {
    try {
      const response = await fetch('/api/analyze/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to summarize data');
      }

      return await response.json();
    } catch (error) {
      console.error('Summarization error:', error);
      toast({
        title: 'Summarization failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Handle opening history entries
  const handleOpenHistoryEntry = (entry: any) => {
    setShowHistoryPopup(false);
    
    if (entry.type === 'summary') {
      const summaryResult = {
        success: true,
        summary: typeof entry.content === 'string' ? entry.content : entry.content?.summary || 'No summary available',
        originalLength: entry.selectedText.length,
        summaryLength: typeof entry.content === 'string' ? entry.content.length : (entry.content?.summary || '').length,
        compressionRatio: Math.round((1 - (typeof entry.content === 'string' ? entry.content.length : (entry.content?.summary || '').length) / entry.selectedText.length) * 100),
        processedAt: new Date(entry.timestamp).toISOString()
      };
      
      setCachedSummaryResult(summaryResult);
      setPopupSelectedText(entry.selectedText);
      setPopupSelectionData(entry.selectionData);
      setShowSummarizePopup(true);
    } else if (entry.type === 'template-format') {
      setCachedTemplateFormatResult(entry.content);
      setTemplateFormatSelectedText(entry.selectedText);
      setTemplateFormatSelectionData(entry.selectionData);
      setShowTemplateFormatPopup(true);
    } else if (entry.type === 'chart-generator') {
      setCachedChartResult(entry.content);
      setChartGeneratorSelectedText(entry.selectedText);
      setChartGeneratorSelectionData(entry.selectionData);
      setShowChartGeneratorPopup(true);
    } else if (entry.type === 'chat') {
      setChatSelectedText(entry.selectedText);
      setChatSelectionData(entry.selectionData);
      setShowChatSidebar(true);
    }
  };

  // Click outside to dismiss context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedCells && menuPos) {
        const target = e.target as Element;
        // Check if click is outside context menu and popups
        const contextMenu = target.closest('.z-50');
        if (!contextMenu) {
          clearSelection();
        }
      }
    };
  
    if (selectedCells && menuPos) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedCells, menuPos]);

  // Click outside to dismiss history popup
  useEffect(() => {
    const handleHistoryClickOutside = (e: MouseEvent) => {
      if (showHistoryPopup) {
        const target = e.target as Element;
        // Check if click is outside history popup
        const historyPopup = target.closest('.z-50');
        
        if (!historyPopup) {
          setShowHistoryPopup(false);
        }
      }
    };

    if (showHistoryPopup) {
      document.addEventListener('mousedown', handleHistoryClickOutside);
      return () => document.removeEventListener('mousedown', handleHistoryClickOutside);
    }
  }, [showHistoryPopup]);

  // Close history popup when spreadsheet is cleared
  useEffect(() => {
    if (!spreadsheetFile && showHistoryPopup) {
      setShowHistoryPopup(false);
    }
  }, [spreadsheetFile, showHistoryPopup]);

  // Tools for sidebar
  const tools: Tool[] = [
    { id: 'cell', label: 'Cell Select', icon: <Table className="h-5 w-5" /> },
    { id: 'edit', label: 'Edit', icon: <Pencil className="h-5 w-5" /> },
  ];

  // Smooth zoom update function
  const updateZoomSmooth = (newScale: number) => {
    pendingScaleRef.current = newScale;
    // Clear existing timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    const now = Date.now();
    const timeSinceLastUpdate = now - lastScaleUpdateRef.current;
    const delay = timeSinceLastUpdate > 100 ? 0 : 150;
    zoomTimeoutRef.current = setTimeout(() => {
      setScale(pendingScaleRef.current);
      lastScaleUpdateRef.current = Date.now();
    }, delay);
  };

  const showZoomFeedbackBriefly = () => {
    setShowZoomFeedback(true);
    if (zoomFeedbackTimeoutRef.current) {
      clearTimeout(zoomFeedbackTimeoutRef.current);
    }
    zoomFeedbackTimeoutRef.current = setTimeout(() => {
      setShowZoomFeedback(false);
    }, 1000);
  };

  const zoomIn = () => {
    const currentScale = pendingScaleRef.current;
    const newScale = Math.min(currentScale * 1.25, 3.0);
    updateZoomSmooth(newScale);
    showZoomFeedbackBriefly();
  };
  const zoomOut = () => {
    const currentScale = pendingScaleRef.current;
    const newScale = Math.max(currentScale * 0.8, 0.5);
    updateZoomSmooth(newScale);
    showZoomFeedbackBriefly();
  };
  const resetZoom = () => {
    updateZoomSmooth(1.0);
    showZoomFeedbackBriefly();
  };

  // Mouse wheel zoom with Ctrl/Cmd
  useEffect(() => {
    const container = spreadsheetContainerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastWheelEventRef.current < 16) return;
        lastWheelEventRef.current = now;
        const delta = Math.abs(e.deltaY);
        const baseFactor = 1.08;
        const adjustedFactor = delta > 100 ? baseFactor * 1.1 : baseFactor;
        const zoomFactor = e.deltaY > 0 ? 1 / adjustedFactor : adjustedFactor;
        const currentScale = pendingScaleRef.current;
        const newScale = Math.max(0.5, Math.min(3.0, currentScale * zoomFactor));
        updateZoomSmooth(newScale);
        showZoomFeedbackBriefly();
      }
    };
    // Touch pinch-to-zoom
    let initialDistance = 0;
    let initialScale = scale;
    let isGesturing = false;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = pendingScaleRef.current;
        isGesturing = true;
        setShowZoomFeedback(true);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isGesturing) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelEventRef.current < 32) return;
        lastWheelEventRef.current = now;
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        if (initialDistance > 0) {
          const scaleMultiplier = currentDistance / initialDistance;
          const newScale = Math.max(0.5, Math.min(3.0, initialScale * scaleMultiplier));
          updateZoomSmooth(newScale);
        }
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isGesturing = false;
        setShowZoomFeedback(false);
        initialDistance = 0;
        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current);
          setScale(pendingScaleRef.current);
        }
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, spreadsheetUrl]);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!spreadsheetUrl) return;
      if (e.key === '=' || e.key === '+') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomIn();
        }
      } else if (e.key === '-') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomOut();
        }
      } else if (e.key === '0') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          resetZoom();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spreadsheetUrl]);

  return (
    <>
      <Head>
        <title>Spreadsheet Analyzer | DocMate</title>
        <meta name="description" content="Analyze and process CSV and Excel spreadsheets with AI" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="spreadsheet" />
        
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <div className={cn(
            "grid gap-6 h-full transition-all duration-300",
            showChatSidebar 
              ? "lg:grid-cols-[1fr_400px_auto] grid-cols-1" 
              : "lg:grid-cols-[1fr_auto] grid-cols-1"
          )}>
            {/* Spreadsheet Viewer Card with Floating Controls */}
            <Card className="shadow-sm overflow-hidden relative" ref={spreadsheetContainerRef}>
              <CardContent className="p-0 h-full overflow-auto">
                {!spreadsheetUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-dots-primary/15">
                    {/* Dynamic Text Above Upload */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={dropText}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center mb-8"
                      >
                        <p className="text-2xl font-medium text-primary">
                          {isDragActive ? "Drop it right here!" : dropText}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Spreadsheet Upload */}
                    <div
                      {...getRootProps()}
                      className={cn(
                        "flex flex-col items-center justify-center py-12 px-8",
                        "transition-all duration-300 w-full max-w-md",
                        "border-2 border-dashed rounded-lg",
                        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50",
                        "group cursor-pointer relative overflow-hidden"
                      )}
                    >
                      <input {...getInputProps()} />
                      <motion.div 
                        className="space-y-6 text-center relative z-10"
                        animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
                      >
                        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">
                            Select or drop your spreadsheet
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            CSV/Excel files up to 10MB
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">CSV/XLS/XLSX</span>
                        </div>
                      </motion.div>
                      
                      {/* Animated background gradient */}
                      <div 
                        className={cn(
                          "absolute inset-0 transition-opacity duration-300",
                          isDragActive ? "opacity-100" : "opacity-0",
                          "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
                        )}
                        style={{
                          backgroundSize: '400% 400%',
                          animation: 'gradient 15s ease infinite',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}

                    {spreadsheetUrl && (
                      <>
                        {/* Mode Indicator - Top Left */}
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute top-4 left-4 z-20 flex items-center bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg px-3 py-1.5 cursor-help">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Mode: <span className="text-primary">{selectedTool === 'edit' ? 'Edit' : 'Cell Select'}</span>
                                  {spreadsheetData.length > 0 && (
                                    <span className="ml-2 text-green-600">• Export Ready</span>
                                  )}
                                  {spreadsheetFile && localStorage.getItem(`docmate-spreadsheet-edits-${spreadsheetFile.name}`) && (
                                    <span className="ml-2 text-blue-600">• Edits Cached</span>
                                  )}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start">
                              <div className="text-xs">
                                <p className="font-medium">Keyboard Shortcuts:</p>
                                <p>1 - Cell Select Mode</p>
                                <p>2 - Edit Mode</p>
                                <p>Ctrl+E - Export Excel</p>
                                <p>Ctrl+R - Reset to Original</p>
                                <p>Escape - Clear Selection</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Zoom Controls Bottom Center */}
                        <div className="absolute bottom-4 right-4 z-20 flex items-center bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg p-1 ring-2 ring-primary/10">
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5} className="h-8 w-8">
                                  <MinusIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Zoom out (Ctrl + Scroll)</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={resetZoom} className="h-8 px-2 min-w-[3rem]">
                                  <span className={cn("text-xs font-medium transition-colors", showZoomFeedback && "text-primary")}>{Math.round(scale * 100)}%</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Reset zoom to 100%</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3.0} className="h-8 w-8">
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Zoom in (Ctrl + Scroll)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Zoom Feedback Overlay */}
                        <AnimatePresence>
                          {showZoomFeedback && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute bottom-20 right-8 z-30 pointer-events-none"
                            >
                              <div className="bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border">
                                <div className="flex items-center space-x-2">
                                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                                  </div>
                                  <span className="text-lg font-medium text-primary">{Math.round(scale * 100)}%</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                    <EnhancedSpreadsheet
                      data={spreadsheetData}
                      onChange={setSpreadsheetData}
                      onCellSelection={handleCellSelection}
                      onRightClick={handleRightClick}
                      onContextMenu={handleContextMenu}
                      className="w-full h-full"
                      scale={scale}
                      editable={selectedTool === 'edit'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Chat Sidebar */}
            {showChatSidebar && (
              <div className="flex flex-col h-full overflow-hidden flex-shrink-0">
                <ChatSidebar
                  isOpen={showChatSidebar}
                  onClose={() => {
                    setShowChatSidebar(false);
                  }}
                  selectedText={chatSelectedText}
                  selectionData={chatSelectionData}
                  documentName={spreadsheetFile?.name}
                  documentText={fullSpreadsheetText}
                  currentPageNumber={1}
                  onWidthChange={setChatSidebarWidth}
                  prefillInput={chatPrefillText}
                />
              </div>
            )}
            
            {/* Side Toolbar */}
            <SideToolbar
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              tools={tools}
              pdfFile={spreadsheetFile}
              isAnalyzing={isAnalyzing}
              isLoading={isLoading}
              processingAction={processingAction}
              showChatSidebar={showChatSidebar}
              history={history}
              showHistoryPopup={showHistoryPopup}
              historyPopupPosition={historyPopupPosition}
              documentType="spreadsheet"
              onDocumentSummarize={handleDocumentSummarize}
              onDocumentQuickFormat={handleDocumentQuickFormat}
              onFullDocTemplateFormatStart={handleFullDocTemplateFormatStart}
              onFullDocumentChat={handleFullDocumentChat}
              onHistoryToggle={() => {}}
              onClearPdf={clearSpreadsheet}
              onExportPdf={() => {}}
              onExportSpreadsheet={handleExportSpreadsheet}
              onHistoryPopupToggle={(buttonRef) => {
                if (!showHistoryPopup && buttonRef) {
                  const rect = buttonRef.getBoundingClientRect();
                  setHistoryPopupPosition({
                    top: rect.top,
                    left: rect.left
                  });
                }
                setShowHistoryPopup(!showHistoryPopup);
              }}
            />
          </div>
        </main>
      </div>

      {/* Context Menu */}
      {selectedCells && menuPos && (
        <SpreadsheetContextMenu
          position={menuPos}
          selectedCells={selectedCells}
          selectedRange={selectedRange}
          onSummarizeData={handleSummarizeData}
          onTemplateFormat={handleTemplateFormat}
          onChatPopup={handleChatPopup}
          onCopy={handleCopy}
          onCreateChart={handleCreateChart}
          onClose={clearSelection}
        />
      )}

      {/* Popups */}
      <SummarizePopup
        isOpen={showSummarizePopup}
        onClose={() => {
          setShowSummarizePopup(false);
          setPopupSelectedText("");
          setPopupSelectionData(null);
          setCachedSummaryResult(null);
        }}
        selectedText={popupSelectedText}
        selectionData={popupSelectionData}
        documentName={spreadsheetFile?.name}
        currentPageNumber={1}
        cachedResult={cachedSummaryResult}
        onSummarize={handleSummarizeRequest}
      />

      <TemplateFormatPopup
        isOpen={showTemplateFormatPopup}
        onClose={() => {
          setShowTemplateFormatPopup(false);
          setTemplateFormatSelectedText("");
          setTemplateFormatSelectionData(null);
          setCachedTemplateFormatResult(null);
        }}
        selectedText={templateFormatSelectedText}
        selectionData={templateFormatSelectionData}
        documentName={spreadsheetFile?.name}
        currentPageNumber={1}
        cachedResult={cachedTemplateFormatResult}
      />

      {/* Full Document Popups */}
      <FullDocumentSummarizePopup
        isOpen={showFullDocSummarizePopup}
        onClose={() => {
          setShowFullDocSummarizePopup(false);
          setFullDocSummarizeResult(null);
        }}
        result={fullDocSummarizeResult}
        documentName={spreadsheetFile?.name}
      />

      <FullDocumentQuickFormatPopup
        isOpen={showFullDocQuickFormatPopup}
        onClose={() => {
          setShowFullDocQuickFormatPopup(false);
          setFullDocQuickFormatResult(null);
        }}
        result={fullDocQuickFormatResult}
        documentName={spreadsheetFile?.name}
      />

      <FullDocumentTemplateFormatPopup
        isOpen={showFullDocTemplateFormatPopup}
        onClose={() => {
          setShowFullDocTemplateFormatPopup(false);
        }}
        pdfFile={spreadsheetFile}
        documentName={spreadsheetFile?.name}
      />

      {/* History Mini Popup */}
      <HistoryMiniPopup
        isOpen={showHistoryPopup}
        onClose={() => setShowHistoryPopup(false)}
        position={historyPopupPosition}
        onOpenEntry={handleOpenHistoryEntry}
      />

      {/* Chart Generator Popup */}
      <ChartGeneratorPopup
        isOpen={showChartGeneratorPopup}
        onClose={() => {
          setShowChartGeneratorPopup(false);
          setChartGeneratorSelectedText("");
          setChartGeneratorSelectionData(null);
          clearSelection();
        }}
        selectedCells={chartGeneratorSelectedText}
        selectedRange={chartGeneratorSelectionData}
        spreadsheetData={spreadsheetData}
        cachedResult={cachedChartResult}
        onSaveToHistory={handleSaveChartToHistory}
      />

      {/* CSS for animated gradient background */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-dots-primary\/15 {
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--primary) / 0.15) 2px, transparent 0);
          background-size: 40px 40px;
          background-position: center;
        }
      `}</style>
    </>
  );
} 