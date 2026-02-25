import { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useMonthCalendar } from '../hooks/useCalendar';
import type { CalendarDay } from '../types/calendar';
import DayCell from './components/DayCell';
import DayDetailsPanel from './components/DayDetailsPanel';

const WEEKDAY_LABELS_FULL = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <Stat label="Трезвых" value={sober} color="#4ade80" />
      <Stat label="Пил" value={drank} color="#f87171" />
      {vol > 0 && <Stat label="Выпито" value={vol >= 1000 ? `${(vol / 1000).toFixed(1)}л` : `${vol}мл`} color="#818cf8" />}
      {pct !== null && <Stat label="Трезвость" value={`${pct}%`} color="#fbbf24" />}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      padding: '10px 18px', borderRadius: 12,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80,
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

export default function CalendarPage() {
  const { logout } = useAuth();
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
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #0a0f1e 0%, #12183a 40%, #0d1424 100%)',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <header style={{
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0, position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📅</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            AlcoCalendar
          </span>
        </div>
        <button onClick={logout} style={{
          padding: '7px 16px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#64748b',
          cursor: 'pointer', fontSize: 13,
          transition: 'all 0.2s',
        }}>
          Выйти
        </button>
      </header>

      {/* Body: calendar + optional side panel */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0,
      }}>

        {/* Calendar section */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '20px 28px',
          overflow: 'hidden', minWidth: 0,
        }}>

          {/* Top bar: nav + stats */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12, gap: 12, flexWrap: 'wrap', flexShrink: 0,
          }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={prevMonth} style={navBtn} aria-label="Предыдущий месяц">‹</button>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                color: '#f1f5f9', letterSpacing: '-0.5px',
                minWidth: 200, textAlign: 'center',
              }}>
                {MONTH_NAMES[viewMonth - 1]} {viewYear}
              </h1>
              <button onClick={nextMonth} style={navBtn} aria-label="Следующий месяц">›</button>
              <button onClick={() => { setViewYear(today.year); setViewMonth(today.month); }} style={{
                padding: '8px 16px', marginLeft: 4,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.35)',
                borderRadius: 8, color: '#818cf8',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                Сегодня
              </button>
            </div>

            {/* Stats */}
            {data && data.days.length > 0 && <MonthStats days={data.days} />}
          </div>

          {/* States */}
          {isLoading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
                <div style={{ fontSize: 15 }}>Загрузка...</div>
              </div>
            </div>
          )}

          {isError && (
            <div style={{
              padding: '32px', textAlign: 'center', color: '#f87171',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
              Ошибка загрузки данных.
              <button onClick={() => refetch()} style={{
                marginLeft: 12, padding: '6px 14px',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 7, color: '#f87171', cursor: 'pointer', fontSize: 13,
              }}>
                Повторить
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Weekday headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 6, marginBottom: 6, flexShrink: 0,
              }}>
                {WEEKDAY_LABELS_FULL.map(label => (
                  <div key={label} style={{
                    textAlign: 'center', fontSize: 11, fontWeight: 700,
                    color: '#475569', padding: '3px 0',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {label}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gridAutoRows: '1fr',
                gap: 6, flex: 1, minHeight: 0, overflow: 'hidden',
              }}>
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

              {/* Legend */}
              <div style={{
                marginTop: 6, display: 'flex', gap: 12, flexShrink: 0,
                fontSize: 10, color: '#475569', flexWrap: 'wrap', alignItems: 'center',
              }}>
                <LegendItem color="#22c55e" label="Не пил" />
                <LegendItem color="#ef4444" label="Пил" />
                <LegendItem color="rgba(255,255,255,0.12)" label="Не задано" />
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block', outline: '2px solid #818cf8', outlineOffset: 1 }} />
                  Сегодня
                </span>
                {selectedDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, display: 'inline-block', outline: '2px solid #f59e0b', outlineOffset: 1 }} />
                    Выбранный день
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side panel for day details */}
        {selectedDate && (
          <DayDetailsPanel
            date={selectedDate}
            year={viewYear}
            month={viewMonth}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 40, height: 40,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, color: '#e2e8f0',
  cursor: 'pointer', fontSize: 24,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
};

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        display: 'inline-block', width: 10, height: 10, borderRadius: 2,
        background: color === 'rgba(255,255,255,0.12)' ? color : `${color}25`,
        border: `2px solid ${color}`,
        flexShrink: 0,
      }} />
      {label}
    </span>
  );
}
