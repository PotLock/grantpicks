import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | GrantPicks',
  description: 'MIT License for GrantPicks - Terms of Service and License Agreement.',
  keywords: 'terms of service, license, MIT, grantpicks, blockchain, grants, funding, legal',
  openGraph: {
    title: 'Terms of Service | GrantPicks',
    description: 'MIT License for GrantPicks - Terms of Service and License Agreement.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              MIT License
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">MIT License</h2>
                <p className="text-lg text-gray-600">Copyright (c) 2024 Potluck Labs, Inc</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 md:p-8 font-mono text-sm md:text-base leading-relaxed">
                <p className="mb-4 text-gray-900">
                  Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the &ldquo;Software&rdquo;), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:
                </p>

                <p className="mb-6 text-gray-900">
                  The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.
                </p>

                <div className="border-l-4 border-gray-300 pl-4 bg-white p-4 rounded-r-lg">
                  <p className="font-semibold text-gray-900 mb-2">THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  This MIT License governs the use of GrantPicks software and related services.
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TermsOfServicePage 