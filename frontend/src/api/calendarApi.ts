import { apiClient } from '../auth/apiClient';
import type {
  MonthCalendarResponse,
  DayDetailsResponse,
  DrinkType,
  SetDayStatusRequest,
  AddEventRequest,
  AddEventResponse,
  CalendarStats,
} from '../types/calendar';

export async function fetchMonthCalendar(
  year: number,
  month: number,
): Promise<MonthCalendarResponse> {
  const { data } = await apiClient.get<MonthCalendarResponse>(
    `/calendar/${year}/${month}`,
  );
  return data;
}

export async function fetchDayDetails(date: string): Promise<DayDetailsResponse> {
  const { data } = await apiClient.get<DayDetailsResponse>(`/calendar/day/${date}`);
  return data;
}

export async function setDayStatus(
  date: string,
  request: SetDayStatusRequest,
): Promise<void> {
  await apiClient.post(`/calendar/day/${date}`, request);
}

export async function addEvent(
  date: string,
  request: AddEventRequest,
): Promise<AddEventResponse> {
  const { data } = await apiClient.patch<AddEventResponse>(
    `/calendar/day/${date}/events`,
    request,
  );
  return data;
}

export async function deleteEvent(date: string, eventId: string): Promise<void> {
  await apiClient.delete(`/calendar/day/${date}/events/${eventId}`);
}

export async function fetchDrinkTypes(): Promise<DrinkType[]> {
  const { data } = await apiClient.get<DrinkType[]>('/drink-types');
  return data;
}

export async function fetchStats(months: number = 3): Promise<CalendarStats> {
  const { data } = await apiClient.get<CalendarStats>('/calendar/stats', {
    params: { months },
  });
  return data;
}
