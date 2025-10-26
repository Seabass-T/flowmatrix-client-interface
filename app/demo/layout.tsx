import { AlertCircle, Sparkles } from 'lucide-react'

/**
 * Demo Layout
 *
 * Features:
 * - Custom header with demo banner
 * - No authentication required
 * - Prominent CTA to get started
 * - Subtle "Demo Account" notice
 * - Clean, professional presentation
 */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner - Subtle Notice */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-3">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Demo Account - Sample Data
            </span>
            <span className="text-white/60">•</span>
            <a
              href="https://flowmatrixai.com"
              className="text-sm font-medium hover:underline transition-all"
            >
              Return to website
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                  FlowMatrix AI
                </h1>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-px bg-gray-300" />

              {/* Demo Company Name */}
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Apex Construction Inc.
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  DEMO
                </span>
              </div>
            </div>

            {/* Right Side - CTA (Desktop) */}
            <div className="hidden md:block">
              <a
                href="https://tally.so/r/wMBOXE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors duration-200 shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start Your Automation Journey</span>
              </a>
            </div>
          </div>

          {/* Mobile Company Name */}
          <div className="sm:hidden pb-3 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Apex Construction Inc.
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
              DEMO
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer CTA */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to transform your business with automation?
            </h3>
            <p className="text-gray-600 mb-4">
              See how FlowMatrix AI can deliver similar results for your company.
            </p>
            <a
              href="https://tally.so/r/wMBOXE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-700 text-white rounded-lg text-base font-semibold hover:bg-green-800 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>Get Started Today</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
