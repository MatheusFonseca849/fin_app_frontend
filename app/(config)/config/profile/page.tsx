'use client'

import { Avatar, Badge, Box, Button, Divider, IconButton, Typography } from "@mui/material"
import { useState } from "react"
import EditableField from "@/app/components/EditableField"
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const Profile = () => {

    const [firstName, setFirstName] = useState('Matheus')
    const [lastName, setLastName] = useState('Fonseca')
    const [email, setEmail] = useState('matheusfonseca@gmail.com')

    return (
        <Box>
            <Typography variant="h4" fontWeight={600}>Perfil</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <IconButton
                            aria-label="edit profile picture"
                            component="label" // Use 'label' to link with a hidden file input
                            htmlFor="profile-picture-upload"
                            sx={{
                                color: 'background.paper',
                                backgroundColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                width: 24,
                                height: 24,
                                padding: 0,
                            }}
                        >
                            <input accept="image/*" id="profile-picture-upload" type="file" style={{ display: 'none' }} />
                            <PhotoCameraIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    }
                >

                    <Avatar alt={firstName + ' ' + lastName} sx={{ width: 92, height: 92 }} />
                </Badge>

                <EditableField label="Nome" value={firstName} onChange={setFirstName} />
                <EditableField label="Sobrenome" value={lastName} onChange={setLastName} />
                <EditableField label="Email" value={email} onChange={setEmail} />
                <Button variant="contained">Alterar Senha</Button>
            </Box>
            <Button variant="contained" sx={{ position: 'fixed', bottom: 40, right: 30, mt: 2, backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}>Deletar Conta</Button>

            <Divider sx={{ mt: 10, mb: 5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="contained">Salvar</Button>
                <Button variant="outlined" sx={{ '&:hover': { backgroundColor: '#f44336', color: 'background.default' } }}>Cancelar</Button>
            </Box>
        </Box>
    )
}

export default Profile