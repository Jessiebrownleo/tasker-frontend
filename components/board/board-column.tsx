'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, TaskSummary } from '@/types';
import { TaskCard } from './task-card';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

interface BoardColumnProps {
    column: Column;
    tasks: TaskSummary[];
    onAddTask: () => void;
    onTaskClick: (taskId: number) => void;
}

export function BoardColumn({ column, tasks, onAddTask, onTaskClick }: BoardColumnProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="flex-shrink-0 w-80 bg-gray-100 rounded-lg h-[500px] opacity-50 border-2 border-blue-500"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex-shrink-0 w-80 flex flex-col max-h-full"
        >
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col max-h-full">
                {/* Column Header */}
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
                >
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{column.name}</h3>
                        <span className="text-sm text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                            {tasks.length}
                        </span>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto min-h-[100px] space-y-3 pr-1">
                    <SortableContext
                        items={tasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => onTaskClick(task.id)}
                            />
                        ))}
                    </SortableContext>
                </div>

                {/* Add Task Button */}
                <button
                    onClick={onAddTask}
                    className="mt-3 w-full px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Task
                </button>
            </div>
        </div>
    );
}
