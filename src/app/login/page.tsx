'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      if (!isLogin) {

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setLoading(false); return }
      }


      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else {
        router.push('/')
      }
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Zap className="text-accent" size={22} />
          <span className="font-mono font-semibold text-lg text-text">CodeSync</span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8">

          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {['Sign In', 'Register'].map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 0); setError('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  isLogin === (i === 0)
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {!isLogin && (
              <div>
                <label className="text-xs text-muted mb-1.5 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-bg border border-border text-text placeholder-muted rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-muted mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-bg border border-border text-text placeholder-muted rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full bg-bg border border-border text-text placeholder-muted rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red text-xs bg-red/10 border border-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
