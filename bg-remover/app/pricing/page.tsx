'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

const PACKAGES = {
  // Credit Packs
  starter: { id: 'starter', credits: 10, price: '4.99', type: 'one-time' },
  popular: { id: 'popular', credits: 30, price: '12.99', type: 'one-time' },
  pro: { id: 'pro', credits: 80, price: '29.99', type: 'one-time' },
  // Subscriptions
  basic: { id: 'basic', credits: 30, price: '7.99', type: 'subscription' },
  proSub: { id: 'pro-sub', credits: 80, price: '15.99', type: 'subscription' },
};

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleApprove = async (packageId: string, orderId: string) => {
    try {
      // Get buyer email from PayPal
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          packageId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
        alert(`✅ Payment successful!\n\n${pkg.credits} credits added\nTotal credits: ${result.totalCredits || pkg.credits}\n\nCredits have been added to your account!`);
        setSelectedPackage(null);
      } else {
        alert(`❌ Payment processing failed\n\nError: ${result.error || 'Unknown error'}\n\nPlease contact support.`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`❌ Payment failed\n\n${error.message || 'Please try again.'}`);
    }
  };

  const PayPalButton = ({ packageId }: { packageId: string }) => {
    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
    const [error, setError] = useState<string | null>(null);
    
    return (
      <div className="w-full">
        {error && (
          <div className="mb-2 p-2 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        <PayPalButtons
          style={{ 
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 45
          }}
          forceReRender={[pkg.price, pkg.credits]}
          createOrder={async () => {
            try {
              const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: pkg.price,
                  currency: 'USD',
                  description: `${pkg.credits} credits`,
                }),
              });
              const data = await response.json();
              if (data.error) {
                setError(data.error);
                throw new Error(data.error);
              }
              return data.orderId;
            } catch (err: any) {
              setError(err.message || 'Failed to create order');
              throw err;
            }
          }}
          onApprove={async (data: any) => {
            await handleApprove(packageId, data.orderID);
          }}
          onError={(err) => {
            console.error('PayPal error:', err);
            setError('PayPal failed to load. Please refresh the page and try again');
            alert('❌ Payment error. Please try again.');
          }}
          onCancel={() => {
            console.log('Payment cancelled');
            setSelectedPackage(null);
          }}
        />
      </div>
    );
  };

  return (
    <PayPalScriptProvider options={{ 
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'Ae316YOk6i3rlT2YrFNBbjoLcMCC3j9uJYJqohQSYA9ObqZqoxpdtDIP2IWbnZMo9g0HD278u7LmJKdU',
      currency: 'USD',
      intent: 'capture',
      locale: 'en_US',
      commit: false,
      disableFunding: 'card,credit,bancontact,giropay,ideal,mybank,sofort,venmo',
    }}>
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero */}
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Simple, flexible pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Start free, then choose what works for you. Credits never expire.
            </p>
            <div className="inline-flex items-center gap-2 bg-slate-800/80 border-2 border-green-500/50 px-6 py-3 rounded-full shadow-lg shadow-green-500/20">
              <span>🎉</span>
              <span className="text-green-400 font-bold">3 free images</span>
              <span className="text-gray-300">to get started — no credit card required</span>
            </div>
          </section>

          {/* Credit Packs */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">Credit Packs</h2>
            <p className="text-gray-300">One-time purchase. Use anytime. Perfect for occasional use.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Starter - $4.99 */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-2xl p-8 hover:border-indigo-400 transition-all hover:-translate-y-2 shadow-xl">
              <div className="text-5xl font-bold mb-1 text-white">10 <span className="text-xl text-gray-400">credits</span></div>
              <div className="text-3xl font-bold mb-1 text-white">$4.99</div>
              <div className="text-gray-400 mb-6">$0.50 per image</div>
              {selectedPackage === 'starter' ? (
                <PayPalButton packageId="starter" />
              ) : (
                <button 
                  onClick={() => setSelectedPackage('starter')}
                  className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all border-2 border-slate-500"
                >
                  Buy Starter Pack
                </button>
              )}
            </div>

            {/* Popular - $12.99 */}
            <div className="bg-gradient-to-b from-indigo-900 to-slate-900 border-2 border-indigo-400 rounded-2xl p-8 relative hover:-translate-y-2 transition-all shadow-xl shadow-indigo-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                ⭐ Most Popular
              </div>
              <div className="text-5xl font-bold mb-1 text-white">30 <span className="text-xl text-gray-400">credits</span></div>
              <div className="text-3xl font-bold mb-1 text-white">$12.99</div>
              <div className="text-gray-400 mb-6">$0.43 per image</div>
              {selectedPackage === 'popular' ? (
                <PayPalButton packageId="popular" />
              ) : (
                <button 
                  onClick={() => setSelectedPackage('popular')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white rounded-lg font-semibold transition-all shadow-lg"
                >
                  Buy Popular Pack
                </button>
              )}
            </div>

            {/* Pro Pack - $29.99 */}
            <div className="bg-gradient-to-b from-green-900 to-slate-900 border-2 border-green-400 rounded-2xl p-8 relative hover:-translate-y-2 transition-all shadow-xl shadow-green-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                💎 Best Value
              </div>
              <div className="text-5xl font-bold mb-1 text-white">80 <span className="text-xl text-gray-400">credits</span></div>
              <div className="text-3xl font-bold mb-1 text-white">$29.99</div>
              <div className="text-gray-400 mb-6">$0.37 per image</div>
              {selectedPackage === 'pro' ? (
                <PayPalButton packageId="pro" />
              ) : (
                <button 
                  onClick={() => setSelectedPackage('pro')}
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-slate-900 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Buy Pro Pack
                </button>
              )}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">Monthly Subscriptions</h2>
            <p className="text-gray-300">Best value for regular users. Credits refresh monthly.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic - $7.99 */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-2xl p-8 hover:border-green-400 transition-all hover:-translate-y-2 shadow-xl">
              <div className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-green-500/30">
                Save vs Packs
              </div>
              <div className="text-2xl font-bold mb-2 text-white">Basic</div>
              <div className="text-4xl font-bold text-green-400 mb-1">30 <span className="text-base text-gray-400">credits/month</span></div>
              <div className="text-2xl font-bold mb-1 text-white">$7.99/month</div>
              <div className="text-green-400 font-semibold mb-6">$0.27 per image</div>
              <ul className="space-y-3 mb-6 text-gray-300 text-sm">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Credits refresh monthly</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cancel anytime</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unused credits roll over*</li>
              </ul>
              {selectedPackage === 'basic' ? (
                <PayPalButton packageId="basic" />
              ) : (
                <button 
                  onClick={() => setSelectedPackage('basic')}
                  className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all border-2 border-slate-500"
                >
                  Subscribe Basic
                </button>
              )}
            </div>

            {/* Pro - $15.99 */}
            <div className="bg-gradient-to-b from-green-900 to-slate-900 border-2 border-green-400 rounded-2xl p-8 relative hover:-translate-y-2 transition-all shadow-xl shadow-green-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                💎 Best Value
              </div>
              <div className="text-2xl font-bold mb-2 text-white">Pro</div>
              <div className="text-4xl font-bold text-green-400 mb-1">80 <span className="text-base text-gray-400">credits/month</span></div>
              <div className="text-2xl font-bold mb-1 text-white">$15.99/month</div>
              <div className="text-green-400 font-semibold mb-6">$0.20 per image</div>
              <ul className="space-y-3 mb-6 text-gray-300 text-sm">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Credits refresh monthly</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cancel anytime</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unused credits roll over*</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Priority processing</li>
              </ul>
              {selectedPackage === 'pro-sub' ? (
                <PayPalButton packageId="pro-sub" />
              ) : (
                <button 
                  onClick={() => setSelectedPackage('pro-sub')}
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-400 text-slate-900 rounded-lg font-semibold transition-all shadow-lg"
                >
                  Subscribe Pro
                </button>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm mt-12">
            * Unused subscription credits roll over for up to 3 months. All prices in USD.
          </p>
        </div>
      </main>
    </PayPalScriptProvider>
  );
}
