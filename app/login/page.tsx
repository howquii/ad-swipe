'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleLogin() {
    if (!email.trim()) return
    setLoading(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-notion-bg flex items-center justify-center">
      <div className="bg-white border border-notion-border rounded-lg p-8 w-80 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={20} className="text-notion-accent" />
          <span className="font-semibold text-notion-text">Ad Swipe</span>
        </div>

        {sent ? (
          <div>
            <p className="text-sm text-notion-text font-medium">Check your email</p>
            <p className="text-xs text-notion-muted mt-1">
              We sent a magic link to {email}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-notion-text mb-4">Sign in</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              className="w-full text-sm border border-notion-border rounded-md px-3 py-2 outline-none focus:border-notion-accent mb-3"
            />
            <button
              onClick={handleLogin}
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-2 bg-notion-accent text-white text-sm rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Continue with Email
            </button>
          </>
        )}
      </div>
    </div>
  )
}
