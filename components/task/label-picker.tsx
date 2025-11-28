'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/lib/api/labels';
import { tasksApi } from '@/lib/api/tasks';
import { LabelBrief } from '@/types';
import { Check, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LabelPickerProps {
    taskId: number;
    boardId: number;
    currentLabels: LabelBrief[];
}

export function LabelPicker({ taskId, boardId, currentLabels }: LabelPickerProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: labels } = useQuery({
        queryKey: ['labels', boardId],
        queryFn: () => labelsApi.getLabels(boardId),
        enabled: isOpen,
    });

    const addLabelMutation = useMutation({
        mutationFn: (labelId: number) => tasksApi.addLabel(taskId, labelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const removeLabelMutation = useMutation({
        mutationFn: (labelId: number) => tasksApi.removeLabel(taskId, labelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const toggleLabel = (labelId: number) => {
        const isSelected = currentLabels.some((l) => l.id === labelId);
        if (isSelected) {
            removeLabelMutation.mutate(labelId);
        } else {
            addLabelMutation.mutate(labelId);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium w-full"
            >
                <Tag className="w-4 h-4" />
                Labels
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                            Select Labels
                        </h4>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {labels?.map((label) => {
                                const isSelected = currentLabels.some((l) => l.id === label.id);
                                return (
                                    <button
                                        key={label.id}
                                        onClick={() => toggleLabel(label.id)}
                                        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded text-left group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <span className="text-sm text-gray-700">{label.name}</span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                    </button>
                                );
                            })}
                            {labels?.length === 0 && (
                                <p className="text-xs text-gray-500 px-2 py-1">No labels found.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
