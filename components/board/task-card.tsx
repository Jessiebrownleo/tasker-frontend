'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskSummary } from '@/types';
import { getTaskStatusColor, getTaskStatusLabel } from '@/lib/utils';

interface TaskCardProps {
    task: TaskSummary;
    onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
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
                className="bg-white rounded-lg p-4 shadow-sm opacity-50 border-2 border-blue-500 h-[100px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
        >
            <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {task.title}
            </h4>
            {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.labels.map(label => (
                        <div
                            key={label.id}
                            className="h-1.5 w-8 rounded-full"
                            style={{ backgroundColor: label.color }}
                            title={label.name}
                        />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-2">
                <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getTaskStatusColor(
                        task.status
                    )}`}
                >
                    {getTaskStatusLabel(task.status)}
                </span>
                {task.dueDate && (
                    <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
}
