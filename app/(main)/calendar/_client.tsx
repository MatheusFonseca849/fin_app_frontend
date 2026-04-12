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
import ModalComponent from '@/app/components/ModalComponent';
import AddTransaction, { initialTransactionFormData, TransactionFormData } from '@/app/components/AddTransactionModal';
import type { EventContentArg } from '@fullcalendar/core';
import { transactionsApi } from "@/lib/api"
import type { Transaction } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useCategories } from "@/lib/contexts/CategoriesContext"

interface CalendarTransaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    type: 'credito' | 'debito';
}

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const { user, patchUser } = useAuth();
    const { categories: allCategories } = useCategories();

    // Transaction data
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<CalendarTransaction | null>(null);
    const [editForm, setEditForm] = useState<TransactionFormData>(initialTransactionFormData);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingTransaction, setDeletingTransaction] = useState<CalendarTransaction | null>(null);

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
            title: `${tx.type === 'debito' ? '-' : '+'} R$ ${(tx.value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${tx.description}`,
            start: tx.timestamp.split('T')[0],
            color: tx.type === 'debito' ? '#d32f2f' : '#388e3c',
            extendedProps: {
                id: tx._id,
                description: tx.description,
                amount: tx.value / 100,
                category: tx.category?.name || '',
                date: tx.timestamp.split('T')[0],
                type: tx.type,
            },
        })),
        [transactions]
    );

    const handleDateChange = (value: Dayjs | null) => {
        if (value && calendarRef.current) {
            calendarRef.current.getApi().gotoDate(value.toDate());
        }
    };

    const handleEdit = useCallback((tx: CalendarTransaction) => {
        const fullTx = transactions.find(t => t._id === tx.id);
        if (!fullTx) return;
        setEditingTransaction(tx);
        setEditForm({
            description: fullTx.description,
            value: (fullTx.value / 100).toFixed(2),
            type: fullTx.type,
            category: fullTx.category?._id || '',
            date: fullTx.timestamp.split('T')[0],
            isPaid: fullTx.isPaid,
            isRecurrent: fullTx.isRecurrent,
            billingDay: fullTx.billingDay ? String(fullTx.billingDay) : '',
        });
        setEditModalOpen(true);
    }, [transactions]);

    const handleCloseEdit = useCallback(() => {
        setEditModalOpen(false);
        setEditingTransaction(null);
    }, []);

    const handleEditSubmit = useCallback(async () => {
        if (!editingTransaction) return;
        setIsSavingEdit(true);
        try {
            const { balance } = await transactionsApi.update(editingTransaction.id, {
                description: editForm.description,
                value: parseFloat(editForm.value),
                type: editForm.type,
                category: editForm.category,
                date: editForm.date || undefined,
                isPaid: editForm.isPaid,
                isRecurrent: editForm.isRecurrent,
                billingDay: editForm.billingDay ? Number(editForm.billingDay) : undefined,
            });
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            handleCloseEdit();
            await fetchTransactions();
        } catch (error) {
            console.error('Failed to update transaction:', error);
        } finally {
            setIsSavingEdit(false);
        }
    }, [editingTransaction, editForm, patchUser, fetchTransactions, handleCloseEdit]);

    const editCategories = useMemo(() => {
        return allCategories
            .filter(c => c.type === editForm.type)
            .map(c => ({ _id: c._id, name: c.name }));
    }, [allCategories, editForm.type]);

    const handleDelete = useCallback((tx: CalendarTransaction) => {
        setDeletingTransaction(tx);
        setDeleteModalOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deletingTransaction) return;
        try {
            const { balance } = await transactionsApi.delete(deletingTransaction.id);
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            setDeleteModalOpen(false);
            setDeletingTransaction(null);
            await fetchTransactions();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    }, [deletingTransaction, patchUser, fetchTransactions]);

    const renderEventContent = useCallback((eventInfo: EventContentArg) => {
        const tx = eventInfo.event.extendedProps as CalendarTransaction;
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
                            onClick={(e) => { e.stopPropagation(); handleEdit(tx); }}
                            sx={{ p: 0.25, color: 'white' }}
                        >
                            <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleDelete(tx); }}
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

            {/* Edit Modal */}
            <ModalComponent
                open={editModalOpen}
                handleClose={handleCloseEdit}
                title="Editar Transação"
                layout={
                    <AddTransaction
                        formData={editForm}
                        setFormData={setEditForm}
                        categories={editCategories}
                    />
                }
                action={handleEditSubmit}
                confirmLabel={isSavingEdit ? 'Salvando...' : 'Salvar'}
            />

            {/* Delete Confirmation Modal */}
            <ModalComponent
                open={deleteModalOpen}
                handleClose={() => { setDeleteModalOpen(false); setDeletingTransaction(null); }}
                title="Excluir Transação"
                confirmLabel="Excluir"
                action={handleDeleteConfirm}
                layout={
                    <Typography sx={{ py: 1 }}>
                        Tem certeza que deseja excluir <strong>{deletingTransaction?.description}</strong> no valor de{' '}
                        <strong>R$ {deletingTransaction?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>?
                    </Typography>
                }
            />
        </div>
    )
}

export default Calendar
