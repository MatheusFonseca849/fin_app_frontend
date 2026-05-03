'use client'

import { Avatar, Box, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Popover, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/contexts/AuthContext';

interface UserMenuPopoverProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

const UserMenuPopover = ({ anchorEl, onClose }: UserMenuPopoverProps) => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        onClose();
        await logout();
        router.replace('/login');
    };

    const handleNavigate = () => {
        onClose();
    };

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                paper: {
                    sx: {
                        width: 320,
                        borderRadius: 3,
                        overflow: 'hidden',
                    },
                },
            }}
        >
            {/* Top: close button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
                <IconButton size="small" onClick={onClose} aria-label="fechar menu">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Avatar + greeting */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}>
                <Avatar
                    src={user?.avatarUrl || ''}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                    sx={{ width: 72, height: 72, fontSize: 32 }}
                />
                <Typography variant="h6">
                    Olá, {user?.firstName || ''}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {user?.email}
                </Typography>
            </Box>

            <Divider />

            {/* Navigation */}
            <List disablePadding>
                <ListItemButton component={Link} href="/config/profile" onClick={handleNavigate}>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Perfil" />
                </ListItemButton>
                <ListItemButton component={Link} href="/config/categories" onClick={handleNavigate}>
                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                    <ListItemText primary="Categorias" />
                </ListItemButton>
                <ListItemButton component={Link} href="/config/settings" onClick={handleNavigate}>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="Configurações" />
                </ListItemButton>
            </List>

            <Divider />

            {/* Logout */}
            <List disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                    <ListItemText primary="Sair" />
                </ListItemButton>
            </List>
        </Popover>
    );
};

export default UserMenuPopover;
