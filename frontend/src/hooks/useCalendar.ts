import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMonthCalendar,
  fetchDayDetails,
  fetchDrinkTypes,
  setDayStatus,
  addEvent,
  deleteEvent,
} from '../api/calendarApi';
import type { SetDayStatusRequest, AddEventRequest } from '../types/calendar';

export const calendarKeys = {
  month: (year: number, month: number) => ['calendar', 'month', year, month] as const,
  day: (date: string) => ['calendar', 'day', date] as const,
  drinkTypes: () => ['drinkTypes'] as const,
};

export function useMonthCalendar(year: number, month: number) {
  return useQuery({
    queryKey: calendarKeys.month(year, month),
    queryFn: () => fetchMonthCalendar(year, month),
  });
}

export function useDayDetails(date: string | null) {
  return useQuery({
    queryKey: calendarKeys.day(date ?? ''),
    queryFn: () => fetchDayDetails(date!),
    enabled: !!date,
  });
}

export function useDrinkTypes() {
  return useQuery({
    queryKey: calendarKeys.drinkTypes(),
    queryFn: fetchDrinkTypes,
    staleTime: Infinity,
  });
}

export function useSetDayStatus(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, request }: { date: string; request: SetDayStatusRequest }) =>
      setDayStatus(date, request),
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
    },
  });
}

export function useAddEvent(date: string, year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddEventRequest) => addEvent(date, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
    },
  });
}

export function useDeleteEvent(date: string, year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(date, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
    },
  });
}
