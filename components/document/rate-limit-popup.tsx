"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Zap, Crown } from 'lucide-react';
import { ComingSoonPopup } from '@/components/ui/coming-soon-popup';

interface RateLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function RateLimitPopup({ isOpen, onClose, onUpgrade }: RateLimitPopupProps) {
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);

  const handleUpgradeClick = () => {
    setShowComingSoonPopup(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Rate Limit Exceeded
            </DialogTitle>
          </DialogHeader>
          
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-destructive/10 p-3">
                    <Zap className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                
                <CardDescription className="text-base">
                  You've reached your monthly API call limit. Contact us to upgrade your plan and continue with unlimited access.
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={handleUpgradeClick}
                    className="flex-1 bg-primary/80 hover:bg-primary/90"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Contact for Upgrade
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Popup */}
      <ComingSoonPopup
        isOpen={showComingSoonPopup}
        onClose={() => setShowComingSoonPopup(false)}
      />
    </>
  );
}
