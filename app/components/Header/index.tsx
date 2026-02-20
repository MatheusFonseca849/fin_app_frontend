'use client'

import { AppBar, Avatar, Divider, IconButton, ListItemIcon, ListItemText, Toolbar, Typography, Menu, MenuItem, Box } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import RepeatIcon from '@mui/icons-material/Repeat';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from "react";
import DrawerMenu from "@/app/components/DrawerMenu";
import Link from "next/link";


const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: '#63885a', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Bem vindo(a)! Vamos cuidar das suas finanças?
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">
                            matheusfonseca@gmail.com
                        </Typography>
                        <Avatar onClick={handleOpen}/>
                    </Box>
                    <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
                        <MenuItem component={Link} href="/config/profile">
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText>Perfil</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} href="/config/transactions">
                            <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                            <ListItemText>Transações</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} href="/config/categories">
                            <ListItemIcon><CategoryIcon /></ListItemIcon>
                            <ListItemText>Categorias</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} href="/config/recurring">
                            <ListItemIcon><RepeatIcon /></ListItemIcon>
                            <ListItemText>Transações Recorrentes</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} href="/config/settings">
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText>Configurações</ListItemText>
                        </MenuItem>
                        <Divider />
                        <MenuItem sx={{ color: 'error.main' }}>
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