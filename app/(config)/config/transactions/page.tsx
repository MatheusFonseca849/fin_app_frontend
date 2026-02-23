'use client'

import { useMemo } from 'react'
import { Box, Divider, Typography } from '@mui/material'
import TransactionsTable, { TransactionRow } from '@/app/components/TransactionsTable'
import { mockExpenses, mockIncome } from '@/app/mock/expenses'

const RECURRENT_DESCRIPTIONS = [
    'Aluguel', 'Conta de Luz', 'Conta de Água', 'Internet',
    'Plano de Saúde', 'Academia', 'Netflix', 'Spotify', 'Salário',
]

const TransactionsPage = () => {
    const rows: TransactionRow[] = useMemo(() => {
        const expenses = mockExpenses.map((e) => ({
            id: e.id,
            date: e.date,
            description: e.description,
            amount: e.amount,
            type: 'Despesa' as const,
            category: e.category,
            isRecurrent: RECURRENT_DESCRIPTIONS.includes(e.description),
        }))

        const incomes = mockIncome.map((i) => ({
            id: i.id,
            date: i.date,
            description: i.description,
            amount: i.amount,
            type: 'Receita' as const,
            category: i.source,
            isRecurrent: RECURRENT_DESCRIPTIONS.includes(i.description),
        }))

        return [...expenses, ...incomes]
    }, [])

    return (
        <Box>
            <Typography variant="h4" fontWeight={600}>Transações</Typography>
            <Divider sx={{ mb: 2 }} />
            <TransactionsTable
                rows={rows}
                onEdit={(row) => console.log('Edit:', row)}
                onDelete={(row) => console.log('Delete:', row)}
            />
        </Box>
    )
}

export default TransactionsPage
