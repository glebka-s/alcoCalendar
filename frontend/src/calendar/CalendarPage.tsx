import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonthCalendar } from '../hooks/useCalendar';
import type { CalendarDay } from '../types/calendar';
import DayCell from './components/DayCell';
import DayDetailsModal from './components/DayDetailsModal';
import NetworkError from '../components/NetworkError';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
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

function SideStats({ days }: { days: CalendarDay[] }) {
  const total = days.filter(d => d.status !== 'Unknown').length;
  const sober = days.filter(d => d.status === 'Sober').length;
  const drank = days.filter(d => d.status === 'Drank').length;
  const soberPct = total > 0 ? Math.round((sober / total) * 100) : 0;
  const drankPct = total > 0 ? Math.round((drank / total) * 100) : 0;

  return (
    <div className="w-full space-y-4 lg:w-72" style={{ opacity: 1 }}>
      {/* Month overview */}
      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Обзор месяца</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Трезвых дней</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-sober transition-all" style={{ width: `${soberPct}%` }} />
              </div>
              <span className="text-sm font-bold text-sober">{soberPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">С алкоголем</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-drinking transition-all" style={{ width: `${drankPct}%` }} />
              </div>
              <span className="text-sm font-bold text-drinking">{drankPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <div className="rounded-2xl bg-sober/8 p-4 ring-1 ring-sober/15">
          <div className="text-2xl font-bold text-sober">{sober}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Трезвых дней</div>
        </div>
        <div className="rounded-2xl bg-drinking/8 p-4 ring-1 ring-drinking/15">
          <div className="text-2xl font-bold text-drinking">{drank}</div>
          <div className="text-xs text-muted-foreground mt-0.5">С алкоголем</div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Легенда</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-md bg-sober/30 ring-1 ring-sober/30" />
            <span className="text-muted-foreground">Трезвый день</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-md bg-drinking/30 ring-1 ring-drinking/30" />
            <span className="text-muted-foreground">День с алкоголем</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-md bg-card ring-1 ring-border" />
            <span className="text-muted-foreground">Не заполнен</span>
          </div>
        </div>
      </div>
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
    <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">Календарь</h1>
        <p className="mt-1 text-sm text-muted-foreground">Отмечай каждый день — строй честную картину</p>
      </motion.div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Calendar */}
        <div className="flex-1">
          {/* Month nav */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="rounded-xl p-2.5 transition-colors hover:bg-card cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <motion.h2
              key={`${viewYear}-${viewMonth}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-lg font-semibold"
            >
              {MONTHS[viewMonth - 1]} {viewYear}
            </motion.h2>
            <button
              onClick={nextMonth}
              className="rounded-xl p-2.5 transition-colors hover:bg-card cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <div className="text-center">
                <div className="text-3xl mb-2 animate-spin">⏳</div>
                <div className="text-sm">Загрузка...</div>
              </div>
            </div>
          )}

          {/* Error */}
          {isError && <NetworkError onRetry={() => refetch()} />}

          {/* Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-7 gap-1.5 md:gap-2" style={{ opacity: 1 }}>
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {gridCells.map((cell) => {
                const isDisabled = cell.date >= todayStr;
                return (
                  <DayCell
                    key={cell.date}
                    day={dayMap[cell.date] ?? null}
                    dayNumber={cell.dayNumber}
                    isToday={cell.date === todayStr}
                    isCurrentMonth={cell.isCurrentMonth}
                    disabled={isDisabled}
                    onClick={() => { if (!isDisabled) setSelectedDate(cell.date); }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Side stats */}
        {data && data.days.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block"
          >
            <SideStats days={data.days} />
          </motion.div>
        )}
      </div>

      {/* Day detail modal */}
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
