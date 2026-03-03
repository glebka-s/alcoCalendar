import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthCalendar } from '../hooks/useCalendar';
import type { CalendarDay } from '../types/calendar';
import DayCell from './components/DayCell';
import DayDetailsModal from './components/DayDetailsModal';
import NetworkError from '../components/NetworkError';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function getToday() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface GridCell {
  dayNumber: number;
  date: string;
  isCurrentMonth: boolean;
}

function buildGrid(year: number, month: number): GridCell[] {
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const cells: GridCell[] = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ dayNumber: daysInPrev - i, date: toDateString(prevYear, prevMonth, daysInPrev - i), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ dayNumber: d, date: toDateString(year, month, d), isCurrentMonth: true });
  const rem = cells.length % 7;
  if (rem !== 0)
    for (let d = 1; d <= 7 - rem; d++)
      cells.push({ dayNumber: d, date: toDateString(nextYear, nextMonth, d), isCurrentMonth: false });
  return cells;
}

function MonthStats({ days }: { days: CalendarDay[] }) {
  const sober = days.filter(d => d.status === 'Sober').length;
  const drank = days.filter(d => d.status === 'Drank').length;
  const vol = days.reduce((s, d) => s + d.totalVolumeMl, 0);
  const total = days.filter(d => d.status !== 'Unknown').length;
  const pct = total > 0 ? Math.round((sober / total) * 100) : null;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <StatCard label="Трезвых" value={sober} variant="sober" />
      <StatCard label="Пил" value={drank} variant="drinking" />
      {vol > 0 && (
        <StatCard
          label="Выпито"
          value={vol >= 1000 ? `${(vol / 1000).toFixed(1)}л` : `${vol}мл`}
          variant="primary"
        />
      )}
      {pct !== null && (
        <StatCard label="Трезвость" value={`${pct}%`} variant="primary" />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant: 'sober' | 'drinking' | 'primary';
}) {
  const colorClass =
    variant === 'sober'
      ? 'text-sober'
      : variant === 'drinking'
        ? 'text-drinking'
        : 'text-primary';
  return (
    <div className="px-3 py-2 rounded-xl bg-card border border-border flex flex-col gap-0.5 min-w-[70px]">
      <span className={`text-lg sm:text-xl font-extrabold leading-none ${colorClass}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function CalendarPage() {
  const today = getToday();

  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useMonthCalendar(viewYear, viewMonth);

  const dayMap = useMemo(() => {
    const m: Record<string, CalendarDay> = {};
    data?.days.forEach(d => { m[d.date] = d; });
    return m;
  }, [data]);

  const gridCells = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const todayStr = toDateString(today.year, today.month, today.day);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-card-hover transition-colors cursor-pointer"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-foreground min-w-[180px] text-center tracking-tight">
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </h1>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-card-hover transition-colors cursor-pointer"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setViewYear(today.year); setViewMonth(today.month); }}
            className="px-3 py-1.5 rounded-lg bg-primary/12 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
          >
            Сегодня
          </button>
        </div>

        {data && data.days.length > 0 && <MonthStats days={data.days} />}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <div className="text-sm">Загрузка...</div>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && <NetworkError onRetry={() => refetch()} />}

      {/* Calendar grid */}
      {!isLoading && !isError && (
        <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 flex-shrink-0">
            {WEEKDAY_LABELS.map(label => (
              <div
                key={label}
                className="text-center text-[11px] font-bold text-muted uppercase tracking-widest py-1"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 overflow-hidden" style={{ gridAutoRows: '1fr' }}>
            {gridCells.map(cell => (
              <DayCell
                key={cell.date}
                day={dayMap[cell.date] ?? null}
                dayNumber={cell.dayNumber}
                isToday={cell.date === todayStr}
                isCurrentMonth={cell.isCurrentMonth}
                isSelected={cell.date === selectedDate}
                onClick={() => setSelectedDate(prev => prev === cell.date ? null : cell.date)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal popup */}
      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          year={viewYear}
          month={viewMonth}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
