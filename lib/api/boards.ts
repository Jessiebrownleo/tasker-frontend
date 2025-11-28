import apiClient from './client';
import {
    Board,
    BoardDetail,
    BoardSummary,
    CreateBoardRequest,
    UpdateBoardRequest,
    BoardMember,
    AddMemberRequest,
    UpdateMemberRequest,
    Column,
    CreateColumnRequest,
} from '@/types';

export const boardsApi = {
    // Get all boards for current user
    getBoards: async (): Promise<BoardSummary[]> => {
        const response = await apiClient.get<BoardSummary[]>('/boards');
        return response.data;
    },

    // Get board by ID
    getBoard: async (id: number): Promise<BoardDetail> => {
        const response = await apiClient.get<BoardDetail>(`/boards/${id}`);
        return response.data;
    },

    // Create board
    createBoard: async (data: CreateBoardRequest): Promise<BoardDetail> => {
        const response = await apiClient.post<BoardDetail>('/boards', data);
        return response.data;
    },

    // Update board
    updateBoard: async (id: number, data: UpdateBoardRequest): Promise<BoardDetail> => {
        const response = await apiClient.patch<BoardDetail>(`/boards/${id}`, data);
        return response.data;
    },

    // Delete board
    deleteBoard: async (id: number): Promise<void> => {
        await apiClient.delete(`/boards/${id}`);
    },

    // Get board members
    getMembers: async (boardId: number): Promise<BoardMember[]> => {
        const response = await apiClient.get<BoardMember[]>(`/boards/${boardId}/members`);
        return response.data;
    },

    // Add member to board
    addMember: async (boardId: number, data: AddMemberRequest): Promise<void> => {
        await apiClient.post(`/boards/${boardId}/members/${data.userId}`, data);
    },

    // Update member role
    updateMember: async (boardId: number, userId: number, data: UpdateMemberRequest): Promise<void> => {
        await apiClient.patch(`/boards/${boardId}/members`, data);
    },

    // Remove member from board
    removeMember: async (boardId: number, userId: number): Promise<void> => {
        await apiClient.delete(`/boards/${boardId}/members/${userId}`);
    },

    // Get columns for board
    getColumns: async (boardId: number): Promise<Column[]> => {
        const response = await apiClient.get<Column[]>(`/boards/${boardId}/columns`);
        return response.data;
    },

    // Create column
    createColumn: async (boardId: number, data: CreateColumnRequest): Promise<Column> => {
        const response = await apiClient.post<Column>(`/boards/${boardId}/columns`, data);
        return response.data;
    },
};
