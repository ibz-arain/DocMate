"use client";

import { motion } from "framer-motion";
import { 
    FileText, 
    DollarSign,
    Scale,
    Stethoscope,
    Briefcase,
    Users,
} from "lucide-react";
import { UseCaseCard } from "./shared/UseCaseCard";
import { GradientText } from "./shared/GradientText";
import { FloatingElement } from "./shared/FloatingElement";

export const DocumentTypesSection = () => {
  return (
    <section className="py-10 px-6 relative bg-black">
        {/* Section background */}
        <div className="absolute inset-0 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-black opacity-100" />
            
            {/* Animated orbital elements */}
            <motion.div 
            className="absolute h-[500px] w-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15"
            animate={{
                rotate: 360,
            }}
            transition={{
                duration: 100,
                repeat: Infinity,
                ease: "linear"
            }}
            >
            <div className="h-full w-full rounded-full border border-primary/10 absolute" />
            <div className="h-full w-full rounded-full border border-purple-500/10 absolute rotate-45" />
            <div className="h-full w-full rounded-full border border-blue-500/10 absolute rotate-90" />
            </motion.div>
            
            {/* Floating 3D elements */}
            <FloatingElement 
            className="absolute top-[10%] right-[5%] w-36 h-36 opacity-10"
            delay={0.7}
            >
            <div className="w-full h-full rounded-full bg-gradient-conic from-primary via-transparent to-blue-500 blur-xl animate-spin-slow" />
            </FloatingElement>
            
            <FloatingElement 
            className="absolute bottom-[15%] left-[10%] w-24 h-24 opacity-10"
            delay={0.3}
            >
            <div className="w-full h-full rounded-full bg-gradient-conic from-purple-500 via-transparent to-primary blur-xl animate-spin-slow-reverse" />
            </FloatingElement>
            
            {/* Subtle grid lines */}
            <div className="absolute inset-0 grid grid-cols-6 opacity-5">
            {Array(6).fill(null).map((_, i) => (
                <motion.div 
                key={i} 
                className="h-full w-[1px] bg-primary/10 justify-self-center"
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                }}
                />
            ))}
            </div>
            
            {/* Moving dots */}
            <motion.div 
            className="absolute left-[30%] opacity-30"
            animate={{ 
                y: ["-100%", "200%"],
                opacity: [0, 0.3, 0]
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
            }}
            >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </motion.div>
            
            <motion.div 
            className="absolute left-[70%] opacity-30"
            animate={{ 
                y: ["200%", "-100%"],
                opacity: [0, 0.3, 0]
            }}
            transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
                delay: 2
            }}
            >
            <div className="w-2 h-2 rounded-full bg-purple-500" />
        </motion.div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
            <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
            >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm shadow-primary/20">
                <FileText className="h-4 w-4 mr-2" />
                <span>Supported Document Types</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
                One Platform, <GradientText>All Documents</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Process any document type with unlimited flexibility
            </p>
            </motion.div>

            {/* Redesigned Interactive Document Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
                {
                title: "Financial Documents",
                icon: <DollarSign className="h-5 w-5 text-green-400" />,
                color: "green",
                description: "Process financial documents with high accuracy and security",
                items: [
                    "Invoices & Bills",
                    "Bank Statements",
                    "Tax Forms (T4, W-2, 1099)",
                    "Purchase Orders",
                    "Expense Reports",
                    "Financial Statements",
                    "Credit Card Statements",
                    "Payroll Documents"
                ]
                },
                {
                title: "Legal Documents",
                icon: <Scale className="h-5 w-5 text-blue-400" />,
                color: "blue",
                description: "Handle legal documentation with precision and compliance",
                items: [
                    "Contracts & Agreements",
                    "Legal Briefs",
                    "Court Documents",
                    "Patents & Trademarks",
                    "Compliance Reports",
                    "NDAs",
                    "Terms of Service",
                    "Legal Notices"
                ]
                },
                {
                title: "Healthcare Documents",
                icon: <Stethoscope className="h-5 w-5 text-purple-400" />,
                color: "purple",
                description: "Manage medical records with HIPAA compliance and accuracy",
                items: [
                    "Medical Records",
                    "Insurance Claims",
                    "Lab Reports",
                    "Prescriptions",
                    "Patient Forms",
                    "Discharge Summaries",
                    "Medical Bills",
                    "Health Insurance Forms"
                ]
                },
                {
                title: "Business Documents",
                icon: <Briefcase className="h-5 w-5 text-cyan-400" />,
                color: "cyan",
                description: "Streamline business operations with automated document processing",
                items: [
                    "Business Licenses",
                    "Corporate Filings",
                    "Annual Reports",
                    "Board Minutes",
                    "Project Proposals",
                    "Business Plans",
                    "Partnership Agreements",
                    "Vendor Contracts"
                ]
                },
                {
                title: "Personal Documents",
                icon: <Users className="h-5 w-5 text-amber-400" />,
                color: "amber",
                description: "Secure handling of sensitive personal documentation",
                items: [
                    "ID Documents",
                    "Passports",
                    "Driver's Licenses",
                    "Birth Certificates",
                    "Marriage Certificates",
                    "Academic Transcripts",
                    "Diplomas",
                    "Property Deeds"
                ]
                },
                {
                title: "Administrative Documents",
                icon: <FileText className="h-5 w-5 text-rose-400" />,
                color: "rose",
                description: "Efficiently process administrative and HR documentation",
                items: [
                    "Employment Contracts",
                    "HR Forms",
                    "Performance Reviews",
                    "Training Certificates",
                    "Incident Reports",
                    "Maintenance Logs",
                    "Inventory Records",
                    "Quality Control Reports"
                ]
                }
            ].map((category, index) => (
                <UseCaseCard
                key={index}
                icon={category.icon}
                title={category.title}
                description={category.description}
                benefits={category.items.slice(0, 4)} // Split items into benefits/examples
                examples={category.items.slice(4)}
                color={category.color}
                />
            ))}
            </div>
        </div>
    </section>
  );
} 