import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = `
Missing Supabase environment variables!

Please create a .env.local file in the root directory with:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

See SETUP_GUIDE.md for detailed instructions.
    `.trim()
    throw new Error(errorMessage)
  }

  // Validate URL format
  let parsedUrl: URL
  try {
    parsedUrl = new URL(supabaseUrl)
  } catch {
    throw new Error(
      `Invalid Supabase URL format: "${supabaseUrl}". It should be a valid HTTPS URL like https://your-project-id.supabase.co`
    )
  }

  // Check if URL looks like a Supabase URL
  if (!parsedUrl.hostname.includes('supabase.co') && !parsedUrl.hostname.includes('supabase.in')) {
    console.warn(
      `Warning: Supabase URL doesn't look like a valid Supabase URL: "${supabaseUrl}"`
    )
  }

  // Check protocol
  if (parsedUrl.protocol !== 'https:') {
    throw new Error(
      `Supabase URL must use HTTPS. Current URL: "${supabaseUrl}". Please use https:// instead.`
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
