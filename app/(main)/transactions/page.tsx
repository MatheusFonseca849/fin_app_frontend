'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, CircularProgress, Divider, Typography } from '@mui/material'
import TransactionsTable from '@/app/components/TransactionsTable'
import { Transaction, TransactionsResponse } from '@/lib/api/transactions'
import { transactionsApi } from '@/lib/api/transactions'

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoadingTransactions(true)
            const res: TransactionsResponse = await transactionsApi.getAll({
                page: page + 1,
                limit: rowsPerPage,
            })
            setTransactions(res.data)
            setTotalPages(res.pagination.pages)
            setTotal(res.pagination.total)
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
        } finally {
            setIsLoadingTransactions(false)
        }
    }, [page, rowsPerPage])

    useEffect(() => { fetchTransactions() }, [fetchTransactions])

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
        setPage(0)
    }, [])

    return (
        <Box>
            <Typography variant="h4" fontWeight={600} sx={{ margin: 2 }}>Transações</Typography>
            <Divider sx={{ mb: 2 }} />
            {
                isLoadingTransactions ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                        <CircularProgress/>
                    </Box>
                ) : (
            <TransactionsTable
                transactions={transactions}
                onTransactionChange={fetchTransactions}
                serverPagination={{
                    page,
                    pages: totalPages,
                    total,
                    rowsPerPage,
                    onPageChange: handlePageChange,
                    onRowsPerPageChange: handleRowsPerPageChange,
                }}
            />
                )
            }
        </Box>
    )
}

export default TransactionsPage
