"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Copy, 
  Download, 
  Sparkles, 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Lightbulb
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  PieChart as RechartsPieChart, 
  AreaChart as RechartsAreaChart,
  ScatterChart as RechartsScatterChart,
  RadarChart as RechartsRadarChart,
  Treemap as RechartsTreemap,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  Scatter,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import type { TooltipProps as RechartsTooltipProps } from 'recharts';

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
  priority: number;
}

interface ChartGeneratorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCells: string;
  selectedRange: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null;
  spreadsheetData: any[][];
  cachedResult?: any;
  onSaveToHistory?: (result: any) => void;
}

// Custom themed tooltip for Recharts
const ThemedTooltip = (props: any) => {
  const { active, payload, label } = props || {};
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'hsl(var(--background))',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--foreground))',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minWidth: 80,
        maxWidth: 260,
        pointerEvents: 'auto',
      }}
    >
      {label && (
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'hsl(var(--primary))' }}>{label}</div>
      )}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 4,
              background: entry.color || 'hsl(var(--primary))',
              marginRight: 4,
            }}
          />
          <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{entry.name}:</span>
          <span style={{ color: 'hsl(var(--primary))', fontWeight: 600, marginLeft: 4 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const PRIMARY = 'hsl(var(--primary))';
const PRIMARY_OPACITIES = [
  'hsl(var(--primary) / 1)',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.2)'
];

export function ChartGeneratorPopup({
  isOpen,
  onClose,
  selectedCells,
  selectedRange,
  spreadsheetData,
  cachedResult,
  onSaveToHistory
}: ChartGeneratorPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [dataQuality, setDataQuality] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedChartIndex, setSelectedChartIndex] = useState(0);

  // Generate charts when popup opens or use cached result
  useEffect(() => {
    if (isOpen && selectedCells && selectedRange) {
      if (cachedResult) {
        // Use cached result
        setCharts(cachedResult.charts || []);
        setSummary(cachedResult.summary || '');
        setDataQuality(cachedResult.dataQuality || '');
        setError('');
        setIsLoading(false);
      } else {
        generateCharts();
      }
    }
  }, [isOpen, selectedCells, selectedRange, cachedResult]);

  const generateCharts = async () => {
    setIsLoading(true);
    setError('');
    setCharts([]);
    
    try {
      const response = await fetch('/api/analyze/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedCells,
          selectedRange,
          spreadsheetData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate charts');
      }

      const result = await response.json();
      
      if (result.success) {
        setCharts(result.charts || []);
        setSummary(result.summary || '');
        setDataQuality(result.dataQuality || '');
        
        // Save to history
        if (onSaveToHistory) {
          onSaveToHistory({
            charts: result.charts,
            summary: result.summary,
            dataQuality: result.dataQuality,
            timestamp: new Date().toISOString()
          });
        }
        
        if (result.charts && result.charts.length > 0) {
          toast({
            title: "Charts Generated Successfully",
            description: `Generated ${result.charts.length} chart${result.charts.length === 1 ? '' : 's'} based on your data.`,
          });
        } else {
          toast({
            title: "No Charts Generated",
            description: "The selected data is not suitable for visualization.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(result.error || 'Failed to generate charts');
      }
    } catch (error) {
      console.error('Chart generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Chart Generation Failed",
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chart: ChartConfig) => {
    const { type, data, config } = chart;
    // Always use only primary color and its opacity variants
    const colors = PRIMARY_OPACITIES;

    const chartProps = {
      width: 400,
      height: 250,
      data,
      margin: { top: 10, right: 20, left: 10, bottom: 5 }
    };

    const chartHeight = 250;

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsLineChart {...chartProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={config.xKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Line 
                type="monotone" 
                dataKey={config.yKey} 
                stroke={PRIMARY}
                strokeWidth={2}
                dot={{ fill: PRIMARY, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: PRIMARY }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'bar':
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsBarChart {...chartProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={config.xKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Bar dataKey={config.yKey} fill={PRIMARY} radius={[2, 2, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill={PRIMARY}
                dataKey={config.dataKey || config.valueKey}
                nameKey={config.nameKey}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIMARY_OPACITIES[index % PRIMARY_OPACITIES.length]} />
                ))}
              </Pie>
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Legend fontSize={12} iconType="circle" wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                fill={PRIMARY}
                dataKey={config.dataKey || config.valueKey}
                nameKey={config.nameKey}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIMARY_OPACITIES[index % PRIMARY_OPACITIES.length]} />
                ))}
              </Pie>
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Legend fontSize={12} iconType="circle" wrapperStyle={{ color: 'hsl(var(--muted-foreground))' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsAreaChart {...chartProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={config.xKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Area 
                type="monotone" 
                dataKey={config.yKey || 'value'} 
                stroke={PRIMARY}
                fill={PRIMARY}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsScatterChart {...chartProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={config.xKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey={config.yKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
              <Scatter dataKey={config.yKey} fill={PRIMARY} />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsRadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey={config.xKey || config.nameKey} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <Radar
                dataKey={config.yKey || config.dataKey}
                stroke={PRIMARY}
                fill={PRIMARY}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {config.showTooltip && <Tooltip content={ThemedTooltip} />}
            </RechartsRadarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RechartsTreemap
              data={data}
              dataKey={config.dataKey || config.valueKey}
              fill={PRIMARY}
            />
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span className="text-sm">Unsupported chart type: {type}</span>
          </div>
        );
    }
  };

  const copyChartData = async (chart: ChartConfig) => {
    try {
      // Create a tab-separated table format that works with Excel, Word, Google Docs
      let tableData = '';
      
      if (chart.type === 'pie' || chart.type === 'donut') {
        // For pie charts, create a simple two-column format
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item.label || item[chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item.y || item.data || item[chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else if (chart.type === 'scatter') {
        // For scatter plots, create X and Y columns
        tableData = 'X Value\tY Value\n';
        chart.data.forEach((item: any) => {
          const x = item.x || item[chart.config.xKey || 'x'] || 0;
          const y = item.y || item[chart.config.yKey || 'y'] || item.value || 0;
          tableData += `${x}\t${y}\n`;
        });
      } else if (chart.type === 'treemap') {
        // For treemap, create category and value columns
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item[chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item.size || item[chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else if (chart.type === 'radar') {
        // For radar charts, create category and value columns
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item[chart.config.xKey || chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item[chart.config.yKey || chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else {
        // For line, bar, area charts - create a table with categories and values
        const xKey = chart.config.xKey || 'name';
        const yKey = chart.config.yKey || 'value';
        
        // Check if we have multiple series (look for series/group field)
        const seriesNames = Array.from(new Set(chart.data.map((item: any) => 
          item.series || item.group || 'Series 1'
        )));
        
        if (seriesNames.length > 1 && seriesNames[0] !== 'Series 1') {
          // Multiple series - create a table with categories as rows and series as columns
          const categories = Array.from(new Set(chart.data.map((item: any) => 
            item[xKey] || item.name || item.category || item.x || item.label || 'Unknown'
          )));
          
          tableData = 'Category';
          seriesNames.forEach(series => {
            tableData += `\t${series}`;
          });
          tableData += '\n';
          
          categories.forEach(category => {
            tableData += category;
            seriesNames.forEach(series => {
              const item = chart.data.find((d: any) => 
                (d[xKey] || d.name || d.category || d.x || d.label) === category && 
                (d.series || d.group || 'Series 1') === series
              );
              const value = item ? (item[yKey] || item.value || item.y || item.data || 0) : 0;
              tableData += `\t${value}`;
            });
            tableData += '\n';
          });
        } else {
          // Single series - simple two-column format
          tableData = 'Category\tValue\n';
          chart.data.forEach((item: any) => {
            const category = item[xKey] || item.name || item.category || item.x || item.label || 'Unknown';
            const value = item[yKey] || item.value || item.y || item.data || 0;
            tableData += `${category}\t${value}\n`;
          });
        }
      }
      
      // Copy the tab-separated data to clipboard
      await navigator.clipboard.writeText(tableData);
      
      toast({
        title: "Chart Data Copied",
        description: "Table data copied in tab-separated format. Paste into Excel, Word, or Google Docs and use Insert > Chart to visualize.",
      });
    } catch (error) {
      console.error('Failed to copy chart data:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy chart data to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadChartData = async (chart: ChartConfig) => {
    try {
      // Create the same tab-separated format as copy
      let tableData = '';
      
      if (chart.type === 'pie' || chart.type === 'donut') {
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item.label || item[chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item.y || item.data || item[chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else if (chart.type === 'scatter') {
        tableData = 'X Value\tY Value\n';
        chart.data.forEach((item: any) => {
          const x = item.x || item[chart.config.xKey || 'x'] || 0;
          const y = item.y || item[chart.config.yKey || 'y'] || item.value || 0;
          tableData += `${x}\t${y}\n`;
        });
      } else if (chart.type === 'treemap') {
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item[chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item.size || item[chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else if (chart.type === 'radar') {
        tableData = 'Category\tValue\n';
        chart.data.forEach((item: any) => {
          const category = item.name || item.category || item[chart.config.xKey || chart.config.nameKey || 'name'] || 'Unknown';
          const value = item.value || item[chart.config.yKey || chart.config.dataKey || 'value'] || 0;
          tableData += `${category}\t${value}\n`;
        });
      } else {
        const xKey = chart.config.xKey || 'name';
        const yKey = chart.config.yKey || 'value';
        
        const seriesNames = Array.from(new Set(chart.data.map((item: any) => 
          item.series || item.group || 'Series 1'
        )));
        
        if (seriesNames.length > 1 && seriesNames[0] !== 'Series 1') {
          const categories = Array.from(new Set(chart.data.map((item: any) => 
            item[xKey] || item.name || item.category || item.x || item.label || 'Unknown'
          )));
          
          tableData = 'Category';
          seriesNames.forEach(series => {
            tableData += `\t${series}`;
          });
          tableData += '\n';
          
          categories.forEach(category => {
            tableData += category;
            seriesNames.forEach(series => {
              const item = chart.data.find((d: any) => 
                (d[xKey] || d.name || d.category || d.x || d.label) === category && 
                (d.series || d.group || 'Series 1') === series
              );
              const value = item ? (item[yKey] || item.value || item.y || item.data || 0) : 0;
              tableData += `\t${value}`;
            });
            tableData += '\n';
          });
        } else {
          tableData = 'Category\tValue\n';
          chart.data.forEach((item: any) => {
            const category = item[xKey] || item.name || item.category || item.x || item.label || 'Unknown';
            const value = item[yKey] || item.value || item.y || item.data || 0;
            tableData += `${category}\t${value}\n`;
          });
        }
      }
      
      // Download as CSV/TSV file that can be opened in Excel
      const blob = new Blob([tableData], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chart.title.replace(/\s+/g, '_').toLowerCase()}_chart_data.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Chart Data Downloaded",
        description: "Table data downloaded as TSV file. Open in Excel and use Insert > Chart to visualize.",
      });
    } catch (error) {
      console.error('Failed to download chart data:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download chart data",
        variant: "destructive",
      });
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar':
      case 'column': return <BarChart3 className="h-4 w-4" />;
      case 'pie':
      case 'donut': return <PieChart className="h-4 w-4" />;
      case 'area': return <TrendingUp className="h-4 w-4" />;
      case 'scatter': return <TrendingUp className="h-4 w-4" />;
      case 'radar': return <TrendingUp className="h-4 w-4" />;
      case 'treemap': return <BarChart3 className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-full max-w-5xl max-h-[85vh] overflow-hidden">        
        <CardContent className="flex flex-col h-full max-h-[calc(85vh-80px)] overflow-hidden pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Analyzing your data...</p>
                <p className="text-sm text-muted-foreground">AI is generating the perfect charts for your data</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-medium text-destructive">Error Generating Charts</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={generateCharts} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : charts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Charts Generated</p>
                <p className="text-sm text-muted-foreground">The selected data is not suitable for visualization</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 h-full overflow-hidden">
              {/* Chart List Sidebar */}
              <div className="w-56 border-r pr-3 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Generated Charts</h3>
                  <p className="text-xs text-muted-foreground">
                    {charts.length} chart{charts.length === 1 ? '' : 's'} generated
                  </p>
                </div>
                
                <div className="space-y-2">
                  {charts.map((chart, index) => (
                    <Card 
                      key={chart.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:border-primary",
                        selectedChartIndex === index && "border-primary"
                      )}
                      onClick={() => setSelectedChartIndex(index)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {getChartIcon(chart.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{chart.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{chart.description}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {chart.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Chart Display Area */}
              <div className="flex-1 min-w-0 overflow-y-auto">
                {charts[selectedChartIndex] && (
                  <div className="h-full flex flex-col">
                    {/* Chart Header */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold">{charts[selectedChartIndex].title}</h2>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyChartData(charts[selectedChartIndex])}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Table Data
                          </Button>

                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{charts[selectedChartIndex].description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {getChartIcon(charts[selectedChartIndex].type)}
                          <span className="ml-1 capitalize">{charts[selectedChartIndex].type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {charts[selectedChartIndex].data.length} points
                        </Badge>
                      </div>
                    </div>

                    {/* Chart */}
                    <Card className="mb-3">
                      <CardContent className="p-3">
                        {renderChart(charts[selectedChartIndex])}
                      </CardContent>
                    </Card>

                    {/* Insights */}
                    {charts[selectedChartIndex].insights.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            Key Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="space-y-1">
                            {charts[selectedChartIndex].insights.map((insight, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                <span className="text-xs">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 