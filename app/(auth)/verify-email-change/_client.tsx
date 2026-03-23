'use client'

import { Alert, Button, Card, CircularProgress, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from '@/lib/api';

const VerifyEmailChange = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
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
                const result = await authApi.verifyEmailChange(token, email);
                setStatus('success');
                setMessage(result.message);
            } catch (err: unknown) {
                setStatus('error');
                if (
                    typeof err === 'object' &&
                    err !== null &&
                    'response' in err
                ) {
                    const axiosErr = err as { response?: { data?: { error?: { message?: string; details?: Array<{ message?: string }> } } } };
                    const errorData = axiosErr.response?.data?.error;
                    setMessage(errorData?.details?.[0]?.message || errorData?.message || 'Erro ao confirmar alteração de email.');
                } else {
                    setMessage('Erro ao confirmar alteração de email.');
                }
            }
        };

        verify();
    }, [token, email]);

    return (
        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ p: 3, width: 450, backgroundColor: "#fdfdfd", margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <Typography variant="h4" align="center" gutterBottom>Confirmação de Email</Typography>

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
                        <Button variant="text" component={Link} href="/login">
                            Voltar ao Login
                        </Button>
                    </>
                )}
            </Card>
        </Grid>
    )
}

export default VerifyEmailChange
