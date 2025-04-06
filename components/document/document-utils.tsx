import { DocumentState } from "@/types/document";
import { toast } from "@/components/ui/use-toast";

export const createInitialState = (): DocumentState => {
  return {
    file: null,
    isProcessed: false,
    selectedDoc: null,
    extractedText: "",
    error: null,
    isSaved: false,
  };
};

export const validateFileType = (
  file: File, 
  updateState: (updates: Partial<DocumentState>) => void
): boolean => {
  const supportedTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true
  } as const;
  
  if (!file) {
    updateState({ error: 'No file selected.' });
    return false;
  }

  if (file.size > 10 * 1024 * 1024) {
    updateState({ error: 'File size exceeds 10MB limit.' });
    return false;
  }
  
  if (!(file.type in supportedTypes)) {
    updateState({ 
      error: `Unsupported file type: ${file.type}. Please upload a PDF or image file (JPG, PNG, GIF, WebP).` 
    });
    return false;
  }
  return true;
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const downloadJson = (selectedDoc: any, fileName: string) => {
  const jsonString = JSON.stringify(selectedDoc?.contentJson, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${fileName || 'document'}.json`);
};

export const downloadMarkdown = (selectedDoc: any, fileName: string, generateMarkdown: (data: any) => string) => {
  const markdownContent = generateMarkdown(selectedDoc?.contentJson);
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  downloadBlob(blob, `${fileName || 'document'}.md`);
};

export const downloadCsv = (selectedDoc: any, fileName: string) => {
  const content = selectedDoc?.contentJson;
  let csvContent = '';
  
  if (content.metadata) {
    csvContent += 'Metadata\n';
    Object.entries(content.metadata).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value as any).forEach(([subKey, subValue]) => {
          csvContent += `${key},${subKey},${subValue}\n`;
        });
      } else {
        csvContent += `${key},,${value}\n`;
      }
    });
    csvContent += '\n';
  }

  if (content.content) {
    csvContent += 'Content\n';
    Object.entries(content.content).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const headers = Object.keys(value[0] || {});
        csvContent += `${key}\n${headers.join(',')}\n`;
        value.forEach(item => {
          csvContent += `${Object.values(item).join(',')}\n`;
        });
      } else if (typeof value === 'object') {
        Object.entries(value as any).forEach(([subKey, subValue]) => {
          csvContent += `${key},${subKey},${subValue}\n`;
        });
      }
      csvContent += '\n';
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, `${fileName || 'document'}.csv`);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 