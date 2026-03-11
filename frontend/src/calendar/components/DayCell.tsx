import type { CalendarDay } from '../../types/calendar';

interface DayCellProps {
  day: CalendarDay | null;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  disabled?: boolean;
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

export default function DayCell({ day, dayNumber, isToday, isCurrentMonth, disabled, onClick }: DayCellProps) {
  const status = day?.status ?? 'Unknown';
  const icons = (day?.drinkTypeNames ?? []).slice(0, 3);
  const drinkStr = icons.map(getDrinkIcon).join('');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-medium transition-all md:h-14 md:rounded-2xl ${
        !isCurrentMonth
          ? 'invisible'
          : disabled
            ? 'bg-card text-muted-foreground/40 cursor-not-allowed opacity-40'
            : status === 'Sober'
              ? 'bg-sober/12 text-sober ring-1 ring-sober/20 hover:scale-105 hover:shadow-md cursor-pointer'
              : status === 'Drank'
                ? 'bg-drinking/12 text-drinking ring-1 ring-drinking/20 hover:scale-105 hover:shadow-md cursor-pointer'
                : 'bg-card text-muted-foreground hover:scale-105 hover:shadow-md cursor-pointer'
      } ${isToday ? 'ring-2 ring-primary/50' : ''}`}
    >
      {drinkStr ? (
        <span className="text-[10px] md:text-xs">{drinkStr.slice(0, 6)}</span>
      ) : (
        <span className={`md:text-sm ${isToday ? 'font-bold text-primary' : ''}`}>{dayNumber}</span>
      )}
    </button>
  );
}
