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
  Leaf,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Clock,
  AlertCircle,
  DollarSign,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
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
      <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden group hover:bg-white/5 transition-colors duration-300">
        <CardContent className="p-6">
          <div className="relative">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                {icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm text-primary">Key Benefits</h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-sm text-primary">Real-World Examples</h4>
                  <ul className="space-y-2">
                    {examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{example}</span>
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
    <div className="relative min-h-screen bg-background">
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
                  <span>Real Life Application</span>
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
                          <span className="text-muted-foreground">20-person claims processing department</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">2-3 weeks to process 1,000 insurance claims</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">12% error rate requiring manual review</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-red-400 mt-1" />
                          <span className="text-muted-foreground">$840,000 annual processing costs</span>
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
                      <h3 className="text-2xl font-semibold mb-4 text-green-400">AI-Powered Process</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">2 employees managing AI system</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">1,000 claims processed in 45 minutes</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">99.9% accuracy with AI validation</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-green-400 mt-1" />
                          <span className="text-muted-foreground">$168,000 annual processing costs (80% reduction)</span>
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
                            <span>1. Document Ingestion</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Batch upload of 1,000 claims instantly digitized and queued for processing</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <ArrowRight className="h-4 w-4" />
                            <span>2. AI Processing</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Advanced ML models extract, validate, and categorize claim data in parallel</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <ArrowRight className="h-4 w-4" />
                            <span>3. Automated Workflow</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Claims automatically routed for approval or flagged for review based on business rules</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

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
                  <span>Industry Solutions</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Trusted Across <GradientText>Industries</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  See how leading organizations are transforming their operations with AI-powered document processing
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UseCaseCard
                  icon={<Briefcase className="h-6 w-6 text-primary" />}
                  title="Finance & Accounting"
                  description="Streamline financial operations with automated document processing and data extraction."
                  benefits={[
                    "Reduce manual data entry by 90%",
                    "Accelerate month-end closing",
                    "Minimize human errors in data entry",
                    "Improve audit readiness"
                  ]}
                  examples={[
                    "Automated invoice processing and payment matching",
                    "Bank statement reconciliation",
                    "Expense report processing",
                    "Tax document analysis and compliance"
                  ]}
                />

                <UseCaseCard
                  icon={<Stethoscope className="h-6 w-6 text-primary" />}
                  title="Healthcare"
                  description="Enhance patient care and operational efficiency through automated medical document processing."
                  benefits={[
                    "Faster patient onboarding",
                    "Improved insurance claim processing",
                    "Better compliance with regulations",
                    "Enhanced patient data management"
                  ]}
                  examples={[
                    "Medical records digitization and analysis",
                    "Insurance claim form processing",
                    "Lab report data extraction",
                    "Patient intake form automation"
                  ]}
                />

                <UseCaseCard
                  icon={<Scale className="h-6 w-6 text-primary" />}
                  title="Legal"
                  description="Accelerate legal document review and analysis while improving accuracy."
                  benefits={[
                    "Faster contract review process",
                    "Improved compliance tracking",
                    "Reduced legal research time",
                    "Better case management"
                  ]}
                  examples={[
                    "Contract analysis and key term extraction",
                    "Legal document classification",
                    "Compliance document review",
                    "Court document processing"
                  ]}
                />

                <UseCaseCard
                  icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                  title="Insurance"
                  description="Streamline claims processing and policy management."
                  benefits={[
                    "Faster claims processing",
                    "Improved risk assessment",
                    "Better fraud detection",
                    "Enhanced policy management"
                  ]}
                  examples={[
                    "Insurance claim form processing",
                    "Policy document analysis",
                    "Risk assessment automation",
                    "Claim verification workflow"
                  ]}
                />

                <UseCaseCard
                  icon={<Users className="h-6 w-6 text-primary" />}
                  title="Human Resources"
                  description="Automate HR document processing and employee management."
                  benefits={[
                    "Faster employee onboarding",
                    "Improved resume screening",
                    "Better compliance management",
                    "Enhanced employee data organization"
                  ]}
                  examples={[
                    "Resume parsing and analysis",
                    "Employee document processing",
                    "Performance review analysis",
                    "Benefits enrollment automation"
                  ]}
                />

                <UseCaseCard
                  icon={<Factory className="h-6 w-6 text-primary" />}
                  title="Manufacturing"
                  description="Optimize production documentation and quality control processes."
                  benefits={[
                    "Improved quality control documentation",
                    "Better compliance tracking",
                    "Enhanced inventory management",
                    "Streamlined production planning"
                  ]}
                  examples={[
                    "Quality control report analysis",
                    "Production documentation processing",
                    "Inventory document management",
                    "Safety compliance documentation"
                  ]}
                />
              </div>
            </div>
          </section>

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
                  <span>Versatile Platform</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  One Platform, <GradientText>All Documents</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Process any type of document with industry-leading accuracy and speed
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
                    <Card className="h-full bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/5 transition-colors duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4 text-primary">{category.title}</h3>
                        <ul className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
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

          {/* CTA Section */}
          <section className="py-20 px-6 bg-black/20">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Get Started Today</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Ready to <GradientText>Transform</GradientText> Your Workflow?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join organizations across industries that are already using DocMate to automate their document processing and unlock new efficiencies.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/demo">
                    <Button size="lg" className="gap-2">
                      Try Demo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/learn-more">
                    <Button variant="outline" size="lg" className="gap-2">
                      Learn More <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 