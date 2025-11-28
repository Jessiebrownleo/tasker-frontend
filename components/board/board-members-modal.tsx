'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api/boards';
import { authApi } from '@/lib/api/auth';
import { BoardMember, BoardRole } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { X, UserPlus, Trash2, Shield } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

interface BoardMembersModalProps {
    boardId: number;
    onClose: () => void;
}

export function BoardMembersModal({ boardId, onClose }: BoardMembersModalProps) {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();
    const [newMemberId, setNewMemberId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch members
    const { data: members, isLoading } = useQuery({
        queryKey: ['members', boardId],
        queryFn: () => boardsApi.getMembers(boardId),
    });

    // Mutations
    const addMemberMutation = useMutation({
        mutationFn: (userId: number) =>
            boardsApi.addMember(boardId, { userId, role: 'MEMBER' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', boardId] });
            setNewMemberId('');
            setIsAdding(false);
            toast.success('Member added');
        },
        onError: () => {
            toast.error('Failed to add member. Check ID.');
        },
    });

    const updateMemberMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: BoardRole }) =>
            boardsApi.updateMember(boardId, userId, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', boardId] });
            toast.success('Role updated');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => boardsApi.removeMember(boardId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', boardId] });
            toast.success('Member removed');
        },
    });

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        const userId = parseInt(newMemberId);
        if (!isNaN(userId)) {
            addMemberMutation.mutate(userId);
        }
    };

    const canManageMembers = members?.some(
        m => m.userId === currentUser?.id && (m.role === 'OWNER' || m.role === 'ADMIN')
    );

    if (isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Board Members</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Add Member */}
                    {canManageMembers && (
                        <div className="mb-6">
                            {isAdding ? (
                                <form onSubmit={handleAddMember} className="flex gap-2">
                                    <input
                                        type="number"
                                        value={newMemberId}
                                        onChange={(e) => setNewMemberId(e.target.value)}
                                        placeholder="Enter User ID"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMemberId || addMemberMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Member
                                </button>
                            )}
                        </div>
                    )}

                    {/* Members List */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {members?.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {getInitials(member.fullName)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {member.fullName}
                                            {member.userId === currentUser?.id && ' (You)'}
                                        </div>
                                        <div className="text-xs text-gray-500">{member.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {canManageMembers && member.role !== 'OWNER' ? (
                                        <select
                                            value={member.role}
                                            onChange={(e) => updateMemberMutation.mutate({
                                                userId: member.userId,
                                                role: e.target.value as BoardRole
                                            })}
                                            className="text-xs border-none bg-gray-50 rounded px-2 py-1 cursor-pointer hover:bg-gray-100 focus:ring-0"
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="MEMBER">Member</option>
                                            <option value="VIEWER">Viewer</option>
                                        </select>
                                    ) : (
                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 flex items-center gap-1">
                                            {member.role === 'OWNER' && <Shield className="w-3 h-3" />}
                                            {member.role}
                                        </span>
                                    )}

                                    {canManageMembers && member.role !== 'OWNER' && member.userId !== currentUser?.id && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Remove this member?')) {
                                                    removeMemberMutation.mutate(member.userId);
                                                }
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
