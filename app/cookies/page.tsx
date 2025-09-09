"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Shield, Eye, Database, Mail } from "lucide-react";
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

export default function CookiesPage() {
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
                  <Cookie className="h-4 w-4 mr-2" />
                  <span>Cookie Policy</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  <GradientText>Cookie Policy</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  This policy explains how we use cookies and similar technologies on our website to enhance your experience.
                </p>
              </motion.div>

              {/* Content */}
              <div className="max-w-4xl mx-auto">
                <Card className="bg-black/10 backdrop-blur-sm border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                  
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        This Cookie Policy explains what cookies are and how we use them on our website docimate.com (the "Service"). You should read this policy so you can understand what type of cookies we use, the information we collect using cookies and how that information is used.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-6">
                        By using our Service, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to our use of cookies, you should set your browser settings accordingly or not use our Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Cookie className="h-6 w-6 mr-3 text-primary" />
                        What Are Cookies
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies allow a website to recognize a user's device and remember information about their visit, such as their preferred language and other settings.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or mobile device when you go offline, while session cookies are deleted as soon as you close your web browser. We use both persistent and session cookies on our Service.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Cookies can also be "first-party" or "third-party" cookies. First-party cookies are set by the website you are visiting, while third-party cookies are set by a domain other than the one you are visiting. We use both first-party and third-party cookies on our Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Settings className="h-6 w-6 mr-3 text-primary" />
                        How We Use Cookies
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We use cookies for several reasons. Some cookies are required for technical reasons in order for our Service to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our Service. Third parties serve cookies through our Service for advertising, analytics and other purposes.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We use cookies to:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>Remember your preferences and settings</li>
                        <li>Keep you logged in to our Service</li>
                        <li>Understand how you use our Service</li>
                        <li>Improve our Service and develop new features</li>
                        <li>Show you relevant content and advertisements</li>
                        <li>Analyze traffic and usage patterns</li>
                        <li>Prevent fraud and ensure security</li>
                        <li>Provide customer support</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Database className="h-6 w-6 mr-3 text-primary" />
                        Types of Cookies We Use
                      </h2>
                      
                      <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These cookies are necessary for the Service to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Performance Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Functionality Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These cookies enable the Service to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies then some or all of these services may not function properly.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Targeting Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Social Media Cookies</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests. This may impact the content and messages you see on other websites you visit. If you do not allow these cookies you may not be able to use or see these sharing tools.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Eye className="h-6 w-6 mr-3 text-primary" />
                        Third-Party Cookies
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on. These third-party cookies are used to provide content, including advertisements that are relevant to your interests. They also help measure the effectiveness of advertising campaigns.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Some of the third-party services we use include:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li><strong>Google Analytics:</strong> We use Google Analytics to analyze the use of our Service. Google Analytics gathers information about website use by means of cookies. The information gathered relating to our Service is used to create reports about the use of our Service. Google's privacy policy is available at: https://www.google.com/policies/privacy/</li>
                        <li><strong>Google AdSense:</strong> We use Google AdSense to display advertisements on our Service. Google AdSense uses cookies to serve ads based on your prior visits to our Service or other websites. You can opt out of personalized advertising by visiting: https://www.google.com/settings/ads</li>
                        <li><strong>Social Media Platforms:</strong> We may use social media cookies from platforms like Facebook, Twitter, LinkedIn, and others to enable social sharing and integration features.</li>
                        <li><strong>Payment Processors:</strong> We may use cookies from payment processors like Stripe, PayPal, or others to process payments securely.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Shield className="h-6 w-6 mr-3 text-primary" />
                        Managing Cookies
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Settings. You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Service though your access to some functionality and areas of our Service may be restricted.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Browser Settings</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Most web browsers allow you to control cookies through their settings preferences. However, limiting the ability of websites to set cookies may worsen your overall user experience, and in some cases, prevent you from using certain features of our Service.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Mobile Devices</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you are using a mobile device, you can control cookies through your device settings. Each mobile device has different settings, so you should check your device's manual for more information.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Opt-Out Links</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You can opt out of targeted advertising by visiting:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>Digital Advertising Alliance: http://optout.aboutads.info/</li>
                        <li>Network Advertising Initiative: http://optout.networkadvertising.org/</li>
                        <li>European Interactive Digital Advertising Alliance: http://www.youronlinechoices.eu/</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Cookie Retention</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The length of time a cookie will stay on your computer or mobile device depends on whether it is a "persistent" or "session" cookie. Session cookies will only stay on your device until you stop browsing. Persistent cookies stay on your computer or mobile device until they expire or are deleted.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We use persistent cookies for a variety of purposes, such as to store your preferences so that they are available for the next visit, and to keep a more accurate account of how often you visit our Service, how often you return, how your use of the Service may vary over time, and the effectiveness of advertising.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The date at the top of this Cookie Policy indicates when it was last updated. Your continued use of our Service after any such changes constitutes your acceptance of the new Cookie Policy.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">More Information</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you would like to learn more about cookies and how they work, you can visit:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>All About Cookies: https://www.allaboutcookies.org/</li>
                        <li>Your Online Choices: https://www.youronlinechoices.com/</li>
                        <li>Internet Advertising Bureau: https://www.iab.com/</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you have any questions about our use of cookies or other technologies, please contact us:
                      </p>

                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <p className="text-muted-foreground">
                          <strong>Email:</strong> hello@docimate.com<br />
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
