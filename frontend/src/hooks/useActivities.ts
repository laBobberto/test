import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesAPI } from '../services/api';
import type { Activity, ActivityFormData } from '../types';
import { toast } from 'sonner';

export const useActivities = () => {
  const queryClient = useQueryClient();

  const createActivityMutation = useMutation({
    mutationFn: (data: ActivityFormData) => activitiesAPI.createActivity(data),
    onMutate: async (newActivity) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousActivities = queryClient.getQueryData(['activities']);
      
      queryClient.setQueryData(['activities'], (old: Activity[] = []) => [
        ...old,
        { ...newActivity, id: Date.now() } as Activity,
      ]);

      return { previousActivities };
    },
    onError: (err, newActivity, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
      toast.error('Ошибка при создании активности');
    },
    onSuccess: () => {
      toast.success('Активность создана');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ActivityFormData> }) =>
      activitiesAPI.updateActivity(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousActivities = queryClient.getQueryData(['activities']);

      queryClient.setQueryData(['activities'], (old: Activity[] = []) =>
        old.map((activity) =>
          activity.id === id ? { ...activity, ...data } : activity
        )
      );

      return { previousActivities };
    },
    onError: (err, variables, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
      toast.error('Ошибка при обновлении активности');
    },
    onSuccess: () => {
      toast.success('Активность обновлена');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) => activitiesAPI.deleteActivity(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousActivities = queryClient.getQueryData(['activities']);

      queryClient.setQueryData(['activities'], (old: Activity[] = []) =>
        old.filter((activity) => activity.id !== id)
      );

      return { previousActivities };
    },
    onError: (err, id, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
      toast.error('Ошибка при удалении активности');
    },
    onSuccess: () => {
      toast.success('Активность удалена');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: (id: number) => activitiesAPI.completeActivity(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousActivities = queryClient.getQueryData(['activities']);

      queryClient.setQueryData(['activities'], (old: Activity[] = []) =>
        old.map((activity) =>
          activity.id === id ? { ...activity, completed: true } : activity
        )
      );

      return { previousActivities };
    },
    onError: (err, id, context) => {
      if (context?.previousActivities) {
        queryClient.setQueryData(['activities'], context.previousActivities);
      }
      toast.error('Ошибка при завершении активности');
    },
    onSuccess: () => {
      toast.success('Активность завершена! 🎉');
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    createActivity: createActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    deleteActivity: deleteActivityMutation.mutate,
    completeActivity: completeActivityMutation.mutate,
    isLoading:
      createActivityMutation.isPending ||
      updateActivityMutation.isPending ||
      deleteActivityMutation.isPending ||
      completeActivityMutation.isPending,
  };
};
