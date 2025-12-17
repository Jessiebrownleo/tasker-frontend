'use client';

import { useState, useEffect } from 'react';
import { formatDateTime, formatDate } from '@/lib/utils';

interface FormattedDateProps {
    date: string | Date;
    mode?: 'date' | 'datetime';
    className?: string;
}

export function FormattedDate({ date, mode = 'datetime', className }: FormattedDateProps) {
    const [formatted, setFormatted] = useState('');

    useEffect(() => {
        if (mode === 'datetime') {
            setFormatted(formatDateTime(date));
        } else {
            setFormatted(formatDate(date));
        }
    }, [date, mode]);

    if (!formatted) return null;

    return <span className={className}>{formatted}</span>;
}
