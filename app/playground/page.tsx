"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the document route by default
    router.replace("/playground/document");
  }, [router]);

  // Return null while redirecting
  return null;
} 