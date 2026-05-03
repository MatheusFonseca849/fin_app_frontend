'use client'

import { Alert, Box, Card, CircularProgress, Grid, IconButton, InputAdornment, List, ListItem, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
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

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Dashboard = () => {

    const { user, patchUser } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceInput, setBalanceInput] = useState('');
    const [isSavingBalance, setIsSavingBalance] = useState(false);
    const [chartMode, setChartMode] = useState<'pie' | 'bar'>('pie');
    const [ccChartMode, setCcChartMode] = useState<'pie' | 'bar'>('pie');
    const [error, setError] = useState<string | null>(null);

    const crud = useTransactionCrud();

    const fetchDashboard = useCallback(async () => {
        try {
            setError(null);
            const data = await transactionsApi.getDashboard();
            setDashboardData(data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Erro ao carregar dados do dashboard. Tente recarregar a página.');
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
    const monthlyDebitExpenses = useMemo(() => (dashboardData?.monthlyDebitExpenses ?? 0) / 100, [dashboardData]);
    const monthlyCreditCardTotal = useMemo(() => (dashboardData?.monthlyCreditCardTotal ?? 0) / 100, [dashboardData]);
    const monthlyExpensesTotal = useMemo(() => (dashboardData?.monthlyExpensesTotal ?? 0) / 100, [dashboardData]);
    const monthlyIncomeTotal = useMemo(() => (dashboardData?.monthlyIncome ?? 0) / 100, [dashboardData]);
    const monthlyBalance = useMemo(() => (dashboardData?.monthlyBalance ?? 0) / 100, [dashboardData]);

    const mapChartData = (items: { name: string; color: string; value: number }[]) =>
        items.map(c => ({ ...c, value: c.value / 100, fill: c.color })).sort((a, b) => b.value - a.value);

    const expensesByCategory = useMemo(() => mapChartData(dashboardData?.expensesByCategory ?? []), [dashboardData]);
    const creditCardByCategory = useMemo(() => mapChartData(dashboardData?.creditCardByCategory ?? []), [dashboardData]);

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

    const DebitChartComponent = chartMode === 'pie' ? DashboardPieChart : DashboardBarChart;
    const CcChartComponent = ccChartMode === 'pie' ? DashboardPieChart : DashboardBarChart;

    return (
        <div>
            {error && (
                <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <Grid container direction="row">
                {/* LEFT COLUMN */}
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
                            <Typography variant="h4">{fmt(userBalance)}</Typography>
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

                {/* MIDDLE COLUMN */}
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Despesas em débito/Pix no mês</Typography>
                        <Typography variant="h4">{fmt(monthlyDebitExpenses)}</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Despesas por Categoria</Typography>
                            <ToggleButtonGroup
                                value={chartMode}
                                exclusive
                                onChange={(_, v) => v && setChartMode(v)}
                                size="small"
                            >
                                <ToggleButton value="pie"><PieChartIcon/></ToggleButton>
                                <ToggleButton value="bar"><BarChartIcon/></ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        <DebitChartComponent data={expensesByCategory} />
                    </Card>
                </Grid>

                {/* RIGHT COLUMN */}
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Fatura total no mês</Typography>
                        <Typography variant="h4" color="secondary.main">{fmt(monthlyCreditCardTotal)}</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Cartão de Crédito por Categoria</Typography>
                            <ToggleButtonGroup
                                value={ccChartMode}
                                exclusive
                                onChange={(_, v) => v && setCcChartMode(v)}
                                size="small"
                            >
                                <ToggleButton value="pie"><PieChartIcon/></ToggleButton>
                                <ToggleButton value="bar"><BarChartIcon/></ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {creditCardByCategory.length > 0
                            ? <CcChartComponent data={creditCardByCategory} />
                            : <Typography sx={{ textAlign: 'center', my: 4 }} color="text.secondary">Nenhuma despesa no cartão este mês.</Typography>
                        }
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Resumo do Mês</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Total em despesas</Typography>
                                <Typography variant="h5" color="error.main">{fmt(monthlyExpensesTotal)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Total em receitas no mês</Typography>
                                <Typography variant="h5" color="success.main">{fmt(monthlyIncomeTotal)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Balanço total no mês</Typography>
                                <Typography variant="h5" color={monthlyBalance >= 0 ? 'success.main' : 'error.main'}>{fmt(monthlyBalance)}</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

            </Grid>

            <TransactionCrudDialogs crud={crud} />
        </div>
    )
}

export default Dashboard
