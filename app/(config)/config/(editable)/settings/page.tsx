import type { Metadata } from 'next'
import SettingsPage from './_client'

export const metadata: Metadata = {
    title: 'Preferências',
}

export default function SettingsPageWrapper() {
    return <SettingsPage />
}
