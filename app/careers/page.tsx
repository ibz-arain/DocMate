"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, ArrowRight, Mail, Heart, Sparkles, Code, Zap, Brain } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

export default function CareersPage() {
  return (
    <div className="relative">
      <Header />
      <ScrollArea className="h-screen w-full">
        <div className="min-h-screen bg-background relative">
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Gradient orbs */}
            <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl opacity-70" />
            <div className="absolute top-2/3 -right-20 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl opacity-70" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl opacity-60" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
          </div>

          {/* Hero Section */}
          <section className="pt-32 pb-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Join Our Team</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  <GradientText>Careers</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  We're a small startup always looking to expand and welcome new talent to our growing team.
                </p>
              </motion.div>

              {/* Mission Statement Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-4xl mx-auto mb-16"
              >
                <Card className="bg-black/10 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 shadow-lg relative overflow-hidden">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                  
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">
                        We're Building Something <GradientText>Amazing</GradientText>
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        As a small but ambitious startup, we're passionate about revolutionizing document processing with AI. 
                        We believe in the power of great people coming together to solve complex problems and create 
                        innovative solutions that make a real difference.
                      </p>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        If you're excited about AI, the automatic future, and being part of a fast-growing team, 
                        we'd love to hear from you. We're always looking for talented individuals who share our vision 
                        and want to help shape the future of automated workflows.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* What We're Looking For Section */}
          <section className="pb-12 px-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-70" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>What We Value</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">
                  We're Looking for <GradientText>Passionate People</GradientText>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Skills can be learned, but passion and drive are what make the difference.
                </p>
              </motion.div>

              {/* Values Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Code,
                    title: "Technical Excellence",
                    description: "We value developers who write clean, efficient code and are always learning new technologies.",
                    color: "from-blue-500 to-purple-500"
                  },
                  {
                    icon: Brain,
                    title: "Innovation Mindset",
                    description: "We're looking for creative thinkers who can solve complex problems and think outside the box.",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    description: "We believe in the power of teamwork and value people who communicate well and support their colleagues.",
                    color: "from-pink-500 to-orange-500"
                  }
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-black/10 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 shadow-lg relative group overflow-hidden">
                      {/* Gradient accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${value.color} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100`} />
                      
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} bg-opacity-20 border border-white/20 flex items-center justify-center mx-auto mb-4`}>
                          <value.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="pb-16 px-6 relative overflow-hidden">
            {/* Background elements */}            
            <div className="container mx-auto max-w-4xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                
                {/* Contact Card */}
                <Card className="bg-black/10 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 shadow-lg relative overflow-hidden max-w-2xl mx-auto">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                  
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Let's Start a Conversation</h3>
                      <p className="text-muted-foreground mb-6">
                        Send us your resume, portfolio, or just say hello. We'd love to learn about your background, 
                        interests, and how you might contribute to our team.
                      </p>
                      
                      <a href="mailto:careers@docimate.com?subject=Career Inquiry&body=Hi! I'm interested in joining the Docimate team. Here's a bit about myself...">
                        <Button 
                          size="lg" 
                          className="gap-2 group bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30 shadow-lg shadow-primary/20"
                        >
                          <Mail className="h-5 w-5" />
                          Send Us an Email
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                      
                      <p className=" text-primary/80 mt-4">
                        hello@docimate.com
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
}
