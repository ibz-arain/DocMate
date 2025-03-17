"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="relative pt-24 pb-16 px-6 overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Logo and newsletter section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center overflow-hidden" style={{ width: '190px', marginLeft: '-16px' }}>
              <Image src="/logo-text.png" alt="DocMate" width={200} height={200} />
            </div>
            
            <p className="text-muted-foreground">
              Automate your workflows with the power of AI. Cut down on manual tasks, increase efficiency, and focus on what matters most.
            </p>
            
            <div className="flex space-x-3">
              {['twitter', 'github', 'linkedin'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
                >
                  <span className="sr-only">{social}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                  >
                    {social === 'twitter' && (
                      <>
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </>
                    )}
                    {social === 'github' && (
                      <>
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </>
                    )}
                    {social === 'linkedin' && (
                      <>
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </>
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Product
                </h4>
                <ul className="space-y-3">
                  {['Learn More', 'Demo', 'API', 'Pricing'].map((item) => (
                    <li key={item}>
                      <Link
                        href={item === 'Learn More' ? '/learn-more' : item === 'Demo' ? '/demo' : item === 'API' ? '/#api' : '/#pricing'} 
                        className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Resources
                </h4>
                <ul className="space-y-3">
                  {['Documentation', 'Guides', 'Blog', 'Support'].map((item) => (
                    <li key={item}>
                      <a 
                        href="#" 
                        className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Company
                </h4>
                <ul className="space-y-3">
                  {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                    <li key={item}>
                      <a 
                        href="#" 
                        className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright and links */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} DocMate</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
              <span>All rights reserved</span>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 