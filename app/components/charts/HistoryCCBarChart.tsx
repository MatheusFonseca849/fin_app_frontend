'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ChartDataItem {
    month: string;
    creditCardTotal: number;
}

interface HistoryCCBarChartProps {
    data: ChartDataItem[];
    selectedMonths?: Set<string>;
    onBarClick?: (month: string) => void;
}

const HistoryCCBarChart = ({ data, selectedMonths, onBarClick }: HistoryCCBarChartProps) => (
    <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number | undefined) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''} />
            <Bar
                dataKey="creditCardTotal"
                name="Cartão de Crédito"
                fill="#fb6c1b"
                cursor="pointer"
                onClick={(_, index) => onBarClick?.(data[index].month)}
            >
                {data.map((entry) => (
                    <Cell
                        key={entry.month}
                        fill={selectedMonths?.has(entry.month) ? '#ffab40' : '#fb6c1b'}
                        stroke={selectedMonths?.has(entry.month) ? '#fff' : 'none'}
                        strokeWidth={selectedMonths?.has(entry.month) ? 2 : 0}
                    />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
)

export default HistoryCCBarChart
