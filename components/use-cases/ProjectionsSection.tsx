"use client";

import { motion } from "framer-motion";
import { 
    Sparkles, 
    Building2, 
    Stethoscope, 
    Scale, 
    ShieldCheck, 
    Building, 
    Clock, 
    CheckCircle 
} from "lucide-react";
import { GradientText } from "./shared/GradientText";
import { FloatingElement } from "./shared/FloatingElement";

export const ProjectionsSection = () => {
  return (
    <section className="py-10 px-6 relative bg-black">
      {/* Section background */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black opacity-100" />
        
        {/* Data visualization elements */}
        <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden opacity-15">
          <motion.div 
            className="absolute inset-0 flex space-x-1"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {Array(50).fill(null).map((_, i) => (
              <motion.div 
                key={i}
                className="h-40 w-1 bg-primary/30"
                initial={{ height: 40 }}
                animate={{ 
                  height: [40, 120, 80, 160, 40],
                }}
                transition={{ 
                  duration: 4,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-15">
          <motion.div 
            className="absolute inset-0 flex space-x-1"
            animate={{ x: [-1000, 0] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {Array(50).fill(null).map((_, i) => (
              <motion.div 
                key={i}
                className="h-40 w-1 bg-purple-500/30"
                initial={{ height: 40 }}
                animate={{ 
                  height: [40, 100, 60, 140, 40],
                }}
                transition={{ 
                  duration: 5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Digital network effect */}
        <div className="absolute inset-0 opacity-10">
          {Array(20).fill(null).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Radiating circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {Array(3).fill(null).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
              animate={{
                width: ["0vh", "100vh"],
                height: ["0vh", "100vh"],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
        
        {/* Floating elements */}
        <FloatingElement 
          className="absolute top-[20%] right-[15%] w-16 h-16 opacity-10"
          delay={1.5}
        >
          <div className="w-full h-full rounded-full bg-primary/20 blur-xl" />
        </FloatingElement>
        
        <FloatingElement 
          className="absolute bottom-[25%] left-[20%] w-24 h-24 opacity-10"
          delay={0.8}
        >
          <div className="w-full h-full rounded-full bg-blue-500/20 blur-xl" />
        </FloatingElement>
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Projections</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            <GradientText>Estimated Impact</GradientText> by Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Example estimates of document automation impact based on industry benchmarks
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-xl shadow-primary/5 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5" />
          
          <div className="overflow-x-auto relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-5 text-left font-medium text-sm text-primary">Industry</th>
                  <th className="p-5 text-left font-medium text-sm text-primary">Processing Time</th>
                  <th className="p-5 text-left font-medium text-sm text-primary">FTE Impact</th>
                  <th className="p-5 text-left font-medium text-sm text-primary">Annual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    industry: "Banking & Finance",
                    icon: <Building2 className="h-5 w-5" />,
                    processing: "3-5 days → 2-5 minutes",
                    processingReduction: "99.8%",
                    processingBar: 99,
                    workforce: "60-70% reduction",
                    workforceBar: 65,
                    workforceDetail: "26 FTEs → 8 FTEs (oversight)",
                    cost: "$1.3M → $26K",
                    costReduction: "$1.27M",
                    costBar: 98,
                  },
                  {
                    industry: "Healthcare",
                    icon: <Stethoscope className="h-5 w-5" />,
                    processing: "36 hours → 45 seconds",
                    processingReduction: "99.7%",
                    processingBar: 99.7,
                    workforce: "55-65% reduction",
                    workforceBar: 60,
                    workforceDetail: "22 FTEs → 9 FTEs (clinical validation)",
                    cost: "$980K → $29K",
                    costReduction: "$951K",
                    costBar: 97,
                  },
                  {
                    industry: "Legal Services",
                    icon: <Scale className="h-5 w-5" />,
                    processing: "2 days → 3-8 minutes",
                    processingReduction: "99.5%",
                    processingBar: 99.5,
                    workforce: "50-60% reduction",
                    workforceBar: 55,
                    workforceDetail: "18 FTEs → 8 FTEs (legal review)",
                    cost: "$720K → $32K",
                    costReduction: "$688K",
                    costBar: 95,
                  },
                  {
                    industry: "Insurance",
                    icon: <ShieldCheck className="h-5 w-5" />,
                    processing: "4-6 days → 30-60 seconds",
                    processingReduction: "99.9%",
                    processingBar: 99.9,
                    workforce: "65-75% reduction",
                    workforceBar: 70,
                    workforceDetail: "32 FTEs → 10 FTEs (complex claims)",
                    cost: "$1.6M → $24K",
                    costReduction: "$1.58M",
                    costBar: 98.5,
                  },
                  {
                    industry: "Real Estate",
                    icon: <Building className="h-5 w-5" />,
                    processing: "1.5 days → 1-4 minutes",
                    processingReduction: "99.8%",
                    processingBar: 99.8,
                    workforce: "45-55% reduction",
                    workforceBar: 50,
                    workforceDetail: "14 FTEs → 7 FTEs (transaction oversight)",
                    cost: "$540K → $18K",
                    costReduction: "$522K",
                    costBar: 97
                  }
                ].map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group hover:bg-white/5 transition-colors duration-300"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center text-primary group-hover:from-primary/30 group-hover:via-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                          {item.icon}
                        </div>
                        <span className="font-medium text-base">{item.industry}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-2">
                        <div className="text-sm">{item.processing}</div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary/90 via-primary to-purple-500/90 h-full rounded-full" 
                            style={{ width: `${item.processingBar}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-primary font-medium">{item.processingReduction} reduction</div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-2">
                        <div className="text-sm">{item.workforce}</div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500/90 via-blue-500 to-purple-500/90 h-full rounded-full" 
                            style={{ width: `${item.workforceBar}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.workforceDetail}</div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-2">
                        <div className="text-sm">{item.cost}</div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500/90 via-green-400 to-emerald-500/90 h-full rounded-full" 
                            style={{ width: `${item.costBar}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-green-400 font-medium">{item.costReduction} annually</div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Based on medium-sized enterprises (100-500 employees)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>12-month ROI projections</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 