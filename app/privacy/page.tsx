"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Eye, Lock, Database, Users, Mail } from "lucide-react";
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

export default function PrivacyPage() {
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
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Privacy Policy</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5">
                  <GradientText>Privacy Policy</GradientText>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </p>
              </motion.div>

              {/* Content */}
              <div className="max-w-4xl mx-auto">
                <Card className="bg-black/10 backdrop-blur-sm border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                  
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        At Docimate, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or any other services we provide (collectively, the "Service").
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Service. We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates. You will be deemed to have been made aware of, will be subject to, and will be deemed to have accepted the changes in any revised Privacy Policy by your continued use of the Service after the date such revised Privacy Policy is posted.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Eye className="h-6 w-6 mr-3 text-primary" />
                        Information We Collect
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may collect information about you in a variety of ways. The information we may collect via the Service includes:
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Personal Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service, such as online chat and message boards. You are under no obligation to provide us with personal information of any kind, however your refusal to do so may prevent you from using certain features of the Service.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Derivative Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Information our servers automatically collect when you access the Service, such as your native actions that are integral to the Service, including liking, re-blogging, or replying to a post, as well as other interactions with the Service and other users via server log files.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Financial Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Financial information, such as data related to your payment method (e.g. valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Service. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Facebook Permissions</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The Service may by default access your Facebook basic account information, including your name, email, gender, birthday, current city, and profile picture URL, as well as other information that you choose to make public. We may also request access to other permissions related to your account, such as friends, checkins, and likes, and you may choose to grant or deny us access to each individual permission. For more information regarding Facebook permissions, refer to the Facebook Permissions Reference page.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Data from Social Networks</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        User information from social networking sites, such as Facebook, Google+, Instagram, Pinterest, Twitter, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks. This information may also include the contact information of anyone you invite to use and/or join the Service.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Mobile Device Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Device information such as your mobile device ID number, model, and manufacturer, version of your operating system, phone number, country, location, and any other data you choose to provide.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Third-Party Data</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Information from third parties, such as personal information or network friends, if you connect your account to the third party and grant the Service permission to access this information.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Database className="h-6 w-6 mr-3 text-primary" />
                        Use of Your Information
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-6">
                        <li>Administer sweepstakes, promotions, and contests.</li>
                        <li>Assist law enforcement and respond to subpoena.</li>
                        <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                        <li>Create and manage your account.</li>
                        <li>Deliver targeted advertising, coupons, newsletters, and promotions, and other information regarding our website and mobile application to you.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Enable user-to-user communications.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Service.</li>
                        <li>Generate a personal profile about you to make future visits to the Service more personalized.</li>
                        <li>Increase the efficiency and operation of the Service.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                        <li>Notify you of updates to the Service.</li>
                        <li>Offer new products, services, mobile applications, and/or recommendations to you.</li>
                        <li>Perform other business activities as needed.</li>
                        <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                        <li>Process payments and refunds.</li>
                        <li>Request feedback and contact you about your use of the Service.</li>
                        <li>Resolve disputes and troubleshoot problems.</li>
                        <li>Respond to product and customer service requests.</li>
                        <li>Send you a newsletter.</li>
                        <li>Solicit support for the Service.</li>
                        <li>Target advertisements, coupon offers, and promotions at you.</li>
                        <li>Update the Service.</li>
                      </ul>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Lock className="h-6 w-6 mr-3 text-primary" />
                        Disclosure of Your Information
                      </h2>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                      </p>

                      <h3 className="text-xl font-semibold mb-3">By Law or to Protect Rights</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation. This includes exchanging information with other entities for fraud protection and credit risk reduction.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Third-Party Service Providers</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Marketing Communications</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Interactions with Other Users</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you interact with other users of the Service, those users may see your name, profile photo, and descriptions of your activity, including sending invitations to other users, chatting with other users, liking posts, following blogs.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Online Postings</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        When you post comments, contributions or other content to the Service, your posts may be viewed by all users and may be publicly distributed outside the Service in perpetuity.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Third-Party Advertisers</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may use third-party advertising companies to serve ads when you visit the Service. These companies may use information about your visits to the Service and other websites that are contained in web cookies and other tracking technologies in order to provide advertisements about goods and services of interest to you.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Affiliates</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include our parent company and any subsidiaries, joint venture partners or other companies that we control or that are under common control with us.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Business Partners</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may share your information with our business partners to offer you certain products, services or promotions.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Other Third Parties</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may share your information with advertisers and investors for the purpose of conducting general business analysis. We may also share your information with such third parties for marketing purposes, as permitted by law.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Sale or Bankruptcy</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If we reorganize or sell all or a portion of our assets, undergo a merger, or are acquired by another entity, we may transfer your information to the successor entity. If we go out of business or enter bankruptcy, your information would be an asset transferred or acquired by a third party. You acknowledge that such transfers may occur and that the transferee may decline to honor commitments we made in this Privacy Policy.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Users className="h-6 w-6 mr-3 text-primary" />
                        Tracking Technologies
                      </h2>
                      
                      <h3 className="text-xl font-semibold mb-3">Cookies and Web Beacons</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience. When you access the Service, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the functionality of the Service. We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Internet-Based Advertising</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may also use third-party software to serve ads on the Service, implement email marketing campaigns, and manage other interactive marketing initiatives. This third-party software may use cookies or similar tracking technology to help manage and optimize your online experience with us. For more information about opting-out of interest-based ads, visit the Network Advertising Initiative Opt-Out Tool or Digital Advertising Alliance Opt-Out Tool.
                      </p>

                      <h3 className="text-xl font-semibold mb-3">Website Analytics</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We may also partner with selected third-party vendors, such as Google Analytics, to allow tracking technologies and remarketing services on the Service through the use of first party cookies and third-party cookies, to, among other things, analyze and track users' use of the Service, determine the popularity of certain content and better understand online activity. By accessing the Service, you consent to the collection and use of your information by these third-party vendors. You are encouraged to review their privacy policy and contact them directly for responses to your questions. We do not transfer personal information to these third-party vendors. However, if you do not want any information to be collected and used by tracking technologies, you can visit the third-party vendor or the Network Advertising Initiative Opt-Out Tool or Digital Advertising Alliance Opt-Out Tool.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Third-Party Websites</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        The Service may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Service, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information. Before visiting and providing any information to any third-party websites, you should inform yourself of the privacy policies and practices (if any) of the third party responsible for that website, and should take those steps necessary to, in your discretion, protect the privacy of your information. We are not responsible for the content or privacy and security practices and policies of any third parties, including other sites, services or applications that may be linked to or from the Service.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Security of Your Information</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, we cannot guarantee complete security if you provide personal information.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Policy for Children</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Controls for Do-Not-Track Features</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. No uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Policy.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Options Regarding Your Information</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You may at any time review or change the information in your account or terminate your account by:
                      </p>

                      <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-4">
                        <li>Logging into your account settings and updating your account</li>
                        <li>Contacting us using the contact information provided below</li>
                        <li>Using the unsubscribe link in the emails we send</li>
                      </ul>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, some information may be retained in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our Terms of Use and/or comply with legal requirements.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You have the right to access your personal information, request corrections to inaccurate information, and withdraw consent for the collection, use, or disclosure of your personal information. You also have the right to file a complaint with the relevant privacy authority if you believe we have not handled your personal information in accordance with applicable privacy laws, including PIPEDA.
                      </p>

                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you are under 18 years of age and have a registered account with the Service, you have the right to request removal of personal data that you have posted on the Service. To request removal of such data, please contact us using the contact information provided below, and include the email address associated with your account. We will make sure the data is not publicly displayed on the Service, but please be aware that the data may not be completely or comprehensively removed from our systems.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        If you have questions or comments about this Privacy Policy, please contact us at:
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
