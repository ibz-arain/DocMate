"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function DocsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the introduction route by default
    router.replace("/docs/introduction");
  }, [router]);

  // Return null while redirecting
  return null;
} 