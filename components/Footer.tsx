"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="relative pt-16 pb-16 px-6 overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Mobile version - hidden on desktop */}
        <div className="block lg:hidden">
          {/* Mobile logo and description */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center overflow-hidden">
                <Image src="/logo-bird.png" alt="Docimate" width={40} height={40} />
                <Image src="/logo-text.png" alt="Docimate" width={150} height={40} />
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-6">
            Automate your workflows with the power of AI. Cut down on manual tasks, increase efficiency, and focus on what matters most.
            </p>
            
            {/* Mobile email */}
            <div className="mb-6">
              <a 
                href="mailto:docimate@ibrahimarain.com?subject=General Inquiry" 
                className="text-primary hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                docimate@ibrahimarain.com
              </a>
            </div>
            
            {/* Mobile social links */}
            <div className="flex justify-center">
              <a 
                href="https://www.linkedin.com/company/docimate" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Mobile navigation - 2 columns */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-sm mb-4 flex items-center">
                <span className="w-1 h-1 rounded-full bg-primary mr-2"></span>
                Product
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Use Cases', href: '/use-cases' },
                  { label: 'Changelog', href: '/changelog' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-white transition-colors duration-300 text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-4 flex items-center">
                <span className="w-1 h-1 rounded-full bg-primary mr-2"></span>
                Resources
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Documentation', href: '/docs' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Careers', href: '/careers' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-white transition-colors duration-300 text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Desktop version - hidden on mobile */}
        <div className="hidden lg:block">
          {/* Logo and newsletter section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center overflow-hidden">
                <Image src="/logo-bird.png" alt="Docimate" width={50} height={50} />
                <Image src="/logo-text.png" alt="Docimate" width={200} height={50} />
              </div>
              
              <p className="text-muted-foreground">
                Automate your workflows with the power of AI. Cut down on manual tasks, increase efficiency, and focus on what matters most.
              </p>
              
              {/* Desktop email */}
              <div>
                Contact us: <a 
                  href="mailto:docimate@ibrahimarain.com?subject=General Inquiry" 
                  className="text-primary hover:text-white transition-colors duration-300 font-medium"
                >
                  docimate@ibrahimarain.com
                </a>
              </div>
              
              <div className="flex">
                <a 
                  href="https://www.linkedin.com/company/docimate" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300 group"
                >
                  <span className="sr-only">LinkedIn</span>
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
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                    Product
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { label: 'Pricing', href: '/pricing' },
                      { label: 'Use Cases', href: '/use-cases' },
                      { label: 'Changelog', href: '/changelog' },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                        >
                          <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                    Resources
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { label: 'Documentation', href: '/docs' },
                      { label: 'About Us', href: '/about' },
                      { label: 'Careers', href: '/careers' }
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-white transition-colors duration-300 flex items-center group"
                        >
                          <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright and links */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Docimate</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60"></span>
              <span>All rights reserved</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' }
              ].map((item, index) => (
                <div key={item.label} className="flex items-center">
                  <a 
                    href={item.href} 
                    className="text-sm text-muted-foreground hover:text-white transition-colors duration-300 relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"></span>
                  </a>
                  {index < 2 && (
                    <span className="ml-6 text-muted-foreground/40">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 