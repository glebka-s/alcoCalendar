import { useState } from 'react';
import type { DrinkType, AddEventRequest } from '../../types/calendar';

interface AddEventFormProps {
  drinkTypes: DrinkType[];
  onSubmit: (req: AddEventRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

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

const inputClasses =
  'w-full px-3 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
        Тип напитка
        <select
          value={drinkTypeId}
          onChange={e => {
            const id = Number(e.target.value);
            setDrinkTypeId(id);
            setVolumeStr(getDefaultVolume(drinkTypes, id));
          }}
          className={`${inputClasses} cursor-pointer`}
          required
        >
          {drinkTypes.map(dt => (
            <option key={dt.id} value={dt.id} className="bg-surface">
              {dt.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
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
          className={inputClasses}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
        Время (необязательно)
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
        Заметка (необязательно)
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Например: за ужином"
          className={inputClasses}
          maxLength={500}
        />
      </label>

      <div className="flex gap-2.5 mt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2.5 rounded-xl bg-card border border-border text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-[2] py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isLoading ? 'Сохранение...' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
