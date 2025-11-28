import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getTaskStatusColor(status: string): string {
    switch (status) {
        case 'OPEN':
            return 'bg-gray-100 text-gray-800';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800';
        case 'DONE':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export function getTaskStatusLabel(status: string): string {
    switch (status) {
        case 'OPEN':
            return 'Open';
        case 'IN_PROGRESS':
            return 'In Progress';
        case 'DONE':
            return 'Done';
        default:
            return status;
    }
}
