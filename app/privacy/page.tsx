import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-5 py-4 w-full">
          <div className="flex items-center">
            <Link href="/">
              <img src="/applogo.png" alt="Clip My Course" className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Effective Date: December 19, 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              This Privacy Policy describes how <strong>Clip My Course</strong> ("we," "our," or "us") collects, uses, and shares personal information when you use our online course creation and management service. By using our Service, you agree to the collection and use of information in accordance with this policy.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-2">Contact Information:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li><strong>Privacy Email:</strong> privacy@crunchycone.com</li>
                <li><strong>Service:</strong> Clip My Course online course platform</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address, first name, last name</li>
              <li><strong>Authentication Data:</strong> Hashed passwords, authentication tokens</li>
              <li><strong>Profile Data:</strong> User preferences, role assignments, last sign-in timestamps</li>
              <li><strong>Cookie Consent:</strong> Your consent preferences for data processing</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">User-Generated Content</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Course Content:</strong> Courses, lessons, sections, and educational materials you create</li>
              <li><strong>Progress Data:</strong> Learning progress, completion status, watch time, and video positions</li>
              <li><strong>Enrollment Data:</strong> Courses you're enrolled in and completion status</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Device Information:</strong> Browser type, device information, network conditions</li>
              <li><strong>Usage Analytics:</strong> Page load times, error rates, feature usage patterns, navigation flows</li>
              <li><strong>Performance Data:</strong> System performance metrics and technical diagnostics</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Cookies and Tracking</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Authentication Cookies:</strong> Secure HTTP-only cookies for session management</li>
              <li><strong>Consent Cookies:</strong> Your cookie consent preferences</li>
              <li><strong>Analytics Cookies:</strong> Performance and usage tracking (with consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Provide Services:</strong> Create and manage your account, deliver course content, track progress</li>
              <li><strong>Authentication:</strong> Verify your identity and maintain secure sessions</li>
              <li><strong>Service Improvement:</strong> Analyze usage patterns to optimize features and fix technical issues</li>
              <li><strong>Communication:</strong> Send verification emails, password resets, and service notifications</li>
              <li><strong>Legal Compliance:</strong> Meet regulatory requirements and enforce our Terms of Service</li>
              <li><strong>Future Features:</strong> Prepare for potential advertising and monetization features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sharing & Disclosure</h2>
            <h3 className="text-xl font-medium mb-3">Service Providers</h3>
            <p className="mb-3">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Hosting Providers:</strong> Cloud infrastructure services in multiple global regions</li>
              <li><strong>Email Services:</strong> Email delivery providers for notifications</li>
              <li><strong>Analytics Services:</strong> Performance monitoring and usage analytics</li>
              <li><strong>YouTube API:</strong> For course creation from YouTube content (subject to YouTube's privacy policy)</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Legal Requirements</h3>
            <p className="mb-3">We may disclose your information when required by law, such as:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Court orders or legal proceedings</li>
              <li>Government investigations</li>
              <li>Protection of our rights and safety</li>
              <li>Compliance with applicable regulations</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-900 mb-2">No Sale of Personal Information</h3>
              <p className="text-green-800 text-sm">
                We do not currently sell your personal information to third parties. However, we reserve the right to introduce advertising features in the future, which may involve sharing anonymized or aggregated data with advertising partners.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies & Tracking</h2>
            <h3 className="text-xl font-medium mb-3">Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for service functionality and security</li>
              <li><strong>Authentication Cookies:</strong> Secure session management</li>
              <li><strong>Consent Cookies:</strong> Track your privacy preferences</li>
              <li><strong>Analytics Cookies:</strong> Performance and usage monitoring (with consent)</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Cookie Controls</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Consent Management:</strong> Our cookie consent banner allows you to accept or decline non-essential cookies</li>
              <li><strong>Browser Settings:</strong> You can manage cookies through your browser settings</li>
              <li><strong>Opt-Out Options:</strong> Analytics cookies can be disabled without affecting service functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payments</h2>
            <p>
              Currently, our Service is free to use. If we introduce paid features in the future:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Payment processing will be handled by secure third-party providers</li>
              <li>We will not store full credit card numbers</li>
              <li>Payment information will be subject to the privacy policies of our payment processors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <h3 className="text-xl font-medium mb-3">Retention Periods</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active, plus 3 years for legal compliance</li>
              <li><strong>Course Content:</strong> Retained while your account is active, plus 1 year after deletion</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized after 2 years</li>
              <li><strong>Log Data:</strong> Retained for 90 days for security and debugging</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Deletion Process</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Complete data deletion occurs within 30 days of account deletion request</li>
              <li>Publicly shared content may be retained if other users have saved it</li>
              <li>Backup data is automatically deleted within 90 days</li>
              <li>Legal holds may prevent deletion if required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Security</h2>
            <h3 className="text-xl font-medium mb-3">Security Measures</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Password Security:</strong> bcrypt hashing with 10 salt rounds</li>
              <li><strong>Authentication:</strong> JWT tokens with appropriate expiry times</li>
              <li><strong>Data Protection:</strong> HTTP-only cookies, CSRF protection, SameSite policy</li>
              <li><strong>Access Control:</strong> Role-based access control (RBAC) for all operations</li>
              <li><strong>Input Validation:</strong> Zod schema validation for all user inputs</li>
              <li><strong>Database Security:</strong> Soft deletes, parameterized queries via Prisma ORM</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Security Monitoring</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>24/7 system monitoring for security threats</li>
              <li>Automated alerts for suspicious activity</li>
              <li>Regular security audits and updates</li>
              <li>Incident response procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <h3 className="text-xl font-medium mb-3">Global Infrastructure</h3>
            <p className="mb-3">Our Service operates globally with data centers in multiple regions:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Primary Regions:</strong> United States and Europe</li>
              <li><strong>Future Expansion:</strong> Additional regions in Asia and other locations</li>
              <li><strong>Data Processing:</strong> Your data may be processed in countries outside your residence</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Transfer Safeguards</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Data Processing Agreements:</strong> All service providers sign DPAs</li>
              <li><strong>Standard Contractual Clauses:</strong> EU data transfers use appropriate safeguards</li>
              <li><strong>Adequacy Decisions:</strong> Where possible, we use countries with adequacy decisions</li>
              <li><strong>Security Standards:</strong> Consistent security measures across all regions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Your Rights</h2>
            <h3 className="text-xl font-medium mb-3">Data Access Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>View Your Data:</strong> Access all your personal information through your account dashboard</li>
              <li><strong>Request Reports:</strong> Contact us for detailed data reports (fulfilled within 30 days)</li>
              <li><strong>Update Information:</strong> Modify your profile and account settings at any time</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Data Control Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Consent Withdrawal:</strong> Withdraw consent for non-essential data processing</li>
              <li><strong>Cookie Preferences:</strong> Manage cookie settings through our consent banner</li>
              <li><strong>Marketing Opt-Out:</strong> Control marketing communications (when implemented)</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Data Portability & Deletion</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Data Export:</strong> Request your data in portable formats (currently in development)</li>
              <li><strong>Account Deletion:</strong> Request complete account and data deletion (currently in development)</li>
              <li><strong>Recovery Period:</strong> 30-day recovery window after deletion requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <h3 className="text-xl font-medium mb-3">Age Requirements</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Minimum Age:</strong> You must be at least 16 years old to use our Service</li>
              <li><strong>No Child Data:</strong> We do not knowingly collect personal information from children under 16</li>
              <li><strong>Age Verification:</strong> We reserve the right to verify your age and terminate accounts of underage users</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Educational Content</h3>
            <p className="mb-3">Our Service involves creating and sharing educational content, which requires:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Understanding of copyright and intellectual property concepts</li>
              <li>Maturity to handle public content sharing</li>
              <li>Responsibility for educational content creation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <h3 className="text-xl font-medium mb-3">Policy Updates</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may update this Privacy Policy from time to time</li>
              <li>Material changes will be communicated through the Service or email</li>
              <li>Continued use after changes constitutes acceptance of the new policy</li>
              <li>We will indicate the effective date at the top of this policy</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Notification Methods</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Service Notifications:</strong> Updates posted within the application</li>
              <li><strong>Email Notifications:</strong> Important changes communicated via email</li>
              <li><strong>Consent Requirements:</strong> New data uses may require additional consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <h3 className="text-xl font-medium mb-3">Privacy Inquiries</h3>
            <p className="mb-3">For questions about this Privacy Policy or your data:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Email:</strong> privacy@crunchycone.com</li>
              <li><strong>Response Time:</strong> We aim to respond within 48 hours</li>
              <li><strong>Data Requests:</strong> Submit formal requests through the contact email</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Support and Technical Issues</h3>
            <p className="mb-3">For technical support or general questions:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Service Issues:</strong> Use the in-app support features</li>
              <li><strong>Account Problems:</strong> Contact through your account settings</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t">
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
