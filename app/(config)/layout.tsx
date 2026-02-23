import { Box, Drawer, List, ListItem, ListItemIcon, Toolbar } from "@mui/material"
import Link from "next/link"
import Header from "../components/Header"
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import RepeatIcon from '@mui/icons-material/Repeat';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const ConfigLayout = ({ children }: { children: React.ReactNode }) => {
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
                            <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                            <Link href="/config/transactions">Transações</Link>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CategoryIcon /></ListItemIcon>
                            <Link href="/config/categories">Categorias</Link>
                        </ListItem>
                        {/* <ListItem>
                            <ListItemIcon><RepeatIcon /></ListItemIcon>
                            <Link href="/config/recurring">Transações Recorrentes</Link>
                        </ListItem> */}
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