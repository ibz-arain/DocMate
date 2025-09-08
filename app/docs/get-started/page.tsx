"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Upload, 
  FileText, 
  Table, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function GetStartedPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 mb-4">Get Started with Docimate</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: September 2025</span>
        </div>
      </div>


      {/* Create Account Section */}
      <section id="create-account" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Step 1: Create Your Account</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Getting started with Docimate is simple. Create your account in just a few minutes and choose the plan that best fits your needs.
        </p>

        <div className="space-y-8 mb-8">
          {/* Sign Up Process */}
          <div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-lg">Visit the Sign-Up Page</h4>
                    <p className="text-muted-foreground">Navigate to the Docimate registration page and click "Sign Up"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-lg">Enter Your Information</h4>
                    <p className="text-muted-foreground">Enter your name and email to receive a verification code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-lg">Verify Your Email</h4>
                    <p className="text-muted-foreground">Enter the verification code sent to your email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-lg">Create a Password</h4>
                    <p className="text-muted-foreground">Create a secure password</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <h4 className="font-medium text-lg">Complete Your Profile</h4>
                    <p className="text-muted-foreground">Select one of our plans to begin</p>
                  </div>
                </div>
              </div>
              
              {/* Sign Up Image Placeholder */}
              <div className="bg-muted/30 w-full h-80 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                  <Image src="/docs/sign-up.png" alt="Sign Up" className="w-full h-full object-cover rounded-lg" width={800} height={600} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Upload Document Section */}
      <section id="upload-document" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Step 2: Upload Your First Document</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Once your account is set up, you can start uploading documents. Docimate supports various file formats and provides multiple upload methods.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Supported File Types</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">PDF Documents</h4>
                  <p className="text-sm text-muted-foreground">Standard PDF files up to 50MB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Table className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Excel & CSV Files</h4>
                  <p className="text-sm text-muted-foreground">Spreadsheet data with full formatting</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Word Documents</h4>
                  <p className="text-sm text-muted-foreground">Microsoft Word files (.docx)</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Upload Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-primary" />
                <span>Drag and drop files directly onto the upload area</span>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-primary" />
                <span>Click the upload area to browse and select files</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Tools Section */}
      <section id="explore-tools" className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Step 3: Explore Docimate Tools</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Docimate provides three main tools for document processing. Each tool is designed for specific types of documents and use cases.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Process and analyze PDF documents with advanced AI features.</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• PDF viewing and navigation</li>
                <li>• Text selection and extraction</li>
                <li>• AI summarization and analysis</li>
                <li>• Quick formatting tools</li>
              </ul>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/docs/document-viewer">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Table className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Spreadsheets</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Work with Excel and CSV files, create charts, and analyze data.</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Excel/CSV import and export</li>
                <li>• Dynamic chart generation</li>
                <li>• Data analysis tools</li>
                <li>• Formula support</li>
              </ul>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/docs/spreadsheet">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Create custom processing templates for automated workflows.</p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Custom template creation</li>
                <li>• Batch processing</li>
                <li>• Template sharing</li>
                <li>• Advanced scripting</li>
              </ul>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/docs/templates">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process Document Section */}
      <section id="process-document">
        <h2 className="text-3xl font-bold mb-4">Step 4: Process Your Document</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Now that you've uploaded a document, let's walk through the complete processing workflow.
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Select Content</h3>
              <p className="text-muted-foreground">Use the selection tools to highlight or select the text or data you want to process.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Choose Processing Tool</h3>
              <p className="text-muted-foreground">Select from available AI tools like summarization, formatting, analysis, add to chat, or use a custom template.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Review Results</h3>
              <p className="text-muted-foreground">Check the AI-generated output or chat with the AI.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-muted text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Export or Save</h3>
              <p className="text-muted-foreground">Download your processed content in various formats or save it to your history.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}