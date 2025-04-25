"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { FloatingElement } from "@/components/use-cases/shared/FloatingElement"; 
import { Sparkles } from "lucide-react";
import { GradientText } from "@/components/use-cases/shared/GradientText";

export const HeroSection = ({ mounted }: { mounted: boolean }) => {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 300], [1, 0.85]);

    return (
        <section className="relative pt-32 pb-10 px-6 overflow-hidden bg-black">
            {/* Hero interactive background elements */}
            {mounted && (
            <motion.div style={{ opacity, scale }} className="absolute inset-0">
                <div className="absolute inset-0 bg-black"></div>
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

                <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-10 -rotate-45"
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 5,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                />
            </motion.div>
            )}
            
            <div className="container mx-auto max-w-7xl relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto"
            >
                <motion.div 
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                >
                <Sparkles className="h-4 w-4 mr-2" />
                <span>In the Real World</span>
                </motion.div>
                <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                >
                <GradientText>Use Cases</GradientText>
                </motion.h1>
                <motion.p 
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                >
                See how a claims processing department can be transformed by automated document processing
                </motion.p>
            </motion.div>
            </div>
        </section>
    );
} 