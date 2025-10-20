// src/api.ts
import axios from 'axios';
import { Task } from './types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type for creating/updating a task (omitting id and executions)
export type TaskPayload = Omit<Task, 'id' | 'taskExecutions'> & { id?: string };

export const getTasks = () => apiClient.get<Task[]>('/tasks');
export const getTaskByName = (name: string) => apiClient.get<Task[]>(`/tasks/name/${name}`);
export const createTask = (task: TaskPayload) => apiClient.put('/tasks', task);
export const deleteTask = (id: string) => apiClient.delete(`/tasks/${id}`);
export const executeTask = (id: string) => apiClient.put(`/tasks/${id}/execute`);