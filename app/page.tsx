"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight, Receipt, FileCheck, LightbulbIcon, Cable, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
        style={{ scaleX }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section with enhanced animations */}
        <section className="py-20 px-6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
              backgroundSize: ["100% 100%", "120% 120%"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              backgroundImage: "radial-gradient(circle, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px"
            }}
          />

          {/* Update your hero content with hover animations */}
          <div className="container mx-auto max-w-6xl relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold tracking-tight"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                Intelligent Document Analysis Made <br />{' '}
                <motion.span className="inline-flex">
                  <TypeAnimation
                    sequence={[
                      'Simple',
                      2000,
                      'Efficient',
                      2000,
                      'Powerful',
                      2000,
                      'Smart',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    className="text-primary"
                    repeat={Infinity}
                    cursor={true}
                  />
                </motion.span>
              </motion.h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform your documents into actionable insights with our advanced AI-powered analysis platform.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/demo">
                  <Button size="lg" className="gap-2">
                    Try Demo <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section with scroll-triggered animations */}
        <motion.section
          className="py-20 px-6 bg-muted/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground">Everything you need to analyze and understand your documents</p>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={fadeInUp}
              >
                <Card className="transform-gpu">
                  <CardContent className="pt-6">
                    <div className="text-primary mb-4">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Smart Extraction</h3>
                    <p className="text-muted-foreground">
                      Automatically extract and organize key information from your documents
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={fadeInUp}
              >
                <Card className="transform-gpu">
                  <CardContent className="pt-6">
                    <div className="text-primary mb-4">
                      <Brain className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
                    <p className="text-muted-foreground">
                      Get deep insights and understanding with our advanced AI analysis
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={fadeInUp}
              >
                <Card className="transform-gpu">
                  <CardContent className="pt-6">
                    <div className="text-primary mb-4">
                      <Zap className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
                    <p className="text-muted-foreground">
                      Process documents quickly and efficiently with real-time results
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Demo Types Section with scroll animations */}
        <motion.section

          className="py-20 px-6 dark:bg-black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Document Types We Support</h2>
              <p className="text-muted-foreground">Specialized analysis for different types of documents</p>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="text-primary mb-4 flex justify-center">
                      <Receipt className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Receipts</h3>
                    <p className="text-muted-foreground">
                      Extract date, items, totals, and tax information from retail and service receipts
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="text-primary mb-4 flex justify-center">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">T4 Tax Forms</h3>
                    <p className="text-muted-foreground">
                      Automatically process employment income, tax deductions, and CPP/EI contributions
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="text-primary mb-4 flex justify-center">
                      <FileSpreadsheet className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Bank Statements</h3>
                    <p className="text-muted-foreground flex-1">
                      Analyze transactions, calculate totals, and categorize spending patterns
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="text-primary mb-4 flex justify-center">
                      <FileCheck className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Dental Claims</h3>
                    <p className="text-muted-foreground">
                      Process procedure codes, dates of service, and insurance claim details
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="text-primary mb-4 flex justify-center">
                      <Cable className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Utility Bills</h3>
                    <p className="text-muted-foreground">
                      Extract usage data, billing periods, and payment information
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}>
                <Card className="px-6 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="text-primary mb-4 flex justify-center">
                      <LightbulbIcon className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">More Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Stay tuned for more document types and features!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section with attention-grabbing animation */}
        <motion.section
          className="py-20 px-6 bg-muted/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto max-w-6xl">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="bg-black text-white">
                <CardContent className="p-12">
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-primary">Ready to Get Started?</h2>
                    <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                      Experience the power of AI-driven document analysis. Try our demo today and see how we can help you extract valuable insights from your documents.
                    </p>
                    <br />
                    <Link href="/demo">
                      <Button size="lg" className="gap-2">
                        Try Demo Now <ChevronRight className="h-4 w-4" />
                      </Button>

                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </ScrollArea>
  );
}