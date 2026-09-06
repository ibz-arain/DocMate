"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, Shield, Users, Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gradient text component
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 ${className}`}>
      {children}
    </span>
  );
};

export default function TermsPage() {
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
          <section className="pt-32 pb-12 px-6 relative z-10">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <Scale className="h-4 w-4 mr-2" />
                  <span>Terms of Service</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  <GradientText>Terms of Service</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Please read these terms carefully before using our service. By using Docimate, you agree to be bound by these terms.
                </p>
              </motion.div>

              {/* Content */}
              <div className="max-w-4xl mx-auto">
                <Card className="bg-black/10 backdrop-blur-sm border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                  
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        These Terms of Service ("Terms") govern your use of our website located at docimate.ibrahimarain.com (the "Service") operated by Docimate Inc. ("us", "we", or "our"). Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound of them. If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing us at docimate@ibrahimarain.com so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use the Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <FileText className="h-6 w-6 mr-3 text-primary" />
                        Acceptance of Terms
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        By accessing and using this Service, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this Service's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We reserve the right to change these conditions from time to time as it sees fit and your continued use of the service will signify your acceptance of any adjustment to these terms. If there are any changes to our privacy policy, we will announce that these changes have been made on our home page and on other key pages on our site. If there are any changes in how we use our site customers' Personally Identifiable Information, notification by e-mail or postal mail will be made to those affected by this change. Any changes to our privacy policy will be posted on our web site 30 days prior to these changes taking place. You are therefore advised to re-read this statement on a regular basis.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Users className="h-6 w-6 mr-3 text-primary" />
                        Use License
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Permission is granted to temporarily download one copy of the materials on Docimate's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>modify or copy the materials</li>
                        <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                        <li>attempt to decompile or reverse engineer any software contained on Docimate's website</li>
                        <li>remove any copyright or other proprietary notations from the materials</li>
                      </ul>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        This license shall automatically terminate if you violate any of these restrictions and may be terminated by Docimate at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-3 text-primary" />
                        Disclaimer
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The materials on Docimate's website are provided on an 'as is' basis. Docimate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Further, Docimate does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Limitations</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        In no event shall Docimate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Docimate's website, even if Docimate or a Docimate authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Accuracy of Materials</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The materials appearing on Docimate's website could include technical, typographical, or photographic errors. Docimate does not warrant that any of the materials on its website are accurate, complete or current. Docimate may make changes to the materials contained on its website at any time without notice. However Docimate does not make any commitment to update the materials.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Links</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Docimate has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Docimate of the site. Use of any such linked website is at the user's own risk.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Modifications</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Docimate may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These terms and conditions are governed by and construed in accordance with the laws of Ontario, Canada. You irrevocably submit to the exclusive jurisdiction of the courts of Ontario, Canada.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Prohibited Uses</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>In any way that violates any applicable federal, provincial, territorial, or international law or regulation</li>
                        <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content, asking for personally identifiable information, or otherwise</li>
                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation</li>
                        <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
                        <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm the Company or users of the Service or expose them to liability</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for all activities that occur under your password, whether your password is with our Service or a third-party service.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar or obscene.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Content</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. You agree that this license includes the right for us to make your Content available to other users of the Service, who may also use your Content subject to these Terms.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Intellectual Property Rights</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Other than the content you own, under these Terms, Docimate and/or its licensors own all the intellectual property rights and materials contained in this Service. You are granted limited license only for purposes of viewing the material contained on this Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Restrictions</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You are specifically restricted from all of the following:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>publishing any Service material in any other media</li>
                        <li>selling, sublicensing and/or otherwise commercializing any Service material</li>
                        <li>publicly performing and/or showing any Service material</li>
                        <li>using this Service in any way that is or may be damaging to this Service</li>
                        <li>using this Service contrary to applicable laws and regulations, or in any way may cause harm to the Service, or to any person or business entity</li>
                        <li>engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Service</li>
                        <li>using this Service to engage in any advertising or marketing</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Termination</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You agree to defend, indemnify, and hold harmless Docimate and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms, or c) Content posted on the Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>excludes all representations and warranties relating to this Service and its contents or which is or may be provided by any affiliates or any other third party, including in relation to any inaccuracies or omissions in this Service and/or the Company's literature; and</li>
                        <li>excludes all liability for damages arising out of or in connection with your use of this Service. This includes, without limitation, direct loss, loss of business or profits (whether or not the loss of such profits was foreseeable, arose in the normal course of things or you have advised this Company of the possibility of such potential loss), damage caused to your computer, computer software, systems and programs and the data thereon or any other direct or indirect, consequential and incidental damages.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you have any questions about these Terms of Service, please contact us:
                      </p>

                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-muted-foreground">
                          <strong>Email:</strong> docimate@ibrahimarain.com<br />
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-sm text-muted-foreground">
                        <strong>Last updated:</strong> August 2025
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </ScrollArea>
    </div>
  );
}
