import apiClient from './client';
import { Label, CreateLabelRequest, UpdateLabelRequest } from '@/types';

export const labelsApi = {
    // Get labels for board
    getLabels: async (boardId: number): Promise<Label[]> => {
        const response = await apiClient.get<Label[]>(`/boards/${boardId}/labels`);
        return response.data;
    },

    // Create label
    createLabel: async (boardId: number, data: CreateLabelRequest): Promise<Label> => {
        const response = await apiClient.post<Label>(`/boards/${boardId}/labels`, data);
        return response.data;
    },

    // Update label
    updateLabel: async (labelId: number, data: UpdateLabelRequest): Promise<Label> => {
        const response = await apiClient.patch<Label>(`/labels/${labelId}`, data);
        return response.data;
    },

    // Delete label
    deleteLabel: async (labelId: number): Promise<void> => {
        await apiClient.delete(`/labels/${labelId}`);
    },
};
