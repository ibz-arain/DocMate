"use client";

import { motion } from "framer-motion";
import { 
    Building2, 
    Briefcase,
    Stethoscope,
    Scale,
    ShieldCheck,
    Users,
    Factory
} from "lucide-react";
import { UseCaseCard } from "./shared/UseCaseCard";
import { GradientText } from "./shared/GradientText";
import { FloatingElement } from "./shared/FloatingElement";

export const IndustriesSection = () => {
  return (
    <section className="py-10 px-6 relative bg-black">
      {/* Background enhancements for Real World Applications */}
      <div className="absolute inset-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black opacity-100" />
        
        {/* Hexagon grid background effect */}
        <div className="absolute inset-0 opacity-5">
          {Array(5).fill(null).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex justify-around" style={{ marginTop: `${rowIndex * 20}vh` }}>
              {Array(6).fill(null).map((_, colIndex) => (
                <motion.div
                  key={`hex-${rowIndex}-${colIndex}`}
                  className="w-24 h-24 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [0.8, 1, 0.8],
                    rotate: [0, 60, 0]
                  }}
                  transition={{
                    duration: 10 + (rowIndex + colIndex),
                    delay: (rowIndex + colIndex) * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border border-primary/10" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Animated connection lines specific to industries */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="50%" stopColor="rgba(117, 81, 251, 0.5)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          {Array(10).fill(null).map((_, i) => {
            const x1 = Math.random() * 100;
            const y1 = Math.random() * 100;
            const x2 = Math.random() * 100;
            const y2 = Math.random() * 100;
            return (
              <motion.line
                key={i}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 1, 0],
                  opacity: [0, 0.5, 0.5, 0]
                }}
                transition={{
                  duration: 8,
                  delay: i * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </svg>
        
        {/* Floating industry icons */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            { icon: "💰", top: "15%", left: "10%", delay: 0.5 },
            { icon: "🏥", top: "75%", left: "80%", delay: 1.2 },
            { icon: "⚖️", top: "30%", left: "85%", delay: 2.1 },
            { icon: "🏢", top: "65%", left: "25%", delay: 0.8 },
            { icon: "🎓", top: "20%", left: "60%", delay: 1.5 }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="absolute text-lg opacity-30"
              style={{ top: item.top, left: item.left }}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 5,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>
        
        {/* Glowing orbs */}
        <FloatingElement 
          className="absolute top-[40%] right-[20%] w-32 h-32 opacity-5"
          delay={0.8}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-purple-500 blur-xl animate-spin-slow" />
        </FloatingElement>
        
        <FloatingElement 
          className="absolute bottom-[30%] left-[15%] w-24 h-24 opacity-5"
          delay={1.4}
        >
          <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
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
            <Building2 className="h-4 w-4 mr-2" />
            <span>Real World Applications</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Applicable to all <GradientText>Industries</GradientText>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how any field of work can benefit from automated workflows
          </p>
        </motion.div>

        {/* Redesigned industry cards section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Briefcase className={`h-6 w-6 text-blue-400`} />,
              title: "Finance & Banking",
              description: "Cut processing time by 95% for invoices, statements, and tax documents.",
              benefits: [
                "Process 10,000+ invoices daily",
                "Automate payment matching",
                "Real-time fraud detection",
                "Instant compliance checks"
              ],
              examples: [
                "Invoice processing",
                "Bank statements",
                "Tax documents",
                "Financial reports"
              ],
              color: "blue"
            },
            {
              icon: <Stethoscope className={`h-6 w-6 text-purple-400`} />,
              title: "Healthcare",
              description: "Process patient records and claims in seconds instead of hours.",
              benefits: [
                "Instant patient record updates",
                "Real-time insurance verification",
                "HIPAA compliant processing",
                "Automated billing cycles"
              ],
              examples: [
                "Medical records",
                "Insurance claims",
                "Lab reports",
                "Patient forms"
              ],
              color: "purple"
            },
            {
              icon: <Scale className={`h-6 w-6 text-amber-400`} />,
              title: "Legal",
              description: "Review contracts and legal documents 50x faster with AI.",
              benefits: [
                "Instant contract analysis",
                "Automated compliance checks",
                "Quick case research",
                "Real-time risk assessment"
              ],
              examples: [
                "Contracts",
                "Court documents",
                "Legal briefs",
                "Compliance reports"
              ],
              color: "amber"
            },
            {
              icon: <ShieldCheck className={`h-6 w-6 text-green-400`} />,
              title: "Insurance",
              description: "Process 10,000 claims daily with 99.9% accuracy.",
              benefits: [
                "Instant claim processing",
                "Automated underwriting",
                "Real-time fraud detection",
                "Smart policy management"
              ],
              examples: [
                "Claims forms",
                "Policy documents",
                "Assessment reports",
                "Coverage verification"
              ],
              color: "green"
            },
            {
              icon: <Users className={`h-6 w-6 text-rose-400`} />,
              title: "HR & Recruiting",
              description: "Screen 1000s of applications daily, automate employee docs.",
              benefits: [
                "Instant resume screening",
                "Automated onboarding",
                "Quick background checks",
                "Smart document routing"
              ],
              examples: [
                "Resumes",
                "Employee records",
                "Contracts",
                "Performance reviews"
              ],
              color: "rose"
            },
            {
              icon: <Factory className={`h-6 w-6 text-cyan-400`} />,
              title: "Manufacturing",
              description: "Automate quality control and compliance documentation.",
              benefits: [
                "Real-time QC verification",
                "Instant compliance checks",
                "Automated inventory docs",
                "Smart maintenance logs"
              ],
              examples: [
                "Quality reports",
                "Safety documents",
                "Inventory records",
                "Maintenance logs"
              ],
              color: "cyan"
            }
          ].map((industry, index) => (
            <UseCaseCard
              key={index}
              icon={industry.icon}
              title={industry.title}
              description={industry.description}
              benefits={industry.benefits}
              examples={industry.examples}
              color={industry.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 