"use client";

import Link from 'next/link';

// Reusable component for code placeholders
const CodePlaceholder = ({ placeholder, instruction }: { placeholder: string; instruction: string }) => (
  <div className="my-4 p-4 rounded-lg bg-muted border border-border">
    <pre className="text-sm text-muted-foreground bg-transparent p-0 overflow-x-auto">
      <code>{`<!-- ${placeholder} -->`}</code>
    </pre>
    <p className="mt-2 text-xs text-accent-foreground/80"><em><strong>Instructions:</strong> {instruction}</em></p>
  </div>
);

export default function QuickStartPage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Quick Start Guide</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Ready to see DocMate in action? This guide will get you up and running in minutes. We'll cover signing up and taking the Playground for a spin.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">1. Signing Up</h2>
      <p className="text-muted-foreground mb-4">
        First things first, you'll need an account to access the full power of DocMate, including saving templates and managing your documents.
      </p>
      <ul className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
        <li>Head over to the <Link href="/signup" className="text-primary hover:underline">Sign Up page</Link>.</li>
        <li>Fill in your details (email, password).</li>
        <li>Verify your email if prompted.</li>
        <li>Log in to your shiny new DocMate account!</li>
      </ul>
      <p className="text-muted-foreground mb-8">
        Once logged in, you'll land on your dashboard, ready to start processing documents.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">2. Using the Playground</h2>
      <p className="text-muted-foreground mb-6">
        The Playground is where the magic happens without needing any complex setup. It's perfect for testing templates and seeing how DocMate extracts data from your documents.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 1: Go to the Playground</h3>
      <p className="text-muted-foreground mb-4">
        Navigate to the <Link href="/playground" className="text-primary hover:underline">Playground</Link> section from the main menu.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 2: Upload a Document</h3>
      <p className="text-muted-foreground mb-4">
        Drag and drop a document file (like a PDF, JPG, or PNG) onto the upload area, or click to browse your files. For this example, try uploading a sample receipt or invoice.
      </p>
      {/* You might want a screenshot placeholder here */}
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_UPLOAD"
        instruction="Replace this comment with an <img> tag showing a screenshot of the document upload area in the Playground."
      />

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 3: Select or Create a Template</h3>
      <p className="text-muted-foreground mb-4">
        Templates tell DocMate what information to look for. You can:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
        <li><strong>Use a Pre-built Template:</strong> Choose one of our common templates (e.g., 'Receipts', 'Invoices') from the dropdown if available.</li>
        <li><strong>Create a New Template:</strong> Define the fields you want to extract (e.g., 'Vendor Name', 'Total Amount', 'Date'). Give your template a name.</li>
      </ul>
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_TEMPLATE"
        instruction="Replace this comment with an <img> tag showing the template selection/creation part of the Playground UI."
      />
      <p className="text-muted-foreground mb-4">
        For a deeper dive into template creation, check out the <Link href="/docs/templates" className="text-primary hover:underline">Templates Guide</Link>.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 4: Process the Document</h3>
      <p className="text-muted-foreground mb-4">
        Hit the 'Process' button. DocMate's AI will analyze the document based on your chosen template.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 5: View the Results</h3>
      <p className="text-muted-foreground mb-4">
        Once processing is complete, you'll see the extracted data presented clearly. You can usually view it in different formats like:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Formatted View:</strong> Easy-to-read tables and key-value pairs.</li>
        <li><strong>JSON:</strong> Structured data ready for developers or integrations.</li>
        <li><strong>Markdown:</strong> Simple text format for documentation or notes.</li>
      </ul>
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_RESULTS"
        instruction="Replace this comment with an <img> tag showing the results view (Formatted, JSON, or Markdown tabs) in the Playground."
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Next Steps: API Integration (Optional)</h2>
      <p className="text-muted-foreground mb-4">
        Want to automate this process in your own applications? You can use the DocMate API.
      </p>
      <p className="text-muted-foreground mb-4">
        Here's a basic idea of how you might upload and process a document via API:
      </p>
      <CodePlaceholder 
        placeholder="CODE_SNIPPET_API_UPLOAD"
        instruction="Replace this comment with a short code snippet (e.g., curl, Python requests, JavaScript fetch) showing how to make an API call to upload a document and specify a template ID."
      />
      <p className="text-muted-foreground mb-6">
        For detailed API usage, including authentication, endpoints, and parameters, please refer to the full <Link href="/docs/api-reference" className="text-primary hover:underline">API Reference</Link>.
      </p>

      <p className="text-lg text-muted-foreground mt-10">
        That's it! You've successfully signed up and processed your first document using the DocMate Playground. Explore further, experiment with different documents and templates, and check out the rest of the documentation for more advanced features.
      </p>
    </div>
  );
} 