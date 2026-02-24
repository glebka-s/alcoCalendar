import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiClient, setAuthTokens } from './apiClient'
import { useAuth } from './AuthContext'

type ErrorResponse = { error?: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== password2) {
      setError('Пароли не совпадают.')
      return
    }

    setSubmitting(true)
    try {
      const response = await apiClient.post<
        { accessToken: string; refreshToken: string },
        { data: { accessToken: string; refreshToken: string } },
        { email: string; password: string }
      >('/auth/register', { email, password })

      const tokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }
      setAuthTokens(tokens.accessToken, tokens.refreshToken)
      login(tokens)
      navigate('/app', { replace: true })
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: unknown } }
      const body = maybeAxios.response?.data as ErrorResponse | undefined
      setError(body?.error ?? 'Не удалось зарегистрироваться.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#020617',
          padding: '2rem',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(15,23,42,0.6)',
          color: 'white',
        }}
      >
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Регистрация</h1>
        <p style={{ marginBottom: '1.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>Создайте аккаунт, чтобы начать вести календарь.</p>

        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              marginTop: 4,
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #4b5563',
              background: '#020617',
              color: 'white',
              fontSize: '0.9rem',
            }}
          />
        </label>

        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, marginTop: 12 }}>
          Пароль
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={{
              marginTop: 4,
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #4b5563',
              background: '#020617',
              color: 'white',
              fontSize: '0.9rem',
            }}
          />
        </label>

        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, marginTop: 12 }}>
          Повтор пароля
          <input
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            style={{
              marginTop: 4,
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 8,
              border: '1px solid #4b5563',
              background: '#020617',
              color: 'white',
              fontSize: '0.9rem',
            }}
          />
        </label>

        {error && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 4,
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              background: 'rgba(248,113,113,0.12)',
              color: '#fecaca',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 16,
            width: '100%',
            padding: '0.6rem 0.75rem',
            borderRadius: 999,
            border: 'none',
            background: submitting ? '#4b5563' : 'linear-gradient(135deg,#22c55e,#4ade80)',
            color: '#020617',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>

        <p style={{ marginTop: 16, fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none' }}>
            Войти
          </Link>
        </p>
      </form>
    </div>
  )
}

