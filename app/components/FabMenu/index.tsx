'use client'

import { Alert, Box, Button, CircularProgress, Divider, Fab, Menu, MenuItem, Modal, Stack, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useCallback, useMemo, useRef, useState } from "react";
import ModalComponent from "../ModalComponent";
import AddTransaction, { initialTransactionFormData, TransactionFormData } from "../AddTransactionModal";
import AddCategory, { CategoryFormData, initialCategoryFormData } from "../AddCategoryModal";
import { transactionsApi, categoriesApi } from "@/lib/api";
import type { ImportResult } from "@/lib/api";
import { useAuth } from "@/lib/contexts/AuthContext";

const importModalBoxSx = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 480 },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    display: 'flex',
    flexDirection: 'column',
}

const FabMenu = () => {
    const { user, patchUser, categories: allCategories, setCategories } = useAuth();
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importFeedback, setImportFeedback] = useState<{ message: string; severity: 'success' | 'warning' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!transactionForm.description || !transactionForm.value || !transactionForm.category) return;
        setIsSubmitting(true);
        setTransactionFeedback(null);
        try {
            const valueInReais = parseFloat(transactionForm.value);
            const { balance } = await transactionsApi.create({
                description: transactionForm.description,
                value: valueInReais,
                type: transactionForm.type,
                category: transactionForm.category,
                date: transactionForm.date || undefined,
                isPaid: transactionForm.isPaid || undefined,
                isRecurrent: transactionForm.isRecurrent || undefined,
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
        setSelectedFile(null);
        setImportFeedback(null);
        setImportModalOpen(true);
    };

    const handleCloseImportModal = useCallback(() => {
        if (isImporting) return;
        setImportModalOpen(false);
        setSelectedFile(null);
        setImportFeedback(null);
    }, [isImporting]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
        e.target.value = '';
    };

    const handleImport = useCallback(async () => {
        if (!selectedFile) return;
        setIsImporting(true);
        setImportFeedback(null);
        try {
            const result: ImportResult = await transactionsApi.importCSV(selectedFile);
            const parts: string[] = [];
            parts.push(`${result.createdCount} transações importadas`);
            if (result.skippedCount > 0) parts.push(`${result.skippedCount} duplicadas ignoradas`);
            if (result.errorCount > 0) parts.push(`${result.errorCount} com erro`);
            const msg = parts.join(', ') + '.';
            const severity = result.errorCount > 0 ? 'error' : result.skippedCount > 0 ? 'warning' : 'success';
            setImportFeedback({ message: msg, severity });
            setSelectedFile(null);
        } catch {
            setImportFeedback({ message: 'Erro ao importar arquivo.', severity: 'error' });
        } finally {
            setIsImporting(false);
        }
    }, [selectedFile]);

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

            <Modal open={importModalOpen} onClose={handleCloseImportModal}>
                <Box sx={importModalBoxSx}>
                    <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>Importar Extrato</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ px: 3, py: 2 }}>
                        {importFeedback && (
                            <Alert severity={importFeedback.severity} sx={{ mb: 2 }} onClose={() => setImportFeedback(null)}>
                                {importFeedback.message}
                            </Alert>
                        )}
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                value={selectedFile?.name || ''}
                                placeholder="Nenhum arquivo selecionado"
                                fullWidth
                                size="small"
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <Button
                                variant="contained"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImporting}
                                startIcon={<UploadFileIcon />}
                                sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem', textTransform: 'none', textAlign: 'center' }}
                            >
                                Selecionar
                            </Button>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Formato CSV: date, type, category, description, value
                        </Typography>
                    </Box>
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
                        <Button onClick={handleCloseImportModal} disabled={isImporting}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={!selectedFile || isImporting}
                        >
                            {isImporting ? <CircularProgress size={24} /> : 'Importar'}
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </>
    )
}

export default FabMenu
