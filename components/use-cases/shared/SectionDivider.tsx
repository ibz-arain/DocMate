"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export const SectionDivider = ({ icon = <Sparkles className="h-6 w-6 text-primary" /> }: { icon?: React.ReactNode }) => {
    return (
      <div className="relative py-10 bg-black">
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Simplified background elements */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }} // Fade in slightly
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
           {/* Simple gradient line */}
           <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
        </motion.div>
        
        {/* Removed radiating pulse and moving particles */}
        
        <div className="absolute inset-0 flex justify-center items-center opacity-20">
          <div className="w-[80%] h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 flex justify-center"
        >
          <div className="w-12 h-12 rounded-full bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            {icon}
          </div>
        </motion.div>
      </div>
    );
  }; 