"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ArrowLeft, Monitor } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export function MobileNotSupported() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md mx-auto border-white/10 bg-background/60 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Platform Not Optimized</CardTitle>
            <CardDescription className="text-base">
              The platform is not optimized for small screens and mobile devices. 
              A mobile app is coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span>Please use a desktop or tablet for the best experience</span>
            </div>
            
            {/* App Icon */}
            <div className="flex justify-center py-4">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden" 
                   style={{
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
                   }}>
                {/* Inner shadow for 3D effect */}
                <div className="absolute inset-0 rounded-2xl" 
                     style={{
                       background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)'
                     }}></div>
                <Image src="/logo-bird.png" alt="Docimate" width={70} height={70} className="relative z-10 ml-1" />
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
