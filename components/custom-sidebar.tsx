"use client";

import * as React from "react";
import { Layout, ChevronRight, ChevronLeft, LogOut, User, Settings, Sun, Moon, History, Code, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthContext } from "./auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { useSidebar } from "./sidebar-provider";
import Image from "next/image";
import Link from "next/link";

interface CustomSidebarProps {
  selectedType?: string | null;
}

// TypeWriter component for animated text
const TypeWriter = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    // Reset on unmount
    return () => {
      setCurrentText("");
      setCurrentIndex(0);
      setIsDeleting(false);
    };
  }, []);

  React.useEffect(() => {
    if (!isDeleting && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text, isDeleting]);

  return <span>{currentText}</span>;
};

export function CustomSidebar({
  selectedType,
}: CustomSidebarProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [showSettings, setShowSettings] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleAccountClick = () => {
    router.push('/account');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Navigation items with routes
  const mainNavItems = [
    {
      id: 'document',
      name: 'Process Document',
      icon: <FileText className="h-5 w-5" />,
      href: '/playground/process'
    },
    {
      id: 'template',
      name: 'Template Editor',
      icon: <Layout className="h-5 w-5" />,
      href: '/playground/templates'
    },
    {
      id: 'api',
      name: 'API Integration',
      icon: <Code className="h-5 w-5" />,
      href: '/playground/api'
    }
  ];

  return (
    <TooltipProvider delayDuration={0}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block pl-6 h-screen flex-shrink-0">
        <motion.div
          initial={false}
          animate={{
            width: isCollapsed ? "64px" : "240px",
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          className="h-[calc(100vh-3rem)] sticky top-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-xl border shadow overflow-hidden flex flex-col"
        >
          {/* Desktop Header */}
          <div className="h-16 flex items-center justify-between px-3 border-b border-border/50">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-semibold text-lg text-primary"
                >
                  <Image 
                    src="/logo-text.png" 
                    alt="Logo" 
                    width={120} 
                    height={100} 
                    priority
                    className="select-none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className={cn(
              "flex items-center gap-2",
              isCollapsed ? "w-full justify-center" : "justify-end"
            )}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-9 w-9"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isCollapsed ? (
                    <motion.div
                      key="expand"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collapse"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 p-3">
            <nav className="space-y-2">
              {/* Main Navigation Items */}
              {mainNavItems.map((item) => {
                const isSelected = pathname === item.href;
                const button = (
                  <Button
                    key={item.id}
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full h-10 transition-all rounded-lg relative",
                      isCollapsed ? "justify-center px-2" : "justify-start",
                      "hover:bg-primary/10 hover:text-primary",
                      "active:bg-primary/20",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
                    <Link href={item.href}>
                      <div className="absolute left-3">
                        {item.icon}
                      </div>
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="font-medium pl-9"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </Button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  button
                );
              })}
              
              {/* History Section - Only visible for signed-in users */}
              {user && (
                <>
                  <div className="h-px bg-border/50 my-4" />
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full h-10 transition-all rounded-lg relative justify-center px-2",
                            pathname === '/playground/history' && "bg-primary/10 text-primary"
                          )}
                        >
                          <Link href="/playground/history">
                            <div className="absolute left-3">
                              <History className="h-5 w-5" />
                            </div>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">History</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full h-10 transition-all rounded-lg relative justify-start",
                        pathname === '/playground/history' && "bg-primary/10 text-primary"
                      )}
                    >
                      <Link href="/playground/history">
                        <div className="absolute left-3">
                          <History className="h-5 w-5" />
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="font-medium pl-9"
                          >
                            History
                          </motion.span>
                        </AnimatePresence>
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Desktop Footer */}
          <div className="p-3 border-t border-border/50 space-y-2">
            {user ? (
              <>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ 
                        width: "auto", 
                        opacity: 1,
                        transition: {
                          width: { duration: 0.2, ease: "easeOut" },
                          opacity: { duration: 0.3, ease: "easeInOut" }
                        }
                      }}
                      exit={{ 
                        width: 0, 
                        opacity: 0,
                        transition: {
                          width: { duration: 0.2, ease: "easeIn" },
                          opacity: { duration: 0.15, ease: "easeInOut" }
                        }
                      }}
                      className="px-3 py-2 text-sm text-muted-foreground overflow-hidden whitespace-nowrap"
                    >
                      <TypeWriter text={`Signed in as ${user.username}`} delay={50} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Theme Toggle */}
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 transition-all rounded-lg relative justify-center px-2"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      >
                        <div className="absolute left-3">
                          <div className="relative h-5 w-5">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Toggle theme</TooltipContent>
                  </Tooltip>
                ) :
                  <Button
                    variant="ghost"
                    className="w-full h-10 transition-all rounded-lg relative justify-start"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    <div className="absolute left-3">
                      <div className="relative h-5 w-5">
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium pl-9"
                      >
                        Toggle theme
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                }
                {/* Settings Button */}
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 transition-all rounded-lg relative justify-center px-2"
                        onClick={() => setShowSettings(true)}
                      >
                        <div className="absolute left-3">
                          <Settings className="h-5 w-5" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full h-10 transition-all rounded-lg relative justify-start"
                    onClick={() => setShowSettings(true)}
                  >
                    <div className="absolute left-3">
                      <Settings className="h-5 w-5" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium pl-9"
                      >
                        Settings
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                )}
                {/* Sign Out Button */}
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 transition-all rounded-lg relative justify-center px-2"
                        onClick={handleLogout}
                      >
                        <div className="absolute left-3">
                          <LogOut className="h-5 w-5" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Sign Out</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full h-10 transition-all rounded-lg relative justify-start"
                    onClick={handleLogout}
                  >
                    <div className="absolute left-3">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium pl-9"
                      >
                        Sign Out
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                )}
              </>
            ) :
              <>
                {/* Theme Toggle (Not Signed In) */}
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 transition-all rounded-lg relative justify-center px-2"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      >
                        <div className="absolute left-3">
                          <div className="relative h-5 w-5">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Toggle theme</TooltipContent>
                  </Tooltip>
                ) :
                  <Button
                    variant="ghost"
                    className="w-full h-10 transition-all rounded-lg relative justify-start"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    <div className="absolute left-3">
                      <div className="relative h-5 w-5">
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium pl-9"
                      >
                        Toggle theme
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                }
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full h-10 transition-all rounded-lg relative justify-center px-2"
                        onClick={handleAccountClick}
                      >
                        <div className="absolute left-3">
                          <User className="h-5 w-5" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Account</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full h-10 transition-all rounded-lg relative justify-start"
                    onClick={handleAccountClick}
                  >
                    <div className="absolute left-3">
                      <User className="h-5 w-5" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium pl-9"
                      >
                        Account
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                )}
              </>
            }
          </div>
        </motion.div>
      </div>
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </TooltipProvider>
  );
} 