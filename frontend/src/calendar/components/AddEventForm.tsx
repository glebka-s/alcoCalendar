import { useState } from 'react';
import type { DrinkType, AddEventRequest } from '../../types/calendar';

interface AddEventFormProps {
  drinkTypes: DrinkType[];
  onSubmit: (req: AddEventRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  color: '#94a3b8',
};

const DEFAULT_VOLUMES: Record<string, number> = {
  'Пиво': 500,
  'Вино': 100,
  'Крепкий алкоголь': 50,
  'Сидр': 500,
  'Коктейль': 200,
};

function getDefaultVolume(drinkTypes: DrinkType[], id: number): string {
  const name = drinkTypes.find(d => d.id === id)?.name ?? '';
  return String(DEFAULT_VOLUMES[name] ?? 50);
}

export default function AddEventForm({ drinkTypes, onSubmit, onCancel, isLoading }: AddEventFormProps) {
  const initialId = drinkTypes[0]?.id ?? 1;
  const [drinkTypeId, setDrinkTypeId] = useState<number>(initialId);
  const [volumeStr, setVolumeStr] = useState<string>(() => getDefaultVolume(drinkTypes, initialId));
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const volumeMl = parseInt(volumeStr, 10);
    if (!volumeMl || volumeMl <= 0) return;
    onSubmit({
      drinkTypeId,
      volumeMl,
      notes: notes.trim() || undefined,
      time: time || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={labelStyle}>
        Тип напитка
        <select
          value={drinkTypeId}
          onChange={e => {
            const id = Number(e.target.value);
            setDrinkTypeId(id);
            setVolumeStr(getDefaultVolume(drinkTypes, id));
          }}
          style={{ ...inputStyle, cursor: 'pointer' }}
          required
        >
          {drinkTypes.map(dt => (
            <option key={dt.id} value={dt.id} style={{ background: '#1e293b' }}>
              {dt.name}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Объём (мл)
        <input
          type="number"
          value={volumeStr}
          onChange={e => setVolumeStr(e.target.value)}
          onBlur={e => {
            const val = parseInt(e.target.value, 10);
            if (!val || val <= 0) setVolumeStr(getDefaultVolume(drinkTypes, drinkTypeId));
          }}
          min={50}
          max={10000}
          step={50}
          style={inputStyle}
          required
        />
      </label>

      <label style={labelStyle}>
        Время (необязательно)
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Заметка (необязательно)
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Например: за ужином"
          style={inputStyle}
          maxLength={500}
        />
      </label>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Пропустить
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            flex: 2,
            padding: '10px 0',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 14,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Сохранение...' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
