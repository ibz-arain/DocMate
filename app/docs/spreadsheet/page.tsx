"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  Upload, 
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Calculator,
  FileSpreadsheet,
  Sparkles,
  Edit,
  MousePointer,
  Plus,
  Minus,
  Pencil,
  CheckCircle,
  ArrowRight,
  Play
} from "lucide-react";
import Link from "next/link";

export default function SpreadsheetPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-5xl mb-4 font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">Spreadsheet</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: September 2025</span>
        </div>
      </div>


      {/* Overview Section */}
      <section id="overview" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">What Makes It Special</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Think of DocMate's Spreadsheet Tools as Excel on steroids, but with AI superpowers. You can edit data like you're used to, but then right-click to get AI insights, generate charts automatically, and ask questions about your data.
        </p>
        
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">The Magic in Action</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>• <strong>Upload any Excel or CSV file</strong> - drag, drop, and you're editing in seconds</p>
            <p>• <strong>Edit data like normal</strong> - click cells, type, use formulas, undo/redo</p>
            <p>• <strong>Right-click for AI magic</strong> - "What trends do you see?" or "Create a chart"</p>
            <p>• <strong>Get instant insights</strong> - AI analyzes your data and explains what it means</p>
            <p>• <strong>Export everything</strong> - save as Excel, CSV, or download charts as images</p>
        </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Edit className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Familiar Editing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Edit data just like you would in Excel or Google Sheets, but with some nice extras.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span >Click to edit cells, drag to select ranges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Undo/redo with Ctrl+Z and Ctrl+Y</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Formula support (SUM, AVERAGE, etc.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Auto-save so you never lose work</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Ask AI questions about your data and get answers in seconds.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"What patterns do you see in this data?"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"Create a chart showing sales trends"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"Summarize the key insights"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"What should I focus on?"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Ready to dive in? Here's everything you need to know to get up and running with spreadsheet tools in just a few minutes.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Your First 5 Minutes</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>1. <strong>Go to the playground</strong> and click on "Spreadsheet" in the sidebar</p>
            <p>2. <strong>Upload a file</strong> - drag any Excel (.xlsx, .xls) or CSV file onto the drop zone</p>
            <p>3. <strong>Start editing</strong> - click any cell to edit, just like Excel</p>
            <p>4. <strong>Try AI features</strong> - right-click on some data and try "Summarize" or "Create Chart"</p>
            <p>5. <strong>Ask questions</strong> - select data and ask "What patterns do you see?"</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">What Files Work</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">DocMate works with the most common spreadsheet formats you'll encounter.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Excel files (.xlsx, .xls) - modern and legacy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>CSV files - comma-separated values</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>TSV files - tab-separated values</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Automatic format detection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MousePointer className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">How to Upload</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Three easy ways to get your data into DocMate.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Drag and drop - just drag files from your computer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Click to browse - click the upload area to select files</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Paste data - copy from Excel and paste directly</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Data Editing Section */}
      <section id="data-editing" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Editing Your Data</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Once your data is loaded, editing works just like you'd expect. Click to select, switch to edit mode, and use familiar keyboard shortcuts. Plus, everything auto-saves so you never lose your work.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Pro Tips for Editing</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>• <strong>Click any cell</strong> to select it, then switch to edit mode to start typing</p>
            <p>• <strong>Drag to select ranges</strong> - just like Excel or Google Sheets</p>
            <p>• <strong>Use Ctrl+Z and Ctrl+Y</strong> for undo/redo (works great!)</p>
            <p>• <strong>Right-click for context menu</strong> - copy, paste, and AI features</p>
            <p>• <strong>Everything auto-saves</strong> - your changes are saved as you work</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Edit className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Basic Editing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The editing experience you know and love, with some nice extras.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Click to select cells, drag to select ranges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Use Tab and Enter to navigate between cells</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Copy/paste with Ctrl+C and Ctrl+V</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Formulas & Functions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Use familiar Excel formulas and functions in your data.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Basic functions: SUM, AVERAGE, COUNT, MAX, MIN</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Start with = to enter formula mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">AI-Powered Features</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          This is where DocMate really shines. Select any data and right-click to see AI options that can analyze, summarize, and visualize your data in ways that would take hours to do manually.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Real Examples of What AI Can Do</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>Sales Data:</strong> Select sales numbers → "What trends do you see?" → Get insights about growth, seasonality, and outliers</p>
            <p>• <strong>Customer Data:</strong> Select customer info → "Create a chart showing customer segments" → Get a beautiful pie chart with analysis</p>
            <p>• <strong>Financial Data:</strong> Select budget numbers → "Summarize the key insights" → Get a clear summary of what the data means</p>
            <p>• <strong>Any Data:</strong> Select any range → "What patterns do you see?" → Get intelligent analysis and recommendations</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Smart Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Select any data and ask AI to analyze it. Get insights, patterns, and recommendations in seconds.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Right-click → "Summarize" for quick insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Ask "What trends do you see?" for pattern analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Get "What should I focus on?" for recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Ask specific questions about your data</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> The more specific your question, the better the AI response. Try "What's driving the increase in Q3 sales?" instead of just "Analyze this."
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Automatic Chart Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Select data and let AI create the perfect chart for you. No more guessing which chart type to use.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Right-click → "Create Chart" for instant visualization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>AI picks the best chart type for your data</span>
            </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Bar charts, pie charts, line charts, scatter plots</span>
              </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Download charts as images for presentations</span>
            </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> You can also ask AI to create specific chart types: "Create a pie chart showing market share" or "Make a line chart of sales over time."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Section */}
      <section id="charts">
        <h2 className="text-3xl font-bold mb-4">Creating Charts</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Turn your data into beautiful, professional charts with just a few clicks. AI picks the best chart type for your data, or you can ask for specific visualizations.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Chart Types Available</h3>
          <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <p><strong>Bar Charts</strong> - Compare values across categories</p>
              <p><strong>Pie Charts</strong> - Show proportions of a whole</p>
            </div>
            <div>
              <p><strong>Line Charts</strong> - Display trends over time</p>
              <p><strong>Scatter Plots</strong> - Show relationships between variables</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Quick Chart Creation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The fastest way to create charts - just select data and let AI do the work.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Select your data range (including headers)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Right-click → "Create Chart"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>AI automatically picks the best chart type</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Chart appears instantly with proper labels</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Custom Chart Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Want a specific chart type? Just ask AI to create exactly what you need.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"Create a pie chart showing market share"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"Make a line chart of sales over time"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>"Show customer segments as a bar chart"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>AI understands your request and creates it</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> You can download any chart as an image to use in presentations or reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}