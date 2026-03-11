import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { AddEventRequest } from '../../types/calendar';
import {
  useDayDetails,
  useDrinkTypes,
  useSetDayStatus,
  useAddEvent,
  useDeleteEvent,
} from '../../hooks/useCalendar';

interface DayDetailsModalProps {
  date: string;
  year: number;
  month: number;
  onClose: () => void;
}

const MONTH_NAMES = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const weekday = WEEKDAYS[d.getDay()];
  return `${day} ${month}, ${weekday}`;
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : '';
}

const DRINK_ICONS: Record<string, string> = {
  'Пиво': '🍺',
  'Вино': '🍷',
  'Крепкий алкоголь': '🥃',
  'Коктейль': '🍸',
  'Сидр': '🍺',
};

const DEFAULT_VOLUMES: Record<string, number> = {
  'Пиво': 500,
  'Вино': 100,
  'Крепкий алкоголь': 50,
  'Сидр': 500,
  'Коктейль': 200,
};

type View = 'details' | 'setStatus' | 'pickDrink' | 'drinkForm';

const slideVariants = {
  enterFromRight: { opacity: 0, x: 24 },
  enterFromLeft: { opacity: 0, x: -24 },
  center: { opacity: 1, x: 0 },
  exitToLeft: { opacity: 0, x: -24 },
  exitToRight: { opacity: 0, x: 24 },
};

