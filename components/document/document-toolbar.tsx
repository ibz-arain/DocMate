import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Table,
  FileText,
  Loader2,
  Zap
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { convertFileToBase64 } from "./document-utils";
import { toast } from "@/components/ui/use-toast";

interface DocumentToolbarProps {
  pdfFile: File | null;
  onSummarizeComplete: (result: any) => void;
  onQuickFormatComplete: (result: any) => void;
  onTemplateFormatStart: () => void;
  disabled?: boolean;
}

export function DocumentToolbar({
  pdfFile,
  onSummarizeComplete,
  onQuickFormatComplete,
  onTemplateFormatStart,
  disabled = false
}: DocumentToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<string | null>(null);

  const processFullDocument = async (type: 'summarize' | 'quickformat', customPrompt: string, outputFormat?: any) => {
    if (!pdfFile) {
      toast({
        title: "No document loaded",
        description: "Please load a PDF document first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingType(type);

      // Convert file to base64
      let base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      const requestData = {
        imageData: base64Data,
        mimeType: pdfFile.type || 'application/pdf',
        customPrompt,
        outputFormat
      };

      const response = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Server processing error';
        } else {
          errorMessage = response.statusText || 'Server processing error';
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response data from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      // Call appropriate completion handler
      if (type === 'summarize') {
        onSummarizeComplete(result);
      } else if (type === 'quickformat') {
        onQuickFormatComplete(result);
      }

      toast({
        title: "Document processed successfully",
        description: `${type === 'summarize' ? 'Summary' : 'Formatting'} completed.`,
      });

    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleFullDocumentSummarize = async () => {
    if (!pdfFile) {
      toast({
        title: "No document loaded",
        description: "Please load a PDF document first.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingType('summarize');

      // First, extract text from the PDF using the custom endpoint
      let base64Data = await convertFileToBase64(pdfFile);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      // Extract text from the PDF
      const extractResponse = await fetch('/api/analyze/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageData: base64Data,
          mimeType: pdfFile.type || 'application/pdf',
          customPrompt: 'Extract all text content from this document. Preserve the structure and formatting as much as possible. Include all readable text from all pages.',
          outputFormat: {
            documentType: "Text Extraction",
            tables: [{
              name: "extracted_text",
              description: "All text content from the document",
              type: "data" as const,
              fields: [{
                name: "content",
                type: "string",
                description: "The complete text content of the document",
                required: true
              }]
            }]
          }
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract text from document');
      }

      const extractResult = await extractResponse.json();
      const extractedText = extractResult?.analysis?.content?.extracted_text?.content || 
                           extractResult?.result?.extracted_text?.content ||
                           'Unable to extract text from document';

      // Now summarize the extracted text using the dedicated summarize endpoint
      const summarizeResponse = await fetch('/api/analyze/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: extractedText
        }),
      });

      if (!summarizeResponse.ok) {
        const errorData = await summarizeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to summarize document');
      }

      const summaryResult = await summarizeResponse.json();

      // Format the result to match expected structure
      const result = {
        analysis: {
          content: summaryResult.summary,
          summary: summaryResult.summary
        }
      };

      onSummarizeComplete(result);

      toast({
        title: "Document summarized successfully",
        description: "Summary completed.",
      });

    } catch (error) {
      console.error('Document summarization error:', error);
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const handleFullDocumentQuickFormat = () => {
    const outputFormat = {
      documentType: "Full Document Quick Format",
      tables: [
        {
          name: "document_structure",
          description: "Main structural elements of the document",
          type: "table" as const,
          fields: [
            {
              name: "section",
              type: "string",
              description: "Section or chapter name",
              required: true
            },
            {
              name: "content_type",
              type: "string", 
              description: "Type of content (text, table, list, etc.)",
              required: true
            },
            {
              name: "key_points",
              type: "string",
              description: "Main points or summary of this section",
              required: false
            }
          ]
        },
        {
          name: "key_data",
          description: "Important data points found in the document",
          type: "table" as const,
          fields: [
            {
              name: "category",
              type: "string",
              description: "Data category or type",
              required: true
            },
            {
              name: "value",
              type: "string",
              description: "The actual data value",
              required: true
            },
            {
              name: "context",
              type: "string",
              description: "Context or additional information",
              required: false
            }
          ]
        }
      ]
    };

    const prompt = `Analyze this entire document and extract its structure and key data points. 

Instructions:
1. Identify the main sections, chapters, or logical divisions
2. Extract key data points, numbers, dates, names, and important information
3. Organize the content into a structured format
4. Preserve important context and relationships
5. Create a comprehensive overview of the document's content

Focus on making the information easily accessible and well-organized.`;

    processFullDocument('quickformat', prompt, outputFormat);
  };

  const handleTemplateFormat = () => {
    onTemplateFormatStart();
  };

  const getButtonContent = (type: string, icon: React.ReactNode, label: string) => {
    if (isProcessing && processingType === type) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">Processing...</span>
        </>
      );
    }
    return (
      <>
        {icon}
        <span className="ml-2">{label}</span>
      </>
    );
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-md border">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullDocumentSummarize}
              disabled={disabled || !pdfFile || isProcessing}
              className="flex items-center"
            >
              {getButtonContent('summarize', <Sparkles className="h-4 w-4" />, 'Summarize')}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Generate a comprehensive summary of the entire document</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullDocumentQuickFormat}
              disabled={disabled || !pdfFile || isProcessing}
              className="flex items-center"
            >
              {getButtonContent('quickformat', <Table className="h-4 w-4" />, 'Quick Format')}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Extract and format key data from the entire document</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTemplateFormat}
              disabled={disabled || !pdfFile || isProcessing}
              className="flex items-center"
            >
              <FileText className="h-4 w-4" />
              <span className="ml-2">Template Format</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Apply a custom template to format the entire document</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 