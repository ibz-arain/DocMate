"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DocsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only redirect on desktop, mobile shows the docs list
    if (!isMobile) {
      router.replace("/docs/introduction");
    }
  }, [router, isMobile]);

  // Return null while redirecting on desktop, mobile will show the docs list
  return null;
} 