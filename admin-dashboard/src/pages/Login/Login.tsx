import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    try {
      setIsSubmitting(true)
      await login({ email: email.trim(), password }, rememberMe)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Invalid email or password.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090D16] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D3AD32] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            Loading...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#090D16] p-4 text-gray-100 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Top Branding Section */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D3AD32]/40 bg-[#D3AD32]/10 text-[#D3AD32] shadow-lg mb-3">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold tracking-widest text-gray-100 uppercase">
            Home Axis
          </h1>
          <p className="mt-1 text-[11px] font-bold tracking-widest text-[#D3AD32] uppercase">
            SMART LIVING, GOLDEN STANDARDS
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-gray-800/80 bg-[#0F131C] p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-100">
              Welcome Back
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Sign in to continue to your golden home
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold tracking-wider text-gray-300 uppercase mb-1.5"
              >
                EMAIL 
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@yekondo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-900/90 py-2.5 pl-10 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold tracking-wider text-gray-300 uppercase mb-1.5"
              >
                PASSWORD
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-900/90 py-2.5 pl-10 pr-10 text-xs md:text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-[#D3AD32] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-800 bg-gray-900 text-[#D3AD32] focus:ring-[#D3AD32]"
                />
                <span className="text-xs text-gray-300">Remember Me</span>
              </label>

              <button
                type="button"
                className="text-xs font-semibold text-[#D3AD32] hover:underline focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#D3AD32] py-3 text-xs font-extrabold tracking-wider text-gray-950 uppercase shadow-md transition-all hover:bg-[#E4C043] focus:outline-none focus:ring-2 focus:ring-[#D3AD32] focus:ring-offset-2 focus:ring-offset-[#0F131C] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-950 border-t-transparent" />
                  <span>SIGNING IN...</span>
                </div>
              ) : (
                <span>SIGN IN</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Terms & Privacy */}
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
          <span className="hover:text-gray-400 cursor-pointer">
            Terms of Service
          </span>
          <span>•</span>
          <span className="hover:text-gray-400 cursor-pointer">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login





