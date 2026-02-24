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

interface Props {
  date: string;
  year: number;
  month: number;
  onClose: () => void;
}

const MONTH_NAMES_GEN = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря',
];

const WEEKDAYS = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return { day: d, month: MONTH_NAMES_GEN[m - 1], year: y, weekday: WEEKDAYS[dow] };
}

function StatusBadge({ status }: { status: DayStatus }) {
  if (status === 'Sober') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 20,
      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
      color: '#4ade80', fontSize: 13, fontWeight: 700,
    }}>✓ Не пил</span>
  );
  if (status === 'Drank') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 20,
      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
      color: '#f87171', fontSize: 13, fontWeight: 700,
    }}>🍺 Пил</span>
  );
  return (
    <span style={{
      padding: '5px 14px', borderRadius: 20,
      background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)',
      color: '#64748b', fontSize: 13,
    }}>Не задано</span>
  );
}

type View = 'main' | 'changeStatus' | 'addDrink';

export default function DayDetailsPanel({ date, year, month, onClose }: Props) {
  const [view, setView] = useState<View>('main');
  const [fromStatusFlow, setFromStatusFlow] = useState(false);

  const { data: details, isLoading } = useDayDetails(date);
  const { data: drinkTypes = [] } = useDrinkTypes();
  const setStatusMut = useSetDayStatus(year, month);
  const addEventMut = useAddEvent(date, year, month);
  const deleteEventMut = useDeleteEvent(date, year, month);

  // Reset view when date changes
  useEffect(() => { setView('main'); setFromStatusFlow(false); }, [date]);

  const isUnset = !details || details.status === 'Unknown';
  const isDrank = details?.status === 'Drank';
  const isBusy = setStatusMut.isPending || addEventMut.isPending || deleteEventMut.isPending;

  const handleSober = async () => {
    await setStatusMut.mutateAsync({ date, request: { status: 'Sober' } });
    setView('main');
  };

  const handleDrank = () => {
    setFromStatusFlow(isUnset);
    setView('addDrink');
  };

  const handleAddDrink = async (req: import('../../types/calendar').AddEventRequest) => {
    if (fromStatusFlow) {
      await setStatusMut.mutateAsync({ date, request: { status: 'Drank', event: req } });
    } else {
      await addEventMut.mutateAsync(req);
    }
    setView('main');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту запись?')) await deleteEventMut.mutateAsync(id);
  };

  const fmt = formatDate(date);

  return (
    <aside style={{
      width: 340, flexShrink: 0,
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(15,20,40,0.6)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      padding: '28px 24px',
      gap: 24,
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {fmt.weekday}
          </div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
            {fmt.day} {fmt.month}
          </h2>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{fmt.year}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#475569',
          fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1,
          borderRadius: 6,
        }} title="Закрыть">×</button>
      </div>

      {/* Status */}
      <div>
        {isLoading
          ? <span style={{ color: '#334155', fontSize: 13 }}>Загрузка...</span>
          : <StatusBadge status={details?.status ?? 'Unknown'} />
        }
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* MAIN VIEW */}
        {view === 'main' && !isLoading && (
          <>
            {/* Events */}
            {isDrank && details.events.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Записи о выпивке
                </div>
                {details.events.map(ev => (
                  <div key={ev.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>🍺</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{ev.drinkTypeName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                        {ev.volumeMl >= 1000 ? `${(ev.volumeMl / 1000).toFixed(1)} л` : `${ev.volumeMl} мл`}
                        {ev.time && ` · ${ev.time.slice(0, 5)}`}
                        {ev.notes && ` · ${ev.notes}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={isBusy}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ef4444', fontSize: 15, padding: 4,
                        opacity: isBusy ? 0.4 : 0.7, flexShrink: 0,
                      }}
                      title="Удалить"
                    >🗑</button>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 10, fontSize: 13, color: '#94a3b8',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>Итого:</span>
                  <span style={{ fontWeight: 700, color: '#f87171' }}>
                    {details.events.reduce((s, e) => s + e.volumeMl, 0) >= 1000
                      ? `${(details.events.reduce((s, e) => s + e.volumeMl, 0) / 1000).toFixed(2)} л`
                      : `${details.events.reduce((s, e) => s + e.volumeMl, 0)} мл`}
                  </span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {isUnset && (
              <div style={{
                padding: '20px', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#334155', fontSize: 14,
              }}>
                День не заполнен
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isUnset && (
                <>
                  <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>Как прошёл день?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <ActionBtn
                      onClick={handleSober} disabled={isBusy}
                      bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.35)" color="#4ade80"
                    >✓ Не пил</ActionBtn>
                    <ActionBtn
                      onClick={handleDrank} disabled={isBusy}
                      bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.35)" color="#f87171"
                    >🍺 Пил</ActionBtn>
                  </div>
                </>
              )}

              {!isUnset && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {isDrank && (
                    <button
                      onClick={() => { setFromStatusFlow(false); setView('addDrink'); }}
                      disabled={isBusy}
                      style={{
                        padding: '11px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                        opacity: isBusy ? 0.6 : 1,
                      }}
                    >+ Добавить напиток</button>
                  )}
                  <button
                    onClick={() => setView('changeStatus')} disabled={isBusy}
                    style={{
                      padding: '10px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', cursor: 'pointer', fontSize: 13,
                      opacity: isBusy ? 0.6 : 1,
                    }}
                  >Изменить статус</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* CHANGE STATUS VIEW */}
        {view === 'changeStatus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Изменить статус</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ActionBtn onClick={handleSober} disabled={isBusy}
                bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.35)" color="#4ade80">
                ✓ Не пил
              </ActionBtn>
              <ActionBtn onClick={handleDrank} disabled={isBusy}
                bg="rgba(239,68,68,0.12)" border="rgba(239,68,68,0.35)" color="#f87171">
                🍺 Пил
              </ActionBtn>
            </div>
            <button onClick={() => setView('main')} style={{
              padding: '9px', background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9, color: '#475569', cursor: 'pointer', fontSize: 13,
            }}>← Назад</button>
          </div>
        )}

        {/* ADD DRINK VIEW */}
        {view === 'addDrink' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>Добавить напиток</div>
            <AddEventForm
              drinkTypes={drinkTypes}
              onSubmit={handleAddDrink}
              onCancel={() => setView('main')}
              isLoading={isBusy}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function ActionBtn({
  onClick, disabled, bg, border, color, children,
}: {
  onClick: () => void; disabled: boolean;
  bg: string; border: string; color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        padding: '12px 8px', borderRadius: 10,
        background: bg, border: `1px solid ${border}`,
        color, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 700, fontSize: 14,
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >{children}</button>
  );
}
