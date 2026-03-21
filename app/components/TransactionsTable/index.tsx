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
    Menu,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Link,
    Tooltip,
    Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import { transactionsApi } from '@/lib/api'
import type { Transaction, BulkUpdateData } from '@/lib/api'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useCategories } from '@/lib/contexts/CategoriesContext'
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
    const { user, patchUser } = useAuth()
    const { categories: allCategories } = useCategories()

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

    // Description expand state
    const [expandedDescs, setExpandedDescs] = useState<Set<string>>(new Set())

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Bulk actions menu
    const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null)

    // Bulk delete confirmation
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)

    // Bulk update modal
    const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false)
    const [bulkUpdateFields, setBulkUpdateFields] = useState<Record<string, boolean>>({})
    const [bulkUpdateForm, setBulkUpdateForm] = useState({
        description: '',
        value: '',
        type: '' as '' | 'credito' | 'debito',
        category: '',
        date: '',
        isPaid: false,
    })
    const [isBulkUpdating, setIsBulkUpdating] = useState(false)
    const [isBulkUpdateConfirmOpen, setIsBulkUpdateConfirmOpen] = useState(false)

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

    // Bulk update category options (depends on selected type in bulk form)
    const bulkUpdateCategories = useMemo(() => {
        if (!bulkUpdateForm.type) return allCategories.map(c => ({ _id: c._id, name: c.name }))
        return allCategories
            .filter(c => c.type === bulkUpdateForm.type)
            .map(c => ({ _id: c._id, name: c.name }))
    }, [allCategories, bulkUpdateForm.type])

    // --- Selection handlers ---
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const toggleSelectAll = useCallback(() => {
        const pageIds = paginatedRows.map(r => r.id)
        setSelectedIds(prev => {
            const allSelected = pageIds.every(id => prev.has(id))
            const next = new Set(prev)
            if (allSelected) {
                pageIds.forEach(id => next.delete(id))
            } else {
                pageIds.forEach(id => next.add(id))
            }
            return next
        })
    }, [paginatedRows])

    const hasSelection = selectedIds.size > 0
    const allOnPageSelected = paginatedRows.length > 0 && paginatedRows.every(r => selectedIds.has(r.id))

    // --- Bulk delete ---
    const handleOpenBulkDelete = useCallback(() => {
        setBulkMenuAnchor(null)
        setIsBulkDeleteDialogOpen(true)
    }, [])

    const handleConfirmBulkDelete = useCallback(async () => {
        setIsBulkDeleting(true)
        try {
            const { balance } = await transactionsApi.bulkDelete(Array.from(selectedIds))
            setSelectedIds(new Set())
            notifyChange(balance)
            setIsBulkDeleteDialogOpen(false)
        } catch (error) {
            console.error('Failed to bulk delete:', error)
        } finally {
            setIsBulkDeleting(false)
        }
    }, [selectedIds, notifyChange])

    // --- Bulk update ---
    const handleOpenBulkUpdate = useCallback(() => {
        setBulkMenuAnchor(null)
        setBulkUpdateFields({})
        setBulkUpdateForm({ description: '', value: '', type: '', category: '', date: '', isPaid: false })
        setIsBulkUpdateModalOpen(true)
    }, [])

    const handleBulkUpdateProceed = useCallback(() => {
        setIsBulkUpdateModalOpen(false)
        setIsBulkUpdateConfirmOpen(true)
    }, [])

    const handleConfirmBulkUpdate = useCallback(async () => {
        setIsBulkUpdating(true)
        try {
            const updates: BulkUpdateData = {}
            if (bulkUpdateFields.description) updates.description = bulkUpdateForm.description
            if (bulkUpdateFields.value) updates.value = parseFloat(bulkUpdateForm.value)
            if (bulkUpdateFields.type) updates.type = bulkUpdateForm.type as 'credito' | 'debito'
            if (bulkUpdateFields.category) updates.category = bulkUpdateForm.category
            if (bulkUpdateFields.date) updates.date = bulkUpdateForm.date
            if (bulkUpdateFields.isPaid) updates.isPaid = bulkUpdateForm.isPaid

            const { balance } = await transactionsApi.bulkUpdate(Array.from(selectedIds), updates)
            setSelectedIds(new Set())
            notifyChange(balance)
            setIsBulkUpdateConfirmOpen(false)
        } catch (error) {
            console.error('Failed to bulk update:', error)
        } finally {
            setIsBulkUpdating(false)
        }
    }, [selectedIds, bulkUpdateFields, bulkUpdateForm, notifyChange])

    const handleCancelBulkUpdateConfirm = useCallback(() => {
        setIsBulkUpdateConfirmOpen(false)
        setIsBulkUpdateModalOpen(true)
    }, [])

    const hasEnabledBulkFields = Object.values(bulkUpdateFields).some(v => v)

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

                {hasSelection && (
                    <>
                        <Box sx={{ flex: 1 }} />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                        >
                            Ações ({selectedIds.size})
                        </Button>
                        <Menu
                            anchorEl={bulkMenuAnchor}
                            open={Boolean(bulkMenuAnchor)}
                            onClose={() => setBulkMenuAnchor(null)}
                        >
                            <MenuItem onClick={handleOpenBulkDelete}>Deletar todos</MenuItem>
                            <MenuItem onClick={handleOpenBulkUpdate}>Atualização em massa</MenuItem>
                        </Menu>
                    </>
                )}
            </Box>

            {/* Table */}
            <TableContainer>
                <Table stickyHeader>
                    <TableHead sx={{ '& .MuiTableCell-head': { backgroundColor: 'primary.main', color: 'white' } }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={allOnPageSelected}
                                    indeterminate={hasSelection && !allOnPageSelected}
                                    onChange={toggleSelectAll}
                                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
                                />
                            </TableCell>
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
                                <TableCell colSpan={9} align="center">
                                    <Typography variant="body2" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhuma transação encontrada
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((row) => (
                                <TableRow key={row.id} hover selected={selectedIds.has(row.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedIds.has(row.id)}
                                            onChange={() => toggleSelect(row.id)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(row.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell sx={{ maxWidth: 350 }}>
                                        {row.description.length <= 100 ? (
                                            row.description
                                        ) : expandedDescs.has(row.id) ? (
                                            <>
                                                {row.description}{' '}
                                                <Link
                                                    component="button"
                                                    variant="body2"
                                                    onClick={() => setExpandedDescs(prev => { const next = new Set(prev); next.delete(row.id); return next })}
                                                    sx={{ verticalAlign: 'baseline', whiteSpace: 'nowrap' }}
                                                >
                                                    ver menos
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                {row.description.slice(0, 100)}&hellip;{' '}
                                                <Link
                                                    component="button"
                                                    variant="body2"
                                                    onClick={() => setExpandedDescs(prev => new Set(prev).add(row.id))}
                                                    sx={{ verticalAlign: 'baseline', whiteSpace: 'nowrap' }}
                                                >
                                                    ver mais
                                                </Link>
                                            </>
                                        )}
                                    </TableCell>
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

        {/* Bulk Delete Confirmation */}
        <Dialog open={isBulkDeleteDialogOpen} onClose={() => !isBulkDeleting && setIsBulkDeleteDialogOpen(false)}>
            <DialogTitle>Excluir Transações</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Essa operação não poderá ser desfeita. Tem certeza que deseja prosseguir?
                </DialogContentText>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedIds.size} transação(ões) serão excluídas.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsBulkDeleteDialogOpen(false)} disabled={isBulkDeleting}>Cancelar</Button>
                <Button onClick={handleConfirmBulkDelete} color="error" variant="contained" disabled={isBulkDeleting}>
                    {isBulkDeleting ? <CircularProgress size={20} /> : 'Excluir'}
                </Button>
            </DialogActions>
        </Dialog>

        {/* Bulk Update Modal */}
        <Dialog
            open={isBulkUpdateModalOpen}
            onClose={() => setIsBulkUpdateModalOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Atualização em Massa</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Selecione os campos que deseja atualizar para as {selectedIds.size} transações selecionadas:
                </DialogContentText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Description */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.description}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, description: e.target.checked }))}
                        />
                        <TextField
                            label="Descrição"
                            size="small"
                            fullWidth
                            disabled={!bulkUpdateFields.description}
                            value={bulkUpdateForm.description}
                            onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </Box>

                    {/* Value */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.value}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, value: e.target.checked }))}
                        />
                        <TextField
                            label="Valor"
                            size="small"
                            type="number"
                            fullWidth
                            disabled={!bulkUpdateFields.value}
                            value={bulkUpdateForm.value}
                            onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, value: e.target.value }))}
                            inputProps={{ step: '0.01', min: '0.01' }}
                        />
                    </Box>

                    {/* Type */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.type}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, type: e.target.checked }))}
                        />
                        <FormControl size="small" fullWidth disabled={!bulkUpdateFields.type}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={bulkUpdateForm.type}
                                label="Tipo"
                                onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, type: e.target.value as '' | 'credito' | 'debito', category: '' }))}
                            >
                                <MenuItem value="debito">Despesa</MenuItem>
                                <MenuItem value="credito">Receita</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Category */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.category}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, category: e.target.checked }))}
                        />
                        <FormControl size="small" fullWidth disabled={!bulkUpdateFields.category}>
                            <InputLabel>Categoria</InputLabel>
                            <Select
                                value={bulkUpdateForm.category}
                                label="Categoria"
                                onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                                {bulkUpdateCategories.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.date}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, date: e.target.checked }))}
                        />
                        <TextField
                            label="Data"
                            type="date"
                            size="small"
                            fullWidth
                            disabled={!bulkUpdateFields.date}
                            value={bulkUpdateForm.date}
                            onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, date: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>

                    {/* isPaid */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                            checked={!!bulkUpdateFields.isPaid}
                            onChange={(e) => setBulkUpdateFields(prev => ({ ...prev, isPaid: e.target.checked }))}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={bulkUpdateForm.isPaid}
                                    onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, isPaid: e.target.checked }))}
                                    disabled={!bulkUpdateFields.isPaid}
                                />
                            }
                            label="Marcar como pago"
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsBulkUpdateModalOpen(false)}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleBulkUpdateProceed}
                    disabled={!hasEnabledBulkFields}
                >
                    Prosseguir
                </Button>
            </DialogActions>
        </Dialog>

        {/* Bulk Update Confirmation */}
        <Dialog open={isBulkUpdateConfirmOpen} onClose={() => !isBulkUpdating && handleCancelBulkUpdateConfirm()}>
            <DialogTitle>Confirmar Atualização</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Essa operação não poderá ser desfeita. Tem certeza que deseja prosseguir?
                </DialogContentText>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedIds.size} transação(ões) serão atualizadas.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancelBulkUpdateConfirm} disabled={isBulkUpdating}>Cancelar</Button>
                <Button onClick={handleConfirmBulkUpdate} color="primary" variant="contained" disabled={isBulkUpdating}>
                    {isBulkUpdating ? <CircularProgress size={20} /> : 'Confirmar'}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default TransactionsTable