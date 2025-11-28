'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { commentsApi } from '@/lib/api/comments';
import { authApi } from '@/lib/api/auth';
import { TaskDetail, UpdateTaskRequest } from '@/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Clock, AlignLeft, MessageSquare, Trash2, Send } from 'lucide-react';
import { getTaskStatusColor, getTaskStatusLabel, formatDateTime, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { LabelPicker } from './label-picker';

interface TaskDetailModalProps {
    taskId: number;
    boardId: number;
    onClose: () => void;
}

export function TaskDetailModal({ taskId, boardId, onClose }: TaskDetailModalProps) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newComment, setNewComment] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);

    // Fetch task details
    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => tasksApi.getTask(taskId),
    });

    // Fetch comments
    const { data: comments } = useQuery({
        queryKey: ['comments', taskId],
        queryFn: () => commentsApi.getComments(taskId),
        enabled: !!taskId,
    });

    // Update local state when task loads
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
        }
    }, [task]);

    // Mutations
    const updateTaskMutation = useMutation({
        mutationFn: (data: UpdateTaskRequest) => tasksApi.updateTask(taskId, data),
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh board
            toast.success('Task updated');
            setIsEditingTitle(false);
            setIsEditingDesc(false);
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: () => tasksApi.deleteTask(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted');
            onClose();
        },
    });

    const createCommentMutation = useMutation({
        mutationFn: (body: string) => commentsApi.createComment(taskId, { body }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            setNewComment('');
            toast.success('Comment added');
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            toast.success('Comment deleted');
        },
    });

    const handleTitleBlur = () => {
        if (title !== task?.title) {
            updateTaskMutation.mutate({ title });
        } else {
            setIsEditingTitle(false);
        }
    };

    const handleDescBlur = () => {
        if (description !== task?.description) {
            updateTaskMutation.mutate({ description });
        } else {
            setIsEditingDesc(false);
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            createCommentMutation.mutate(newComment);
        }
    };

    if (isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8 relative flex flex-col max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Header Section */}
                    <div className="mb-8 pr-8">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                                autoFocus
                                className="text-2xl font-bold text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none pb-1"
                            />
                        ) : (
                            <h2
                                onClick={() => setIsEditingTitle(true)}
                                className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 rounded px-2 -ml-2 py-1 transition-colors"
                            >
                                {task?.title}
                            </h2>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 px-2 -ml-2">
                            <span>in list <span className="font-medium text-gray-700">Column {task?.columnId}</span></span>
                            <span className={`px-2 py-0.5 rounded-full ${getTaskStatusColor(task?.status || 'OPEN')}`}>
                                {getTaskStatusLabel(task?.status || 'OPEN')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Main Column */}
                        <div className="md:col-span-3 space-y-8">
                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold">
                                    <AlignLeft className="w-5 h-5" />
                                    <h3>Description</h3>
                                </div>
                                {isEditingDesc ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add a more detailed description..."
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDescBlur}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDescription(task?.description || '');
                                                    setIsEditingDesc(false);
                                                }}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDesc(true)}
                                        className={`min-h-[60px] p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!task?.description ? 'bg-gray-50 text-gray-500 italic' : 'text-gray-700'
                                            }`}
                                    >
                                        {task?.description || 'Add a description...'}
                                    </div>
                                )}
                            </div>

                            {/* Comments */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                                    <MessageSquare className="w-5 h-5" />
                                    <h3>Comments</h3>
                                </div>

                                {/* Add Comment */}
                                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                                        {getInitials(user?.fullName || 'User')}
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || createCommentMutation.isPending}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                {/* Comment List */}
                                <div className="space-y-4">
                                    {comments?.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 group">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                                                {getInitials(comment.author.fullName)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        {comment.author.fullName}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDateTime(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-gray-700 text-sm">
                                                    {comment.body}
                                                </div>
                                                {user?.id === comment.authorId && (
                                                    <button
                                                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                        className="text-xs text-red-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Actions */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Actions</h4>
                                <div className="space-y-2">
                                    <LabelPicker
                                        taskId={taskId}
                                        boardId={boardId}
                                        currentLabels={task?.labels || []}
                                    />
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this task?')) {
                                                deleteTaskMutation.mutate();
                                            }
                                        }}
                                        className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Task
                                    </button>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Details</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Created</span>
                                        <span className="text-gray-700">{task?.createdAt && formatDateTime(task.createdAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Updated</span>
                                        <span className="text-gray-700">{task?.updatedAt && formatDateTime(task.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
