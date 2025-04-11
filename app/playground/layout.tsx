"use client";

import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({ children }: PlaygroundLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
} 