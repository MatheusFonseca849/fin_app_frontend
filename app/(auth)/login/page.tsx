'use client'

import { Alert, Button, Card, CircularProgress, FormControl, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/contexts/AuthContext';
import PasswordField from "@/app/components/PasswordField";
import { authApi } from '@/lib/api';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendStatus, setResendStatus] = useState<'success' | 'error' | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const { login, isLoading, error, clearError } = useAuth();
    const router = useRouter();

    const isUnverified = error?.includes('não verificado') ?? false;

    const handleSubmit = async () => {
        clearError();
        setResendMessage(null);
        setResendStatus(null);
        try {
            await login({ email, password });
            router.replace('/main');
        } catch {
            // error is already set in context
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendMessage(null);
        setResendStatus(null);
        try {
            const result = await authApi.resendVerification(email);
            setResendMessage(result.message);
            setResendStatus('success');
        } catch {
            setResendMessage('Erro ao reenviar email. Tente novamente.');
            setResendStatus('error');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card sx={{ p: 3, width: 400, backgroundColor: "#fdfdfd" ,margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" align="center" gutterBottom>Login</Typography>
                    <FormControl sx={{width: '100%'}}>
                        <Grid container spacing={2} direction="column" alignItems="center">
                        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
                        {resendMessage && resendStatus && <Alert severity={resendStatus} sx={{ width: '100%' }}>{resendMessage}</Alert>}
                        <TextField id="outlined-basic" name="email" label="Email" variant="outlined" sx={{ minWidth: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                        <PasswordField
                            id="outlined-basic"
                            name="password"
                            label="Senha"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {isUnverified && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleResendVerification}
                                disabled={resendLoading || !email}
                            >
                                {resendLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                                Reenviar email de verificação
                            </Button>
                        )}
                        <Typography variant="body2" sx={{pb: 2}}>Esqueceu sua senha? <Link href="/forgot-password">Redefinir Senha</Link></Typography>
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : 'Login'}
                        </Button>
                        </Grid>
                    </FormControl>
                    <Typography variant="body2" sx={{pt: 2}}>Não tem uma conta? <Link href="/register">Cadastre-se</Link></Typography>
                </Card>
            </Grid>
    )
}

export default Login