'use client'

import Link from 'next/link'
import GoogleLogin from './components/GoogleLogin'
import { useState } from 'react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is AI Background Remover?',
          a: 'AI Background Remover is an online tool powered by AI technology that automatically identifies the subject in your image and removes the background. Our advanced machine learning algorithms deliver high-quality results in seconds — no design skills required.',
        },
        {
          q: 'Can I use it without logging in?',
          a: 'Yes! Unregistered users can process up to 3 images for free. However, processing history won\'t be saved. We recommend signing in for the best experience.',
        },
        {
          q: 'What image formats are supported?',
          a: 'We support common image formats including PNG, JPG, JPEG, and WebP. Free tier supports images up to 5MB, paid plans support up to 20MB.',
        },
        {
          q: 'What is the output quality?',
          a: 'The free tier provides standard quality output (suitable for web use), while paid plans offer HD 4K output (suitable for print and professional design). Our AI precisely detects edges, including complex details like hair and fur.',
        },
      ],
    },
    {
      category: 'Pricing & Payments',
      questions: [
        {
          q: 'What are the limitations of the free tier?',
          a: 'The free tier lets you process 3 images with standard quality output. It\'s perfect for trying out the tool or occasional use. For more images and HD output, check out our Credit Packs and Subscriptions.',
        },
        {
          q: 'How do I choose the right plan?',
          a: 'If you only need it occasionally, Credit Packs are the most flexible option — credits never expire. For regular use, our monthly subscriptions offer the best value with credits that refresh each month.',
        },
        {
          q: 'Can I upgrade or cancel anytime?',
          a: 'Absolutely! You can upgrade or cancel your subscription at any time. Upgrades take effect immediately, and cancellations apply at the end of your current billing cycle. Credit Packs are one-time purchases and never expire.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept PayPal, which supports credit cards, debit cards, and bank transfers worldwide. All payments are processed securely through PayPal — we never store your payment information.',
        },
      ],
    },
    {
      category: 'Usage & Features',
      questions: [
        {
          q: 'How can I get the best results?',
          a: 'For best results, use images with a clear subject and a relatively simple background. Avoid images where the subject and background colors are too similar. Paid plans offer higher resolution output for better quality.',
        },
        {
          q: 'How long are processed images stored?',
          a: 'Processed images are available for immediate download and are not permanently stored on our servers. Original images are deleted after processing. We recommend downloading your results right away.',
        },
        {
          q: 'Is there a batch processing feature?',
          a: 'Currently, images are processed one at a time. Batch processing is on our roadmap — stay tuned for updates!',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      questions: [
        {
          q: 'Is my image data secure?',
          a: 'Absolutely! Your images are processed securely and original images are deleted from our servers immediately after processing. We never use your images for any other purpose or share them with third parties.',
        },
        {
          q: 'How do I delete my account?',
          a: 'You can delete your account at any time from your dashboard settings. All associated data, including processing history, will be permanently deleted and cannot be recovered.',
        },
        {
          q: 'Can I sign in with Google?',
          a: 'Yes! We support one-click Google Sign-In — no registration needed. Your processing history will be synced automatically and accessible from any device.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            🌀 BG Remover
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-800">
              Pricing
            </Link>
            <Link href="/faq" className="text-blue-600 font-medium">
              FAQ
            </Link>
            <GoogleLogin />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Can't find what you're looking for? Contact our support team
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = categoryIndex * 100 + questionIndex
                const isOpen = openIndex === globalIndex
                
                return (
                  <div
                    key={globalIndex}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800 text-lg">{item.q}</span>
                      <svg
                        className={`w-6 h-6 text-gray-400 transform transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6">Our support team is here to help</p>
          <a
            href="mailto:support@imagebackgroundremover.guru"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">🌀 BG Remover</h3>
              <p className="text-gray-400">AI-powered background removal tool. Remove backgrounds in 3 seconds, no Photoshop needed.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/faq" className="hover:text-white">Help Center</Link></li>
                <li><a href="mailto:support@imagebackgroundremover.guru" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2026 BG Remover. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
