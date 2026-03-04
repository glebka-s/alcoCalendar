import { useState, useRef, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  LogOut,
  CalendarDays,
  Trophy,
  Wine,
  User,
  Camera,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useProfile, useUpdateName, useChangePassword } from '../hooks/useUser';
import { useStats } from '../hooks/useCalendar';
import NetworkError from '../components/NetworkError';

export default function ProfilePage() {
  const { logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: stats } = useStats(3);

  const achievements = [
    { label: 'Дней трезвости', value: stats?.soberDays ?? 0, icon: Trophy },
    { label: 'Всего записей', value: stats?.totalDays ?? 0, icon: CalendarDays },
    { label: 'Дней с алко', value: stats?.drankDays ?? 0, icon: Wine },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">Профиль</h1>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="text-center">
            <div className="text-3xl mb-2 animate-spin">⏳</div>
            <div className="text-sm">Загрузка...</div>
          </div>
        </div>
      )}

      {isError && <NetworkError onRetry={() => refetch()} />}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm ring-1 ring-border">
                <div className="flex flex-col items-center gap-3 p-6">
                  <span className="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/12 text-primary text-2xl font-bold">
                      {(profile.name ?? profile.email)[0].toUpperCase()}
                    </span>
                  </span>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{profile.name || 'Анонимный пользователь'}</p>
                    <p className="text-sm text-muted-foreground">Ведёт календарь {stats?.totalDays ?? 0} дн.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 lg:grid-cols-1"
            >
              {achievements.map((a) => (
                <div key={a.label} className="rounded-2xl bg-card p-4 ring-1 ring-border text-center lg:text-left">
                  <div className="flex flex-col items-center gap-1 lg:flex-row lg:gap-3">
                    <a.icon className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-xl font-bold text-foreground">{a.value}</span>
                      <span className="ml-2 text-xs text-muted-foreground hidden lg:inline">{a.label}</span>
                    </div>
                  </div>
                  <span className="mt-1 text-center text-xs text-muted-foreground leading-tight lg:hidden block">{a.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Settings card — nickname & avatar */}
            <SettingsCard
              currentName={profile.name || ''}
              email={profile.email}
            />

            {/* Password card */}
            <PasswordCard />

            {/* Logout */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={logout}
                className="inline-flex items-center whitespace-nowrap text-sm font-medium h-10 px-4 py-2 w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Выйти из аккаунта
              </button>
            </motion.div>

            <p className="text-center text-xs text-muted-foreground pb-4">Алкокалендарь v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsCard({ currentName }: { currentName: string; email: string }) {
  const updateName = useUpdateName();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(currentName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== currentName) {
      updateName.mutate(trimmed, {
        onSuccess: () => setEditingName(false),
      });
    } else {
      setEditingName(false);
      setName(currentName);
    }
  };

  const handleStartEdit = () => {
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm ring-1 ring-border">
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Настройки</h3>
        </div>
        <div className="p-0">
          {/* Nickname */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            {editingName ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') { setEditingName(false); setName(currentName); }
                  }}
                  placeholder="Введите никнейм"
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSaveName}
                  disabled={updateName.isPending}
                  className="rounded-lg p-1.5 text-sober hover:bg-sober/10 transition-colors cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { setEditingName(false); setName(currentName); }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-sm text-foreground">{currentName || 'Не указан'}</span>
                  <span className="block text-xs text-muted-foreground">Никнейм</span>
                </div>
                <button
                  onClick={handleStartEdit}
                  className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Изменить
                </button>
              </>
            )}
          </div>

          <div className="shrink-0 bg-border h-[1px] mx-5" />

          {/* Avatar */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Camera className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-foreground">Аватарка</span>
              <span className="block text-xs text-muted-foreground">Скоро</span>
            </div>
            <span className="text-xs text-muted-foreground opacity-50">Скоро</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePassword = useChangePassword();

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mismatch || !currentPassword || !newPassword) return;
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  };

  const inputClasses =
    'w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm ring-1 ring-border">
          <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Сменить пароль</h3>
          </div>
          <div className="p-0">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Текущий пароль"
                required
                minLength={8}
                autoComplete="current-password"
                className={inputClasses}
              />
            </div>
            <div className="shrink-0 bg-border h-[1px] mx-5" />
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary invisible">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Новый пароль"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClasses}
              />
            </div>
            <div className="shrink-0 bg-border h-[1px] mx-5" />
            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary invisible">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClasses} ${mismatch ? 'text-destructive' : ''}`}
                />
                {mismatch && (
                  <p className="text-xs text-destructive mt-1">Пароли не совпадают</p>
                )}
              </div>
            </div>
            <div className="px-5 pb-4">
              <button
                type="submit"
                disabled={changePassword.isPending || mismatch || !currentPassword || !newPassword}
                className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {changePassword.isPending ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
