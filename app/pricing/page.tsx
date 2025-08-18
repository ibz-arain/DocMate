"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Star, ArrowRight, Sparkles, Crown, Rocket, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LucideIcon } from "lucide-react";
import { ComingSoonPopup } from "@/components/ui/coming-soon-popup";

// Floating element component
const FloatingElement = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        y: [0, -15, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: {
          delay,
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
        rotate: {
          delay,
          duration: 9,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Particle background component
const ParticleBackground = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 4 + 1;
        const opacity = Math.random() * 0.3 + 0.1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: `rgba(var(--primary-rgb), ${opacity})`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: i % 8 === 0 ? 'blur(1px)' : 'none',
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0, opacity, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

interface Plan {
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

const plans: Plan[] = [
  {
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

export default function PricingPage() {
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handlePlanClick = (plan: Plan) => {
    if (plan.name === "Free Forever") {
      // Redirect to app for free plan
      window.location.href = "/playground/document";
    } else {
      // Show coming soon popup for all paid plans
      setShowComingSoonPopup(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 z-50"
        style={{ scaleX }}
      />

      {/* Background gradients and overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary gradient */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-gradient-radial from-primary/20 to-transparent blur-3xl opacity-20 rounded-full -translate-x-1/4 -translate-y-1/4" />
        
        {/* Secondary gradients */}
        <div className="absolute bottom-0 left-0 w-[70vw] h-[70vh] bg-gradient-radial from-purple-500/20 to-transparent blur-3xl opacity-20 rounded-full translate-x-1/4 translate-y-1/4" />
        
        {/* Tertiary gradients */}
        <div className="absolute top-1/2 left-1/2 w-[90vw] h-[90vh] bg-gradient-radial from-blue-500/10 to-transparent blur-3xl opacity-15 rounded-full -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
        
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-60" />
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <FloatingElement 
          className="absolute top-[15%] right-[15%] w-24 h-24 opacity-20"
          delay={0.5}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-purple-500 blur-xl animate-spin-slow" />
        </FloatingElement>
        
        <FloatingElement 
          className="absolute bottom-[25%] left-[10%] w-32 h-32 opacity-20"
          delay={1}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
        </FloatingElement>
        
        <FloatingElement 
          className="absolute top-[40%] left-[20%] w-16 h-16 opacity-30"
          delay={1.5}
        >
          <div className="w-full h-full rounded-full bg-primary blur-xl animate-pulse-slow" />
        </FloatingElement>

        {/* Floating dots */}
        <motion.div 
          className="absolute top-[20%] right-[25%] opacity-30"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
        </motion.div>

        <motion.div 
          className="absolute bottom-[30%] right-[35%] opacity-20"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 5,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
        </motion.div>

        <motion.div 
          className="absolute top-[50%] left-[40%] opacity-20"
          animate={{ 
            y: [0, -12, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
        </motion.div>

        {/* Light beam effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-10 rotate-45"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Particle background */}
        <ParticleBackground />
      </div>

      <Header />
      
      <ScrollArea className="h-screen">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-16"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm border border-primary/20 mb-6"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Easy & Transparent</span>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="text-white">Pricing</span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                    Made Simple
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Upgrade or downgrade anytime. More features coming soon.
                </motion.p>
              </motion.div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, idx) => {
                  const Icon = plan.icon;
                  return (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.5 + idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative group"
                    >
                      {/* Card background gradient */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity",
                        plan.gradient
                      )} />
                      
                      <Card className={cn(
                        "relative h-full flex flex-col justify-between border bg-black/30 backdrop-blur-md shadow-xl transition-all duration-300 overflow-hidden",
                        plan.borderColor,
                        plan.highlight && "border-primary/50 shadow-2xl scale-105 ring-2 ring-primary/20"
                      )}>
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-10">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute bg-white/20 rounded-full"
                              style={{
                                width: `${2 + Math.random() * 4}px`,
                                height: `${2 + Math.random() * 4}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                              }}
                              animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                              }}
                            />
                          ))}
                        </div>

                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center", plan.bgColor, plan.borderColor)}>
                              <Icon className={cn("h-6 w-6", plan.iconColor)} />
                            </div>
                            {plan.highlight && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
                                <Crown className="h-3 w-3 text-primary" />
                                <span className="text-xs text-primary font-medium">POPULAR</span>
                              </div>
                            )}
                          </div>
                          
                          <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                          <CardDescription className="text-muted-foreground mb-4">{plan.description}</CardDescription>
                          
                          <div className="flex items-end gap-1 mb-4">
                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                            {plan.period && <span className="text-base text-muted-foreground">{plan.period}</span>}
                          </div>
                        </CardHeader>

                        <CardContent className="flex-1 relative z-10">
                          <ul className="space-y-3">
                            {plan.features.map((feature, featureIdx) => (
                              <motion.li
                                key={feature}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.8 + featureIdx * 0.1 }}
                                className="flex items-center gap-3 text-muted-foreground"
                              >
                                <CheckCircle2 className="text-primary w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </CardContent>

                        <CardFooter className="pt-6 relative z-10">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handlePlanClick(plan)}
                            className={cn(
                              "w-full justify-center group relative overflow-hidden",
                              plan.highlight && "border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary shadow-lg shadow-primary/25",
                              !plan.highlight && plan.iconColor === "text-green-500" && "border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-400 shadow-lg shadow-green-500/25",
                              !plan.highlight && plan.iconColor === "text-blue-500" && "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/25",
                              !plan.highlight && plan.iconColor === "text-purple-500" && "border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/25",
                              !plan.highlight && plan.iconColor === "text-orange-500" && "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/25",
                              !plan.highlight && plan.iconColor === "text-indigo-500" && "border-indigo-500/50 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/25"
                            )}
                          >
                            <span className="relative z-10 flex items-center">
                              {plan.cta}
                              {plan.highlight && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
                            </span>
                            <div className={cn(
                              "absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
                              plan.highlight && "bg-gradient-to-r from-primary/0 via-white/10 to-primary/0",
                              !plan.highlight && plan.iconColor === "text-green-500" && "bg-gradient-to-r from-green-500/0 via-white/10 to-green-500/0",
                              !plan.highlight && plan.iconColor === "text-blue-500" && "bg-gradient-to-r from-blue-500/0 via-white/10 to-blue-500/0",
                              !plan.highlight && plan.iconColor === "text-purple-500" && "bg-gradient-to-r from-purple-500/0 via-white/10 to-purple-500/0",
                              !plan.highlight && plan.iconColor === "text-orange-500" && "bg-gradient-to-r from-orange-500/0 via-white/10 to-orange-500/0",
                              !plan.highlight && plan.iconColor === "text-indigo-500" && "bg-gradient-to-r from-indigo-500/0 via-white/10 to-indigo-500/0"
                            )} />
                          </Button>
                        </CardFooter>

                        {/* Corner accent */}
                        <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-xl", plan.bgColor)} />
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </ScrollArea>
      
      {/* Coming Soon Popup */}
      <ComingSoonPopup
        isOpen={showComingSoonPopup}
        onClose={() => setShowComingSoonPopup(false)}
      />
    </div>
  );
} 