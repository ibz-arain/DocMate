// Formula utilities for Excel-like spreadsheet functionality

export interface CellData {
  value: string;
  formula?: string;
  calculatedValue?: string | number;
}

export interface FormulaFunction {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  category: 'math' | 'text' | 'logical' | 'lookup' | 'date' | 'statistical';
}

export const FORMULA_FUNCTIONS: FormulaFunction[] = [
  // Math functions
  {
    name: 'SUM',
    description: 'Adds all numbers in a range of cells',
    syntax: 'SUM(number1, [number2], ...)',
    examples: ['SUM(A1:A10)', 'SUM(A1, B1, C1)', 'SUM(1, 2, 3)'],
    category: 'math'
  },
  {
    name: 'AVERAGE',
    description: 'Returns the average of a range of cells',
    syntax: 'AVERAGE(number1, [number2], ...)',
    examples: ['AVERAGE(A1:A10)', 'AVERAGE(A1, B1, C1)'],
    category: 'math'
  },
  {
    name: 'COUNT',
    description: 'Counts the number of cells that contain numbers',
    syntax: 'COUNT(value1, [value2], ...)',
    examples: ['COUNT(A1:A10)', 'COUNT(A1, B1, C1)'],
    category: 'statistical'
  },
  {
    name: 'MAX',
    description: 'Returns the largest value in a range',
    syntax: 'MAX(number1, [number2], ...)',
    examples: ['MAX(A1:A10)', 'MAX(A1, B1, C1)'],
    category: 'statistical'
  },
  {
    name: 'MIN',
    description: 'Returns the smallest value in a range',
    syntax: 'MIN(number1, [number2], ...)',
    examples: ['MIN(A1:A10)', 'MIN(A1, B1, C1)'],
    category: 'statistical'
  },
  {
    name: 'ROUND',
    description: 'Rounds a number to a specified number of digits',
    syntax: 'ROUND(number, num_digits)',
    examples: ['ROUND(A1, 2)', 'ROUND(3.14159, 2)'],
    category: 'math'
  },
  {
    name: 'ABS',
    description: 'Returns the absolute value of a number',
    syntax: 'ABS(number)',
    examples: ['ABS(A1)', 'ABS(-5)'],
    category: 'math'
  },
  // Text functions
  {
    name: 'CONCATENATE',
    description: 'Joins several text strings into one text string',
    syntax: 'CONCATENATE(text1, [text2], ...)',
    examples: ['CONCATENATE(A1, " ", B1)', 'CONCATENATE("Hello", " ", "World")'],
    category: 'text'
  },
  {
    name: 'LEFT',
    description: 'Returns the leftmost characters from a text string',
    syntax: 'LEFT(text, [num_chars])',
    examples: ['LEFT(A1, 3)', 'LEFT("Hello", 2)'],
    category: 'text'
  },
  {
    name: 'RIGHT',
    description: 'Returns the rightmost characters from a text string',
    syntax: 'RIGHT(text, [num_chars])',
    examples: ['RIGHT(A1, 3)', 'RIGHT("Hello", 2)'],
    category: 'text'
  },
  {
    name: 'LEN',
    description: 'Returns the number of characters in a text string',
    syntax: 'LEN(text)',
    examples: ['LEN(A1)', 'LEN("Hello")'],
    category: 'text'
  },
  // Logical functions
  {
    name: 'IF',
    description: 'Returns one value if a condition is true and another if it is false',
    syntax: 'IF(logical_test, value_if_true, [value_if_false])',
    examples: ['IF(A1>10, "High", "Low")', 'IF(A1=B1, "Match", "No Match")'],
    category: 'logical'
  },
  {
    name: 'AND',
    description: 'Returns TRUE if all arguments are TRUE',
    syntax: 'AND(logical1, [logical2], ...)',
    examples: ['AND(A1>0, A1<100)', 'AND(A1>0, B1>0)'],
    category: 'logical'
  },
  {
    name: 'OR',
    description: 'Returns TRUE if any argument is TRUE',
    syntax: 'OR(logical1, [logical2], ...)',
    examples: ['OR(A1>0, B1>0)', 'OR(A1="Yes", A1="Y")'],
    category: 'logical'
  },
  {
    name: 'NOT',
    description: 'Reverses the logic of its argument',
    syntax: 'NOT(logical)',
    examples: ['NOT(A1>0)', 'NOT(TRUE)'],
    category: 'logical'
  }
];

// Parse cell reference (A1, B2, etc.) - case insensitive
export function parseCellReference(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  
  const colStr = match[1].toUpperCase();
  const rowStr = match[2];
  
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  
  return {
    row: parseInt(rowStr) - 1,
    col: col - 1
  };
}

// Get cell reference from row/col
export function getCellReference(row: number, col: number): string {
  let colStr = '';
  let tempCol = col;
  
  while (tempCol >= 0) {
    colStr = String.fromCharCode(65 + (tempCol % 26)) + colStr;
    tempCol = Math.floor(tempCol / 26) - 1;
  }
  
  return `${colStr}${row + 1}`;
}

// Parse range reference (A1:B3, etc.)
export function parseRangeReference(ref: string): { startRow: number; startCol: number; endRow: number; endCol: number } | null {
  const parts = ref.split(':');
  if (parts.length !== 2) return null;
  
  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);
  
  if (!start || !end) return null;
  
  return {
    startRow: Math.min(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endRow: Math.max(start.row, end.row),
    endCol: Math.max(start.col, end.col)
  };
}

