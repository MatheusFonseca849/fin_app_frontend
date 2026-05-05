'use client'

import { Alert, Box, Card, Chip, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { useMemo, useState, useEffect, useCallback } from "react"
import dynamic from 'next/dynamic'

const HistoryComposedChart = dynamic(() => import('@/app/components/charts/HistoryComposedChart'), { ssr: false })
const HistoryAreaChart = dynamic(() => import('@/app/components/charts/HistoryAreaChart'), { ssr: false })
const HistoryCCBarChart = dynamic(() => import('@/app/components/charts/HistoryCCBarChart'), { ssr: false })
import TransactionsTable from "@/app/components/TransactionsTable";
import type { ServerFilterValues } from "@/app/components/TransactionsTable";
import PeriodSummaryCard from "@/app/components/PeriodSummaryCard";
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

const EMPTY_FILTERS: Pick<ServerFilterValues, 'startDate' | 'endDate'> = {};

const HistoryPage = () => {

    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [range, setRange] = useState<RangeKey>('6m');

    // Chart data from server-side aggregation
    const [chartData, setChartData] = useState<MonthlySummaryItem[]>([]);

    // Selected months for click-to-filter
    const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());

    // Table data with server-side pagination
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tablePage, setTablePage] = useState(0);
    const [tableRowsPerPage, setTableRowsPerPage] = useState(25);
    const [tableTotalPages, setTableTotalPages] = useState(1);
    const [tableTotal, setTableTotal] = useState(0);
    const [tableFilterParams, setTableFilterParams] = useState<ServerFilterValues>({});

    const fetchChartData = useCallback(async () => {
        try {
            setError(null);
            const res = await transactionsApi.getMonthlySummary(RANGE_MONTHS[range]);
            setChartData(res.data);
        } catch (err) {
            console.error('Failed to fetch monthly summary:', err);
            setError('Erro ao carregar dados do histórico.');
        }
    }, [range]);

    // Formatted data with metadata for PeriodSummaryCard and charts
    const formattedChartDataRaw = useMemo(() =>
        chartData.map(item => {
            const label = new Date(item.year, item.month - 1)
                .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            return {
                month: label,
                year: item.year,
                monthNum: item.month,
                expenses: Number((item.expenses / 100).toFixed(2)),
                creditCardTotal: Number((item.creditCardTotal / 100).toFixed(2)),
                income: Number((item.income / 100).toFixed(2)),
                balance: Number((item.balance / 100).toFixed(2)),
            };
        }),
        [chartData]
    );

    // Build date filters from selected months
    const monthDateFilters = useMemo<Pick<ServerFilterValues, 'startDate' | 'endDate'>>(() => {
        if (selectedMonths.size === 0) return EMPTY_FILTERS;
        const selected = formattedChartDataRaw.filter(d => selectedMonths.has(d.month));
        if (selected.length === 0) return EMPTY_FILTERS;

        // Find the earliest start and latest end across all selected months
        let earliest: Date | null = null;
        let latest: Date | null = null;
        for (const s of selected) {
            const start = new Date(Date.UTC(s.year, s.monthNum - 1, 1));
            const end = new Date(Date.UTC(s.year, s.monthNum, 0)); // last day of month
            if (!earliest || start < earliest) earliest = start;
            if (!latest || end > latest) latest = end;
        }
        if (!earliest || !latest) return {};
        return {
            startDate: earliest.toISOString().slice(0, 10),
            endDate: latest.toISOString().slice(0, 10),
        };
    }, [selectedMonths, formattedChartDataRaw]);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoadingTransactions(true);
            const res: TransactionsResponse = await transactionsApi.getAll({
                page: tablePage + 1,
                limit: tableRowsPerPage,
                ...tableFilterParams,
                ...monthDateFilters,
            });
            setTransactions(res.data);
            setTableTotalPages(res.pagination.pages);
            setTableTotal(res.pagination.total);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError('Erro ao carregar transações.');
        } finally {
            setIsLoadingTransactions(false);
        }
    }, [tablePage, tableRowsPerPage, tableFilterParams, monthDateFilters]);

    useEffect(() => { fetchChartData(); }, [fetchChartData]);
    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    // Clear selected months when range changes
    useEffect(() => { setSelectedMonths(new Set()); }, [range]);

    useEffect(() => {
        const handler = () => { fetchChartData(); fetchTransactions(); };
        window.addEventListener('transaction-change', handler);
        return () => window.removeEventListener('transaction-change', handler);
    }, [fetchChartData, fetchTransactions]);

    const handleBarClick = useCallback((month: string) => {
        setSelectedMonths(prev => {
            const next = new Set(prev);
            if (next.has(month)) {
                next.delete(month);
            } else {
                next.add(month);
            }
            return next;
        });
        setTablePage(0);
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedMonths(new Set());
        setTablePage(0);
    }, []);

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
            {error && (
                <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, px: 2, pt: 2 }}>
                {selectedMonths.size > 0 && (
                    <Chip
                        label={`${selectedMonths.size} ${selectedMonths.size === 1 ? 'mês selecionado' : 'meses selecionados'}`}
                        onDelete={handleClearSelection}
                        color="warning"
                        size="small"
                    />
                )}
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

            {/* Row 1: Despesas x Receitas + Histórico de Saldo */}
            <Grid container>
                <Grid size={6} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Despesas x Receitas</Typography>
                        <HistoryComposedChart data={formattedChartDataRaw} selectedMonths={selectedMonths} onBarClick={handleBarClick} />
                    </Card>
                </Grid>
                <Grid size={6} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Histórico de Saldo</Typography>
                        <HistoryAreaChart data={formattedChartDataRaw} selectedMonths={selectedMonths} onBarClick={handleBarClick} />
                    </Card>
                </Grid>
            </Grid>

            {/* Row 2: CC History + Period Summary */}
            <Grid container>
                <Grid size={7} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Histórico Cartão de Crédito</Typography>
                        <HistoryCCBarChart data={formattedChartDataRaw} selectedMonths={selectedMonths} onBarClick={handleBarClick} />
                    </Card>
                </Grid>
                <Grid size={5} sx={{ p: 2 }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <PeriodSummaryCard data={formattedChartDataRaw} selectedMonths={selectedMonths} />
                    </Card>
                </Grid>
            </Grid>

            {/* Row 3: Transactions Table */}
            <Grid container>
                <Grid size={12} sx={{ p: 2 }}>
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
