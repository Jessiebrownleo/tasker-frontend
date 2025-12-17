import apiClient from './client';
import {
    TaskDetail,
    TaskSummary,
    CreateTaskRequest,
    UpdateTaskRequest,
    MoveTaskRequest,
} from '@/types';

export const tasksApi = {
    // Get tasks by column
    getTasksByColumn: async (columnId: number): Promise<TaskSummary[]> => {
        const response = await apiClient.get<TaskSummary[]>(`/tasks/column/${columnId}`);
        return response.data;
    },

    // Get task by ID
    getTask: async (taskId: number): Promise<TaskDetail> => {
        const response = await apiClient.get<TaskDetail>(`/tasks/${taskId}`);
        return response.data;
    },

    // Create task in column
    createTask: async (columnId: number, data: CreateTaskRequest): Promise<TaskDetail> => {
        const response = await apiClient.post<TaskDetail>(`/tasks/${columnId}`, data);
        return response.data;
    },

    // Update task
    updateTask: async (taskId: number, data: UpdateTaskRequest): Promise<TaskDetail> => {
        const response = await apiClient.patch<TaskDetail>(`/tasks/${taskId}`, data);
        return response.data;
    },

    // Delete task
    deleteTask: async (taskId: number): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}`);
    },

    // Move task to another column
    moveTask: async (taskId: number, data: MoveTaskRequest): Promise<TaskDetail> => {
        const response = await apiClient.patch<TaskDetail>(`/tasks/${taskId}/move`, data);
        return response.data;
    },

    // Search tasks
    searchTasks: async (query?: string): Promise<TaskSummary[]> => {
        const response = await apiClient.get<TaskSummary[]>('/tasks/search', {
            params: { q: query },
        });
        return response.data;
    },

    // Add label to task
    addLabel: async (taskId: number, labelId: number): Promise<void> => {
        await apiClient.post(`/tasks/${taskId}/labels/${labelId}`);
    },

    // Remove label from task
    removeLabel: async (taskId: number, labelId: number): Promise<void> => {
        await apiClient.delete(`/tasks/${taskId}/labels/${labelId}`);
    },
};
