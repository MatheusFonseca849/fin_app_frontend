import type { Metadata } from 'next'
import Login from './_client'

export const metadata: Metadata = {
    title: 'Login',
}

export default function LoginPage() {
    return <Login />
}