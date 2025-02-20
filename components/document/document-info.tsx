import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, FileText, TableIcon, Save, RefreshCcw } from "lucide-react";
import { DocumentState } from "@/types/document";

interface DocumentInfoProps {
  currentState: DocumentState;
  isProcessing: boolean;
  user: any;
  onDownloadJson: () => void;
  onDownloadMarkdown: () => void;
  onDownloadCsv: () => void;
  onSaveDocument: () => void;
  onNewDocument: () => void;
}

export function DocumentInfo({
  currentState,
  isProcessing,
  user,
  onDownloadJson,
  onDownloadMarkdown,
  onDownloadCsv,
  onSaveDocument,
  onNewDocument,
}: DocumentInfoProps) {
  return (
    <div className="space-y-4 min-w-0 w-full lg:overflow-auto">
      <Card className="transition-all">
        <CardHeader className="p-4 sm:min-h-[4rem] min-h-[3rem]">
          <CardTitle className="text-base">Document Info</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 sm:space-y-4">
            <div>
              <h3 className="text-sm font-medium">File Name</h3>
              <p className="text-sm text-muted-foreground truncate">{currentState.file?.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Document Type</h3>
              <p className="text-sm text-muted-foreground truncate">
                {currentState.selectedDoc?.contentJson?.documentType || "Unknown"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Page Count</h3>
              <p className="text-sm text-muted-foreground">
                {currentState.selectedDoc?.contentJson?.metadata?.pageCount || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Confidence Score</h3>
              <p className="text-sm text-muted-foreground">
                {(currentState.selectedDoc?.rawJson?.analysis?.confidenceScore * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all">
        <CardHeader className="p-4 sm:min-h-[4rem] min-h-[3rem]">
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2">
            <Button 
              className="w-full text-sm h-8 sm:h-9" 
              variant="outline"
              onClick={onDownloadJson}
            >
              <Code className="mr-2 h-3.5 w-3.5" />
              <span className="sm:inline hidden">Download</span> JSON
            </Button>
            <Button 
              className="w-full text-sm h-8 sm:h-9" 
              variant="outline"
              onClick={onDownloadMarkdown}
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span className="sm:inline hidden">Download</span> Markdown
            </Button>
            <Button 
              className="w-full text-sm h-8 sm:h-9" 
              variant="outline"
              onClick={onDownloadCsv}
            >
              <TableIcon className="mr-2 h-3.5 w-3.5" />
              <span className="sm:inline hidden">Download</span> CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all">
        <CardHeader className="p-4 sm:min-h-[4rem] min-h-[3rem]">
          <CardTitle className="text-base">Save Results</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 sm:space-y-3">
            <p className="text-xs text-muted-foreground text-center sm:block hidden">
              {currentState.isSaved 
                ? "Document has been saved to your history" 
                : "Save this document to your history for future reference"}
            </p>
            <Button 
              className="w-full flex items-center justify-center text-sm h-8 sm:h-9" 
              onClick={onSaveDocument}
              disabled={!user || currentState.isSaved || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : currentState.isSaved ? (
                <>
                  <Save className="mr-2 h-3.5 w-3.5 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  {user ? 'Save Document' : 'Sign in to Save'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="outline"
        onClick={onNewDocument}
        className="w-full flex items-center justify-center text-sm h-8 sm:h-9"
      >
        <RefreshCcw className="h-3.5 w-3.5 mr-2" />
        <span className="sm:inline hidden">Process</span> New Document
      </Button>
    </div>
  );
} 