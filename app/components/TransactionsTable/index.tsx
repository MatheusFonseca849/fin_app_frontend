'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import { transactionsApi } from '@/lib/api'
import type { Transaction } from '@/lib/api'
import { useAuth } from '@/lib/contexts/AuthContext'
import ModalComponent from '@/app/components/ModalComponent'
import AddTransaction, { initialTransactionFormData, TransactionFormData } from '@/app/components/AddTransactionModal'

interface DisplayRow {
    id: string
    date: string
    description: string
    amount: number
    type: 'Despesa' | 'Receita'
    category: string
    isRecurrent: boolean
    isPaid: boolean
}

interface ServerPaginationProps {
    page: number
    pages: number
    total: number
    rowsPerPage: number
    onPageChange: (page: number) => void
    onRowsPerPageChange: (rowsPerPage: number) => void
}

interface TransactionsTableProps {
    transactions: Transaction[]
    onTransactionChange?: () => void
    serverPagination?: ServerPaginationProps
}

const TransactionsTable = ({ transactions, onTransactionChange, serverPagination }: TransactionsTableProps) => {
    const { user, patchUser, categories: allCategories } = useAuth()

    // Pagination (used only in client-side mode)
    const [localPage, setLocalPage] = useState(0)
    const [localRowsPerPage, setLocalRowsPerPage] = useState(10)

    const page = serverPagination ? serverPagination.page : localPage
    const rowsPerPage = serverPagination ? serverPagination.rowsPerPage : localRowsPerPage
    const setPage = serverPagination ? serverPagination.onPageChange : setLocalPage
    const setRowsPerPage = serverPagination ? serverPagination.onRowsPerPageChange : setLocalRowsPerPage

    // Filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [typeFilter, setTypeFilter] = useState<'' | 'Despesa' | 'Receita'>('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [recurrentOnly, setRecurrentOnly] = useState(false)
    const [paidFilter, setPaidFilter] = useState<'' | 'true' | 'false'>('')

    // Edit state
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [editForm, setEditForm] = useState<TransactionFormData>(initialTransactionFormData)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // Delete state
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Payment state
    const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null)
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
    const [isPaying, setIsPaying] = useState(false)

    const rows: DisplayRow[] = useMemo(() =>
        transactions.map(tx => ({
            id: tx._id,
            date: tx.timestamp.split('T')[0],
            description: tx.description,
            amount: tx.value / 100,
            type: (tx.type === 'debito' ? 'Despesa' : 'Receita') as 'Despesa' | 'Receita',
            category: tx.category?.name || '—',
            isRecurrent: tx.isRecurrent,
            isPaid: tx.isPaid,
        })),
        [transactions]
    )

    const categories = useMemo(
        () => allCategories.map(c => c.name).sort(),
        [allCategories]
    )

    const filteredRows = useMemo(() => {
        let result = rows

        if (startDate) {
            result = result.filter((r) => r.date >= startDate)
        }
        if (endDate) {
            result = result.filter((r) => r.date <= endDate)
        }
        if (typeFilter) {
            result = result.filter((r) => r.type === typeFilter)
        }
        if (categoryFilter) {
            result = result.filter((r) => r.category === categoryFilter)
        }
        if (recurrentOnly) {
            result = result.filter((r) => r.isRecurrent)
        }
        if (paidFilter !== '') {
            const isPaid = paidFilter === 'true'
            result = result.filter((r) => r.isPaid === isPaid)
        }

        return result.sort((a, b) => b.date.localeCompare(a.date))
    }, [rows, startDate, endDate, typeFilter, categoryFilter, recurrentOnly, paidFilter])

    const totalPages = serverPagination
        ? serverPagination.pages
        : Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
    const paginatedRows = serverPagination
        ? filteredRows
        : filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    const handleFilterChange = () => {
        setPage(0)
    }

    const notifyChange = useCallback((balance: number) => {
        patchUser({ balance })
        window.dispatchEvent(new Event('transaction-change'))
        onTransactionChange?.()
    }, [patchUser, onTransactionChange])

    // --- Edit handlers ---
    const handleOpenEdit = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (!tx) return
        setEditingTransaction(tx)
        setEditForm({
            description: tx.description,
            value: (tx.value / 100).toFixed(2),
            type: tx.type,
            category: tx.category?._id || '',
            date: tx.timestamp.split('T')[0],
            isPaid: tx.isPaid,
            isRecurrent: tx.isRecurrent,
            billingDay: tx.billingDay ? String(tx.billingDay) : '',
        })
        setIsEditModalOpen(true)
    }, [transactions])

    const handleCloseEdit = useCallback(() => {
        setIsEditModalOpen(false)
        setEditingTransaction(null)
    }, [])

    const handleSaveEdit = useCallback(async () => {
        if (!editingTransaction) return
        setIsSavingEdit(true)
        try {
            const { balance } = await transactionsApi.update(editingTransaction._id, {
                description: editForm.description,
                value: parseFloat(editForm.value),
                type: editForm.type,
                category: editForm.category,
                date: editForm.date || undefined,
                isPaid: editForm.isPaid,
                isRecurrent: editForm.isRecurrent || undefined,
                billingDay: editForm.billingDay ? Number(editForm.billingDay) : undefined,
            })
            notifyChange(balance)
            handleCloseEdit()
        } catch (error) {
            console.error('Failed to update transaction:', error)
        } finally {
            setIsSavingEdit(false)
        }
    }, [editingTransaction, editForm, notifyChange, handleCloseEdit])

    // --- Delete handlers ---
    const handleOpenDelete = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (!tx) return
        setDeletingTransaction(tx)
        setIsDeleteDialogOpen(true)
    }, [transactions])

    const handleCloseDelete = useCallback(() => {
        setIsDeleteDialogOpen(false)
        setDeletingTransaction(null)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingTransaction) return
        setIsDeleting(true)
        try {
            const { balance } = await transactionsApi.delete(deletingTransaction._id)
            notifyChange(balance)
            handleCloseDelete()
        } catch (error) {
            console.error('Failed to delete transaction:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [deletingTransaction, notifyChange, handleCloseDelete])

    // --- Payment handlers ---
    const handleOpenPayment = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (!tx) return
        setPayingTransaction(tx)
        setIsPayDialogOpen(true)
    }, [transactions])

    const handleClosePayment = useCallback(() => {
        setIsPayDialogOpen(false)
        setPayingTransaction(null)
    }, [])

    const handleConfirmPayment = useCallback(async () => {
        if (!payingTransaction) return
        setIsPaying(true)
        try {
            const { balance } = await transactionsApi.update(payingTransaction._id, { isPaid: true })
            notifyChange(balance)
            handleClosePayment()
        } catch (error) {
            console.error('Failed to mark transaction as paid:', error)
        } finally {
            setIsPaying(false)
        }
    }, [payingTransaction, notifyChange, handleClosePayment])

    const editCategories = useMemo(() => {
        return allCategories
            .filter(c => c.type === editForm.type)
            .map(c => ({ _id: c._id, name: c.name }))
    }, [allCategories, editForm.type])

    return (
        <>
        <Card sx={{ p: 2 }}>
            {/* Filter bar */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                    label="Data Inicial"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); handleFilterChange() }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: 150 }}
                />
                <TextField
                    label="Data Final"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); handleFilterChange() }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                        value={typeFilter}
                        label="Tipo"
                        onChange={(e) => { setTypeFilter(e.target.value as '' | 'Despesa' | 'Receita'); handleFilterChange() }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="Despesa">Despesas</MenuItem>
                        <MenuItem value="Receita">Receitas</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                        value={categoryFilter}
                        label="Categoria"
                        onChange={(e) => { setCategoryFilter(e.target.value); handleFilterChange() }}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={recurrentOnly}
                            onChange={(e) => { setRecurrentOnly(e.target.checked); handleFilterChange() }}
                        />
                    }
                    label="Recorrentes"
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Pago</InputLabel>
                    <Select
                        value={paidFilter}
                        label="Pago"
                        onChange={(e) => { setPaidFilter(e.target.value as '' | 'true' | 'false'); handleFilterChange() }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Sim</MenuItem>
                        <MenuItem value="false">Não</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer>
                <Table stickyHeader>
                    <TableHead sx={{ '& .MuiTableCell-head': { backgroundColor: 'primary.main', color: 'white' } }}>
                        <TableRow>
                            <TableCell><Typography variant="subtitle2">Data</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Descrição</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Valor</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Tipo</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Categoria</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Recorrente</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Pago</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Ações</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhuma transação encontrada
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>{new Date(row.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell sx={{ color: row.type === 'Despesa' ? 'error.main' : 'success.main', fontWeight: 500 }}>
                                        {row.type === 'Despesa' ? '- ' : '+ '}
                                        R$ {row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.category || '—'}</TableCell>
                                    <TableCell>{row.isRecurrent ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>{row.type === 'Receita' ? '' : row.isPaid ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" onClick={() => handleOpenDelete(row)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {row.type === 'Despesa' && !row.isPaid && (
                                            <Tooltip title="Marcar como pago">
                                                <IconButton size="small" color="success" onClick={() => handleOpenPayment(row)}>
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
                <IconButton
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="body2">
                    {page + 1} de {totalPages}
                </Typography>
                <IconButton
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                    <ArrowForwardIcon />
                </IconButton>
                <Select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0) }}
                    size="small"
                    sx={{ ml: 2 }}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
            </Box>
        </Card>

        {/* Edit Modal */}
        <ModalComponent
            open={isEditModalOpen}
            handleClose={handleCloseEdit}
            title="Editar Transação"
            layout={
                <AddTransaction
                    formData={editForm}
                    setFormData={setEditForm}
                    categories={editCategories}
                />
            }
            action={handleSaveEdit}
            confirmLabel={isSavingEdit ? 'Salvando...' : 'Salvar'}
        />

        {/* Payment Confirmation */}
        <Dialog open={isPayDialogOpen} onClose={handleClosePayment}>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Deseja confirmar o pagamento de <strong>&ldquo;{payingTransaction?.description}&rdquo;</strong> no valor de{' '}
                    <strong>{((payingTransaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClosePayment} disabled={isPaying}>Cancelar</Button>
                <Button onClick={handleConfirmPayment} color="success" variant="contained" disabled={isPaying}>
                    {isPaying ? <CircularProgress size={20} /> : 'Confirmar'}
                </Button>
            </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteDialogOpen} onClose={handleCloseDelete}>
            <DialogTitle>Excluir Transação</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja excluir a transação <strong>&ldquo;{deletingTransaction?.description}&rdquo;</strong> no valor de{' '}
                    <strong>{((deletingTransaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDelete} disabled={isDeleting}>Cancelar</Button>
                <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
                    {isDeleting ? <CircularProgress size={20} /> : 'Excluir'}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default TransactionsTable
