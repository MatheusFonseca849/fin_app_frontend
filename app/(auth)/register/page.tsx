
'use client'

import { Button, Card, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {

    const [isVisible, setIsVisible] = useState(false);

    return (
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card sx={{ p: 3, width: 500, backgroundColor: "#fdfdfd" ,margin: 'auto', borderRadius: 3, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" align="center" gutterBottom>Cadastre-se</Typography>
                    <form>
                        <Grid container spacing={2} direction="column" alignItems="center">
                            <TextField id="outlined-basic" name="name" label="Nome" variant="outlined" sx={{ minWidth: '100%' }}/>
                            <TextField id="outlined-basic" name="lastName" label="Sobrenome" variant="outlined" sx={{ minWidth: '100%' }}/>
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
                        <TextField
                            type={isVisible ? "text" : "password"}
                            id="outlined-basic"
                            name="confirmPassword"
                            label="Confirmar Senha"
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
                        
                        <Button variant="contained">Cadastrar</Button>
                        </Grid>
                    </form>
                    <Typography variant="body2" sx={{p: 2}}>Já tem uma conta? <Link href="/login">Login</Link></Typography>
                </Card>
            </Grid>
    )
}

export default Register