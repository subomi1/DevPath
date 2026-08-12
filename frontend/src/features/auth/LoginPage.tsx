import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await login(email, password)
      redirectByRole(user.role)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 401) {
        setError('Email or password is incorrect.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'developer':
        navigate('/developer/dashboard')
        break
      case 'manager':
        navigate('/manager/dashboard')
        break
      case 'hr':
        navigate('/hr/dashboard')
        break
      case 'admin':
        navigate('/admin/dashboard')
        break
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-surface border border-border rounded-lg p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
            AZ
          </div>
          <h1 className="font-display text-lg font-semibold text-ink">AppZone Portal</h1>
        </div>
        <p className="text-sm text-ink-muted mb-6">Authentication Required</p>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Company Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-ink">Password</label>
              <a href="/forgot-password" className="text-sm text-primary">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="border-t border-border mt-6 pt-4">
          <p className="text-sm text-ink-muted text-center">
            Access is by invitation only. Contact HR if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}