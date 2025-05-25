"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Highlighter,
  Pencil,
  Type,
  Image,
  Eraser,
  Download,
  Share2
} from "lucide-react";

const tools = [
  { icon: Search, label: "Search" },
  { icon: ZoomIn, label: "Zoom In" },
  { icon: ZoomOut, label: "Zoom Out" },
  { icon: RotateCw, label: "Rotate" },
  { icon: Highlighter, label: "Highlight" },
  { icon: Pencil, label: "Draw" },
  { icon: Type, label: "Add Text" },
  { icon: Image, label: "Add Image" },
  { icon: Eraser, label: "Erase" },
  { icon: Download, label: "Download" },
  { icon: Share2, label: "Share" },
];

export function Sidebar() {
  return (
    <Card className="w-64 p-4 h-screen border-r">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">PDF Tools</h2>
        <Separator />
        <div className="grid gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.label}
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <tool.icon className="h-4 w-4" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
} 