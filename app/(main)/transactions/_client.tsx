'use client'

import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Divider, Typography } from '@mui/material'
import TransactionsTable from '@/app/components/TransactionsTable'
import type { ServerFilterValues } from '@/app/components/TransactionsTable'
import { Transaction, TransactionsResponse } from '@/lib/api/transactions'
import { transactionsApi } from '@/lib/api/transactions'

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
    const [filterParams, setFilterParams] = useState<ServerFilterValues>({})
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoadingTransactions(true)
            setError(null)
            const res: TransactionsResponse = await transactionsApi.getAll({
                page: page + 1,
                limit: rowsPerPage,
                ...filterParams,
            })
            setTransactions(res.data)
            setTotalPages(res.pagination.pages)
            setTotal(res.pagination.total)
        } catch (err) {
            console.error('Failed to fetch transactions:', err)
            setError('Erro ao carregar transações. Tente novamente.')
        } finally {
            setIsLoadingTransactions(false)
        }
    }, [page, rowsPerPage, filterParams])

    useEffect(() => { fetchTransactions() }, [fetchTransactions])

    useEffect(() => {
        const handler = () => fetchTransactions();
        window.addEventListener('transaction-change', handler);
        return () => window.removeEventListener('transaction-change', handler);
    }, [fetchTransactions]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setPage(0)
    }, [])

    const handleFiltersChange = useCallback((filters: ServerFilterValues) => {
        setFilterParams(filters)
        setPage(0)
    }, [])

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} sx={{ margin: 2 }}>Transações</Typography>
            {error && (
                <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <Divider sx={{ mb: 2 }} />
            <TransactionsTable
                transactions={transactions}
                onTransactionChange={fetchTransactions}
                isLoading={isLoadingTransactions}
                onFiltersChange={handleFiltersChange}
                serverPagination={{
                    page,
                    pages: totalPages,
                    total,
                    rowsPerPage,
                    onPageChange: handlePageChange,
                    onRowsPerPageChange: handleRowsPerPageChange,
                }}
            />
        </Box>
    )
}

export default TransactionsPage
