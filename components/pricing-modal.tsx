"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Star, ArrowRight, Sparkles, Crown, Rocket, Users, Shield, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LucideIcon } from "lucide-react";
import { ComingSoonPopup } from "@/components/ui/coming-soon-popup";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  cta: string;
  highlight: boolean;
  gradient: string;
  borderColor: string;
  iconColor: string;
  bgColor: string;
}

type PricingModalVariant = "default" | "signup" | "upgrade";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
  currentPlan?: string;
  currentPlanLimits?: number | null;
  title?: string;
  description?: string;
  variant?: PricingModalVariant;
}

// Subtle floating particles for theme compatibility
const FloatingParticles = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const opacity = Math.random() * 0.1 + 0.05;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              width: size,
              height: size,
              opacity,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -40 - 20],
              opacity: [0, opacity, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Forever",
    price: "$0",
    period: "/month",
    description: "Try it for free. No credit card required.",
    icon: Star,
    features: [
      "50 API calls per month",
      "Unlimited document and spreadsheet access",
      "Document history",
      "Email support"
    ],
    cta: "Get Started",
    highlight: false,
    gradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/20",
    iconColor: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "hobby",
    name: "Hobby",
    price: "$19",
    period: "/month",
    description: "Basic document processing with usage tracking.",
    icon: Rocket,
    features: [
      "500 API calls per month",
      "Everything in Free Forever",
      "Email support"
    ],
    cta: "Get Started",
    highlight: false,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Professional processing with advanced analytics.",
    icon: Crown,
    features: [
      "1,000 API calls per month",
      "Everything in Hobby",
      "Usage tracking and analytics",
      "Email support"
    ],
    cta: "Go Pro",
    highlight: true,
    gradient: "from-primary/20 to-purple-500/20",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "business",
    name: "Business",
    price: "$99",
    period: "/month",
    description: "High-volume processing for businesses.",
    icon: Shield,
    features: [
      "5,000 API calls per month",
      "Everything in Pro",
      "24/7 phone support",
      "Email support"
    ],
    cta: "Contact Sales",
    highlight: false,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$179",
    period: "/month",
    description: "Maximum processing with API access.",
    icon: Users,
    features: [
      "10,000 API calls per month",
      "Everything in Business",
      "Access to our API (for developers)",
      "24/7 phone support",
      "Email support"
    ],
    cta: "Contact Sales",
    highlight: false,
    gradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "custom",
    name: "Contact Us",
    price: "",
    period: "",
    description: "Custom integrations and unlimited processing.",
    icon: Zap,
    features: [
      "Unlimited API calls",
      "Pay as you go pricing",
      "Everything in Enterprise",
      "We can integrate into your apps",
      "24/7 phone support",
      "Email support"
    ],
    cta: "Contact Sales",
    highlight: false,
    gradient: "from-indigo-500/20 to-purple-500/20",
    borderColor: "border-indigo-500/20",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];

