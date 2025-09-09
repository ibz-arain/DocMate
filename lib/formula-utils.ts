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

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: 'syntax' | 'reference' | 'circular' | 'name' | 'value' | 'div' | 'na';
  position?: { start: number; end: number };
}

export interface CellReference {
  row: number;
  col: number;
  absolute?: { row: boolean; col: boolean };
}

export interface RangeReference {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  absolute?: { 
    startRow: boolean; 
    startCol: boolean; 
    endRow: boolean; 
    endCol: boolean 
  };
}

export interface FormulaParseResult {
  type: 'cell' | 'range' | 'function' | 'value' | 'operator' | 'error';
  value: any;
  position: { start: number; end: number };
  references?: (CellReference | RangeReference)[];
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
  {
    name: 'SQRT',
    description: 'Returns the square root of a number',
    syntax: 'SQRT(number)',
    examples: ['SQRT(A1)', 'SQRT(16)'],
    category: 'math'
  },
  {
    name: 'POWER',
    description: 'Returns the result of a number raised to a power',
    syntax: 'POWER(number, power)',
    examples: ['POWER(A1, 2)', 'POWER(2, 3)'],
    category: 'math'
  },
  
  // Statistical functions
  {
    name: 'COUNT',
    description: 'Counts the number of cells that contain numbers',
    syntax: 'COUNT(value1, [value2], ...)',
    examples: ['COUNT(A1:A10)', 'COUNT(A1, B1, C1)'],
    category: 'statistical'
  },
  {
    name: 'COUNTA',
    description: 'Counts the number of non-empty cells',
    syntax: 'COUNTA(value1, [value2], ...)',
    examples: ['COUNTA(A1:A10)', 'COUNTA(A1, B1, C1)'],
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
  {
    name: 'UPPER',
    description: 'Converts text to uppercase',
    syntax: 'UPPER(text)',
    examples: ['UPPER(A1)', 'UPPER("hello")'],
    category: 'text'
  },
  {
    name: 'LOWER',
    description: 'Converts text to lowercase',
    syntax: 'LOWER(text)',
    examples: ['LOWER(A1)', 'LOWER("HELLO")'],
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

// Enhanced cell reference parsing with absolute references
export function parseCellReference(ref: string): CellReference | null {
  const match = ref.match(/^(\$?)([A-Za-z]+)(\$?)(\d+)$/);
  if (!match) return null;
  
  const [, colAbsolute, colStr, rowAbsolute, rowStr] = match;
  
  let col = 0;
  const upperCol = colStr.toUpperCase();
  for (let i = 0; i < upperCol.length; i++) {
    col = col * 26 + (upperCol.charCodeAt(i) - 64);
  }
  
  return {
    row: parseInt(rowStr) - 1,
    col: col - 1,
    absolute: {
      row: rowAbsolute === '$',
      col: colAbsolute === '$'
    }
  };
}

// Get cell reference from row/col with absolute option
export function getCellReference(row: number, col: number, absolute?: { row: boolean; col: boolean }): string {
  let colStr = '';
  let tempCol = col;
  
  while (tempCol >= 0) {
    colStr = String.fromCharCode(65 + (tempCol % 26)) + colStr;
    tempCol = Math.floor(tempCol / 26) - 1;
  }
  
  const colPrefix = absolute?.col ? '$' : '';
  const rowPrefix = absolute?.row ? '$' : '';
  
  return `${colPrefix}${colStr}${rowPrefix}${row + 1}`;
}

// Enhanced range reference parsing with absolute references
export function parseRangeReference(ref: string): RangeReference | null {
  const parts = ref.split(':');
  if (parts.length !== 2) return null;
  
  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);
  
  if (!start || !end) return null;
  
  return {
    startRow: Math.min(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endRow: Math.max(start.row, end.row),
    endCol: Math.max(start.col, end.col),
    absolute: {
      startRow: start.absolute?.row || false,
      startCol: start.absolute?.col || false,
      endRow: end.absolute?.row || false,
      endCol: end.absolute?.col || false
    }
  };
}

// Get range reference string with absolute options
export function getRangeReference(range: RangeReference): string {
  const startRef = getCellReference(range.startRow, range.startCol, {
    row: range.absolute?.startRow || false,
    col: range.absolute?.startCol || false
  });
  const endRef = getCellReference(range.endRow, range.endCol, {
    row: range.absolute?.endRow || false,
    col: range.absolute?.endCol || false
  });
  return `${startRef}:${endRef}`;
}

// Extract all cell and range references from formula with positions
export function extractFormulaReferences(formula: string): Array<{
  type: 'cell' | 'range';
  reference: CellReference | RangeReference;
  text: string;
  position: { start: number; end: number };
}> {
  const references: Array<{
    type: 'cell' | 'range';
    reference: CellReference | RangeReference;
    text: string;
    position: { start: number; end: number };
  }> = [];
  
  // Pattern for cell references (including absolute references)
  const cellPattern = /(\$?[A-Za-z]+\$?\d+)/g;
  let match;
  
  while ((match = cellPattern.exec(formula)) !== null) {
    const refText = match[1];
    const start = match.index;
    const end = start + refText.length;
    
    // Check if it's a range (contains :)
    if (formula[end] === ':') {
      // Look for the end of the range
      const rangePattern = /(\$?[A-Za-z]+\$?\d+):(\$?[A-Za-z]+\$?\d+)/g;
      rangePattern.lastIndex = start;
      const rangeMatch = rangePattern.exec(formula);
      
      if (rangeMatch && rangeMatch.index === start) {
        const rangeRef = parseRangeReference(rangeMatch[0]);
        if (rangeRef) {
          references.push({
            type: 'range',
            reference: rangeRef,
            text: rangeMatch[0],
            position: { start, end: start + rangeMatch[0].length }
          });
          cellPattern.lastIndex = start + rangeMatch[0].length;
          continue;
        }
      }
    }
    
    // Single cell reference
    const cellRef = parseCellReference(refText);
    if (cellRef) {
      references.push({
        type: 'cell',
        reference: cellRef,
        text: refText,
        position: { start, end }
      });
    }
  }
  
  return references;
}

// Check if a string is a formula
export function isFormula(value: any): boolean {
  return typeof value === 'string' && value.startsWith('=');
}

// Enhanced formula validation with detailed error reporting
export function validateFormula(formula: any): ValidationResult {
  if (typeof formula !== 'string' || !isFormula(formula)) {
    return { isValid: true };
  }
  
  try {
    const cleanFormula = formula.substring(1).trim();
    
    if (!cleanFormula) {
      return { 
        isValid: false, 
        error: 'Empty formula', 
        errorType: 'syntax',
        position: { start: 1, end: 1 }
      };
    }
    
    // Check parentheses balance
    let parenCount = 0;
    let parenPositions: number[] = [];
    
    for (let i = 0; i < cleanFormula.length; i++) {
      const char = cleanFormula[i];
      if (char === '(') {
        parenCount++;
        parenPositions.push(i);
      } else if (char === ')') {
        parenCount--;
        if (parenCount < 0) {
          return {
            isValid: false,
            error: 'Unexpected closing parenthesis',
            errorType: 'syntax',
            position: { start: i + 1, end: i + 2 }
          };
        }
      }
    }
    
    if (parenCount !== 0) {
      return {
        isValid: false,
        error: 'Mismatched parentheses',
        errorType: 'syntax',
        position: { start: 0, end: cleanFormula.length }
      };
    }
    
    // Validate function names
    const funcPattern = /([A-Za-z][A-Za-z0-9_]*)\s*\(/g;
    let funcMatch;
    
    while ((funcMatch = funcPattern.exec(cleanFormula)) !== null) {
      const funcName = funcMatch[1].toUpperCase();
      const knownFunctions = FORMULA_FUNCTIONS.map(f => f.name);
      
      if (!knownFunctions.includes(funcName)) {
        return {
          isValid: false,
          error: `Unknown function: ${funcName}`,
          errorType: 'name',
          position: { start: funcMatch.index + 1, end: funcMatch.index + funcMatch[1].length + 1 }
        };
      }
    }
    
    // Validate cell references
    const references = extractFormulaReferences(cleanFormula);
    for (const ref of references) {
      if (ref.type === 'cell') {
        const cellRef = ref.reference as CellReference;
        if (cellRef.row < 0 || cellRef.col < 0 || cellRef.row > 1048575 || cellRef.col > 16383) {
          return {
            isValid: false,
            error: `Invalid cell reference: ${ref.text}`,
            errorType: 'reference',
            position: ref.position
          };
        }
      } else if (ref.type === 'range') {
        const rangeRef = ref.reference as RangeReference;
        if (rangeRef.startRow < 0 || rangeRef.startCol < 0 || 
            rangeRef.endRow < 0 || rangeRef.endCol < 0 ||
            rangeRef.startRow > 1048575 || rangeRef.startCol > 16383 ||
            rangeRef.endRow > 1048575 || rangeRef.endCol > 16383) {
          return {
            isValid: false,
            error: `Invalid range reference: ${ref.text}`,
            errorType: 'reference',
            position: ref.position
          };
        }
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid formula syntax', 
      errorType: 'syntax' 
    };
  }
}

// Check for circular references
export function hasCircularReference(
  formula: string, 
  currentRow: number, 
  currentCol: number, 
  data: CellData[][],
  visited: Set<string> = new Set()
): boolean {
  const currentCell = `${currentRow},${currentCol}`;
  
  if (visited.has(currentCell)) {
    return true; // Circular reference detected
  }
  
  visited.add(currentCell);
  
  const references = extractFormulaReferences(formula);
  
    for (const ref of references) {
    if (ref.type === 'cell') {
      const cellRef = ref.reference as CellReference;
      const cell = data[cellRef.row]?.[cellRef.col];
      
      if (cell?.formula) {
        if (hasCircularReference(cell.formula, cellRef.row, cellRef.col, data, new Set(Array.from(visited)))) {
          return true;
        }
      }
    } else if (ref.type === 'range') {
      const rangeRef = ref.reference as RangeReference;
      
      for (let row = rangeRef.startRow; row <= rangeRef.endRow; row++) {
        for (let col = rangeRef.startCol; col <= rangeRef.endCol; col++) {
          const cell = data[row]?.[col];
          
          if (cell?.formula) {
            if (hasCircularReference(cell.formula, row, col, data, new Set(Array.from(visited)))) {
              return true;
            }
          }
        }
      }
    }
  }
  
  visited.delete(currentCell);
  return false;
}

// Get cell value with proper type handling
function getCellValue(cell: CellData | undefined): string | number {
  if (!cell) return '';
  
  if (cell.calculatedValue !== undefined) {
    return cell.calculatedValue;
  }
  
  // Try to parse as number
  const numValue = parseFloat(cell.value);
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue;
  }
  
  return cell.value || '';
}

// Enhanced argument parsing with better type handling
function parseFormulaArguments(argsStr: string, data: CellData[][], currentRow: number, currentCol: number): any[] {
  if (!argsStr.trim()) return [];
  
  const args: any[] = [];
  let currentArg = '';
  let parenCount = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      currentArg += char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
      currentArg += char;
    } else if (!inQuotes && char === '(') {
      parenCount++;
      currentArg += char;
    } else if (!inQuotes && char === ')') {
      parenCount--;
      currentArg += char;
    } else if (!inQuotes && char === ',' && parenCount === 0) {
      const value = evaluateArgument(currentArg.trim(), data, currentRow, currentCol);
      args.push(value);
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg.trim()) {
    const value = evaluateArgument(currentArg.trim(), data, currentRow, currentCol);
    args.push(value);
  }
  
  return args;
}

// Enhanced argument evaluation with better type support
function evaluateArgument(arg: string, data: CellData[][], currentRow: number, currentCol: number): any {
  // Handle quoted strings
  if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
    return arg.slice(1, -1);
  }
  
  // Handle boolean literals
  if (arg.toLowerCase() === 'true') return true;
  if (arg.toLowerCase() === 'false') return false;
  
  // Handle cell reference
  const cellRef = parseCellReference(arg);
  if (cellRef) {
    const cell = data[cellRef.row]?.[cellRef.col];
    return getCellValue(cell);
  }
  
  // Handle range reference
  const rangeRef = parseRangeReference(arg);
  if (rangeRef) {
    const values: any[] = [];
    for (let row = rangeRef.startRow; row <= rangeRef.endRow; row++) {
      for (let col = rangeRef.startCol; col <= rangeRef.endCol; col++) {
        const cell = data[row]?.[col];
        values.push(getCellValue(cell));
      }
    }
    return values;
  }
  
  // Handle number
  const numValue = parseFloat(arg);
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue;
  }
  
  // Handle nested function calls
  const funcMatch = arg.match(/^([A-Z]+)\((.*)\)$/i);
  if (funcMatch) {
    const funcName = funcMatch[1].toUpperCase();
    const funcArgs = parseFormulaArguments(funcMatch[2], data, currentRow, currentCol);
    return executeFunction(funcName, funcArgs);
  }
  
  // Default to string
  return arg;
}

// Enhanced formula calculation with better error handling
export function calculateFormula(formula: any, data: CellData[][], currentRow: number, currentCol: number): string | number {
  try {
    if (typeof formula !== 'string' || !formula.startsWith('=')) {
      return formula;
    }

    const cleanFormula = formula.substring(1).trim();
    
    // Check for circular references
    if (hasCircularReference(formula, currentRow, currentCol, data)) {
      return '#CIRCULAR!';
    }
    
    // Validate formula first
    const validation = validateFormula(formula);
    if (!validation.isValid) {
      switch (validation.errorType) {
        case 'reference': return '#REF!';
        case 'name': return '#NAME?';
        case 'syntax': return '#ERROR!';
        default: return '#ERROR!';
      }
    }
    
    // Handle simple cell reference
    const cellRef = parseCellReference(cleanFormula);
    if (cellRef) {
      if (cellRef.row === currentRow && cellRef.col === currentCol) {
        return '#CIRCULAR!';
      }
      const cell = data[cellRef.row]?.[cellRef.col];
      return getCellValue(cell);
    }
    
    // Handle function calls
    const funcMatch = cleanFormula.match(/^([A-Z]+)\((.*)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const argsStr = funcMatch[2];
      const args = parseFormulaArguments(argsStr, data, currentRow, currentCol);
      return executeFunction(funcName, args);
    }
    
    // Handle basic arithmetic expressions
    const arithmeticResult = evaluateArithmeticExpression(cleanFormula, data, currentRow, currentCol);
    if (arithmeticResult !== null) {
      return arithmeticResult;
    }
    
    return '#ERROR!';
  } catch (error) {
    console.error('Formula calculation error:', error);
    return '#ERROR!';
  }
}

// Basic arithmetic expression evaluation
function evaluateArithmeticExpression(expression: string, data: CellData[][], currentRow: number, currentCol: number): number | null {
  try {
    // Simple arithmetic with cell references
    // This is a basic implementation - could be enhanced with a proper expression parser
    
    // Replace cell references with their values
    const references = extractFormulaReferences(expression);
    let evaluatedExpression = expression;
    
    // Sort by position (reverse order to maintain positions)
    references.sort((a, b) => b.position.start - a.position.start);
    
    for (const ref of references) {
      if (ref.type === 'cell') {
        const cellRef = ref.reference as CellReference;
        const value = getCellValue(data[cellRef.row]?.[cellRef.col]);
        const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        evaluatedExpression = evaluatedExpression.substring(0, ref.position.start) + 
                             numValue + 
                             evaluatedExpression.substring(ref.position.end);
      } else if (ref.type === 'range') {
        // Range handling would be more complex; for now, replace with 0
        evaluatedExpression = evaluatedExpression.substring(0, ref.position.start) + 
                             '0' + 
                             evaluatedExpression.substring(ref.position.end);
      }
    }
    
    // Basic safety check for dangerous operations
    if (/[^0-9+\-*/.() ]/.test(evaluatedExpression)) {
      return null;
    }
    
    // Evaluate the expression (in a real implementation, use a safe math parser)
    const result = Function('"use strict"; return (' + evaluatedExpression + ')')();
    
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

// Enhanced function execution with better error handling
function executeFunction(funcName: string, args: any[]): string | number {
  try {
    switch (funcName) {
      case 'SUM':
        return executeSumFunction(args);
        
      case 'AVERAGE':
        const numbers = flattenToNumbers(args);
        return numbers.length > 0 ? numbers.reduce((sum, val) => sum + val, 0) / numbers.length : 0;
        
      case 'COUNT':
        return flattenToNumbers(args).length;
        
      case 'COUNTA':
        return flattenToValues(args).filter(v => v !== '' && v !== null && v !== undefined).length;
        
      case 'MAX':
        const maxNumbers = flattenToNumbers(args);
        return maxNumbers.length > 0 ? Math.max(...maxNumbers) : 0;
        
      case 'MIN':
        const minNumbers = flattenToNumbers(args);
        return minNumbers.length > 0 ? Math.min(...minNumbers) : 0;
        
      case 'ROUND':
        if (args.length >= 2) {
          const num = parseFloat(String(args[0])) || 0;
          const digits = parseInt(String(args[1])) || 0;
          return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
        }
        return parseFloat(String(args[0])) || 0;
        
      case 'ABS':
        return Math.abs(parseFloat(String(args[0])) || 0);
        
      case 'SQRT':
        const sqrtArg = parseFloat(String(args[0])) || 0;
        return sqrtArg >= 0 ? Math.sqrt(sqrtArg) : '#NUM!';
        
      case 'POWER':
        if (args.length >= 2) {
          const base = parseFloat(String(args[0])) || 0;
          const exponent = parseFloat(String(args[1])) || 0;
          return Math.pow(base, exponent);
        }
        return '#VALUE!';
        
      case 'CONCATENATE':
        return args.map(arg => String(arg || '')).join('');
        
      case 'LEFT':
        const leftText = String(args[0] || '');
        const leftLength = parseInt(String(args[1])) || 1;
        return leftText.substring(0, Math.max(0, leftLength));
        
      case 'RIGHT':
        const rightText = String(args[0] || '');
        const rightLength = parseInt(String(args[1])) || 1;
        return rightText.substring(Math.max(0, rightText.length - rightLength));
        
      case 'LEN':
        return String(args[0] || '').length;
        
      case 'UPPER':
        return String(args[0] || '').toUpperCase();
        
      case 'LOWER':
        return String(args[0] || '').toLowerCase();
        
      case 'IF':
        if (args.length >= 2) {
          const condition = evaluateLogicalExpression(args[0]);
          return condition ? (args[1] || '') : (args[2] || '');
        }
        return '#VALUE!';
        
             case 'AND':
         return args.every(arg => evaluateLogicalExpression(arg)) ? 1 : 0;
         
       case 'OR':
         return args.some(arg => evaluateLogicalExpression(arg)) ? 1 : 0;
         
       case 'NOT':
         return !evaluateLogicalExpression(args[0]) ? 1 : 0;
        
      default:
        return '#NAME?';
    }
  } catch (error) {
    return '#ERROR!';
  }
}

// Helper function for SUM with proper array handling
function executeSumFunction(args: any[]): number {
  let sum = 0;
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      sum += executeSumFunction(arg); // Recursive for nested arrays
    } else {
      const numValue = parseFloat(String(arg));
      if (!isNaN(numValue) && isFinite(numValue)) {
        sum += numValue;
      }
    }
  }
  
  return sum;
}

// Helper to flatten arrays to numbers
function flattenToNumbers(args: any[]): number[] {
  const numbers: number[] = [];
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      numbers.push(...flattenToNumbers(arg));
    } else {
      const numValue = parseFloat(String(arg));
      if (!isNaN(numValue) && isFinite(numValue)) {
        numbers.push(numValue);
      }
    }
  }
  
