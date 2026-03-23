'use client'

import { Alert, Button, Card, CircularProgress, FormControl, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from '@/lib/contexts/AuthContext';
import PasswordField from "@/app/components/PasswordField";

const Register = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const { register, isLoading, error, clearError } = useAuth();

    const handleSubmit = async () => {
        clearError();
        setLocalError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setLocalError('As senhas não coincidem.');
            return;
        }

        try {
            const result = await register({ firstName, lastName, email, password });
            setSuccess(result.message);
        } catch {
            // error is already set in context
        }
    };

    const displayError = localError || error;

    return (
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card sx={{ p: 3, width: 500, backgroundColor: "#fdfdfd" ,margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" align="center" gutterBottom>Cadastre-se</Typography>
                    <FormControl sx={{width: '100%'}}>
                        <Grid container spacing={2} direction="column" alignItems="center">
                            {success && <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>}
                            {displayError && <Alert severity="error" sx={{ width: '100%' }}>{displayError}</Alert>}
                            <TextField id="outlined-basic" name="name" label="Nome" variant="outlined" sx={{ minWidth: '100%' }} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <TextField id="outlined-basic" name="lastName" label="Sobrenome" variant="outlined" sx={{ minWidth: '100%' }} value={lastName} onChange={(e) => setLastName(e.target.value)} />
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
                        <PasswordField
                            id="outlined-basic"
                            name="confirmPassword"
                            label="Confirmar Senha"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : 'Cadastrar'}
                        </Button>
                        </Grid>
                    </FormControl>
                    <Typography variant="body2" sx={{p: 2}}>Já tem uma conta? <Link href="/login">Login</Link></Typography>
                </Card>
            </Grid>
    )
}

export default Register
