'use client'

import { Box, Card, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, Tooltip, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useState } from "react"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ComposedChart, Bar, Line, XAxis, YAxis, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Tooltip as RechartsTooltip } from "recharts";
import { monthlyBalance, mockExpenses, mockIncome } from "@/app/mock/expenses"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TransactionsTable from "@/app/components/TransactionsTable";


const HistoryPage = () => {

    const RECURRENT_DESCRIPTIONS = [
        'Aluguel', 'Conta de Luz', 'Conta de Água', 'Internet',
        'Plano de Saúde', 'Academia', 'Netflix', 'Spotify', 'Salário',
    ]

    const rows = [
        ...mockExpenses.map((e) => ({ id: e.id, date: e.date, description: e.description, amount: e.amount, type: 'Despesa' as const, category: e.category, isRecurrent: RECURRENT_DESCRIPTIONS.includes(e.description) })),
        ...mockIncome.map((i) => ({ id: i.id, date: i.date, description: i.description, amount: i.amount, type: 'Receita' as const, category: i.source, isRecurrent: RECURRENT_DESCRIPTIONS.includes(i.description) })),
    ].sort((a, b) => b.date.localeCompare(a.date))

    return (
        <div>
            <Grid container >
                <Grid size={6} sx={{ p: 2 }} spacing={2}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ marginBottom: 2}}>Despesas x Receitas</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={monthlyBalance}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="despesas" name="Despesas" fill="#fb6c1b" />
                        <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#1fcf25" strokeWidth={2} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </Card>
                </Grid>
                <Grid size={6} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Histórico de Saldo</Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={monthlyBalance}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#1fcf25" fill="#f1fded" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>
            <Grid container>
                <Grid size={12} sx={{ p: 2 }} spacing={2}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Transações</Typography>
                       <TransactionsTable rows={rows} onEdit={(row) => console.log('Edit: ', row)} onDelete={(row) => console.log('Delete: ', row)}/>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}

export default HistoryPage