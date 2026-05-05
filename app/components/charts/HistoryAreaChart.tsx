'use client'

import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useMemo } from 'react'

interface HistoryAreaChartProps {
    data: { month: string; year: number; monthNum: number; expenses: number; creditCardTotal: number; income: number; balance: number }[];
    selectedMonths?: Set<string>;
    onBarClick?: (month: string) => void;
}

const HistoryAreaChart = ({ data, selectedMonths, onBarClick }: HistoryAreaChartProps) => {
    // Add a constant column so the invisible click-target bar spans the full Y range
    const maxBalance = useMemo(() => {
        const max = Math.max(...data.map(d => Math.abs(d.balance)), 1);
        return max * 1.1;
    }, [data]);

    const enriched = useMemo(() =>
        data.map(d => ({ ...d, _clickTarget: maxBalance })),
        [data, maxBalance]
    );

    return (
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={enriched}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (!active || !payload) return null;
                        const balanceItem = payload.find(p => p.dataKey === 'balance');
                        if (!balanceItem) return null;
                        return (
                            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '8px 12px', borderRadius: 4, color: '#fff' }}>
                                <div style={{ marginBottom: 4 }}>{label}</div>
                                <div style={{ color: '#1fcf25' }}>
                                    Saldo: {(balanceItem.value as number)?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        );
                    }}
                />
                <Area type="monotone" dataKey="balance" name="Saldo" stroke="#1fcf25" fill="#f1fded" strokeWidth={2} />
                <Bar
                    dataKey="_clickTarget"
                    fill="transparent"
                    cursor="pointer"
                    onClick={(_, index) => onBarClick?.(data[index].month)}
                >
                    {enriched.map((entry) => (
                        <Cell
                            key={entry.month}
                            fill={selectedMonths?.has(entry.month) ? 'rgba(255,171,64,0.2)' : 'transparent'}
                            stroke={selectedMonths?.has(entry.month) ? '#ffab40' : 'transparent'}
                            strokeWidth={selectedMonths?.has(entry.month) ? 1 : 0}
                        />
                    ))}
                </Bar>
            </ComposedChart>
        </ResponsiveContainer>
    );
}

export default HistoryAreaChart
