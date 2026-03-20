import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material"

interface IModalComponent {
    open: boolean
    handleClose: () => void
    title: string
    action: () => void
    layout: React.ReactNode
    cancelLabel?: string
    confirmLabel?: string
}

const modalBoxSx = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 440 },
    maxHeight: '85vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    display: 'flex',
    flexDirection: 'column',
}

const ModalComponent = ({open, handleClose, title, action, layout, cancelLabel = 'Cancelar', confirmLabel = 'Confirmar'}: IModalComponent) => {
    return(
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Box sx={modalBoxSx}>
                <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{title}</Typography>
                </Box>
                <Divider />
                <Box sx={{ px: 3, py: 1, overflowY: 'auto', flex: 1 }}>
                    {layout}
                </Box>
                <Divider />
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose}>{cancelLabel}</Button>
                    <Button variant="contained" onClick={action}>{confirmLabel}</Button>
                </Stack>
            </Box>
        </Modal>   
    )
}

export default ModalComponent