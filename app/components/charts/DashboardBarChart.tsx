'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardBarChartProps {
    data: { name: string; value: number; fill: string }[];
}

const DashboardBarChart = ({ data }: DashboardBarChartProps) => (
    <ResponsiveContainer width="100%" height={450}>
        <BarChart width={400} height={400} data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Bar dataKey="value" name="value" />
            <Tooltip
                formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''}
            />
        </BarChart>
    </ResponsiveContainer>
)

export default DashboardBarChart
