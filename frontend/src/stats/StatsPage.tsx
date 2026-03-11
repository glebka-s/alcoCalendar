import { motion } from 'framer-motion';
import { Flame, BarChart3, DollarSign, Users } from 'lucide-react';
import { useStats } from '../hooks/useCalendar';
import NetworkError from '../components/NetworkError';

const DRINK_ICONS: Record<string, string> = {
  'Пиво': '🍺',
  'Вино': '🍷',
  'Крепкий алкоголь': '🥃',
  'Коктейль': '🍸',
  'Виски': '🥃',
  'Сидр': '🍺',
};

export default function StatsPage() {
  const { data, isLoading, isError, refetch } = useStats(3);

  const maxBarH = 100;
  const drankPct = data && data.totalDays > 0
    ? Math.round((data.drankDays / data.totalDays) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="font-display text-2xl font-bold md:text-3xl">Статистика</h1>
        <p className="mt-1 text-sm text-muted-foreground">Аналитика по твоему потреблению</p>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="text-center">
            <div className="text-3xl mb-2 animate-spin">⏳</div>
            <div className="text-sm">Загрузка...</div>
          </div>
        </div>
      )}

      {isError && <NetworkError onRetry={() => refetch()} />}

      {data && (
        <>
          {/* 4-column top stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-sober/8 p-4 ring-1 ring-sober/15 md:p-5"
            >
              <div className="text-3xl font-bold text-sober md:text-4xl">{data.soberPercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Трезвых дней</div>
              <div className="text-sm text-sober mt-0.5">{data.soberDays} из {data.totalDays}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-drinking/8 p-4 ring-1 ring-drinking/15 md:p-5"
            >
              <div className="text-3xl font-bold text-drinking md:text-4xl">{drankPct}%</div>
              <div className="text-xs text-muted-foreground mt-1">С алкоголем</div>
              <div className="text-sm text-drinking mt-0.5">{data.drankDays} из {data.totalDays}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card p-4 ring-1 ring-border md:p-5"
            >
              <Flame className="h-5 w-5 text-drinking mb-2" />
              <div className="text-2xl font-bold md:text-3xl">{data.longestDrinkingStreak}</div>
              <div className="text-xs text-muted-foreground">Серия дней с алкоголем</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl bg-card p-4 ring-1 ring-border md:p-5"
            >
              {data.favoriteDrink ? (
                <>
                  <span className="text-2xl">{DRINK_ICONS[data.favoriteDrink] ?? '🍸'}</span>
                  <div className="text-lg font-bold mt-1">{data.favoriteDrink}</div>
                  <div className="text-xs text-muted-foreground">Любимый напиток</div>
                </>
              ) : (
                <>
                  <span className="text-2xl">🍸</span>
                  <div className="text-lg font-bold mt-1">Нет данных</div>
                  <div className="text-xs text-muted-foreground">Любимый напиток</div>
                </>
              )}
            </motion.div>
          </div>

          {/* Weekly chart — full width */}
          <div className="space-y-6">
            {data.weeklyBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-card p-5 ring-1 ring-border md:p-6"
              >
                <h3 className="font-display text-sm font-semibold mb-5">По неделям</h3>
                <div className="flex items-end gap-4">
                  {data.weeklyBreakdown.map((w, i) => {
                    const total = w.soberDays + w.drankDays;
                    const soberH = total > 0 ? (w.soberDays / 7) * maxBarH : 0;
                    const drankH = total > 0 ? (w.drankDays / 7) * maxBarH : 0;
                    return (
                      <div key={i} className="flex-1 space-y-1.5">
                        <div className="flex flex-col gap-1">
                          {soberH > 0 && (
                            <div
                              className="w-full rounded-t-lg bg-sober/25"
                              style={{ height: soberH }}
                            />
                          )}
                          {drankH > 0 && (
                            <div
                              className="w-full rounded-b-lg bg-drinking/25"
                              style={{ height: drankH }}
                            />
                          )}
                        </div>
                        <div className="text-center text-[10px] text-muted-foreground">Нед {i + 1}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-sober/30" /> Трезвый
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-drinking/30" /> Пил
                  </span>
                </div>
              </motion.div>
            )}

          </div>

          {/* Coming soon — full width below */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="font-display text-sm font-semibold text-muted-foreground mb-3">Скоро</h3>
            <div className="space-y-3">
              {[
                { icon: BarChart3, title: 'Детальная аналитика', desc: 'Динамика потребления по неделям' },
                { icon: DollarSign, title: 'Учёт трат', desc: 'Сколько потрачено на алкоголь за месяц' },
                { icon: Users, title: 'Социальное', desc: 'Сравни себя с другими' },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-4 opacity-50"
                >
                  <f.icon className="h-5 w-5 text-primary/50" />
                  <div>
                    <div className="text-sm font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
