"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Building2, ArrowRight, Github, Linkedin, FileText, Brain, Zap, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

export default function AboutPage() {
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

          {/* Company Overview Section */}
          <section className="pt-28 pb-12 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>Our Story</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  <GradientText>About Us</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Where we come from, where we are, and where we're going.
                </p>
              </motion.div>

              {/* Mac Terminal Style Mockup for Mission */}
              <div className="mb-0 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)] relative"
                >
                  {/* Decorative code lines in background */}
                  <div className="absolute inset-0 opacity-10 overflow-hidden">
                    <div className="text-xs text-white/50 font-mono p-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="opacity-30">
                          <span className="text-green-400">const</span> <span className="text-blue-400">mission</span> = {'{'}
                          <br />{'  '}<span className="text-yellow-400">vision</span>: <span className="text-primary">'Automate document processing'</span>,
                          <br />{'  '}<span className="text-yellow-400">goal</span>: <span className="text-primary">'Save time and reduce errors'</span>
                          <br />{'}'}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Terminal header */}
                  <div className="flex items-center px-4 py-2 border-b border-white/20 bg-black relative z-10">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs font-medium text-white/90 flex-1 flex items-center">
                      <span className="text-primary font-bold">docmate</span>
                      <span className="mx-1 text-white/60">:</span>
                      <span className="text-blue-400">~/mission</span>
                      <span className="ml-1 text-white/60">$</span>
                    </div>
                  </div>
                  
                  {/* Terminal content */}
                  <div className="p-5 font-mono text-md bg-gradient-to-b from-black to-gray-900/80 relative z-10">
                    {/* Command */}
                    <div className="flex items-center text-white/90 mb-3">
                      <span className="text-green-400 mr-2">$</span>
                      <span className="text-primary mr-1">cat</span>
                      <span className="text-white/90">mission.md</span>
                    </div>
                    
                    {/* Mission content */}
                    <div className="bg-black/30 rounded-md border border-white/10 p-4 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-primary mb-3">Our Mission</h3>
                      <p className="text-white/80 mb-2">
                        DocMate emerged from a simple observation: businesses spend countless hours manually processing documents. 
                        We believed there had to be a better way to do this.
                      </p>
                      <p className="text-white/80">
                        We designed a platform that uses AI to automate document processing, saving businesses time and reducing errors.
                        We're on a mission to make this the new standard.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Gradient Divider - Enhanced */}
          <div className="relative h-px w-full max-w-7xl mx-auto my-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="absolute -top-3 -bottom-3 left-0 right-0 bg-gradient-to-b from-background via-transparent to-background" />
            
            {/* Decorative dots */}
            <div className="absolute -ml-1 -mt-1 left-1/2 top-1/2 w-2 h-2 rounded-full bg-primary/50" />
            <div className="absolute -ml-4 -mt-1 left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-primary/30" />
            <div className="absolute ml-2 -mt-1 left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-primary/30" />
          </div>

          {/* Hackathon Victory Section - Enhanced */}
          <section className="py-12 px-6 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-70" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span>WinHacks 2025</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  It all Started with a <GradientText>Hackathon</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Where innovation met recognition
                </p>
              </motion.div>

              {/* Terminal Style Container */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-gray-900 to-black shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)] relative"
              >
                {/* Subtle trophy background */}
                <div className="absolute right-4 bottom-4 opacity-5">
                  <Trophy className="w-40 h-40 text-primary" />
                </div>
                
                {/* Terminal header */}
                <div className="flex items-center px-4 py-2 border-b border-white/20 bg-black relative z-10">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs font-medium text-white/90 flex-1 flex items-center">
                    <span className="text-primary font-bold">winhacks</span>
                    <span className="mx-1 text-white/60">:</span>
                    <span className="text-blue-400">~/victory</span>
                    <span className="ml-1 text-white/60">$</span>
                  </div>
                </div>

                {/* Terminal content */}
                <div className="p-5 font-mono text-md bg-gradient-to-b from-black to-gray-900/80 relative z-10">
                  {/* Command */}
                  <div className="flex items-center text-white/90 mb-3">
                    <span className="text-green-400 mr-2">$</span>
                    <span className="text-primary mr-1">cat</span>
                    <span className="text-white/90">we_took_every_award_home.md</span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    {/* Description */}
                    <div className="bg-black/30 rounded-md border border-white/10 p-4 backdrop-blur-sm">
                      <p className="text-white/80 text-md leading-relaxed mb-4">
                        At WinHacks 2025, our team — Ibrahim Arain, Ahmad Arain, Mohammad Affan Shahid, and Sahaj Kataria — outperformed 29 competing teams to secure first place with DocMate! 
                        Our innovative project revolutionizes document processing by using natural language processing to transform documents and finances into structured, actionable data for 
                        efficient, automated workflows.
                      </p>
                      <p className="text-white/80 mb-4">
                        Through hard work and collaboration, we developed a solution that simplifies documents into structured tables and other usable formats, making data extraction seamless and improving usability. 
                        Our platform's practical application and exceptional user experience earned us multiple awards and recognition from judges and participants alike.
                      </p>

                      {/* Award Tags */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 group hover:bg-primary/20 transition-colors duration-300">
                            <Trophy className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
                            <span className="font-medium text-white/90">Overall Winner</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 group hover:bg-primary/20 transition-colors duration-300">
                            <Trophy className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
                            <span className="font-medium text-white/90">Best Expense Tracker</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 group hover:bg-primary/20 transition-colors duration-300">
                            <Trophy className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
                            <span className="font-medium text-white/90">Best User Experience</span>
                        </div>
                      </div>
                    </div>

                    {/* Images - Enhanced layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Image
                          src="/about/group-photo.jpg"
                          alt="DocMate team at WinHacks 2025"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 z-20 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Our Team
                        </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Image
                          src="/about/trophies.png"
                          alt="WinHacks 2025 Awards"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 z-20 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          WinHacks 2025 Awards
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Team Section - Enhanced */}
          <section className="py-16 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            {/* Floating shapes */}
            <motion.div 
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/5"
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 0.2, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{ filter: "blur(40px)" }}
            />
            
            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-14"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Our Founders</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Meet the <GradientText>Team</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  The great minds behind DocMate.
                </p>
              </motion.div>

              {/* Team grid with animated cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  {
                    name: "Ibrahim Arain",
                    role: "Founder & Lead Software Developer",
                    image: "/about/ibrahim.jpg",
                    github: "https://github.com/ibz-arain",
                    linkedin: "https://linkedin.com/in/ibz-arain",
                    accent: "from-blue-500 to-purple-500"
                  },
                  {
                    name: "Ahmad Arain",
                    role: "Co-founder & Software Developer",
                    image: "/about/ahmad.jpeg",
                    github: "https://github.com/AhmadArain5",
                    linkedin: "https://linkedin.com/in/ahmad-arain-9b3165286",
                    accent: "from-purple-500 to-pink-500"
                  },
                  {
                    name: "Affan Shahid",
                    role: "Software Developer",
                    image: "/about/affan.jpeg",
                    github: "https://github.com/affan0404",
                    linkedin: "https://linkedin.com/in/mohammad-affan-shahid-26372a2b2",
                    accent: "from-pink-500 to-orange-500"
                  },
                  {
                    name: "Sahaj Kataria",
                    role: "Software Developer",
                    image: "/about/sahaj.jpeg",
                    github: "https://github.com/sahajKat",
                    linkedin: "https://linkedin.com/in/sahaj-kataria",
                    accent: "from-orange-500 to-blue-500"
                  }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-black/10 backdrop-blur-sm border border-white/10 hover:border-primary/20 transition-all duration-300 shadow-lg relative group overflow-hidden">
                      {/* Top border gradient - moved inside with overflow hidden on card */}
                      <div className={`absolute top-0 left-1 right-1 h-1 bg-gradient-to-r ${member.accent} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full`} />
                      
                      {/* Colored gradient accent - restored */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${member.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Image with animated border */}
                        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-primary/5 ring-1 ring-white/10 group-hover:ring-primary/30 transition-all duration-300">
                          <Image
                            src={member.image}
                            alt={`${member.name} profile`}
                            fill
                            className="object-cover"
                            style={member.name === "Affan Shahid" ? { objectPosition: "center top" } : {}}
                          />
                        </div>
                        
                        <div className="space-y-2 text-center mb-6">
                          <h3 className="text-xl font-bold">{member.name}</h3>
                          <p className={`font-medium bg-gradient-to-r ${member.accent} bg-clip-text text-transparent`}>{member.role}</p>
                        </div>
                        
                        {/* Social links with hover effects */}
                        <div className="flex justify-center space-x-3 mt-auto pt-4 border-t border-white/5">
                          <a href={member.github} target="_blank" rel="noopener noreferrer" className="relative z-10">
                            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                              <Github className="h-5 w-5" />
                            </Button>
                          </a>
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="relative z-10">
                            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                              <Linkedin className="h-5 w-5" />
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
} 