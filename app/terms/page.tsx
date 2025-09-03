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
