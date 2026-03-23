import type { Metadata } from 'next'
import Register from './_client'

export const metadata: Metadata = {
    title: 'Cadastro',
}

export default function RegisterPage() {
    return <Register />
}