'use client'

import { Alert, Button, Card, CircularProgress, FormControl, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils/extractError';
import { validatePassword } from '@/lib/utils/validatePassword';
import PasswordField from "@/app/components/PasswordField";

const ResetPassword = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);

    const handleSubmit = async () => {
        setMessage(null);
        setStatus(null);

        if (!token || !email) {
            setMessage('Link de redefinição inválido. Token e email são obrigatórios.');
            setStatus('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            setStatus('error');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setMessage(passwordError);
            setStatus('error');
            return;
        }

        setIsLoading(true);
        try {
            const result = await authApi.resetPassword({ token, email, password });
            setMessage(result.message);
            setStatus('success');
        } catch (err: unknown) {
            setMessage(extractErrorMessage(err, 'Erro ao redefinir senha.'));
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ p: 3, width: 400, bgcolor: 'background.paper', margin: 'auto', borderRadius: 3, boxShadow: 2 }}>
                <Typography variant="h4" align="center" gutterBottom>Nova Senha</Typography>
                <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
                    Digite sua nova senha abaixo.
                </Typography>
                <FormControl sx={{ width: '100%' }}>
                    <Grid container spacing={2} direction="column" alignItems="center">
                        {message && status && <Alert severity={status} sx={{ width: '100%' }}>{message}</Alert>}
                        <PasswordField
                            name="password"
                            label="Nova Senha"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <PasswordField
                            name="confirmPassword"
                            label="Confirmar Senha"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !password || !confirmPassword}>
                            {isLoading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
                        </Button>
                    </Grid>
                </FormControl>
                {status === 'success' && (
                    <Typography variant="body2" sx={{ pt: 2, textAlign: 'center' }}>
                        <Link href="/login">Ir para Login</Link>
                    </Typography>
                )}
            </Card>
        </Grid>
    )
}

export default ResetPassword
