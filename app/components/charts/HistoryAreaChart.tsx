'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface HistoryAreaChartProps {
    data: { month: string; despesas: number; receitas: number; saldo: number }[];
}

const HistoryAreaChart = ({ data }: HistoryAreaChartProps) => (
    <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
            <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#1fcf25" fill="#f1fded" strokeWidth={2} />
        </AreaChart>
    </ResponsiveContainer>
)

export default HistoryAreaChart