// Extract cell references from formula
export function extractCellReferences(formula: string): string[] {
  const cellRefPattern = /[A-Za-z]+\d+/g;
  return formula.match(cellRefPattern) || [];
}

// Check if a string is a formula
export function isFormula(value: string): boolean {
  return value.startsWith('=');
}

// Get cell value from data
function getCellValue(cell: CellData | undefined): string | number {
  if (!cell) return '';
  if (cell.calculatedValue !== undefined) {
    return cell.calculatedValue;
  }
  return cell.value || '';
}

// Parse function arguments from string
function parseFunctionArguments(argsStr: string, data: CellData[][], currentRow: number, currentCol: number): number[] {
  const args: number[] = [];
  
  // Split by comma, but handle nested parentheses
  let currentArg = '';
  let parenCount = 0;
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (char === '(') {
      parenCount++;
      currentArg += char;
    } else if (char === ')') {
      parenCount--;
      currentArg += char;
    } else if (char === ',' && parenCount === 0) {
      const value = evaluateArgument(currentArg.trim(), data, currentRow, currentCol);
      if (typeof value === 'number') {
        args.push(value);
      }
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg.trim()) {
    const value = evaluateArgument(currentArg.trim(), data, currentRow, currentCol);
    if (typeof value === 'number') {
      args.push(value);
    }
  }
  
  return args;
}

// Evaluate a single argument
function evaluateArgument(arg: string, data: CellData[][], currentRow: number, currentCol: number): number {
  // Check if it's a cell reference
  const cellRef = parseCellReference(arg);
  if (cellRef) {
    const cell = data[cellRef.row]?.[cellRef.col];
    const value = getCellValue(cell);
    return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  }
  
  // Check if it's a range reference
  const rangeRef = parseRangeReference(arg);
  if (rangeRef) {
    const values: number[] = [];
    for (let row = rangeRef.startRow; row <= rangeRef.endRow; row++) {
      for (let col = rangeRef.startCol; col <= rangeRef.endCol; col++) {
        const cell = data[row]?.[col];
        const value = getCellValue(cell);
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(numValue)) {
          values.push(numValue);
        }
      }
    }
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) : 0;
  }
  
  // Check if it's a number
  const numValue = parseFloat(arg);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  return 0;
}

// Calculate formula result
export function calculateFormula(formula: string, data: CellData[][], currentRow: number, currentCol: number): string | number {
  try {
    if (!formula.startsWith('=')) {
      return formula;
    }

    const cleanFormula = formula.substring(1).trim();
    
    // Handle simple cell reference
    const cellRef = parseCellReference(cleanFormula);
    if (cellRef) {
      const cell = data[cellRef.row]?.[cellRef.col];
      return getCellValue(cell);
    }
    
    // Handle function calls
    const funcMatch = cleanFormula.match(/^([A-Z]+)\((.*)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const argsStr = funcMatch[2];
      const args = parseFunctionArguments(argsStr, data, currentRow, currentCol);
      return executeFunction(funcName, args);
    }
    
    return formula;
  } catch (error) {
    console.error('Formula calculation error:', error);
    return '#ERROR!';
  }
}

// Execute a function
function executeFunction(funcName: string, args: number[]): string | number {
  switch (funcName) {
    case 'SUM':
      return args.reduce((sum, val) => sum + val, 0);
      
    case 'AVERAGE':
      return args.length > 0 ? args.reduce((sum, val) => sum + val, 0) / args.length : 0;
      
    case 'COUNT':
      return args.length;
      
    case 'MAX':
      return args.length > 0 ? Math.max(...args) : 0;
      
    case 'MIN':
      return args.length > 0 ? Math.min(...args) : 0;
      
    case 'ROUND':
      if (args.length >= 2) {
        return Math.round(args[0] * Math.pow(10, args[1])) / Math.pow(10, args[1]);
      }
      return args[0] || 0;
      
    case 'ABS':
      return Math.abs(args[0] || 0);
      
    default:
      return '#NAME?';
  }
}

// Get autocomplete suggestions
export function getAutocompleteSuggestions(input: string): FormulaFunction[] {
  if (!input) return FORMULA_FUNCTIONS;
  
  const query = input.toUpperCase();
  return FORMULA_FUNCTIONS.filter(func => 
    func.name.startsWith(query) || 
    func.name.includes(query)
  );
}

// Format formula for display
export function formatFormula(formula: string): string {
  if (!isFormula(formula)) return formula;
  
  // Add spaces around operators for better readability
  return formula
    .replace(/([+\-*/()=<>!&|,])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Validate formula syntax
export function validateFormula(formula: string): { isValid: boolean; error?: string } {
  if (!isFormula(formula)) {
    return { isValid: true };
  }
  
  try {
    // Basic syntax check
    const cleanFormula = formula.substring(1);
    const parenCount = (cleanFormula.match(/\(/g) || []).length - (cleanFormula.match(/\)/g) || []).length;
    
    if (parenCount !== 0) {
      return { isValid: false, error: 'Mismatched parentheses' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid formula syntax' };
  }
} 