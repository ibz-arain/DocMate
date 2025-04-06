import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, FileText, TableIcon, Save, RefreshCcw } from "lucide-react";
import { DocumentState } from "@/types/document";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface DocumentInfoProps {
  currentState: DocumentState;
  isProcessing: boolean;
  user: any;
  onDownloadJson: () => void;
  onDownloadMarkdown: () => void;
  onDownloadCsv: () => void;
  onSaveDocument: (documentName?: string) => void;
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [documentNameInput, setDocumentNameInput] = useState("");

  const handleSaveClick = () => {
    if (!user) return;
    
    if (currentState.isSaved) return;
    
    // Initialize document name with the current file name (without extension)
    if (currentState.file && !documentNameInput) {
      const fileName = currentState.file.name;
      const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
      setDocumentNameInput(nameWithoutExtension);
    }
    
    setShowSaveDialog(true);
  };

  const handleSaveDocument = () => {
    if (!documentNameInput.trim()) {
      toast({
        title: "Document name required",
        description: "Please enter a name for your document",
        variant: "destructive"
      });
      return;
    }
    
    onSaveDocument(documentNameInput.trim());
    setShowSaveDialog(false);
    setDocumentNameInput("");
  };

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
              className={cn(
                "w-full text-sm h-8 sm:h-9",
                "hover:bg-primary/10 hover:text-primary",
                "active:bg-primary/20"
              )}
              variant="outline"
              onClick={onDownloadJson}
            >
              <Code className="mr-2 h-3.5 w-3.5" />
              <span className="sm:inline hidden">Download</span> JSON
            </Button>
            <Button 
              className={cn(
                "w-full text-sm h-8 sm:h-9",
                "hover:bg-primary/10 hover:text-primary",
                "active:bg-primary/20"
              )}
              variant="outline"
              onClick={onDownloadMarkdown}
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              <span className="sm:inline hidden">Download</span> Markdown
            </Button>
            <Button 
              className={cn(
                "w-full text-sm h-8 sm:h-9",
                "hover:bg-primary/10 hover:text-primary",
                "active:bg-primary/20"
              )}
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
              className={cn(
                "w-full flex items-center justify-center text-sm h-8 sm:h-9",
                "bg-primary/10 text-primary",
                "hover:bg-primary/20",
                currentState.isSaved && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSaveClick}
              disabled={!user || currentState.isSaved || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCcw className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : currentState.isSaved ? (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
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
        className={cn(
          "w-full flex items-center justify-center text-sm h-8 sm:h-9",
          "hover:bg-primary/10 hover:text-primary",
          "active:bg-primary/20"
        )}
      >
        <RefreshCcw className="h-3.5 w-3.5 mr-2" />
        <span className="sm:inline hidden">Process</span> New Document
      </Button>

      {/* Save Document Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="document-name" className="text-sm font-medium">
                  Document Name
                </label>
                <Input
                  id="document-name"
                  placeholder="Enter a name for your document"
                  value={documentNameInput}
                  onChange={(e) => setDocumentNameInput(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              variant="outline" 
              className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
              onClick={handleSaveDocument}
            >
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 