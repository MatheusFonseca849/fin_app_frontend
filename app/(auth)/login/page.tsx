'use client'

import { Button, Card, FormControl, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {

    const [isVisible, setIsVisible] = useState(false);

    return (
        
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card sx={{ p: 3, width: 400, backgroundColor: "#fdfdfd" ,margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" align="center" gutterBottom>Login</Typography>
                    <FormControl sx={{width: '100%'}}>
                        <Grid container spacing={2} direction="column" alignItems="center">
                        <TextField id="outlined-basic" name="email" label="Email" variant="outlined" sx={{ minWidth: '100%' }}/>
                        <TextField
                            type={isVisible ? "text" : "password"}
                            id="outlined-basic"
                            name="password"
                            label="Senha"
                            variant="outlined"
                            sx={{ minWidth: '100%' }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setIsVisible(!isVisible)} edge="end">
                                                {isVisible ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Typography variant="body2" sx={{pb: 2}}>Esqueceu sua senha? <Link href="/forgot-password">Redefinir Senha</Link></Typography>
                        <Button variant="contained">Login</Button>
                        </Grid>
                    </FormControl>
                    <Typography variant="body2" sx={{pt: 2}}>Não tem uma conta? <Link href="/register">Cadastre-se</Link></Typography>
                </Card>
            </Grid>
    )
}

export default Login