  return numbers;
}

// Helper to flatten arrays to all values
function flattenToValues(args: any[]): any[] {
  const values: any[] = [];
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      values.push(...flattenToValues(arg));
    } else {
      values.push(arg);
    }
  }
  
  return values;
}

// Helper to evaluate logical expressions
function evaluateLogicalExpression(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0' || lower === '') return false;
    return !isNaN(parseFloat(value)) ? parseFloat(value) !== 0 : true;
  }
  return Boolean(value);
}

// Get autocomplete suggestions with improved filtering
export function getAutocompleteSuggestions(input: any): FormulaFunction[] {
  if (!input || typeof input !== 'string') return FORMULA_FUNCTIONS.slice(0, 10);
  
  const query = input.toUpperCase();
  
  // Exact matches first
  const exactMatches = FORMULA_FUNCTIONS.filter(func => func.name === query);
  
  // Starts with matches
  const startsWithMatches = FORMULA_FUNCTIONS.filter(func => 
    func.name.startsWith(query) && !exactMatches.includes(func)
  );
  
  // Contains matches
  const containsMatches = FORMULA_FUNCTIONS.filter(func => 
    func.name.includes(query) && !exactMatches.includes(func) && !startsWithMatches.includes(func)
  );
  
  // Description matches
  const descriptionMatches = FORMULA_FUNCTIONS.filter(func =>
    func.description.toUpperCase().includes(query) && 
    !exactMatches.includes(func) && 
    !startsWithMatches.includes(func) && 
    !containsMatches.includes(func)
  );
  
  return [...exactMatches, ...startsWithMatches, ...containsMatches, ...descriptionMatches].slice(0, 10);
}

