import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  BarChart3,
  Wine,
  TrendingDown,
  DollarSign,
  Users,
  ChevronRight,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Wine className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-bold text-sm text-gradient">Алкокалендарь</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/register')}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Начать
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial="hidden" animate="visible" className="max-w-2xl">
          <motion.div
            custom={0}
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-muted-foreground"
          >
            Память подводит — календарь нет
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-display mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Видеть. Понимать.{' '}
            <span className="text-gradient">Контролировать.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground"
          >
            Простой календарный трекер, который показывает реальную картину
            потребления алкоголя. Без нотаций и морали.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 animate-glow cursor-pointer"
            >
              Начать бесплатно
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-full glass px-8 py-3 font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
            >
              Посмотреть демо
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Calendar preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 w-full max-w-sm"
        >
          <div className="glass rounded-2xl p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Март 2026</span>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sober" />
                  Трезвый
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-drinking" />
                  Пил
                </span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => {
                const types = ['sober', 'drinking', 'sober', 'sober', 'drinking', 'sober', 'empty'] as const;
                const emojis = ['', '🍺', '', '', '🍷🥃', '', ''];
                const idx = i % 7;
                const type = types[idx];
                return (
                  <div
                    key={i}
                    className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-medium ${
                      type === 'sober'
                        ? 'bg-sober/12 text-sober ring-1 ring-sober/20'
                        : type === 'drinking'
                          ? 'bg-drinking/12 text-drinking ring-1 ring-drinking/20'
                          : 'bg-card text-muted-foreground'
                    }`}
                  >
                    {emojis[idx] || (i + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display mb-12 text-center text-3xl font-bold"
          >
            Как это работает
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Calendar, title: 'Отметь день', desc: 'Пил или нет — одно нажатие. Максимально просто.' },
              { icon: Wine, title: 'Добавь детали', desc: 'Какие напитки, сколько, во сколько. Плюс заметка.' },
              { icon: BarChart3, title: 'Смотри статистику', desc: 'Процент трезвых дней, паттерны, тренды.' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display mb-12 text-center text-3xl font-bold"
          >
            Почему Алкокалендарь
          </motion.h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Визуальная честность', desc: 'Один взгляд на календарь — и ты видишь правду.' },
              { title: 'Простой ввод', desc: 'Три нажатия, без лишних шагов. Работает и в 3 ночи.' },
              { title: 'Без давления', desc: 'Мы не заставляем бросать. Даём данные — решение за тобой.' },
              { title: 'Глубина в деталях', desc: 'Что пил, сколько, заметки — помогает выявлять триггеры.' },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass rounded-2xl p-6"
              >
                <h3 className="mb-2 font-semibold text-primary">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-display mb-2 text-3xl font-bold">Скоро в Алкокалендаре</h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingDown, title: 'Аналитика', desc: 'Динамика по неделям' },
              { icon: Wine, title: 'Любимый напиток', desc: 'Статистика + геймификация' },
              { icon: DollarSign, title: 'Учёт трат', desc: 'Сколько потрачено' },
              { icon: Users, title: 'Социальное', desc: 'Сравнение с другими' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass rounded-2xl border border-dashed border-border p-5 text-center"
              >
                <f.icon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <h3 className="text-sm font-medium">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-lg glass rounded-2xl p-10 text-center animate-glow"
        >
          <h2 className="font-display mb-3 text-2xl font-bold">Контроль без запретов</h2>
          <p className="mb-6 text-muted-foreground">
            Ты управляешь алкоголем, а не наоборот.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Начать отслеживать
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Алкокалендарь. Пей осознанно.
      </footer>
    </div>
  );
}
