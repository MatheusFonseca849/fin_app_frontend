'use client'

import { memo, useCallback } from 'react'
import {
    Checkbox,
    IconButton,
    Link,
    TableCell,
    TableRow,
    Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'

interface DisplayRow {
    id: string
    date: string
    formattedDate: string
    description: string
    amount: number
    type: 'Despesa' | 'Receita'
    category: string
    paymentMode: string
    isRecurrent: boolean
    isPaid: boolean
}

interface TableRowItemProps {
    row: DisplayRow
    isSelected: boolean
    isExpanded: boolean
    onToggleSelect: (id: string) => void
    onToggleExpand: (id: string) => void
    onCollapseExpand: (id: string) => void
    onEdit: (row: DisplayRow) => void
    onDelete: (row: DisplayRow) => void
    onPayment: (row: DisplayRow) => void
}

const TableRowItem = memo(({
    row,
    isSelected,
    isExpanded,
    onToggleSelect,
    onToggleExpand,
    onCollapseExpand,
    onEdit,
    onDelete,
    onPayment,
}: TableRowItemProps) => {
    const handleToggleSelect = useCallback(() => onToggleSelect(row.id), [onToggleSelect, row.id])
    const handleEdit = useCallback(() => onEdit(row), [onEdit, row])
    const handleDelete = useCallback(() => onDelete(row), [onDelete, row])
    const handlePayment = useCallback(() => onPayment(row), [onPayment, row])
    const handleExpand = useCallback(() => onToggleExpand(row.id), [onToggleExpand, row.id])
    const handleCollapse = useCallback(() => onCollapseExpand(row.id), [onCollapseExpand, row.id])

    return (
        <TableRow hover selected={isSelected}>
            <TableCell padding="checkbox">
                <Checkbox
                    checked={isSelected}
                    onChange={handleToggleSelect}
                    size="small"
                />
            </TableCell>
            <TableCell>{row.formattedDate}</TableCell>
            <TableCell sx={{ maxWidth: 350 }}>
                {row.description.length <= 100 ? (
                    row.description
                ) : isExpanded ? (
                    <>
                        {row.description}{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleCollapse}
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
                            onClick={handleExpand}
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
            <TableCell>{row.paymentMode}</TableCell>
            <TableCell>{row.category || '—'}</TableCell>
            <TableCell>{row.isRecurrent ? 'Sim' : 'Não'}</TableCell>
            <TableCell>{row.type === 'Receita' ? '' : row.isPaid ? 'Sim' : 'Não'}</TableCell>
            <TableCell>
                <Tooltip title="Editar">
                    <IconButton size="small" onClick={handleEdit}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                    <IconButton size="small" onClick={handleDelete}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                {row.type === 'Despesa' && !row.isPaid && (
                    <Tooltip title="Marcar como pago">
                        <IconButton size="small" color="success" onClick={handlePayment}>
                            <CheckIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </TableCell>
        </TableRow>
    )
})

TableRowItem.displayName = 'TableRowItem'

export default TableRowItem
export type { DisplayRow }
