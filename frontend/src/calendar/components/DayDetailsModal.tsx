import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import type { DayStatus, AddEventRequest } from '../../types/calendar';
import {
  useDayDetails,
  useDrinkTypes,
  useSetDayStatus,
  useAddEvent,
  useDeleteEvent,
} from '../../hooks/useCalendar';
import AddEventForm from './AddEventForm';

interface DayDetailsModalProps {
  date: string;
  year: number;
  month: number;
  onClose: () => void;
}

const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : '';
}

function StatusBadge({ status }: { status: DayStatus }) {
  if (status === 'Sober') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sober/15 border border-sober/40 text-sober text-sm font-semibold">
        ✓ Не пил
      </span>
    );
  }
  if (status === 'Drank') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-drinking/15 border border-drinking/40 text-drinking text-sm font-semibold">
        🍺 Пил
      </span>
    );
  }
  return (
    <span className="inline-flex px-3 py-1 rounded-full bg-muted/10 border border-border text-muted text-sm">
      Не задано
    </span>
  );
}

type View = 'details' | 'setStatus' | 'addDrink';

export default function DayDetailsModal({ date, year, month, onClose }: DayDetailsModalProps) {
  const [view, setView] = useState<View>('details');
  const [pendingStatus, setPendingStatus] = useState<'Sober' | 'Drank' | null>(null);

  const { data: dayDetails, isLoading: detailsLoading } = useDayDetails(date);
  const { data: drinkTypes = [] } = useDrinkTypes();
  const setDayStatusMutation = useSetDayStatus(year, month);
  const addEventMutation = useAddEvent(date, year, month);
  const deleteEventMutation = useDeleteEvent(date, year, month);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isUnset = !dayDetails || dayDetails.status === 'Unknown';
  const isDrank = dayDetails?.status === 'Drank';

  const handleSoberClick = async () => {
    await setDayStatusMutation.mutateAsync({ date, request: { status: 'Sober' } });
    setView('details');
  };

  const handleDrankClick = () => {
    setPendingStatus('Drank');
    setView('addDrink');
  };

  const handleAddDrink = async (req: AddEventRequest) => {
    if (pendingStatus === 'Drank' && isUnset) {
      await setDayStatusMutation.mutateAsync({ date, request: { status: 'Drank', event: req } });
    } else {
      await addEventMutation.mutateAsync(req);
    }
    setPendingStatus(null);
    setView('details');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Удалить эту запись?')) {
      await deleteEventMutation.mutateAsync(eventId);
    }
  };

  const isActionLoading =
    setDayStatusMutation.isPending ||
    addEventMutation.isPending ||
    deleteEventMutation.isPending;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_150ms_ease-out]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-5 animate-[scaleIn_150ms_ease-out]"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground">{formatDate(date)}</h2>
            <div className="mt-2">
              {detailsLoading ? (
                <span className="text-muted text-sm">Загрузка...</span>
              ) : (
                <StatusBadge status={dayDetails?.status ?? 'Unknown'} />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details view */}
        {view === 'details' && !detailsLoading && (
          <>
            {isDrank && dayDetails.events.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Записи
                </h3>
                {dayDetails.events.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <span className="text-xl">🍺</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground">
                        {event.drinkTypeName}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {event.volumeMl >= 1000
                          ? `${(event.volumeMl / 1000).toFixed(1)} л`
                          : `${event.volumeMl} мл`}
                        {event.time && ` · ${formatTime(event.time)}`}
                        {event.notes && ` · ${event.notes}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={isActionLoading}
                      className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUnset && (
              <p className="text-muted text-sm text-center py-2">
                День не заполнен. Выберите статус ниже.
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              {isUnset && (
                <>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Как прошёл день?
                  </h3>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleSoberClick}
                      disabled={isActionLoading}
                      className="flex-1 py-3 rounded-xl bg-sober/15 border border-sober/40 text-sober font-semibold text-sm hover:bg-sober/25 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      ✓ Не пил
                    </button>
                    <button
                      onClick={handleDrankClick}
                      disabled={isActionLoading}
                      className="flex-1 py-3 rounded-xl bg-drinking/15 border border-drinking/40 text-drinking font-semibold text-sm hover:bg-drinking/25 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      🍺 Пил
                    </button>
                  </div>
                </>
              )}

              {!isUnset && (
                <div className="flex gap-2.5">
                  {isDrank && (
                    <button
                      onClick={() => { setPendingStatus(null); setView('addDrink'); }}
                      disabled={isActionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить напиток
                    </button>
                  )}
                  <button
                    onClick={() => setView('setStatus')}
                    disabled={isActionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-card border border-border text-muted text-sm hover:text-foreground hover:border-muted disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Изменить статус
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Change status view */}
        {view === 'setStatus' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground">Изменить статус дня</h3>
            <div className="flex gap-2.5">
              <button
                onClick={handleSoberClick}
                disabled={isActionLoading}
                className="flex-1 py-3 rounded-xl bg-sober/15 border border-sober/40 text-sober font-semibold text-sm hover:bg-sober/25 disabled:opacity-50 transition-colors cursor-pointer"
              >
                ✓ Не пил
              </button>
              <button
                onClick={handleDrankClick}
                disabled={isActionLoading}
                className="flex-1 py-3 rounded-xl bg-drinking/15 border border-drinking/40 text-drinking font-semibold text-sm hover:bg-drinking/25 disabled:opacity-50 transition-colors cursor-pointer"
              >
                🍺 Пил
              </button>
            </div>
            <button
              onClick={() => setView('details')}
              className="py-2.5 rounded-xl border border-border text-muted text-sm hover:text-foreground hover:border-muted transition-colors cursor-pointer"
            >
              Назад
            </button>
          </div>
        )}

        {/* Add drink form */}
        {view === 'addDrink' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground">Добавить напиток</h3>
            <AddEventForm
              drinkTypes={drinkTypes}
              onSubmit={handleAddDrink}
              onCancel={() => setView('details')}
              isLoading={isActionLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
