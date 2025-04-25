"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, AlertCircle, DollarSign, Zap, CheckCircle, Sparkles } from "lucide-react";

export const ComparisonSection = () => {
  return (
    <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
            initial={{ x: -100 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
            >
            {/* Decorative elements for cards */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Card className="bg-black/80 dark:bg-black/80 backdrop-blur-md border border-white/10 shadow-lg shadow-red-500/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent opacity-80" />
                
                {/* Add animated indicator */}
                <motion.div
                className="absolute -top-1 left-0 w-full h-[1px]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                >
                <div className="w-32 h-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                </motion.div>
                
                <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-3 border border-red-500/20">
                    <motion.div
                        animate={{ 
                        rotate: 360 
                        }}
                        transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        ease: "linear" 
                        }}
                        className="absolute inset-0 rounded-full border border-red-500/20"
                    />
                    <Users className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-red-400">Manual Process</h3>
                </div>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-red-400 mt-1" />
                    <span className="text-muted-foreground">30-person claims processing department</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-red-400 mt-1" />
                    <span className="text-muted-foreground">2-3 weeks to process 10,000 insurance claims</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-1" />
                    <span className="text-muted-foreground">12% error rate requiring manual review</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-red-400 mt-1" />
                    <span className="text-muted-foreground">$2,000,000 annual in processing costs</span>
                    </li>
                </ul>
                </CardContent>
            </Card>
            </motion.div>

            <motion.div
            initial={{ x: 100 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
            >
            {/* Decorative elements for cards */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Card className="bg-black/80 dark:bg-black/80 backdrop-blur-md border border-white/10 shadow-lg shadow-green-500/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-80" />
                
                {/* Add animated indicator */}
                <motion.div
                className="absolute -top-1 left-0 w-full h-[1px]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                >
                <div className="w-32 h-full bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                </motion.div>
                
                <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-3 border border-green-500/20">
                    <motion.div
                        animate={{ 
                        rotate: 360 
                        }}
                        transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        ease: "linear" 
                        }}
                        className="absolute inset-0 rounded-full border border-green-500/20"
                    />
                    <Zap className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-green-400">Automated Process</h3>
                </div>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-green-400 mt-1" />
                    <span className="text-muted-foreground">Self sufficient, barely any human intervention</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-green-400 mt-1" />
                    <span className="text-muted-foreground">Process claims in seconds as they come in</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                    <span className="text-muted-foreground">99.9% accuracy with AI validation</span>
                    </li>
                    <li className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-400 mt-1" />
                    <span className="text-muted-foreground">Less than $20,000 in annual processing costs</span>
                    </li>
                </ul>
                </CardContent>
            </Card>
            </motion.div>
            
            <motion.div
            initial={{ y: 100 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-2 relative"
            >
            {/* Decorative elements for cards */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10 rounded-xl blur-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Card className="bg-black/80 backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
                
                {/* Add animated indicator */}
                <motion.div
                className="absolute -top-1 left-0 w-full h-[1px]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                >
                <div className="w-40 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                </motion.div>
                
                <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                    <motion.div
                        animate={{ 
                        rotate: 360 
                        }}
                        transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        ease: "linear" 
                        }}
                        className="absolute inset-0 rounded-full border border-primary/20"
                    />
                    <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-primary/90">How It Works</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    >
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">1</div>
                        <span>Real-Time Ingestion</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Claims are instantly digitized and processed as they arrive, handling thousands per hour</p>
                    </motion.div>
                    <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    >
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">2</div>
                        <span>Intelligent Processing</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Parallel AI processing with 99.9% accuracy, replacing entire departments of manual work</p>
                    </motion.div>
                    <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 1 }}
                    >
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20">3</div>
                        <span>Automated Decisions</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Instant claim decisions with smart routing, fraud detection, and compliance checks</p>
                    </motion.div>
                </div>
                </CardContent>
            </Card>
            </motion.div>
        </div>
    </div>
  );
}; 