'use client'

import { Box, Card, CircularProgress, Grid, IconButton, InputAdornment, List, ListItem, TextField, Typography } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import dynamic from 'next/dynamic'

const DashboardPieChart = dynamic(() => import('@/app/components/charts/DashboardPieChart'), { ssr: false })
const DashboardBarChart = dynamic(() => import('@/app/components/charts/DashboardBarChart'), { ssr: false })
import TransactionCard from "@/app/components/TransactionCard"
import TransactionCrudDialogs from "@/app/components/TransactionCrudDialogs"
import { useCallback, useEffect, useMemo, useState } from "react"
import { transactionsApi, usersApi } from "@/lib/api"
import type { DashboardData } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useTransactionCrud } from "@/lib/hooks/useTransactionCrud"

const Dashboard = () => {

    const { user, patchUser } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceInput, setBalanceInput] = useState('');
    const [isSavingBalance, setIsSavingBalance] = useState(false);

    const crud = useTransactionCrud();

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

    const upcomingExpenses = useMemo(() => dashboardData?.upcomingExpenses ?? [], [dashboardData]);
    const monthlyExpenseTotal = useMemo(() => (dashboardData?.monthlyExpenses ?? 0) / 100, [dashboardData]);
    const monthlyIncomeTotal = useMemo(() => (dashboardData?.monthlyIncome ?? 0) / 100, [dashboardData]);
    const monthlyBalance = useMemo(() => monthlyIncomeTotal - monthlyExpenseTotal, [monthlyIncomeTotal, monthlyExpenseTotal]);
    const expensesByCategory = useMemo(() => (dashboardData?.expensesByCategory ?? [])
        .map(c => ({
            ...c,
            value: c.value / 100,
            fill: c.color,
        }))
        .sort((a, b) => b.value - a.value), [dashboardData]);

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
        const parsed = parseFloat(balanceInput.replace(/\./g, '').replace(',', '.'));
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
        if (tx) crud.edit.open(tx);
    }, [upcomingExpenses, crud.edit]);

    const handleOpenDelete = useCallback((id: string) => {
        const tx = upcomingExpenses.find(t => t._id === id);
        if (tx) crud.del.open(tx);
    }, [upcomingExpenses, crud.del]);

    const handleOpenPayment = useCallback((id: string) => {
        const tx = upcomingExpenses.find(t => t._id === id);
        if (tx) crud.payment.open(tx);
    }, [upcomingExpenses, crud.payment]);

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
                        <DashboardPieChart data={expensesByCategory} />
                    </Card>
                </Grid>
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Total em receitas no mês:</Typography>
                        <Typography variant="h4">{monthlyIncomeTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', width: '100%' }}>Despesas por Categoria</Typography>
                        <DashboardBarChart data={expensesByCategory} />
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h5">Balanço do mês</Typography>
                        <Typography variant="h3">{monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
                    </Card>
                </Grid>

            </Grid>

            <TransactionCrudDialogs crud={crud} />
        </div>
    )
}

export default Dashboard
