'use client'

import { Alert, Avatar, Badge, Box, Button, CircularProgress, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import EditableField from "@/app/components/EditableField"
import PasswordField from "@/app/components/PasswordField"
import ModalComponent from "@/app/components/ModalComponent"
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from "@/lib/contexts/AuthContext"
import { usersApi } from "@/lib/api"
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges"

const validateName = (value: string): string | null => {
    const trimmed = value.trim()
    if (trimmed.length < 2) return 'Deve ter no mínimo 2 caracteres'
    if (trimmed.length > 100) return 'Deve ter no máximo 100 caracteres'
    return null
}

const validateEmail = (value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) return 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Formato de email inválido'
    return null
}

const Profile = () => {
    const { user, updateUser, uploadAvatar, logout } = useAuth();
    const router = useRouter();

    // Local edit state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Sync local state when user data loads or changes
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
    }, [user]);

    // Dirty tracking
    const isDirty = useMemo(() => {
        if (!user) return false;
        return (
            firstName !== user.firstName ||
            lastName !== user.lastName ||
            email !== user.email
        );
    }, [user, firstName, lastName, email]);

    // Unsaved changes navigation guard
    const { showModal: showLeaveModal, confirmNavigation, cancelNavigation } = useUnsavedChanges(isDirty);

    // --- Handlers ---

    const handleSave = useCallback(async () => {
        if (!user || !isDirty) return;
        setIsSaving(true);
        setFeedback(null);
        try {
            const updates: Record<string, string> = {};
            if (firstName !== user.firstName) updates.firstName = firstName;
            if (lastName !== user.lastName) updates.lastName = lastName;
            if (email !== user.email) updates.email = email;

            await updateUser(updates);
            setFeedback({ message: 'Perfil atualizado com sucesso.', severity: 'success' });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao salvar alterações.';
            setFeedback({ message: msg, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [user, isDirty, firstName, lastName, email, updateUser]);

    const handleCancel = useCallback(() => {
        if (!user) return;
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setFeedback(null);
    }, [user]);

    const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setFeedback(null);
        try {
            await uploadAvatar(file);
            setFeedback({ message: 'Avatar atualizado com sucesso.', severity: 'success' });
        } catch {
            setFeedback({ message: 'Erro ao atualizar avatar.', severity: 'error' });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    }, [uploadAvatar]);

    const handleChangePassword = useCallback(async () => {
        setFeedback(null);
        if (!currentPassword) {
            setFeedback({ message: 'Informe sua senha atual.', severity: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setFeedback({ message: 'A nova senha deve ter no mínimo 6 caracteres.', severity: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setFeedback({ message: 'As senhas não coincidem.', severity: 'error' });
            return;
        }
        setIsChangingPassword(true);
        try {
            await updateUser({ currentPassword, password: newPassword });
            setFeedback({ message: 'Senha alterada com sucesso.', severity: 'success' });
            setPasswordModalOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Senha atual incorreta ou erro ao alterar senha.';
            setFeedback({ message: msg, severity: 'error' });
        } finally {
            setIsChangingPassword(false);
        }
    }, [currentPassword, newPassword, confirmPassword, updateUser]);

    const handleClosePasswordModal = useCallback(() => {
        setPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }, []);

    const handleDeleteAccount = useCallback(async () => {
        if (!user) return;
        setIsDeleting(true);
        try {
            await usersApi.delete(user._id);
            await logout();
            router.replace('/login');
        } catch {
            setFeedback({ message: 'Erro ao deletar conta.', severity: 'error' });
            setDeleteModalOpen(false);
            setIsDeleting(false);
        }
    }, [user, logout, router]);

    if (!user) return null;

    return (
        <Box>
            <Typography variant="h4" fontWeight={600}>Perfil</Typography>
            <Divider sx={{ my: 2 }} />

            {feedback && (
                <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
                    {feedback.message}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                        <IconButton
                            aria-label="edit profile picture"
                            component="label"
                            disabled={isUploading}
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
                            <input
                                accept="image/jpeg,image/png,image/webp"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                            {isUploading ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                    }
                >
                    <Avatar
                        alt={firstName + ' ' + lastName}
                        src={user.avatarUrl || undefined}
                        sx={{ width: 92, height: 92 }}
                    />
                </Badge>

                <EditableField label="Nome" value={firstName} onChange={setFirstName} validate={validateName} />
                <EditableField label="Sobrenome" value={lastName} onChange={setLastName} validate={validateName} />
                <EditableField label="Email" value={email} onChange={setEmail} validate={validateEmail} />
                <Button variant="contained" onClick={() => setPasswordModalOpen(true)}>Alterar Senha</Button>
            </Box>

            <Divider sx={{ mt: 10, mb: 5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                >
                    {isSaving ? <CircularProgress size={24} /> : 'Salvar'}
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={!isDirty}
                    sx={{ '&:hover': { backgroundColor: '#f44336', color: 'background.default' } }}
                >
                    Cancelar
                </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={() => setDeleteModalOpen(true)}
                    sx={{ mt: 5, backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}
                >
                    Deletar Conta
                </Button>
            </Box>

            <ModalComponent
                open={deleteModalOpen}
                handleClose={() => setDeleteModalOpen(false)}
                title="Deletar Conta"
                layout={
                    <Typography sx={{ py: 2 }}>
                        Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.
                    </Typography>
                }
                action={handleDeleteAccount}
                cancelLabel="Cancelar"
                confirmLabel={isDeleting ? 'Deletando...' : 'Deletar'}
            />

            <ModalComponent
                open={passwordModalOpen}
                handleClose={handleClosePasswordModal}
                title="Alterar Senha"
                layout={
                    <Stack spacing={2} sx={{ py: 2 }}>
                        <PasswordField
                            label="Senha Atual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            fullWidth
                        />
                        <PasswordField
                            label="Nova Senha"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                        />
                        <PasswordField
                            label="Confirmar Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            fullWidth
                        />
                    </Stack>
                }
                action={handleChangePassword}
                cancelLabel="Cancelar"
                confirmLabel={isChangingPassword ? 'Salvando...' : 'Salvar'}
            />

            <ModalComponent
                open={showLeaveModal}
                handleClose={cancelNavigation}
                title="Alterações não salvas"
                layout={
                    <Typography sx={{ py: 2 }}>
                        Você tem alterações que ainda não foram salvas. Deseja sair da página mesmo assim?
                    </Typography>
                }
                action={confirmNavigation}
                cancelLabel="Ficar na Página"
                confirmLabel="Confirmar"
            />
        </Box>
    )
}

export default Profile