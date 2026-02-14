'use client'

import { Fab, Menu, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";

const FabMenu = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Fab color="primary" aria-label="add" onClick={handleOpen} sx={{ position: 'fixed', bottom: 16, right: 16, width: 80, height: 80 }}>
                <AddIcon fontSize="large" />
            </Fab>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <MenuItem onClick={handleClose}>Importar Extrato</MenuItem>
                <MenuItem onClick={handleClose}>Adicionar Transação</MenuItem>
                <MenuItem onClick={handleClose}>Adicionar Transação Recorrente</MenuItem>
                <MenuItem onClick={handleClose}>Adicionar Categoria</MenuItem>
            </Menu>
        </>
    )
}

export default FabMenu
