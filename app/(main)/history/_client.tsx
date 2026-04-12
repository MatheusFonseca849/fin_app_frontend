'use client'

import { Box, Card, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { useMemo, useState, useEffect, useCallback } from "react"
import dynamic from 'next/dynamic'

const HistoryComposedChart = dynamic(() => import('@/app/components/charts/HistoryComposedChart'), { ssr: false })
const HistoryAreaChart = dynamic(() => import('@/app/components/charts/HistoryAreaChart'), { ssr: false })
import TransactionsTable from "@/app/components/TransactionsTable";
import type { ServerFilterValues } from "@/app/components/TransactionsTable";
import { transactionsApi } from "@/lib/api"
import type { Transaction, MonthlySummaryItem, TransactionsResponse } from "@/lib/api/transactions"

type RangeKey = '3m' | '6m' | '1y' | '2y' | '3y' | '5y' | 'all';

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1A' },
    { value: '2y', label: '2A' },
    { value: '3y', label: '3A' },
    { value: '5y', label: '5A' },
    { value: 'all', label: 'Tudo' },
];

const RANGE_MONTHS: Record<RangeKey, number | undefined> = {
    '3m': 3,
    '6m': 6,
    '1y': 12,
    '2y': 24,
    '3y': 36,
    '5y': 60,
    'all': undefined,
};

const HistoryPage = () => {

    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

    const [range, setRange] = useState<RangeKey>('6m');

    // Chart data from server-side aggregation
    const [chartData, setChartData] = useState<MonthlySummaryItem[]>([]);

    // Table data with server-side pagination
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tablePage, setTablePage] = useState(0);
    const [tableRowsPerPage, setTableRowsPerPage] = useState(25);
    const [tableTotalPages, setTableTotalPages] = useState(1);
    const [tableTotal, setTableTotal] = useState(0);
    const [tableFilterParams, setTableFilterParams] = useState<ServerFilterValues>({});

    const fetchChartData = useCallback(async () => {
        try {
            const res = await transactionsApi.getMonthlySummary();
            setChartData(res.data);
        } catch (error) {
            console.error('Failed to fetch monthly summary:', error);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoadingTransactions(true);
            const res: TransactionsResponse = await transactionsApi.getAll({
                page: tablePage + 1,
                limit: tableRowsPerPage,
                ...tableFilterParams,
            });
            setTransactions(res.data);
            setTableTotalPages(res.pagination.pages);
            setTableTotal(res.pagination.total);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoadingTransactions(false);
        }
    }, [tablePage, tableRowsPerPage, tableFilterParams]);

    useEffect(() => { fetchChartData(); }, [fetchChartData]);
    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    useEffect(() => {
        const handler = () => { fetchChartData(); fetchTransactions(); };
        window.addEventListener('transaction-change', handler);
        return () => window.removeEventListener('transaction-change', handler);
    }, [fetchChartData, fetchTransactions]);

    const allFormattedChartData = useMemo(() =>
        chartData.map(item => {
            const label = new Date(item.year, item.month - 1)
                .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            return {
                month: label,
                despesas: Number((item.despesas / 100).toFixed(2)),
                receitas: Number((item.receitas / 100).toFixed(2)),
                saldo: Number((item.saldo / 100).toFixed(2)),
            };
        }),
        [chartData]
    );

    const filteredChartData = useMemo(() => {
        const months = RANGE_MONTHS[range];
        if (!months) return allFormattedChartData;
        return allFormattedChartData.slice(-months);
    }, [range, allFormattedChartData]);

    const handleTablePageChange = useCallback((newPage: number) => {
        setTablePage(newPage);
    }, []);

    const handleTableRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        setTableRowsPerPage(newRowsPerPage);
        setTablePage(0);
    }, []);

    const handleTableFiltersChange = useCallback((filters: ServerFilterValues) => {
        setTableFilterParams(filters);
        setTablePage(0);
    }, []);

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 2 }}>
                <ToggleButtonGroup
                    value={range}
                    exclusive
                    onChange={(_, value) => value && setRange(value)}
                    size="small"
                >
                    {RANGE_OPTIONS.map((opt) => (
                        <ToggleButton key={opt.value} value={opt.value} sx={{ px: 2 }}>
                            {opt.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <Grid container>
                <Grid size={6} sx={{ p: 2 }} spacing={2}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Despesas x Receitas</Typography>
                        <HistoryComposedChart data={filteredChartData} />
                    </Card>
                </Grid>
                <Grid size={6} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Histórico de Saldo</Typography>
                        <HistoryAreaChart data={filteredChartData} />
                    </Card>
                </Grid>
            </Grid>
            <Grid container>
                <Grid size={12} sx={{ p: 2 }} spacing={2}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Transações</Typography>
                        <TransactionsTable
                            transactions={transactions}
                            onTransactionChange={fetchTransactions}
                            isLoading={isLoadingTransactions}
                            onFiltersChange={handleTableFiltersChange}
                            serverPagination={{
                                page: tablePage,
                                pages: tableTotalPages,
                                total: tableTotal,
                                rowsPerPage: tableRowsPerPage,
                                onPageChange: handleTablePageChange,
                                onRowsPerPageChange: handleTableRowsPerPageChange,
                            }}
                        />
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}

export default HistoryPage
