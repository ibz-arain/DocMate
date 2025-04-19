"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Sidebar link component
const SidebarLink = ({ 
  href, 
  children, 
  isActive = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center py-2 px-3 text-sm rounded-lg transition-colors duration-200",
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
    )}
  >
    {children}
  </Link>
);

// Sidebar sections and links
const sidebarSections = [
  {
    title: "Getting Started",
    links: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick Start" },
      { id: "installation", label: "Installation" },
    ]
  },
  {
    title: "Core Concepts",
    links: [
      { id: "architecture", label: "Architecture" },
      { id: "authentication", label: "Authentication" },
      { id: "deployment", label: "Deployment" },
    ]
  },
  {
    title: "Advanced",
    links: [
      { id: "customization", label: "Customization" },
      { id: "plugins", label: "Plugins" },
      { id: "api-reference", label: "API Reference" },
    ]
  }
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative pt-4">
      <Header />
      <div className="h-screen pt-24">
        <div className="container mx-auto max-w-7xl h-[calc(100vh-6rem)] flex gap-6">
          {/* Sidebar */}
          <div className="w-64 border-r">
            <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
              {sidebarSections.map((section, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.links.map((link) => (
                      <SidebarLink
                        key={link.id}
                        href={`/docs/${link.id}`}
                        isActive={pathname === `/docs/${link.id}`}
                      >
                        <ChevronRight className="h-3 w-3 mr-2 text-current" />
                        {link.label}
                      </SidebarLink>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {children}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 