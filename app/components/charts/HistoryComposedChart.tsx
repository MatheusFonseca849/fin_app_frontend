'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HistoryComposedChartProps {
    data: { month: string; despesas: number; receitas: number; saldo: number }[];
}

const HistoryComposedChart = ({ data }: HistoryComposedChartProps) => (
    <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
            <Legend />
            <Bar dataKey="despesas" name="Despesas" fill="#fb6c1b" />
            <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#1fcf25" strokeWidth={2} />
        </ComposedChart>
    </ResponsiveContainer>
)

export default HistoryComposedChart
