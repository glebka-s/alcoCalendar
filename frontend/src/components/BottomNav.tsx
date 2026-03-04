import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, User } from 'lucide-react';

const tabs = [
  { path: '/calendar', label: 'Календарь', icon: Calendar },
  { path: '/stats', label: 'Статистика', icon: BarChart3 },
  { path: '/profile', label: 'Профиль', icon: User },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex-shrink-0 glass lg:hidden">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors cursor-pointer ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
