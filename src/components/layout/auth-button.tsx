'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="px-5 py-2.5 rounded-full bg-stone-200 dark:bg-[#27272a] animate-pulse">
        <span className="invisible">Loading</span>
      </div>
    )
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="px-5 py-2.5 rounded-full border border-[#dae0e2] dark:border-[#27272a] text-[#343434] dark:text-white text-[15px] hover:bg-[#d6dfe8]/30 dark:hover:bg-[#27272a] transition-colors"
      >
        Sign out
      </button>
    )
  }

  return (
    <Link
      href="/auth/sign-in"
      className="px-5 py-2.5 rounded-full bg-[#343434] text-white text-[15px] hover:bg-[#343434]/90 transition-colors"
    >
      Sign in
    </Link>
  )
}
