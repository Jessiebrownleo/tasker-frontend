'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api/boards';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, LogOut, Search } from 'lucide-react';

export default function BoardsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, logout } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');

    const { data: boards, isLoading } = useQuery({
        queryKey: ['boards'],
        queryFn: boardsApi.getBoards,
    });

    const createMutation = useMutation({
        mutationFn: boardsApi.createBoard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            setShowCreateModal(false);
            setNewBoardName('');
            toast.success('Board created successfully');
        },
        onError: () => {
            toast.error('Failed to create board');
        },
    });

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleCreateBoard = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBoardName.trim()) {
            createMutation.mutate({ name: newBoardName });
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Tasker</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/search')}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Search tasks"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                            <span className="text-gray-700">{user?.fullName}</span>
                            <button
                                onClick={() => router.push('/profile')}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">My Boards</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Board
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md h-32 animate-pulse" />
                            ))}
                        </div>
                    ) : boards && boards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boards.map((board) => (
                                <div
                                    key={board.id}
                                    onClick={() => router.push(`/board/${board.id}`)}
                                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{board.name}</h3>
                                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                        {board.visibility}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg mb-4">No boards yet</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                Create your first board
                            </button>
                        </div>
                    )}
                </main>

                {/* Create Board Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Board</h3>
                            <form onSubmit={handleCreateBoard}>
                                <input
                                    type="text"
                                    value={newBoardName}
                                    onChange={(e) => setNewBoardName(e.target.value)}
                                    placeholder="Board name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setNewBoardName('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newBoardName.trim() || createMutation.isPending}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createMutation.isPending ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
