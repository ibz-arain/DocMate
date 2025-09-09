import { NextRequest } from 'next/server';

/**
 * Generate input description for chat endpoint
 */
export function getChatInputDescription(req: NextRequest, body: any): string {
  try {
    // Extract the user's message from the request body
    const message = body?.message || '';
    
    // Truncate if too long (keep first 100 characters)
    if (message.length > 100) {
      return message.substring(0, 97) + '...';
    }
    
    return message || 'Empty message';
  } catch (error) {
    console.warn('Error parsing chat input description:', error);
    return 'Unable to parse chat message';
  }
}

/**
 * Generate input description for analyze/summarize endpoint
 */
export function getSummarizeInputDescription(req: NextRequest, body: any): string {
  try {
    const text = body?.text || '';
    const textLength = text.length;
    
    if (textLength === 0) {
      return 'Empty text';
    }
    
    // Create a description based on text length
    if (textLength < 100) {
      return `Summary of short text (${textLength} chars)`;
    } else if (textLength < 500) {
      return `Summary of medium text (${textLength} chars)`;
    } else if (textLength < 2000) {
      return `Summary of long text (${textLength} chars)`;
    } else {
      return `Summary of very long text (${textLength} chars)`;
    }
  } catch (error) {
    return 'Unable to parse summarize request';
  }
}

/**
 * Generate input description for analyze/charts endpoint
 */
export function getChartsInputDescription(req: NextRequest, body: any): string {
  try {
    const selectedCells = body?.selectedCells || '';
    const selectedRange = body?.selectedRange;
    
    if (!selectedRange) {
      return 'Chart generation - no range specified';
    }
    
    const { startRow, startCol, endRow, endCol } = selectedRange;
    const rowCount = endRow - startRow + 1;
    const colCount = endCol - startCol + 1;
    
    // Count the number of lines in selectedCells to estimate data size
    const cellLines = selectedCells.split('\n').filter((line: string) => line.trim()).length;
    
    return `Chart generation from ${rowCount}x${colCount} range (${cellLines} data points)`;
  } catch (error) {
    return 'Unable to parse chart generation request';
  }
}

/**
 * Generate input description for analyze/custom endpoint
 */
export function getCustomInputDescription(req: NextRequest, body: any): string {
  try {
    const customPrompt = body?.customPrompt || '';
    const outputFormat = body?.outputFormat;
    
    let description = 'Custom analysis';
    
    if (customPrompt) {
      // Truncate prompt if too long
      const truncatedPrompt = customPrompt.length > 50 
        ? customPrompt.substring(0, 47) + '...' 
        : customPrompt;
      description += `: "${truncatedPrompt}"`;
    }
    
    if (outputFormat?.documentType) {
      description += ` (${outputFormat.documentType})`;
    }
    
    if (outputFormat?.tables?.length) {
      description += ` - ${outputFormat.tables.length} table(s)`;
    }
    
    return description;
  } catch (error) {
    return 'Unable to parse custom analysis request';
  }
}

/**
 * Get input description based on endpoint name
 */
export function getInputDescription(endpointName: string, req: NextRequest, body: any): string {
  switch (endpointName) {
    case 'chat':
      return getChatInputDescription(req, body);
    case 'analyze':
      // For analyze endpoints, we need to determine the specific type
      // This will be handled by the individual route handlers
      return 'Analysis request';
    default:
      return 'API request';
  }
} 