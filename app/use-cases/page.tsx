"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  FileText, 
  Briefcase,
  Stethoscope,
  Scale,
  GraduationCap,
  Building,
  Truck,
  ShieldCheck,
  Users,
  Factory,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Clock,
  AlertCircle,
  DollarSign,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

// 3D Card component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = (y - centerY) / 30;
    const rotateYVal = (centerX - x) / 30;
    
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
    setScale(1.03);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      className={`transform-gpu transition-all duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Use Case Card Component
const UseCaseCard = ({ 
  icon, 
  title, 
  description, 
  benefits,
  examples 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  examples: string[];
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 group overflow-hidden">
        <CardContent className="p-6">
          <div className="relative">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                {icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                {title}
              </h3>
              <p className="text-muted-foreground mb-4 group-hover:text-primary/80 transition-colors duration-300">{description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-primary">Key Benefits</h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm group/item">
                        <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0 transition-transform duration-300 group-hover/item:translate-x-1" />
                        <span className="text-muted-foreground group-hover/item:text-primary/90 transition-colors duration-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm text-primary">Real-World Examples</h4>
                  <ul className="space-y-2">
                    {examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm group/item">
                        <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0 transition-transform duration-300 group-hover/item:translate-x-1" />
                        <span className="text-muted-foreground group-hover/item:text-primary/90 transition-colors duration-300">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function UseCasesPage() {
  // Force dark theme
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return (
    <div className="relative min-h-screen bg-black">
      <Header />
      
      <ScrollArea className="h-screen">
        <div className="relative">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-20" />
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)",
              }} />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>In the Real World</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <GradientText>Use Cases</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                  See how a claims processing department can be transformed by automated document processing
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold mb-4 text-red-400">Manual Process</h3>
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
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold mb-4 text-green-400">Automated Process</h3>
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
                >
                  <Card className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <ArrowRight className="h-4 w-4" />
                            <span>1. Real-Time Ingestion</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Claims are instantly digitized and processed as they arrive, handling thousands per hour</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <ArrowRight className="h-4 w-4" />
                            <span>2. Intelligent Processing</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Parallel AI processing with 99.9% accuracy, replacing entire departments of manual work</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <ArrowRight className="h-4 w-4" />
                            <span>3. Automated Decisions</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Instant claim decisions with smart routing, fraud detection, and compliance checks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Diagonal divider */}
          <div className="relative h-24 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
          </div>

          {/* Industries Section */}
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UseCaseCard
                  icon={<Briefcase className="h-6 w-6 text-primary" />}
                  title="Finance & Banking"
                  description="Cut processing time by 95% for invoices, statements, and tax documents."
                  benefits={[
                    "Process 10,000+ invoices daily",
                    "Automate payment matching",
                    "Real-time fraud detection",
                    "Instant compliance checks"
                  ]}
                  examples={[
                    "Invoice processing",
                    "Bank statements",
                    "Tax documents",
                    "Financial reports"
                  ]}
                />

                <UseCaseCard
                  icon={<Stethoscope className="h-6 w-6 text-primary" />}
                  title="Healthcare"
                  description="Process patient records and claims in seconds instead of hours."
                  benefits={[
                    "Instant patient record updates",
                    "Real-time insurance verification",
                    "HIPAA compliant processing",
                    "Automated billing cycles"
                  ]}
                  examples={[
                    "Medical records",
                    "Insurance claims",
                    "Lab reports",
                    "Patient forms"
                  ]}
                />

                <UseCaseCard
                  icon={<Scale className="h-6 w-6 text-primary" />}
                  title="Legal"
                  description="Review contracts and legal documents 50x faster with AI."
                  benefits={[
                    "Instant contract analysis",
                    "Automated compliance checks",
                    "Quick case research",
                    "Real-time risk assessment"
                  ]}
                  examples={[
                    "Contracts",
                    "Court documents",
                    "Legal briefs",
                    "Compliance reports"
                  ]}
                />

                <UseCaseCard
                  icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                  title="Insurance"
                  description="Process 10,000 claims daily with 99.9% accuracy."
                  benefits={[
                    "Instant claim processing",
                    "Automated underwriting",
                    "Real-time fraud detection",
                    "Smart policy management"
                  ]}
                  examples={[
                    "Claims forms",
                    "Policy documents",
                    "Assessment reports",
                    "Coverage verification"
                  ]}
                />

                <UseCaseCard
                  icon={<Users className="h-6 w-6 text-primary" />}
                  title="HR & Recruiting"
                  description="Screen 1000s of applications daily, automate employee docs."
                  benefits={[
                    "Instant resume screening",
                    "Automated onboarding",
                    "Quick background checks",
                    "Smart document routing"
                  ]}
                  examples={[
                    "Resumes",
                    "Employee records",
                    "Contracts",
                    "Performance reviews"
                  ]}
                />

                <UseCaseCard
                  icon={<Factory className="h-6 w-6 text-primary" />}
                  title="Manufacturing"
                  description="Automate quality control and compliance documentation."
                  benefits={[
                    "Real-time QC verification",
                    "Instant compliance checks",
                    "Automated inventory docs",
                    "Smart maintenance logs"
                  ]}
                  examples={[
                    "Quality reports",
                    "Safety documents",
                    "Inventory records",
                    "Maintenance logs"
                  ]}
                />

                <UseCaseCard
                  icon={<Building className="h-6 w-6 text-primary" />}
                  title="Real Estate"
                  description="Process property documents and leases in minutes."
                  benefits={[
                    "Quick lease processing",
                    "Instant document verification",
                    "Automated assessments",
                    "Smart contract routing"
                  ]}
                  examples={[
                    "Lease agreements",
                    "Property deeds",
                    "Inspection reports",
                    "Mortgage documents"
                  ]}
                />

                <UseCaseCard
                  icon={<Truck className="h-6 w-6 text-primary" />}
                  title="Logistics"
                  description="Process shipping docs and customs forms instantly."
                  benefits={[
                    "Real-time shipment tracking",
                    "Automated customs forms",
                    "Quick inventory updates",
                    "Smart route planning"
                  ]}
                  examples={[
                    "Bills of lading",
                    "Customs documents",
                    "Shipping manifests",
                    "Delivery receipts"
                  ]}
                />

                <UseCaseCard
                  icon={<GraduationCap className="h-6 w-6 text-primary" />}
                  title="Education"
                  description="Process student records and transcripts automatically."
                  benefits={[
                    "Quick transcript processing",
                    "Instant record updates",
                    "Automated enrollment",
                    "Smart document routing"
                  ]}
                  examples={[
                    "Transcripts",
                    "Student records",
                    "Applications",
                    "Course materials"
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Diagonal divider */}
          <div className="relative h-24 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
          </div>

          {/* Document Types Section */}
          <section className="py-20 px-6 bg-black/20">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Financial Documents",
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 group">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500">
                          {category.title}
                        </h3>
                        <ul className="space-y-2 relative">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm group/item">
                              <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0 transition-transform duration-300 group-hover/item:translate-x-1" />
                              <span className="text-muted-foreground group-hover/item:text-primary/90 transition-colors duration-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Diagonal divider */}
          <div className="relative h-24 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
          </div>

          {/* Industry Impact Projections */}
          <section className="py-20 px-6 bg-black/20">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
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
                className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-sm"
              >
                <div className="overflow-x-auto">
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

          {/* Diagonal divider */}
          <div className="relative h-24 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-background via-primary/10 to-background transform -skew-y-2" />
          </div>

          {/* Try Demo Section */}
          <section className="py-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 opacity-20" />
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)",
              }} />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex-1"
                >
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
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
                  <Card3D className="overflow-hidden rounded-lg bg-black/5 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-0">
                      <div className="bg-black/50 backdrop-blur-sm">
                        <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center gap-2 border-b border-white/10">
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
                              <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">Processed</div>
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
                  </Card3D>
                  
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.3) 0%, rgba(var(--primary-rgb), 0.1) 50%, transparent 70%)",
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

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 