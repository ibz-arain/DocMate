declare module 'pdf2pic' {
  interface ConversionOptions {
    density?: number;
    format?: string;
    width?: number;
    height?: number;
    quality?: number;
    saveFilename?: string;
    savePath?: string;
  }

  interface ConversionResult {
    name: string;
    size: number;
    path: string;
    page: number;
    base64: string;
  }

  type Convert = (pageNumber: number) => Promise<ConversionResult>;

  export function fromBuffer(
    buffer: Buffer,
    options?: ConversionOptions
  ): Convert;
} 