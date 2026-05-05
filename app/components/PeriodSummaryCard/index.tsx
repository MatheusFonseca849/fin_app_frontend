'use client'

import { Box, Divider, Typography } from '@mui/material'
import { useMemo } from 'react'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface ChartDataItem {
    month: string;
    year: number;
    monthNum: number;
    expenses: number;
    creditCardTotal: number;
    income: number;
    balance: number;
}

interface PeriodSummaryCardProps {
    data: ChartDataItem[];
    selectedMonths?: Set<string>;
}

interface MetricProps {
    label: string;
    value: string;
    color?: string;
    icon?: React.ReactNode;
}

const Metric = ({ label, value, color, icon }: MetricProps) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {icon}
            <Typography variant="body1" sx={{ fontWeight: 600, color: color ?? 'text.primary' }}>{value}</Typography>
        </Box>
    </Box>
);

const PeriodSummaryCard = ({ data, selectedMonths }: PeriodSummaryCardProps) => {
    const filteredData = useMemo(() => {
        if (!selectedMonths || selectedMonths.size === 0) return data;
        return data.filter(d => selectedMonths.has(d.month));
    }, [data, selectedMonths]);

    const metrics = useMemo(() => {
        if (filteredData.length === 0) return null;

        const totalExpenses = filteredData.reduce((s, d) => s + d.expenses, 0);
        const totalIncome = filteredData.reduce((s, d) => s + d.income, 0);
        const totalBalance = totalIncome - totalExpenses;
        const monthCount = filteredData.length;
        const avgExpenses = totalExpenses / monthCount;
        const avgIncome = totalIncome / monthCount;

        // Highest expense month
        const maxExpMonth = filteredData.reduce((max, d) => d.expenses > max.expenses ? d : max, filteredData[0]);
        // Highest income month
        const maxIncMonth = filteredData.reduce((max, d) => d.income > max.income ? d : max, filteredData[0]);

        // Average savings rate
        const avgSavingsRate = totalIncome > 0
            ? ((totalBalance / totalIncome) * 100).toFixed(1) + '%'
            : totalExpenses > 0 ? '-100.0%' : '\u2014';

        // Current month vs average expenses trend
        const now = new Date();
        const currentMonth = filteredData.find(d => d.year === now.getFullYear() && d.monthNum === now.getMonth() + 1);
        let trendIcon: React.ReactNode = null;
        let trendLabel = '\u2014';
        if (currentMonth && monthCount > 1) {
            const diff = currentMonth.expenses - avgExpenses;
            const pct = avgExpenses > 0 ? ((diff / avgExpenses) * 100).toFixed(0) : '0';
            if (diff > 0) {
                trendIcon = <TrendingUpIcon sx={{ fontSize: 16, color: '#ef5350' }} />;
                trendLabel = `+${pct}%`;
            } else if (diff < 0) {
                trendIcon = <TrendingDownIcon sx={{ fontSize: 16, color: '#82E0AA' }} />;
                trendLabel = `${pct}%`;
            } else {
                trendIcon = <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
                trendLabel = '0%';
            }
        }

        return {
            totalExpenses, totalIncome, totalBalance, avgExpenses, avgIncome,
            maxExpMonth, maxIncMonth, avgSavingsRate, trendLabel, trendIcon, monthCount,
        };
    }, [filteredData]);

    if (!metrics) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography color="text.secondary">Nenhum dado no período.</Typography>
            </Box>
        );
    }

    const isSelection = selectedMonths && selectedMonths.size > 0;
    const title = isSelection
        ? `Resumo (${metrics.monthCount} ${metrics.monthCount === 1 ? 'mês' : 'meses'})`
        : 'Resumo do Período';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>{title}</Typography>
            <Metric label="Despesas Totais" value={fmt(metrics.totalExpenses)} color="#ef5350" />
            <Metric label="Receitas Totais" value={fmt(metrics.totalIncome)} color="#82E0AA" />
            <Metric
                label="Balanço"
                value={fmt(metrics.totalBalance)}
                color={metrics.totalBalance >= 0 ? '#82E0AA' : '#ef5350'}
            />
            <Divider sx={{ my: 1 }} />
            <Metric label="Média Mensal Despesas" value={fmt(metrics.avgExpenses)} />
            <Metric label="Média Mensal Receitas" value={fmt(metrics.avgIncome)} />
            <Divider sx={{ my: 1 }} />
            <Metric
                label="Maior Despesa"
                value={`${fmt(metrics.maxExpMonth.expenses)} (${metrics.maxExpMonth.month})`}
                color="#ef5350"
            />
            <Metric
                label="Maior Receita"
                value={`${fmt(metrics.maxIncMonth.income)} (${metrics.maxIncMonth.month})`}
                color="#82E0AA"
            />
            <Divider sx={{ my: 1 }} />
            <Metric
                label="Economia Média"
                value={metrics.avgSavingsRate}
                color={metrics.totalBalance >= 0 ? '#82E0AA' : '#ef5350'}
            />
            <Metric
                label="Mês Atual vs Média"
                value={metrics.trendLabel}
                icon={metrics.trendIcon}
            />
        </Box>
    );
};

export default PeriodSummaryCard
