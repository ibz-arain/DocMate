"use client";

import * as React from "react";
import { Receipt, FileText, Landmark, ChevronRight, ChevronLeft, ReceiptText, Building2, FileStack, Stethoscope, BatteryCharging, LogOut, User, Settings, Sun, Moon, History, Menu } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { SettingsDialog } from "@/components/settings-dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
const documentTypes = [
  {
    title: "T4 Tax Form",
    icon: <FileStack className="h-5 w-5" />,
    demoType: "t4"
  },
  {
    title: "Bank Statement",
    icon: <Building2 className="h-5 w-5" />,
    demoType: "bank"
  },
  {
    title: "Store Receipt",
    icon: <ReceiptText className="h-5 w-5" />,
    demoType: "receipt"
  },
  {
    title: "Dental Claim Form",
    icon: <Stethoscope className="h-5 w-5" />,
    demoType: "dental"
  },
  {
    title: "Electricity Bill",
    icon: <BatteryCharging className="h-5 w-5" />,
    demoType: "electricity"
  }
];

interface CustomSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  onSelectDemo: (demoType: string) => void;
  selectedType?: string | null;
}

export function CustomSidebar({
  isCollapsed,
  setIsCollapsed,
  onSelectDemo,
  selectedType,
}: CustomSidebarProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [showSettings, setShowSettings] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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

  // Mobile menu content component
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b">
        <div className="font-semibold text-lg text-primary">
          <Image 
            src="/logo-text.png" 
            alt="Logo" 
            width={100} 
            height={80} 
            priority
            className="select-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-1">
            {documentTypes.map((item) => {
              const isSelected = selectedType === item.demoType;
              return (
                <Button
                  key={item.title}
                  variant="ghost"
                  onClick={() => {
                    onSelectDemo(item.demoType);
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    "w-full justify-start",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Button>
              );
            })}
            
            {/* History Section - Only visible for signed-in users */}
            {user && (
              <>
                <div className="h-px bg-border my-2" />
                <Button
                  variant="ghost"
                  onClick={() => {
                    onSelectDemo('history');
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    "w-full justify-start",
                    selectedType === 'history' && "bg-accent text-accent-foreground"
                  )}
                >
                  <History className="h-5 w-5" />
                  <span className="ml-2">History</span>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {user ? (
          <>
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Signed in as {user.username}
            </div>
            <div className="space-y-1 mt-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <div className="relative h-5 w-5">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                <span className="ml-2">Toggle theme</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowSettings(true);
                  setIsMobileOpen(false);
                }}
              >
                <Settings className="h-5 w-5" />
                <span className="ml-2">Settings</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Sign Out</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <div className="relative h-5 w-5">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <span className="ml-2">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleAccountClick}
            >
              <User className="h-5 w-5" />
              <span className="ml-2">Account</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Menu Button - Only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-3 left-3 z-[100] md:hidden",
          "h-10 w-10",
          "bg-background/80 backdrop-blur-sm",
          "border shadow-sm",
          "hover:bg-accent",
          "transition-all duration-200",
          isMobileOpen && "hidden"
        )}
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent 
          side="left"
          className={cn(
            "p-0 border bg-background/80 backdrop-blur-lg",
            "w-[85%] max-w-[300px]",
            "h-full",
            "transition-opacity duration-200",
            "data-[state=open]:opacity-100",
            "data-[state=closed]:opacity-0"
          )}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-14 flex items-center px-4 border-b">
              <div className="font-semibold text-lg text-primary">
                <Image 
                  src="/logo-text.png" 
                  alt="Logo" 
                  width={100} 
                  height={80} 
                  priority
                  className="select-none"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <nav className="space-y-1">
                  {documentTypes.map((item) => {
                    const isSelected = selectedType === item.demoType;
                    return (
                      <Button
                        key={item.title}
                        variant="ghost"
                        onClick={() => {
                          onSelectDemo(item.demoType);
                          setIsMobileOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </Button>
                    );
                  })}
                  
                  {/* History Section - Only visible for signed-in users */}
                  {user && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onSelectDemo('history');
                          setIsMobileOpen(false);
                        }}
                        className={cn(
                          "w-full justify-start",
                          selectedType === 'history' && "bg-accent text-accent-foreground"
                        )}
                      >
                        <History className="h-5 w-5" />
                        <span className="ml-2">History</span>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Signed in as {user.username}
                  </div>
                  <div className="space-y-1 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                      <div className="relative h-5 w-5">
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      </div>
                      <span className="ml-2">Toggle theme</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowSettings(true);
                        setIsMobileOpen(false);
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="ml-2">Settings</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="ml-2">Sign Out</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    <div className="relative h-5 w-5">
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute left-0 top-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="ml-2">Toggle theme</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleAccountClick}
                  >
                    <User className="h-5 w-5" />
                    <span className="ml-2">Account</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block p-6 h-screen flex-shrink-0">
        <motion.div
          initial={false}
          animate={{
            width: isCollapsed ? "64px" : "240px",
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          className="h-[calc(100vh-3rem)] sticky top-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-xl border shadow-lg overflow-hidden flex flex-col"
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
              {documentTypes.map((item) => {
                const isSelected = selectedType === item.demoType;
                const button = (
                  <Button
                    key={item.title}
                    variant="ghost"
                    onClick={() => onSelectDemo(item.demoType)}
                    className={cn(
                      "w-full h-10 transition-all rounded-lg relative",
                      isCollapsed ? "justify-center px-2" : "justify-start",
                      "hover:bg-primary/10 hover:text-primary",
                      "active:bg-primary/20",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
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
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
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
                          onClick={() => onSelectDemo('history')}
                          className={cn(
                            "w-full h-10 transition-all rounded-lg relative justify-center px-2",
                            selectedType === 'history' && "bg-primary/10 text-primary"
                          )}
                        >
                          <div className="absolute left-3">
                            <History className="h-5 w-5" />
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">History</TooltipContent>
                    </Tooltip>
                  ) :
                    <Button
                      variant="ghost"
                      onClick={() => onSelectDemo('history')}
                      className={cn(
                        "w-full h-10 transition-all rounded-lg relative justify-start",
                        selectedType === 'history' && "bg-primary/10 text-primary"
                      )}
                    >
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
                    </Button>
                  }
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="px-3 py-2 text-sm text-muted-foreground"
                    >
                      Signed in as {user.username}
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