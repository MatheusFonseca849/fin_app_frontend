'use client'

import { useState, useCallback, useMemo } from 'react'
import { transactionsApi } from '@/lib/api'
import type { Transaction } from '@/lib/api'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useCategories } from '@/lib/contexts/CategoriesContext'
import { initialTransactionFormData, TransactionFormData } from '@/app/components/AddTransactionModal'

interface UseTransactionCrudOptions {
    onChanged?: () => void
}

export function useTransactionCrud({ onChanged }: UseTransactionCrudOptions = {}) {
    const { patchUser } = useAuth()
    const { categories: allCategories } = useCategories()

    // Edit state
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
    const [editForm, setEditForm] = useState<TransactionFormData>(initialTransactionFormData)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // Delete state
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Payment state
    const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null)
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
    const [isPaying, setIsPaying] = useState(false)

    const notifyChange = useCallback((balance: number) => {
        patchUser({ balance })
        window.dispatchEvent(new Event('transaction-change'))
        onChanged?.()
    }, [patchUser, onChanged])

    // --- Edit ---
    const openEdit = useCallback((tx: Transaction) => {
        setEditingTransaction(tx)
        setEditForm({
            description: tx.description,
            value: (tx.value / 100).toFixed(2),
            type: tx.type,
            category: tx.category?._id || '',
            date: tx.timestamp.split('T')[0],
            isPaid: tx.isPaid,
            isRecurrent: tx.isRecurrent,
            billingDay: tx.billingDay ? String(tx.billingDay) : '',
        })
        setIsEditModalOpen(true)
    }, [])

    const closeEdit = useCallback(() => {
        setIsEditModalOpen(false)
        setEditingTransaction(null)
    }, [])

    const saveEdit = useCallback(async () => {
        if (!editingTransaction) return
        setIsSavingEdit(true)
        try {
            const { balance } = await transactionsApi.update(editingTransaction._id, {
                description: editForm.description,
                value: parseFloat(editForm.value),
                type: editForm.type,
                category: editForm.category,
                date: editForm.date || undefined,
                isPaid: editForm.isPaid,
                isRecurrent: editForm.isRecurrent || undefined,
                billingDay: editForm.billingDay ? Number(editForm.billingDay) : undefined,
            })
            notifyChange(balance)
            closeEdit()
        } catch (error) {
            console.error('Failed to update transaction:', error)
        } finally {
            setIsSavingEdit(false)
        }
    }, [editingTransaction, editForm, notifyChange, closeEdit])

    const editCategories = useMemo(() => {
        return allCategories
            .filter(c => c.type === editForm.type)
            .map(c => ({ _id: c._id, name: c.name }))
    }, [allCategories, editForm.type])

    // --- Delete ---
    const openDelete = useCallback((tx: Transaction) => {
        setDeletingTransaction(tx)
        setIsDeleteDialogOpen(true)
    }, [])

    const closeDelete = useCallback(() => {
        setIsDeleteDialogOpen(false)
        setDeletingTransaction(null)
    }, [])

    const confirmDelete = useCallback(async () => {
        if (!deletingTransaction) return
        setIsDeleting(true)
        try {
            const { balance } = await transactionsApi.delete(deletingTransaction._id)
            notifyChange(balance)
            closeDelete()
        } catch (error) {
            console.error('Failed to delete transaction:', error)
        } finally {
            setIsDeleting(false)
        }
    }, [deletingTransaction, notifyChange, closeDelete])

    // --- Payment ---
    const openPayment = useCallback((tx: Transaction) => {
        setPayingTransaction(tx)
        setIsPayDialogOpen(true)
    }, [])

    const closePayment = useCallback(() => {
        setIsPayDialogOpen(false)
        setPayingTransaction(null)
    }, [])

    const confirmPayment = useCallback(async () => {
        if (!payingTransaction) return
        setIsPaying(true)
        try {
            const { balance } = await transactionsApi.update(payingTransaction._id, { isPaid: true })
            notifyChange(balance)
            closePayment()
        } catch (error) {
            console.error('Failed to mark transaction as paid:', error)
        } finally {
            setIsPaying(false)
        }
    }, [payingTransaction, notifyChange, closePayment])

    return {
        edit: {
            transaction: editingTransaction,
            form: editForm,
            setForm: setEditForm,
            isOpen: isEditModalOpen,
            isSaving: isSavingEdit,
            open: openEdit,
            close: closeEdit,
            save: saveEdit,
            categories: editCategories,
        },
        del: {
            transaction: deletingTransaction,
            isOpen: isDeleteDialogOpen,
            isDeleting,
            open: openDelete,
            close: closeDelete,
            confirm: confirmDelete,
        },
        payment: {
            transaction: payingTransaction,
            isOpen: isPayDialogOpen,
            isPaying,
            open: openPayment,
            close: closePayment,
            confirm: confirmPayment,
        },
    }
}

export type TransactionCrud = ReturnType<typeof useTransactionCrud>
