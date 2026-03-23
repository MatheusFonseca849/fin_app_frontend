import type { Metadata } from 'next'
import Profile from './_client'

export const metadata: Metadata = {
    title: 'Perfil',
}

export default function ProfilePage() {
    return <Profile />
}
