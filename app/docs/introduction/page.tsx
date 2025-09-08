"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Table, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  Settings,
  Users,
  Upload,
  Download
} from "lucide-react";
import Link from "next/link";

export default function IntroductionPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">Welcome to Docimate</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span >Last updated: September 2025</span>
        </div>

      </div>


      {/* What is Docimate Section */}
      <section id="what-is-Docimate" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">What is Docimate?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Docimate is an all-in-one platform designed to streamline your workflow and eliminate the tedious manual work of document analysis. Whether you're dealing with PDFs, spreadsheets, or other document formats, Docimate provides the tools you need to extract insights, format content, and automate repetitive tasks.
        </p>
        
        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          Built with modern AI technology, Docimate understands your documents and can perform complex analysis tasks that would typically require hours of manual work. From simple text extraction to advanced data analysis and chart generation, Docimate adapts to your specific needs.
        </p>

        <div className="bg-muted/50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Why Choose Docimate?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
              <span>Save hours of manual document processing with AI-powered automation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
              <span>Process multiple document types in one unified platform</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
              <span>Create custom templates for consistent document processing</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="key-features" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Key Features</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          Docimate offers a comprehensive suite of tools designed to handle every aspect of document processing.
        </p>

        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Document Viewer</h3>
              <p className="mb-3">
                Advanced PDF processing with intelligent text selection, AI-powered summarization, and real-time annotation tools.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• High-quality PDF rendering with zoom and rotation controls</li>
                <li>• Multiple selection tools for precise content extraction</li>
                <li>• AI-powered summarization and analysis</li>
                <li>• Export processed content in multiple formats</li>
                <li>• View past AI summaries and analyses</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Table className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Spreadsheet Tools</h3>
              <p className="mb-3">
                Powerful spreadsheet processing with dynamic chart generation, data analysis, and formula support.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Import/export Excel and CSV files with full formatting preservation</li>
                <li>• Dynamic chart generation with multiple chart types</li>
                <li>• Advanced data analysis and statistical functions</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">AI Templates</h3>
              <p className="mb-3">
                Create custom processing templates to automate repetitive document workflows and ensure consistent results.
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Visual template editor with easy to use interface</li>
                <li>• Template saving, modifications, and reuse</li>
                <li>• Advanced scripting for complex processing logic</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Docimate simplifies document processing into three straightforward steps.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3">Upload</h3>
            <p className="text-muted-foreground">
              Drag and drop your documents into Docimate's interface. The platform automatically detects file types and prepares them for processing.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-3">Process</h3>
            <p className="text-muted-foreground">
              Use Docimate's AI-powered tools to analyze, summarize, format, and extract insights from your documents.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-3">Export</h3>
            <p className="text-muted-foreground">
              Download your processed documents and spreadsheets in various formats or integrate the results into your workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
            <Link href="/docs/get-started">
              Continue to Setup
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}