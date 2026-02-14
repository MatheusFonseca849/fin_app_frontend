'use client'

import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import Link from "next/link";
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import CalendarIcon from '@mui/icons-material/CalendarViewMonth';
import StatsIcon from '@mui/icons-material/BarChart';

interface DrawerMenuProps {
    open: boolean;
    onClose: () => void;
}

const DrawerMenu = ({ open, onClose }: DrawerMenuProps) => {
    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 250 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/main">
                            <ListItemIcon><HomeIcon /></ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/history">
                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                            <ListItemText primary="Histórico" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/calendar">
                            <ListItemIcon><CalendarIcon /></ListItemIcon>
                            <ListItemText primary="Calendário" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/stats">
                            <ListItemIcon><StatsIcon /></ListItemIcon>
                            <ListItemText primary="Estatísticas" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    )
}

export default DrawerMenu