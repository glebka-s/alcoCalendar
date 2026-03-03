import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wine } from 'lucide-react'
import { apiClient, setAuthTokens } from './apiClient'
import { useAuth } from './AuthContext'

type ErrorResponse = { error?: string }

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const response = await apiClient.post<
        { accessToken: string; refreshToken: string },
        { data: { accessToken: string; refreshToken: string } },
        { email: string; password: string }
      >('/auth/login', { email, password })

      const tokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }
      setAuthTokens(tokens.accessToken, tokens.refreshToken)
      login(tokens)
      navigate('/calendar', { replace: true })
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: unknown } }
      const body = maybeAxios.response?.data as ErrorResponse | undefined
      setError(body?.error ?? 'Не удалось войти. Проверьте email и пароль.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wine className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Алкокалендарь</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Вход</h1>
        <p className="text-muted text-sm mb-6">
          Память подводит — календарь нет.
        </p>

        <label className="block text-sm font-medium text-muted mb-1">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </label>

        <label className="block text-sm font-medium text-muted mb-1 mt-4">
          Пароль
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
            className="mt-1 w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </label>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-danger/12 text-danger text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting ? 'Входим...' : 'Войти'}
        </button>

        <p className="mt-5 text-sm text-muted text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  )
}
