"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Mobile Docs List Component
const MobileDocsList = () => {
  const router = useRouter();

  const handleDocClick = (docId: string) => {
    router.push(`/docs/${docId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to use Docimate's powerful document processing tools
        </p>
      </div>

      <div className="space-y-8">
        {sidebarSections.map((section, idx) => (
          <motion.div 
            key={idx} 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: idx * 0.1,
              ease: "easeOut"
            }}
          >
            <h2 className="text-2xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="grid gap-4">
              {section.links.map((link) => (
                <motion.div
                  key={link.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => handleDocClick(link.id)}
                    className="w-full p-6 text-left border rounded-lg hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                          {link.label}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getDocDescription(link.id)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get doc descriptions
const getDocDescription = (docId: string) => {
  const descriptions: Record<string, string> = {
    'introduction': 'Learn about Docimate and its key features',
    'get-started': 'Step-by-step guide to get up and running',
    'document': 'How to process and analyze PDF documents',
    'spreadsheet': 'Working with Excel and CSV files',
    'templates': 'Creating and using custom processing templates'
  };
  return descriptions[docId] || 'Learn more about this feature';
};

// Sidebar link component
const SidebarLink = ({ 
  href, 
  children, 
  isActive = false,
  className = ""
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive?: boolean;
  className?: string;
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center py-2 px-3 text-sm rounded-lg transition-colors duration-200",
      isActive 
        ? "bg-primary/10 text-primary" 
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
      className
    )}
  >
    {children}
  </Link>
);

// Sub-link component for table of contents
const SubLink = ({ 
  href, 
  children, 
  isActive = false,
  onClick
}: { 
  href: string; 
  children: React.ReactNode; 
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = href.split('#')[1];
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center py-1.5 px-6 text-xs rounded-md transition-colors duration-200 ml-2 cursor-pointer",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:bg-primary/5 hover:text-white"
      )}
    >

      {children}
    </a>
  );
};

// Table of contents data for each page
const pageTableOfContents = {
  "introduction": [
    { id: "what-is-docimate", label: "What is Docimate?" },
    { id: "key-features", label: "Key Features" },
    { id: "how-it-works", label: "How It Works" },
  ],
  "get-started": [
    { id: "create-account", label: "Create Your Account" },
    { id: "upload-document", label: "Upload Your First Document" },
    { id: "explore-tools", label: "Explore Docimate Tools" },
    { id: "process-document", label: "Process Your Document" },
  ],
  "document": [
    { id: "overview", label: "Overview" },
    { id: "uploading-documents", label: "Uploading Documents" },
    { id: "navigation", label: "Document Navigation" },
    { id: "selection-tools", label: "Selection Tools" },
    { id: "ai-features", label: "AI Features" },
  ],
  "spreadsheet": [
    { id: "overview", label: "What Makes It Special" },
    { id: "getting-started", label: "Getting Started" },
    { id: "data-editing", label: "Editing Your Data" },
    { id: "ai-features", label: "AI-Powered Features" },
    { id: "charts", label: "Creating Charts" },
  ],
  "templates": [
    { id: "overview", label: "What Are Templates?" },
    { id: "getting-started", label: "Getting Started" },
    { id: "creating-templates", label: "Creating Your First Template" },
    { id: "using-templates", label: "Using Templates" },
    { id: "advanced-features", label: "Advanced Features" },
    { id: "sharing-templates", label: "Sharing & Managing" },
  ],
};

// Sidebar sections and links
const sidebarSections = [
  {
    title: "Overview",
    links: [
      { id: "introduction", label: "Introduction" },
      { id: "get-started", label: "Get Started" },
    ]
  },
  {
    title: "Tools & Features",
    links: [
      { id: "document", label: "Document" },
      { id: "spreadsheet", label: "Spreadsheet" },
      { id: "templates", label: "Templates" },
    ]
  }
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current page ID from pathname
  const currentPageId = pathname.split('/').pop() || '';
  const currentPageToc = pageTableOfContents[currentPageId as keyof typeof pageTableOfContents] || [];
  const isOnDocsList = pathname === '/docs' || pathname === '/docs/';
  const isOnSpecificDoc = currentPageId && currentPageId !== 'docs';

  // Auto-expand current page section
  const currentSection = sidebarSections.find(section => 
    section.links.some(link => link.id === currentPageId)
  );

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll detection for active section highlighting
  useEffect(() => {
    if (currentPageToc.length === 0) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const sections = currentPageToc.map(item => item.id);
        
        // Get scroll position from the main content area
        const mainContent = document.querySelector('.flex-1 [data-radix-scroll-area-viewport]') as HTMLElement;
        const scrollTop = mainContent ? mainContent.scrollTop : window.scrollY;
        const scrollPosition = scrollTop + 200; // Offset for header

        let currentActiveSection = sections[0];

        // Find the section that's currently in view
        for (let i = sections.length - 1; i >= 0; i--) {
          const element = document.getElementById(sections[i]);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            
            if (scrollPosition >= elementTop) {
              currentActiveSection = sections[i];
              break;
            }
          }
        }

        setActiveSection(currentActiveSection);
      }, 50);
    };

    // Set initial active section
    setActiveSection(currentPageToc[0].id);

    // Add scroll listeners
    const mainContent = document.querySelector('.flex-1 [data-radix-scroll-area-viewport]') as HTMLElement;
    
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    
    // Also listen to window scroll as backup
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentPageToc]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  return (
    <div className="relative pt-4">
      <Header />
      
      <div className="h-screen pt-20">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="h-full">
            {/* Show docs list on mobile when on /docs or no specific doc */}
            {isOnDocsList ? (
              <ScrollArea className="h-[calc(100vh-6rem)]">
                <MobileDocsList />
              </ScrollArea>
            ) : (
              /* Show individual doc with back button on mobile */
              <ScrollArea className="h-[calc(100vh-6rem)]">
                <div className="pb-16">
                  {/* Inline Back Button */}
                  <div className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/docs')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                  </div>
                  
                  {/* Mobile Content */}
                  {children}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          /* Desktop Layout */
          <div className="container mx-auto max-w-7xl h-[calc(100vh-6rem)] flex gap-6">
            {/* Desktop Sidebar */}
            <div className="w-64 border-r">
              <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
                {sidebarSections.map((section, idx) => (
                  <motion.div 
                    key={idx} 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: idx * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <motion.h3 
                      className="text-sm font-medium text-white mb-2 px-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: idx * 0.1 + 0.1,
                        ease: "easeOut"
                      }}
                    >
                      {section.title}
                    </motion.h3>
                    <div className="space-y-1">
                      {section.links.map((link, linkIdx) => {
                        const isActive = pathname === `/docs/${link.id}`;
                        const isExpanded = expandedSections.has(link.id) || (isActive && currentPageToc.length > 0);
                        
                        return (
                          <motion.div 
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: idx * 0.1 + linkIdx * 0.05 + 0.2,
                              ease: "easeOut"
                            }}
                          >
                            <motion.div 
                              className="flex items-center"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <SidebarLink
                                href={`/docs/${link.id}`}
                                isActive={isActive}
                                className="flex-1"
                              >
                                <motion.div
                                  className="flex items-center"
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-3 w-3 mr-2 text-current" />
                                  {link.label}
                                </motion.div>
                              </SidebarLink>
                            </motion.div>
                            
                            {/* Table of Contents Sub-links */}
                            <AnimatePresence mode="wait">
                              {isActive && currentPageToc.length > 0 && (
                                <motion.div 
                                  className="mt-1 space-y-1"
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: "auto", y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  transition={{ 
                                    duration: 0.4, 
                                    ease: "easeInOut"
                                  }}
                                >
                                  {currentPageToc.map((tocItem, tocIdx) => (
                                    <motion.div
                                      key={tocItem.id}
                                      initial={{ opacity: 0, x: -15, scale: 0.95 }}
                                      animate={{ opacity: 1, x: 0, scale: 1 }}
                                      transition={{ 
                                        duration: 0.3, 
                                        delay: tocIdx * 0.08,
                                        ease: "easeOut"
                                      }}
                                      whileHover={{ x: 6, scale: 1.02 }}
                                      className="overflow-hidden"
                                    >
                                      <SubLink
                                        href={`/docs/${link.id}#${tocItem.id}`}
                                        isActive={activeSection === tocItem.id}
                                      >
                                        {tocItem.label}
                                      </SubLink>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </div>

            {/* Desktop Main content */}
            <div className="flex-1">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                {children}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 