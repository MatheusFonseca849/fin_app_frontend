'use client'

import { useCallback, useMemo, useState } from "react"
import CategoryCard from "@/app/components/CategoryCard"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Typography } from "@mui/material"
import ModalComponent from "@/app/components/ModalComponent"
import AddCategory, { CategoryFormData, initialCategoryFormData } from "@/app/components/AddCategoryModal"
import { categoriesApi } from "@/lib/api"
import type { Category } from "@/lib/api"
import { useAuth } from "@/lib/contexts/AuthContext"

const CategoriesPage = () => {
    const { categories, setCategories } = useAuth()

    // Add/Edit modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(initialCategoryFormData)
    const [isSaving, setIsSaving] = useState(false)

    // Delete dialog state
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const incomeCategories = useMemo(() =>
        categories.filter(c => c.type === 'credito'),
        [categories]
    )

    const expenseCategories = useMemo(() =>
        categories.filter(c => c.type === 'debito'),
        [categories]
    )

    // --- Add ---
    const handleOpenAdd = useCallback(() => {
        setEditingCategory(null)
        setFormData(initialCategoryFormData)
        setIsModalOpen(true)
    }, [])

    // --- Edit ---
    const handleOpenEdit = useCallback((id: string) => {
        const cat = categories.find(c => c._id === id)
        if (!cat) return
        setEditingCategory(cat)
        setFormData({
            name: cat.name,
            type: cat.type,
            color: cat.color || '#1976d2',
        })
        setIsModalOpen(true)
    }, [categories])

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false)
        setEditingCategory(null)
    }, [])

    const handleSave = useCallback(async () => {
        if (!formData.name.trim()) return
        setIsSaving(true)
        try {
            if (editingCategory) {
                const updated = await categoriesApi.update(editingCategory._id, {
                    name: formData.name,
                    type: formData.type,
                    color: formData.color,
                })
                setCategories(prev => prev.map(c => c._id === editingCategory._id ? updated : c))
            } else {
                const created = await categoriesApi.create({
                    name: formData.name,
                    type: formData.type,
                    color: formData.color,
                })
                setCategories(prev => [...prev, created])
            }
            handleCloseModal()
        } catch (error) {
            console.error('Failed to save category:', error)
        } finally {
            setIsSaving(false)
        }
    }, [editingCategory, formData, handleCloseModal, categories])

    // --- Delete ---
    const handleOpenDelete = useCallback((id: string) => {
        const cat = categories.find(c => c._id === id)
        if (!cat) return
        setDeletingCategory(cat)
        setIsDeleteDialogOpen(true)
    }, [categories])

    const handleCloseDelete = useCallback(() => {
        setIsDeleteDialogOpen(false)
        setDeletingCategory(null)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingCategory) return
        setIsDeleting(true)
        try {
            await categoriesApi.delete(deletingCategory._id)
            setCategories(prev => prev.filter(c => c._id !== deletingCategory._id))
            handleCloseDelete()
        } catch (error) {
            console.error('Failed to delete category:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [deletingCategory, handleCloseDelete, categories])

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight={600}>Categorias</Typography>
                <Button variant="contained" onClick={handleOpenAdd}>Adicionar Categoria</Button>
            </Box>
            <Divider />
            <Box>
                <Typography variant="h5" sx={{ mt: 2 }}>Receitas</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {incomeCategories.map(cat => (
                        <CategoryCard
                            key={cat._id}
                            id={cat._id}
                            name={cat.name}
                            type="Receita"
                            color={cat.color}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                    ))}
                    {incomeCategories.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Nenhuma categoria de receita cadastrada.</Typography>
                    )}
                </Box>
            </Box>

            <Box>
                <Typography variant="h5" sx={{ mt: 2 }}>Despesas</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {expenseCategories.map(cat => (
                        <CategoryCard
                            key={cat._id}
                            id={cat._id}
                            name={cat.name}
                            type="Despesa"
                            color={cat.color}
                            onEdit={handleOpenEdit}
                            onDelete={handleOpenDelete}
                        />
                    ))}
                    {expenseCategories.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Nenhuma categoria de despesa cadastrada.</Typography>
                    )}
                </Box>
            </Box>

            {/* Add/Edit Modal */}
            <ModalComponent
                open={isModalOpen}
                handleClose={handleCloseModal}
                title={editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
                action={handleSave}
                confirmLabel={isSaving ? 'Salvando...' : 'Salvar'}
                layout={
                    <AddCategory
                        formData={formData}
                        setFormData={setFormData}
                    />
                }
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={handleCloseDelete}>
                <DialogTitle>Excluir Categoria</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir a categoria <strong>{deletingCategory?.name}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete} disabled={isDeleting}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CategoriesPage