import type { Metadata } from 'next'
import Calendar from './_client'

export const metadata: Metadata = {
    title: 'Calendário',
}

export default function CalendarPage() {
    return <Calendar />
}