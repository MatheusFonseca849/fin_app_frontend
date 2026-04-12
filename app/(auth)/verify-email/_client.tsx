'use client'

import { Alert, Button, Card, CircularProgress, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils/extractError';

const VerifyEmail = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verify = async () => {
            if (!token || !email) {
                setStatus('error');
                setMessage('Link de verificação inválido. Token e email são obrigatórios.');
                return;
            }

            try {
                const result = await authApi.verifyEmail(token, email);
                setStatus('success');
                setMessage(result.message);
            } catch (err: unknown) {
                setStatus('error');
                setMessage(extractErrorMessage(err, 'Erro ao verificar email.'));
            }
        };

        verify();
    }, [token, email]);

    const handleResend = async () => {
        if (!email) return;
        setResendLoading(true);
        setResendMessage(null);
        try {
            const result = await authApi.resendVerification(email);
            setResendMessage(result.message);
        } catch (err: unknown) {
            setResendMessage(extractErrorMessage(err, 'Erro ao reenviar email. Tente novamente.'));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ p: 3, width: 450, backgroundColor: "#fdfdfd", margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <Typography variant="h4" align="center" gutterBottom>Verificação de Email</Typography>

                {status === 'loading' && (
                    <CircularProgress sx={{ my: 3 }} />
                )}

                {status === 'success' && (
                    <>
                        <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
                        <Button variant="contained" component={Link} href="/login">
                            Ir para Login
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
                        {resendMessage && <Alert severity="info" sx={{ mb: 2 }}>{resendMessage}</Alert>}
                        {email && (
                            <Button
                                variant="outlined"
                                onClick={handleResend}
                                disabled={resendLoading}
                                sx={{ mb: 2 }}
                            >
                                {resendLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                                Reenviar email de verificação
                            </Button>
                        )}
                        <br />
                        <Button variant="text" component={Link} href="/login">
                            Voltar ao Login
                        </Button>
                    </>
                )}
            </Card>
        </Grid>
    )
}

export default VerifyEmail
