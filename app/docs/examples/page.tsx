"use client";

import Link from 'next/link';

// Reusable component for placeholders
const ExamplePlaceholder = ({ placeholder, instruction, type = 'IMAGE' }: { placeholder: string; instruction: string; type?: 'IMAGE' | 'JSON' | 'MARKDOWN' | 'FORMATTED' }) => (
  <div className="my-6 p-4 rounded-lg bg-muted border border-border overflow-hidden">
    {type === 'IMAGE' && (
      <pre className="text-sm text-muted-foreground bg-transparent p-0">
        <code>{`<!-- ${placeholder} -->`}</code>
      </pre>
    )}
    {type === 'JSON' && (
      <pre className="text-sm text-primary/90 bg-transparent p-0 overflow-x-auto">
        <code>{`// ${placeholder}`}</code>
      </pre>
    )}
    {type === 'MARKDOWN' && (
      <pre className="text-sm text-blue-400 bg-transparent p-0 overflow-x-auto">
        <code>{`<!-- ${placeholder} -->`}</code>
      </pre>
    )}
    {type === 'FORMATTED' && (
       <div className="text-sm text-foreground bg-transparent p-0">
          <p>{`<!-- ${placeholder} -->`}</p>
       </div>
    )}
    <p className="mt-3 text-xs text-accent-foreground/80"><em><strong>Instruction:</strong> {instruction}</em></p>
  </div>
);

export default function ExampleInvoicePage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Workflow Example: Processing an Invoice</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Let's walk through a common scenario: extracting key information from an invoice using DocuMate. This example shows how you can target specific data points and view them in different formats, all handled automatically.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">The Scenario: Extracting Invoice Details</h2>
      <p className="text-muted-foreground mb-6">
        Imagine you receive dozens of invoices daily and need to quickly pull out the essentials for your accounting system: the invoice number, vendor name, total amount due, and the due date. Manually finding and typing this takes time and risks errors.
      </p>
      <p className="text-muted-foreground mb-4">
        Here's a typical invoice we might receive:
      </p>
      <ExamplePlaceholder
        placeholder="IMAGE_PLACEHOLDER_SAMPLE_INVOICE"
        instruction="Replace this comment with an <img> tag showing a clear example of a sample invoice document."
        type="IMAGE"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Using DocuMate to Extract Specific Data</h2>
      <p className="text-muted-foreground mb-6">
        Instead of reading the whole invoice, we can tell DocuMate exactly what we need using a template in the <Link href="/playground" className="text-primary hover:underline">Playground</Link>.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 1: Upload the Invoice</h3>
      <p className="text-muted-foreground mb-4">
        First, we upload the invoice PDF or image file to the Playground.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 2: Define a Targeted Template</h3>
      <p className="text-muted-foreground mb-4">
        We don't need every single line item or address detail. We only care about four key pieces of information. So, we create a simple template named "Key Invoice Data" defining just these fields:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
        <li><code>InvoiceNumber</code> (Type: String)</li>
        <li><code>VendorName</code> (Type: String)</li>
        <li><code>TotalAmount</code> (Type: Currency)</li>
        <li><code>DueDate</code> (Type: Date)</li>
      </ul>
      <p className="text-muted-foreground mb-4">
         The template creation UI would look something like this:
      </p>
      <ExamplePlaceholder
        placeholder="IMAGE_PLACEHOLDER_INVOICE_TEMPLATE_UI"
        instruction="Replace this comment with an <img> tag showing the Playground's template editor with the four fields (InvoiceNumber, VendorName, TotalAmount, DueDate) defined."
        type="IMAGE"
      />
      <p className="text-muted-foreground mb-4">
        By defining only these fields, we instruct DocuMate to focus its extraction efforts solely on finding this specific information, ignoring the rest.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 3: Process and View Results</h3>
      <p className="text-muted-foreground mb-4">
        After hitting 'Process', DocuMate uses the template to analyze the invoice. Within moments, it presents *only* the data we asked for in various formats.
      </p>

      <h4 className="text-lg font-semibold mt-6 mb-2">Formatted View:</h4>
      <p className="text-muted-foreground mb-4">Clean and simple key-value pairs, perfect for a quick check:</p>
      <ExamplePlaceholder
        placeholder="FORMATTED_VIEW_INVOICE_DATA"
        instruction="Replace this comment with a visual representation (HTML structure or simple text) of the extracted key-value pairs: InvoiceNumber: INV-123, VendorName: Example Corp, TotalAmount: $450.00, DueDate: 2023-12-31."
        type="FORMATTED"
      />

      <h4 className="text-lg font-semibold mt-6 mb-2">JSON Output:</h4>
      <p className="text-muted-foreground mb-4">Structured data ready for integration or further processing:</p>
      <ExamplePlaceholder
        placeholder={`{
  "InvoiceNumber": "INV-123",
  "VendorName": "Example Corp",
  "TotalAmount": 450.00,
  "DueDate": "2023-12-31"
}`}
        instruction="Replace this comment with the actual JSON object containing the extracted invoice data."
        type="JSON"
      />

      <h4 className="text-lg font-semibold mt-6 mb-2">Markdown Output:</h4>
      <p className="text-muted-foreground mb-4">A straightforward text format:</p>
      <ExamplePlaceholder
        placeholder={`## Key Invoice Data\n\n- **InvoiceNumber:** INV-123\n- **VendorName:** Example Corp\n- **TotalAmount:** $450.00\n- **DueDate:** 2023-12-31`}
        instruction="Replace this comment with the actual Markdown text representing the extracted invoice data."
        type="MARKDOWN"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Why This Matters</h2>
      <p className="text-muted-foreground mb-6">
        This example highlights several key benefits of DocuMate:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Targeted Extraction:</strong> You control exactly what data gets pulled, reducing noise and focusing on what's important.</li>
        <li><strong>Efficiency:</strong> Automates the process of finding specific details, saving significant time compared to manual searching.</li>
        <li><strong>Flexibility:</strong> Provides the extracted data in multiple formats suitable for different needs, from quick viewing to system integration.</li>
        <li><strong>Simplicity:</strong> Defining templates is straightforward and doesn't require deep technical knowledge.</li>
      </ul>

      <p className="text-lg text-muted-foreground mt-10">
        This is just one example. You can apply the same principles – defining targeted templates – to extract specific information from contracts, reports, forms, and many other document types using DocuMate.
      </p>
    </div>
  );
} 