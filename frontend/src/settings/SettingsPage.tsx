import { useState, type FormEvent } from 'react';
import { LogOut, User, Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useProfile, useUpdateName, useChangePassword } from '../hooks/useUser';
import NetworkError from '../components/NetworkError';

const inputClasses =
  'w-full px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors';

export default function SettingsPage() {
  const { logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-6 overflow-auto">
      <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
        Настройки
      </h1>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <div className="text-sm">Загрузка...</div>
          </div>
        </div>
      )}

      {isError && <NetworkError onRetry={() => refetch()} />}

      {profile && (
        <div className="flex flex-col gap-5 max-w-md">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{profile.name || 'Без имени'}</div>
                <div className="text-sm text-muted">{profile.email}</div>
              </div>
            </div>
          </div>

          <NameForm currentName={profile.name ?? ''} />
          <PasswordForm />

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
}

function NameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const updateName = useUpdateName();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) updateName.mutate(name.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3"
    >
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Имя
      </h2>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ваше имя"
        maxLength={100}
        className={inputClasses}
      />
      <button
        type="submit"
        disabled={updateName.isPending || name.trim() === currentName}
        className="py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {updateName.isPending ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePassword = useChangePassword();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
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

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3"
    >
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lock className="w-4 h-4 text-primary" />
        Сменить пароль
      </h2>
      <input
        type="password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        placeholder="Текущий пароль"
        required
        minLength={8}
        autoComplete="current-password"
        className={inputClasses}
      />
      <input
        type="password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        placeholder="Новый пароль"
        required
        minLength={8}
        autoComplete="new-password"
        className={inputClasses}
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Повторите новый пароль"
        required
        minLength={8}
        autoComplete="new-password"
        className={`${inputClasses} ${mismatch ? 'border-danger/60' : ''}`}
      />
      {mismatch && (
        <p className="text-danger text-xs">Пароли не совпадают</p>
      )}
      <button
        type="submit"
        disabled={changePassword.isPending || mismatch || !currentPassword || !newPassword}
        className="py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {changePassword.isPending ? 'Изменение...' : 'Изменить пароль'}
      </button>
    </form>
  );
}
