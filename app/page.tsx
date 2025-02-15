"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Receipt, FileText, Building, Stethoscope, Zap } from 'lucide-react';

const DocAnalyzerLanding = () => {
  const features = [
    {
      title: "Receipt Scanner",
      description: "Extract itemized expenses, totals, and tax information automatically from any receipt",
      icon: Receipt,
      bgColor: "bg-pink-950",
      hoverBg: "hover:bg-pink-900",
      href: "/demo/receipts"
    },
    {
      title: "T4 Tax Form Reader",
      description: "Automatically extract income, deductions, and tax information from T4 forms",
      icon: FileText,
      bgColor: "bg-blue-950",
      hoverBg: "hover:bg-blue-900",
      href: "/demo/t4-tax"
    },
    {
      title: "Bank Statement Analyzer",
      description: "Transform your bank statements into categorized transaction data and insights",
      icon: Building,
      bgColor: "bg-green-950",
      hoverBg: "hover:bg-green-900",
      href: "/demo/bank-statements"
    },
    {
      title: "Dental Claims Processor",
      description: "Process dental claims forms and extract procedure codes, amounts, and coverage details",
      icon: Stethoscope,
      bgColor: "bg-purple-950",
      hoverBg: "hover:bg-purple-900",
      href: "/demo/dental-claims"
    },
    {
      title: "Utility Bill Scanner",
      description: "Extract usage data, charges, and payment information from any utility bill",
      icon: Zap,
      bgColor: "bg-yellow-950",
      hoverBg: "hover:bg-yellow-900",
      href: "/demo/utility-bills"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gray-900">
        <div className="py-16">
          <div className="container mx-auto px-8 lg:px-16">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Transform Documents Into Data
            </h1>
            <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Our AI-powered document analyzer extracts structured data from any document type.
              Try our specialized demos below to see it in action.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [&>*:last-child]:md:col-span-2 [&>*:last-child]:md:mx-auto lg:[&>*:last-child]:col-span-1">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer transition-all duration-300 ease-in-out 
                         hover:shadow-xl hover:shadow-gray-900
                         hover:-translate-y-2 group relative overflow-hidden
                         bg-gray-800 border-gray-700 w-full max-w-md"
              onClick={() => window.location.href = feature.href}
            >
              <div className={`${feature.bgColor} ${feature.hoverBg} w-12 h-12 rounded-lg 
                              flex items-center justify-center mb-4 transition-colors duration-300`}>
                <feature.icon className="w-6 h-6 text-white transform transition-transform 
                                       duration-300 group-hover:scale-110" />
              </div>

              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-100">
                {feature.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all 
                                     duration-300 transform translate-x-0 group-hover:translate-x-1" />
              </h3>

              <p className="text-gray-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black bg-opacity-40 text-white py-16">
        <div className="container mx-auto px-8 lg:px-16 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 
                         bg-clip-text text-transparent">
            Ready to Try It Yourself?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Select any demo above to see how our AI can transform your documents into actionable data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocAnalyzerLanding;