'use client'

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material'
import ModalComponent from '@/app/components/ModalComponent'
import AddTransaction from '@/app/components/AddTransactionModal'
import type { TransactionCrud } from '@/lib/hooks/useTransactionCrud'

interface TransactionCrudDialogsProps {
    crud: TransactionCrud
}

const TransactionCrudDialogs = ({ crud }: TransactionCrudDialogsProps) => {
    const { edit, del, payment } = crud

    return (
        <>
            {/* Edit Modal */}
            <ModalComponent
                open={edit.isOpen}
                handleClose={edit.close}
                title="Editar Transação"
                layout={
                    <AddTransaction
                        formData={edit.form}
                        setFormData={edit.setForm}
                        categories={edit.categories}
                    />
                }
                action={edit.save}
                confirmLabel={edit.isSaving ? 'Salvando...' : 'Salvar'}
            />

            {/* Payment Confirmation */}
            <Dialog open={payment.isOpen} onClose={payment.close}>
                <DialogTitle>Confirmar Pagamento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Deseja confirmar o pagamento de <strong>&ldquo;{payment.transaction?.description}&rdquo;</strong> no valor de{' '}
                        <strong>{((payment.transaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={payment.close} disabled={payment.isPaying}>Cancelar</Button>
                    <Button onClick={payment.confirm} color="success" variant="contained" disabled={payment.isPaying}>
                        {payment.isPaying ? <CircularProgress size={20} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={del.isOpen} onClose={del.close}>
                <DialogTitle>Excluir Transação</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir a transação <strong>&ldquo;{del.transaction?.description}&rdquo;</strong> no valor de{' '}
                        <strong>{((del.transaction?.value ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={del.close} disabled={del.isDeleting}>Cancelar</Button>
                    <Button onClick={del.confirm} color="error" variant="contained" disabled={del.isDeleting}>
                        {del.isDeleting ? <CircularProgress size={20} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TransactionCrudDialogs
