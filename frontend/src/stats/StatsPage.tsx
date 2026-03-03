import { useState } from 'react';
import {
  TrendingUp,
  Flame,
  Trophy,
  Beer,
  Droplets,
} from 'lucide-react';
import { useStats } from '../hooks/useCalendar';
import NetworkError from '../components/NetworkError';

export default function StatsPage() {
  const [months, setMonths] = useState(3);
  const { data, isLoading, isError, refetch } = useStats(months);

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 gap-6 overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          Статистика
        </h1>
        <div className="flex gap-1.5">
          {[1, 3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                months === m
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted hover:text-foreground'
              }`}
            >
              {m === 12 ? '1 год' : `${m} мес`}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-muted">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-spin">⏳</div>
            <div className="text-sm">Загрузка...</div>
          </div>
        </div>
      )}

      {isError && <NetworkError onRetry={() => refetch()} />}

      {data && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard
              icon={TrendingUp}
              label="Трезвых дней"
              value={`${data.soberPercent}%`}
              subtitle={`${data.soberDays} из ${data.totalDays}`}
              variant="sober"
            />
            <MetricCard
              icon={Flame}
              label="Текущая серия"
              value={`${data.currentSoberStreak}`}
              subtitle="дней подряд"
              variant="primary"
            />
            <MetricCard
              icon={Trophy}
              label="Макс. серия"
              value={`${data.longestSoberStreak}`}
              subtitle="дней подряд"
              variant="primary"
            />
            <MetricCard
              icon={Beer}
              label="Любимый напиток"
              value={data.favoriteDrink ?? '—'}
              variant="drinking"
            />
            <MetricCard
              icon={Droplets}
              label="Общий объём"
              value={
                data.totalVolumeMl >= 1000
                  ? `${(data.totalVolumeMl / 1000).toFixed(1)}л`
                  : `${data.totalVolumeMl}мл`
              }
              variant="muted"
            />
          </div>

          {/* Weekly chart */}
          {data.weeklyBreakdown.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
                По неделям
              </h2>
              <div className="flex items-end gap-1 h-40">
                {data.weeklyBreakdown.map((w, i) => {
                  const total = w.soberDays + w.drankDays;
                  const maxDays = 7;
                  const soberH = total > 0 ? (w.soberDays / maxDays) * 100 : 0;
                  const drankH = total > 0 ? (w.drankDays / maxDays) * 100 : 0;

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-0.5"
                      title={`${w.weekStart}: ${w.soberDays} трезвых, ${w.drankDays} пил`}
                    >
                      <div className="w-full flex flex-col gap-px">
                        {drankH > 0 && (
                          <div
                            className="w-full bg-drinking/60 rounded-t-sm"
                            style={{ height: `${drankH}%`, minHeight: drankH > 0 ? 2 : 0 }}
                          />
                        )}
                        {soberH > 0 && (
                          <div
                            className="w-full bg-sober/60 rounded-b-sm"
                            style={{ height: `${soberH}%`, minHeight: soberH > 0 ? 2 : 0 }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sober/60" />
                  Трезвые
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-drinking/60" />
                  Пил
                </span>
              </div>
            </div>
          )}

          {/* Coming soon cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            <ComingSoonCard title="Детальная аналитика" desc="Тренды по месяцам и сравнение периодов" />
            <ComingSoonCard title="Учёт расходов" desc="Сколько денег уходит на алкоголь" />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  variant: 'sober' | 'drinking' | 'primary' | 'muted';
}) {
  const colorClass =
    variant === 'sober'
      ? 'text-sober'
      : variant === 'drinking'
        ? 'text-drinking'
        : variant === 'primary'
          ? 'text-primary'
          : 'text-muted';

  const iconBg =
    variant === 'sober'
      ? 'bg-sober/15'
      : variant === 'drinking'
        ? 'bg-drinking/15'
        : variant === 'primary'
          ? 'bg-primary/15'
          : 'bg-card';

  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${colorClass}`} />
      </div>
      <span className={`text-2xl font-extrabold leading-none ${colorClass}`}>{value}</span>
      <span className="text-xs text-muted">{label}</span>
      {subtitle && <span className="text-[10px] text-muted/70">{subtitle}</span>}
    </div>
  );
}

function ComingSoonCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-5 text-center">
      <h3 className="font-semibold text-sm text-muted mb-1">{title}</h3>
      <p className="text-xs text-muted/70">{desc}</p>
      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-card text-[10px] text-muted uppercase tracking-wider">
        Скоро
      </span>
    </div>
  );
}
