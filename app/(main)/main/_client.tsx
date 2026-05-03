'use client'

import { Alert, Box, Card, Grid, List, ListItem, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import dynamic from 'next/dynamic'

const DashboardPieChart = dynamic(() => import('@/app/components/charts/DashboardPieChart'), { ssr: false })
const DashboardBarChart = dynamic(() => import('@/app/components/charts/DashboardBarChart'), { ssr: false })
import TransactionCard from "@/app/components/TransactionCard"
import TransactionCrudDialogs from "@/app/components/TransactionCrudDialogs"
import { useCallback, useMemo, useState } from "react"
import { useDashboard } from "@/lib/contexts/DashboardContext"
import { useTransactionCrud } from "@/lib/hooks/useTransactionCrud"

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Dashboard = () => {

    const { data: dashboardData, error } = useDashboard();
    const [chartMode, setChartMode] = useState<'pie' | 'bar'>('pie');
    const [ccChartMode, setCcChartMode] = useState<'pie' | 'bar'>('pie');

    const crud = useTransactionCrud();

    const upcomingExpenses = useMemo(() => dashboardData?.upcomingExpenses ?? [], [dashboardData]);
    const monthlyExpensesTotal = (dashboardData?.monthlyExpensesTotal ?? 0) / 100;
    const monthlyIncomeTotal = (dashboardData?.monthlyIncome ?? 0) / 100;
    const monthlyBalance = (dashboardData?.monthlyBalance ?? 0) / 100;

    const mapChartData = (items: { name: string; color: string; value: number }[]) =>
        items.map(c => ({ ...c, value: c.value / 100, fill: c.color })).sort((a, b) => b.value - a.value);

    const expensesByCategory = useMemo(() => mapChartData(dashboardData?.expensesByCategory ?? []), [dashboardData]);
    const creditCardByCategory = useMemo(() => mapChartData(dashboardData?.creditCardByCategory ?? []), [dashboardData]);

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
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}
            <Grid container direction="row">
                {/* LEFT COLUMN — Upcoming expenses */}
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Próximas Despesas</Typography>
                        {upcomingExpenses.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', my: 2 }}>
                                Você não tem despesas nos próximos dias. Seu bolso pode respirar!
                            </Typography>
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
                        )}
                    </Card>
                </Grid>

                {/* MIDDLE COLUMN — Debit chart */}
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Despesas por Categoria</Typography>
                            <ToggleButtonGroup
                                value={chartMode}
                                exclusive
                                onChange={(_, v) => v && setChartMode(v)}
                                size="small"
                            >
                                <ToggleButton value="pie"><PieChartIcon /></ToggleButton>
                                <ToggleButton value="bar"><BarChartIcon /></ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        {expensesByCategory.length > 0
                            ? <DebitChartComponent data={expensesByCategory} />
                            : <Typography sx={{ textAlign: 'center', my: 4 }} color="text.secondary">Nenhuma despesa em débito/Pix este mês.</Typography>
                        }
                    </Card>
                </Grid>

                {/* RIGHT COLUMN — CC chart + Resumo */}
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Cartão de Crédito por Categoria</Typography>
                            <ToggleButtonGroup
                                value={ccChartMode}
                                exclusive
                                onChange={(_, v) => v && setCcChartMode(v)}
                                size="small"
                            >
                                <ToggleButton value="pie"><PieChartIcon /></ToggleButton>
                                <ToggleButton value="bar"><BarChartIcon /></ToggleButton>
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
