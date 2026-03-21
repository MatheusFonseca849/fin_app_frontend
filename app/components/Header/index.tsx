'use client'

import { AppBar, Avatar, Divider, IconButton, ListItemIcon, ListItemText, Toolbar, Typography, Menu, MenuItem, Box } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import DrawerMenu from "@/app/components/DrawerMenu";
import Link from "next/link";
import { useAuth } from '@/lib/contexts/AuthContext';

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const router = useRouter();
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    const handleLogout = async () => {
        setAnchorEl(null);
        await logout();
        router.replace('/login');
    };

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ mr: 2, color: isLight ? theme.palette.grey[50] : theme.palette.secondary.main }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Bem vindo(a)! Vamos cuidar das suas finanças?
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                            {user?.email}
                        </Typography>
                        <Avatar onClick={handleOpen} src={user?.avatarUrl || ''} alt={user?.firstName + " " + user?.lastName || ''}/>
                    </Box>
                    <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
                        <MenuItem component={Link} href="/config/profile">
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText>Perfil</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} href="/config/categories">
                            <ListItemIcon><CategoryIcon /></ListItemIcon>
                            <ListItemText>Categorias</ListItemText>
                        </MenuItem>
                        {/* <MenuItem component={Link} href="/config/recurring">
                            <ListItemIcon><RepeatIcon /></ListItemIcon>
                            <ListItemText>Transações Recorrentes</ListItemText>
                        </MenuItem> */}
                        <MenuItem component={Link} href="/config/settings">
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText>Configurações</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                            <ListItemText>Sair</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Toolbar />
            <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    )
}

export default Header