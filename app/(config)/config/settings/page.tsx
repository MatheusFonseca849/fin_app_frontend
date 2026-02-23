"use client"

import { Box, Divider, MenuItem, Select, Switch, Typography } from "@mui/material"

const SettingsPage = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={600}>Configurações</Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Mostrar saldo negativo</Typography>
                    <Switch />
                </Box> */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Tema escuro</Typography>
                    <Switch disabled/>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Idioma</Typography>
                    <Select 
                        variant="outlined"
                        disabled
                        value="pt-BR"
                        sx={{ width: '100%', maxWidth: '200px' }}
                        onChange={(e) => console.log(e.target.value)}
                    >
                        <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                        <MenuItem value="en-US">English (United States)</MenuItem>
                        <MenuItem value="es-MX">Español (Mexico)</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Moeda</Typography>
                    <Select 
                        variant="outlined"
                        disabled
                        value="BRL"
                        sx={{ width: '100%', maxWidth: '200px' }}
                        onChange={(e) => console.log(e.target.value)}
                    >
                        <MenuItem value="BRL">Real (Brasil)</MenuItem>
                        <MenuItem value="USD">Dólar (United States)</MenuItem>
                        <MenuItem value="MXN">Peso (Mexico)</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Permitir registros em moeda estrangeira</Typography>
                    <Switch disabled />
                </Box>
            </Box>
        </Box>
    )
}

export default SettingsPage