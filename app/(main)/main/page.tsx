'use client'

import { Box, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, InputAdornment, List, ListItem, TextField, Typography } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import TransactionCard from "@/app/components/TransactionCard"
import ModalComponent from "@/app/components/ModalComponent"
import AddTransaction, { initialTransactionFormData, TransactionFormData } from "@/app/components/AddTransactionModal"
import { useCallback, useEffect, useState, useMemo } from "react"
import { transactionsApi, usersApi } from "@/lib/api"
import type { Transaction, DashboardData } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useCategories } from "@/lib/contexts/CategoriesContext"

const Dashboard = () => {

    const { user, patchUser } = useAuth();
    const { categories: allCategories } = useCategories();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceInput, setBalanceInput] = useState('');
    const [isSavingBalance, setIsSavingBalance] = useState(false);

    // Edit state
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editForm, setEditForm] = useState<TransactionFormData>(initialTransactionFormData);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Delete state
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Payment confirmation state
    const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    const fetchDashboard = useCallback(async () => {
        try {
            const data = await transactionsApi.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    useEffect(() => {
        const handler = () => fetchDashboard();
        window.addEventListener('transaction-change', handler);
        return () => window.removeEventListener('transaction-change', handler);
    }, [fetchDashboard]);

    const upcomingExpenses = dashboardData?.upcomingExpenses ?? [];
    const monthlyExpenseTotal = (dashboardData?.monthlyExpenses ?? 0) / 100;
    const monthlyIncomeTotal = (dashboardData?.monthlyIncome ?? 0) / 100;
    const monthlyBalance = monthlyIncomeTotal - monthlyExpenseTotal;
    const expensesByCategory = (dashboardData?.expensesByCategory ?? []).map(c => ({
        ...c,
        value: c.value / 100,
        fill: c.color,
    }));

    const userBalance = (user?.balance ?? 0) / 100;

    const handleEditBalance = useCallback(() => {
        setBalanceInput(userBalance.toFixed(2).replace('.', ','));
        setIsEditingBalance(true);
    }, [userBalance]);

    const handleCancelBalance = useCallback(() => {
        setIsEditingBalance(false);
        setBalanceInput('');
    }, []);

    const handleSaveBalance = useCallback(async () => {
        const parsed = parseFloat(balanceInput.replace(',', '.'));
        if (isNaN(parsed)) return;
        setIsSavingBalance(true);
        try {
            const { balance } = await usersApi.setBalance(Math.round(parsed * 100));
            patchUser({ balance });
            setIsEditingBalance(false);
        } catch (error) {
            console.error('Failed to update balance:', error);
        } finally {
            setIsSavingBalance(false);
        }
    }, [balanceInput, patchUser]);

    const handleOpenEdit = useCallback((id: string) => {
        const tx = upcomingExpenses.find(t => t._id === id);
        if (!tx) return;
        setEditingTransaction(tx);
        setEditForm({
            description: tx.description,
            value: (tx.value / 100).toFixed(2),
            type: tx.type,
            category: tx.category?._id || '',
            date: tx.timestamp.split('T')[0],
            isPaid: tx.isPaid,
            isRecurrent: tx.isRecurrent,
            billingDay: tx.billingDay ? String(tx.billingDay) : '',
        });
        setIsEditModalOpen(true);
    }, [upcomingExpenses]);

    const handleCloseEdit = useCallback(() => {
        setIsEditModalOpen(false);
        setEditingTransaction(null);
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingTransaction) return;
        setIsSavingEdit(true);
        try {
            const { balance } = await transactionsApi.update(editingTransaction._id, {
                description: editForm.description,
                value: parseFloat(editForm.value),
                type: editForm.type,
                category: editForm.category,
                date: editForm.date || undefined,
                isPaid: editForm.isPaid,
                isRecurrent: editForm.isRecurrent || undefined,
                billingDay: editForm.billingDay ? Number(editForm.billingDay) : undefined,
            });
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            handleCloseEdit();
        } catch (error) {
            console.error('Failed to update transaction:', error);
        } finally {
            setIsSavingEdit(false);
        }
    }, [editingTransaction, editForm, patchUser, handleCloseEdit]);

    const handleOpenDelete = useCallback((id: string) => {
        const tx = upcomingExpenses.find(t => t._id === id);
        if (!tx) return;
        setDeletingTransaction(tx);
        setIsDeleteDialogOpen(true);
    }, [upcomingExpenses]);

    const handleCloseDelete = useCallback(() => {
        setIsDeleteDialogOpen(false);
        setDeletingTransaction(null);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingTransaction) return;
        setIsDeleting(true);
        try {
            const { balance } = await transactionsApi.delete(deletingTransaction._id);
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            handleCloseDelete();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        } finally {
            setIsDeleting(false);
        }
    }, [deletingTransaction, patchUser, handleCloseDelete]);

    const handleOpenPayment = useCallback((id: string) => {
        const tx = upcomingExpenses.find(t => t._id === id);
        if (!tx) return;
        setPayingTransaction(tx);
        setIsPayDialogOpen(true);
    }, [upcomingExpenses]);

    const handleClosePayment = useCallback(() => {
        setIsPayDialogOpen(false);
        setPayingTransaction(null);
    }, []);

    const handleConfirmPayment = useCallback(async () => {
        if (!payingTransaction) return;
        setIsPaying(true);
        try {
            const { balance } = await transactionsApi.update(payingTransaction._id, { isPaid: true });
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            handleClosePayment();
        } catch (error) {
            console.error('Failed to mark transaction as paid:', error);
        } finally {
            setIsPaying(false);
        }
    }, [payingTransaction, patchUser, handleClosePayment]);

    const editCategories = useMemo(() => {
        return allCategories
            .filter(c => c.type === editForm.type)
            .map(c => ({ _id: c._id, name: c.name }));
    }, [allCategories, editForm.type]);

    return (
        <div>
            <Grid container direction="row">
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Saldo Total</Typography>
                            {!isEditingBalance && (
                                <IconButton size="small" onClick={handleEditBalance} aria-label="editar saldo">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>
                        {isEditingBalance ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <TextField
                                    size="small"
                                    value={balanceInput}
                                    onChange={(e) => setBalanceInput(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                        },
                                    }}
                                    disabled={isSavingBalance}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveBalance();
                                        if (e.key === 'Escape') handleCancelBalance();
                                    }}
                                />
                                <IconButton size="small" onClick={handleSaveBalance} disabled={isSavingBalance} color="success">
                                    {isSavingBalance ? <CircularProgress size={18} /> : <CheckIcon fontSize="small" />}
                                </IconButton>
                                <IconButton size="small" onClick={handleCancelBalance} disabled={isSavingBalance} color="error">
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <Typography variant="h4">{userBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                        )}
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Próximas Despesas</Typography>
                        {
                            upcomingExpenses.length === 0 ? (
                                <Typography sx={{textAlign: 'center', my: 2}}>Você não tem despesas nos próximos dias. Seu bolso pode respirar!</Typography>
                            ) : (
                        <List>
                            {upcomingExpenses.map(tx => (
                                <ListItem key={tx._id}>
                                    <TransactionCard
                                        id={tx._id}
                                        description={tx.description}
                                        amount={tx.value / 100}
                                        category={tx.category?.name || 'Sem Categoria'}
                                        date={tx.timestamp.split('T')[0]}
                                        color={tx.category?.color ?? '#757575'}
                                        onEdit={handleOpenEdit}
                                        onDelete={handleOpenDelete}
                                        onMarkPaid={handleOpenPayment}
                                    />
                                </ListItem>
                            ))}
                        </List>
                            )
                        }
                    </Card>
                </Grid>
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Total em despesas no mês:</Typography>
                        <Typography variant="h4">{monthlyExpenseTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', width: '100%' }}>Despesas por Categoria</Typography>
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart width={400} height={400}>
                                <Pie data={expensesByCategory} dataKey="value" nameKey="name" />
                                <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Total em receitas no mês:</Typography>
                        <Typography variant="h4">{monthlyIncomeTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', width: '100%' }}>Despesas por Categoria</Typography>
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart width={400} height={400} data={expensesByCategory} layout="vertical">
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Bar dataKey="value" name="value" />
                                <Tooltip />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h5">Balanço do mês</Typography>
                        <Typography variant="h3">{monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Card>
                </Grid>

            </Grid>

            <ModalComponent
                open={isEditModalOpen}
                handleClose={handleCloseEdit}
                title="Editar Transação"
                layout={
                    <AddTransaction
                        formData={editForm}
                        setFormData={setEditForm}
                        categories={editCategories}
                    />
                }
                action={handleSaveEdit}
                confirmLabel={isSavingEdit ? 'Salvando...' : 'Salvar'}
            />

            <Dialog open={isPayDialogOpen} onClose={handleClosePayment}>
                <DialogTitle>Confirmar Pagamento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Deseja confirmar o pagamento de <strong>&ldquo;{payingTransaction?.description}&rdquo;</strong> no valor de{' '}
                        <strong>{((payingTransaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePayment} disabled={isPaying}>Cancelar</Button>
                    <Button onClick={handleConfirmPayment} color="success" variant="contained" disabled={isPaying}>
                        {isPaying ? <CircularProgress size={20} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onClose={handleCloseDelete}>
                <DialogTitle>Excluir Transação</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir a transação <strong>&ldquo;{deletingTransaction?.description}&rdquo;</strong> no valor de{' '}
                        <strong>{((deletingTransaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} disabled={isDeleting}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={20} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Dashboard