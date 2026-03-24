'use client'

import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    TextField,
} from '@mui/material'

interface TransactionFiltersProps {
    startDate: string
    endDate: string
    typeFilter: '' | 'Despesa' | 'Receita'
    categoryFilter: string
    recurrentOnly: boolean
    paidFilter: '' | 'true' | 'false'
    categories: { _id: string; name: string }[]
    onStartDateChange: (value: string) => void
    onEndDateChange: (value: string) => void
    onTypeFilterChange: (value: '' | 'Despesa' | 'Receita') => void
    onCategoryFilterChange: (value: string) => void
    onRecurrentOnlyChange: (value: boolean) => void
    onPaidFilterChange: (value: '' | 'true' | 'false') => void
    // Bulk actions
    selectedCount: number
    bulkMenuAnchor: HTMLElement | null
    onBulkMenuOpen: (e: React.MouseEvent<HTMLElement>) => void
    onBulkMenuClose: () => void
    onBulkDelete: () => void
    onBulkUpdate: () => void
}

const TransactionFilters = ({
    startDate,
    endDate,
    typeFilter,
    categoryFilter,
    recurrentOnly,
    paidFilter,
    categories,
    onStartDateChange,
    onEndDateChange,
    onTypeFilterChange,
    onCategoryFilterChange,
    onRecurrentOnlyChange,
    onPaidFilterChange,
    selectedCount,
    bulkMenuAnchor,
    onBulkMenuOpen,
    onBulkMenuClose,
    onBulkDelete,
    onBulkUpdate,
}: TransactionFiltersProps) => {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
            <TextField
                label="Data Inicial"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 150 }}
            />
            <TextField
                label="Data Final"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ minWidth: 150 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                    value={typeFilter}
                    label="Tipo"
                    onChange={(e) => onTypeFilterChange(e.target.value as '' | 'Despesa' | 'Receita')}
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
                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={recurrentOnly}
                        onChange={(e) => onRecurrentOnlyChange(e.target.checked)}
                    />
                }
                label="Recorrentes"
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Pago</InputLabel>
                <Select
                    value={paidFilter}
                    label="Pago"
                    onChange={(e) => onPaidFilterChange(e.target.value as '' | 'true' | 'false')}
                >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="true">Sim</MenuItem>
                    <MenuItem value="false">Não</MenuItem>
                </Select>
            </FormControl>

            {selectedCount > 0 && (
                <>
                    <Box sx={{ flex: 1 }} />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onBulkMenuOpen}
                    >
                        Ações ({selectedCount})
                    </Button>
                    <Menu
                        anchorEl={bulkMenuAnchor}
                        open={Boolean(bulkMenuAnchor)}
                        onClose={onBulkMenuClose}
                    >
                        <MenuItem onClick={onBulkDelete}>Deletar todos</MenuItem>
                        <MenuItem onClick={onBulkUpdate}>Atualização em massa</MenuItem>
                    </Menu>
                </>
            )}
        </Box>
    )
}

export default TransactionFilters
