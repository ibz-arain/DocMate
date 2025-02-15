"use client";

import * as React from "react";
import { Receipt, FileText, Landmark, ChevronRight, ChevronLeft, ReceiptText, Building2, FileStack, Stethoscope, BatteryCharging } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const documentTypes = [
  {
    title: "T4 Tax Form",
    icon: <FileStack className="h-5 w-5" />,
    description: "Process T4 tax slips",
    demoType: "t4"
  },
  {
    title: "Bank Statement",
    icon: <Building2 className="h-5 w-5" />,
    description: "Analyze bank statements",
    demoType: "bank"
  },
  {
    title: "Store Receipt",
    icon: <ReceiptText className="h-5 w-5" />,
    description: "Process store receipts",
    demoType: "receipt"
  },
  {
    title: "Dental Claim Form",
    icon: <Stethoscope className="h-5 w-5" />,
    description: "Process dental insurance claims",
    demoType: "dental"
  },
  {
    title: "Electricity Bill",
    icon: <BatteryCharging className="h-5 w-5" />,
    description: "Analyze electricity bills",
    demoType: "electricity"
  }
];

interface CustomSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onSelectDemo: (demoType: string) => void;
}

export function CustomSidebar({ isCollapsed, setIsCollapsed, onSelectDemo }: CustomSidebarProps) {
  return (
    <div className="p-6 h-screen flex-shrink-0">
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? "64px" : "240px",
        }}
        className="h-[calc(100vh-3rem)] sticky top-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-xl border shadow-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-border/50">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg text-primary"
            >
              DocMate
            </motion.div>
          )}
          <div className="flex items-center gap-2">
            {!isCollapsed && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-3">
          <nav className="space-y-2">
            {documentTypes.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                onClick={() => onSelectDemo(item.demoType)}
                className={cn(
                  "w-full transition-all rounded-lg",
                  isCollapsed ? "justify-center px-2" : "justify-start",
                  "hover:bg-primary/10 hover:text-primary",
                  "active:bg-primary/20"
                )}
              >
                <div className={cn(
                  "flex items-center gap-3",
                  isCollapsed && "justify-center"
                )}>
                  {item.icon}
                  {!isCollapsed && (
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </nav>
        </div>

        {/* Collapsed Theme Toggle */}
        {isCollapsed && (
          <div className="p-3 border-t border-border/50">
            <ThemeToggle />
          </div>
        )}
      </motion.div>
    </div>
  );
} 