import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GrantPicks',
  description: 'Privacy Policy for GrantPicks - Learn how we protect your privacy and handle your information responsibly.',
  keywords: 'privacy policy, grantpicks, blockchain, data protection, GDPR',
  openGraph: {
    title: 'Privacy Policy | GrantPicks',
    description: 'Privacy Policy for GrantPicks - Learn how we protect your privacy and handle your information responsibly.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              PotLock Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Effective Date: December 24, 2023
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy is Important to Us</h2>
                <p className="text-gray-700">
                  PotLock is committed to protecting your privacy and handling your information responsibly. This Privacy Policy explains how we collect, use, and share information when you use our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Information We Collect</h2>
                <p className="text-gray-700 mb-4">
                  We do not collect any personally identifiable information (PII) about you. This means we do not collect your name, email address, physical address, phone number, or any other information that could be used to identify you personally. We do not use cookies currently. We are leveraging decentralized front ends and are not the official gateway providers for our platform on NEAR Protocol. This is subject to change with PotLock hosted applications in the future.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Information is Shared With or Sold To</h2>
                <p className="text-gray-700">
                  Information is not sold to different actors. Rather currently we do not have a back end database and we store information on chain. This means anyone can access this information to create profiles and analytics.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information You Choose to Share on the Blockchain</h2>
                <p className="text-gray-700">
                  PotLock is built on a blockchain network, which is a public, decentralized ledger. Any information you choose to share on the blockchain, such as project descriptions or funding proposals, will be publicly viewable. PotLock is not responsible for controlling or removing information that you have shared on the blockchain.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Public Goods Registry on NEAR Protocol</h2>
                <p className="text-gray-700">
                  We manage a public goods registry on the NEAR Protocol blockchain. This registry contains information about projects that have been funded through PotLock, such as project names, descriptions, and funding amounts. This information is publicly viewable on the NEAR Protocol blockchain.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Purpose for Collection</h2>
                <p className="text-gray-700">
                  Purpose for data collection for organizations to transparently communicate information and updates to the public.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Consent</h2>
                <p className="text-gray-700">
                  By publishing information on the blockchain we are obtaining implicit or explicit &ldquo;meaningful consent&rdquo; in order to collect, use, and share users&apos; personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limiting Collection</h2>
                <p className="text-gray-700">
                  We limit the collection we obtain. Although we love transparency and accountability to donors, we have much project information successfully.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy</h2>
                <p className="text-gray-700">
                  Organizations must keep personal information accurate, complete, and up-to-date. As information is stored on the blockchain it is responsibility for the organization to upkeep its profile and manage access to its account. We cannot restore blockchain account&apos;s if an organization looses it private keys.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Individual Access</h2>
                <p className="text-gray-700">
                  Users can update their individual access.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 mb-4">
                  You have the following rights regarding your information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Access:</strong> You can request access to the information we hold about you, if any.</li>
                  <li><strong>Rectification:</strong> You can request that we correct any inaccurate information we hold about you.</li>
                  <li><strong>Erasure:</strong> You can request that we erase any information we hold about you.</li>
                  <li><strong>Restriction of Processing:</strong> You can request that we restrict the processing of your information.</li>
                  <li><strong>Objection to Processing:</strong> You can object to the processing of your information.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">GDPR Compliance</h2>
                <p className="text-gray-700">
                  PotLock is committed to complying with the General Data Protection Regulation (GDPR). If you are located in the European Union, you have additional rights under the GDPR, which are outlined in this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions or concerns about this Privacy Policy, please contact us at support@potlock.org
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to this Privacy Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. If we make any significant changes, we will notify you through the PotLock platform through a changelog in this document.
                </p>
              </section>

              <section className="border-t border-gray-200 pt-8">
                <p className="text-gray-700">
                  Individuals have the right to challenge our compliance with the 10 principles. Inquiries can be addressed to support@potlock.org
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default PrivacyPolicyPage 