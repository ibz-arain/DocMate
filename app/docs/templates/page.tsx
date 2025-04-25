"use client";

import Link from 'next/link';

// Reusable component for placeholders
const TemplatePlaceholder = ({ placeholder, instruction, type = 'IMAGE' }: { placeholder: string; instruction: string; type?: 'IMAGE' | 'CODE' }) => (
  <div className="my-6 p-4 rounded-lg bg-muted border border-border overflow-hidden">
    {type === 'IMAGE' && (
      <pre className="text-sm text-muted-foreground bg-transparent p-0">
        <code>{`<!-- ${placeholder} -->`}</code>
      </pre>
    )}
    {type === 'CODE' && (
      <pre className="text-sm text-primary/90 bg-transparent p-0 overflow-x-auto">
        <code>{`// ${placeholder}`}</code>
      </pre>
    )}
    <p className="mt-3 text-xs text-accent-foreground/80"><em><strong>Instruction:</strong> {instruction}</em></p>
  </div>
);

export default function TemplatesGuidePage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Designing Extraction Templates</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Templates are the heart of DocMate's targeted extraction. They act as a blueprint, telling our AI exactly what information you want to pull from your documents and how that information is structured. Master templates, and you master automated data extraction.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">What is a Template?</h2>
      <p className="text-muted-foreground mb-6">
        Think of a template as a structured shopping list for data. Instead of manually scanning a document for every piece of information, you define the items (fields) you need in a template. DocMate then uses this list to find and extract only those specific items from the document you upload.
      </p>
      <p className="text-muted-foreground mb-6">
        You can create, save, and manage your templates within the <Link href="/playground/templates" className="text-primary hover:underline">Playground's Template Editor</Link> (assuming a dedicated section or similar).
      </p>
      <TemplatePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_TEMPLATE_EDITOR"
        instruction="Replace this comment with an <img> tag showing the main UI of the template editor/manager."
        type="IMAGE"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Building Your Template: Sections and Fields</h2>
      <p className="text-muted-foreground mb-6">
        A template is composed of one or more sections (which we often call 'tables' internally). Each section targets a specific kind of data structure within your document. There are two main types:
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">1. Data Sections (Type: `data`)</h3>
      <p className="text-muted-foreground mb-4">
        Use this type for extracting individual, distinct pieces of information – like key-value pairs. Think of things like:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
        <li>Invoice Number</li>
        <li>Customer Name</li>
        <li>Statement Date</li>
        <li>Total Amount</li>
        <li>Account Number</li>
      </ul>
      <p className="text-muted-foreground mb-4">
        In your template, you'd create a section (e.g., "Header Info") of type `data` and add fields for each specific item you want (e.g., Field Name: `InvoiceNumber`, Type: `string`). DocMate will look for these labels or values individually in the document.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">2. Table Sections (Type: `table`)</h3>
      <p className="text-muted-foreground mb-4">
        Use this type when you need to extract data that's organized in rows and columns. This is perfect for:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-4">
        <li>Line items on an invoice (Item Name, Quantity, Price, Amount)</li>
        <li>Transaction lists on a bank statement (Date, Description, Debit, Credit)</li>
        <li>Procedures on a dental claim (Code, Description, Fee)</li>
      </ul>
      <p className="text-muted-foreground mb-4">
        You'd create a section (e.g., "Line Items") of type `table` and define the columns as fields (e.g., Field Name: `ItemName`, Type: `string`; Field Name: `Quantity`, Type: `number`). DocMate will identify the tabular structure in the document and extract the data row by row based on your defined columns.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Defining Fields</h3>
      <p className="text-muted-foreground mb-4">
        Within each section (`data` or `table`), you add the specific fields you want to extract. Each field needs:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Name:</strong> A unique identifier for the field (e.g., `vendorName`, `transactionDate`). This will be the key in your JSON output. Use camelCase or snake_case consistently.</li>
        <li><strong>Type:</strong> The expected data type. Common types include:
          <ul className="list-circle pl-6 mt-1">
            <li>`string`: Textual data</li>
            <li>`number`: Numerical data (integers or decimals)</li>
            <li>`currency`: Monetary values (often treated as numbers but helps AI context)</li>
            <li>`date`: Dates (DocMate tries to standardize formats)</li>
            <li>`boolean`: True/False values</li>
          </ul>
        </li>
        <li><strong>Description (Optional):</strong> A brief note about the field for your own reference or to help the AI understand context (e.g., "Total amount including tax").</li>
        <li><strong>Is Required (Checkbox):</strong> Mark if this field is essential. While the AI tries its best, this currently serves more as an indicator for your own organization.</li>
        <li><strong>Format (Optional):</strong> Specify expected formats, especially for dates (e.g., `YYYY-MM-DD`, `MM/DD/YYYY`), to guide the AI.</li>
      </ul>
      <TemplatePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_FIELD_DEFINITION_UI"
        instruction="Replace this comment with an <img> tag showing the UI for adding/editing a single field within a template section, highlighting the Name, Type, Description, etc. inputs."
        type="IMAGE"
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Using Your Templates</h2>
      <p className="text-muted-foreground mb-6">
        Once you've designed and saved a template, you can use it in two main ways:
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">1. In the Playground</h3>
      <p className="text-muted-foreground mb-4">
        When processing a document in the <Link href="/playground" className="text-primary hover:underline">Playground</Link>, simply select your saved template from the dropdown menu before hitting 'Process'. DocMate will then use that specific structure for extraction.
      </p>
      <TemplatePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_PLAYGROUND_TEMPLATE_SELECT"
        instruction="Replace this comment with an <img> tag showing the template selection dropdown in the Playground UI."
        type="IMAGE"
      />

      <h3 className="text-xl font-semibold mt-6 mb-3">2. With the API</h3>
      <p className="text-muted-foreground mb-4">
        When automating document processing via the API, you'll typically need the unique ID of your saved template. You then include this `templateId` in your API request when uploading the document.
      </p>
      <TemplatePlaceholder 
        placeholder="API_CALL_WITH_TEMPLATE_ID"
        instruction="Replace this comment with a short code snippet (e.g., curl, Python, JS) showing an API call that includes a 'templateId' parameter."
        type="CODE"
      />
      <p className="text-muted-foreground mb-6">
        Refer to the <Link href="/docs/api-reference" className="text-primary hover:underline">API Reference</Link> for specific endpoint details and parameters.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Tips for Effective Templates</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Be Specific:</strong> Use clear, descriptive names for your fields.</li>
        <li><strong>Match Structure:</strong> Use `data` sections for key-values and `table` sections for tabular data as they appear in the document.</li>
        <li><strong>Start Simple:</strong> Begin with the most crucial fields and add more as needed.</li>
        <li><strong>Test Thoroughly:</strong> Use the Playground to test your templates with various example documents to ensure they extract data accurately.</li>
      </ul>

      <p className="text-lg text-muted-foreground mt-10">
        By creating well-designed templates, you unlock DocMate's ability to precisely and automatically extract the information you need, saving you time and effort.
      </p>
    </div>
  );
} 