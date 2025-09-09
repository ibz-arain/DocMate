"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  Settings, 
  Play,
  Download,
  Upload,
  Edit,
  Copy,
  Share2,
  Trash2,
  Plus,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  Layers,
  Code
} from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-5xl mb-4 font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">Templates</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: September 2025</span>
        </div>
      </div>


      {/* Overview Section */}
      <section id="overview" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">What Are Templates?</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Think of templates as your personal automation assistant. You teach it once how to process a specific type of document, and then it can handle hundreds of similar documents automatically. No more doing the same formatting or extraction tasks over and over.
        </p>
        
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Real Examples of What Templates Can Do</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>• <strong>Invoice Processing:</strong> Extract company name, amount, date, and line items from any invoice format</p>
            <p>• <strong>Contract Analysis:</strong> Find key terms, dates, and obligations in legal documents</p>
            <p>• <strong>Report Summarization:</strong> Turn long reports into consistent executive summaries</p>
            <p>• <strong>Data Extraction:</strong> Pull specific information from forms and documents</p>
            <p>• <strong>Format Standardization:</strong> Convert documents to a consistent format for your team</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Save Hours of Work</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Instead of manually processing each document, create a template once and let it handle the rest.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Process hundreds of documents in minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Consistent results every time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No more copy-paste errors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Focus on analysis, not data entry</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Customize Everything</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Create templates that match your exact needs and workflow requirements.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Define what data to extract</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Set formatting rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Choose output format</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Add validation rules</span>
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
          Ready to create your first template? Here's everything you need to know to get up and running in just a few minutes.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Your First Template in 5 Minutes</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>1. <strong>Go to the playground</strong> and click on "Templates" in the sidebar</p>
            <p>2. <strong>Define what you want to extract</strong> - company name, date, amount, etc.</p>
            <p>3. <strong>Set up the rules</strong> - tell the template how to find and format the data</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">What You Need</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Before you start creating templates, gather these essentials.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Sample documents (2-3 examples)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Clear idea of what data to extract</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Desired output format</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Play className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">How It Works</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">The template creation process is designed to be simple and intuitive.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Define extraction rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Test with sample documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Apply to batch of files</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Creating Templates Section */}
      <section id="creating-templates" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Creating Your First Template</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Let's walk through creating a template step by step. We'll use a simple example - extracting information from invoices - but the same process works for any document type.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Example: Invoice Processing Template</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>Let's say you want to extract: <strong>Company Name</strong>, <strong>Invoice Date</strong>, <strong>Total Amount</strong>, and <strong>Line Items</strong> from invoices.</p>
            <p>This template will work on any invoice format and give you consistent, structured data every time.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Gather Sample Documents</h3>
              <p className="text-muted-foreground">Start by gathering 2-3 sample invoices. Decide what fields you want to extract from the documents.</p>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> Include samples from different vendors or formats to make your template more robust.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Define What to Extract</h3>
              <p className="text-muted-foreground">Tell the template what information you want to pull from each document. Be specific about field names and data types.</p>
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold">Field Name</p>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-semibold">Data Type</p>
                  <p className="text-sm text-muted-foreground">Text</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Set Up Extraction Rules</h3>
              <p className="text-muted-foreground">Use the template editor to define how to find each piece of information. You can use patterns, keywords, or AI-powered extraction.</p>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Example:</strong> For "Total Amount", look for text after "Total:" or "$" followed by numbers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Test and Refine</h3>
              <p className="text-muted-foreground">Upload test documents to document editor to see how well your template works. Adjust the rules if needed until you get consistent, accurate results.</p>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Pro Tip:</strong> Test with 3-6 different documents before using the template on a large batch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Using Templates Section */}
      <section id="using-templates">
        <h2 className="text-3xl font-bold mb-4">Using Templates</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Once you've created a template, using it is the easy part. Upload your documents, select the template, and let DocMate do the work. You can process one document or hundreds at once.
        </p>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">Quick Template Workflow</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>1. <strong>Go to Document Editor</strong> and upload your documents</p>
            <p>2. <strong>Select the template</strong> and watch the magic happen</p>
            <p>3. <strong>Review results</strong> and download the processed data</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Single Document</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Perfect when you want to test a template or process just one document.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Upload one document at a time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>See results immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Make adjustments if needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Download processed data</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Batch Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">This is where templates really shine - process hundreds of documents at once.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Upload multiple documents at once</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Watch progress in real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Get a summary of results</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Download all processed data</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Template Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Customize how your template processes documents with these options.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Output format (Excel, CSV, JSON)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Error handling rules</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Data validation settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Custom field mappings</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}