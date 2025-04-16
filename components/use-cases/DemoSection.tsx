"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, FileText } from "lucide-react";
import { GradientText } from "./shared/GradientText";
import { FloatingElement } from "./shared/FloatingElement";

export const DemoSection = () => {
  return (
    <section className="py-10 px-6 relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black opacity-100" />
        
        {/* Animated circular elements */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] opacity-5"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-0 rounded-full border border-primary/20 rotate-45" />
          <div className="absolute inset-0 rounded-full border border-primary/20 rotate-90" />
        </motion.div>
        
        {/* Floating elements */}
        <FloatingElement 
          className="absolute bottom-[20%] right-[15%] w-40 h-40 opacity-5"
          delay={0.5}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-blue-500 blur-xl animate-spin-slow" />
        </FloatingElement>
        
        <FloatingElement 
          className="absolute top-[15%] left-[10%] w-48 h-48 opacity-5"
          delay={1}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
        </FloatingElement>
        
        {/* Code panels in background */}
        <div className="absolute top-10 left-10 opacity-10 text-2xl font-mono">
          {['{', '"document":', '{', '"type":', '"invoice",', '"amount":', '"$2,450.00",', '"date":', '"2025-03-20"', '}', '}'].map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 10
              }}
              className="text-primary/40 ml-4"
              style={{ marginLeft: `${Math.min(index, 2) * 1}rem` }}
            >
              {text}
            </motion.div>
          ))}
        </div>
        
        <div className="absolute bottom-10 right-10 opacity-10 text-2xl font-mono">
          {['{', '"accuracy":', '0.999,', '"time":', '7.2,', '"success":', 'true', '}'].map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: index * 0.1 + 1, 
                duration: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 10
              }}
              className="text-primary/40 ml-4"
              style={{ marginLeft: `${Math.min(index, 2) * 1}rem` }}
            >
              {text}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Demo</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              <GradientText>Try It Yourself</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Upload your documents and see how fast we can extract the data. No credit card required.
            </p>
            <div className="flex flex-wrap gap-4">
            <Link href="/demo">
                <Button size="lg" className="gap-2 relative overflow-hidden group shadow-lg shadow-primary/20 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30">
                  <span className="relative z-10 flex items-center">
                    Try It Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4 }}
                  />
              </Button>
            </Link>
          </div>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-10" />
              <CardContent className="p-0 relative z-10">
                <div className="bg-black/90 backdrop-blur-md">
                  <div className="bg-black/90 backdrop-blur-md p-4 flex items-center gap-2 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                    <div className="text-xs text-white/70 ml-2">Document Processing Demo</div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">invoice-0042.pdf</div>
                            <div className="text-xs text-muted-foreground">Uploaded 2 minutes ago</div>
                          </div>
                        </div>
                        <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium border border-green-500/20">Processed</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <div className="text-xs text-white/50 mb-2">Processing Status</div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full"
                              initial={{ width: "0%" }}
                              whileInView={{ width: "100%" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                            <div className="text-xs text-white/50 mb-1">Invoice Amount</div>
                            <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">$2,450.00</div>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                            <div className="text-xs text-white/50 mb-1">Vendor</div>
                            <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">Acme Supplies Inc.</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                            <div className="text-xs text-white/50 mb-1">Due Date</div>
                            <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">March 20, 2025</div>
                          </div>
                          
                          <div className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-primary/20 transition-colors duration-300 group">
                            <div className="text-xs text-white/50 mb-1">Processing Time</div>
                            <div className="text-lg font-medium group-hover:text-primary transition-colors duration-300">7.2 seconds</div>
                          </div>
                        </div>
                      </div>
                    
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.05) 50%, transparent 70%)",
                filter: "blur(40px)",
                zIndex: -1,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
} 