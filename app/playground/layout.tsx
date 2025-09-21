"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNotSupported } from "@/components/mobile-not-supported";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({ children }: PlaygroundLayoutProps) {
  const isMobile = useIsMobile();

  // Show mobile not supported message on small screens
  if (isMobile) {
    return <MobileNotSupported />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
} 