export default function DayDetailsModal({ date, year, month, onClose }: DayDetailsModalProps) {
  const [view, setView] = useState<View>('details');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [pendingStatus, setPendingStatus] = useState<'Sober' | 'Drank' | null>(null);
  const [selectedDrinkTypeId, setSelectedDrinkTypeId] = useState<number | null>(null);
  const [volumeStr, setVolumeStr] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const { data: dayDetails, isLoading: detailsLoading } = useDayDetails(date);
  const { data: drinkTypes = [] } = useDrinkTypes();
  const setDayStatusMutation = useSetDayStatus(year, month);
  const addEventMutation = useAddEvent(date, year, month);
  const deleteEventMutation = useDeleteEvent(date, year, month);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isUnset = !dayDetails || dayDetails.status === 'Unknown';
  const isDrank = dayDetails?.status === 'Drank';

  const navigateTo = (next: View, dir: 'forward' | 'back') => {
    setDirection(dir);
    setView(next);
  };

  const handleSoberClick = async () => {
    await setDayStatusMutation.mutateAsync({ date, request: { status: 'Sober' } });
    onClose();
  };

  const handleDrankClick = () => {
    setPendingStatus('Drank');
    navigateTo('pickDrink', 'forward');
  };

  const handlePickDrink = (drinkTypeId: number) => {
    setSelectedDrinkTypeId(drinkTypeId);
    const drinkName = drinkTypes.find(d => d.id === drinkTypeId)?.name ?? '';
    setVolumeStr(String(DEFAULT_VOLUMES[drinkName] ?? 50));
    setTime('');
    setNotes('');
    navigateTo('drinkForm', 'forward');
  };

  const handleSubmitDrink = async () => {
    if (!selectedDrinkTypeId) return;
    const volumeMl = parseInt(volumeStr, 10);
    if (!volumeMl || volumeMl <= 0) return;

    const req: AddEventRequest = {
      drinkTypeId: selectedDrinkTypeId,
      volumeMl,
      notes: notes.trim() || undefined,
      time: time || undefined,
    };

    if (pendingStatus === 'Drank' && isUnset) {
      await setDayStatusMutation.mutateAsync({ date, request: { status: 'Drank', event: req } });
    } else {
      await addEventMutation.mutateAsync(req);
    }
    setPendingStatus(null);
    setSelectedDrinkTypeId(null);
    navigateTo('details', 'forward');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Удалить эту запись?')) {
      await deleteEventMutation.mutateAsync(eventId);
    }
  };

  const adjustVolume = (delta: number) => {
    const current = parseInt(volumeStr, 10) || 0;
    const next = Math.max(50, Math.min(10000, current + delta));
    setVolumeStr(String(next));
  };

  const isActionLoading =
    setDayStatusMutation.isPending ||
    addEventMutation.isPending ||
    deleteEventMutation.isPending;

  const inputClasses =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-inset focus:ring-primary/30 accent-primary [color-scheme:dark]';

  const enterVariant = direction === 'forward' ? slideVariants.enterFromRight : slideVariants.enterFromLeft;
  const exitVariant = direction === 'forward' ? slideVariants.exitToLeft : slideVariants.exitToRight;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-lg font-bold">
            {formatDate(date)}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {detailsLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Загрузка...</p>
        )}

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {/* Details view */}
            {view === 'details' && !detailsLoading && (
              <motion.div
                key="details"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="flex flex-col gap-4"
              >
                {/* Status toggle */}
                {isUnset && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSoberClick}
                      disabled={isActionLoading}
                      className="flex-1 rounded-xl bg-sober/15 py-3 font-semibold text-sober transition-colors hover:bg-sober/25 disabled:opacity-50 cursor-pointer"
                    >
                      ✅ Не пил
                    </button>
                    <button
                      onClick={handleDrankClick}
                      disabled={isActionLoading}
                      className="flex-1 rounded-xl bg-drinking/15 py-3 font-semibold text-drinking transition-colors hover:bg-drinking/25 disabled:opacity-50 cursor-pointer"
                    >
                      🍻 Пил
                    </button>
                  </div>
                )}

                {!isUnset && (
                  <>
                    {/* Current status */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSoberClick}
                        disabled={isActionLoading}
                        className={`flex-1 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                          dayDetails?.status === 'Sober'
                            ? 'bg-sober text-sober-foreground'
                            : 'bg-sober/15 text-sober hover:bg-sober/25'
                        }`}
                      >
                        ✅ Не пил
                      </button>
                      <button
                        onClick={() => {
                          if (dayDetails?.status !== 'Drank') {
                            handleDrankClick();
                          }
                        }}
                        disabled={isActionLoading}
                        className={`flex-1 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                          dayDetails?.status === 'Drank'
                            ? 'bg-drinking text-drinking-foreground'
                            : 'bg-drinking/15 text-drinking hover:bg-drinking/25'
                        }`}
                      >
                        🍻 Пил
                      </button>
                    </div>

                    {/* Drinks list */}
                    {isDrank && (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-muted-foreground">Напитки</h3>
                          <button
                            onClick={() => { setPendingStatus(null); navigateTo('pickDrink', 'forward'); }}
                            disabled={isActionLoading}
                            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            Добавить
                          </button>
                        </div>

                        {dayDetails.events.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {dayDetails.events.map((event) => (
                              <div
                                key={event.id}
                                className="flex items-center gap-3 rounded-xl bg-background p-3"
                              >
                                <span className="text-xl">
                                  {DRINK_ICONS[event.drinkTypeName] ?? '🍸'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{event.drinkTypeName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {event.volumeMl} мл
                                    {event.time && ` · ${formatTime(event.time)}`}
                                    {event.notes && ` · ${event.notes}`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  disabled={isActionLoading}
                                  className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Добавь напитки, которые были сегодня
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Set status view (for changing existing status) */}
            {view === 'setStatus' && (
              <motion.div
                key="setStatus"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="flex flex-col gap-3"
              >
                <h3 className="font-semibold">Изменить статус</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleSoberClick}
                    disabled={isActionLoading}
                    className="flex-1 rounded-xl bg-sober/15 py-3 font-semibold text-sober hover:bg-sober/25 disabled:opacity-50 cursor-pointer"
                  >
                    ✅ Не пил
                  </button>
                  <button
                    onClick={handleDrankClick}
                    disabled={isActionLoading}
                    className="flex-1 rounded-xl bg-drinking/15 py-3 font-semibold text-drinking hover:bg-drinking/25 disabled:opacity-50 cursor-pointer"
                  >
                    🍻 Пил
                  </button>
                </div>
                <button
                  onClick={() => navigateTo('details', 'back')}
                  className="rounded-xl border border-border py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Назад
                </button>
              </motion.div>
            )}

            {/* Drink type picker */}
            {view === 'pickDrink' && (
              <motion.div
                key="pickDrink"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="flex flex-col gap-3"
              >
                <h3 className="font-semibold">Выбери напиток</h3>
                <div className="grid grid-cols-3 gap-2">
                  {drinkTypes.map((dt) => (
                    <button
                      key={dt.id}
                      onClick={() => handlePickDrink(dt.id)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-background p-3 transition-colors hover:bg-primary/10 cursor-pointer"
                    >
                      <span className="text-2xl">{DRINK_ICONS[dt.name] ?? '🍸'}</span>
                      <span className="text-xs text-muted-foreground">{dt.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigateTo('details', 'back')}
                  className="rounded-xl border border-border py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Отмена
                </button>
              </motion.div>
            )}

            {/* Drink detail form */}
            {view === 'drinkForm' && (
              <motion.div
                key="drinkForm"
                initial={enterVariant}
                animate={slideVariants.center}
                exit={exitVariant}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="flex flex-col gap-4"
              >
                <h3 className="font-semibold">
                  {drinkTypes.find(d => d.id === selectedDrinkTypeId)?.name ?? 'Напиток'}{' '}
                  <span className="text-lg">{DRINK_ICONS[drinkTypes.find(d => d.id === selectedDrinkTypeId)?.name ?? ''] ?? '🍸'}</span>
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Объём (мл)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={volumeStr}
                      onChange={(e) => setVolumeStr(e.target.value)}
                      min={50}
                      max={10000}
                      step={50}
                      className={`${inputClasses} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none flex-1`}
                      required
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => adjustVolume(50)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/15 transition-colors cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustVolume(-50)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-primary/15 transition-colors cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Время (необязательно)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Заметка (необязательно)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Например: встреча с друзьями"
                    maxLength={500}
                    rows={2}
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigateTo('pickDrink', 'back')}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleSubmitDrink}
                    disabled={isActionLoading}
                    className="flex-[2] rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {isActionLoading ? 'Сохранение...' : 'Добавить'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
