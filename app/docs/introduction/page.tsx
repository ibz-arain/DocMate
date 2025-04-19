"use client";

export default function IntroductionPage() {
  return (
    <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Welcome to DocMate</h1>

      <p className="text-lg text-muted-foreground mb-8">
        Fed up with drowning in paperwork? DocMate is here to change the game. We use smart AI to automatically pull the info you need from any document, turning messy paperwork into clean, structured data you can actually use. Say goodbye to manual data entry and hello to more time for what matters.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">What's DocMate All About?</h2>
      <p className="text-muted-foreground mb-4">
        Born from a winning idea at WinHacks 2025, DocMate tackles a common headache: endless hours spent processing documents manually. We figured there had to be a better way.
      </p>
      <p className="text-muted-foreground mb-8">
        Our platform uses AI to understand your documents – whether they're invoices, receipts, tax forms, or something completely custom. You tell DocMate what information you need using simple templates (no coding required!), and it extracts exactly that, organizing it neatly for you.
      </p>

      <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 my-10">
        <h3 className="text-xl font-medium mb-4">Key Features</h3>
        <ul className="space-y-3 list-none p-0 m-0">
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-muted-foreground"><strong>Your Docs, Your Rules:</strong> Create custom templates easily to extract exactly what you need.</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-muted-foreground"><strong>AI-Powered Extraction:</strong> Let our intelligent engine handle the data lifting, recognizing and pulling info automatically.</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-muted-foreground"><strong>Structured Data Output:</strong> Get your information back in clean formats like JSON, CSV, or Markdown.</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-muted-foreground"><strong>API Integration:</strong> Seamlessly connect DocMate with your existing workflows and applications.</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></span>
            <span className="text-muted-foreground"><strong>Privacy Focused:</strong> Your data security is our priority. We handle your documents responsibly.</span>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Why Bother?</h2>
      <p className="text-muted-foreground mb-4">
        Let's be real, document processing is tedious and error-prone. DocMate helps you:
      </p>
      <ul className="space-y-3 text-muted-foreground list-disc pl-5 mb-8">
        <li><strong>Save Serious Time:</strong> Automate data entry and free up your team.</li>
        <li><strong>Reduce Errors:</strong> Minimize mistakes caused by manual input.</li>
        <li><strong>Boost Efficiency:</strong> Streamline workflows that depend on document data.</li>
        <li><strong>Handle Variety:</strong> Process diverse document types with adaptable templates.</li>
        <li><strong>Get Insights Faster:</strong> Turn documents into actionable data quickly.</li>
      </ul>

      <p className="text-muted-foreground">
        Ready to dive deeper? Check out the <a href="/docs/quick-start" className="text-primary hover:underline">Quick Start</a> guide to get DocMate up and running, or explore the <a href="/docs/core-concepts" className="text-primary hover:underline">Core Concepts</a> to understand the fundamentals.
      </p>
    </div>
  );
}