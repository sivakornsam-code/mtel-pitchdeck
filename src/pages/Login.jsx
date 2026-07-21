import { useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function friendlyLoginError(error) {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()

  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials')
  ) {
    return 'The email or password is incorrect. Please try again.'
  }

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }

  if (
    error?.status === 429 ||
    code.includes('rate_limit') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return 'Too many sign-in attempts. Please wait a few minutes and try again.'
  }

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'We couldn’t connect. Check your internet connection and try again.'
  }

  return 'We couldn’t sign you in right now. Please try again.'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail && !password) {
      setError('Enter your email and password.')
      emailRef.current?.focus()
      return
    }

    if (!normalizedEmail) {
      setError('Enter your email address.')
      emailRef.current?.focus()
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }

    if (!password) {
      setError('Enter your password.')
      passwordRef.current?.focus()
      return
    }

    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (signInError) setError(friendlyLoginError(signInError))
    } catch (requestError) {
      setError(friendlyLoginError(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div style={{ width: 360 }}>

        <div style={{ width: 40, height: 3, background: '#F6C347', marginBottom: 28 }} />

        <h1 className="font-display text-2xl font-bold tracking-tight mb-1" style={{ color: '#000000' }}>Mtel Pitch</h1>
        <p className="text-sm mb-10" style={{ color: '#888888' }}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-7" noValidate>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#999999', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoComplete="email"
              placeholder="team@mtel.com"
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full py-2 text-sm outline-none transition-all"
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #000', color: '#000', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderBottomColor = '#F6C347'}
              onBlur={e => e.target.style.borderBottomColor = '#000'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#999999', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full py-2 pr-7 text-sm outline-none transition-all"
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #000', color: '#000', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderBottomColor = '#F6C347'}
                onBlur={e => e.target.style.borderBottomColor = '#000'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                className="absolute right-0 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#cccccc' }}
                onMouseEnter={e => e.currentTarget.style.color = '#000'}
                onMouseLeave={e => e.currentTarget.style.color = '#cccccc'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p id="login-error" role="alert" className="text-xs" style={{ color: '#dc2626', borderLeft: '3px solid #dc2626', paddingLeft: 10 }}>
              {error}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: '#000000', color: '#ffffff' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
