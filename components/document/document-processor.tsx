import { DocumentState } from "@/types/document";
import { convertFileToBase64 } from "./document-utils";

interface ProcessOptions {
  customPrompt?: string;
  outputFormat?: any;
}

export const processDocument = async (
  documentState: DocumentState,
  updateState: (updates: Partial<DocumentState>) => void,
  setIsProcessing: (value: boolean) => void,
  setProgress: (value: number) => void,
  options?: ProcessOptions
): Promise<void> => {
  if (!documentState.file || documentState.isProcessed) return Promise.resolve();
  
  try {
    setIsProcessing(true);
    setProgress(0);
    
    let currentProgress = 0;
    
    // Calculate progress with slight positive variation
    const addVariation = (value: number, range: number = 0.5) => {
      return value + (Math.random() * range);
    };
    
    const microMovement = async (baseProgress: number, duration: number = 800) => {
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      while (Date.now() < endTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const smallVariation = (Math.random() * 0.3) - 0.15;
        setProgress(Math.min(99, Math.max(baseProgress, baseProgress + smallVariation)));
      }
    };
    
    const incrementProgress = async (start: number, end: number, duration: number) => {
      const steps = 20;
      const stepDuration = duration / steps;
      
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        // Calculate progress with slight positive variation
        const rawProgress = start + ((end - start) * (i / steps));
        const progress = Math.min(end, rawProgress + (Math.random() * 0.3));
        currentProgress = Math.max(currentProgress, progress);
        setProgress(Math.round(currentProgress * 10) / 10);
      }
    };

    // Initial jump to show quick response
    await incrementProgress(0, 8, 300);
    
    // Slower progress through main processing stages with natural pauses
    const stages = [
      { end: 35, duration: 2500 },
      { end: 58, duration: 3000 },
      { end: 73, duration: 2800 },
      { end: 89, duration: 2500 }
    ];

    for (const stage of stages) {
      await incrementProgress(currentProgress, stage.end, stage.duration);
      // Add micro-movements during "processing" pauses
      const pauseDuration = addVariation(1500, 500);
      await microMovement(currentProgress, pauseDuration);
    }

    // Process the document
    let result;
    try {
      // Validate file size before processing
      if (documentState.file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      let base64Data = await convertFileToBase64(documentState.file);
      if (!base64Data || typeof base64Data !== 'string') {
        throw new Error('Failed to convert file to base64');
      }
      base64Data = base64Data.split(',')[1] || base64Data;

      const requestData = {
        imageData: base64Data,
        mimeType: documentState.file.type || 'application/octet-stream',
        customPrompt: options?.customPrompt, 
        outputFormat: options?.outputFormat
      };

      if (!requestData.imageData) {
        throw new Error('Invalid file data');
      }

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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }
      result = await response.json();

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response data from server');
      }

      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      if (!result.analysis) {
        throw new Error('No analysis data received');
      }
    } catch (error) {
      throw error;
    }

    // Quick but smooth jump to completion
    await incrementProgress(currentProgress, 99, 300);
    await microMovement(99, 400); // Small movements at 99%
    
    // Final jump to 100%
    setProgress(100);
    
    // Brief pause at 100%
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Now update the state with results
    const updates = {
      extractedText: result.analysis.content?.text || "No text extracted",
      selectedDoc: {
        summary: result.analysis.analysis?.summary || "",
        keywords: result.analysis.analysis?.keywords || [],
        sentiment: result.analysis.analysis?.sentiment || "",
        rawJson: result.analysis,
        contentJson: result.result
      },
      isProcessed: true,
      error: null
    };

    // Update all states at once after showing 100%
    updateState(updates);
    
    console.log("Document processed successfully!");
    return Promise.resolve();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    updateState({ error: errorMessage });
    setProgress(0);
    return Promise.reject(error);
  } finally {
    setIsProcessing(false);
  }
}; 