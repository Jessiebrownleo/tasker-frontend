import apiClient from './client';
import { Comment, CommentCreateRequest, CommentUpdateRequest } from '@/types';

export const commentsApi = {
    // Get comments for task
    getComments: async (taskId: number): Promise<Comment[]> => {
        const response = await apiClient.get<Comment[]>(`/comments/${taskId}`);
        return response.data;
    },

    // Create comment
    createComment: async (taskId: number, data: CommentCreateRequest): Promise<void> => {
        await apiClient.post(`/comments/${taskId}`, data);
    },

    // Update comment
    updateComment: async (commentId: number, data: CommentUpdateRequest): Promise<void> => {
        await apiClient.patch(`/comments/${commentId}`, data);
    },

    // Delete comment
    deleteComment: async (commentId: number): Promise<void> => {
        await apiClient.delete(`/comments/${commentId}`);
    },
};
