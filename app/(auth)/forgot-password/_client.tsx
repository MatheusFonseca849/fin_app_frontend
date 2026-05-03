'use client'

import { Alert, Button, Card, CircularProgress, FormControl, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils/extractError';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);

    const handleSubmit = async () => {
        if (!email) return;
        setIsLoading(true);
        setMessage(null);
        setStatus(null);
        try {
            const result = await authApi.forgotPassword(email);
            setMessage(result.message);
            setStatus('success');
        } catch (err: unknown) {
            setMessage(extractErrorMessage(err, 'Erro ao enviar email. Tente novamente.'));
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ p: 3, width: 400, bgcolor: 'background.paper', margin: 'auto', borderRadius: 3, boxShadow: 2 }}>
                <Typography variant="h4" align="center" gutterBottom>Redefinir Senha</Typography>
                <Typography variant="body2" align="center" sx={{ mb: 2, color: 'text.secondary' }}>
                    Digite seu email e enviaremos um link para redefinir sua senha.
                </Typography>
                <FormControl sx={{ width: '100%' }}>
                    <Grid container spacing={2} direction="column" alignItems="center">
                        {message && status && <Alert severity={status} sx={{ width: '100%' }}>{message}</Alert>}
                        <TextField
                            name="email"
                            label="Email"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading || !email}>
                            {isLoading ? <CircularProgress size={24} /> : 'Enviar Link'}
                        </Button>
                    </Grid>
                </FormControl>
                <Typography variant="body2" sx={{ pt: 2 }}>Lembrou sua senha? <Link href="/login">Voltar ao Login</Link></Typography>
            </Card>
        </Grid>
    )
}

export default ForgotPassword
