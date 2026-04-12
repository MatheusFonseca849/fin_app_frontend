import type { Metadata } from 'next'
import CategoriesPage from './_client'

export const metadata: Metadata = {
    title: 'Categorias',
}

export default function CategoriesPageWrapper() {
    return <CategoriesPage />
}
