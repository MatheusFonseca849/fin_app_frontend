import type { Metadata } from 'next'
import VerifyEmail from './_client'

export const metadata: Metadata = {
    title: 'Confirmar Email',
}

export default function VerifyEmailPage() {
    return <VerifyEmail />
}
