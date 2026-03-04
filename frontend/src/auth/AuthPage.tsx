import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wine, Eye, EyeOff } from 'lucide-react';
import { apiClient, setAuthTokens } from './apiClient';
import { useAuth } from './AuthContext';

type ErrorResponse = { error?: string };

interface AuthPageProps {
  defaultMode?: 'login' | 'register';
}

export default function AuthPage({ defaultMode = 'register' }: AuthPageProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await apiClient.post<
        { accessToken: string; refreshToken: string },
        { data: { accessToken: string; refreshToken: string } },
        { email: string; password: string }
      >(endpoint, { email, password });

      const tokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };
      setAuthTokens(tokens.accessToken, tokens.refreshToken);
      login(tokens);
      navigate('/calendar', { replace: true });
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: unknown } };
      const body = maybeAxios.response?.data as ErrorResponse | undefined;
      setError(
        body?.error ?? (isLogin ? 'Не удалось войти. Проверьте email и пароль.' : 'Не удалось зарегистрироваться.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel - branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 glass">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wine className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">Алкокалендарь</span>
          </div>

          <h1 className="font-display mb-4 text-4xl font-extrabold leading-tight">
            Память подводит —{' '}
            <span className="text-gradient">календарь нет.</span>
          </h1>

          <p className="mb-10 max-w-md text-lg text-muted-foreground">
            Отмечай, что пил, смотри статистику, замечай паттерны.
            Никакой морали — только данные.
          </p>

          {/* Mini preview */}
          <div className="flex max-w-xs gap-1.5">
            {Array.from({ length: 14 }, (_, i) => {
              const types = ['sober', 'drinking', 'sober', 'sober', 'drinking', 'sober', 'sober'] as const;
              const type = types[i % 7];
              return (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-md ${
                    type === 'sober' ? 'bg-sober/30' : 'bg-drinking/30'
                  }`}
                />
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wine className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-bold text-gradient">Алкокалендарь</span>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="mb-1 text-2xl font-bold">
              {isLogin ? 'Войти' : 'Создать аккаунт'}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {isLogin
                ? 'С возвращением! Введи данные для входа.'
                : 'Пара секунд — и календарь твой.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как тебя зовут?"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="mail@example.com"
                  className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    placeholder="Минимум 8 символов"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full rounded-full bg-primary py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting
                  ? (isLogin ? 'Входим...' : 'Создаём аккаунт...')
                  : (isLogin ? 'Войти' : 'Начать')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
