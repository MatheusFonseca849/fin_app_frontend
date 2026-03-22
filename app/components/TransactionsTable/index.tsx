'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    Card,
    Checkbox,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import { transactionsApi } from '@/lib/api'
import type { Transaction, BulkUpdateData } from '@/lib/api'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useCategories } from '@/lib/contexts/CategoriesContext'
import TransactionCrudDialogs from '@/app/components/TransactionCrudDialogs'
import { useTransactionCrud } from '@/lib/hooks/useTransactionCrud'
import TransactionFilters from './TransactionFilters'
import BulkActionDialogs from './BulkActionDialogs'
import TablePagination from './TablePagination'

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
    const { patchUser } = useAuth()
    const { categories: allCategories } = useCategories()

    const crud = useTransactionCrud({ onChanged: onTransactionChange })

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

    const notifyBulkChange = useCallback((balance: number) => {
        patchUser({ balance })
        window.dispatchEvent(new Event('transaction-change'))
        onTransactionChange?.()
    }, [patchUser, onTransactionChange])

    // --- Edit / Delete / Payment handlers (delegated to shared hook) ---
    const handleOpenEdit = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (tx) crud.edit.open(tx)
    }, [transactions, crud.edit])

    const handleOpenDelete = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (tx) crud.del.open(tx)
    }, [transactions, crud.del])

    const handleOpenPayment = useCallback((row: DisplayRow) => {
        const tx = transactions.find(t => t._id === row.id)
        if (tx) crud.payment.open(tx)
    }, [transactions, crud.payment])

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
            notifyBulkChange(balance)
            setIsBulkDeleteDialogOpen(false)
        } catch (error) {
            console.error('Failed to bulk delete:', error)
        } finally {
            setIsBulkDeleting(false)
        }
    }, [selectedIds, notifyBulkChange])

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
            notifyBulkChange(balance)
            setIsBulkUpdateConfirmOpen(false)
        } catch (error) {
            console.error('Failed to bulk update:', error)
        } finally {
            setIsBulkUpdating(false)
        }
    }, [selectedIds, bulkUpdateFields, bulkUpdateForm, notifyBulkChange])

    const handleCancelBulkUpdateConfirm = useCallback(() => {
        setIsBulkUpdateConfirmOpen(false)
        setIsBulkUpdateModalOpen(true)
    }, [])

    const hasEnabledBulkFields = Object.values(bulkUpdateFields).some(v => v)

    const handleFilterStartDate = useCallback((v: string) => { setStartDate(v); handleFilterChange() }, [handleFilterChange])
    const handleFilterEndDate = useCallback((v: string) => { setEndDate(v); handleFilterChange() }, [handleFilterChange])
    const handleFilterType = useCallback((v: '' | 'Despesa' | 'Receita') => { setTypeFilter(v); handleFilterChange() }, [handleFilterChange])
    const handleFilterCategory = useCallback((v: string) => { setCategoryFilter(v); handleFilterChange() }, [handleFilterChange])
    const handleFilterRecurrent = useCallback((v: boolean) => { setRecurrentOnly(v); handleFilterChange() }, [handleFilterChange])
    const handleFilterPaid = useCallback((v: '' | 'true' | 'false') => { setPaidFilter(v); handleFilterChange() }, [handleFilterChange])

    const handleBulkUpdateFieldToggle = useCallback((field: string, checked: boolean) => {
        setBulkUpdateFields(prev => ({ ...prev, [field]: checked }))
    }, [])

    const handleBulkUpdateFormChange = useCallback((field: string, value: string | boolean) => {
        if (field === 'type') {
            setBulkUpdateForm(prev => ({ ...prev, type: value as '' | 'credito' | 'debito', category: '' }))
        } else {
            setBulkUpdateForm(prev => ({ ...prev, [field]: value }))
        }
    }, [])

    return (
        <>
        <Card sx={{ p: 2 }}>
            {/* Filter bar */}
            <TransactionFilters
                startDate={startDate}
                endDate={endDate}
                typeFilter={typeFilter}
                categoryFilter={categoryFilter}
                recurrentOnly={recurrentOnly}
                paidFilter={paidFilter}
                categories={categories}
                onStartDateChange={handleFilterStartDate}
                onEndDateChange={handleFilterEndDate}
                onTypeFilterChange={handleFilterType}
                onCategoryFilterChange={handleFilterCategory}
                onRecurrentOnlyChange={handleFilterRecurrent}
                onPaidFilterChange={handleFilterPaid}
                selectedCount={selectedIds.size}
                bulkMenuAnchor={bulkMenuAnchor}
                onBulkMenuOpen={(e) => setBulkMenuAnchor(e.currentTarget)}
                onBulkMenuClose={() => setBulkMenuAnchor(null)}
                onBulkDelete={handleOpenBulkDelete}
                onBulkUpdate={handleOpenBulkUpdate}
            />

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
            <TablePagination
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
            />
        </Card>

        {/* Edit / Delete / Payment Dialogs (shared) */}
        <TransactionCrudDialogs crud={crud} />

        {/* Bulk Action Dialogs */}
        <BulkActionDialogs
            selectedCount={selectedIds.size}
            isBulkDeleteDialogOpen={isBulkDeleteDialogOpen}
            isBulkDeleting={isBulkDeleting}
            onCloseBulkDelete={() => setIsBulkDeleteDialogOpen(false)}
            onConfirmBulkDelete={handleConfirmBulkDelete}
            isBulkUpdateModalOpen={isBulkUpdateModalOpen}
            bulkUpdateFields={bulkUpdateFields}
            bulkUpdateForm={bulkUpdateForm}
            bulkUpdateCategories={bulkUpdateCategories}
            hasEnabledBulkFields={hasEnabledBulkFields}
            onCloseBulkUpdate={() => setIsBulkUpdateModalOpen(false)}
            onBulkUpdateFieldToggle={handleBulkUpdateFieldToggle}
            onBulkUpdateFormChange={handleBulkUpdateFormChange}
            onBulkUpdateProceed={handleBulkUpdateProceed}
            isBulkUpdateConfirmOpen={isBulkUpdateConfirmOpen}
            isBulkUpdating={isBulkUpdating}
            onCancelBulkUpdateConfirm={handleCancelBulkUpdateConfirm}
            onConfirmBulkUpdate={handleConfirmBulkUpdate}
        />
        </>
    )
}

export default TransactionsTable