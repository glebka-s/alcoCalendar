import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMonthCalendar,
  fetchDayDetails,
  fetchDrinkTypes,
  setDayStatus,
  addEvent,
  deleteEvent,
  fetchStats,
} from '../api/calendarApi';
import type {
  SetDayStatusRequest,
  AddEventRequest,
  DayDetailsResponse,
  MonthCalendarResponse,
} from '../types/calendar';

export const calendarKeys = {
  month: (year: number, month: number) => ['calendar', 'month', year, month] as const,
  day: (date: string) => ['calendar', 'day', date] as const,
  drinkTypes: () => ['drinkTypes'] as const,
  stats: (months: number) => ['calendar', 'stats', months] as const,
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
    onMutate: async ({ date, request }) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.day(date) });
      await queryClient.cancelQueries({ queryKey: calendarKeys.month(year, month) });

      const prevDay = queryClient.getQueryData<DayDetailsResponse>(calendarKeys.day(date));
      const prevMonth = queryClient.getQueryData<MonthCalendarResponse>(calendarKeys.month(year, month));

      queryClient.setQueryData<DayDetailsResponse>(calendarKeys.day(date), (old) =>
        old ? { ...old, status: request.status } : old,
      );

      queryClient.setQueryData<MonthCalendarResponse>(calendarKeys.month(year, month), (old) => {
        if (!old) return old;
        return {
          ...old,
          days: old.days.map(d =>
            d.date === date ? { ...d, status: request.status } : d,
          ),
        };
      });

      return { prevDay, prevMonth };
    },
    onError: (_err, { date }, context) => {
      if (context?.prevDay) queryClient.setQueryData(calendarKeys.day(date), context.prevDay);
      if (context?.prevMonth) queryClient.setQueryData(calendarKeys.month(year, month), context.prevMonth);
      toast.error('Не удалось обновить статус');
    },
    onSuccess: () => {
      toast.success('Статус обновлён');
    },
    onSettled: (_data, _err, { date }) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
    },
  });
}

export function useAddEvent(date: string, year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddEventRequest) => addEvent(date, request),
    onSuccess: () => {
      toast.success('Запись добавлена');
    },
    onError: () => {
      toast.error('Не удалось добавить запись');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
    },
  });
}

export function useDeleteEvent(date: string, year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(date, eventId),
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: calendarKeys.day(date) });
      const prevDay = queryClient.getQueryData<DayDetailsResponse>(calendarKeys.day(date));

      queryClient.setQueryData<DayDetailsResponse>(calendarKeys.day(date), (old) =>
        old ? { ...old, events: old.events.filter(e => e.id !== eventId) } : old,
      );

      return { prevDay };
    },
    onError: (_err, _eventId, context) => {
      if (context?.prevDay) queryClient.setQueryData(calendarKeys.day(date), context.prevDay);
      toast.error('Не удалось удалить запись');
    },
    onSuccess: () => {
      toast.success('Запись удалена');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.day(date) });
      queryClient.invalidateQueries({ queryKey: calendarKeys.month(year, month) });
    },
  });
}

export function useStats(months: number = 3) {
  return useQuery({
    queryKey: calendarKeys.stats(months),
    queryFn: () => fetchStats(months),
  });
}
