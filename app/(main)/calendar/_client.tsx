'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import TransactionCrudDialogs from '@/app/components/TransactionCrudDialogs';
import type { EventContentArg } from '@fullcalendar/core';
import { transactionsApi } from "@/lib/api"
import type { Transaction } from "@/lib/api"
import { useTransactionCrud } from '@/lib/hooks/useTransactionCrud'

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);

    // Transaction data
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Track visible date range for date-scoped fetching
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!dateRange) return;
        try {
            const { data } = await transactionsApi.getCalendar(dateRange.start, dateRange.end);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    }, [dateRange]);

    const crud = useTransactionCrud({ onChanged: fetchTransactions });

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    useEffect(() => {
        const handler = () => fetchTransactions();
        window.addEventListener('transaction-change', handler);
        return () => window.removeEventListener('transaction-change', handler);
    }, [fetchTransactions]);

    const handleDatesSet = useCallback((arg: { startStr: string; endStr: string }) => {
        setDateRange({ start: arg.startStr.slice(0, 10), end: arg.endStr.slice(0, 10) });
    }, []);

    const events = useMemo(() =>
        transactions.map(tx => ({
            title: `${tx.type === 'expense' ? '-' : '+'} R$ ${(tx.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${tx.description}`,
            start: tx.timestamp.split('T')[0],
            color: tx.type === 'expense' ? '#d32f2f' : '#388e3c',
            extendedProps: {
                id: tx._id,
            },
        })),
        [transactions]
    );

    const handleDateChange = (value: Dayjs | null) => {
        if (value && calendarRef.current) {
            calendarRef.current.getApi().gotoDate(value.toDate());
        }
    };

    const handleEdit = useCallback((txId: string) => {
        const tx = transactions.find(t => t._id === txId);
        if (tx) crud.edit.open(tx);
    }, [transactions, crud.edit]);

    const handleDelete = useCallback((txId: string) => {
        const tx = transactions.find(t => t._id === txId);
        if (tx) crud.del.open(tx);
    }, [transactions, crud.del]);

    const renderEventContent = useCallback((eventInfo: EventContentArg) => {
        const txId = eventInfo.event.extendedProps.id as string;
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    overflow: 'hidden',
                    px: 0.5,
                    '& .event-actions': { display: 'none' },
                    '&:hover .event-actions': { display: 'flex' },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        fontSize: '0.7rem',
                    }}
                >
                    {eventInfo.event.title}
                </Typography>
                <Box className="event-actions" sx={{ flexShrink: 0, ml: 0.5 }}>
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleEdit(txId); }}
                            sx={{ p: 0.25, color: 'white' }}
                        >
                            <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleDelete(txId); }}
                            sx={{ p: 0.25, color: 'white' }}
                        >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    }, [handleEdit, handleDelete]);

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, p: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                    <DatePicker
                        label="Ir para data"
                        defaultValue={dayjs()}
                        onChange={handleDateChange}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
            </Box>
            <Box sx={{ p: 2 }}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView='dayGridMonth'
                    events={events}
                    eventContent={renderEventContent}
                    datesSet={handleDatesSet}
                    locale='pt-br'
                    fixedWeekCount={false}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek'
                    }}
                    buttonText={{
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                    }}
                    height='auto'
                />
            </Box>

            <TransactionCrudDialogs crud={crud} />
        </div>
    )
}

export default Calendar
