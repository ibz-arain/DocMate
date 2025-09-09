"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MousePointer, 
  BoxSelect, 
  Edit, 
  Sparkles, 
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  History,
  CheckCircle,
  ArrowRight,
  Table,
  Play,
  FileText as FileTextIcon,
  Grid,
} from "lucide-react";
import Link from "next/link";

export default function DocumentViewerPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 mb-4">Document</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: September 2025</span>
        </div>
      </div>


      {/* Overview Section */}
      <section id="overview" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">What Makes It Special</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Think of our document tool as your smart PDF assistant. Instead of just reading PDFs, it actually <em>understands</em> them. Upload any PDF, select the content you care about, and watch as AI transforms it into exactly what you need.
        </p>
        
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-primary">The Magic in Action</h3>
          <p className="text-muted-foreground">
            Upload a research paper, select a complex paragraph, and ask it to "explain this in simple terms." Or highlight a data table and ask it to "create a summary of the key findings." Our document tool doesn't just extract text—it understands context, meaning, and relationships.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Three Ways to Select Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MousePointer className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Text Selection</h4>
                    <p className="text-muted-foreground">Click and drag to select any text, just like in any word processor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BoxSelect className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Box Selection</h4>
                    <p className="text-muted-foreground">Draw a box around any area to capture everything inside it</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileTextIcon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Full Document Mode</h4>
                    <p className="text-muted-foreground">Use the chat or side toolbar to interact with the entire document</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Main Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Smart Summarization</h4>
                    <p className="text-muted-foreground">Get concise summaries of any selected content, or the entire document</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Chat with Your Document</h4>
                    <p className="text-muted-foreground">Ask questions and get intelligent answers about the content, or the entire document</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Grid className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Apply Templates</h4>
                    <p className="text-muted-foreground">Apply premade templates to selected context or entire document to retrieve specific results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Uploading Documents Section */}
      <section id="uploading-documents" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Getting Your PDF Into Docimate</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Uploading is as simple as drag and drop. Just grab any PDF from your computer and drop it onto the upload area. Docimate handles the rest.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3">What Happens When You Upload</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>1. <strong>Instant Processing:</strong> Docimate immediately starts understanding your document's structure and content</p>
            <p>2. <strong>Smart Recognition:</strong> It identifies text, tables, images, and other elements automatically</p>
            <p>3. <strong>Ready to Use:</strong> Within seconds, you can start selecting content and using AI features</p>
            <p>4. <strong>Persistent Storage:</strong> Your document stays loaded until you close it or upload a new one</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">What PDFs Work Best</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Text-Based PDFs</h4>
                  <p className="text-muted-foreground">Research papers, contracts, reports—anything with selectable text</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Scanned Documents</h4>
                  <p className="text-muted-foreground">Even scanned PDFs work—Docimate can read the text using OCR</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Multi-Page Documents</h4>
                  <p className="text-muted-foreground">Books, manuals, long reports—no page limit</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">How to Upload</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-primary" />
                <span><strong>Drag & Drop:</strong> Just drag your PDF from your computer and drop it on the upload area</span>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-primary" />
                <span><strong>Click to Browse:</strong> Click the upload area to open your file browser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section id="navigation" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Moving Around Your Document</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Once your PDF is loaded, you'll see floating controls that let you navigate, zoom, and rotate. Everything is designed to stay out of your way until you need it.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Page Controls (Bottom Center)</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ChevronLeft className="h-4 w-4 text-primary" />
                <span>Previous page button</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Next page button</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">Page 1 of 10</span>
                <span>Current page indicator</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">•</span>
                <span>All controls are floating and stay visible while scrolling</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Zoom Controls (Bottom Right)</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-primary" />
                <span>Zoom out button</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">100%</span>
                <span>Current zoom level (click to reset)</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomIn className="h-4 w-4 text-primary" />
                <span>Zoom in button</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCw className="h-4 w-4 text-primary" />
                <span>Rotate document 90°</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <RotateCw className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Rotate Document</h4>
              </div>
              <p className="text-muted-foreground">Perfect for landscape documents or when you need to read sideways text.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <ZoomIn className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Smart Zooming</h4>
              </div>
              <p className="text-muted-foreground">Zoom from 50% to 300% with smooth controls and visual feedback.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Auto-Save State</h4>
              </div>
              <p className="text-muted-foreground">Your zoom level and page position are remembered if you refresh the page.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Selection Tools Section */}
      <section id="selection-tools">
        <h2 className="text-3xl font-bold mb-4">Three Ways to Select Content</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          The magic starts when you select content. Docimate gives you three different ways to choose what you want to work with, each perfect for different situations.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MousePointer className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Text Selection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The most intuitive way—just click and drag to select any text, just like in any word processor.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span>Perfect for paragraphs, sentences, or specific phrases</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>Works across multiple lines and columns</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>Right-click for AI options like summarize or format</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>Best for:</strong> Research papers, contracts, articles, any text-heavy content
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BoxSelect className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Box Selection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Draw a box around any area to capture everything inside—text, images, tables, whatever is there.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span>Great for tables, charts, and mixed content</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>Captures images and visual elements too</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>AI can analyze the entire visual area</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>Best for:</strong> Data tables, infographics, charts, mixed content areas
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Full Document</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Use the chat or side toolbar to interact with the entire document.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>Summarize, auto format, and apply templates, as options in side toolbar</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>No need to select anything, just chat with the AI for full document references</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>AI pre-scans and understands the entire document</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong>Best for:</strong> Long documents, complex documents, and summaries
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">The AI Magic</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          This is where Docimate really shines. Select any content and right-click to see AI options that can transform your text into exactly what you need. Alternatively, you can use the chat or side toolbar to interact with the entire document.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Real Examples of What AI Can Do</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>Research Paper:</strong> Select a complex paragraph → "Explain this in simple terms" → Get a clear, easy-to-understand explanation</p>
            <p>• <strong>Contract:</strong> Select a section → "Summarize the key points" → Get bullet points of the most important terms</p>
            <p>• <strong>Report:</strong> Select data → "Format this as an email" → Get a professional email ready to send</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Smart Summarization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Select any text and get an instant summary. Perfect for long documents, research papers, or dense content.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Quick Summary</h4>
                  <p className="text-muted-foreground">Right-click → "Summarize" → Get a concise overview in seconds</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Full Document Summary</h4>
                  <p className="text-muted-foreground">Use the toolbar to summarize the entire document at once</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> Summaries are saved to your history, so you can always go back and review them later.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Edit className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Quick Formatting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Transform any content into different formats. Turn messy unstructured data into a structured format, like a chart or a table.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Quick Format</h4>
                  <p className="text-muted-foreground">Right-click → "Quick Format" → AI designs a table to summarize the content</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> You can also use templates for more specific formatting needs.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Chat with Your Document</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">This is where it gets really interesting. Select any content and start a conversation with AI about it.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Ask "What does this mean?" or "Explain this concept"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Get "What are the key points here?" or "What should I remember?"</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Ask "How does this relate to [topic]?" for deeper insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm">Request "Write this as a [different format]" for transformations</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> The chat sidebar stays open so you can have an ongoing conversation about your document.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}