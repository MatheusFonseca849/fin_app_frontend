'use client'

import { useState, useMemo } from 'react'
import {
    Box,
    Card,
    Checkbox,
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

export interface TransactionRow {
    id: number
    date: string
    description: string
    amount: number
    type: 'Despesa' | 'Receita'
    category: string
    isRecurrent: boolean
}

interface TransactionsTableProps {
    rows: TransactionRow[]
    onEdit?: (row: TransactionRow) => void
    onDelete?: (row: TransactionRow) => void
}

const TransactionsTable = ({ rows, onEdit, onDelete }: TransactionsTableProps) => {
    // Pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [typeFilter, setTypeFilter] = useState<'' | 'Despesa' | 'Receita'>('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [recurrentOnly, setRecurrentOnly] = useState(false)

    const categories = useMemo(
        () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort(),
        [rows]
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

        return result.sort((a, b) => b.date.localeCompare(a.date))
    }, [rows, startDate, endDate, typeFilter, categoryFilter, recurrentOnly])

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage))
    const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    const handleFilterChange = () => {
        setPage(0)
    }

    return (
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
                            <TableCell><Typography variant="subtitle2">Ações</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhuma transação encontrada
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRows.map((row) => (
                                <TableRow key={`${row.type}-${row.id}`} hover>
                                    <TableCell>{new Date(row.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell sx={{ color: row.type === 'Despesa' ? 'error.main' : 'success.main', fontWeight: 500 }}>
                                        {row.type === 'Despesa' ? '- ' : '+ '}
                                        R$ {row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.category || '—'}</TableCell>
                                    <TableCell>{row.isRecurrent ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => onEdit?.(row)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton size="small" onClick={() => onDelete?.(row)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="body2">
                    {page + 1} de {totalPages}
                </Typography>
                <IconButton
                    onClick={() => setPage((p) => p + 1)}
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
    )
}

export default TransactionsTable
