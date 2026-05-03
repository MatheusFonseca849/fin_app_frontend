'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HistoryComposedChartProps {
    data: { month: string; expenses: number; income: number; balance: number }[];
}

const HistoryComposedChart = ({ data }: HistoryComposedChartProps) => (
    <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
            <Legend />
            <Bar dataKey="expenses" name="Despesas" fill="#fb6c1b" />
            <Line type="monotone" dataKey="income" name="Receitas" stroke="#1fcf25" strokeWidth={2} />
        </ComposedChart>
    </ResponsiveContainer>
)

export default HistoryComposedChart
