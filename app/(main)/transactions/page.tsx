import type { Metadata } from 'next'
import TransactionsPage from './_client'

export const metadata: Metadata = {
    title: 'Transações',
}

export default function TransactionsPageWrapper() {
    return <TransactionsPage />
}