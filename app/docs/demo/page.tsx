"use client";

import Link from 'next/link';

// Reusable component for code placeholders
const CodePlaceholder = ({ placeholder, instruction }: { placeholder: string; instruction: string }) => (
  <div className="my-4 p-4 rounded-lg bg-muted border border-border">
    <pre className="text-sm text-muted-foreground bg-transparent p-0 overflow-x-auto">
      <code>{`<!-- ${placeholder} -->`}</code>
    </pre>
    <p className="mt-2 text-xs text-accent-foreground/80"><em><strong>Instruction:</strong> {instruction}</em></p>
  </div>
);

export default function DemoGuidePage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Using the Interactive Demo</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Want a quick taste of DocMate without signing up? The interactive demo on our <Link href="/demo" className="text-primary hover:underline">Demo page</Link> allows you to upload specific document types and see the extraction results instantly. It's a great way to understand the basic workflow.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">How to Use the Demo</h2>
      <p className="text-muted-foreground mb-6">
        Follow these simple steps to try out the demo feature:
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 1: Go to the Demo Page</h3>
      <p className="text-muted-foreground mb-4">
        First, navigate to the main <Link href="/demo" className="text-primary hover:underline">Demo page</Link>.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 2: Find the "Try It Out" Section</h3>
      <p className="text-muted-foreground mb-4">
        Scroll down the Demo page until you find the section titled "Try DocMate Now" or similar. This is the interactive demo component.
      </p>
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_DEMO_SECTION"
        instruction="Replace this comment with an <img> tag showing a screenshot of the 'Try It Out' section on the /demo page."
      />

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 3: Select a Document Type</h3>
      <p className="text-muted-foreground mb-4">
        The demo uses predefined templates for common document types. Use the dropdown menu to select the type of document you want to upload (e.g., 'T4 Tax Form', 'Bank Statement', 'Store Receipt'). This helps the AI know what kind of structure and fields to expect.
      </p>
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_DEMO_SELECT"
        instruction="Replace this comment with an <img> tag showing the dropdown menu for selecting the document type in the demo."
      />

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 4: Upload a Matching Document</h3>
      <p className="text-muted-foreground mb-4">
        Now, upload a document file (PDF, JPG, PNG) that matches the type you selected. For instance, if you chose 'Store Receipt', upload an actual image or PDF of a receipt.
      </p>
      <p className="text-muted-foreground mb-4">
        You can drag and drop the file onto the upload area or click to browse your computer.
      </p>
      {/* Placeholder for upload action */}

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 5: Process the Document</h3>
      <p className="text-muted-foreground mb-4">
        Click the 'Process Document' (or similarly named) button. DocMate will analyze the file based on the selected document type's predefined template.
      </p>

      <h3 className="text-xl font-semibold mt-6 mb-3">Step 6: View the Extracted Results</h3>
      <p className="text-muted-foreground mb-4">
        After a few moments, a results dialog will pop up. Here, you can see the information DocMate extracted from your document.
      </p>
      <p className="text-muted-foreground mb-4">
        Explore the different tabs to see the data in various formats:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li><strong>Formatted:</strong> Presents the data in easy-to-read tables or lists.</li>
        <li><strong>JSON:</strong> Shows the raw structured data, useful for developers.</li>
        <li><strong>Markdown:</strong> A simple text-based representation.</li>
        <li><strong>Analysis:</strong> Provides a summary and keywords extracted from the document.</li>
      </ul>
      <CodePlaceholder 
        placeholder="IMAGE_PLACEHOLDER_DEMO_RESULTS"
        instruction="Replace this comment with an <img> tag showing the results dialog with the different view tabs (Formatted, JSON, etc.)."
      />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Limitations of the Demo</h2>
      <p className="text-muted-foreground mb-6">
        Keep in mind that the demo provides a simplified experience:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li>You can only use the predefined document types/templates.</li>
        <li>You cannot save templates or processed documents.</li>
        <li>Advanced features like custom prompts might not be available.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Want More?</h2>
      <p className="text-muted-foreground mb-4">
        Liked what you saw? To unlock the full potential of DocMate, including creating your own custom templates, saving documents, and using the API, you'll need to <Link href="/signup" className="text-primary hover:underline">sign up for an account</Link>.
      </p>
      <p className="text-muted-foreground">
        After signing up, head to the <Link href="/playground" className="text-primary hover:underline">Playground</Link> for a more feature-rich experience, as described in the <Link href="/docs/quick-start" className="text-primary hover:underline">Quick Start Guide</Link>.
      </p>
    </div>
  );
} 