export default function PricingModal({ 
  isOpen, 
  onClose, 
  onSelectPlan, 
  currentPlan,
  currentPlanLimits,
  title = "Choose Your Plan",
  description = "Upgrade or downgrade anytime. More features coming soon.",
  variant = "default"
}: PricingModalProps) {
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  
  // Check if user has no plan at all
  const hasNoPlan = !currentPlan && currentPlanLimits === null;
  
  // Configure based on variant and plan status
  const getVariantConfig = () => {
    if (hasNoPlan) {
      return {
        title: "Welcome! Choose Your Plan",
        description: "Get started with DocuMate and unlock powerful document processing.",
        showDecisionHelp: true,
        freePlanCTA: "Continue with Free",
        canClose: false
      };
    }
    
    switch (variant) {
      case "signup":
        return {
          title: "Welcome! Choose Your Plan",
          description: "Get started with DocuMate and unlock powerful document processing.",
          showDecisionHelp: true,
          freePlanCTA: "Continue with Free",
          canClose: false
        };
      case "upgrade":
        return {
          title: "Upgrade Your Plan",
          description: "Unlock more features and higher limits.",
          showDecisionHelp: false,
          freePlanCTA: "Get Started",
          canClose: true
        };
      default:
        return {
          title: title,
          description: description,
          showDecisionHelp: false,
          freePlanCTA: "Get Started",
          canClose: true
        };
    }
  };

  const config = getVariantConfig();

  // Check if a plan is the current plan
  const isCurrentPlan = (planId: string) => {
    // If user has no plan, nothing is current
    if (hasNoPlan) {
      return false;
    }
    return planId === currentPlan;
  };

  // Handle plan selection
  const handlePlanSelect = (plan: Plan) => {
    // Don't allow selection of current plan
    if (isCurrentPlan(plan.id)) {
      return;
    }
    
    // Only allow free plan to be selected, show popup for others
    if (plan.id === "free") {
      onSelectPlan(plan);
    } else {
      setShowComingSoonPopup(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={config.canClose ? onClose : undefined}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-sm border p-0 [&>button]:hidden flex flex-col">
        {/* Themed background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Theme-compatible gradients */}
          <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-gradient-radial from-primary/10 to-transparent blur-2xl opacity-60 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[35vw] h-[35vh] bg-gradient-radial from-purple-500/10 to-transparent blur-2xl opacity-40 rounded-full" />
          
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02] dark:opacity-[0.05]" />
          
          {/* Floating particles */}
          <FloatingParticles />
        </div>

        {/* Header */}
        <DialogHeader className="relative p-4 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium backdrop-blur-sm border border-primary/20 mb-3"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span>Easy & Transparent</span>
              </motion.div>

              <DialogTitle className="text-2xl font-bold mb-2 text-foreground">
                {config.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
              
              {config.showDecisionHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm"
                >
                  <p className="text-xs text-primary/90">
                    💡 <strong>Can't decide?</strong> Just try our free plan and upgrade anytime when you need more features!
                  </p>
                </motion.div>
              )}
            </div>
            
            {config.canClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable pricing content */}
        <div className="flex-1 h-full overflow-y-auto">
          <div className="p-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan, idx) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan.id);
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  whileHover={!isCurrent ? { scale: 1.02 } : undefined}
                  className={cn(
                    "relative group",
                    isCurrent && "cursor-default"
                  )}
                >
                  {/* Card background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity",
                    plan.gradient,
                    isCurrent && "opacity-10"
                  )} />
                  
                  <Card className={cn(
                    "relative h-full flex flex-col border bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 overflow-hidden",
                    plan.borderColor,
                    plan.highlight && "border-primary/50 shadow-lg ring-1 ring-primary/20 scale-[1.02]",
                    isCurrent 
                      ? "cursor-default opacity-60 border-muted-foreground/20" 
                      : "cursor-pointer hover:shadow-md",
                    isCurrent && plan.highlight && "scale-100 opacity-60"
                  )}
                  onClick={() => handlePlanSelect(plan)}
                  >
                    {/* Current plan indicator */}
                    {isCurrent && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
                          <Check className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary font-medium">CURRENT</span>
                        </div>
                      </div>
                    )}

                    {/* Subtle animated background elements */}
                    <div className="absolute inset-0 opacity-5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute bg-foreground/20 rounded-full"
                          style={{
                            width: `${1 + Math.random() * 2}px`,
                            height: `${1 + Math.random() * 2}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            opacity: [0.05, 0.15, 0.05],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            delay: Math.random(),
                          }}
                        />
                      ))}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center", plan.bgColor, plan.borderColor)}>
                          <Icon className={cn("h-5 w-5", plan.iconColor)} />
                        </div>
                        {plan.highlight && !isCurrent && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
                            <Crown className="h-3 w-3 text-primary" />
                            <span className="text-xs text-primary font-medium">POPULAR</span>
                          </div>
                        )}
                      </div>
                      
                      <CardTitle className="text-lg mb-1">{plan.name}</CardTitle>
                      <CardDescription className="text-xs mb-3 line-clamp-2">{plan.description}</CardDescription>
                      
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-0">
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIdx) => (
                          <motion.li
                            key={feature}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + featureIdx * 0.05 }}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <CheckCircle2 className="text-primary w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="text-xs leading-tight">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-3">
                      <Button
                        size="sm"
                        disabled={isCurrent}
                        className={cn(
                          "w-full justify-center group relative overflow-hidden text-xs h-8",
                          isCurrent ? "opacity-50 cursor-not-allowed" : null,
                          plan.highlight && !isCurrent ? "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50" : null,
                          !plan.highlight && !isCurrent && plan.iconColor === "text-green-500" ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50" : null,
                          !plan.highlight && !isCurrent && plan.iconColor === "text-blue-500" ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/50" : null,
                          !plan.highlight && !isCurrent && plan.iconColor === "text-purple-500" ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/50" : null,
                          !plan.highlight && !isCurrent && plan.iconColor === "text-orange-500" ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/50" : null,
                          !plan.highlight && !isCurrent && plan.iconColor === "text-indigo-500" ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-500/50" : null
                        )}
                        variant="outline"
                      >
                        <span className="relative z-10 flex items-center">
                          {isCurrent 
                            ? "Current Plan" 
                            : plan.id === "free" && (variant === "signup" || hasNoPlan)
                              ? config.freePlanCTA 
                              : plan.cta
                          }
                          {plan.highlight && !isCurrent && <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-0.5" />}
                        </span>
                        {!isCurrent && (
                          <div className={cn(
                            "absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500",
                            plan.highlight && "bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0",
                            !plan.highlight && plan.iconColor === "text-green-500" && "bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0",
                            !plan.highlight && plan.iconColor === "text-blue-500" && "bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0",
                            !plan.highlight && plan.iconColor === "text-purple-500" && "bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0",
                            !plan.highlight && plan.iconColor === "text-orange-500" && "bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0",
                            !plan.highlight && plan.iconColor === "text-indigo-500" && "bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0"
                          )} />
                        )}
                      </Button>
                    </CardFooter>

                    {/* Corner accent */}
                    <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-full blur-md opacity-20", plan.bgColor)} />
                  </Card>
                </motion.div>
                              );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Coming Soon Popup */}
      <ComingSoonPopup
        isOpen={showComingSoonPopup}
        onClose={() => setShowComingSoonPopup(false)}
      />
    </Dialog>
  );
} 