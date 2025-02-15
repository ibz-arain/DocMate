"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Brain, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <ScrollArea className="h-screen w-full">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Intelligent Document Analysis
                <span className="text-primary"> Made Simple</span>
              </h1>
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

        {/* Features Section */}
        <section className="py-20 px-6 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground">Everything you need to analyze and understand your documents</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
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
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
                  <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                    Experience the power of AI-driven document analysis. Try our demo today and see how we can help you extract valuable insights from your documents.
                  </p>
                  <Link href="/demo">
                    <Button size="lg" variant="secondary" className="gap-2">
                      Try Demo Now <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}