// Format formula for display with syntax highlighting hints
export function formatFormula(formula: any): string {
  if (typeof formula !== 'string' || !isFormula(formula)) return String(formula || '');
  
  // Basic formatting - could be enhanced with proper syntax highlighting
  return formula
    .replace(/([+\-*/()=<>!&|,])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Utility to insert cell reference into formula at cursor position
export function insertCellReferenceIntoFormula(
  formula: string, 
  cellRef: string, 
  cursorPosition: number
): { newFormula: string; newCursorPosition: number } {
  const beforeCursor = formula.substring(0, cursorPosition);
  const afterCursor = formula.substring(cursorPosition);
  
  const newFormula = beforeCursor + cellRef + afterCursor;
  const newCursorPosition = cursorPosition + cellRef.length;
  
  return {
    newFormula,
    newCursorPosition
  };
}

// Utility to get formula dependencies (cells that this formula depends on)
export function getFormulaDependencies(formula: string): string[] {
  const references = extractFormulaReferences(formula);
  const dependencies: string[] = [];
  
  for (const ref of references) {
    if (ref.type === 'cell') {
      const cellRef = ref.reference as CellReference;
      dependencies.push(getCellReference(cellRef.row, cellRef.col));
    } else if (ref.type === 'range') {
      const rangeRef = ref.reference as RangeReference;
      for (let row = rangeRef.startRow; row <= rangeRef.endRow; row++) {
        for (let col = rangeRef.startCol; col <= rangeRef.endCol; col++) {
          dependencies.push(getCellReference(row, col));
        }
      }
    }
  }
  
  return Array.from(new Set(dependencies)); // Remove duplicates
} 