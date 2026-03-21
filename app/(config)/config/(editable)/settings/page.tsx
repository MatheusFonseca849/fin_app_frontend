'use client'

import { Box, Divider, MenuItem, Select, Switch, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { usePreferences } from "@/lib/contexts/PreferencesContext"
import { useEditablePage } from "@/lib/contexts/EditablePageContext"
import type { UserPreferences } from "@/lib/api"

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { setThemeModeOverride } = usePreferences();
    const { setIsDirty, setIsSaving, setFeedback, registerSave, registerCancel } = useEditablePage();

    // Local edit state for preferences
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState<UserPreferences['language']>('pt-BR');
    const [currency, setCurrency] = useState<UserPreferences['currency']>('BRL');
    const [allowForeignCurrency, setAllowForeignCurrency] = useState(false);

    // Clear theme override on unmount (e.g. navigating away without save/cancel)
    useEffect(() => {
        return () => setThemeModeOverride(null);
    }, [setThemeModeOverride]);

    // Sync local state when user data loads or changes
    useEffect(() => {
        if (user?.preferences) {
            setDarkMode(user.preferences.darkMode);
            setLanguage(user.preferences.language);
            setCurrency(user.preferences.currency);
            setAllowForeignCurrency(user.preferences.allowForeignCurrency);
        }
    }, [user]);

    // Dirty tracking
    const isDirty = useMemo(() => {
        if (!user?.preferences) return false;
        return (
            darkMode !== user.preferences.darkMode ||
            language !== user.preferences.language ||
            currency !== user.preferences.currency ||
            allowForeignCurrency !== user.preferences.allowForeignCurrency
        );
    }, [user, darkMode, language, currency, allowForeignCurrency]);

    // Sync isDirty to editable layout context
    useEffect(() => {
        setIsDirty(isDirty);
    }, [isDirty, setIsDirty]);

    // Register save/cancel handlers with the editable layout
    useEffect(() => {
        registerSave(async () => {
            if (!user || !isDirty) return;
            setIsSaving(true);
            setFeedback(null);
            try {
                await updateUser({
                    preferences: { darkMode, language, currency, allowForeignCurrency }
                });
                setThemeModeOverride(null);
                setFeedback({ message: 'Configurações salvas com sucesso.', severity: 'success' });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Erro ao salvar configurações.';
                setFeedback({ message: msg, severity: 'error' });
            } finally {
                setIsSaving(false);
            }
        });

        registerCancel(() => {
            if (!user?.preferences) return;
            setDarkMode(user.preferences.darkMode);
            setLanguage(user.preferences.language);
            setCurrency(user.preferences.currency);
            setAllowForeignCurrency(user.preferences.allowForeignCurrency);
            setThemeModeOverride(null);
            setFeedback(null);
        });
    }, [user, isDirty, darkMode, language, currency, allowForeignCurrency, updateUser, setThemeModeOverride, registerSave, registerCancel, setIsSaving, setFeedback]);

    if (!user) return null;

    return (
        <Box>
            <Typography variant="h4" fontWeight={600}>Configurações</Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Tema escuro</Typography>
                    <Switch
                        checked={darkMode}
                        onChange={(e) => {
                            setDarkMode(e.target.checked);
                            setThemeModeOverride(e.target.checked ? 'dark' : 'light');
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Idioma</Typography>
                    <Select
                        variant="outlined"
                        value={language}
                        sx={{ width: '100%', maxWidth: '200px' }}
                        onChange={(e) => setLanguage(e.target.value as UserPreferences['language'])}
                        disabled
                    >
                        <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                        <MenuItem value="en-US">English (United States)</MenuItem>
                        <MenuItem value="es-MX">Español (Mexico)</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Moeda</Typography>
                    <Select
                        variant="outlined"
                        value={currency}
                        sx={{ width: '100%', maxWidth: '200px' }}
                        onChange={(e) => setCurrency(e.target.value as UserPreferences['currency'])}
                        disabled
                    >
                        <MenuItem value="BRL">Real (Brasil)</MenuItem>
                        <MenuItem value="USD">Dólar (United States)</MenuItem>
                        <MenuItem value="MXN">Peso (Mexico)</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1">Permitir registros em moeda estrangeira</Typography>
                    <Switch
                        disabled
                        checked={allowForeignCurrency}
                        onChange={(e) => setAllowForeignCurrency(e.target.checked)}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default SettingsPage
