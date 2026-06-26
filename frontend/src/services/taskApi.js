import axios from 'axios';

// Load base API URL from Vite environment config
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check backend API health
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/**
 * Fetch list of tasks (optional status filter)
 */
export const getTasks = async (status) => {
  const params = {};
  if (status && status !== 'all') {
    params.status = status;
  }
  const response = await apiClient.get('/tasks', { params });
  return response.data;
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task (expects task object containing title, description)
 */
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

/**
 * Update task title and description (PUT /tasks/:id)
 */
export const updateTask = async (id, taskData) => {
  const response = await apiClient.put(`/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Update task status (PATCH /tasks/:id/status)
 */
export const updateTaskStatus = async (id, status) => {
  const response = await apiClient.patch(`/tasks/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

/**
 * Fetch task statistics counts
 */
export const getTaskStats = async () => {
  const response = await apiClient.get('/tasks/stats');
  return response.data;
};

/**
 * Fetch recent database audit activities
 */
export const getActivityLogs = async () => {
  const response = await apiClient.get('/tasks/activity-logs');
  return response.data;
};

export default {
  checkHealth,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getActivityLogs
};
