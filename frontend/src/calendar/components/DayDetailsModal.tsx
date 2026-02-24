import { useState, useEffect } from 'react';
import type { DayStatus } from '../../types/calendar';
import {
  useDayDetails,
  useDrinkTypes,
  useSetDayStatus,
  useAddEvent,
  useDeleteEvent,
} from '../../hooks/useCalendar';
import AddEventForm from './AddEventForm';

interface DayDetailsModalProps {
  date: string; // yyyy-MM-dd
  year: number;
  month: number;
  onClose: () => void;
}

const MONTH_NAMES = [
  'январь','февраль','март','апрель','май','июнь',
  'июль','август','сентябрь','октябрь','ноябрь','декабрь',
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : '';
}

function StatusLabel({ status }: { status: DayStatus }) {
  if (status === 'Sober') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 20,
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        color: '#4ade80', fontSize: 13, fontWeight: 600,
      }}>
        ✓ Не пил
      </span>
    );
  }
  if (status === 'Drank') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 20,
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        color: '#f87171', fontSize: 13, fontWeight: 600,
      }}>
        🍺 Пил
      </span>
    );
  }
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20,
      background: 'rgba(148,163,184,0.1)',
      border: '1px solid rgba(148,163,184,0.2)',
      color: '#94a3b8', fontSize: 13,
    }}>
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

  // Close on Escape
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

  const handleAddDrink = async (req: import('../../types/calendar').AddEventRequest) => {
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
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 28,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              {formatDate(date)}
            </h2>
            <div style={{ marginTop: 8 }}>
              {detailsLoading ? (
                <span style={{ color: '#64748b', fontSize: 13 }}>Загрузка...</span>
              ) : (
                <StatusLabel status={dayDetails?.status ?? 'Unknown'} />
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: '#64748b', fontSize: 22, cursor: 'pointer',
              lineHeight: 1, padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Main content */}
        {view === 'details' && !detailsLoading && (
          <>
            {/* Events list */}
            {isDrank && dayDetails.events.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Записи
                </h3>
                {dayDetails.events.map(event => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🍺</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
                        {event.drinkTypeName}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
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
                      style={{
                        background: 'none', border: 'none',
                        color: '#ef4444', cursor: 'pointer',
                        fontSize: 16, padding: 4, lineHeight: 1,
                        opacity: isActionLoading ? 0.5 : 1,
                      }}
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {isUnset && (
              <p style={{ color: '#64748b', fontSize: 14, margin: 0, textAlign: 'center' }}>
                День не заполнен. Выберите статус ниже.
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isUnset && (
                <>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Как прошёл день?
                  </h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleSoberClick}
                      disabled={isActionLoading}
                      style={{
                        flex: 1, padding: '12px 0',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: 10, color: '#4ade80',
                        cursor: isActionLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600, fontSize: 15,
                        opacity: isActionLoading ? 0.6 : 1,
                      }}
                    >
                      ✓ Не пил
                    </button>
                    <button
                      onClick={handleDrankClick}
                      disabled={isActionLoading}
                      style={{
                        flex: 1, padding: '12px 0',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: 10, color: '#f87171',
                        cursor: isActionLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 600, fontSize: 15,
                        opacity: isActionLoading ? 0.6 : 1,
                      }}
                    >
                      🍺 Пил
                    </button>
                  </div>
                </>
              )}

              {!isUnset && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {isDrank && (
                    <button
                      onClick={() => { setPendingStatus(null); setView('addDrink'); }}
                      disabled={isActionLoading}
                      style={{
                        flex: 1, padding: '10px 0',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none', borderRadius: 10,
                        color: '#fff', cursor: 'pointer',
                        fontWeight: 600, fontSize: 14,
                        opacity: isActionLoading ? 0.6 : 1,
                      }}
                    >
                      + Добавить напиток
                    </button>
                  )}
                  <button
                    onClick={() => setView('setStatus')}
                    disabled={isActionLoading}
                    style={{
                      flex: 1, padding: '10px 0',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, color: '#94a3b8',
                      cursor: 'pointer', fontSize: 14,
                      opacity: isActionLoading ? 0.6 : 1,
                    }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
              Изменить статус дня
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSoberClick}
                disabled={isActionLoading}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  borderRadius: 10, color: '#4ade80',
                  cursor: isActionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontSize: 15,
                }}
              >
                ✓ Не пил
              </button>
              <button
                onClick={handleDrankClick}
                disabled={isActionLoading}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 10, color: '#f87171',
                  cursor: isActionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontSize: 15,
                }}
              >
                🍺 Пил
              </button>
            </div>
            <button
              onClick={() => setView('details')}
              style={{
                padding: '10px 0',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, color: '#64748b',
                cursor: 'pointer', fontSize: 14,
              }}
            >
              Назад
            </button>
          </div>
        )}

        {/* Add drink form */}
        {view === 'addDrink' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>
              Добавить напиток
            </h3>
            <AddEventForm
              drinkTypes={drinkTypes}
              onSubmit={handleAddDrink}
              onCancel={() => setView(isUnset ? 'details' : 'details')}
              isLoading={isActionLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
