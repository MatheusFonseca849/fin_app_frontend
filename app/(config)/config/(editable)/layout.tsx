'use client';

import { useCallback } from 'react';
import { Alert, Box, Button, CircularProgress, Divider, Typography } from '@mui/material';
import ModalComponent from '@/app/components/ModalComponent';
import { EditablePageProvider, useEditablePage } from '@/lib/contexts/EditablePageContext';
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges';

const EditablePageContent = ({ children }: { children: React.ReactNode }) => {
    const { isDirty, isSaving, feedback, setFeedback, triggerSave, triggerCancel } = useEditablePage();
    const { showModal: showLeaveModal, confirmNavigation, cancelNavigation } = useUnsavedChanges(isDirty);

    const handleConfirmLeave = useCallback(() => {
        triggerCancel();
        confirmNavigation();
    }, [triggerCancel, confirmNavigation]);

    return (
        <Box>
            {feedback && (
                <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                    {feedback.message}
                </Alert>
            )}

            {children}

            <Divider sx={{ mt: 10, mb: 5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                    variant="contained"
                    onClick={triggerSave}
                    disabled={!isDirty || isSaving}
                >
                    {isSaving ? <CircularProgress size={24} /> : 'Salvar'}
                </Button>
                <Button
                    variant="outlined"
                    onClick={triggerCancel}
                    disabled={!isDirty}
                    sx={{ '&:hover': { backgroundColor: '#f44336', color: 'background.default' } }}
                >
                    Cancelar
                </Button>
            </Box>

            <ModalComponent
                open={showLeaveModal}
                handleClose={cancelNavigation}
                title="Alterações não salvas"
                layout={
                    <Typography sx={{ py: 2 }}>
                        Você tem alterações que ainda não foram salvas. Deseja sair da página mesmo assim?
                    </Typography>
                }
                action={handleConfirmLeave}
                cancelLabel="Ficar na Página"
                confirmLabel="Confirmar"
            />
        </Box>
    );
};

const EditableLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <EditablePageProvider>
            <EditablePageContent>
                {children}
            </EditablePageContent>
        </EditablePageProvider>
    );
};

export default EditableLayout;
