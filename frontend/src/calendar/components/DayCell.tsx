import { Check } from 'lucide-react';
import type { CalendarDay, DayStatus } from '../../types/calendar';

interface DayCellProps {
  day: CalendarDay | null;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const DRINK_ICONS: Record<string, string> = {
  'Пиво': '🍺',
  'Вино': '🍷',
  'Водка': '🥃',
  'Коктейль': '🍹',
  'Шампанское': '🥂',
  'Виски': '🥃',
  'Ром': '🥃',
  'Джин': '🥃',
  'Текила': '🥃',
  'Сидр': '🍺',
  'Бренди': '🥃',
  'Ликёр': '🍶',
  'Крепкий алкоголь': '🥃',
};

function getDrinkIcon(name: string): string {
  return DRINK_ICONS[name] ?? '🍸';
}

function cellClasses(status: DayStatus, isSelected: boolean, isToday: boolean, isCurrentMonth: boolean) {
  const base =
    'rounded-xl w-full h-full p-1.5 sm:p-2 flex flex-col gap-0.5 text-left transition-all duration-150 outline-none cursor-pointer border';

  const opacity = isCurrentMonth ? '' : 'opacity-30';

  if (isSelected) {
    return `${base} ${opacity} bg-primary/15 border-primary/60 ring-2 ring-primary/30`;
  }

  if (isToday) {
    const statusClasses =
      status === 'Sober'
        ? 'bg-sober/12 border-sober/40'
        : status === 'Drank'
          ? 'bg-drinking/12 border-drinking/40'
          : 'bg-card border-primary/50';
    return `${base} ${opacity} ${statusClasses} ring-2 ring-primary/25`;
  }

  switch (status) {
    case 'Sober':
      return `${base} ${opacity} bg-sober/10 border-sober/25 hover:border-sober/50 hover:bg-sober/15`;
    case 'Drank':
      return `${base} ${opacity} bg-drinking/10 border-drinking/25 hover:border-drinking/50 hover:bg-drinking/15`;
    default:
      return `${base} ${opacity} bg-card/60 border-border hover:border-muted hover:bg-card`;
  }
}

export default function DayCell({ day, dayNumber, isToday, isCurrentMonth, isSelected, onClick }: DayCellProps) {
  const status = day?.status ?? 'Unknown';
  const icons = (day?.drinkTypeNames ?? []).slice(0, 3);

  return (
    <button onClick={onClick} className={cellClasses(status, isSelected, isToday, isCurrentMonth)}>
      <div className="flex justify-between items-center">
        <span
          className={`font-semibold text-sm sm:text-base leading-none ${
            isToday
              ? 'text-primary font-extrabold'
              : isSelected
                ? 'text-primary'
                : isCurrentMonth
                  ? 'text-foreground'
                  : 'text-muted/50'
          }`}
        >
          {dayNumber}
        </span>
        {status === 'Sober' && <Check className="w-3.5 h-3.5 text-sober" />}
        {status === 'Drank' && (
          <span className="w-2 h-2 rounded-full bg-drinking shadow-[0_0_6px] shadow-drinking" />
        )}
      </div>

      {icons.length > 0 && (
        <div className="flex gap-0.5 flex-wrap">
          {icons.map((name, i) => (
            <span key={i} className="text-base sm:text-lg leading-none" title={name}>
              {getDrinkIcon(name)}
            </span>
          ))}
        </div>
      )}

      {day && day.totalVolumeMl > 0 && (
        <span className="text-[10px] sm:text-xs text-muted mt-auto font-medium">
          {day.totalVolumeMl >= 1000
            ? `${(day.totalVolumeMl / 1000).toFixed(1)}л`
            : `${day.totalVolumeMl}мл`}
        </span>
      )}
    </button>
  );
}
