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

function getBg(status: DayStatus, isSelected: boolean) {
  if (isSelected) return 'rgba(245, 158, 11, 0.15)';
  switch (status) {
    case 'Sober': return 'rgba(34, 197, 94, 0.1)';
    case 'Drank': return 'rgba(239, 68, 68, 0.1)';
    default: return 'rgba(255,255,255,0.03)';
  }
}

function getBorder(status: DayStatus, isSelected: boolean, isToday: boolean) {
  if (isSelected) return '2px solid rgba(245, 158, 11, 0.7)';
  if (isToday) return '2px solid rgba(129, 140, 248, 0.7)';
  switch (status) {
    case 'Sober': return '1px solid rgba(34, 197, 94, 0.3)';
    case 'Drank': return '1px solid rgba(239, 68, 68, 0.3)';
    default: return '1px solid rgba(255,255,255,0.06)';
  }
}

function StatusDot({ status }: { status: DayStatus }) {
  if (status === 'Unknown') return null;
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: status === 'Sober' ? '#22c55e' : '#ef4444',
      boxShadow: status === 'Sober' ? '0 0 6px #22c55e' : '0 0 6px #ef4444',
    }} />
  );
}

export default function DayCell({ day, dayNumber, isToday, isCurrentMonth, isSelected, onClick }: DayCellProps) {
  const status = day?.status ?? 'Unknown';
  const icons = (day?.drinkTypeNames ?? []).slice(0, 3);

  return (
    <button
      onClick={onClick}
      style={{
        border: getBorder(status, isSelected, isToday),
        borderRadius: 12,
        background: getBg(status, isSelected),
        minHeight: 90,
        padding: '10px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        textAlign: 'left',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease',
        opacity: isCurrentMonth ? 1 : 0.3,
        outline: 'none',
        width: '100%',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Day number + dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontWeight: isToday ? 800 : 600,
          fontSize: 16,
          color: isToday ? '#818cf8' : isSelected ? '#f59e0b' : isCurrentMonth ? '#e2e8f0' : '#334155',
          lineHeight: 1,
        }}>
          {dayNumber}
        </span>
        <StatusDot status={status} />
      </div>

      {/* Drink icons */}
      {icons.length > 0 && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {icons.map((name, i) => (
            <span key={i} style={{ fontSize: 18, lineHeight: 1 }} title={name}>
              {getDrinkIcon(name)}
            </span>
          ))}
        </div>
      )}

      {/* Volume */}
      {day && day.totalVolumeMl > 0 && (
        <span style={{
          fontSize: 11, color: '#64748b', marginTop: 'auto',
          fontWeight: 500,
        }}>
          {day.totalVolumeMl >= 1000
            ? `${(day.totalVolumeMl / 1000).toFixed(1)} л`
            : `${day.totalVolumeMl} мл`}
        </span>
      )}
    </button>
  );
}
