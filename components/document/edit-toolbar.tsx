import { Button } from "@/components/ui/button";
import {
  PenLine,
  Type,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Highlighter,
  Palette,
  Eraser,
  Image as ImageIcon,
  Stamp,
  StickyNote,
  Hand,
  Undo,
  Redo,
  Save,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EditToolbarProps {
  selectedEditTool: string | null;
  onEditToolSelect: (tool: string) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}

const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#008000", // Dark Green
  "#FF69B4", // Hot Pink
  "#4B0082", // Indigo
];

const EDIT_TOOLS = [
  { id: 'hand', label: 'Pan Tool', icon: Hand },
  { id: 'text', label: 'Insert Text', icon: Type },
  { id: 'draw', label: 'Draw', icon: PenLine },
  { id: 'highlight', label: 'Highlight', icon: Highlighter },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'arrow', label: 'Arrow', icon: ArrowRight },
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'image', label: 'Add Image', icon: ImageIcon },
  { id: 'stamp', label: 'Add Stamp', icon: Stamp },
  { id: 'sticky', label: 'Sticky Note', icon: StickyNote },
];

export function EditToolbar({
  selectedEditTool,
  onEditToolSelect,
  selectedColor,
  onColorSelect,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onSave,
}: EditToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 bg-background/95 border border-primary/30 shadow-2xl backdrop-blur-sm rounded-lg p-1 ring-2 ring-primary/10">
        <TooltipProvider delayDuration={0}>
          {/* History Controls */}
          <div className="flex items-center mr-2 border-r border-border pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-background/80">
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-background/80">
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Drawing Tools */}
          <div className="flex items-center gap-1">
            {EDIT_TOOLS.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedEditTool === tool.id ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditToolSelect(tool.id)}
                  >
                    <tool.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-background/80">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Color Palette */}
          <div className="flex items-center gap-1">
            {COLORS.map((color) => (
              <Tooltip key={color}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 rounded-full p-0",
                      selectedColor === color && "ring-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-background/80">
                  <p>Select color</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onSave}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-background/80">
              <p>Save changes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 