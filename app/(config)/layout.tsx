'use client';

import { Box, CircularProgress, Drawer, List, ListItem, ListItemIcon, Toolbar } from "@mui/material"
import Link from "next/link"
import Header from "../components/Header"
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';

const drawerWidth = 240;

const ConfigLayout = ({ children }: { children: React.ReactNode }) => {
    const { isLoading, isAuthenticated } = useRequireAuth({ redirectTo: '/login' });

    if (isLoading || !isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Header />
            <Box sx={{ display: 'flex' }}>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar />
                    <List>
                        <ListItem>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <Link href="/config/profile">Perfil</Link>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CategoryIcon /></ListItemIcon>
                            <Link href="/config/categories">Categorias</Link>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <Link href="/config/settings">Configurações</Link>
                        </ListItem>
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    {children}
                </Box>
            </Box>
        </div>
    )
}

export default ConfigLayout