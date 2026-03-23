import type { Metadata } from 'next'
import VerifyEmailChange from './_client'

export const metadata: Metadata = {
    title: 'Confirmar Email',
}

export default function VerifyEmailChangePage() {
    return <VerifyEmailChange />
}