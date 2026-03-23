import type { Metadata } from 'next'
import ResetPassword from './_client'

export const metadata: Metadata = {
    title: 'Redefinir Senha',
}

export default function ResetPasswordPage() {
    return <ResetPassword />
}
