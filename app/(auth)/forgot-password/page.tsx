import type { Metadata } from 'next'
import ForgotPassword from './_client'

export const metadata: Metadata = {
    title: 'Redefinir Senha',
}

export default function ForgotPasswordPage() {
    return <ForgotPassword />
}
