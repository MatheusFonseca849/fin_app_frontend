'use client'

import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material'

interface CategoryOption {
    _id: string
    name: string
}

interface BulkUpdateFormData {
    description: string
    value: string
    type: '' | 'income' | 'expense'
    category: string
    date: string
    isPaid: boolean
}

interface BulkActionDialogsProps {
    selectedCount: number
    // Bulk delete
    isBulkDeleteDialogOpen: boolean
    isBulkDeleting: boolean
    onCloseBulkDelete: () => void
    onConfirmBulkDelete: () => void
    // Bulk update modal
    isBulkUpdateModalOpen: boolean
    bulkUpdateFields: Record<string, boolean>
    bulkUpdateForm: BulkUpdateFormData
    bulkUpdateCategories: CategoryOption[]
    hasEnabledBulkFields: boolean
    onCloseBulkUpdate: () => void
    onBulkUpdateFieldToggle: (field: string, checked: boolean) => void
    onBulkUpdateFormChange: (field: string, value: string | boolean) => void
    onBulkUpdateProceed: () => void
    // Bulk update confirmation
    isBulkUpdateConfirmOpen: boolean
    isBulkUpdating: boolean
    onCancelBulkUpdateConfirm: () => void
    onConfirmBulkUpdate: () => void
}

const BulkActionDialogs = ({
    selectedCount,
    isBulkDeleteDialogOpen,
    isBulkDeleting,
    onCloseBulkDelete,
    onConfirmBulkDelete,
    isBulkUpdateModalOpen,
    bulkUpdateFields,
    bulkUpdateForm,
    bulkUpdateCategories,
    hasEnabledBulkFields,
    onCloseBulkUpdate,
    onBulkUpdateFieldToggle,
    onBulkUpdateFormChange,
    onBulkUpdateProceed,
    isBulkUpdateConfirmOpen,
    isBulkUpdating,
    onCancelBulkUpdateConfirm,
    onConfirmBulkUpdate,
}: BulkActionDialogsProps) => {
    return (
        <>
            {/* Bulk Delete Confirmation */}
            <Dialog open={isBulkDeleteDialogOpen} onClose={() => !isBulkDeleting && onCloseBulkDelete()}>
                <DialogTitle>Excluir Transações</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Essa operação não poderá ser desfeita. Tem certeza que deseja prosseguir?
                    </DialogContentText>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedCount} transação(ões) serão excluídas.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseBulkDelete} disabled={isBulkDeleting}>Cancelar</Button>
                    <Button onClick={onConfirmBulkDelete} color="error" variant="contained" disabled={isBulkDeleting}>
                        {isBulkDeleting ? <CircularProgress size={20} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Update Modal */}
            <Dialog
                open={isBulkUpdateModalOpen}
                onClose={onCloseBulkUpdate}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Atualização em Massa</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Selecione os campos que deseja atualizar para as {selectedCount} transações selecionadas:
                    </DialogContentText>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Description */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                                checked={!!bulkUpdateFields.description}
                                onChange={(e) => onBulkUpdateFieldToggle('description', e.target.checked)}
                            />
                            <TextField
                                label="Descrição"
                                size="small"
                                fullWidth
                                disabled={!bulkUpdateFields.description}
                                value={bulkUpdateForm.description}
                                onChange={(e) => onBulkUpdateFormChange('description', e.target.value)}
                            />
                        </Box>

                        {/* Value */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                                checked={!!bulkUpdateFields.value}
                                onChange={(e) => onBulkUpdateFieldToggle('value', e.target.checked)}
                            />
                            <TextField
                                label="Valor"
                                size="small"
                                type="number"
                                fullWidth
                                disabled={!bulkUpdateFields.value}
                                value={bulkUpdateForm.value}
                                onChange={(e) => onBulkUpdateFormChange('value', e.target.value)}
                                inputProps={{ step: '0.01', min: '0.01' }}
                            />
                        </Box>

                        {/* Type */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                                checked={!!bulkUpdateFields.type}
                                onChange={(e) => onBulkUpdateFieldToggle('type', e.target.checked)}
                            />
                            <FormControl size="small" fullWidth disabled={!bulkUpdateFields.type}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={bulkUpdateForm.type}
                                    label="Tipo"
                                    onChange={(e) => onBulkUpdateFormChange('type', e.target.value)}
                                >
                                    <MenuItem value="expense">Despesa</MenuItem>
                                    <MenuItem value="income">Receita</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Category */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                                checked={!!bulkUpdateFields.category}
                                onChange={(e) => onBulkUpdateFieldToggle('category', e.target.checked)}
                            />
                            <FormControl size="small" fullWidth disabled={!bulkUpdateFields.category}>
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    value={bulkUpdateForm.category}
                                    label="Categoria"
                                    onChange={(e) => onBulkUpdateFormChange('category', e.target.value)}
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
                                onChange={(e) => onBulkUpdateFieldToggle('date', e.target.checked)}
                            />
                            <TextField
                                label="Data"
                                type="date"
                                size="small"
                                fullWidth
                                disabled={!bulkUpdateFields.date}
                                value={bulkUpdateForm.date}
                                onChange={(e) => onBulkUpdateFormChange('date', e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Box>

                        {/* isPaid */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                                checked={!!bulkUpdateFields.isPaid}
                                onChange={(e) => onBulkUpdateFieldToggle('isPaid', e.target.checked)}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bulkUpdateForm.isPaid}
                                        onChange={(e) => onBulkUpdateFormChange('isPaid', e.target.checked)}
                                        disabled={!bulkUpdateFields.isPaid}
                                    />
                                }
                                label="Marcar como pago"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseBulkUpdate}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={onBulkUpdateProceed}
                        disabled={!hasEnabledBulkFields}
                    >
                        Prosseguir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Update Confirmation */}
            <Dialog open={isBulkUpdateConfirmOpen} onClose={() => !isBulkUpdating && onCancelBulkUpdateConfirm()}>
                <DialogTitle>Confirmar Atualização</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Essa operação não poderá ser desfeita. Tem certeza que deseja prosseguir?
                    </DialogContentText>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedCount} transação(ões) serão atualizadas.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancelBulkUpdateConfirm} disabled={isBulkUpdating}>Cancelar</Button>
                    <Button onClick={onConfirmBulkUpdate} color="primary" variant="contained" disabled={isBulkUpdating}>
                        {isBulkUpdating ? <CircularProgress size={20} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default BulkActionDialogs
