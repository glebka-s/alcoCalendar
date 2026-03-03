import { NavLink } from 'react-router-dom';
import { Calendar, BarChart3, Settings } from 'lucide-react';

const links = [
  { to: '/calendar', label: 'Календарь', icon: Calendar },
  { to: '/stats', label: 'Статистика', icon: BarChart3 },
  { to: '/settings', label: 'Настройки', icon: Settings },
] as const;

export default function BottomNav() {
  return (
    <nav className="flex-shrink-0 border-t border-border bg-surface/80 backdrop-blur-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
