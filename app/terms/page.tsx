import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
              <Button variant="ghost" className="text-gray-700 hover:text-red-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: December 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Clip My Course ("Service"), you agree to be bound by these Terms of Use ("Terms"). 
              If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-4">
              You must be at least 16 years old to use this Service. By using the Service, you represent and warrant 
              that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Age Limitation Justification:</h3>
              <p className="text-blue-800 text-sm">
                We set the minimum age at 16 because the Service involves creating and sharing educational content, 
                requires understanding of copyright and intellectual property concepts, and involves public content sharing 
                that requires maturity and responsibility.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Accounts & Security</h2>
            <h3 className="text-xl font-medium mb-3">Account Creation</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must provide accurate, current, and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You may not share your account with others or allow others to access your account</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Security Obligations</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>We use industry-standard security measures including bcrypt password hashing and JWT tokens</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscriptions, Billing & Payments</h2>
            <p>
              Currently, this Service is free to use. We reserve the right to introduce paid features or subscriptions 
              in the future. If we do so, we will provide notice and obtain your consent before charging any fees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. User Content & License</h2>
            <h3 className="text-xl font-medium mb-3">Your Content</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You retain ownership of content you create, including courses and course materials</li>
              <li>You grant us a worldwide, non-exclusive, royalty-free license to use, store, and display your content to provide the Service</li>
              <li>You represent that you have all necessary rights to grant this license</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Course Sharing</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You may choose to share your courses publicly using the Service's sharing features</li>
              <li>Shared courses are accessible to anyone with the sharing link</li>
              <li>You can control the visibility and sharing settings of your courses</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">YouTube Integration</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service integrates with YouTube to allow you to create courses from YouTube videos and playlists</li>
              <li>You must comply with YouTube's Terms of Service when using this integration</li>
              <li>We are not responsible for YouTube's content policies or any changes to YouTube's API</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <h3 className="text-xl font-medium mb-3">Prohibited Activities</h3>
            <p className="mb-3">You may not use the Service to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Share harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use the Service for commercial purposes without authorization</li>
              <li>Reverse engineer or attempt to extract source code from the Service</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Content Standards</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>All content must be appropriate for educational purposes</li>
              <li>Content must not contain hate speech, violence, or illegal material</li>
              <li>You are responsible for ensuring your content complies with applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <h3 className="text-xl font-medium mb-3">Our Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service, including its software, design, and content, is owned by us or our licensors</li>
              <li>These Terms do not grant you any rights to our intellectual property beyond what is necessary to use the Service</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Your Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You retain ownership of your original content</li>
              <li>You may use the Service to create and share educational content</li>
              <li>You may not claim ownership of the Service's features or functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
            <h3 className="text-xl font-medium mb-3">YouTube Integration</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service integrates with YouTube's Data API v3</li>
              <li>YouTube's Terms of Service and Privacy Policy apply to your use of YouTube content</li>
              <li>We are not responsible for YouTube's services or any changes to their API</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">OAuth Providers</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service supports authentication through Google OAuth</li>
              <li>These third-party providers have their own terms and privacy policies</li>
              <li>We are not responsible for the practices of these third-party services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. APIs & Rate Limits</h2>
            <h3 className="text-xl font-medium mb-3">API Usage</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service provides RESTful APIs for course management</li>
              <li>We reserve the right to implement rate limiting to ensure fair usage</li>
              <li>Excessive API usage may result in temporary or permanent restrictions</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">YouTube API</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>YouTube API usage is subject to YouTube's quotas and rate limits</li>
              <li>We are not responsible for YouTube API limitations or changes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Beta Features & Changes</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may offer beta features that are still in development</li>
              <li>Beta features may be unstable or change without notice</li>
              <li>We reserve the right to modify, suspend, or discontinue any features of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimers</h2>
            <h3 className="text-xl font-medium mb-3">Service Availability</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>The Service is provided "as is" and "as available"</li>
              <li>We do not guarantee uninterrupted access to the Service</li>
              <li>We may perform maintenance that temporarily affects availability</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Content Accuracy</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We do not verify the accuracy, completeness, or usefulness of user-generated content</li>
              <li>Users are responsible for evaluating the quality and accuracy of course content</li>
              <li>We are not liable for any errors or omissions in user content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, INCURRED 
                BY YOU OR ANY THIRD PARTY, WHETHER IN AN ACTION IN CONTRACT OR TORT, EVEN IF WE HAVE BEEN ADVISED OF 
                THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Clip My Course and its officers, directors, employees, and agents 
              from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your 
              use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Termination</h2>
            <h3 className="text-xl font-medium mb-3">Your Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You may terminate your account at any time by contacting us</li>
              <li>Upon termination, your access to the Service will cease immediately</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Our Rights</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may terminate or suspend your account for violations of these Terms</li>
              <li>We may terminate the Service or your access with reasonable notice</li>
              <li>Upon termination, we may delete your account and associated data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Governing Law; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Israel. Any disputes arising 
              from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with 
              the rules of the Israeli Institute of Commercial Arbitration (IICA) or similar Israeli arbitration provider.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. Export Controls</h2>
            <p>
              You may not use or export the Service in violation of applicable export laws and regulations. You represent 
              that you are not located in a country that is subject to a U.S. Government embargo or that has been designated 
              by the U.S. Government as a "terrorist supporting" country.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">17. Notices; Contact</h2>
            <h3 className="text-xl font-medium mb-3">Notices</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may provide notices through the Service, email, or other reasonable means</li>
              <li>Notices are effective when sent or posted</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Contact Information</h3>
            <p>
              For questions about these Terms or the Service, please contact us at{' '}
              <a href="mailto:Avi@crunchycone.com" className="text-blue-600 hover:underline">
                Avi@crunchycone.com
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">18. Changes to These Terms</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may update these Terms from time to time</li>
              <li>We will notify you of material changes through the Service or email</li>
              <li>Your continued use of the Service after changes constitutes acceptance of the new Terms</li>
              <li>We will indicate the date of the last update at the top of these Terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">19. Account Management & Security</h2>
            <h3 className="text-xl font-medium mb-3">Account Security Requirements</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Two-factor authentication may be required for enhanced security</li>
              <li>Regular password updates may be enforced</li>
              <li>Suspicious activity may trigger additional verification</li>
              <li>You must use a strong, unique password for your account</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Account Suspension & Reactivation</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may suspend accounts for Terms violations or suspicious activity</li>
              <li>Suspension criteria and duration will be communicated via email</li>
              <li>Reactivation process requires verification of identity and compliance</li>
              <li>Repeated violations may result in permanent account termination</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Multiple Account Restrictions</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>One account per person is allowed</li>
              <li>Creating multiple accounts may result in suspension of all accounts</li>
              <li>Business accounts may be allowed with prior written approval</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">20. Data Retention & Deletion</h2>
            <h3 className="text-xl font-medium mb-3">Data Retention Periods</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Account Data:</strong> Retained for 3 years after account deletion for legal compliance</li>
              <li><strong>Course Content:</strong> Retained for 1 year after account deletion unless shared publicly</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized after 2 years</li>
              <li><strong>Log Data:</strong> Retained for 90 days for security and debugging</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Data Deletion Process</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Complete data deletion occurs within 30 days of account deletion request</li>
              <li>Publicly shared content may be retained if other users have saved it</li>
              <li>Backup data is automatically deleted within 90 days</li>
              <li>Legal holds may prevent deletion if required by law</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Legal Compliance:</h3>
              <p className="text-blue-800 text-sm">
                These retention periods comply with Israeli data protection laws and international standards. 
                We retain data only as long as necessary for service provision, legal compliance, and security.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">21. Data Breach Notification</h2>
            <h3 className="text-xl font-medium mb-3">Breach Detection & Response</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We monitor systems 24/7 for security breaches and unauthorized access</li>
              <li>Automated alerts trigger immediate investigation of suspicious activity</li>
              <li>Security team responds within 1 hour of breach detection</li>
              <li>Incident response plan follows industry best practices</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">User Notification</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>High Risk:</strong> Notification within 24 hours for sensitive data breaches</li>
              <li><strong>Medium Risk:</strong> Notification within 72 hours for standard breaches</li>
              <li><strong>Low Risk:</strong> Notification within 7 days for minor incidents</li>
              <li>Notifications include breach details, affected data, and recommended actions</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Regulatory Reporting</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Israeli Privacy Protection Authority notified within 72 hours of significant breaches</li>
              <li>International authorities notified as required by applicable laws</li>
              <li>Public disclosure made when required by law or in public interest</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">22. User Data Rights & Export</h2>
            <h3 className="text-xl font-medium mb-3">Right to Access</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You can view all your personal data through your account dashboard</li>
              <li>Request detailed data report by contacting support</li>
              <li>Data access requests fulfilled within 30 days</li>
              <li>No fees for reasonable data access requests</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Right to Export</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Export your course data in JSON, CSV, or PDF formats</li>
              <li>Export includes all courses, lessons, progress, and settings</li>
              <li>Data export requests fulfilled within 7 days</li>
              <li>Exports are free and unlimited for active users</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Right to Correction</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Update your profile information at any time</li>
              <li>Request correction of inaccurate data through support</li>
              <li>Corrections made within 7 days of verification</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Right to Deletion</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Delete your account and all associated data</li>
              <li>Deletion requests processed within 30 days</li>
              <li>Confirmation sent when deletion is complete</li>
              <li>Recovery possible within 30 days of deletion request</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">23. Third-Party Data Sharing & Protection</h2>
            <h3 className="text-xl font-medium mb-3">Service Providers</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Hosting:</strong> Vercel/Netlify for application hosting (EU/US data centers)</li>
              <li><strong>Database:</strong> SQLite local storage with optional cloud backup</li>
              <li><strong>Email:</strong> Resend/SendGrid for transactional emails</li>
              <li><strong>Analytics:</strong> Vercel Analytics for performance monitoring</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Data Protection Measures</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>All third-party providers sign Data Processing Agreements (DPAs)</li>
              <li>Data encryption in transit and at rest</li>
              <li>Regular security audits of third-party services</li>
              <li>Immediate termination of providers who fail security standards</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">YouTube Integration</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>YouTube Data API v3 used for course creation</li>
              <li>No personal data shared with YouTube beyond API requirements</li>
              <li>YouTube's privacy policy applies to their services</li>
              <li>We do not sell or share user data with YouTube</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">OAuth Providers</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Google OAuth for authentication only</li>
              <li>Minimal data requested: email and basic profile</li>
              <li>No access to Google Drive, Calendar, or other services</li>
              <li>OAuth tokens stored securely and encrypted</li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-900 mb-2">Your Protection:</h3>
              <p className="text-green-800 text-sm">
                We never sell your personal data. Third-party sharing is limited to essential service providers 
                who are contractually bound to protect your data. You maintain full control over your information.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">24. Analytics & Service Improvement</h2>
            <h3 className="text-xl font-medium mb-3">Analytics Usage</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We use analytics to improve service performance and user experience</li>
              <li>Analytics data is aggregated and anonymized</li>
              <li>No personal information is used in analytics</li>
              <li>Analytics help us optimize features and fix technical issues</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Data Collected for Analytics</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Performance:</strong> Page load times, error rates, system performance</li>
              <li><strong>Usage:</strong> Feature usage patterns, navigation flows, button clicks</li>
              <li><strong>Technical:</strong> Browser types, device information, network conditions</li>
              <li><strong>Content:</strong> Course creation patterns, sharing statistics (anonymized)</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Analytics Controls</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You can opt out of analytics through your account settings</li>
              <li>Opting out does not affect service functionality</li>
              <li>Analytics data is automatically deleted after 2 years</li>
              <li>You can request deletion of your analytics data at any time</li>
            </ul>
            <h3 className="text-xl font-medium mb-3">Future Analytics Features</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>We may introduce advanced analytics for course creators</li>
              <li>All new analytics features will be opt-in</li>
              <li>Detailed privacy controls for each analytics feature</li>
              <li>No analytics without explicit user consent</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Analytics Benefits:</h3>
              <p className="text-yellow-800 text-sm">
                Analytics help us create better features, fix bugs faster, and provide a more reliable service. 
                Your privacy is protected through data anonymization and opt-out controls.
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t">
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
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
