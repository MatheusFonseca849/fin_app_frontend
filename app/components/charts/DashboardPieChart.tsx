'use client'

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardPieChartProps {
    data: { name: string; value: number; fill: string }[];
}

const DashboardPieChart = ({ data }: DashboardPieChartProps) => (
    <ResponsiveContainer width="100%" height={450}>
        <PieChart width={400} height={400}>
            <Pie data={data} dataKey="value" nameKey="name" />
            <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
            <Legend />
        </PieChart>
    </ResponsiveContainer>
)

export default DashboardPieChart
