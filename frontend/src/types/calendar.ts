export type DayStatus = 'Unknown' | 'Sober' | 'Drank';

export interface CalendarDay {
  date: string; // yyyy-MM-dd
  status: DayStatus;
  totalEvents: number;
  totalVolumeMl: number;
  drinkTypeNames: string[];
}

export interface MonthCalendarResponse {
  days: CalendarDay[];
}

export interface ConsumptionEvent {
  id: string;
  drinkTypeId: number;
  drinkTypeName: string;
  volumeMl: number;
  notes: string | null;
  time: string | null; // HH:mm
}

export interface DayDetailsResponse {
  date: string;
  status: DayStatus;
  events: ConsumptionEvent[];
}

export interface DrinkType {
  id: number;
  name: string;
}

export interface SetDayStatusRequest {
  status: 'Sober' | 'Drank';
  event?: AddEventRequest;
}

export interface AddEventRequest {
  drinkTypeId: number;
  volumeMl: number;
  notes?: string;
  time?: string;
}

export interface AddEventResponse {
  id: string;
}

export interface WeeklyBreakdown {
  weekStart: string;
  soberDays: number;
  drankDays: number;
  volumeMl: number;
}

export interface CalendarStats {
  totalDays: number;
  soberDays: number;
  drankDays: number;
  unknownDays: number;
  soberPercent: number;
  currentSoberStreak: number;
  longestSoberStreak: number;
  longestDrinkingStreak: number;
  totalVolumeMl: number;
  favoriteDrink: string | null;
  weeklyBreakdown: WeeklyBreakdown[];
}
