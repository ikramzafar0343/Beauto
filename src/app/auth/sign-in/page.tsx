'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ArrowUp, Mail, ArrowRight } from 'lucide-react'
import { SupabaseConfigCheck } from '@/components/supabase-config-check'
import { SupabaseConnectionTest } from '@/components/supabase-connection-test'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Check if Supabase client is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error(
          'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file. See SETUP_GUIDE.md for instructions.'
        )
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error(
            `Cannot connect to Supabase server at ${supabaseUrl}

This usually means:
1. The Supabase project is paused (free tier projects pause after inactivity)
2. The project URL is incorrect
3. There's a network connectivity issue

To fix:
1. Go to https://app.supabase.com and check if your project is active
2. If paused, click "Restore project" to reactivate it
3. Verify the project URL in Settings → API matches: ${supabaseUrl}
4. Check your internet connection

See TROUBLESHOOTING.md for more help.`
          )
        }
        
        // Handle 400 Bad Request errors (authentication issues)
        if (error.status === 400 || error.message.includes('400') || error.message.includes('Invalid login')) {
          let errorMessage = 'Invalid email or password.'
          
          if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in. Check your inbox for the verification email.'
          } else if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.'
          } else if (error.message.includes('User not found')) {
            errorMessage = 'No account found with this email. Please sign up first.'
          } else if (error.message.includes('Email rate limit')) {
            errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
          } else {
            errorMessage = `Sign in failed: ${error.message}`
          }
          
          throw new Error(errorMessage)
        }
        
        throw error
      }

      // Redirect to dashboard or the redirect URL
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      let errorMessage = 'An error occurred'
      
      if (err instanceof Error) {
        errorMessage = err.message
        
        // Check for common network errors
        if (err.message.includes('ERR_NAME_NOT_RESOLVED') || err.message.includes('Failed to fetch')) {
          errorMessage = `
Cannot connect to Supabase server.

This usually means:
1. Your NEXT_PUBLIC_SUPABASE_URL is incorrect or missing
2. The Supabase project URL is invalid
3. There's a network connectivity issue

Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL is set correctly.
See SETUP_GUIDE.md for detailed instructions.
          `.trim()
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <SupabaseConfigCheck />
          <main className="w-full max-w-xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-[42px] md:text-[56px] font-bold leading-[1.1] tracking-tight mb-8 shiny-heading">
                  Welcome back
                </h1>
                <p className="text-[#343434]/60 mb-12 text-lg">Experience the next generation of automation</p>
              </div>

              <div className="max-w-md mx-auto">
                <form onSubmit={handleSignIn} className="space-y-6">
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
                      className="h-12 rounded-lg border-[#dae0e2] focus:border-[#343434] focus:ring-[#343434] text-[#343434]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-[#343434] text-white font-medium hover:bg-[#343434]/90 transition-colors"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-[#343434]/60 text-sm">
                      Don't have an account?{' '}
                      <Link
                        href="/auth/sign-up"
                        className="text-[#343434] font-medium hover:underline transition-colors"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                  
                  {error && error.includes('ERR_NAME_NOT_RESOLVED') && (
                    <div className="border-t border-[#dae0e2] dark:border-[#27272a] pt-4">
                      <SupabaseConnectionTest />
                    </div>
                  )}
                </div>
              </div>
          </main>
      </div>
    )
}