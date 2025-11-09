/**
 * Task Service
 * Handles task CRUD operations
 */

import axiosInstance from './axios';

/**
 * Get all tasks with optional filters
 * @param {Object} filters - {status, priority, page, limit}
 * @returns {Promise<Object>} {items, total, page, pages}
 */
export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await axiosInstance.get(`/api/tasks?${params}`);
  return response.data;
};

/**
 * Get single task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Task data
 */
export const getTask = async (id) => {
  const response = await axiosInstance.get(`/api/tasks/${id}`);
  return response.data;
};

/**
 * Create new task
 * @param {Object} taskData - {title, description, priority, status}
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/api/tasks', taskData);
  return response.data;
};

/**
 * Update existing task
 * @param {number} id - Task ID
 * @param {Object} taskData - Updated fields
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(`/api/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete task
 * @param {number} id - Task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (id) => {
  await axiosInstance.delete(`/api/tasks/${id}`);
};
