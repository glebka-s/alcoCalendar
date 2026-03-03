import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchProfile, updateName, changePassword } from '../api/userApi';

const userKeys = {
  profile: () => ['user', 'profile'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: fetchProfile,
  });
}

export function useUpdateName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateName(name),
    onSuccess: () => {
      toast.success('Имя обновлено');
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: () => {
      toast.error('Не удалось обновить имя');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Пароль изменён');
    },
    onError: (err: unknown) => {
      const maybeAxios = err as { response?: { data?: { error?: string } } };
      const msg = maybeAxios.response?.data?.error ?? 'Не удалось изменить пароль';
      toast.error(msg);
    },
  });
}
