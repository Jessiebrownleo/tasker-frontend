'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/lib/api/labels';
import { Label } from '@/types';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface LabelManagerProps {
    boardId: number;
    onClose: () => void;
}

const COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
];

export function LabelManager({ boardId, onClose }: LabelManagerProps) {
    const queryClient = useQueryClient();
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const { data: labels, isLoading } = useQuery({
        queryKey: ['labels', boardId],
        queryFn: () => labelsApi.getLabels(boardId),
    });

    const createMutation = useMutation({
        mutationFn: () => labelsApi.createLabel(boardId, { name, color }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels', boardId] });
            setName('');
            setIsCreating(false);
            toast.success('Label created');
        },
    });

    const updateMutation = useMutation({
        mutationFn: () => labelsApi.updateLabel(editingLabel!.id, { name, color }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels', boardId] });
            setEditingLabel(null);
            setName('');
            toast.success('Label updated');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => labelsApi.deleteLabel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['labels', boardId] });
            toast.success('Label deleted');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLabel) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const startEdit = (label: Label) => {
        setEditingLabel(label);
        setName(label.name);
        setColor(label.color);
        setIsCreating(true);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Labels</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isCreating ? (
                        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900' : 'border-transparent'
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={!name}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {editingLabel ? 'Save' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingLabel(null);
                                        setName('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                setName('');
                                setColor(COLORS[0]);
                            }}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 mb-4"
                        >
                            <Plus className="w-4 h-4" />
                            Create Label
                        </button>
                    )}

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {labels?.map((label) => (
                            <div key={label.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                    />
                                    <span className="font-medium text-gray-700">{label.name}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(label)}
                                        className="p-1 text-gray-400 hover:text-blue-600"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this label?')) deleteMutation.mutate(label.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
