"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, X } from "lucide-react";

interface ComingSoonPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonPopup({ isOpen, onClose }: ComingSoonPopupProps) {
  const handleEmailClick = () => {
    window.open('mailto:docimate@ibrahimarain.com?subject=Plan Upgrade Request', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-sm border p-0 [&>button]:hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-orange-500/20 to-transparent blur-2xl opacity-60 rounded-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-blue-500/20 to-transparent blur-2xl opacity-40 rounded-full" />
        </div>

        {/* Header */}
        <DialogHeader className="relative p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Coming Soon!
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Self-serve payments are in development
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-foreground leading-relaxed">
                Our developers are working hard to get self-serve payments set up. 
                For now, please send an email to <a onClick={handleEmailClick} className="text-primary hover:text-primary/80 hover:cursor-pointer">docimate@ibrahimarain.com</a> to get upgraded to a paid plan.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleEmailClick}
                className="w-full flex items-center gap-2 border border-primary/30 bg-primary/20 hover:bg-primary/30"
              >
                <Mail className="h-4 w-4" />
                Send Email to Upgrade
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Continue with Free Plan
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                We'll get back to you within 24 hours!
              </p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
