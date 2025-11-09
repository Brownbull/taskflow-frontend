/**
 * Custom React Query hooks for task management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../services/taskService';

/**
 * Hook to fetch all tasks with filters
 * @param {Object} filters - {status, priority, page, limit}
 * @returns {Object} {data, isLoading, isError, error, refetch}
 */
export const useTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch single task by ID
 * @param {number} id - Task ID
 * @returns {Object} {data, isLoading, isError, error}
 */
export const useTask = (id) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTask(id),
    enabled: !!id,
  });
};

/**
 * Hook to create new task
 * @returns {Object} {mutate, mutateAsync, isLoading, isError, error}
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks query
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

/**
 * Hook to update task
 * @returns {Object} {mutate, mutateAsync, isLoading, isError, error}
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: (_, variables) => {
      // Invalidate tasks list and specific task
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
    },
  });
};

/**
 * Hook to delete task
 * @returns {Object} {mutate, mutateAsync, isLoading, isError, error}
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      // Invalidate tasks query to refetch list
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
