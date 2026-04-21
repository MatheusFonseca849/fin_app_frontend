'use client'

import { Alert, Fab, Menu, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useCallback, useMemo, useState } from "react";
import ModalComponent from "../ModalComponent";
import AddTransaction, { initialTransactionFormData, TransactionFormData } from "../AddTransactionModal";
import AddCategory, { CategoryFormData, initialCategoryFormData } from "../AddCategoryModal";
import CsvImportModal from "../CsvImportModal";
import { transactionsApi, categoriesApi } from "@/lib/api";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useCategories } from "@/lib/contexts/CategoriesContext";

const FabMenu = () => {
    const { user, patchUser } = useAuth();
    const { categories: allCategories, setCategories } = useCategories();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionForm, setTransactionForm] = useState<TransactionFormData>(initialTransactionFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionFeedback, setTransactionFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    const categories = useMemo(() => {
        return allCategories
            .filter(c => c.type === transactionForm.type)
            .map(c => ({ _id: c._id, name: c.name }));
    }, [allCategories, transactionForm.type]);

    // Category modal state
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(initialCategoryFormData);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [categoryFeedback, setCategoryFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [ccImportModalOpen, setCcImportModalOpen] = useState(false);

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
        setTransactionFeedback(null);
    };

    const handleSubmitTransaction = useCallback(async () => {
        if (!transactionForm.description || !transactionForm.value || !transactionForm.category || !transactionForm.date) return;
        setIsSubmitting(true);
        setTransactionFeedback(null);
        try {
            const valueInReais = parseFloat(transactionForm.value);
            const { balance } = await transactionsApi.create({
                description: transactionForm.description,
                value: valueInReais,
                type: transactionForm.type,
                paymentMode: transactionForm.type === 'expense' ? transactionForm.paymentMode : undefined,
                category: transactionForm.category,
                date: transactionForm.date,
                isPaid: transactionForm.type === 'expense' && transactionForm.paymentMode === 'credit' ? false : transactionForm.isPaid,
                isRecurrent: transactionForm.isRecurrent,
                billingDay: transactionForm.billingDay ? Number(transactionForm.billingDay) : undefined,
            });
            patchUser({ balance });
            window.dispatchEvent(new Event('transaction-change'));
            setTransactionModalOpen(false);
            setTransactionForm(initialTransactionFormData);
        } catch {
            setTransactionFeedback({ message: 'Erro ao criar transação.', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }, [transactionForm, patchUser]);

    const handleOpenCategoryModal = () => {
        handleClose();
        setCategoryForm(initialCategoryFormData);
        setCategoryFeedback(null);
        setCategoryModalOpen(true);
    };

    const handleCloseCategoryModal = () => {
        setCategoryModalOpen(false);
        setCategoryFeedback(null);
    };

    const handleSubmitCategory = useCallback(async () => {
        if (!categoryForm.name.trim()) return;
        setIsSavingCategory(true);
        setCategoryFeedback(null);
        try {
            const newCategory = await categoriesApi.create({
                name: categoryForm.name,
                type: categoryForm.type,
                color: categoryForm.color,
                keywords: categoryForm.keywords,
            });
            setCategories(prev => [...prev, newCategory]);
            setCategoryModalOpen(false);
            setCategoryForm(initialCategoryFormData);
        } catch {
            setCategoryFeedback({ message: 'Erro ao criar categoria.', severity: 'error' });
        } finally {
            setIsSavingCategory(false);
        }
    }, [categoryForm, setCategories]);

    const handleOpenImportModal = () => {
        handleClose();
        setImportModalOpen(true);
    };

    const handleOpenCcImportModal = () => {
        handleClose();
        setCcImportModalOpen(true);
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
                <MenuItem onClick={handleOpenImportModal}>Importar Extrato</MenuItem>
                <MenuItem onClick={handleOpenCcImportModal}>Importar Fatura</MenuItem>
                <MenuItem onClick={handleOpenTransactionModal}>Adicionar Transação</MenuItem>
                <MenuItem onClick={handleOpenCategoryModal}>Adicionar Categoria</MenuItem>
            </Menu>

            <ModalComponent
                open={transactionModalOpen}
                handleClose={handleCloseTransactionModal}
                title="Adicionar Transação"
                layout={
                    <>
                        {transactionFeedback && (
                            <Alert severity={transactionFeedback.severity} sx={{ mb: 1 }} onClose={() => setTransactionFeedback(null)}>
                                {transactionFeedback.message}
                            </Alert>
                        )}
                        <AddTransaction
                            formData={transactionForm}
                            setFormData={setTransactionForm}
                            categories={categories}
                        />
                    </>
                }
                action={handleSubmitTransaction}
                confirmLabel={isSubmitting ? 'Salvando...' : 'Salvar'}
            />

            <ModalComponent
                open={categoryModalOpen}
                handleClose={handleCloseCategoryModal}
                title="Adicionar Categoria"
                layout={
                    <>
                        {categoryFeedback && (
                            <Alert severity={categoryFeedback.severity} sx={{ mb: 1 }} onClose={() => setCategoryFeedback(null)}>
                                {categoryFeedback.message}
                            </Alert>
                        )}
                        <AddCategory
                            formData={categoryForm}
                            setFormData={setCategoryForm}
                        />
                    </>
                }
                action={handleSubmitCategory}
                confirmLabel={isSavingCategory ? 'Salvando...' : 'Salvar'}
            />

            <CsvImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
            />

            <CsvImportModal
                open={ccImportModalOpen}
                onClose={() => setCcImportModalOpen(false)}
                creditCardOnly
            />
        </>
    )
}

export default FabMenu
