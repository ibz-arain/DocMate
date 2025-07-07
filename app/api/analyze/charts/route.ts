import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const RequestSchema = z.object({
  selectedCells: z.string(),
  selectedRange: z.object({
    startRow: z.number(),
    startCol: z.number(),
    endRow: z.number(),
    endCol: z.number()
  }),
  spreadsheetData: z.array(z.array(z.any())).optional()
});

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'column' | 'donut' | 'radar' | 'treemap';
  title: string;
  description: string;
  data: any[];
  config: {
    xKey?: string;
    yKey?: string;
    dataKey?: string;
    nameKey?: string;
    valueKey?: string;
    colors?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    showGrid?: boolean;
  };
  insights: string[];
  priority: number; // 1-3, where 1 is highest priority
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selectedCells, selectedRange, spreadsheetData } = RequestSchema.parse(body);

    // Parse the selected cells data
    const cellLines = selectedCells.split('\n').filter(line => line.trim());
    const cellData: { [key: string]: string } = {};
    
    cellLines.forEach(line => {
      const match = line.match(/^([A-Z]+\d+):\s*(.*)$/);
      if (match) {
        cellData[match[1]] = match[2];
      }
    });

    // Extract data from the range
    const extractedData: any[] = [];
    if (spreadsheetData && selectedRange) {
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        const rowData: any = {};
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cellValue = spreadsheetData[row]?.[col]?.value || '';
          const columnLetter = String.fromCharCode(65 + col);
          rowData[`${columnLetter}${row + 1}`] = cellValue;
          rowData[`col_${col}`] = cellValue;
          rowData[`row_${row}`] = cellValue;
        }
        extractedData.push(rowData);
      }
    }

    const prompt = `You are an expert data visualization specialist. Analyze the following spreadsheet data and generate 0-3 optimal chart configurations. Focus on creating the most meaningful and insightful visualizations.

Selected Data:
${selectedCells}

Range: ${selectedRange.startRow + 1}:${selectedRange.endRow + 1} (rows) × ${String.fromCharCode(65 + selectedRange.startCol)}:${String.fromCharCode(65 + selectedRange.endCol)} (columns)

 Instructions:
 1. Analyze the data type, patterns, and relationships
 2. Determine the most appropriate chart types (line, bar, column, pie, donut, area, scatter, radar, treemap)
 3. Generate 0-3 chart configurations ordered by relevance and insight value
 4. Each chart should tell a different story or highlight different aspects
 5. Include proper data transformation and formatting
 6. Provide meaningful titles, descriptions, and insights
 7. Use primary theme colors (#8b5cf6, #a855f7, #c084fc, #d8b4fe, #e9d5ff)

Return a JSON response with this exact structure:
{
  "charts": [
    {
      "id": "chart_1",
      "type": "line|bar|pie|area|scatter",
      "title": "Clear, descriptive title",
      "description": "Brief explanation of what this chart shows",
      "data": [
        // Transformed data array for the chart
        {"name": "Category1", "value": 100, "category": "A"},
        {"name": "Category2", "value": 200, "category": "B"}
      ],
      "config": {
        "xKey": "name", // for line/bar/area charts
        "yKey": "value", // for line/bar/area charts
        "dataKey": "value", // for pie charts
        "nameKey": "name", // for pie charts
        "colors": ["#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"],
        "showLegend": true,
        "showTooltip": true,
        "showGrid": true
      },
      "insights": [
        "Key insight 1 about the data",
        "Key insight 2 about patterns",
        "Key insight 3 about trends"
      ],
      "priority": 1
    }
  ],
  "summary": "Overall analysis of the data and why these charts were chosen",
  "dataQuality": "Assessment of data quality and any limitations"
}

Rules:
- Only generate charts if the data is suitable for visualization
- Return empty charts array if data is not suitable
- Prioritize charts by insight value and clarity
- Ensure data transformations are accurate
- Use semantic, meaningful names for data keys
- Choose colors that enhance readability
- Focus on actionable insights`;

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = result.text.trim();
    let cleanText = text;

    // Clean up the response
    if (text.includes('```json')) {
      cleanText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
    } else if (text.includes('```')) {
      cleanText = text.match(/```\n([\s\S]*?)\n```/)?.[1] || text;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(cleanText);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      console.error('Raw text:', text);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse AI response as JSON',
          charts: [],
          summary: 'Unable to generate charts due to parsing error',
          dataQuality: 'Error in processing'
        },
        { status: 500 }
      );
    }

    // Validate and clean the response
    const charts: ChartConfig[] = [];
    if (parsedData.charts && Array.isArray(parsedData.charts)) {
      parsedData.charts.forEach((chart: any, index: number) => {
        if (chart.type && chart.title && chart.data && Array.isArray(chart.data)) {
          charts.push({
            id: chart.id || `chart_${index + 1}`,
            type: chart.type,
            title: chart.title,
            description: chart.description || '',
            data: chart.data,
            config: {
              xKey: chart.config?.xKey,
              yKey: chart.config?.yKey,
              dataKey: chart.config?.dataKey,
              nameKey: chart.config?.nameKey,
              valueKey: chart.config?.valueKey,
                             colors: chart.config?.colors || ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
              showLegend: chart.config?.showLegend !== false,
              showTooltip: chart.config?.showTooltip !== false,
              showGrid: chart.config?.showGrid !== false
            },
            insights: Array.isArray(chart.insights) ? chart.insights : [],
            priority: chart.priority || index + 1
          });
        }
      });
    }

    // Sort by priority
    charts.sort((a, b) => a.priority - b.priority);

    return NextResponse.json({
      success: true,
      charts: charts.slice(0, 3), // Limit to 3 charts
      summary: parsedData.summary || 'Charts generated based on data analysis',
      dataQuality: parsedData.dataQuality || 'Data processed successfully'
    });

  } catch (error) {
    console.error('Chart generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors,
          charts: [],
          summary: 'Invalid request format',
          dataQuality: 'Request validation failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        charts: [],
        summary: 'Error generating charts',
        dataQuality: 'Processing failed'
      },
      { status: 500 }
    );
  }
} 