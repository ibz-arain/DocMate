"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

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
  <a
    href={href}
    className={cn(
      "flex items-center py-2 px-3 text-sm rounded-lg transition-colors duration-200",
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
    )}
  >
    {children}
  </a>
);

// Section component
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {children}
    </div>
  </div>
);

export default function DocsPage() {
  const [activePage, setActivePage] = useState("getting-started");

  // Sidebar sections and links (example structure)
  const sidebarSections = [
    {
      title: "Getting Started",
      links: [
        { id: "getting-started", label: "Introduction" },
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
                        href={`#${link.id}`}
                        isActive={activePage === link.id}
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
              <div>
                <Section title="Introduction">
                  <p className="text-muted-foreground">
                    Welcome to the DocMate documentation. This guide will help you get started
                    with our platform and explore its features.
                  </p>
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <h3 className="text-lg font-medium mb-2">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">
                      Get up and running with DocMate in minutes. Follow our step-by-step
                      guide to integrate DocMate into your workflow.
                    </p>
                  </div>
                </Section>

                <Section title="Features">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                        <span className="text-primary text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Automated Documentation</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Let AI handle your documentation needs while you focus on coding.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                        <span className="text-primary text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Smart Search</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Find exactly what you need with our intelligent search functionality.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                        <span className="text-primary text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Version Control</h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          Keep track of documentation changes with built-in versioning.
                        </p>
                      </div>
                    </li>
                  </ul>
                </Section>

                <Section title="Getting Started">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      To get started with DocMate, you'll need to:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Sign up for an account</li>
                      <li>Install the DocMate CLI</li>
                      <li>Initialize your first project</li>
                      <li>Start generating documentation</li>
                    </ol>
                  </div>
                </Section>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 