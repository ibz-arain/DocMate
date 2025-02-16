"use client";

import * as React from "react";
import { Receipt, FileText, Landmark, ChevronRight, ChevronLeft, ReceiptText, Building2, FileStack, Stethoscope, BatteryCharging } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const documentTypes = [
  {
    title: "T4 Tax Form",
    icon: <FileStack className="h-5 w-5" />,
    demoType: "t4"
  },
  {
    title: "Bank Statement",
    icon: <Building2 className="h-5 w-5" />,
    demoType: "bank"
  },
  {
    title: "Store Receipt",
    icon: <ReceiptText className="h-5 w-5" />,
    demoType: "receipt"
  },
  {
    title: "Dental Claim Form",
    icon: <Stethoscope className="h-5 w-5" />,
    demoType: "dental"
  },
  {
    title: "Electricity Bill",
    icon: <BatteryCharging className="h-5 w-5" />,
    demoType: "electricity"
  }
];

interface CustomSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onSelectDemo: (demoType: string) => void;
  selectedType?: string | null;
}

export function CustomSidebar({ isCollapsed, setIsCollapsed, onSelectDemo, selectedType }: CustomSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="p-6 h-screen flex-shrink-0">
        <motion.div
          initial={false}
          animate={{
            width: isCollapsed ? "64px" : "240px",
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          className="h-[calc(100vh-3rem)] sticky top-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-xl border shadow-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-3 border-b border-border/50">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-semibold text-lg text-primary"
                >
                  DocMate
                </motion.div>
              )}
            </AnimatePresence>
            <div className={cn(
              "flex items-center gap-2",
              isCollapsed ? "w-full justify-center" : "justify-end"
            )}>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ThemeToggle />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <AnimatePresence mode="wait">
                  {isCollapsed ? (
                    <motion.div
                      key="right"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="left"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-3">
            <nav className="space-y-2">
              {documentTypes.map((item) => {
                const isSelected = selectedType === item.demoType;
                const button = (
                  <Button
                    key={item.title}
                    variant="ghost"
                    onClick={() => onSelectDemo(item.demoType)}
                    className={cn(
                      "w-full h-10 transition-all rounded-lg relative",
                      isCollapsed ? "justify-center px-2" : "justify-start",
                      "hover:bg-primary/10 hover:text-primary",
                      "active:bg-primary/20",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="absolute left-3">
                      {item.icon}
                    </div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="font-medium pl-9"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-card border shadow-md"
                    >
                      <p className="font-medium text-primary">{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : button;
              })}
            </nav>
          </div>

          {/* Collapsed Theme Toggle */}
          <AnimatePresence mode="wait">
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="p-3 border-t border-border/50"
              >
                <ThemeToggle />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </TooltipProvider>
  );
} 