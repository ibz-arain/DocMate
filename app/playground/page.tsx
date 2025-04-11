"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlaygroundPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the process route by default
    router.replace("/playground/process");
  }, [router]);

  // Return null while redirecting
  return null;
} 