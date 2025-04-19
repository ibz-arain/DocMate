"use client";

export default function IntroductionPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Introduction</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          DocMate is an AI-powered documentation platform that helps developers create,
          maintain, and organize their project documentation with ease.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What is DocMate?</h2>
        <p className="text-muted-foreground mb-4">
          DocMate combines the power of artificial intelligence with modern documentation
          practices to streamline the documentation process. It automatically generates,
          updates, and maintains documentation while you focus on writing code.
        </p>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 my-6">
          <h3 className="text-xl font-medium mb-3">Key Features</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></span>
              <span className="text-muted-foreground">AI-powered documentation generation</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></span>
              <span className="text-muted-foreground">Real-time synchronization with your codebase</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></span>
              <span className="text-muted-foreground">Smart search and navigation</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2"></span>
              <span className="text-muted-foreground">Version control integration</span>
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Why DocMate?</h2>
        <p className="text-muted-foreground mb-4">
          Documentation is crucial for any software project, but it often becomes outdated
          or incomplete as the project evolves. DocMate solves this problem by:
        </p>
        <ul className="space-y-3 text-muted-foreground">
          <li>• Automatically updating documentation when code changes</li>
          <li>• Ensuring consistency across all documentation</li>
          <li>• Reducing the time spent on writing and maintaining docs</li>
          <li>• Making documentation more accessible and searchable</li>
        </ul>
      </div>
    </div>
  );
}