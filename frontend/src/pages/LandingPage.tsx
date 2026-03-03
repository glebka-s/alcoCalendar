import { Link } from 'react-router-dom';
import {
  CalendarDays,
  PenLine,
  BarChart3,
  Eye,
  Zap,
  Brain,
  Layers,
  TrendingUp,
  Beer,
  Wallet,
  Users,
  Wine,
  Check,
  X,
} from 'lucide-react';

const howItWorks = [
  { icon: CalendarDays, title: 'Отметь день', desc: 'Пил или нет — один клик' },
  { icon: PenLine, title: 'Добавь детали', desc: 'Что, сколько и когда' },
  { icon: BarChart3, title: 'Смотри статистику', desc: 'Тренды и прогресс' },
];

const why = [
  { icon: Eye, title: 'Визуальная честность', desc: 'Календарь не даст соврать себе' },
  { icon: Zap, title: 'Простой ввод', desc: 'Минимум действий — максимум данных' },
  { icon: Brain, title: 'Осознанность без давления', desc: 'Без нотаций и морализаторства' },
  { icon: Layers, title: 'Глубина в деталях', desc: 'Объём, время, напиток — всё учтено' },
];

const roadmap = [
  { icon: TrendingUp, title: 'Персональная аналитика' },
  { icon: Beer, title: 'Любимый напиток' },
  { icon: Wallet, title: 'Учёт трат' },
  { icon: Users, title: 'Социальная статистика' },
];

const previewDays = [
  { day: 24, status: 'sober' },
  { day: 25, status: 'drank', icons: ['🍺'] },
  { day: 26, status: 'sober' },
  { day: 27, status: 'drank', icons: ['🍷', '🍹'] },
  { day: 28, status: 'sober' },
  { day: 1, status: 'sober' },
  { day: 2, status: 'unknown' },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-auto">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-6 border border-primary/25">
          <Wine className="w-4 h-4" />
          Алкокалендарь
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl mb-4">
          Видеть. Понимать.{' '}
          <span className="text-primary">Контролировать.</span>
        </h1>
        <p className="text-muted text-lg max-w-md mb-8">
          Простой и честный инструмент для отслеживания алкоголя.
          Без осуждений — только факты.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Начать бесплатно
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-card transition-colors"
          >
            Войти
          </Link>
        </div>
      </section>

      {/* Mini preview */}
      <section className="flex justify-center px-6 pb-16">
        <div className="grid grid-cols-7 gap-2 max-w-sm w-full">
          {previewDays.map((d) => (
            <div
              key={d.day}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold border transition-all ${
                d.status === 'sober'
                  ? 'bg-sober/15 border-sober/30 text-sober'
                  : d.status === 'drank'
                    ? 'bg-drinking/15 border-drinking/30 text-drinking'
                    : 'bg-card border-border text-muted'
              }`}
            >
              <span className="text-base font-bold">{d.day}</span>
              {d.status === 'sober' && <Check className="w-3.5 h-3.5 mt-0.5" />}
              {d.status === 'drank' && (
                <div className="flex gap-0.5 mt-0.5">
                  {(d.icons ?? []).map((ic, i) => (
                    <span key={i} className="text-xs">{ic}</span>
                  ))}
                </div>
              )}
              {d.status === 'unknown' && <X className="w-3 h-3 mt-0.5 opacity-40" />}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Как это работает</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {howItWorks.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-card border border-border p-6 text-center hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Почему Алкокалендарь</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {why.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-card border border-border p-6 flex gap-4 items-start hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex-shrink-0 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Скоро</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roadmap.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="rounded-2xl border-2 border-dashed border-border p-5 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-muted" />
              </div>
              <span className="text-sm font-medium text-muted">{title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16 text-center">
        <div className="max-w-md mx-auto rounded-2xl bg-card border border-border p-10">
          <h2 className="text-2xl font-bold mb-3">Контроль без запретов</h2>
          <p className="text-muted text-sm mb-6">
            Начни вести календарь уже сегодня. Это бесплатно.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-muted py-8 border-t border-border">
        © 2026 Алкокалендарь. Пей осознанно.
      </footer>
    </div>
  );
}
