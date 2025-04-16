"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText } from "lucide-react";

// Use Case Card Component
export const UseCaseCard = ({ 
  icon, 
  title, 
  description, 
  benefits,
  examples,
  color = "primary"
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  examples: string[];
  color?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'benefits' | 'examples'>('benefits');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full relative bg-black/80 backdrop-blur-md border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        {/* Glow effect on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-${color}-500/20 via-transparent to-transparent opacity-0 transition-opacity duration-500`}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
        />
        
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent`} />
          <div className={`absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-${color}-500/50 to-transparent`} />
        </motion.div>

        <CardContent className="p-6 relative z-10">
          <div className="relative z-10 space-y-4">
            {/* Header with icon */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center justify-center"
                animate={{ 
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? 5 : 0
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {icon}
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h3 
                  className={`text-xl font-semibold text-${color}-400`}
                  animate={{ 
                    x: isHovered ? 5 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {title}
                </motion.h3>
              </div>
            </div>
            
            {/* Description */}
            <motion.p 
              className="text-muted-foreground"
              animate={{ 
                opacity: isHovered ? 1 : 0.8,
                y: isHovered ? 0 : 5
              }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-3">
              <button 
                className={`pb-2 px-4 text-sm font-medium relative ${activeTab === 'benefits' ? `text-${color}-400` : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('benefits')}
              >
                Benefits
                {activeTab === 'benefits' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${ // Safelist these classes or use inline styles if Tailwind purge is aggressive
                      color === "primary" ? "bg-primary" :
                      color === "blue" ? "bg-blue-500" :
                      color === "purple" ? "bg-purple-500" :
                      color === "amber" ? "bg-amber-500" :
                      color === "green" ? "bg-green-500" :
                      color === "rose" ? "bg-rose-500" :
                      color === "cyan" ? "bg-cyan-500" :
                      "bg-primary"
                    }`}
                    layoutId={`activeTabIndicator-${title}`}
                  />
                )}
              </button>
              <button 
                className={`pb-2 px-4 text-sm font-medium relative ${activeTab === 'examples' ? `text-${color}-400` : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('examples')}
              >
                Examples
                {activeTab === 'examples' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${ // Safelist these classes or use inline styles if Tailwind purge is aggressive
                      color === "primary" ? "bg-primary" :
                      color === "blue" ? "bg-blue-500" :
                      color === "purple" ? "bg-purple-500" :
                      color === "amber" ? "bg-amber-500" :
                      color === "green" ? "bg-green-500" :
                      color === "rose" ? "bg-rose-500" :
                      color === "cyan" ? "bg-cyan-500" :
                      "bg-primary"
                    }`}
                    layoutId={`activeTabIndicator-${title}`}
                  />
                )}
              </button>
            </div>
            
            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'benefits' ? (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className={`w-5 h-5 rounded-full bg-${color}-500/10 flex flex-shrink-0 items-center justify-center mt-0.5`}> 
                          <CheckCircle className={`h-3 w-3 ${ // Safelist these classes
                            color === "primary" ? "text-primary" :
                            color === "blue" ? "text-blue-400" :
                            color === "purple" ? "text-purple-400" :
                            color === "amber" ? "text-amber-400" :
                            color === "green" ? "text-green-400" :
                            color === "rose" ? "text-rose-400" :
                            color === "cyan" ? "text-cyan-400" :
                            "text-primary"
                          }`} />
                        </div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ) : (
                <motion.div
                  key="examples"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="space-y-2">
                    {examples.map((example, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <div className={`w-5 h-5 rounded-full bg-${color}-500/10 flex flex-shrink-0 items-center justify-center mt-0.5`}>
                          <FileText className={`h-3 w-3 ${ // Safelist these classes
                            color === "primary" ? "text-primary" :
                            color === "blue" ? "text-blue-400" :
                            color === "purple" ? "text-purple-400" :
                            color === "amber" ? "text-amber-400" :
                            color === "green" ? "text-green-400" :
                            color === "rose" ? "text-rose-400" :
                            color === "cyan" ? "text-cyan-400" :
                            "text-primary"
                          }`} />
                        </div>
                        <span className="text-muted-foreground">{example}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 