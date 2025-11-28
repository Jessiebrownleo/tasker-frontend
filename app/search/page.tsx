'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api/tasks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { TaskCard } from '@/components/board/task-card';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

    const debouncedQuery = useDebounce(query, 500);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => tasksApi.searchTasks(debouncedQuery),
        enabled: !!debouncedQuery,
    });

    // Update URL when query changes
    useEffect(() => {
        if (debouncedQuery) {
            router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        } else {
            router.replace('/search');
        }
    }, [debouncedQuery, router]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Search Tasks</h1>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by task title or description..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                </header>

                {/* Results */}
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
                        {isLoading ? (
                            <div className="text-center py-12 text-gray-500">Searching...</div>
                        ) : query && results?.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No tasks found matching "{query}"
                            </div>
                        ) : results && results.length > 0 ? (
                            <div className="space-y-4">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                                    Found {results.length} tasks
                                </h2>
                                <div className="grid gap-4">
                                    {results.map((task) => (
                                        <div key={task.id} className="relative">
                                            <TaskCard
                                                task={task}
                                                onClick={() => setActiveTaskId(task.id)}
                                            />
                                            <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                Column {task.columnId}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                Type to start searching...
                            </div>
                        )}
                    </div>
                </main>

                {/* Task Detail Modal */}
                {activeTaskId && (
                    <TaskDetailModal
                        taskId={activeTaskId}
                        onClose={() => setActiveTaskId(null)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
