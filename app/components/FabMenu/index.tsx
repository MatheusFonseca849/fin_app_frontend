'use client'

import { Fab, Menu, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";
import ModalComponent from "../ModalComponent";
import AddTransaction, { initialTransactionFormData, TransactionFormData } from "../AddTransactionModal";

const MOCK_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação']

const FabMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionForm, setTransactionForm] = useState<TransactionFormData>(initialTransactionFormData);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenTransactionModal = () => {
        handleClose();
        setTransactionForm(initialTransactionFormData);
        setTransactionModalOpen(true);
    };

    const handleCloseTransactionModal = () => {
        setTransactionModalOpen(false);
    };

    const handleSubmitTransaction = () => {
        // TODO: Replace with API call to POST /api/v1/records
        console.log('New transaction:', transactionForm);
        handleCloseTransactionModal();
    };

    return (
        <>
            <Fab color="primary" aria-label="add" onClick={handleOpen} sx={{ position: 'fixed', bottom: 16, right: 16, width: 80, height: 80, backgroundColor: '#63885a', '&:hover': { backgroundColor: '#1fcf25' } }} >
                <AddIcon fontSize="large" />
            </Fab>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MenuItem onClick={handleClose}>Importar Extrato</MenuItem>
                <MenuItem onClick={handleOpenTransactionModal}>Adicionar Transação</MenuItem>
                <MenuItem onClick={handleClose}>Adicionar Transação Recorrente</MenuItem>
                <MenuItem onClick={handleClose}>Adicionar Categoria</MenuItem>
            </Menu>

            <ModalComponent
                open={transactionModalOpen}
                handleClose={handleCloseTransactionModal}
                title="Adicionar Transação"
                layout={
                    <AddTransaction
                        formData={transactionForm}
                        setFormData={setTransactionForm}
                        categories={MOCK_CATEGORIES}
                    />
                }
                action={handleSubmitTransaction}
            />
        </>
    )
}

export default FabMenu
