import type { Metadata } from 'next'
import HistoryPage from './_client'

export const metadata: Metadata = {
    title: 'Histórico',
}

export default function HistoryPageWrapper() {
    return <HistoryPage />
}