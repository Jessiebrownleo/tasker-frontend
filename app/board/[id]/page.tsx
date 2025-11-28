'use client';

import { ProtectedRoute } from '@/components/protected-route';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/lib/api/boards';
import { tasksApi } from '@/lib/api/tasks';
import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';
import { BoardColumn } from '@/components/board/board-column';
import { TaskCard } from '@/components/board/task-card';
import { Column, TaskSummary } from '@/types';
import { createPortal } from 'react-dom';
import { TaskDetailModal } from '@/components/task/task-detail-modal';
import { BoardMembersModal } from '@/components/board/board-members-modal';
import { LabelManager } from '@/components/board/label-manager';
import { Users, Tag } from 'lucide-react';

export default function BoardPage() {
    const router = useRouter();
    const params = useParams();
    const boardId = Number(params.id);
    const queryClient = useQueryClient();

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<TaskSummary | null>(null);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showLabelManager, setShowLabelManager] = useState(false);
    const [showCreateColumn, setShowCreateColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Queries
    const { data: board, isLoading: isBoardLoading } = useQuery({
        queryKey: ['board', boardId],
        queryFn: () => boardsApi.getBoard(boardId),
    });

    const { data: columns = [] } = useQuery({
        queryKey: ['columns', boardId],
        queryFn: () => boardsApi.getColumns(boardId),
        enabled: !!boardId,
    });

    // Fetch all tasks for all columns
    // Note: In a real app, you might want to fetch tasks per column or all at once efficiently
    // For now, we'll fetch tasks for each column
    const { data: allTasks = [] } = useQuery({
        queryKey: ['tasks', 'board', boardId],
        queryFn: async () => {
            if (!columns.length) return [];
            const promises = columns.map(col => tasksApi.getTasksByColumn(col.id));
            const results = await Promise.all(promises);
            return results.flat();
        },
        enabled: columns.length > 0,
    });

    // Mutations
    const moveTaskMutation = useMutation({
        mutationFn: ({ taskId, toColumnId, position }: { taskId: number; toColumnId: number; position: number }) =>
            tasksApi.moveTask(taskId, { toColumnId, position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'board', boardId] });
        },
    });

    const createColumnMutation = useMutation({
        mutationFn: (name: string) => boardsApi.createColumn(boardId, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
            setShowCreateColumn(false);
            setNewColumnName('');
            toast.success('Column created');
        },
    });

    // DnD Handlers
    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (isActiveTask && (isOverTask || isOverColumn)) {
            // Moving task
            const task = active.data.current?.task as TaskSummary;
            let targetColumnId: number;
            let newPosition: number;

            if (isOverTask) {
                const overTask = over.data.current?.task as TaskSummary;
                targetColumnId = overTask.columnId;
                // Calculate position based on index in the list
                // This is simplified; for precise reordering we need the index in the target list
                // For now, we'll just move it to the column
                newPosition = overTask.position; // This is an approximation
            } else {
                // Dropped on a column
                targetColumnId = Number(overId);
                newPosition = 1; // Top of the list or bottom
            }

            // Optimistic update could happen here

            moveTaskMutation.mutate({
                taskId: task.id,
                toColumnId: targetColumnId,
                position: newPosition
            });
        }
    };

    const handleCreateColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (newColumnName.trim()) {
            createColumnMutation.mutate(newColumnName);
        }
    };

    // Group tasks by column
    const tasksByColumn = useMemo(() => {
        const map = new Map<number, TaskSummary[]>();
        columns.forEach(col => map.set(col.id, []));
        allTasks.forEach(task => {
            const list = map.get(task.columnId);
            if (list) list.push(task);
        });
        return map;
    }, [columns, allTasks]);

    if (isBoardLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading board...</div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/boards')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">{board?.name}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowMembersModal(true)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Users className="w-4 h-4" />
                                Members
                            </button>
                            <button
                                onClick={() => setShowLabelManager(true)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Tag className="w-4 h-4" />
                                Labels
                            </button>
                        </div>
                    </div>
                </header>

                {/* Kanban Board */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="h-full p-6 inline-flex items-start gap-6">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        >
                            <SortableContext
                                items={columns.map((c) => c.id)}
                                strategy={horizontalListSortingStrategy}
                            >
                                {columns.map((column) => (
                                    <BoardColumn
                                        key={column.id}
                                        column={column}
                                        tasks={tasksByColumn.get(column.id) || []}
                                        onAddTask={() => {
                                            // TODO: Open create task modal
                                            toast.info(`Add task to ${column.name}`);
                                        }}
                                        onTaskClick={(taskId) => {
                                            setActiveTaskId(taskId);
                                        }}
                                    />
                                ))}
                            </SortableContext>

                            {/* Add Column Button */}
                            <div className="flex-shrink-0 w-80">
                                {showCreateColumn ? (
                                    <form
                                        onSubmit={handleCreateColumn}
                                        className="bg-white rounded-lg p-4 shadow-md"
                                    >
                                        <input
                                            type="text"
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                            placeholder="Column name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateColumn(false);
                                                    setNewColumnName('');
                                                }}
                                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowCreateColumn(true)}
                                        className="w-full px-4 py-3 bg-white/50 hover:bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 font-semibold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Column
                                    </button>
                                )}
                            </div>

                            {/* Drag Overlay */}
                            {createPortal(
                                <DragOverlay>
                                    {activeColumn && (
                                        <BoardColumn
                                            column={activeColumn}
                                            tasks={tasksByColumn.get(activeColumn.id) || []}
                                            onAddTask={() => { }}
                                            onTaskClick={() => { }}
                                        />
                                    )}
                                    {activeTask && <TaskCard task={activeTask} />}
                                </DragOverlay>,
                                document.body
                            )}
                        </DndContext>
                    </div>
                </main>

                {/* Task Detail Modal */}
                {activeTaskId && (
                    <TaskDetailModal
                        taskId={activeTaskId}
                        boardId={boardId}
                        onClose={() => setActiveTaskId(null)}
                    />
                )}

                {/* Members Modal */}
                {showMembersModal && (
                    <BoardMembersModal
                        boardId={boardId}
                        onClose={() => setShowMembersModal(false)}
                    />
                )}

                {/* Label Manager Modal */}
                {showLabelManager && (
                    <LabelManager
                        boardId={boardId}
                        onClose={() => setShowLabelManager(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}
