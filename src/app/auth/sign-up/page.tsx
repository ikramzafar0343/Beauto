'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ArrowUp, Mail, ArrowRight, Moon, Sun } from 'lucide-react'
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useTheme } from "@/contexts/ThemeContext";
import PaymentModal from "@/components/payment/PaymentModal";

const PLANS = {
  starter: { name: "Starter", price: 50, yearlyPrice: 500 },
  pro: { name: "Pro", price: 125, yearlyPrice: 1250 },
};

export default function SignUpPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; yearlyPrice?: number; isYearly?: boolean } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder input handler - can be extended for search functionality
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder submit handler - can be extended for search functionality
  };

  useEffect(() => {
    // Check if plan is specified in URL
    const planParam = searchParams.get('plan')
    if (planParam && PLANS[planParam as keyof typeof PLANS]) {
      const plan = PLANS[planParam as keyof typeof PLANS]
      setSelectedPlan({
        name: plan.name,
        price: plan.price,
        yearlyPrice: plan.yearlyPrice,
        isYearly: false,
      })
    }
  }, [searchParams])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error(
          'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. See README.md for setup instructions.'
        )
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: true,
          }
        },
      })

      if (error) throw error

      if (data.user) {
        setUserId(data.user.id)
        
        // If a plan is selected, redirect to checkout
        if (selectedPlan) {
          router.push(`/checkout?plan=${searchParams.get('plan')}`)
        } else {
          // Otherwise, redirect to dashboard
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred'
      
      if (err instanceof Error) {
        errorMessage = err.message
        // Provide more helpful error messages
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_NAME_NOT_RESOLVED')) {
          errorMessage = 'Cannot connect to Supabase. Please check your NEXT_PUBLIC_SUPABASE_URL in .env.local file.'
        }
      }
      
      setError(errorMessage)
      console.error('Sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    // Redirect to dashboard after successful payment
    router.push('/dashboard?payment=success')
    router.refresh()
  }

  const handleSkipPayment = () => {
    setShowPaymentModal(false)
    // User chooses to use free plan (200 credits per day)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-[#343434] dark:text-white tracking-tight">
          Beauto
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#343434]/70 dark:text-white/70 hover:text-[#343434] dark:hover:text-white hover:bg-[#f8f9fa] dark:hover:bg-[#27272a] transition-all"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

        {/* Main Content */}
        <main className="px-8 pt-12 pb-24 max-w-7xl mx-auto">
          <div className="max-w-xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h1 className="text-[42px] md:text-[56px] font-normal leading-[1.1] tracking-tight mb-8 shiny-heading text-[#343434] dark:text-white">
                Join us
              </h1>
              <p className="text-[#343434]/60 dark:text-white/60 mb-12">Create your account to get started</p>

              <div className="mt-8">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={handleChange}
                  onSubmit={onSubmit}
                />
              </div>
            </div>

            <Card className="max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#dae0e2] shadow-sm">
            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#343434] font-medium text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-lg border-[#dae0e2] focus:border-[#343434] focus:ring-[#343434] text-[#343434]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#343434] font-medium text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-lg border-[#dae0e2] focus:border-[#343434] focus:ring-[#343434] text-[#343434]"
                />
                <p className="text-xs text-[#343434]/50">Must be at least 6 characters</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#343434] text-white font-medium hover:bg-[#343434]/90 transition-colors"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#343434]/60 text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/sign-in"
                  className="text-[#343434] font-medium hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>

        {/* Payment Modal */}
        {userId && selectedPlan && (
          <PaymentModal
            open={showPaymentModal}
            onClose={handleSkipPayment}
            plan={selectedPlan}
            userId={userId}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Is Beauto for you Section */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#343434] mb-3">
              Is Beauto for you?
            </h2>
            <p className="text-[#343434]/60 max-w-xl mx-auto">
              Short answer: of course it is! Beauto is built specifically for the small and medium businesses that need to optimize and scale.
            </p>
          </div>

          <div className="flex items-end justify-center gap-4 flex-wrap">
            {[
              { name: 'Hair-dressers', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=400&fit=crop' },
              { name: 'Accountants', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop' },
              { name: 'Hospitality', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=400&fit=crop' },
              { name: 'Construction', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=300&h=400&fit=crop' }
            ].map((industry, idx, arr) => (
              <div key={industry.name} className="flex items-end gap-4">
                <div className="w-32 h-48 rounded-3xl bg-[#d6dfe8] flex flex-col items-center justify-end pb-6 overflow-hidden relative">
                  <Image 
                    src={industry.image}
                    alt={industry.name}
                    fill
                    className="object-cover opacity-70"
                    unoptimized
                  />
                  <span className="text-sm text-white font-medium relative z-10 drop-shadow-lg">{industry.name}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="w-10 h-10 rounded-full border border-[#dae0e2] flex items-center justify-center mb-6">
                    <ArrowRight className="w-4 h-4 text-[#343434]/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-16 bg-[#d6dfe8]/30 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-[#343434] mb-6">Logo</div>
              <h3 className="text-xl font-medium text-[#343434] mb-2">Stay connected</h3>
              <p className="text-[#343434]/60 text-sm mb-4">Newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[#dae0e2] text-[#343434] placeholder:text-[#343434]/40 focus:outline-none focus:border-[#343434]/30"
                />
                <button className="p-2.5 rounded-lg bg-[#343434] text-white hover:bg-[#343434]/90 transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <ul className="space-y-3">
                {['Home', 'Pricing', 'Blog'].map((link) => (
                  <li key={link}>
                    <Link 
                      href={link === 'Home' ? '/' : link === 'Blog' ? 'https://composio.dev/blog' : `/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-[#343434]/60 hover:text-[#343434] transition-colors text-sm"
                      target={link === 'Blog' ? '_blank' : undefined}
                      rel={link === 'Blog' ? 'noopener noreferrer' : undefined}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ul className="space-y-3">
                {['Marketplace', 'How it works', 'Demo', 'Blog'].map((link) => (
                  <li key={link}>
                    <Link 
                      href={link === 'Blog' ? 'https://composio.dev/blog' : link === 'How it works' ? '/demo' : `/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-[#343434]/60 hover:text-[#343434] transition-colors text-sm"
                      target={link === 'Blog' ? '_blank' : undefined}
                      rel={link === 'Blog' ? 'noopener noreferrer' : undefined}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-[#dae0e2]">
            <p className="text-[#343434]/50 text-sm">Copyright © Beauto 2025</p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[#343434]/60 hover:text-[#343434] transition-colors text-sm"
            >
              Back to top
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}