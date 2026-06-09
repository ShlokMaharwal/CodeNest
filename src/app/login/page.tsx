'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Segmented } from '@/components/ui/Tabs'
import { motion, AnimatePresence } from 'framer-motion'

const CODE_LINES = [
  'function twoSum(nums, target) {',
  '  const map = new Map()',
  '  for (let i = 0; i < nums.length; i++) {',
  '    const comp = target - nums[i]',
  '    if (map.has(comp)) {',
  '      return [map.get(comp), i]',
  '    }',
  '    map.set(nums[i], i)',
  '  }',
  '}',
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
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
      if (result?.error) { setError('Invalid email or password'); setLoading(false) }
      else router.push('/')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {}
          <div className="flex items-center justify-center mb-10">
          <Logo height={24} />
          </div>
          {}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-text tracking-tight">
              {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {mode === 'signin'
                ? 'Sign in to manage your interviews.'
                : 'Start running better technical interviews.'}
            </p>
          </div>

          {}
          <Segmented
            options={[
              { value: 'signin',   label: 'Sign in' },
              { value: 'register', label: 'Register' },
            ]}
            value={mode}
            onChange={v => { setMode(v as any); setError('') }}
            className="mb-6"
          />

          <div className="flex flex-col gap-4">
            {}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    label="Name"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Your name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="text-muted hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-danger-soft border border-danger/30 text-danger rounded-md px-3 py-2 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleSubmit}
              className="w-full mt-1"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="hidden lg:flex flex-col flex-1 bg-surface-2 border-l border-border relative overflow-hidden items-center justify-center p-12">
        {}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        {}
        <div className="relative bg-bg-elevated border border-border rounded-xl shadow-lg p-5 font-mono text-sm w-full max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-subtle">solution.js</span>
          </div>
          {CODE_LINES.map((line, i) => (
            <div key={i} className="flex gap-3 leading-relaxed">
              <span className="text-subtle select-none w-4 text-right text-xs">{i + 1}</span>
              <span className="text-text/80 text-xs">{line}</span>
            </div>
          ))}
          {}
          <div className="flex gap-3 mt-1">
            <span className="text-subtle select-none w-4 text-right text-xs">{CODE_LINES.length + 1}</span>
            <span className="inline-block w-[2px] h-4 bg-accent animate-pulse-slow" />
          </div>
        </div>

        <p className="relative mt-6 text-sm text-muted text-center max-w-xs">
          A calm IDE for high-stakes conversations.
        </p>
      </div>
    </div>
  )
}
