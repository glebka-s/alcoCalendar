import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, User, Wine } from 'lucide-react';

const tabs = [
  { path: '/calendar', label: 'Календарь', icon: Calendar },
  { path: '/stats', label: 'Статистика', icon: BarChart3 },
  { path: '/profile', label: 'Профиль', icon: User },
] as const;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[220px] flex-col border-r border-border bg-sidebar p-4">
      <div
        onClick={() => navigate('/')}
        className="mb-8 flex cursor-pointer items-center gap-2.5 px-2 pt-2"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Wine className="h-5 w-5 text-primary" />
        </div>
        <span className="font-display text-base font-bold text-foreground">Алкокалендарь</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <tab.icon className="h-[18px] w-[18px]" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="rounded-xl border border-dashed border-border p-3 text-center">
        <p className="text-xs text-muted-foreground">v1.0.0 · beta</p>
      </div>
    </aside>
  );
}
